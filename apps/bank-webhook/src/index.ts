import express, { Request, Response, NextFunction } from "express";
import db from "@repo/db/client";
const app = express();

app.use(express.json());

// Type definitions for webhook requests
interface DepositWebhookRequest {
    token: string;
    user_identifier: string;
    amount: string;
}

interface WithdrawalWebhookRequest {
    token: string;
    status: 'SUCCESS' | 'FAILED';
    failureReason?: string;
    bankReferenceId: string;
    amount: number;
}

// Middleware to verify webhook secret
const verifyWebhook = (req: Request, res: Response, next: NextFunction) => {
    const webhookSecret = req.headers['x-webhook-secret'];
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Deposit webhook
app.post("/hdfcWebhook", verifyWebhook, async (req, res) => {
    const paymentInformation = req.body as DepositWebhookRequest;

    try {
        // 1. Fetch the transaction by token
        const txn = await db.onRampTransaction.findUnique({
            where: { token: paymentInformation.token }
        });

        if (!txn) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // 2. Check if already successful
        if (txn.status === "Success") {
            return res.status(200).json({ message: "Already processed" });
        }

        // 3. Process the transaction
        await db.$transaction([//Both updates run in a single atomic transaction—if either fails or the server crashes, neither change is saved.it gets rolled back!
            db.balance.updateMany({
                where: {
                    userId: Number(paymentInformation.user_identifier)
                },
                data: {
                    amount: {
                        increment: Number(paymentInformation.amount)
                    }
                }
            }),
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success",
                    endTime: new Date()
                }
            })
        ]);

        res.json({
            message: "Captured"
        });
    } catch (error) {//error handling 
        console.error("Deposit webhook error:", error);
        res.status(500).json({
            message: "Error while processing deposit webhook",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Withdrawal webhook
app.post("/hdfcWithdrawalWebhook", verifyWebhook, async (req, res) => {
    const withdrawalInfo = req.body as WithdrawalWebhookRequest;

    try {// all txns are atomic,if any of them fails, all changes are rolled back.
        await db.$transaction(async (tx) => {
            // Find withdrawal by token with all required fields
            const withdrawal = await tx.withdrawal.findFirst({
                where: { token: withdrawalInfo.token },
                select: { 
                    id: true, 
                    userId: true, 
                    amount: true,
                    status: true
                }
            });

            if (!withdrawal) {
                throw new Error('Withdrawal not found');
            }

            // Check if withdrawal is already processed
            if (withdrawal.status !== 'PENDING') {
                throw new Error(`Withdrawal already ${withdrawal.status.toLowerCase()}`);
            }

            // Verify amount matches
            if (withdrawal.amount !== withdrawalInfo.amount) {
                throw new Error(`Amount mismatch. Expected: ${withdrawal.amount}, Received: ${withdrawalInfo.amount}`);
            }

            // Update withdrawal status
            await tx.withdrawal.update({
                where: { id: withdrawal.id },
                data: {
                    status: withdrawalInfo.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
                    updatedAt: new Date(),
                    ...(withdrawalInfo.bankReferenceId && { bankReferenceId: withdrawalInfo.bankReferenceId })
                }
            });

            // If failed, return locked amount to available balance
            if (withdrawalInfo.status === 'FAILED') {
                await tx.balance.updateMany({
                    where: { userId: withdrawal.userId },
                    data: {
                        amount: { increment: withdrawal.amount },
                        locked: { decrement: withdrawal.amount }
                    }
                });
            } else {
                // On success, just remove the locked amount
                await tx.balance.updateMany({
                    where: { userId: withdrawal.userId },
                    data: {
                        locked: { decrement: withdrawal.amount }
                    }
                });
            }
        });

        res.json({ success: true });
    } catch (error) {//error handling
        console.error("Withdrawal webhook error:", error);
        res.status(500).json({
            success: false,
            message: "Error while processing withdrawal webhook",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Webhook service listening on port ${PORT}`);
});
import express from "express";
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
const verifyWebhook = (req: any, res: any, next: any) => {
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
        await db.$transaction([
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
                }
            })
        ]);

        res.json({
            message: "Captured"
        });
    } catch (error) {
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

    try {
        await db.$transaction(async (tx) => {
            // 1. Find withdrawal by token with all required fields
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

            // 1.1 Check if withdrawal is already processed
            if (withdrawal.status !== 'PENDING') {
                throw new Error(`Withdrawal already ${withdrawal.status.toLowerCase()}`);
            }

            // 1.2 Verify amount matches
            if (withdrawal.amount !== withdrawalInfo.amount) {
                throw new Error(`Amount mismatch. Expected: ${withdrawal.amount}, Received: ${withdrawalInfo.amount}`);
            }

            // 2. Update withdrawal status
            await tx.withdrawal.update({
                where: { id: withdrawal.id },
                data: {
                    status: withdrawalInfo.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
                    updatedAt: new Date(),
                    ...(withdrawalInfo.bankReferenceId && { bankReferenceId: withdrawalInfo.bankReferenceId })
                }
            });

            // 2. If failed, return locked amount to available balance
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
    } catch (error) {
        console.error("Withdrawal webhook error:", error);
        res.status(500).json({
            success: false,
            message: "Error while processing withdrawal webhook",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Webhook service listening on port ${PORT}`);
});
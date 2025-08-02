'use server';

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { v4 as uuidv4 } from 'uuid';

interface WithdrawRequest {
    amount: number;
    bank: string;
    accountNumber: string;
}

export async function createWithdrawal(request: WithdrawRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
        return { success: false, message: "User not authenticated" };
    }

    // Generate a unique token for this withdrawal
    const token = `wth_${uuidv4()}`;

    // Convert amount from rupees to paisa
    const amountInPaisa = Math.round(request.amount * 100);

    // Start a transaction
    return await prisma.$transaction(async (tx: any) => {
        // 1. Verify user has sufficient balance
        const balance = await tx.balance.findUnique({
            where: { userId: Number(userId) }
        });

        if (!balance || balance.amount < amountInPaisa) {
            return { 
                success: false, 
                message: `Insufficient balance. Available: ₹${(balance?.amount || 0) / 100}` 
            };
        }

        // 2. Create withdrawal record with token
        const withdrawal = await tx.withdrawal.create({
            data: {
                userId: Number(userId),
                amount: amountInPaisa,
                bank: request.bank,
                accountNumber: request.accountNumber,
                status: 'PENDING',
                token: token  // Store the token
            }
        });

        // 3. Lock the amount
        await tx.balance.update({
            where: { userId: Number(userId) },
            data: {
                amount: { decrement: amountInPaisa },
                locked: { increment: amountInPaisa }
            }
        });

        return { 
            success: true, 
            message: "Withdrawal request created successfully",
            withdrawalId: withdrawal.id,
            token: token
        };
    });
}
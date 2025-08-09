"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client"
import { z } from "zod";

export async function createOnRampTransaction(amount: number, provider: string) {

    const session = await getServerSession(authOptions);

    // Define validation schema
    const addMoneySchema = z.object({
        amount: z.number()
            .min(500, "Minimum amount is ₹500")
            .positive("Amount must be positive"),
        provider: z.string()
            .min(1, "Please select a bank")
    });

    // Validate input
    const validationResult = addMoneySchema.safeParse({ amount, provider });
    if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        if (!firstError) {
            throw new Error("Validation failed");
        }
        throw new Error(firstError.message);
    }

    if (!session?.user || !session.user?.id) {//check if the user is logged in and session is active or not ..... else return from here 
        throw new Error("Unauthenticated user");
    }

    const MAX_BALANCE = 10000000; // 1 lakh in paisa

    const userBalance = await prisma.balance.findUnique({
        where: { userId: Number(session.user.id) }
    });

    if (userBalance && userBalance.amount >= MAX_BALANCE) {
        throw new Error("Wallet balance is already at maximum amount(₹1,00,000).");
    }

    if (userBalance && (userBalance.amount + Number(amount) * 100 > MAX_BALANCE)) {
        throw new Error("Deposit would exceed wallet limit of ₹1,00,000");
    }

    const token = (Math.random() * 1000).toString();
    await prisma.onRampTransaction.create({
        data: {
            provider,
            status: "Processing",
            startTime: new Date(),
            token: token,
            userId: Number(session?.user?.id),//convert it to a number for type safety coz it might be string
            amount: Number(amount) * 100 //convert it to a number if not again due to type safety coz it might be string 
        }
    });

    return {
        message: "Done"
    }
}
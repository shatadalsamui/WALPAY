"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { z } from "zod";

//Input Validation Schema
const transferSchema = z.object({
    to: z.string()
        .length(10, "Phone number must be 10 digits only !")
        .regex(/^\d+$/, "Phone number must contain only digits"),
    amount: z.number()
        .positive("Amount must be positive")
        .min(1000, "Minimum transfer is ₹10")
        .max(1000000, "maximum transfer is ₹10000")
})

export async function p2pTransfer(to: string, amount: number) {

    //Input validation 
    const validated = transferSchema.safeParse({ to, amount });
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message || "Invalid input");
    }

    //Get Server Session of user
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        throw new Error("Unauthorized");
    }

    // Block self transfer 
    const fromUser = await prisma.user.findUnique({
        where: { id: Number(from) }
    });
    if (fromUser?.number === to) {
        throw new Error("Cannot transfer to yourself");
    }

    //Checking recipent exists or not
    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });
    if (!toUser) {
        throw new Error("Recipient not found");
    }

    //Locking Sender's Balance to prevent concurrent transfers
    //locks after the first txn is initiated and only unlocks when the txn is completed
    await prisma.$transaction(async (tx) => {

        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;

        const fromBalance = await tx.balance.findUnique({
            where: { userId: Number(from) },
        });
        if (!fromBalance || fromBalance.amount < amount) {
            throw new Error('Insufficient funds');
        }

        await tx.balance.update({
            where: { userId: Number(from) },
            data: { amount: { decrement: amount } },
        });

        await tx.balance.update({
            where: { userId: toUser.id },
            data: { amount: { increment: amount } },
        });

        await tx.p2pTransfer.create({
            data: {
                fromUserId: Number(from),
                toUserId: toUser.id,
                amount,
                timestamp: new Date()
            }
        });
    });
}
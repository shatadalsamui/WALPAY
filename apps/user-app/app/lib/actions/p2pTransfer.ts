"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client"


export async function p2pTransfer(to: string, amount: number) {
    // extract the user from the session and do the necessary checks
    const session = await getServerSession(authOptions);

    const from = session?.user?.id;

    if (!from) {
        return {
            message: "Error while Sending"
        }
    }

    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User not found"
        }
    }
    //prisma specific method of updating database which is atomic database transaction - either all txns happen or none do 
    //same reason tx is used - tx is special transaction-scoped prisma client all tx txns are a part of the atomic txns
    await prisma.$transaction(async (tx) => {
        const fromBalance = await tx.balance.findUnique({
            where: {
                userId: Number(from)
            }
        });
        if (!fromBalance || fromBalance.amount < amount) {
            throw new Error("Insuffiecient Funds");
        }

        await tx.balance.update({
            where: { userId: Number(from) },
            data: { amount: { decrement: amount } }
        });

        await tx.balance.update({
            where: { userId: toUser.id },
            data: { amount: { increment: amount } },
        });

    });
}
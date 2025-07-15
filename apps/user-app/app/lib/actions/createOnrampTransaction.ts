  "use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client"

export async function createOnRampTransaction(amount: number, provider: string) {

    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user?.id) {//check if the user is logged in and session is active or not ..... else return from here 
        return {
            message: "Unathenticated user"
        }
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
        message : "Done"
    }
}
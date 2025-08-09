import { NextResponse } from "next/server"
import db from "@repo/db/client";
import bcrypt from "bcrypt";

export const GET = async () => {
    try {
        await db.user.upsert({ // upsert measn a combination of update and insert ...first tries to update if no record exists then it creates one and is atomic
            where: { email: "asd" },
            update: {},
            create: {
                email: "asd",
                name: "adsads",
                number: "1234567890",
                password: await bcrypt.hash("password", 10)
            }
        })
        return NextResponse.json({
            message: "User processed successfully"
        })
    } catch (e) {
        return NextResponse.json({
            message: "Error processing user",
            error: e instanceof Error ? e.message : "Unknown error"
        }, { status: 500 })
    }
}
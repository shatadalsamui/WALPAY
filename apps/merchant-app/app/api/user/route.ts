  import { NextResponse } from "next/server"
import db from "@repo/db/client";
import bcrypt from "bcrypt";

export const GET = async () => {
    await db.user.create({
        data: {
            email: "asd",
            name: "adsads",
            number: "1234567890",
            password: await bcrypt.hash("password", 10)
        }
    })
    return NextResponse.json({
        message: "hi there"
    })
}
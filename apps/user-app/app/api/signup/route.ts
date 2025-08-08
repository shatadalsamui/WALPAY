import { NextRequest, NextResponse } from 'next/server';
import db from "@repo/db/client";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { z } from "zod";

// Schema for the initial sign-up request.
const signupSchema = z.object({
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name must be under 50 characters" }),
    phone: z.string()
        .min(10, { message: "Phone number must be 10 digits" })
        .max(10, { message: "Phone number must be 10 digits " })
        .regex(/^\d+$/, { message: "Phone number must contain only numbers" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .max(20, { message: "Password must be at most 20 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
});

/**
 * Sends an OTP to the user's email address.
 */
async function sendOtp(email: string, otp: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email credentials are not set in environment variables.");
        throw new Error("Server configuration error: cannot send email.");
    }
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Walpay",
        text: `Your One-Time Password (OTP) for Walpay is: ${otp}. It is valid for 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parseResult = signupSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues }, { status: 400 });
        }

        const { name, email, phone, password } = parseResult.data;

        const existingUser = await db.user.findFirst({ where: { OR: [{ number: phone }, { email }] } });
        if (existingUser) {
            return NextResponse.json({ error: "User with this phone or email already exists." }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(newOtp, 10); // Hash the OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Save temporary user details and OTP to the database.
        await db.otp.upsert({
            where: { email },
            update: { otp: hashedOtp, expiresAt, name, phone, password: hashedPassword },
            create: { email, otp: hashedOtp, expiresAt, name, phone, password: hashedPassword },
        });

        await sendOtp(email, newOtp);

        return NextResponse.json({ message: "OTP sent successfully. Please verify to complete signup." }, { status: 200 });

    } catch (error) {
        console.error("Signup API error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

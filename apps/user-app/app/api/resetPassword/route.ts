import { NextRequest, NextResponse } from "next/server";
import db from "@repo/db/client";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { z } from "zod";

// Schema for email validation
const emailSchema = z.object({
    email: z.string().email({ message: "Invalid email address!" }),
});

// Schema for OTP validation
const otpSchema = z.object({
    email: z.string().email({ message: "Invalid email address!" }),
    otp: z.string().length(6, { message: "Invalid OTP!" }),
});

// Schema for password validation
const passwordSchema = z.object({
    email: z.string().email({ message: "Invalid email address!" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
});

//function for sending otp using node mailer 
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
        subject: "WALPAY: Your OTP for Password Reset",
        text: `Walpay\nYour One-Time Password (OTP) for resetting your password is: ${otp}.\nIt is valid for 10 minutes.`,
    };
    await transporter.sendMail(mailOptions);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Handle sending OTP
        if (body.action === "sendOtp") {
            const parseResult = emailSchema.safeParse(body);

            if (!parseResult.success) {
                console.error("Validation Error:", parseResult.error.issues);
                return NextResponse.json({ error: parseResult.error.issues }, { status: 400 });
            }

            const { email } = parseResult.data;

            const user = await db.user.findUnique({ where: { email } });
            if (!user) {
                return NextResponse.json({ error: "User with this email does not exist." }, { status: 404 });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedOtp = await bcrypt.hash(otp, 10);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

            await db.passwordResetOtp.upsert({
                where: { email },
                update: { otp: hashedOtp, expiresAt },
                create: { email, otp: hashedOtp, expiresAt },
            });

            await sendOtp(email, otp);

            return NextResponse.json({ message: "OTP sent successfully. Please verify to reset your password." }, { status: 200 });
        }

        // Handle verifying OTP
        if (body.action === "verifyOtp") {
            const parseResult = otpSchema.safeParse(body);

            if (!parseResult.success) {
                console.error("Validation Error:", parseResult.error.issues);
                return NextResponse.json({ error: parseResult.error.issues }, { status: 400 });
            }

            const { email, otp } = parseResult.data;

            const record = await db.passwordResetOtp.findUnique({ where: { email } });
            if (!record || new Date() > record.expiresAt) {
                return NextResponse.json({ error: "OTP has expired or is invalid." }, { status: 400 });
            }

            const isValidOtp = await bcrypt.compare(otp, record.otp);
            if (!isValidOtp) {
                return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
            }

            // Mark OTP as verified instead of deleting
            await db.passwordResetOtp.update({ where: { email }, data: { otpVerified: true } });

            return NextResponse.json({ message: "OTP verified successfully." }, { status: 200 });
        }

        // Handle updating password
        if (body.action === "updatePassword") {
            const parseResult = passwordSchema.safeParse(body);

            if (!parseResult.success) {
                console.error("Validation Error:", parseResult.error.issues);
                return NextResponse.json({ error: parseResult.error.issues }, { status: 400 });
            }

            const { email, password } = parseResult.data;

            // Fetch the user's current hashed password
            const user = await db.user.findUnique({ where: { email } });
            if (!user) {
                return NextResponse.json({ error: "User not found." }, { status: 404 });
            }

            // Check if OTP was verified
            const otpRecord = await db.passwordResetOtp.findUnique({ where: { email } });
            if (!otpRecord || !otpRecord.otpVerified) {
                return NextResponse.json({ error: "OTP verification required before resetting password." }, { status: 400 });
            }

            // Check if the new password is the same as the old password
            const isSamePassword = await bcrypt.compare(password, user.password);
            if (isSamePassword) {
                return NextResponse.json({ error: "New password cannot be the same as the old password." }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await db.user.update({
                where: { email },
                data: { password: hashedPassword },
            });

            // Delete OTP after successful password update (cleanup)
            await db.passwordResetOtp.deleteMany({ where: { email } });

            return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    } catch (error) {
        console.error("Reset Password API error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
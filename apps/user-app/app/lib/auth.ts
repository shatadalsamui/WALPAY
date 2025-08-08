import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

// --- ZOD VALIDATION SCHEMAS ---

// Base schema for sign-in, also extended for sign-up.
const baseSchema = z.object({
    phone: z.string()
        .min(10, { message: "Phone number must be 10 digits" })
        .max(10, { message: "Phone number must be 10 digits " })
        .regex(/^\d+$/, { message: "Phone number must contain only numbers" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .max(20, { message: "Password must be at most 20 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
});

// Schema for the initial sign-up request.
const signupSchema = baseSchema.extend({
    name: z.string()
        .min(2, { message: "Name must be atleast 2 characters" })
        .max(50, { message: "Name must be under 50 characters" }),
    email: z.string().email({ message: "Invalid email address" })
});

// Schema for the final OTP verification step. OTP is explicitly required.
const otpVerificationSchema = signupSchema.extend({
    otp: z.string().length(6, "OTP must be 6 digits"),
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

// --- NEXTAUTH CONFIGURATION ---
export const authOptions = {
    pages: {
        signIn: '/signin',
        signUp: '/signup',
        error: '/error',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                name: { label: "Full Name", type: "text", placeholder: "Enter your Full Name" },
                phone: { label: "Phone number", type: "text", placeholder: "Enter your phone number", required: true },
                email: { label: "Email", type: "email", placeholder: "Enter your Email" },
                password: { label: "Password", type: "password", placeholder: "...........", required: true },
                otp: { label: "OTP", type: "text", placeholder: "Enter your OTP" }
            },
            async authorize(credentials: unknown) { // Using unknown for type safety
                // FLOW 1: OTP VERIFICATION (Final step of signing up)
                const otpParseResult = otpVerificationSchema.safeParse(credentials);
                if (otpParseResult.success) {
                    const { name, email, phone, password, otp } = otpParseResult.data;
                    
                    const verificationData = await db.otp.findUnique({ where: { email } });
                    if (!verificationData || new Date() > verificationData.expiresAt) {
                        throw new Error("OTP is invalid or has expired. Please sign up again.");
                    }
                    const isOtpValid = await bcrypt.compare(otp, verificationData.otp);
                    if (!isOtpValid) {
                        throw new Error("Invalid OTP entered.");
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await db.user.create({
                        data: { name, number: phone, password: hashedPassword, email, Balance: { create: { amount: 0, locked: 0 } } }
                    });
                    await db.otp.delete({ where: { email } }); // Clean up used OTP

                    return { id: newUser.id.toString(), name: newUser.name, email: newUser.email, number: newUser.number };
                }

                // FLOW 3: STANDARD SIGN-IN
                const signInParseResult = baseSchema.safeParse(credentials);
                if (signInParseResult.success) {
                    const { phone, password } = signInParseResult.data;
                    const user = await db.user.findUnique({ where: { number: phone } });

                    if (user && (await bcrypt.compare(password, user.password))) {
                        return { id: user.id.toString(), name: user.name, email: user.email, number: user.number };
                    }
                    throw new Error("Invalid phone number or password.");
                }
                
                // If no schema matched, the input was invalid.
                throw new Error("Invalid input provided. Please check your details.");
            },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User & { number?: string } }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.number = user.number;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT & { number?: string } }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                if (token.number) {
                    (session.user as any).number = token.number;
                }
            }
            return session;
        }
    }
};
import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

// --- ZOD VALIDATION SCHEMAS ---

// Base schema for sign-in
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

// Extended- Schema for the sign-up
const signupSchema = baseSchema.extend({
    name: z.string()
        .min(2, { message: "Name must be atleast 2 characters" })
        .max(50, { message: "Name must be under 50 characters" }),
    email: z.string().email({ message: "Invalid email address" })
});

// Schema for the final OTP verification step
const otpVerificationSchema = signupSchema.extend({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

// --- NEXTAUTH CONFIGURATION ---
export const authOptions = {
    pages: {//custom pages for signup signin
        signIn: '/signin',
        signUp: '/signup',
        error: '/error',
    },
    session: {
        strategy: "jwt" as const,
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
                // OTP VERIFICATION (Final step of signing up)
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

                    // Return the new user's info to NextAuth to create a session after successful OTP verification and account creation
                    return { id: newUser.id.toString(), name: newUser.name, email: newUser.email, number: newUser.number };
                }

                // STANDARD SIGN-IN
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
    secret: process.env.JWT_SECRET,
    callbacks: {
        //The jwt callback customizes what data is stored in the JWT token in the cookie
        async jwt({ token, user }: { token: JWT; user?: User & { number?: string } }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.number = user.number;
            }
            return token;
        },
        // customizes what data from the JWT token is exposed to the client-side session object for useSession()
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
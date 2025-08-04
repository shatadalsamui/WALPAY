import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";
import { z } from "zod";

const baseSchema = z.object({//base input validation for signin
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

const signupSchema = baseSchema.extend({//extended input validation for signup
    name: z.string()
        .min(2, { message: "Name must be atleast 2 characters" })
        .max(50, { message: "Name must be under 50 characters" }),
    email: z.string().email({ message: "Invalid email address" })
});

export const authOptions = {
    pages: {
        signIn: '/signin',
        signUp: '/signup',
        error: '/error'
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                name: { label: "Full Name", type: "text", placeholder: "Enter your Full Name" },
                phone: { label: "Phone number", type: "text", placeholder: "Enter your phone number", required: true },
                email: { label: "Email", type: "email", placeholder: "Enter your Email" },
                password: { label: "Password", type: "password", placeholder: "...........", required: true }
            },

            async authorize(credentials: unknown) {
                if (!credentials || typeof credentials !== 'object') {
                    return null;
                }

                const creds = credentials as Record<string, unknown>;

                // If name and email exist, it's a signup attempt
                if ('name' in creds && 'email' in creds) {
                    const signupResult = signupSchema.safeParse(creds);
                    if (!signupResult.success) {
                        return null; // Validation failed
                    }
                    const { phone, password, name, email } = signupResult.data;
                    const existingUser = await db.user.findUnique({ where: { number: phone } });

                    if (existingUser) {
                        return null; // User already exists
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await db.user.create({
                        data: {
                            name,
                            number: phone,
                            password: hashedPassword,
                            email,
                            Balance: { create: { amount: 0, locked: 0 } }
                        }
                    });
                    return { id: newUser.id.toString(), name: newUser.name, number: newUser.number };
                }

                // Otherwise, it's a signin attempt
                const signinResult = baseSchema.safeParse(creds);
                if (!signinResult.success) {
                    return null; // Validation failed
                }

                const { phone, password } = signinResult.data;
                const user = await db.user.findUnique({ where: { number: phone } });

                if (user && await bcrypt.compare(password, user.password)) {
                    return { id: user.id.toString(), name: user.name, number: user.number };
                }

                return null;
            },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        async session({ token, session }: any) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
}

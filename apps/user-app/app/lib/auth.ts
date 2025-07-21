import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";
import { z } from "zod";

const credentialsSchema = z.object({//Input validation
    name: z.string()
        .min(2, { message: "Name must be atleast 2 characters" })
        .max(50, { message: "Name must be less than 50 characters" }),
    phone: z.string()
        .min(10, { message: "Phone number must be 10 digits" })
        .max(10, { message: "Phone number must be 10 digits" })
        .regex(/^\d+$/, { message: "Phone number must contain only numbers" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
})

export const authOptions = {
    // pages: {
    //     signIn: '/signin',
    //     signUp: '/signup',
    //     error: '/error'
    // },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                name: { label: "Full Name", type: "text", placeholder: "Enter your Full Name" },
                phone: { label: "Phone number", type: "text", placeholder: "Enter your phone number", required: true },
                password: { label: "Password", type: "password", placeholder: "...........", required: true }
            },
            // TODO: User credentials type from next-aut
            async authorize(credentials: unknown) {

                const validatedCredentials = credentialsSchema.safeParse(credentials);
                if (!validatedCredentials.success) {
                    return null;
                }
                const { name, phone, password } = validatedCredentials.data;
                const hashedPassword = await bcrypt.hash(password, 10);
                const existingUser = await db.user.findFirst({
                    where: {
                        number: phone
                    }
                });

                if (existingUser) {
                    const passwordValidation = await bcrypt.compare(password, existingUser.password);
                    if (passwordValidation) {
                        return {
                            id: existingUser.id.toString(),
                            name: existingUser.name,
                            number: existingUser.number
                        }
                    }
                    return null;
                }

                try {
                    const user = await db.user.create({
                        data: {
                            name: name,
                            number: phone,
                            password: hashedPassword,
                            Balance: {
                                create: {
                                    amount: 0,
                                    locked: 0
                                }
                            }
                        }
                    });

                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.number
                    }
                } catch (e) {
                    console.error(e);
                }

                return null
            },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        // TODO: can u fix the type here? Using any is bad
        async session({ token, session }: any) {
            session.user.id = token.sub

            return session
        }
    }
}

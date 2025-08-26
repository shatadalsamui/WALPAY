"use client"
import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Form } from "../../../components/OtpForm";
import { Center } from "@repo/ui/center";
import { z } from "zod";

//input validation schema for otp
const otpSchema = z.string()
    .length(6, { message: "OTP must be exactly 6 digits." })
    .regex(/^\d+$/, { message: "OTP must contain only numbers and no spaces." });

function OTPSignInPage() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const [signupData, setSignupData] = useState<{ name: string; phone: string; email: string; password: string } | null>(null);

    //retrieves user's signup data from session storage of the browser
    useEffect(() => {
        const storedData = sessionStorage.getItem('signupData');
        if (storedData) {
            setSignupData(JSON.parse(storedData));
        } else {
            setError("Missing user data. Please try signing up again.");
        }
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        const validationResult = otpSchema.safeParse(otp);//validates the otp using the schema 

        //error handling
        if (!validationResult.success) {
            const firstError = validationResult.error.issues?.[0]?.message || "Invalid OTP format.";
            setError(firstError);
            setLoading(false);
            return;
        }
        if (!signupData) {
            setError("Missing user data. Please try signing up again.");
            setLoading(false);
            return;
        }

        const { name, phone, email, password } = signupData;

        // Calls NextAuth inbuilt signIn to trigger OTP verification 
        // and user creation via the credentials provider in auth.ts
        try {
            const result = await signIn("credentials", {
                name,
                phone,
                email,
                password,
                otp,
                redirect: false,
            });

            if (result?.ok) {
                sessionStorage.removeItem('signupData'); // Clear signup data on successful login
                router.push("/dashboard");
            } else {
                setError(result?.error || "Invalid OTP. Please try again.");
            }
        } catch (e) {
            console.error(e);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Center>
            <div className="w-full max-w-md py-40">
                <Form
                    title="Verify OTP"
                    buttonText="Verify"
                    onSubmit={handleSubmit}
                    inputs={[
                        {
                            label: "OTP",
                            type: "text",
                            placeholder: "Enter your OTP",
                            value: otp,
                            onChange: (e) => setOtp(e.target.value),
                        },
                    ]}
                    error={error}
                    loading={loading}
                />
            </div>
        </Center>
    );
}


export default function OTPPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OTPSignInPage />
        </Suspense>
    )
}
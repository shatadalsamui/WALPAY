"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";
import { z } from "zod";

//input validation schema for email 
const emailSchema = z.string().email({ message: "Please enter a valid email address." });

export default function VerifyEmailPage() {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        // zod validation for email
        const result = emailSchema.safeParse(email);

        //error handling
        if (!result.success) {
            const firstIssue = result.error.issues && result.error.issues[0];
            setError(firstIssue ? firstIssue.message : "Invalid email");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch("/api/resetPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "sendOtp", email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to send OTP. Please try again.");
            } else {
                setSuccess("OTP sent successfully! Please check your email.");
                // Store email for later steps
                localStorage.setItem("resetEmail", email);
                setTimeout(() => router.push("/resetPassword/verifyOtp"), 2000);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-full max-w-lg mt-[-250px]">
                <Card title="Reset Password">
                    {(error || success) && (
                        <div className="pt-3 pb-3">
                            {error && <div className="p-4 bg-red-100 text-red-700 rounded max-w-md mx-auto text-center">{error}</div>}
                            {success && <div className="p-4 bg-green-100 text-green-700 rounded max-w-md mx-auto text-center">{success}</div>}
                        </div>
                    )}
                    <div className="space-y-10">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                            className="space-y-6"
                        >
                            <div className="space-y-6">
                                <TextInput
                                    label="Enter your email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(value: string) => setEmail(value)}
                                />
                                <Button onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Sending..." : "Send OTP"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
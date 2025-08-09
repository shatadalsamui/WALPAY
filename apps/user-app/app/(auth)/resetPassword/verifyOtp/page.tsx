"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";

import { z } from "zod";
const otpSchema = z.string().length(6, "OTP must be exactly 6 digits !");

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        // Zod validation for OTP
        const result = otpSchema.safeParse(otp);
        if (!result.success) {
            const firstIssue = result.error.issues && result.error.issues[0];
            setError(firstIssue ? firstIssue.message : "Invalid OTP");
            setLoading(false);
            return;
        }

        // Get email from localStorage
        const email = localStorage.getItem("resetEmail") || "";

        try {
            const response = await fetch("/api/resetPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "verifyOtp", email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                let errMsg = data.error;
                if (typeof errMsg === "string" && errMsg.startsWith('"') && errMsg.endsWith('"')) {
                    errMsg = errMsg.slice(1, -1);
                }
                setError(errMsg || "Failed to verify OTP. Please try again.");
            } else {
                setSuccess("OTP verified successfully! Redirecting...");
                setTimeout(() => router.push("/resetPassword/newPassword"), 2000);
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
                <Card title="Verify OTP">
                    {(error || success) && (
                        <div className="pt-3 pb-3">
                            {error && <div className="p-4 bg-red-100 text-red-700 rounded max-w-md mx-auto text-center">{error}</div>}
                            {success && <div className="p-4 bg-green-100 text-green-700 rounded max-w-md mx-auto text-center">{success}</div>}
                        </div>
                    )}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        className="space-y-6 pt-0"
                    >
                        <TextInput
                            label="Enter OTP"
                            type="password"
                            placeholder="Enter the OTP sent to your email"
                            value={otp}
                            onChange={(value: string) => setOtp(value)}
                            showEye={true}
                        />
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
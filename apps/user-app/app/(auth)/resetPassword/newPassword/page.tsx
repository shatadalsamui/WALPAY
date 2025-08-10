"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";
import { z } from "zod";

const passwordSchema = z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be at most 20 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" });

export default function NewPasswordPage() {
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        // Zod validation for password
        const result = passwordSchema.safeParse(password);
        if (!result.success) {
            const firstIssue = result.error.issues && result.error.issues[0];
            setError(firstIssue ? firstIssue.message : "Invalid password");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
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
                body: JSON.stringify({ action: "updatePassword", email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to update password. Please try again.");
                        } else {
                                setSuccess("Password updated successfully! Redirecting...");
                                setTimeout(() => {
                                    signOut({ callbackUrl: "/signin" });
                                }, 2000);
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
                <Card title="Set New Password">
                    {(error || success) && (
                        <div className="pt-3 pb-3">
                            {error && <div className="p-4 bg-red-100 text-red-700 rounded max-w-md mx-auto text-center">{error}</div>}
                            {success && <div className="p-4 bg-green-100 text-green-700 rounded max-w-md mx-auto text-center">{success}</div>}
                        </div>
                    )}
                    <div className="space-y-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                            className="space-y-4"
                        >
                            <TextInput
                                label="New Password"
                                type="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(value: string) => setPassword(value)}
                                showEye={true}
                            />
                            <TextInput
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(value: string) => setConfirmPassword(value)}
                                showEye={true}
                            />
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}
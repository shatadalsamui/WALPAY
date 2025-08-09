"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";

export default function NewPasswordPage() {
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

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
                setTimeout(() => router.push("/signin"), 2000);
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
                            />
                            <TextInput
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(value: string) => setConfirmPassword(value)}
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
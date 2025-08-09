"use client"
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";
import { useState } from "react";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";
import { z } from "zod";

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    //Input validation Schema
    const transferSchema = z.object({
        number: z.string()
            .length(10, { message: "Phone number must be exactly 10 digits (no spaces or special characters)" })
            .regex(/^\d+$/, "Phone number must contain only digits"),
        amount: z.number()
            .positive("Amount must be positive")
            .min(10, { message: "Minimum amount is ₹10" })
            .max(10000, { message: "Maximum amount is ₹10,000" })
    });

    const handleSubmit = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            // Validate inputs
            const validated = transferSchema.safeParse({
                number,
                amount: Number(amount)
            });

            if (!validated.success) {
                const firstErrorMessage = validated.error.issues[0]?.message || "Invalid input";
                setMessage({
                    text: firstErrorMessage,
                    type: 'error'
                });
                return;
            }

            // Process transfer
            await p2pTransfer(number, Number(amount) * 100);
            setMessage({ text: "Transfer successful!", type: 'success' });
            setNumber("");
            setAmount("");
        } catch (e) {
            setMessage({
                text: e instanceof Error ? e.message : "Transfer failed",
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Send to Phone Number">
            <div className="w-full space-y-4">
                <TextInput
                    label="Number"
                    placeholder="Enter 10-digit phone number"
                    value={number}
                    onChange={setNumber}
                />
                <TextInput
                    label="Amount"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={setAmount}
                />
                {message && (
                    <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                <div className="flex justify-center pt-2">
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Send'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
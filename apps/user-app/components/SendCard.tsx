"use client"
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";
import { Center } from "@repo/ui/center";
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
        <div className="h-[60vh]">
            <Center>
                <Card title="Send to Phone Number">
                    <div className="min-w-[32rem] pt-2">
                        {message && (
                            <div className={`mb-4 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pb-2">
                            <TextInput
                                placeholder="Number"
                                label="Number"
                                onChange={setNumber}
                                value={number}
                            />
                        </div>

                        <div className="pb-2">
                            <TextInput
                                placeholder="Amount"
                                label="Amount"
                                onChange={setAmount}
                                value={amount}
                            />
                        </div>

                        <div className="pt-4 flex justify-center">
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Processing...' : 'Send'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </Center>
        </div>
    );
}
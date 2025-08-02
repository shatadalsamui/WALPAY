"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createWithdrawal } from "../app/lib/actions/createWithdrawal";
import { z } from "zod";

const withdrawalSchema = z.object({
    amount: z.number()
        .min(100, "Minimum withdrawal is ₹100")
        .positive("Amount must be positive"),
    accountNumber: z.string()
        .min(9, "Account number must be at least 9 digits")
        .max(18, "Account number cannot exceed 18 digits")
        .regex(/^\d+$/, "Must contain only numbers"),
    bank: z.string().min(1, "Please select a bank")
});

const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    code: "HDFC"
}, {
    name: "Axis Bank",
    code: "AXIS"
}, {
    name: "SBI Bank",
    code: "SBI"
}, {
    name: "ICICI Bank",
    code: "ICICI"
}];

export const WithdrawMoney = () => {
    const [bank, setBank] = useState(SUPPORTED_BANKS[0]?.code || "");
    const [accountNumber, setAccountNumber] = useState("");
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleWithdraw = async () => {
        try {
            const cleanAccountNumber = accountNumber.replace(/\D/g, '');
            const validationResult = withdrawalSchema.safeParse({
                amount,
                accountNumber: cleanAccountNumber,
                bank
            });

            if (!validationResult.success) {
                const firstError = validationResult.error.issues.find(Boolean); // Safely get first error
                setMessage({
                    text: firstError?.message || "Invalid withdrawal request data",
                    type: 'error'
                });
                return;
            }

            setIsLoading(true);
            setMessage(null);

            const response = await createWithdrawal({
                amount: validationResult.data.amount,
            bank: validationResult.data.bank,
                accountNumber: cleanAccountNumber
            });

            if (response.success) {
                setMessage({ text: "Withdrawal request submitted successfully", type: 'success' });
                setAmount(0);
                setAccountNumber("");
            } else {
                setMessage({ text: response.message || "Failed to process withdrawal", type: 'error' });
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
            setMessage({ text: "An error occurred. Please try again.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Withdraw Money">
            <div className="w-full space-y-4">
                <TextInput
                    label="Amount"
                    placeholder="Enter amount"
                    type="number"
                    value={amount || ""}
                    onChange={(value) => setAmount(Number(value))}
                />

                <TextInput
                    label="Account Number"
                    placeholder="Enter 9-18 digit account number"
                    value={accountNumber}
                    onChange={(value) => {
                        const digitsOnly = value.replace(/\D/g, '');
                        if (digitsOnly.length <= 18) {
                            setAccountNumber(digitsOnly);
                        }
                    }}
                />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bank</label>
                    <Select
                        onSelect={(value) => {
                            setBank(SUPPORTED_BANKS.find(x => x.code === value)?.code || "");
                        }}
                        options={SUPPORTED_BANKS.map(x => ({
                            key: x.code,
                            value: x.name
                        }))}
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-center pt-2">
                    <Button
                        onClick={handleWithdraw}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Withdraw'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
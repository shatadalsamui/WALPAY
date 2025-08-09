"use client"
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { createOnRampTransaction } from "../app/lib/actions/createOnrampTransaction";
import { z } from "zod";

const addMoneySchema = z.object({
    amount: z.number()
        .min(500, "Minimum amount is ₹500")
        .max(100000, "Maximum amount is ₹1,00,000")
        .positive("Amount must be positive"),
    provider: z.string().min(1, "Please select a bank")
});

const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com"
}, {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/"
}, {
    name: "SBI Bank",
    redirectUrl: "https://retail.onlinesbi.sbi/retail//login.htm"
}, {
    name: "ICICI Bank",
    redirectUrl: "https://infinity.icicibank.com/corp/Login.jsp"
}];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleAddMoney = async () => {
        try {
            const validationResult = addMoneySchema.safeParse({ amount, provider });

            if (!validationResult.success) {
                const firstError = validationResult.error.issues[0];
                setMessage({ text: firstError?.message || "Invalid data", type: 'error' });
                return;
            }

            setIsLoading(true);
            setMessage(null);
            await createOnRampTransaction(amount, provider);
            window.location.href = redirectUrl || "";
        } catch (error) {
            setMessage({ text: "An error occurred", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return <Card title="Add Money">
        <div className="w-full space-y-4">
            <TextInput label="Amount" placeholder="Amount" onChange={(value) => {
                setAmount(Number(value))
            }} />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bank</label>
                <Select onSelect={(value) => {
                    setRedirectUrl(SUPPORTED_BANKS.find(x => x.name === value)?.redirectUrl || "");
                    setProvider(SUPPORTED_BANKS.find(x => x.name === value)?.name || "");
                }} options={SUPPORTED_BANKS.map(x => ({
                    key: x.name,
                    value: x.name
                }))} />
            </div>

            {message && (
                <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-center pt-2">
                <Button onClick={handleAddMoney} disabled={isLoading}>
                    {isLoading ? "Processing..." : "Add"}
                </Button>
            </div>
        </div>
    </Card>
}
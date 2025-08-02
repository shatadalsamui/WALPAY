"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createWithdrawal } from "../app/lib/actions/createWithdrawal";

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
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const handleWithdraw = async () => {
        if (!accountNumber || !amount || !bank) {
            setMessage({text: "Please fill all fields", type: 'error'});
            return;
        }

        if (amount <= 0) {
            setMessage({text: "Amount must be greater than 0", type: 'error'});
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await createWithdrawal({
                amount,
                bank,
                accountNumber
            });

            if (response.success) {
                setMessage({text: "Withdrawal request submitted successfully", type: 'success'});
                // Clear form
                setAmount(0);
                setAccountNumber("");
            } else {
                setMessage({text: response.message || "Failed to process withdrawal", type: 'error'});
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
            setMessage({text: "An error occurred. Please try again.", type: 'error'});
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
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={setAccountNumber}
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
                    <div className={`p-3 rounded-md ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
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
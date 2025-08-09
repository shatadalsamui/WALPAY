"use client"
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

interface FormProps {
    title: string;
    buttonText: string;
    onSubmit: () => void;
    inputs: {
        label: string;
        type: string;
        placeholder: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }[];
    error?: string;
    loading?: boolean;
}

export function Form({ title, buttonText, onSubmit, inputs, error, loading }: FormProps) {
    const router = useRouter();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Card title={title}>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                {inputs.map((input, index) => (
                    <TextInput
                        key={index}
                        label={input.label}
                        type={input.type}
                        placeholder={input.placeholder}
                        value={input.value}
                        onChange={(value) => input.onChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
                        showEye={input.label === "OTP"}
                    />
                ))}
                <div className="pt-4">
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? "Processing..." : buttonText}
                    </Button>
                </div>
            </form>
            <div className="text-center mt-4">
                <span style={{ color: 'black' }}>Didn&apos;t receive OTP? </span>
                <button
                    type="button"
                    className="text-blue-600 cursor-pointer bg-transparent pl-1"
                    onClick={() => router.push("/signup")}
                >
                    Retry
                </button>
            </div>
        </Card>
    );
}
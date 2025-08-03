import { Card } from "@repo/ui/card";

export const WithdrawTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        status: "Success" | "Failure" | "Processing",
        provider: string
    }[]
}) => {
    if (!transactions.length) {
        return <Card title="Recent Withdrawals">
            <div className="text-center pb-8 pt-8">
                No withdrawal transactions
            </div>
        </Card>
    }
    return <Card title="Recent Withdrawals">
        <div className="pt-2">
            {transactions.map(t => (
                <div className="flex justify-between border-b border-slate-300 py-2">
                    <div>
                        <div className="text-sm">
                            Withdrawn INR
                        </div>
                        <div className="text-slate-600 text-xs">
                            {t.time.toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className={`text-right min-w-[120px] ${t.status.toLowerCase() === "success" ? "text-green-500" : t.status.toLowerCase() === "failure" ? "text-red-500" : "text-yellow-500"}`}>
                        - Rs {t.amount / 100}
                        <div className="text-xs">
                            {t.status.toLowerCase() === "processing" ? "Pending bank confirmation" : t.status}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
}
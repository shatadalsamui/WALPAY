"use client"
import { Card } from "@repo/ui/card"

type P2PTransaction = {
    id: number;
    amount: number;
    timestamp: Date;
    fromUserId: number;
    toUserId: number;
    fromUser: {
        name: string | null;
        number: string;
    };
    toUser: {
        name: string | null;
        number: string;
    };
    currentUserId: number;
}

export const P2PTransactions = ({
    transactions
}: {
    transactions: P2PTransaction[]
}) => {
    if (!transactions.length) {
        return (
            <Card title="P2P Transfers">
                <div className="text-center pb-8 pt-8">
                    No P2P transactions yet
                </div>
            </Card>
        )
    }

    return (
        <Card title="P2P Transfers">
            <div className="pt-2">
                {transactions.map(t => {
                    const isSent = t.fromUserId === t.currentUserId;
                    const otherParty = isSent ? t.toUser : t.fromUser;
                    const displayName = otherParty.name || `+91 ${otherParty.number}`;

                    return (
                        <div key={t.id} className="flex justify-between border-b border-slate-300 py-2">
                            <div>
                                <div className="text-sm">
                                    {isSent ? 'Sent to ' : 'Received from '}
                                    <span className="font-medium">{displayName}</span>
                                </div>
                                <div className="text-xs text-black">
                                    {otherParty.number ? <b>+91 {otherParty.number}</b> : ''}
                                </div>
                                <div className="text-slate-600 text-xs">
                                    {new Date(t.timestamp).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className={`text-right min-w-[120px] ${isSent ? 'text-red-500' : 'text-green-500'}`}>
                                {isSent ? '-' : '+'} ₹{(t.amount / 100).toFixed(2)}
                                <div className="text-xs text-slate-500">
                                    {isSent ? 'Sent' : 'Received'}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

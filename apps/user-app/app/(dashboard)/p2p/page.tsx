import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { SendCard } from "../../../components/SendCard";
import { P2PTransactions } from "../../../components/P2PTransactions";
import { BalanceCard } from "../../../components/BalanceCard";

async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    };
}

export default async function P2PPage() {
    const session = await getServerSession(authOptions);
    const [balance, allTransactions] = await Promise.all([//lets it run multiple async ops in parallel and gtes resolved only when all get finished
        getBalance(),
        (async () => {
            if (!session?.user?.id) return [];
            const userId = Number(session.user.id);

            const [sent, received] = await Promise.all([
                prisma.p2pTransfer.findMany({
                    where: { fromUserId: userId },
                    include: { toUser: true, fromUser: true },
                    orderBy: { timestamp: 'desc' },
                    take: 10
                }),
                prisma.p2pTransfer.findMany({
                    where: { toUserId: userId },
                    include: { toUser: true, fromUser: true },
                    orderBy: { timestamp: 'desc' },
                    take: 10
                })
            ]);

            return [...sent, ...received]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10);
        })()
    ]);

    if (!session?.user?.id) {
        return (
            <div className="w-full p-8">
                <div className="text-4xl text-[#6a51a6] pt-8 mb-8 pl-4 font-bold">
                    P2P Transfer
                </div>
                <div className="text-center p-8">
                    Please sign in to view P2P transfers
                </div>
            </div>
        );
    }
    return (
        <div className="w-screen">
            <div className="text-4xl text-[#6a51a6] pt-8 mb-8 pl-4 font-bold">
                P2P Transfer
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
                <div>
                    <SendCard />
                    <div className="pt-4">
                        <BalanceCard amount={balance.amount} locked={balance.locked} />
                    </div>
                </div>
                <div>
                    <P2PTransactions
                        transactions={allTransactions.map(tx => ({
                            ...tx,
                            currentUserId: Number(session.user.id)
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}
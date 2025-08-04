import { AllTransactions } from "../../../components/AllTransactions";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { Suspense } from "react";
import Loading from "../../../components/Loading";

async function getTransactions(userId: number) {
  try {
    const [onRampTxns, p2pTxns, withdrawals] = await Promise.all([
      prisma.onRampTransaction.findMany({ where: { userId } }),
      prisma.p2pTransfer.findMany({
        where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
        include: { 
          fromUser: { select: { id: true, number: true, name: true } },
          toUser: { select: { id: true, number: true, name: true } }
        }
      }),
      prisma.withdrawal.findMany({ where: { userId } })
    ]);

    const mappedOnRamp = onRampTxns.map(t => ({
      id: t.id,
      amount: t.amount,
      timestamp: t.startTime,
      type: 'ON_RAMP' as const,
      provider: t.provider,
      status: t.status
    }));

    const mappedP2P = p2pTxns.map(t => ({
      id: t.id,
      amount: t.amount,
      timestamp: t.timestamp,
      type: 'P2P' as const,
      isSent: t.fromUserId === userId,
      fromUser: { number: t.fromUser.number, name: t.fromUser.name },
      toUser: { number: t.toUser.number, name: t.toUser.name },
      currentUserId: userId
    }));

    const mappedWithdraw = withdrawals.map(t => ({
      id: t.id,
      amount: t.amount,
      To_AccNo: t.accountNumber,
      timestamp: t.createdAt,
      type: 'WITHDRAW' as const,
      provider: t.bank,
      status: t.status
    }));

    return [...mappedOnRamp, ...mappedP2P, ...mappedWithdraw]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to load transactions");
  }
}

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return (
      <div className="w-screen pt-8 flex justify-left">
        <div className="max-w-4xl w-full text-center py-12">
          <h2 className="text-2xl font-semibold text-red-500">Unauthorized Access</h2>
          <p className="mt-2 text-gray-600">Please sign in to view your transaction history</p>
        </div>
      </div>
    );
  }
  
  const userId = Number(session.user.id);
  const transactions = await getTransactions(userId);

  return (
    <div className="w-screen pt-8 flex justify-left">
      <div className="max-w-4xl w-full px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#6a51a6]">Transaction History</h1>
          <p className="text-gray-600 mt-2">All your financial activities in one place</p>
        </div>
        
        <Suspense fallback={<Loading />}>
          <AllTransactions transactions={transactions} />
        </Suspense>
      </div>
    </div>
  );
}
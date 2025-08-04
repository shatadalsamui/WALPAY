import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";
import { WithdrawMoney } from "../../../components/WithdrawMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { WithdrawTransactions } from "../../../components/WithdrawTransactions";

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
    }
}

async function getWithdrawTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.withdrawal.findMany({
    where: {
      userId: Number(session?.user?.id)
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  console.log("Withdrawal statuses:", txns.map(t => t.status));
  return txns.map(t => ({
    time: t.createdAt,
    amount: t.amount,
    status: (t.status === "COMPLETED" ? "Success" : t.status === "PENDING" ? "Processing" : t.status === "PENDING" ? "Processing" : t.status) as "Success" | "Failure" | "Processing",
    provider: "Bank Transfer"
  }));
}

export default async function() {
  const balance = await getBalance();
  const transactions = await getWithdrawTransactions();

  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 pl-4 font-bold">
        Withdraw to Bank
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div>
          <WithdrawMoney />
          <div className="pt-4">
            <BalanceCard amount={balance.amount} locked={balance.locked} />
          </div>
        </div>
        <div>
          <WithdrawTransactions transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
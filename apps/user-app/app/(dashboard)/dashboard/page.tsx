import prisma from "@repo/db/client";
import { BalanceCard } from "../../../components/BalanceCard";
import { UserDetailsCard } from "../../../components/UserDetailsCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

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

async function getUserData() {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
        where: {
            id: Number(session?.user?.id)
        },
        select: {
            id: true,
            name: true,
            email: true,
            number: true
        }
    });

    return {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.number || ''
    };
}

export default async function () {
    const [balance, user] = await Promise.all([
        getBalance(),
        getUserData()
    ]);

    return <div className="w-screen">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 pl-4 font-bold">
            Dashboard
        </div>

        <div className="flex flex-col gap-4 max-w-4xl p-4">
            <UserDetailsCard {...user} />
            <BalanceCard amount={balance.amount} locked={balance.locked} />
        </div>
    </div>
}
"use client";

import { Card } from "@repo/ui/card";
import { useState, useMemo } from "react";

export type Transaction = {
  id: number;
  amount: number;
  timestamp: Date;
  type: 'ON_RAMP' | 'P2P' | 'WITHDRAW';
} & (
    | {
      type: 'ON_RAMP';
      provider: string;
      status: string;
    }
    | {
      type: 'P2P';
      isSent: boolean;
      fromUser: { number: string; name: string | null };
      toUser: { number: string; name: string | null };
      currentUserId: number;
    }
    | {
      type: 'WITHDRAW';
      status: string;
      To_AccNo: string;
    }
  );

type FilterType = 'all' | 'ON_RAMP' | 'P2P' | 'WITHDRAW';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'ON_RAMP', label: 'Deposits' },
  { id: 'P2P', label: 'P2P Transfers' },
  { id: 'WITHDRAW', label: 'Withdrawals' }
];

export const AllTransactions = ({
  transactions
}: {
  transactions: Transaction[]
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    return transactions.filter(t => t.type === activeFilter);
  }, [transactions, activeFilter]);

  return (
    <Card title="All Transactions">
      <div className="flex flex-wrap justify-left gap-2 pt-4 mb-5">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`px-4 py-2 rounded transition-all ${activeFilter === filter.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
            onClick={() => setActiveFilter(filter.id as FilterType)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map(t => (
            <div
              key={`${t.type}-${t.id}`}
              className="pt-1 pr-3 pl-3 pb-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto_auto] gap-y-1"
            >
              <div className="font-medium truncate row-start-1 col-start-1">
                {t.type === 'ON_RAMP' ? 'Deposit to Wallet' :
                  t.type === 'WITHDRAW' ? 'Withdrawal to Bank' :
                    t.isSent
                      ? `P2P Transfer, Sent to ${t.toUser.name || 'User'}`
                      : `P2P Transfer, Received from ${t.fromUser.name || 'User'}`}
              </div>

              <div className="text-right row-start-1 col-start-2 row-span-2 self-start">
                {t.type === 'ON_RAMP' && (
                  <>
                    <div className="text-green-600 font-medium">
                      + ₹{(t.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.status}
                    </div>
                  </>
                )}
                {t.type === 'WITHDRAW' && (
                  <>
                    <div className="text-red-600 font-medium">
                      - ₹{(t.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.status}
                    </div>
                  </>
                )}
                {t.type === 'P2P' && (
                  <div className={t.isSent ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {t.isSent ? '-' : '+'} ₹{(t.amount / 100).toFixed(2)}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 truncate row-start-2 col-start-1">
                {t.type === 'ON_RAMP' ? `Provider: ${t.provider}` :
                  t.type === 'WITHDRAW' ? `To Acc No. : ${t.To_AccNo}` :
                    t.isSent ? `To: ${t.toUser.number}` : `From: ${t.fromUser.number}`}
              </div>

              <div className="text-sm text-gray-500 pt-1.5 mt-1.5 border-t border-gray-100 row-start-3 col-span-2">
                {t.timestamp.toLocaleString('en-IN')}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
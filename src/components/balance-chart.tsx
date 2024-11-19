"use client";

import { useMemo } from "react";
import { DateTime } from "luxon";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Transaction {
  date: string;
  amount: number;
  running_balance: number;
  account_type: string;
  account_id: string;
}

interface BalanceChartProps {
  transactions: Transaction[];
}

export function BalanceChart({ transactions }: BalanceChartProps) {
  const chartData = useMemo(() => {
    // First, get all unique dates in the month and sort them
    const dates = [
      ...Array.from(
        new Set(
          transactions.map((t) =>
            DateTime.fromISO(t.date).toFormat("yyyy-MM-dd")
          )
        )
      ),
    ].sort();

    if (dates.length === 0) return [];

    // Track the latest balance for each account
    const accountLatestBalance: Record<string, number> = {};

    // Build daily balances, carrying over previous balances when no transactions
    return dates.map((date) => {
      // Get all transactions for this date
      const dayTransactions = transactions.filter(
        (t) => DateTime.fromISO(t.date).toFormat("yyyy-MM-dd") === date
      );

      // Group transactions by account and get the last one for each account
      const accountGroups = dayTransactions.reduce<
        Record<string, Transaction[]>
      >((acc, tx) => {
        if (!acc[tx.account_id]) {
          acc[tx.account_id] = [];
        }
        acc[tx.account_id].push(tx);
        return acc;
      }, {});

      // Update account balances with the last transaction of the day for each account
      Object.entries(accountGroups).forEach(([accountId, txs]) => {
        // Sort by date descending and take the first (latest) transaction
        const latestTx = txs.sort(
          (a, b) =>
            DateTime.fromISO(b.date).toMillis() -
            DateTime.fromISO(a.date).toMillis()
        )[0];
        accountLatestBalance[accountId] = latestTx.running_balance;
      });

      // Calculate net worth by summing all account balances
      const netWorth = Object.values(accountLatestBalance).reduce(
        (sum, balance) => sum + balance,
        0
      );

      return {
        date,
        netWorth,
      };
    });
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => DateTime.fromISO(date).toFormat("MMM d")}
          />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value)]}
            labelFormatter={(date) =>
              DateTime.fromISO(date as string).toFormat("MMM d, yyyy")
            }
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="netWorth"
            name="Net Worth"
            fill="#3b82f6"
            stroke="#3b82f6"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

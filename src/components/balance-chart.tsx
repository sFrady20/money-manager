"use client";

import { useMemo } from "react";
import { DateTime } from "luxon";
import {
  LineChart,
  Line,
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
  running_balance?: number;
  account_type: string;
}

interface BalanceChartProps {
  transactions: Transaction[];
}

export function BalanceChart({ transactions }: BalanceChartProps) {
  const chartData = useMemo(() => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) =>
        DateTime.fromISO(a.date).toMillis() -
        DateTime.fromISO(b.date).toMillis()
    );

    // If we have running balance from Teller, use it directly
    if (sortedTransactions[0]?.running_balance !== undefined) {
      return sortedTransactions.map((transaction) => ({
        date: transaction.date,
        balance: transaction.running_balance,
      }));
    }

    // Otherwise calculate daily balances from Plaid data
    const dailyBalances = sortedTransactions.reduce<Record<string, number>>(
      (acc, transaction) => {
        const date = DateTime.fromISO(transaction.date).toFormat("yyyy-MM-dd");
        if (!acc[date]) {
          // Get the previous day's balance or 0 if it's the first day
          const prevDate = Object.keys(acc).sort().pop();
          acc[date] = prevDate ? acc[prevDate] : 0;
        }
        // Subtract amount because Plaid uses positive for expenses
        acc[date] -= transaction.amount;
        return acc;
      },
      {}
    );

    return Object.entries(dailyBalances)
      .map(([date, balance]) => ({
        date,
        balance,
      }))
      .sort(
        (a, b) =>
          DateTime.fromISO(a.date).toMillis() -
          DateTime.fromISO(b.date).toMillis()
      );
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
        <LineChart
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
          <Line
            type="monotone"
            dataKey="balance"
            name="Balance"
            stroke="#3b82f6"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

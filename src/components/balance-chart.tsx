"use client";

import { useMemo } from "react";
import { DateTime } from "luxon";
import {
  BarChart,
  Bar,
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
}

interface BalanceChartProps {
  transactions: Transaction[];
}

export function BalanceChart({ transactions }: BalanceChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by date
    const dailyTransactions = transactions.reduce<
      Record<string, { income: number; expenses: number }>
    >((acc, transaction) => {
      const date = DateTime.fromISO(transaction.date).toFormat("yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = { income: 0, expenses: 0 };
      }
      if (transaction.amount < 0) {
        acc[date].income += Math.abs(transaction.amount);
      } else {
        acc[date].expenses += transaction.amount;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.entries(dailyTransactions)
      .map(([date, amounts]) => ({
        date,
        income: amounts.income,
        expenses: amounts.expenses,
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
        <BarChart
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
          <Bar dataKey="income" name="Income" fill="#4ade80" />
          <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

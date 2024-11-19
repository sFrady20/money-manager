"use client";

import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { BalanceChart } from "./balance-chart";

interface Transaction {
  transaction_id: string;
  date: string;
  name: string;
  amount: number;
  category: string[];
  merchant_name: string | null;
  account_type: string;
  account_name: string;
  institution_name: string;
}

interface MonthlyStats {
  income: number;
  expenses: number;
  net: number;
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    DateTime.now().toFormat("yyyy-MM")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    income: 0,
    expenses: 0,
    net: 0,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/plaid/transactions?month=${selectedMonth}`
        );
        const data = await response.json();
        setTransactions(data.transactions);

        // Calculate monthly stats
        const stats = data.transactions.reduce(
          (acc: MonthlyStats, t: Transaction) => {
            const amount = Math.abs(t.amount);
            if (t.amount < 0) {
              // Negative amounts are income
              acc.income += amount;
            } else {
              // Positive amounts are expenses
              acc.expenses += amount;
            }
            return acc;
          },
          { income: 0, expenses: 0, net: 0 }
        );

        stats.net = stats.income - stats.expenses;
        setMonthlyStats(stats);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedMonth]);

  const changeMonth = (offset: number) => {
    const dt = DateTime.fromFormat(selectedMonth, "yyyy-MM");
    setSelectedMonth(dt.plus({ months: offset }).toFormat("yyyy-MM"));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => changeMonth(-1)} variant="outline">
          Previous Month
        </Button>
        <h2 className="text-lg font-semibold">
          {DateTime.fromFormat(selectedMonth, "yyyy-MM").toFormat("MMMM yyyy")}
        </h2>
        <Button onClick={() => changeMonth(1)} variant="outline">
          Next Month
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No transactions found for this month
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
            <div>
              <div className="text-sm text-muted-foreground">Income</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(monthlyStats.income)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Expenses</div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(monthlyStats.expenses)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Net</div>
              <div
                className={`text-lg font-semibold ${
                  monthlyStats.net >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(monthlyStats.net)}
              </div>
            </div>
          </div>

          <BalanceChart transactions={transactions} />

          <div className="space-y-2">
            {transactions.map((transaction) => {
              const amount = Math.abs(transaction.amount);
              // Negative amounts are income
              const isIncome = transaction.amount < 0;

              return (
                <div
                  key={transaction.transaction_id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      {transaction.merchant_name || transaction.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {DateTime.fromISO(transaction.date).toFormat(
                        "MMM dd, yyyy"
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.category.join(" › ")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.institution_name} •{" "}
                      {transaction.account_name}
                    </div>
                  </div>
                  <div className={isIncome ? "text-green-600" : ""}>
                    {formatCurrency(amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

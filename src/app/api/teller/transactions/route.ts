import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mmAccountTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DateTime } from "luxon";
import { Agent } from "node:https";
import axios from "axios";

const tellerApi = axios.create({
  baseURL: "https://api.teller.io",
  httpsAgent: new Agent({
    cert: process.env.TELLER_CERT!.replace(/\\n/g, "\n"),
    key: process.env.TELLER_KEY!.replace(/\\n/g, "\n"),
  }),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the month from the URL (format: YYYY-MM)
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM" },
        { status: 400 }
      );
    }

    // Create DateTime object for the first day of the month
    const startDate = DateTime.fromFormat(monthParam, "yyyy-MM")
      .startOf("month")
      .toISODate();

    // Get the last day of the month
    const endDate = DateTime.fromFormat(monthParam, "yyyy-MM")
      .endOf("month")
      .toISODate();

    // Get all Teller access tokens for the user
    const currentEnvironment = process.env.NEXT_PUBLIC_ENV || "sandbox";
    const userTokens = await db
      .select()
      .from(mmAccountTokens)
      .where(
        and(
          eq(mmAccountTokens.userId, session.user.id!),
          eq(mmAccountTokens.service, "teller"),
          eq(mmAccountTokens.environment, currentEnvironment)
        )
      );

    if (!userTokens.length) {
      return NextResponse.json({ transactions: [] });
    }

    // Fetch transactions for each linked account
    const allData = await Promise.allSettled(
      userTokens.map(async (token) => {
        // First get the accounts
        const accountsResponse = await tellerApi.get(`/accounts`, {
          auth: {
            username: token.accessToken,
            password: "",
          },
        });
        const accounts = await accountsResponse.data;
        if (accounts.error) {
          throw new Error(accounts.error.message);
        }

        // Then get transactions with running balances for each account
        const accountTransactions = await Promise.all(
          accounts.map(async (account: any) => {
            const transactionsResponse = await tellerApi.get(
              `/accounts/${account.id}/transactions?from=${startDate}&to=${endDate}`,
              {
                auth: {
                  username: token.accessToken,
                  password: "",
                },
              }
            );
            const transactions = await transactionsResponse.data;

            // Add account info to each transaction
            return transactions.map((transaction: any) => ({
              transaction_id: transaction.id,
              date: transaction.date,
              amount: -transaction.amount, // Negate to match Plaid's format (positive = expense)
              description: transaction.description,
              running_balance: transaction.running_balance,
              account_id: account.id,
              account_name: account.name,
              account_type: account.type,
              institution_name: account.institution.name,
            }));
          })
        );

        return accountTransactions.flat();
      })
    );

    if (allData.some((x) => x.status === "rejected")) {
      console.error(
        "Error fetching transactions:",
        allData
          .filter((x) => x.status === "rejected")
          .map((x) => x.reason.response.data)
      );
    }

    // Combine and sort transactions by date
    const transactions = allData
      .filter((x) => x.status === "fulfilled")
      .map((x) => x.value)
      .flat()
      .sort(
        (a, b) =>
          DateTime.fromISO(b.date).toMillis() -
          DateTime.fromISO(a.date).toMillis()
      );

    return NextResponse.json({
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

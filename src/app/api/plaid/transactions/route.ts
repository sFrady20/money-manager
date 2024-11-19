import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mmPlaidTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DateTime } from "luxon";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.NEXT_PUBLIC_PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

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

    // Get all access tokens for the user
    const userTokens = await db
      .select()
      .from(mmPlaidTokens)
      .where(eq(mmPlaidTokens.userId, session.user.id!));

    if (!userTokens.length) {
      return NextResponse.json({ transactions: [] });
    }

    // Fetch transactions for each linked account
    const allTransactions = await Promise.all(
      userTokens.map(async (token) => {
        const response = await plaidClient.transactionsGet({
          access_token: token.accessToken,
          start_date: startDate!,
          end_date: endDate!,
        });
        return response.data.transactions;
      })
    );

    // Combine and sort transactions by date
    const transactions = allTransactions
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

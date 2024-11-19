import { Configuration, CountryCode, PlaidApi, PlaidEnvironments } from "plaid";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mmAccountTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DateTime } from "luxon";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.NEXT_PUBLIC_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_ID,
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

    // Get all access tokens for the user that match the current environment
    const currentEnvironment = process.env.NEXT_PUBLIC_ENV || "sandbox";
    const userTokens = await db
      .select()
      .from(mmAccountTokens)
      .where(
        and(
          eq(mmAccountTokens.userId, session.user.id!),
          eq(mmAccountTokens.environment, currentEnvironment)
        )
      );

    if (!userTokens.length) {
      return NextResponse.json({ transactions: [] });
    }

    // Fetch transactions and account info for each linked account
    const allData = await Promise.all(
      userTokens.map(async (token) => {
        const [transactionsResponse, accountsResponse, institutionResponse] =
          await Promise.all([
            plaidClient.transactionsGet({
              access_token: token.accessToken,
              start_date: startDate!,
              end_date: endDate!,
            }),
            plaidClient.accountsGet({
              access_token: token.accessToken,
            }),
            plaidClient.institutionsGetById({
              institution_id: token.institutionId!,
              country_codes: [CountryCode.Us],
            }),
          ]);

        // Create maps for account and institution info
        const accountInfo = new Map(
          accountsResponse.data.accounts.map((account) => [
            account.account_id,
            {
              name: account.name,
              type: account.type,
              subtype: account.subtype,
            },
          ])
        );

        const institutionName = institutionResponse.data.institution.name;

        // Add account and institution info to each transaction
        const transactionsWithInfo = transactionsResponse.data.transactions.map(
          (transaction) => ({
            ...transaction,
            account_type: accountInfo.get(transaction.account_id)?.type,
            account_name: accountInfo.get(transaction.account_id)?.name,
            institution_name: institutionName,
          })
        );

        return transactionsWithInfo;
      })
    );

    // Combine and sort transactions by date
    const transactions = allData
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

import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mmPlaidTokens } from "@/lib/db/schema";

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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { public_token } = await request.json();

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get item to fetch institution ID
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });

    const institutionId = itemResponse.data.item.institution_id;

    // Store in database with current environment
    await db.insert(mmPlaidTokens).values({
      userId: session.user.id!,
      accessToken,
      itemId,
      institutionId,
      environment: process.env.NEXT_PUBLIC_PLAID_ENV || "sandbox",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}

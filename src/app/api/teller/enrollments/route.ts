import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import axios from "axios";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mmAccountTokens } from "@/lib/db/schema";

const tellerApi = axios.create({
  baseURL: "https://api.teller.io",
  headers: {
    "Teller-Version": "2020-10-12",
  },
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's Teller access tokens
    const tellerTokens = await db.query.mmAccountTokens.findMany({
      where: and(
        eq(mmAccountTokens.userId, session.user.id!),
        eq(mmAccountTokens.service, "teller")
      ),
    });

    // Fetch enrollments for each token
    const enrollments = await Promise.all(
      tellerTokens.map(async (token) => {
        try {
          // First get the accounts
          const accountsResponse = await tellerApi.get("/accounts", {
            auth: {
              username: token.accessToken,
              password: "",
            },
          });

          const accounts = accountsResponse.data;
          if (accounts.length === 0) return null;

          // Group accounts by institution
          const institution = accounts[0].institution;
          return {
            id: token.id,
            institution_name: institution.name,
            accounts: accounts.map((account: any) => ({
              id: account.id,
              name: account.name,
              type: account.type,
            })),
          };
        } catch (error) {
          console.error("Error fetching accounts for token:", error);
          return null;
        }
      })
    );

    // Filter out null results and return
    return NextResponse.json(enrollments.filter(Boolean));
  } catch (error) {
    console.error("Error fetching Teller enrollments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

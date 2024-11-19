import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mmAccountTokens } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { access_token, enrollment_id } = await request.json();

    // Store in database with current environment
    await db.insert(mmAccountTokens).values({
      userId: session.user.id!,
      accessToken: access_token,
      itemId: enrollment_id,
      service: "teller",
      environment:
        process.env.NODE_ENV === "development" ? "sandbox" : "production",
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

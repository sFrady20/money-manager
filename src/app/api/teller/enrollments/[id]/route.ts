import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mmAccountTokens } from "@/lib/db/schema";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the token from the database
    await db.delete(mmAccountTokens).where(eq(mmAccountTokens.id, params.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing Teller enrollment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

"use client";

import { useRouter } from "next/navigation";
import { TellerConnect } from "./teller-connect";
import { TransactionsList } from "./transactions-list";
import { Button } from "./ui/button";

interface DashboardProps {
  userEmail: string;
}

export function Dashboard({ userEmail }: DashboardProps) {
  const router = useRouter();

  const handleTellerSuccess = async (
    accessToken: string,
    enrollmentId?: string
  ) => {
    const response = await fetch("/api/teller/exchange-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
        enrollment_id: enrollmentId,
      }),
    });

    if (!response.ok) {
      console.error("Failed to exchange token");
    }

    router.refresh();
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Money Manager</h1>
        <div className="flex gap-4 items-center">
          <span>{userEmail}</span>
          <form action="/api/auth/signout" method="POST">
            <Button variant="outline">Sign out</Button>
          </form>
        </div>
      </div>

      <div className="mb-8">
        <TellerConnect onSuccess={handleTellerSuccess} />
      </div>

      <TransactionsList />
    </main>
  );
}

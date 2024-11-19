"use client";

import { PlaidLinkButton } from "@/components/plaid-link";
import { TransactionsList } from "@/components/transactions-list";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  userEmail: string;
}

export function Dashboard({ userEmail }: DashboardProps) {
  const handlePlaidSuccess = async (publicToken: string) => {
    const response = await fetch("/api/plaid/exchange-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_token: publicToken }),
    });

    if (!response.ok) {
      console.error("Failed to exchange token");
    }
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
        <PlaidLinkButton
          onSuccess={handlePlaidSuccess}
          onExit={() => console.log("Link exited")}
        />
      </div>

      <TransactionsList />
    </main>
  );
}

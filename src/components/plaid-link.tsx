"use client";

import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
}

export function PlaidLinkButton({ onSuccess, onExit }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const createLinkToken = async () => {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      const { link_token } = await response.json();
      setLinkToken(link_token);
    };
    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => {
      onSuccess(public_token);
    },
    onExit: () => {
      onExit();
    },
  });

  return (
    <Button onClick={() => open()} disabled={!ready} variant="default">
      Connect a bank account
    </Button>
  );
}

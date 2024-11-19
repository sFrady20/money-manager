"use client";

import { Button } from "@/components/ui/button";
import { TellerConnect as TellerConnectModal } from "teller-connect-react";
import { useState } from "react";

interface TellerConnectProps {
  onSuccess: (accessToken: string, enrollmentId?: string) => void;
}

export function TellerConnect({ onSuccess }: TellerConnectProps) {
  const [showConnect, setShowConnect] = useState(false);

  const handleSuccess = (enrollment: {
    accessToken: string;
    enrollmentId?: string;
  }) => {
    onSuccess(enrollment.accessToken, enrollment.enrollmentId);
    setShowConnect(false);
  };

  return (
    <>
      <Button onClick={() => setShowConnect(true)} variant="default">
        Connect with Teller
      </Button>

      {showConnect && (
        <TellerConnectModal
          applicationId={process.env.NEXT_PUBLIC_TELLER_ID!}
          environment={
            process.env.NODE_ENV === "development" ? "sandbox" : "production"
          }
          onSuccess={handleSuccess}
          onExit={() => setShowConnect(false)}
          onInit={() => console.log("Teller Connect initialized")}
          onError={(error) => console.error("Teller Connect error:", error)}
        />
      )}
    </>
  );
}

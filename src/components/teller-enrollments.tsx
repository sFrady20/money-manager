"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Enrollment {
  id: string;
  institution_name: string;
  accounts: {
    id: string;
    name: string;
    type: string;
  }[];
}

export function TellerEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/teller/enrollments");
      if (!response.ok) throw new Error("Failed to fetch enrollments");
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeEnrollment = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/teller/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove enrollment");
      // Refresh enrollments after successful removal
      fetchEnrollments();
    } catch (error) {
      console.error("Error removing enrollment:", error);
    }
  };

  if (loading) {
    return <div>Loading enrollments...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Connected Bank Accounts</h2>
      {enrollments.length === 0 ? (
        <p className="text-muted-foreground">No connected bank accounts</p>
      ) : (
        <div className="grid gap-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{enrollment.institution_name}</h3>
                  <ul className="mt-2 space-y-1">
                    {enrollment.accounts.map((account) => (
                      <li
                        key={account.id}
                        className="text-sm text-muted-foreground"
                      >
                        {account.name} ({account.type})
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeEnrollment(enrollment.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

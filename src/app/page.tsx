import { auth } from "@/lib/auth";
import { Dashboard } from "@/components/dashboard";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <Dashboard userEmail={session.user.email!} />;
}

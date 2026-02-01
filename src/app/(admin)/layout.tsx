import { authOptions } from "@/auth";
import AdminShell from "@/app/(admin)/AdminShell";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionPromise = getServerSession(authOptions);

  return (
    <AuthGate sessionPromise={sessionPromise}>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}

async function AuthGate({
  sessionPromise,
  children,
}: {
  sessionPromise: ReturnType<typeof getServerSession>;
  children: React.ReactNode;
}) {
  const session = await sessionPromise;

  if (!session) {
    redirect("/signin");
  }

  return <>{children}</>;
}

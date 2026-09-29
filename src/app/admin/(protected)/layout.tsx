import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/guard";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}

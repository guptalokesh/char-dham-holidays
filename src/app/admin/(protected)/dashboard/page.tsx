import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/guard";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-zinc-600">Signed in as {admin.email}.</p>
      <p className="mt-8 text-sm text-zinc-500">
        Listings, availability, enquiries and settings management are coming
        in later steps.
      </p>
    </main>
  );
}

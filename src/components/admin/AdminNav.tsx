import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/listings", label: "Manage Listings" },
  { href: "/admin/availability-enquiries", label: "Availability & Enquiries" },
  { href: "/admin/settings", label: "Website / Business Settings" },
];

export function AdminNav() {
  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <nav className="flex flex-wrap gap-4 text-sm font-medium">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-zinc-700 hover:text-zinc-950">
              {link.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </div>
    </header>
  );
}

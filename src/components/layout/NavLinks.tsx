"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeHref } from "@/lib/nav";

export interface NavLink {
  href: string;
  label: string;
  accent?: boolean;
}

export function NavLinks({ links, onNavigate }: { links: NavLink[]; onNavigate?: () => void }) {
  const current = activeHref(
    usePathname(),
    links.map((link) => link.href)
  );

  return (
    <>
      {links.map((link) => {
        const isCurrent = link.href === current;
        const tone = link.accent
          ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
          : isCurrent
            ? "bg-stone-900 text-white"
            : "text-stone-700 hover:bg-stone-200/70 hover:text-stone-950";
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={isCurrent ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${tone} ${
              link.accent && isCurrent ? "ring-2 ring-stone-900" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

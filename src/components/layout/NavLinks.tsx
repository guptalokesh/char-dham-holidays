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
            ? "bg-white text-stone-900"
            : "text-white/85 hover:bg-white/10 hover:text-white";
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={isCurrent ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${tone} ${
              link.accent && isCurrent ? "ring-2 ring-white" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

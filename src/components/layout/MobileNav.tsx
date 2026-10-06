"use client";

import { useState } from "react";
import Link from "next/link";
import { NavLinks, type NavLink } from "@/components/layout/NavLinks";

export function MobileNav({
  links,
  cta,
}: {
  links: NavLink[];
  cta?: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded border border-stone-300 text-stone-800"
      >
        <span className="sr-only">Menu</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <nav className="absolute inset-x-4 top-full z-50 mt-2 flex flex-col gap-1 rounded-xl border border-stone-200 bg-white p-3 shadow-xl">
          <NavLinks links={links} onNavigate={() => setOpen(false)} />
          {cta && (
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-stone-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-stone-800"
            >
              {cta.label}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

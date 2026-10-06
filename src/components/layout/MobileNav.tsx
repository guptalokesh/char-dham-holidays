"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({
  links,
  cta,
}: {
  links: { href: string; label: string; tone?: string }[];
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
        className="flex h-10 w-10 items-center justify-center rounded border border-white/40 text-white"
      >
        <span className="sr-only">Menu</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <nav className="absolute inset-x-4 top-full z-50 mt-2 flex flex-col gap-1.5 rounded-xl border border-white/10 bg-blue-950 p-3 shadow-xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${link.tone ?? "bg-white/10 hover:bg-white/20"}`}
            >
              {link.label}
            </Link>
          ))}
          {cta && (
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-amber-400 px-3 py-2 text-center text-sm font-semibold text-stone-950 hover:bg-amber-300"
            >
              {cta.label}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

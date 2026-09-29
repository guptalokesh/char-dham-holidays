"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({
  links,
  cta,
}: {
  links: { href: string; label: string }[];
  cta?: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded border border-zinc-300"
      >
        <span className="sr-only">Menu</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <nav className="mt-2 flex flex-col gap-1 rounded border border-zinc-200 bg-white p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {link.label}
            </Link>
          ))}
          {cta && (
            <Link
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-1 rounded bg-zinc-900 px-2 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
            >
              {cta.label}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

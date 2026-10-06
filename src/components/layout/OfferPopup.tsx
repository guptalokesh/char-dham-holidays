"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { OfferCard } from "@/components/layout/OfferCard";

const SEEN_KEY = "offer-popup-seen";
const HIDDEN_ON = ["/yatra", "/contact"];

function readSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage can be blocked; the popup then simply may show again.
  }
}

export function OfferPopup({
  charDhamPrice,
  anyDhamPrice,
  delayMs = 3000,
}: {
  charDhamPrice: number | null;
  anyDhamPrice: number | null;
  delayMs?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<Element | null>(null);
  const suppressed = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (suppressed || readSeen()) return;
    const timer = setTimeout(() => {
      returnFocusTo.current = document.activeElement;
      setOpen(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [suppressed, delayMs]);

  function close() {
    writeSeen();
    setOpen(false);
    if (returnFocusTo.current instanceof HTMLElement) returnFocusTo.current.focus();
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-popup-title"
        className="w-full max-w-md rounded-2xl bg-[#fdfbf7] p-6 shadow-2xl"
      >
        <OfferCard
          charDhamPrice={charDhamPrice}
          anyDhamPrice={anyDhamPrice}
          titleId="offer-popup-title"
          onNavigate={close}
          corner={
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={close}
              className="rounded-full p-1 text-stone-600 hover:bg-stone-200"
            >
              <span aria-hidden="true">✕</span>
            </button>
          }
        />
      </div>
    </div>
  );
}

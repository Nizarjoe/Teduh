"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="border border-line px-3 py-2 text-sm"
        aria-expanded={open}
        aria-controls="menu-situs"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      {open ? (
        <nav id="menu-situs" aria-label="Menu" className="absolute inset-x-0 top-full z-30 border-b border-line bg-paper px-5 py-4">
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block py-1 text-lg" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

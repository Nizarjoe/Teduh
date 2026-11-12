"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/stores/cart";

export function CartLink() {
  const count = useCart((state) => state.items.reduce((sum, item) => sum + item.qty, 0));
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const shown = ready ? count : 0;
  return (
    <Link
      href="/keranjang"
      className="px-2 py-2 text-sm text-ink"
      aria-label={shown > 0 ? `Keranjang, ${shown} barang` : "Keranjang"}
    >
      Keranjang{shown > 0 ? ` (${shown})` : ""}
    </Link>
  );
}

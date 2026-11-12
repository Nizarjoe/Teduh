"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { buttonPrimary } from "@/components/styles";
import { formatIDR } from "@/lib/money";
import { useCart } from "@/stores/cart";

export function CartView() {
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = useCart.persist.onFinishHydration(() => setReady(true));
    if (useCart.persist.hasHydrated()) setReady(true);
    const timer = window.setTimeout(() => setReady(true), 50);
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return <p className="mt-8 text-ink-soft">Memuat keranjang…</p>;
  if (items.length === 0) {
    return (
      <div className="mt-10">
        <p>Keranjang masih kosong.</p>
        <Link href="/katalog" className={`${buttonPrimary} mt-6`}>
          Lihat katalog
        </Link>
      </div>
    );
  }
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  return (
    <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_18rem]">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-5">
            <div className="h-28 w-24 shrink-0 bg-mist">
              {item.image ? <ProductImage src={item.image} alt="" sizes="96px" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/produk/${item.productSlug}`} className="font-serif text-xl">
                {item.productName}
              </Link>
              <p className="mt-1 text-sm text-ink-soft">
                {item.size} · {item.color}
              </p>
              <p className="mt-2 tabular-nums">{formatIDR(item.unitPrice)}</p>
              <div className="mt-3 flex items-center gap-3">
                <label className="sr-only" htmlFor={`qty-${item.variantId}`}>
                  Jumlah {item.productName}
                </label>
                <input
                  id={`qty-${item.variantId}`}
                  className="w-16 border border-line bg-surface px-2 py-2 text-base"
                  type="number"
                  min={1}
                  max={10}
                  value={item.qty}
                  onChange={(event) => setQty(item.variantId, Number(event.target.value) || 1)}
                />
                <button type="button" className="text-sm underline underline-offset-4" onClick={() => remove(item.variantId)}>
                  Hapus
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit border border-line p-5">
        <p className="text-sm text-ink-soft">Subtotal barang</p>
        <p className="mt-1 text-xl tabular-nums">{formatIDR(subtotal)}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Ongkir dan voucher dihitung di pembayaran. Harga akhir mengikuti harga di server.
        </p>
        <Link href="/checkout" className={`${buttonPrimary} mt-5 w-full`}>
          Lanjut ke pembayaran
        </Link>
      </aside>
    </div>
  );
}

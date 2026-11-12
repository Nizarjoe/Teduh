"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Price } from "@/components/price";
import { buttonPrimary } from "@/components/styles";
import { formatIDR } from "@/lib/money";
import { useCart } from "@/stores/cart";

export type PurchaseVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  compareAtPrice: number | null;
  available: number;
  weightGrams: number;
};

export function PurchasePanel({
  productName,
  productSlug,
  image,
  variants,
}: {
  productName: string;
  productSlug: string;
  image: string;
  variants: PurchaseVariant[];
}) {
  const sizes = useMemo(() => [...new Set(variants.map((variant) => variant.size))], [variants]);
  const firstInStock = variants.find((variant) => variant.available > 0) ?? variants[0];
  const [size, setSize] = useState(firstInStock?.size ?? "");
  const colors = variants.filter((variant) => variant.size === size);
  const [color, setColor] = useState(firstInStock?.color ?? "");
  const selected = colors.find((variant) => variant.color === color) ?? colors[0];
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((state) => state.add);

  if (!selected) return <p>Varian belum tersedia.</p>;

  function chooseSize(next: string) {
    setSize(next);
    const options = variants.filter((variant) => variant.size === next);
    if (!options.some((variant) => variant.color === color)) setColor(options[0]?.color ?? "");
    setQty(1);
    setAdded(false);
  }

  function addToCart() {
    if (!selected || selected.available < 1) return;
    add({
      variantId: selected.id,
      productSlug,
      productName,
      size: selected.size,
      color: selected.color,
      image,
      unitPrice: selected.price,
      qty,
    });
    setAdded(true);
  }

  return (
    <div>
      <Price amount={selected.price} compare={selected.compareAtPrice} size="lg" />
      <p className="mt-2 text-sm text-ink-soft">
        {selected.available > 0 ? `Stok ${selected.available}` : "Stok habis"} · {selected.weightGrams} g · {selected.sku}
      </p>
      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Ukuran</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((option) => (
            <label key={option} className="cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="ukuran"
                value={option}
                checked={option === size}
                onChange={() => chooseSize(option)}
              />
              <span className="inline-flex min-w-12 justify-center border border-line px-3 py-2 text-sm peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper">
                {option}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Warna</legend>
        <div className="mt-2 flex flex-col gap-2">
          {colors.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="warna"
                value={option.color}
                checked={option.color === selected.color}
                onChange={() => {
                  setColor(option.color);
                  setAdded(false);
                }}
              />
              <span className="h-4 w-4 border border-line" style={{ background: option.colorHex }} aria-hidden />
              <span className="text-sm">{option.color}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 flex items-center gap-3">
        <label htmlFor="jumlah" className="text-sm font-medium">
          Jumlah
        </label>
        <input
          id="jumlah"
          className="w-20 border border-line bg-surface px-3 py-2 text-base"
          type="number"
          min={1}
          max={Math.min(10, Math.max(selected.available, 1))}
          value={qty}
          onChange={(event) => setQty(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
        />
      </div>
      <div className="mt-6 hidden gap-3 md:flex">
        <button type="button" className={buttonPrimary} onClick={addToCart} disabled={selected.available < 1}>
          {added ? "Ditambahkan" : "Masukkan keranjang"}
        </button>
        {added ? (
          <Link href="/keranjang" className="inline-flex items-center px-3 text-sm underline underline-offset-4">
            Lihat keranjang
          </Link>
        ) : null}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-ink-soft">{selected.size} · {selected.color}</p>
            <p className="font-medium tabular-nums">{formatIDR(selected.price)}</p>
          </div>
          <button type="button" className={buttonPrimary} onClick={addToCart} disabled={selected.available < 1}>
            {added ? "Ditambahkan" : "Masukkan keranjang"}
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {added ? `${productName} masuk keranjang` : ""}
      </p>
    </div>
  );
}

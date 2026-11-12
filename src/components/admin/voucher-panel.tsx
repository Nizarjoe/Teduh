"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrfCookie } from "@/lib/csrf-client";
import { formatIDR } from "@/lib/money";
import { buttonPrimary, inputClass } from "@/components/styles";

type Row = {
  id: string;
  code: string;
  type: string;
  value: number;
  minSpend: number;
  usedCount: number;
  isActive: boolean;
  firstOrderOnly: boolean;
};

export function VoucherPanel({ vouchers }: { vouchers: Row[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function send(url: string, method: string, body: unknown) {
    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json", "x-csrf-token": readCsrfCookie() },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: { message?: string } };
    if (!response.ok) throw new Error(data.error?.message || "Gagal.");
    router.refresh();
  }

  return (
    <div>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {vouchers.map((voucher) => (
          <li key={voucher.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>
              <span className="font-medium">{voucher.code}</span>
              <span className="mt-1 block text-ink-soft">
                {voucher.type === "percent" ? `${voucher.value}%` : formatIDR(voucher.value)} · min {formatIDR(voucher.minSpend)} · terpakai {voucher.usedCount}
                {voucher.firstOrderOnly ? " · pesanan pertama" : ""}
              </span>
            </span>
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => void send(`/api/admin/voucher/${voucher.id}`, "PATCH", { isActive: !voucher.isActive }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Gagal."))}
            >
              {voucher.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-8 grid max-w-xl gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void send("/api/admin/voucher", "POST", {
            code: String(form.get("code") ?? ""),
            type: String(form.get("type") ?? "fixed"),
            value: Number(form.get("value") ?? 0),
            minSpend: Number(form.get("minSpend") ?? 0),
            firstOrderOnly: form.get("first") === "on",
            isActive: true,
          }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Gagal."));
        }}
      >
        <h2 className="font-serif text-2xl md:col-span-2">Voucher baru</h2>
        <input name="code" placeholder="KODE" className={inputClass} required />
        <select name="type" className={inputClass}>
          <option value="fixed">Nominal</option>
          <option value="percent">Persen</option>
          <option value="shipping">Ongkir</option>
        </select>
        <input name="value" inputMode="numeric" placeholder="Nilai" className={inputClass} required />
        <input name="minSpend" inputMode="numeric" placeholder="Minimum belanja" className={inputClass} defaultValue="0" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="first" /> Hanya pesanan pertama</label>
        <button className={buttonPrimary} type="submit">Simpan voucher</button>
      </form>
      {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
    </div>
  );
}

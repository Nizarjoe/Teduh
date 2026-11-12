"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrfCookie } from "@/lib/csrf-client";
import { statusLabel, type OrderStatus } from "@/lib/order-status";
import { buttonPrimary, inputClass, labelClass } from "@/components/styles";

const allowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_payment: ["cancelled"],
  paid: ["processing", "refunded"],
  processing: ["shipped", "refunded"],
  shipped: ["delivered"],
};

export function OrderEditor({ id, status, resi }: { id: string; status: OrderStatus; resi: string }) {
  const router = useRouter();
  const options = allowed[status] ?? [];
  const [next, setNext] = useState<OrderStatus>(options[0] ?? status);
  const [tracking, setTracking] = useState(resi);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  if (options.length === 0) return <p className="mt-6 text-sm text-ink-soft">Tidak ada perpindahan status dari {statusLabel[status]}.</p>;
  return (
    <form
      className="mt-6 max-w-md space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        try {
          const response = await fetch(`/api/admin/pesanan/${id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json", "x-csrf-token": readCsrfCookie() },
            body: JSON.stringify({ status: next, resi: tracking }),
          });
          const data = (await response.json()) as { error?: { message?: string } };
          if (!response.ok) throw new Error(data.error?.message || "Gagal menyimpan.");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Gagal menyimpan.");
        } finally {
          setPending(false);
        }
      }}
    >
      <p className="text-sm text-ink-soft">Status lunas hanya masuk dari notifikasi Midtrans.</p>
      <label className={labelClass}>Status berikutnya
        <select className={`${inputClass} mt-1`} value={next} onChange={(event) => setNext(event.target.value as OrderStatus)}>
          {options.map((option) => <option key={option} value={option}>{statusLabel[option]}</option>)}
        </select>
      </label>
      <label className={labelClass}>Nomor resi
        <input className={inputClass} value={tracking} onChange={(event) => setTracking(event.target.value)} />
      </label>
      {error ? <p className="text-sm text-clay">{error}</p> : null}
      <button className={buttonPrimary} disabled={pending} type="submit">{pending ? "Menyimpan…" : "Simpan"}</button>
    </form>
  );
}

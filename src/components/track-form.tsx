"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonPrimary, inputClass, labelClass } from "@/components/styles";

export function TrackForm({ initialNumber = "" }: { initialNumber?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="mt-8 max-w-md space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        try {
          const result = await apiPost<{ next: string }>("/api/lacak", {
            orderNumber: String(form.get("orderNumber") ?? ""),
            phone: String(form.get("phone") ?? ""),
          });
          router.push(result.next);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Tidak ditemukan.");
          setPending(false);
        }
      }}
    >
      <div>
        <label className={labelClass} htmlFor="nomor">Nomor pesanan</label>
        <input id="nomor" name="orderNumber" className={inputClass} defaultValue={initialNumber} required />
      </div>
      <div>
        <label className={labelClass} htmlFor="hp">WhatsApp</label>
        <input id="hp" name="phone" className={inputClass} inputMode="tel" required placeholder="08…" />
      </div>
      {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
      <button className={buttonPrimary} type="submit" disabled={pending}>{pending ? "Mencari…" : "Lacak"}</button>
    </form>
  );
}

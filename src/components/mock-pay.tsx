"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonPrimary, buttonSecondary } from "@/components/styles";

export function MockPay({ orderNumber, token }: { orderNumber: string; token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function pay(outcome: "success" | "failure") {
    setPending(true);
    setError("");
    try {
      const result = await apiPost<{ next: string }>("/api/payments/mock", { orderNumber, token, outcome });
      router.push(result.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal.");
      setPending(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="button" className={buttonPrimary} disabled={pending} onClick={() => pay("success")}>
        Konfirmasi pembayaran uji
      </button>
      <button type="button" className={buttonSecondary} disabled={pending} onClick={() => pay("failure")}>
        Simulasikan gagal
      </button>
      {error ? <p className="w-full text-sm text-clay" role="alert">{error}</p> : null}
    </div>
  );
}

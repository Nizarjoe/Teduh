"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonPrimary, inputClass, labelClass } from "@/components/styles";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        try {
          const result = await apiPost<{ next: string }>("/api/admin/masuk", {
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
            next: nextPath,
          });
          router.push(result.next);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Gagal masuk.");
          setPending(false);
        }
      }}
    >
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" className={inputClass} required />
      </div>
      <div>
        <label className={labelClass} htmlFor="sandi">Kata sandi</label>
        <input id="sandi" name="password" type="password" autoComplete="current-password" className={inputClass} required />
      </div>
      {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
      <button className={`${buttonPrimary} w-full`} disabled={pending} type="submit">{pending ? "Masuk…" : "Masuk"}</button>
    </form>
  );
}

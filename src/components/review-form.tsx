"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { buttonSecondary, inputClass, labelClass } from "@/components/styles";

export function ReviewForm({ productId }: { productId: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (done) return <p className="mt-8 text-sm">Ulasan diterima. Tayang setelah diperiksa.</p>;

  return (
    <form
      className="mt-8 max-w-xl space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError("");
        try {
          await apiPost("/api/ulasan", {
            productId,
            authorName: String(form.get("authorName") ?? ""),
            city: String(form.get("city") ?? ""),
            rating: Number(form.get("rating") ?? 0),
            body: String(form.get("body") ?? ""),
            company: String(form.get("company") ?? ""),
          });
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Ulasan gagal dikirim.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h3 className="font-serif text-xl">Tulis ulasan</h3>
      <div className="hidden" aria-hidden>
        <label htmlFor="company">Perusahaan</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label className={labelClass} htmlFor="penulis">Nama</label>
        <input id="penulis" name="authorName" className={inputClass} required />
      </div>
      <div>
        <label className={labelClass} htmlFor="kota-ulasan">Kota</label>
        <input id="kota-ulasan" name="city" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="nilai">Nilai</label>
        <select id="nilai" name="rating" className={inputClass} defaultValue="5">
          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="isi-ulasan">Ulasan</label>
        <textarea id="isi-ulasan" name="body" className={inputClass} rows={4} required minLength={20} />
      </div>
      {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
      <button className={buttonSecondary} type="submit" disabled={pending}>{pending ? "Mengirim…" : "Kirim ulasan"}</button>
    </form>
  );
}

import type { Metadata } from "next";
import { TrackForm } from "@/components/track-form";

export const metadata: Metadata = { title: "Lacak pesanan", robots: { index: false, follow: true } };

export default function TrackPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Lacak pesanan</h1>
      <p className="mt-3 max-w-xl text-ink-soft">Pakai nomor pesanan dan WhatsApp yang diisi saat checkout. Kami tidak menampilkan pesanan orang lain.</p>
      <TrackForm />
    </div>
  );
}

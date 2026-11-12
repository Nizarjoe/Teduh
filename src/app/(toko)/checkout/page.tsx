import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Pembayaran", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Pembayaran</h1>
      <p className="mt-3 max-w-xl text-ink-soft">Tanpa akun. Status lunas baru berubah setelah notifikasi Midtrans terverifikasi di server.</p>
      <CheckoutForm />
    </div>
  );
}

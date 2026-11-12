import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Keranjang", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Keranjang</h1>
      <CartView />
    </div>
  );
}

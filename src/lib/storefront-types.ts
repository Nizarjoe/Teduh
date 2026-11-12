import type { ShipRate } from "@/lib/shipping-quote";

export type QuoteItem = {
  variantId: string;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  available: number;
  image: string | null;
  weightGrams: number;
};

export type QuoteResponse = {
  items: QuoteItem[];
  subtotal: number;
  weightGrams: number;
  rates: ShipRate[] | null;
  shippingSource: "biteship" | "perkiraan" | null;
  shippingCost: number | null;
  discount: number;
  voucher: { ok: true; code: string } | { ok: false; message: string } | null;
  total: number | null;
};

export type CheckoutResult = {
  orderNumber: string;
  mode: "mock" | "snap";
  payToken: string | null;
  snapToken: string | null;
  snapScriptUrl: string | null;
  clientKey: string | null;
};

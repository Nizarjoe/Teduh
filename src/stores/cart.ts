"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  size: string;
  color: string;
  image: string;
  unitPrice: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find((row) => row.variantId === item.variantId);
          if (!existing) return { items: [...state.items, { ...item, qty: Math.min(10, item.qty) }] };
          return {
            items: state.items.map((row) =>
              row.variantId === item.variantId ? { ...row, qty: Math.min(10, row.qty + item.qty) } : row,
            ),
          };
        }),
      setQty: (variantId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((row) => row.variantId !== variantId)
              : state.items.map((row) => (row.variantId === variantId ? { ...row, qty: Math.min(10, qty) } : row)),
        })),
      remove: (variantId) => set((state) => ({ items: state.items.filter((row) => row.variantId !== variantId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "teduh-keranjang",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

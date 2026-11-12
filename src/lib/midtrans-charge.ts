export type ChargeLine = {
  sku: string;
  name: string;
  price: number;
  qty: number;
};

export type ChargeItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function buildChargeItems(input: {
  lines: ChargeLine[];
  shippingCost: number;
  shippingName: string;
  discount: number;
}): ChargeItem[] {
  const items: ChargeItem[] = input.lines.map((line) => ({
    id: line.sku.slice(0, 40),
    name: line.name.slice(0, 50),
    price: line.price,
    quantity: line.qty,
  }));
  if (input.shippingCost > 0) {
    items.push({
      id: "ongkir",
      name: input.shippingName.slice(0, 50),
      price: input.shippingCost,
      quantity: 1,
    });
  }
  if (input.discount > 0) {
    items.push({
      id: "diskon",
      name: "Voucher",
      price: -input.discount,
      quantity: 1,
    });
  }
  return items;
}

export function chargeTotal(items: ChargeItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

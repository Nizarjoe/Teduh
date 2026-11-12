import { createHash } from "node:crypto";

export function midtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
}): string {
  return createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${input.serverKey}`)
    .digest("hex");
}

import { randomBytes } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeOrderNumber(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  const bytes = randomBytes(5);
  let suffix = "";
  for (const byte of bytes) {
    const char = alphabet[byte % alphabet.length];
    if (char) suffix += char;
  }
  return `TDH${pick("year")}${pick("month")}${pick("day")}${suffix}`;
}

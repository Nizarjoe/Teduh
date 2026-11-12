export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  if (!digits.startsWith("62")) return null;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone.startsWith("62")) return phone;
  return `+62 ${phone.slice(2)}`;
}

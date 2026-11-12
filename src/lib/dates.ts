const dateTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDateTime(date: Date): string {
  return dateTime.format(date).replace(/\u00a0/g, " ");
}

export function formatDate(date: Date): string {
  return dateOnly.format(date);
}

export function jakartaDayKey(date: Date): string {
  return dayKey.format(date);
}

export function lastJakartaDays(count: number, now = new Date()): string[] {
  const keys: string[] = [];
  const start = new Date(now.getTime());
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(jakartaDayKey(new Date(start.getTime() - i * 86_400_000)));
  }
  return keys;
}

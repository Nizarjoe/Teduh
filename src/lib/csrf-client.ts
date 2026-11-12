export function readCsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const row = document.cookie.split("; ").find((part) => part.startsWith("teduh_csrf="));
  if (!row) return "";
  return decodeURIComponent(row.slice("teduh_csrf=".length));
}

import { readCsrfCookie } from "@/lib/csrf-client";

export class ApiRequestError extends Error {
  readonly fields?: Record<string, string>;
  readonly status: number;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": readCsrfCookie(),
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T & { error?: { message?: string; fields?: Record<string, string> } };
  if (!response.ok) {
    throw new ApiRequestError(data.error?.message || "Permintaan gagal.", response.status, data.error?.fields);
  }
  return data;
}

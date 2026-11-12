"use client";

import { useRouter } from "next/navigation";
import { readCsrfCookie } from "@/lib/csrf-client";

export function ReviewModeration({
  reviews,
}: {
  reviews: { id: string; authorName: string; city: string | null; rating: number; body: string; status: string; productName: string; sample: string | null }[];
}) {
  const router = useRouter();
  async function setStatus(id: string, status: "approved" | "rejected") {
    await fetch(`/api/admin/ulasan/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-csrf-token": readCsrfCookie() },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }
  return (
    <ul className="mt-6 space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="border border-line p-4 text-sm">
          <p className="text-ink-soft">
            {review.productName} · {review.rating}/5 · {review.status}
            {review.sample ? <span className="ml-2 bg-sand px-1.5 py-0.5 text-ink">Data contoh</span> : null}
          </p>
          <p className="mt-2">{review.body}</p>
          <p className="mt-2 text-ink-soft">{review.authorName}{review.city ? `, ${review.city}` : ""}</p>
          {review.status === "pending" ? (
            <div className="mt-3 flex gap-3">
              <button type="button" className="underline" onClick={() => void setStatus(review.id, "approved")}>Tayangkan</button>
              <button type="button" className="underline" onClick={() => void setStatus(review.id, "rejected")}>Tolak</button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

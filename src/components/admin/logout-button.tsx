"use client";

import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="underline underline-offset-4"
      onClick={async () => {
        await apiPost("/api/admin/keluar", {});
        router.push("/admin/masuk");
        router.refresh();
      }}
    >
      Keluar
    </button>
  );
}

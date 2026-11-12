import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { getAdmin } from "@/lib/auth";
import { isMockPayments } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/masuk");
  return (
    <AdminShell name={admin.name} mock={isMockPayments()}>
      {children}
    </AdminShell>
  );
}

import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";

const links = [
  ["/admin", "Ringkasan"],
  ["/admin/produk", "Produk"],
  ["/admin/pesanan", "Pesanan"],
  ["/admin/voucher", "Voucher"],
  ["/admin/ulasan", "Ulasan"],
] as const;

export function AdminShell({
  name,
  mock,
  children,
}: {
  name: string;
  mock: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/admin" className="font-serif text-2xl">Teduh</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-ink-soft">{name}</span>
            <LogoutButton />
          </div>
        </div>
        <nav aria-label="Admin" className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-5 pb-3 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="shrink-0 border-b border-transparent py-1 hover:border-ink">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      {mock ? (
        <p className="bg-sand px-5 py-2 text-center text-sm">Pembayaran uji aktif. Jangan dipakai untuk uang sungguhan.</p>
      ) : null}
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}

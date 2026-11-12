import Link from "next/link";
import { formatPhoneDisplay } from "@/lib/phone";
import { store } from "@/data/store";

const columns = [
  {
    title: "Belanja",
    links: [
      ["/katalog", "Katalog"],
      ["/panduan-ukuran", "Panduan ukuran"],
      ["/lacak", "Lacak pesanan"],
      ["/tentang", "Tentang Teduh"],
    ],
  },
  {
    title: "Ketentuan",
    links: [
      ["/syarat-ketentuan", "Syarat dan ketentuan"],
      ["/kebijakan-privasi", "Kebijakan privasi"],
      ["/kebijakan-retur", "Garansi dan retur"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl">Teduh</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            {store.address}. {store.hours}.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            <a className="underline underline-offset-4" href={`mailto:${store.email}`}>
              {store.email}
            </a>
            <span> · {formatPhoneDisplay(store.whatsapp)}</span>
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">{column.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-rain">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-page px-5 py-4 text-xs leading-relaxed text-ink-soft">
          Pembayaran lewat Midtrans: QRIS, virtual account, GoPay, ShopeePay, dan kartu. Harga coret adalah harga
          pembanding yang kami catat sendiri, biasanya etalase marketplace, bukan harga yang ditarik otomatis.
        </p>
      </div>
    </footer>
  );
}

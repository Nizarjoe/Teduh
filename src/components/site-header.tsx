import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { MobileNav } from "@/components/mobile-nav";

const links = [
  { href: "/katalog", label: "Katalog" },
  { href: "/katalog?kategori=setelan", label: "Setelan" },
  { href: "/katalog?kategori=ponco", label: "Ponco" },
  { href: "/katalog?kategori=ojol", label: "Ojol" },
  { href: "/katalog?kategori=anak", label: "Anak" },
  { href: "/lacak", label: "Lacak" },
];

export function SiteHeader() {
  return (
    <header className="relative border-b border-line bg-paper">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl leading-none">Teduh</span>
          <span className="hidden text-[11px] uppercase tracking-[0.16em] text-ink-soft sm:inline">Jas hujan</span>
        </Link>
        <nav aria-label="Utama" className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-ink hover:text-rain">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <CartLink />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}

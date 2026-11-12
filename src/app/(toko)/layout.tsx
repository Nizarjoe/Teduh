import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2">
        Langsung ke isi
      </a>
      <div className="bg-rain text-paper">
        <p className="mx-auto max-w-page px-5 py-2 text-center text-xs tracking-wide md:text-sm">
          Belanja langsung di sini. Harga barang tanpa komisi marketplace.
        </p>
      </div>
      <SiteHeader />
      <main id="isi" className="mx-auto min-h-[60vh] max-w-page px-5 pb-24 pt-8 md:pb-16 md:pt-12">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}

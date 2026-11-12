import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { buttonPrimary, buttonSecondary } from "@/components/styles";
import { store } from "@/data/store";
import { homeData } from "@/db/queries";

export const revalidate = 60;

const materials = [
  { title: "PVC", body: "Untuk hujan deras dan genangan. Tidak bernapas, mudah dilap, lebih kaku." },
  { title: "Taslan laminasi", body: "Lebih ringan untuk perjalanan yang lebih lama. Tetap tidak untuk berendam." },
  { title: "Rubbery", body: "Lentur, untuk ponco yang sering dilipat masuk tas." },
];

export default async function HomePage() {
  const data = await homeData();
  const hero = data.best[0];
  return (
    <div>
      <section className="grid items-end gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6 md:pb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-rain">Jas hujan · Jakarta</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl">Kering sampai rumah.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Setelan, ponco, dan jas ojol yang bisa dipesan tanpa akun marketplace. Harga di situs ini tidak menyertakan komisi platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={buttonPrimary} href="/katalog">Lihat katalog</Link>
            <Link className={buttonSecondary} href="/katalog?kategori=setelan">Setelan</Link>
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="aspect-[4/5] bg-mist">
            {hero?.imageUrl ? (
              <ProductImage src={hero.imageUrl} alt={hero.imageAlt ?? ""} priority sizes="(max-width: 768px) 100vw, 50vw" />
            ) : null}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            {hero ? `${hero.name}. Gambar di katalog masih tempat foto, siap diganti berkas asli.` : "Foto produk menyusul."}
          </p>
        </div>
      </section>

      <ul className="mt-10 grid gap-3 border-y border-line py-4 text-sm md:grid-cols-3">
        <li>Garansi jahitan 30 hari</li>
        <li>Checkout tanpa membuat akun</li>
        <li>Ongkir dipilih per kurir</li>
      </ul>

      <section className="mt-16">
        <h2 className="font-serif text-3xl">Kategori</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
          {data.categories.map((category) => (
            <Link key={category.id} href={`/katalog?kategori=${category.slug}`} className="w-40 shrink-0 md:w-auto">
              <div className="aspect-[4/5] bg-mist">
                {category.image ? <ProductImage src={category.image.url} alt="" sizes="200px" /> : null}
              </div>
              <p className="mt-3 font-serif text-xl">{category.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl">Paling sering dipesan</h2>
          <Link href="/katalog?urut=terlaris" className="text-sm underline underline-offset-4">Semua</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {data.best.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-20 bg-rain px-6 py-10 text-paper md:px-10">
        <h2 className="max-w-xl font-serif text-3xl leading-tight md:text-4xl">Lebih hemat belanja langsung di sini.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-mist">
          Komisi marketplace untuk fesyen biasanya dipotong dari harga barang, ditambah biaya layanan. Di {store.name} potongan itu tidak ada, jadi harga barangnya kami turunkan.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-2 font-medium"> </th>
                <th className="py-2 font-medium">Marketplace</th>
                <th className="py-2 font-medium">Teduh</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/15">
                <th className="py-3 pr-4 font-medium">Harga barang</th>
                <td className="py-3 pr-4">Ada komisi platform</td>
                <td className="py-3">Tanpa komisi itu</td>
              </tr>
              <tr className="border-b border-white/15">
                <th className="py-3 pr-4 font-medium">Akun</th>
                <td className="py-3 pr-4">Akun platform</td>
                <td className="py-3">Nama dan WhatsApp cukup</td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-medium">Status bayar</th>
                <td className="py-3 pr-4">Di aplikasi mereka</td>
                <td className="py-3">Notifikasi Midtrans ke server kami</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        {materials.map((item) => (
          <div key={item.title} className="border-t border-line pt-4">
            <h2 className="font-serif text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-4">
        <div>
          <h2 className="font-serif text-2xl">Ulasan</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {data.reviewAverage != null
              ? `${data.reviewAverage.toLocaleString("id-ID")} dari 5, dari ${data.reviewCount} ulasan yang sudah diperiksa.`
              : "Ulasan tayang setelah diperiksa."}{" "}
            Kami tidak membeli ulasan.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Pembayaran</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">QRIS, virtual account, e-wallet, dan kartu lewat Midtrans. Status lunas masuk dari notifikasi server.</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Garansi</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">Jahitan yang mengelupas dalam 30 hari kami ganti atau kembalikan dana barang. Syaratnya di halaman retur.</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">WhatsApp</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{store.hours}. Di luar jam itu, pesan tetap kami baca besok.</p>
        </div>
      </section>

      {data.quotes.length > 0 ? (
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {data.quotes.map((quote) => (
            <blockquote key={quote.id} className="border-t border-line pt-4">
              <p className="leading-relaxed">“{quote.body}”</p>
              <footer className="mt-3 text-sm text-ink-soft">
                {quote.authorName}{quote.city ? `, ${quote.city}` : ""} · {quote.productName} · {quote.rating}/5
              </footer>
            </blockquote>
          ))}
        </section>
      ) : null}
    </div>
  );
}

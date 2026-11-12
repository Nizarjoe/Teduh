import type { Metadata } from "next";
import { Prose } from "@/components/prose";
import { store } from "@/data/store";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Teduh menjual jas hujan langsung dari gudang, tanpa komisi marketplace.",
};

export default function AboutPage() {
  return (
    <Prose title="Tempat berlindung, bukan etalase yang berteriak." lede="Teduh adalah toko jas hujan yang menjual langsung. Kami mulai dari pesanan WhatsApp, lalu membuat situs ini supaya pembeli tidak perlu lewat marketplace.">
      <p>Nama Teduh artinya tempat berlindung. Bahan yang kami jual dipilih untuk hujan kota dan perjalanan motor, bukan untuk ekspedisi.</p>
      <p>Gudang contoh: {store.address}. Ganti alamat ini lewat variabel lingkungan sebelum toko tayang.</p>
      <p>Jam balas chat: {store.hours}.</p>
    </Prose>
  );
}

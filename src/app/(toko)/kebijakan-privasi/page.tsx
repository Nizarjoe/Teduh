import type { Metadata } from "next";
import { Prose } from "@/components/prose";
import { store } from "@/data/store";

export const metadata: Metadata = { title: "Kebijakan privasi" };

export default function PrivacyPage() {
  return (
    <Prose title="Kebijakan privasi" lede="Kami hanya menyimpan data yang dipakai untuk mengirim pesanan dan membalas chat.">
      <h2>Data yang dikumpulkan</h2>
      <ul>
        <li>Nama, nomor WhatsApp, alamat, dan isi pesanan.</li>
        <li>Email, jika kamu mengisinya.</li>
        <li>Ulasan yang kamu kirim.</li>
        <li>Untuk admin: email dan kata sandi yang disimpan dalam bentuk hash.</li>
      </ul>
      <h2>Siapa yang menerima data</h2>
      <p>Midtrans memproses pembayaran. Kami tidak menyimpan nomor kartu. Kurir, lewat Biteship jika diaktifkan, menerima nama, telepon, dan alamat untuk pengiriman.</p>
      <h2>Cookie</h2>
      <p>Cookie keranjang ada di peramban. Cookie sesi admin dan cookie lacak pesanan bersifat httpOnly. Cookie csrf dipakai untuk menolak permintaan dari situs lain. Analitik hanya dimuat jika ID GA4 atau Meta Pixel diisi.</p>
      <h2>Hak kamu</h2>
      <p>Untuk memperbaiki atau menghapus data pesanan, chat WhatsApp {store.email}. Kami menyimpan pesanan selama dibutuhkan untuk pembukuan dan garansi.</p>
    </Prose>
  );
}

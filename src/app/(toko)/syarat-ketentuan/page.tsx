import type { Metadata } from "next";
import { Prose } from "@/components/prose";
import { store } from "@/data/store";

export const metadata: Metadata = { title: "Syarat dan ketentuan" };

export default function TermsPage() {
  return (
    <Prose title="Syarat dan ketentuan" lede={`Berlaku untuk pembelian di situs ${store.legalName}.`}>
      <h2>Pemesanan</h2>
      <p>Pesanan terbentuk saat kamu menekan buat pesanan dan sistem menyimpan data pesanan. Kamu tidak wajib membuat akun. Kontrak jual beli ada antara kamu dan {store.legalName}, {store.address}.</p>
      <h2>Harga dan ongkir</h2>
      <p>Harga barang dalam rupiah dan belum termasuk ongkir. Ongkir mengikuti kurir yang kamu pilih. Jika kunci Biteship belum diisi, tarif yang tampil adalah perkiraan dan bisa berbeda dari tagihan kurir.</p>
      <h2>Pembayaran</h2>
      <p>Pembayaran diproses Midtrans. Kami tidak menyimpan nomor kartu. Pesanan menjadi lunas hanya setelah notifikasi Midtrans terverifikasi di server kami, bukan dari halaman yang terlihat di peramban.</p>
      <h2>Stok</h2>
      <p>Stok ditahan 30 menit sejak pesanan dibuat. Jika pembayaran tidak masuk, tahanannya dilepas dan pesanan kedaluwarsa.</p>
      <h2>Hukum</h2>
      <p>Syarat ini mengikuti hukum Indonesia. Sengketa diupayakan lewat WhatsApp toko lebih dulu.</p>
    </Prose>
  );
}

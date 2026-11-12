import type { Metadata } from "next";
import { Prose } from "@/components/prose";
import { store } from "@/data/store";

export const metadata: Metadata = { title: "Garansi dan retur" };

export default function ReturnPage() {
  return (
    <Prose title="Garansi dan retur" lede="Jahitan yang mengelupas dalam 30 hari sejak barang diterima bisa diganti atau dana barangnya dikembalikan.">
      <h2>Yang ditanggung</h2>
      <ul>
        <li>Jahitan terbuka atau pita press yang lepas pada pemakaian wajar.</li>
        <li>Barang yang datang sobek atau tidak sesuai varian yang dipesan.</li>
      </ul>
      <h2>Yang tidak ditanggung</h2>
      <ul>
        <li>Sobek karena terseret aspal, terkena knalpot, atau dipotong.</li>
        <li>Salah ukuran kalau panduan di halaman produk tidak diikuti. Tukar ukuran satu kali masih bisa jika barang belum dipakai di luar dan labelnya utuh. Ongkir tukar ditanggung pembeli.</li>
      </ul>
      <h2>Cara klaim</h2>
      <p>Kirim nomor pesanan, foto kerusakan, dan video singkat ke WhatsApp toko dalam 30 hari. Dana kembali lewat kanal Midtrans ke metode asal, setelah barang sampai kembali jika kami memintanya. Ongkir retur karena cacat produksi kami yang tanggung. Alamat kirim: {store.address}.</p>
    </Prose>
  );
}

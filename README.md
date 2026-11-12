# Teduh

Toko jas hujan satu merek. Pembeli memesan langsung di situs ini, tanpa komisi marketplace. Antarmuka berbahasa Indonesia, harga dalam rupiah, waktu Asia/Jakarta.

## Yang perlu terpasang

- Node.js 22
- PostgreSQL 16
- Redis bersifat opsional

## Menjalankan di mesin sendiri

```bash
cp .env.example .env
```

Ubah `SESSION_SECRET` menjadi string acak minimal 32 karakter. Jangan biarkan kalimat contoh.

Dengan Docker:

```bash
docker compose up -d db
npm install
npm run db:setup
npm run dev
```

`db:setup` menjalankan migrasi lalu data contoh. Tanpa Docker, buat database `teduh` lalu isi `DATABASE_URL`.

Admin contoh setelah seed:

- email `admin@teduh.id`
- kata sandi `teduh-admin`

Ganti keduanya sebelum toko menerima pembeli sungguhan. Seed menolak kata sandi bawaan jika `NODE_ENV=production`.

Buka [http://localhost:3000](http://localhost:3000).

## Variabel lingkungan

Lihat `.env.example`. Ringkasnya:

| Variabel | Fungsi |
| --- | --- |
| `DATABASE_URL` | Postgres |
| `DATABASE_SSL` | `true` untuk Postgres terkelola yang memakai SSL |
| `SESSION_SECRET` | Rahasia cookie admin dan lacak pesanan |
| `APP_URL` | URL publik, dipakai callback Midtrans dan SEO |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` | Kunci Midtrans |
| `MIDTRANS_IS_PRODUCTION` | `false` sandbox, `true` produksi |
| `MIDTRANS_ALLOW_MOCK` | Pembayaran tiruan. Hanya boleh di localhost |
| `BITESHIP_API_KEY` | Kosong = tarif perkiraan. Terisi = tarif Biteship |
| `ORIGIN_POSTAL_CODE` | Kode pos gudang asal |
| `REDIS_URL` | Opsional. Jika kosong atau Redis mati, pembatas permintaan memakai memori proses |
| `S3_*` | Opsional. Jika tidak lengkap, unggahan admin masuk `storage/uploads` |
| `CRON_SECRET` | Untuk `POST /api/cron/reservasi` |
| `MIGRATE_ON_BOOT` | `true` di Docker agar migrasi jalan saat proses mulai |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Kosongkan untuk mematikan GA4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | Kosongkan untuk mematikan Meta Pixel |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Nomor WhatsApp, format 62 |
| `NEXT_PUBLIC_STORE_*` | Nama hukum, alamat, email yang tampil di situs |

Nilai `NEXT_PUBLIC_*` dibaca saat build. Setelah mengubahnya, build ulang.

## Migrasi dan seed

```bash
npm run db:migrate
npm run db:seed
```

Berkas SQL ada di `drizzle/`. Seed mengisi kategori, sepuluh produk, voucher `TEDUH10`, `PERTAMA`, dan `ONGKIR20`, serta tiga pesanan contoh. Seed juga menimpa stok katalog ke angka demo. Jangan jalankan seed di database produksi yang sudah berisi pesanan sungguhan.

Ulasan di seed adalah **data contoh**, bukan pembeli. Di admin ulasan itu bertanda “Data contoh”, dan etalase menulis hal yang sama. Hapus semuanya sebelum toko tayang:

```bash
npm run db:clear-sample-reviews
```

Perintah itu hanya menghapus baris dengan `seed_key`. Ulasan yang dikirim pembeli tidak ikut terhapus. Menjalankan `npm run db:seed` lagi akan memasukkan ulasan contoh kembali.

Gambar di `public/products/` bertuliskan tempat foto. Ganti berkasnya, atau unggah foto dari admin. Nama berkas di data seed bisa diubah di `src/data/catalog-seed.ts`, lalu jalankan `npm run placeholders` jika ingin menggambar ulang SVG.

Wilayah checkout ada di `src/data/regions.ts`: 38 provinsi dan kota besar. Tambah kecamatan di berkas itu bila perlu.

## Midtrans

Mode bawaan memakai kunci placeholder dan `MIDTRANS_ALLOW_MOCK=true`. Checkout menampilkan halaman uji. Tombol di halaman itu mengirim notifikasi bertanda tangan ke jalur yang sama dengan webhook sungguhan. Status pesanan tidak pernah diambil dari halaman pembeli.

Sandbox sungguhan:

1. Buat akun sandbox di dashboard Midtrans.
2. Isi `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY`.
3. Set `MIDTRANS_ALLOW_MOCK=false` dan `MIDTRANS_IS_PRODUCTION=false`.
4. Di dashboard, arahkan notification URL ke `https://domain-kamu/api/webhooks/midtrans`.

Produksi hanya beda env: `MIDTRANS_IS_PRODUCTION=true`, kunci produksi, dan `MIDTRANS_ALLOW_MOCK=false`. Aplikasi menolak boot jika mock menyala di luar localhost atau jika kunci produksi masih placeholder.

Metode yang diminta ke Snap: QRIS, GoPay, ShopeePay, VA BCA/BNI/BRI/Permata, VA lain, dan kartu.

## Biteship

Tanpa `BITESHIP_API_KEY`, ongkir adalah perkiraan lokal dan halaman checkout mengatakan itu. Dengan kunci, server memanggil `POST /v1/rates/couriers` di `BITESHIP_BASE_URL` (bawaan `https://api.biteship.com/v1`) memakai header `Authorization` berisi kunci API. Nomor resi diisi admin saat status berubah menjadi dikirim. Pemesanan penjemputan tetap dilakukan dari dashboard Biteship bila kamu memakai alur itu.

## Uji

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm test` membutuhkan database yang sudah dimigrasi. Playwright menjalankan `next start`, jadi build dulu.

## Deploy

### Vercel + Postgres terkelola

1. Buat Postgres, salin `DATABASE_URL`, set `DATABASE_SSL=true` bila penyedia memintanya.
2. Isi env produksi di Vercel, termasuk `APP_URL` domain sungguhan.
3. Perintah build: `npm run db:migrate && npm run build`.
4. Jangan set `MIDTRANS_ALLOW_MOCK=true`.
5. Untuk foto yang bertahan, isi kredensial S3 atau R2. Disk Vercel tidak menyimpan unggahan.

### Docker di VPS

```bash
docker compose up -d --build
```

Layanan `app` menjalankan migrasi karena `MIGRATE_ON_BOOT=true`. Seed tetap dijalankan manual dari mesin yang punya repo:

```bash
DATABASE_URL=postgresql://teduh:teduh@localhost:5432/teduh npm run db:seed
```

Pasang volume `storage/uploads` bila tidak memakai S3. Taruh reverse proxy TLS di depan port 3000. Cookie aman menyala saat permintaan datang lewat HTTPS (`x-forwarded-proto`).

Lepas reservasi yang kedaluwarsa juga terjadi saat checkout dan saat halaman lacak dibuka. Untuk menyapu tanpa trafik, panggil:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://domain-kamu/api/cron/reservasi
```

## Daftar periksa sebelum tayang

- [ ] Kunci Midtrans produksi, `MIDTRANS_IS_PRODUCTION=true`, `MIDTRANS_ALLOW_MOCK=false`
- [ ] Notification URL Midtrans mengarah ke `/api/webhooks/midtrans`
- [ ] Kunci Biteship produksi dan kode pos gudang yang benar
- [ ] `SESSION_SECRET` acak, kata sandi admin diganti, seed tidak dijalankan ulang
- [ ] Foto produk asli menggantikan SVG bertuliskan tempat foto
- [ ] `NEXT_PUBLIC_STORE_LEGAL_NAME`, alamat, email, dan WhatsApp adalah data toko yang sah
- [ ] Domain dan `APP_URL` sudah HTTPS
- [ ] Halaman syarat, privasi, dan retur dibaca ulang (ini kerangka, bukan nasihat hukum)
- [ ] Ulasan contoh sudah dihapus dengan `npm run db:clear-sample-reviews` (admin tidak lagi menampilkan tanda “Data contoh”)
- [ ] GA4 dan Meta Pixel diisi hanya jika kamu memang memakainya, lalu build ulang

## Struktur singkat

- `src/app/(toko)` etalase
- `src/app/admin` dasbor
- `src/app/api` checkout, ongkir lewat quote, webhook, admin
- `src/db` skema Drizzle dan migrasi
- `src/lib` pembayaran, stok, ongkir, voucher, auth

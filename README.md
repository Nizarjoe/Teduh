# TEDUH — Extrime Store

Toko online wireframe **production-ready** (konsep clone gmaproductseries.com, produk "Teduh by EXTRIME") — Node.js murni tanpa dependensi, data server-side, sinkron penuh admin ↔ customer.

## Menjalankan

```bash
node server.js          # port 8100
# Customer: http://localhost:8100
# Admin:    http://localhost:8100/admin
```

## Login Admin (hardcoded di `public/admin.html`)

| Role | Username | Akses |
|---|---|---|
| Superadmin | `superadmin` | Semua |
| Admin | `admin` | Semua |
| Staff | `staff` | Menu Promo/Pelanggan/Pengaturan/Media disembunyikan, tidak bisa upload foto |

> ⚠️ Ganti password di `public/admin.html` (fungsi `doLogin`) sebelum deploy produksi beneran.

## Arsitektur

- **`server.js`** (~90 lines, node http murni):
  - Static serve `public/` (`/admin` → `admin.html`)
  - `POST /api/upload?where=produk|customer` — upload gambar binary, validasi **magic-byte** (PNG/JPG/WEBP/GIF/SVG), maks 5 MB, disimpan `uploads/up_*`, dilayani `/uploads/*`
  - `GET/POST /api/uploads`, `POST /api/uploads/delete`
  - `GET/POST /api/data` — store utama (`data/store.json`): orders, products, content, settings
  - `POST /api/order` — order baru, nomor otomatis `EXT-xxxxxx`
  - `POST /api/pay/token` — Midtrans Snap bila server key terisi; tanpa key → fallback manual (QRIS toko → transfer bank → COD)
- **`public/index.html`** — toko customer wireframe: home, koleksi + filter, search nyata, halaman produk (gallery multi-foto), keranjang, checkout (kupon, ongkir gratis ≥500K, QRIS/bank/gateway/COD)
- **`public/admin.html`** — dashboard admin wireframe: Dashboard (KPI + grafik 7 hari real), Pesanan (lifecycle status + pembayaran), Produk (CRUD + multi-foto maks 6 + preview ala customer), Promo (kupon real + announcement), Pelanggan, Laporan/Keuangan (sinkron status bayar: Belum Bayar → Bukti Masuk → Verifikasi Lunas/Gagal; omzet hanya dari Lunas) + laporan WA ke owner, Pengaturan (payment gateway + banner/foto konten), Media & Foto

## Data

- `data/store.json` — dibuat otomatis. Orders awal kosong (dashboard murni real, tanpa dummy).
- Semua aksi admin `pushToServer`, customer `fetch /api/data` saat load → sinkron dua arah.
- `uploads/` + `_meta.json`.

## Kupon

Di menu Promo admin: buat (kode, %diskon, min. belanja), toggle aktif/nonaktif (langsung berlaku di toko), hapus. Customer memakai kupon di checkout dengan validasi aktif + min. belanja.

## Catatan Agent Lain (TODO / lanjutan)

1. **Midtrans**: isi Server Key + Client Key di Pengaturan admin → `/api/pay/token` otomatis pakai Snap; `clientFallback` toggle mengatur fallback manual saat gateway gagal.
2. **Laporan WA owner**: nomor di Pengaturan (`settings.waOwner`); laporan di-generate real dari orders (fungsi `waReport`).
3. **Password hardcoded** → idealnya dipindah ke env/server-side.
4. Data masih JSON file — kalau trafik naik, pindah ke SQLite/Postgres.
5. Cloudflare tunnel: `cloudflared tunnel --url http://localhost:8100` (ephemeral).

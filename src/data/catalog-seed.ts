import type { MaterialType } from "@/data/materials";
import type { SizeChartKey } from "@/data/size-charts";

export type SeedVariant = {
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  weightGrams: number;
};

export type SeedProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  materialType: MaterialType;
  materialNote: string;
  waterproofNote: string;
  careNote: string;
  sizeChart: SizeChartKey;
  weightGrams: number;
  isBestSeller: boolean;
  images: { file: string; alt: string; hex: string; view: "depan" | "detail" }[];
  variants: SeedVariant[];
};

export const seedCategories = [
  { slug: "setelan", name: "Setelan", description: "Jaket dan celana. Untuk hujan yang merata seharian.", sortOrder: 1 },
  { slug: "ponco", name: "Ponco", description: "Satu lembar longgar. Cepat dikenakan, mudah dilipat.", sortOrder: 2 },
  { slug: "ojol", name: "Jas ojol", description: "Lebih panjang di kaki, dengan pita reflektif.", sortOrder: 3 },
  { slug: "anak", name: "Anak", description: "Ukuran sekolah, mulai tinggi 100 cm.", sortOrder: 4 },
  { slug: "aksesoris", name: "Aksesoris", description: "Cover sepatu dan cover tas.", sortOrder: 5 },
] as const;

const pinus = { name: "Hijau Pinus", hex: "#234840", code: "PINUS" };
const hitam = { name: "Hitam", hex: "#1C1C1C", code: "HITAM" };
const kuning = { name: "Kuning Sinyal", hex: "#D6A62E", code: "KUNING" };
const abu = { name: "Abu Hujan", hex: "#5C6560", code: "ABU" };
const laut = { name: "Biru Laut", hex: "#24344C", code: "LAUT" };
const tanah = { name: "Cokelat Tanah", hex: "#6A4630", code: "TANAH" };
const oranye = { name: "Oranye Jalan", hex: "#E07A2F", code: "ORANYE" };
const bata = { name: "Merah Bata", hex: "#8C3030", code: "BATA" };
const seragam = { name: "Biru Seragam", hex: "#2A4468", code: "SERAGAM" };

function variants(input: {
  prefix: string;
  sizes: { label: string; code: string }[];
  colors: { name: string; hex: string; code: string }[];
  price: number;
  compare: number;
  weight: number;
  stock?: (size: string, color: string) => number;
}): SeedVariant[] {
  const stockOf = input.stock ?? ((size: string) => (size === "XXL" ? 10 : 24));
  const rows: SeedVariant[] = [];
  for (const size of input.sizes) {
    for (const color of input.colors) {
      rows.push({
        sku: `${input.prefix}-${size.code}-${color.code}`,
        size: size.label,
        color: color.name,
        colorHex: color.hex,
        price: input.price,
        compareAtPrice: input.compare,
        stock: stockOf(size.label, color.name),
        weightGrams: input.weight,
      });
    }
  }
  return rows;
}

const dewasa = [
  { label: "M", code: "M" },
  { label: "L", code: "L" },
  { label: "XL", code: "XL" },
  { label: "XXL", code: "XXL" },
];
const ojolSizes = [
  { label: "L", code: "L" },
  { label: "XL", code: "XL" },
  { label: "XXL", code: "XXL" },
];
const poncoSizes = [
  { label: "Regular", code: "REG" },
  { label: "Long", code: "LONG" },
];
const anakSizes = [
  { label: "4-6", code: "46" },
  { label: "7-9", code: "79" },
  { label: "10-12", code: "1012" },
];

function photos(slug: string, name: string, hex: string): SeedProduct["images"] {
  return [
    { file: `${slug}-depan.svg`, alt: `Gambar sementara ${name}, tampak depan. Ganti dengan foto produk.`, hex, view: "depan" },
    { file: `${slug}-detail.svg`, alt: `Gambar sementara detail jahitan ${name}. Ganti dengan foto produk.`, hex, view: "detail" },
  ];
}

export const seedProducts: SeedProduct[] = [
  {
    slug: "setelan-deras",
    name: "Setelan Deras",
    categorySlug: "setelan",
    description:
      "Setelan Deras memakai PVC 0,18 mm dengan jahitan yang dipress, bukan hanya dijahit. Jaketnya turun sampai paha. Celana berkaret di pinggang dan di ujung kaki.\n\nPakai ini untuk hujan yang tidak reda: antar jemput, jaga kios, atau motor jarak pendek. Bahannya tidak bernapas, jadi untuk perjalanan yang lebih lama Setelan Komuter biasanya lebih nyaman.",
    materialType: "pvc",
    materialNote: "PVC 0,18 mm. Permukaan licin dan mudah dilap.",
    waterproofNote: "Tahan rintik sampai hujan deras. Jahitan dipress.",
    careNote: "Lap dengan kain basah. Jangan disetrika. Jemur di tempat teduh, jangan dilipat rapat saat masih basah.",
    sizeChart: "dewasa",
    weightGrams: 480,
    isBestSeller: true,
    images: photos("setelan-deras", "Setelan Deras", pinus.hex),
    variants: variants({
      prefix: "DERAS",
      sizes: dewasa,
      colors: [pinus, hitam, kuning],
      price: 189_000,
      compare: 229_000,
      weight: 480,
      stock: (size, color) => {
        if (size === "XXL" && color === "Kuning Sinyal") return 3;
        if (size === "XXL") return 10;
        return 28;
      },
    }),
  },
  {
    slug: "setelan-komuter",
    name: "Setelan Komuter",
    categorySlug: "setelan",
    description:
      "Taslan yang dilaminasi, lebih ringan, dan bisa dilipat kecil di tas. Jahitannya dilapisi pita tahan air.\n\nCocok untuk berangkat kerja saat langit mendung. Kalau genangan sudah setinggi betis, Setelan Deras masih lebih rapat.",
    materialType: "taslan",
    materialNote: "Taslan dilaminasi. Lebih lembut daripada PVC dan tidak terlalu kaku saat dilipat.",
    waterproofNote: "Tahan hujan sedang sampai deras. Bukan untuk berendam.",
    careNote: "Bilas lumpur dengan air, lap, lalu gantung. Jangan diperas.",
    sizeChart: "dewasa",
    weightGrams: 340,
    isBestSeller: false,
    images: photos("setelan-komuter", "Setelan Komuter", hitam.hex),
    variants: variants({
      prefix: "KOMUTER",
      sizes: dewasa,
      colors: [hitam, abu, laut],
      price: 159_000,
      compare: 189_000,
      weight: 340,
    }),
  },
  {
    slug: "ponco-rimba",
    name: "Ponco Rimba",
    categorySlug: "ponco",
    description:
      "Satu lembar dengan tudung lebar. Tidak ada lengan terpisah, jadi cepat dikenakan di atas jaket atau seragam.\n\nUntuk berjalan kaki dan naik angkot. Ini bukan ponco motor: kaki tetap terbuka jika dipakai di atas deck motor.",
    materialType: "rubbery",
    materialNote: "Rubbery lentur. Lebih mudah dilipat daripada PVC kaku.",
    waterproofNote: "Menutup badan dari bahu sampai lutut pada ukuran regular.",
    careNote: "Cuci dengan air, jemur terbuka. Jangan disimpan basah di dalam tas semalaman.",
    sizeChart: "ponco",
    weightGrams: 360,
    isBestSeller: false,
    images: photos("ponco-rimba", "Ponco Rimba", pinus.hex),
    variants: variants({
      prefix: "RIMBA",
      sizes: poncoSizes,
      colors: [pinus, tanah],
      price: 129_000,
      compare: 155_000,
      weight: 360,
    }),
  },
  {
    slug: "ponco-motor",
    name: "Ponco Motor",
    categorySlug: "ponco",
    description:
      "Lebih panjang ke depan supaya menutupi kaki di atas deck motor. Ada tali di bagian dalam agar tidak tersingkap angin.\n\nTudung tetap membatasi pandangan ke samping. Lihat bahu sebelum belok, sama seperti ponco lain.",
    materialType: "pvc",
    materialNote: "PVC dengan tali dalam di sisi kiri dan kanan.",
    waterproofNote: "Menutup dada sampai betis pada ukuran long.",
    careNote: "Lap dan gantung. Jangan dilipat selagi air masih menggenang di lipatan.",
    sizeChart: "ponco",
    weightGrams: 420,
    isBestSeller: false,
    images: photos("ponco-motor", "Ponco Motor", hitam.hex),
    variants: variants({
      prefix: "MOTOR",
      sizes: poncoSizes,
      colors: [hitam, kuning],
      price: 149_000,
      compare: 179_000,
      weight: 420,
    }),
  },
  {
    slug: "ojol-shift",
    name: "Jas Ojol Shift",
    categorySlug: "ojol",
    description:
      "Potongan lebih panjang di betis, dengan pita reflektif di dada dan betis. Saku dalam cukup untuk ponsel.\n\nWarna kuning dan oranye dipilih supaya terlihat di hujan sore. Kalau shift-mu lebih sering malam dan kamu tidak ingin warna menyala, lihat Jas Ojol Malam.",
    materialType: "pvc",
    materialNote: "PVC dengan pita reflektif yang dijahit, bukan stiker.",
    waterproofNote: "Untuk hujan sepanjang shift. Saku dalam berada di balik lapisan luar.",
    careNote: "Lap pita reflektif pelan-pelan. Jangan digosok dengan sabun abrasi.",
    sizeChart: "dewasa",
    weightGrams: 500,
    isBestSeller: true,
    images: photos("ojol-shift", "Jas Ojol Shift", kuning.hex),
    variants: variants({
      prefix: "SHIFT",
      sizes: ojolSizes,
      colors: [kuning, oranye],
      price: 175_000,
      compare: 210_000,
      weight: 500,
    }),
  },
  {
    slug: "ojol-malam",
    name: "Jas Ojol Malam",
    categorySlug: "ojol",
    description:
      "Hitam dengan pita reflektif, bukan warna neon. Bahan taslan dilaminasi supaya tidak sekaku PVC saat shift panjang.\n\nPita reflektif hanya bekerja jika ada cahaya yang mengenainya. Di gang tanpa lampu kendaraan, kamu tetap perlu pelan-pelan.",
    materialType: "taslan",
    materialNote: "Taslan laminasi, pita reflektif di dada, lengan, dan betis.",
    waterproofNote: "Tahan hujan deras. Lebih nyaman dipakai berjam-jam daripada PVC.",
    careNote: "Gantung setelah shift. Jangan dilipat basah di bagasi motor.",
    sizeChart: "dewasa",
    weightGrams: 430,
    isBestSeller: false,
    images: photos("ojol-malam", "Jas Ojol Malam", hitam.hex),
    variants: variants({
      prefix: "MALAM",
      sizes: ojolSizes,
      colors: [hitam],
      price: 185_000,
      compare: 225_000,
      weight: 430,
    }),
  },
  {
    slug: "setelan-anak",
    name: "Setelan Anak Sekolah",
    categorySlug: "anak",
    description:
      "PVC lebih tipis dari setelan dewasa, dengan proporsi untuk anak sekolah. Celana tidak terlalu panjang supaya tidak terseret di genangan.\n\nUkur tinggi anak, jangan umur saja. Tabelnya ada di halaman ini.",
    materialType: "pvc",
    materialNote: "PVC lebih tipis, resleting depan di jaket.",
    waterproofNote: "Untuk hujan antar jemput sekolah.",
    careNote: "Lap, jemur, simpan tergantung. Jangan dijemur di atas mesin motor yang panas.",
    sizeChart: "anak",
    weightGrams: 280,
    isBestSeller: false,
    images: photos("setelan-anak", "Setelan Anak Sekolah", seragam.hex),
    variants: variants({
      prefix: "ANAK",
      sizes: anakSizes,
      colors: [bata, seragam, kuning],
      price: 99_000,
      compare: 125_000,
      weight: 280,
      stock: () => 20,
    }),
  },
  {
    slug: "ponco-anak",
    name: "Ponco Anak",
    categorySlug: "anak",
    description:
      "Ponco ringan untuk tas sekolah. Tudungnya cukup untuk kepala anak tanpa menutup seluruh wajah.\n\nBukan pengganti setelan jika anak naik motor jarak jauh. Angin dari samping tetap bisa membasahi kaki.",
    materialType: "rubbery",
    materialNote: "Rubbery tipis, satu lembar, ada kancing di samping.",
    waterproofNote: "Menutup tas dan badan bagian atas.",
    careNote: "Bilas dan jemur terbuka. Lipat hanya setelah kering.",
    sizeChart: "anak",
    weightGrams: 220,
    isBestSeller: false,
    images: photos("ponco-anak", "Ponco Anak", kuning.hex),
    variants: variants({
      prefix: "PANAK",
      sizes: anakSizes,
      colors: [kuning, seragam],
      price: 79_000,
      compare: 99_000,
      weight: 220,
      stock: () => 18,
    }),
  },
  {
    slug: "cover-sepatu",
    name: "Cover Sepatu",
    categorySlug: "aksesoris",
    description:
      "Dipakai di atas sepatu, lalu dilepas di tempat teduh. Telapaknya karet, bukan sol sepatu harian.\n\nUkur telapak sepatu. Ukuran 32–38 untuk kaki kecil, 39–44 untuk dewasa.",
    materialType: "pvc",
    materialNote: "PVC dengan telapak karet anti selip.",
    waterproofNote: "Untuk genangan setinggi mata kaki, bukan banjir selutut.",
    careNote: "Balik, bilas lumpur, jemur. Jangan dikeringkan menempel ke knalpot.",
    sizeChart: "sepatu",
    weightGrams: 180,
    isBestSeller: false,
    images: photos("cover-sepatu", "Cover Sepatu", hitam.hex),
    variants: variants({
      prefix: "SEPATU",
      sizes: [
        { label: "32-38", code: "3238" },
        { label: "39-44", code: "3944" },
      ],
      colors: [hitam],
      price: 45_000,
      compare: 59_000,
      weight: 180,
      stock: () => 40,
    }),
  },
  {
    slug: "cover-tas",
    name: "Cover Tas",
    categorySlug: "aksesoris",
    description:
      "Selimut ransel 15–25 liter dengan tali gesper. Jahitan bagian atas rangkap.\n\nTutup resleting tas dulu, baru pasang cover. Cover tidak menahan air yang masuk lewat resleting yang terbuka.",
    materialType: "nilon",
    materialNote: "Nilon dilapisi, tali gesper di bawah.",
    waterproofNote: "Menahan rintik di luar tas. Bukan pelapis dalam.",
    careNote: "Lap dan keringkan sebelum dilipat, supaya tas berikutnya tidak lembap.",
    sizeChart: "tas",
    weightGrams: 120,
    isBestSeller: false,
    images: photos("cover-tas", "Cover Tas", pinus.hex),
    variants: variants({
      prefix: "TAS",
      sizes: [{ label: "Standar", code: "STD" }],
      colors: [pinus, hitam],
      price: 55_000,
      compare: 69_000,
      weight: 120,
      stock: () => 36,
    }),
  },
];

export const seedVouchers = [
  {
    code: "TEDUH10",
    type: "percent" as const,
    value: 10,
    minSpend: 150_000,
    maxDiscount: 30_000,
    usageLimit: null,
    firstOrderOnly: false,
  },
  {
    code: "PERTAMA",
    type: "fixed" as const,
    value: 25_000,
    minSpend: 100_000,
    maxDiscount: null,
    usageLimit: null,
    firstOrderOnly: true,
  },
  {
    code: "ONGKIR20",
    type: "shipping" as const,
    value: 20_000,
    minSpend: 0,
    maxDiscount: null,
    usageLimit: null,
    firstOrderOnly: false,
  },
];

export const seedReviews = [
  {
    seedKey: "review-deras-raka",
    productSlug: "setelan-deras",
    authorName: "Raka Pratama",
    city: "Jakarta Selatan",
    rating: 5,
    body: "Dipakai antar paket dari Cilandak ke Pancoran waktu hujan sore. Bagian paha tidak tembus. Ketiak memang gerah, sudah saya duga karena PVC.",
    photo: true,
    daysAgo: 18,
  },
  {
    seedKey: "review-deras-sinta",
    productSlug: "setelan-deras",
    authorName: "Sinta Marlina",
    city: "Bandung",
    rating: 4,
    body: "Tinggi saya 171 cm, berat 74 kg, ambil L. Lengan pas. Celana agak panjang, saya lipat sekali di karet kaki.",
    photo: false,
    daysAgo: 12,
  },
  {
    seedKey: "review-komuter-dimas",
    productSlug: "setelan-komuter",
    authorName: "Dimas Wibowo",
    city: "Depok",
    rating: 5,
    body: "Saya lipat dan masukkan ke tas kerja. Untuk hujan perjalanan ke stasiun ini cukup. Waktu kena genangan di perempatan, betis tetap kering.",
    photo: false,
    daysAgo: 9,
  },
  {
    seedKey: "review-motor-agus",
    productSlug: "ponco-motor",
    authorName: "Agus Salim",
    city: "Bekasi",
    rating: 3,
    body: "Saya 158 cm dan salah ambil ukuran long. Ujungnya menyeret di aspal basah. Bahannya tidak tembus, tapi ukuran regular lebih pas untuk saya.",
    photo: false,
    daysAgo: 21,
  },
  {
    seedKey: "review-shift-yoga",
    productSlug: "ojol-shift",
    authorName: "Yoga Prasetyo",
    city: "Surabaya",
    rating: 5,
    body: "Shift sore sampai magrib. Pita di betis kelihatan kena lampu motor lain. Saku HP-nya rapat, tidak kemasukan air waktu saya simpan di dalam.",
    photo: true,
    daysAgo: 6,
  },
  {
    seedKey: "review-malam-lestari",
    productSlug: "ojol-malam",
    authorName: "Lestari",
    city: "Yogyakarta",
    rating: 4,
    body: "Hitamnya tidak norak. Reflektifnya cukup. Bahannya lebih enak dari PVC yang biasa saya pakai, tapi harganya juga lebih tinggi.",
    photo: false,
    daysAgo: 4,
  },
  {
    seedKey: "review-anak-nur",
    productSlug: "setelan-anak",
    authorName: "Nur Aini",
    city: "Tangerang",
    rating: 5,
    body: "Anak 128 cm, ambil 7-9. Masih longgar di lengan, jadi tahun depan mungkin masih muat. Resleting tidak nyangkut.",
    photo: true,
    daysAgo: 15,
  },
  {
    seedKey: "review-sepatu-hendra",
    productSlug: "cover-sepatu",
    authorName: "Hendra",
    city: "Bogor",
    rating: 4,
    body: "Dipakai waktu genangan setinggi mata kaki di komplek. Sepatu kain di dalam tetap kering. Agak susah dilepas kalau buru-buru.",
    photo: false,
    daysAgo: 2,
  },
];

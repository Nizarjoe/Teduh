export const sizeChartKeys = ["dewasa", "anak", "ponco", "sepatu", "tas"] as const;
export type SizeChartKey = (typeof sizeChartKeys)[number];

export type SizeChart = {
  title: string;
  note: string;
  columns: [string, string, string];
  rows: [string, string, string][];
};

export const sizeCharts: Record<SizeChartKey, SizeChart> = {
  dewasa: {
    title: "Ukuran dewasa",
    note: "Jika tinggi dan berat jatuh di dua baris, ambil yang lebih besar supaya muat di atas seragam atau jaket.",
    columns: ["Ukuran", "Tinggi", "Berat"],
    rows: [
      ["M", "155–165 cm", "45–60 kg"],
      ["L", "165–172 cm", "60–75 kg"],
      ["XL", "172–180 cm", "75–88 kg"],
      ["XXL", "180–188 cm", "88–105 kg"],
    ],
  },
  anak: {
    title: "Ukuran anak",
    note: "Ukur tinggi badan. Umur hanya perkiraan, karena anak seusia bisa beda tinggi.",
    columns: ["Ukuran", "Tinggi", "Perkiraan umur"],
    rows: [
      ["4-6", "100–115 cm", "4–6 tahun"],
      ["7-9", "115–135 cm", "7–9 tahun"],
      ["10-12", "135–150 cm", "10–12 tahun"],
    ],
  },
  ponco: {
    title: "Ukuran ponco",
    note: "Regular untuk yang tidak ingin ujungnya menyentuh tanah. Long untuk menutup kaki di motor.",
    columns: ["Ukuran", "Tinggi", "Catatan"],
    rows: [
      ["Regular", "150–170 cm", "Jalan kaki dan angkot"],
      ["Long", "168–190 cm", "Motor, atau badan tinggi"],
    ],
  },
  sepatu: {
    title: "Cover sepatu",
    note: "Diukur dari panjang telapak sepatu yang akan ditutup, bukan telapak kaki telanjang.",
    columns: ["Ukuran", "Panjang telapak", "Perkiraan sepatu"],
    rows: [
      ["32-38", "sampai 24 cm", "32–38"],
      ["39-44", "24–28 cm", "39–44"],
    ],
  },
  tas: {
    title: "Cover tas",
    note: "Satu ukuran. Tutup resleting tas dulu, baru pasang cover.",
    columns: ["Ukuran", "Muat", "Catatan"],
    rows: [["Standar", "Ransel 15–25 liter", "Bukan koper"]],
  },
};

export function isSizeChartKey(value: string): value is SizeChartKey {
  return (sizeChartKeys as readonly string[]).includes(value);
}

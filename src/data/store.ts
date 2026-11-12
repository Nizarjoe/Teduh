export const store = {
  name: "Teduh",
  legalName: process.env.NEXT_PUBLIC_STORE_LEGAL_NAME || "Teduh",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "Jl. Contoh Raya No. 8, Cilandak, Jakarta Selatan",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "halo@teduh.id",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628111908800",
  hours: "Setiap hari, 08.00–17.00 WIB",
  description:
    "Toko jas hujan yang menjual langsung. Setelan, ponco, jas ojol, ukuran anak, dan cover sepatu atau tas.",
};

export function whatsappHref(message = "Halo Teduh, saya ingin bertanya soal jas hujan."): string {
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
}

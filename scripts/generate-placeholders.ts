import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedProducts } from "../src/data/catalog-seed";

function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.max(0, Math.min(255, ((value >> shift) & 255) + amount));
  return `#${[channel(16), channel(8), channel(0)].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function kindOf(slug: string, category: string): "setelan" | "ponco" | "sepatu" | "tas" {
  if (slug.includes("sepatu")) return "sepatu";
  if (slug.includes("tas")) return "tas";
  if (category === "ponco" || slug.includes("ponco")) return "ponco";
  return "setelan";
}

function garment(kind: "setelan" | "ponco" | "sepatu" | "tas", fill: string, stitch: string, reflective: boolean): string {
  if (kind === "ponco") {
    return `
      <path d="M400 210 C330 210 300 250 292 292 L150 760 H650 L508 292 C500 250 470 210 400 210 Z" fill="${fill}"/>
      <path d="M348 292 C348 230 452 230 452 292" fill="${shade(fill, luminance(fill) > 150 ? -25 : 28)}"/>
      <path d="M400 300 V740" stroke="${stitch}" stroke-width="2" fill="none"/>
      ${reflective ? `<path d="M230 560 H570" stroke="#F4F0E4" stroke-width="14"/>` : ""}
    `;
  }
  if (kind === "sepatu") {
    return `
      <path d="M230 610 H520 V650 H575 V740 H210 V650 H230 Z" fill="${fill}"/>
      <path d="M250 610 V540 H470 V610" fill="${shade(fill, 24)}" stroke="${stitch}" stroke-width="2"/>
      <path d="M210 740 H575" stroke="${stitch}" stroke-width="8"/>
    `;
  }
  if (kind === "tas") {
    return `
      <rect x="250" y="280" width="300" height="420" rx="28" fill="${fill}"/>
      <path d="M300 280 V220 H500 V280" fill="none" stroke="${stitch}" stroke-width="8"/>
      <path d="M250 390 H550" stroke="${stitch}" stroke-width="3"/>
      <rect x="360" y="470" width="80" height="46" rx="8" fill="none" stroke="${stitch}" stroke-width="3"/>
    `;
  }
  return `
    <rect x="285" y="600" width="90" height="250" rx="10" fill="${fill}"/>
    <rect x="425" y="600" width="90" height="250" rx="10" fill="${fill}"/>
    <path d="M300 300 L250 360 L215 470 L250 505 L275 640 H525 L550 505 L585 470 L550 360 L500 300 Z" fill="${fill}"/>
    <path d="M300 320 L175 450 L155 490 L220 520 L310 400 Z" fill="${shade(fill, luminance(fill) > 160 ? -18 : 18)}"/>
    <path d="M500 320 L625 450 L645 490 L580 520 L490 400 Z" fill="${shade(fill, luminance(fill) > 160 ? -18 : 18)}"/>
    <path d="M330 250 C330 170 470 170 470 250 L450 300 H350 Z" fill="${shade(fill, luminance(fill) > 160 ? -22 : 22)}"/>
    <path d="M400 300 V630" stroke="${stitch}" stroke-width="2"/>
    <rect x="315" y="460" width="55" height="42" fill="none" stroke="${stitch}" stroke-width="2"/>
    <rect x="430" y="460" width="55" height="42" fill="none" stroke="${stitch}" stroke-width="2"/>
    ${reflective ? `<path d="M250 520 H545" stroke="#F4F0E4" stroke-width="12"/>` : ""}
  `;
}

function svg(input: { hex: string; view: "depan" | "detail"; kind: "setelan" | "ponco" | "sepatu" | "tas"; reflective: boolean }): string {
  const stitch = luminance(input.hex) > 150 ? shade(input.hex, -50) : shade(input.hex, 55);
  const body =
    input.view === "detail"
      ? `
        <path d="M180 260 H620" stroke="${stitch}" stroke-width="3"/>
        <path d="M180 340 H620" stroke="${stitch}" stroke-width="3"/>
        <path d="M400 180 V760" stroke="${stitch}" stroke-width="3"/>
        <circle cx="400" cy="420" r="18" fill="${input.hex}" stroke="${stitch}" stroke-width="3"/>
        <path d="M80 120 L140 80 M80 180 L160 120 M80 240 L180 160" stroke="#9AA49E" stroke-width="2"/>
      `
      : garment(input.kind, input.hex, stitch, input.reflective);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img">
  <rect width="800" height="1000" fill="#E6E1D6"/>
  <ellipse cx="400" cy="860" rx="190" ry="16" fill="#17211E" opacity="0.08"/>
  ${body}
  <text x="400" y="930" text-anchor="middle" font-family="Georgia, serif" font-size="18" letter-spacing="3" fill="#3C4A45">TEMPAT FOTO PRODUK</text>
  <text x="400" y="962" text-anchor="middle" font-family="Helvetica, sans-serif" font-size="14" fill="#66716C">Ganti berkas ini dengan foto asli</text>
</svg>
`;
}

async function main(): Promise<void> {
  const dir = path.resolve(process.cwd(), "public/products");
  await mkdir(dir, { recursive: true });
  for (const product of seedProducts) {
    const kind = kindOf(product.slug, product.categorySlug);
    const reflective = product.categorySlug === "ojol";
    for (const image of product.images) {
      await writeFile(
        path.join(dir, image.file),
        svg({ hex: image.hex, view: image.view, kind, reflective }),
        "utf8",
      );
    }
  }
  console.log(`menulis ${seedProducts.reduce((sum, product) => sum + product.images.length, 0)} gambar`);
}

void main();

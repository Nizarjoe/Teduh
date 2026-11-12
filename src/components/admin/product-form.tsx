"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { materialLabel, materialTypes } from "@/data/materials";
import { sizeChartKeys, sizeCharts } from "@/data/size-charts";
import { ApiRequestError } from "@/lib/api";
import { readCsrfCookie } from "@/lib/csrf-client";
import { buttonPrimary, inputClass, labelClass } from "@/components/styles";

type VariantDraft = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  weightGrams: string;
  isActive: boolean;
};

type ImageDraft = { url: string; alt: string };

export type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  materialType: string;
  materialNote: string;
  waterproofNote: string;
  careNote: string;
  sizeChart: string;
  weightGrams: string;
  isActive: boolean;
  isBestSeller: boolean;
  images: ImageDraft[];
  variants: VariantDraft[];
};

const emptyVariant = (): VariantDraft => ({
  sku: "",
  size: "",
  color: "",
  colorHex: "#234840",
  price: "",
  compareAtPrice: "",
  stock: "0",
  weightGrams: "400",
  isActive: true,
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductDraft;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function patch<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/unggah", {
      method: "POST",
      headers: { "x-csrf-token": readCsrfCookie() },
      body,
    });
    const data = (await response.json()) as { url?: string; error?: { message?: string } };
    if (!response.ok || !data.url) throw new Error(data.error?.message || "Unggah gagal.");
    patch("images", [...draft.images, { url: data.url, alt: draft.name || "Foto produk" }]);
  }

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const payload = {
          ...draft,
          weightGrams: Number(draft.weightGrams),
          images: draft.images,
          variants: draft.variants.map((variant) => ({
            ...variant,
            price: Number(variant.price),
            compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
            stock: Number(variant.stock),
            weightGrams: Number(variant.weightGrams),
          })),
        };
        try {
          const url = draft.id ? `/api/admin/produk/${draft.id}` : "/api/admin/produk";
          const response = await fetch(url, {
            method: draft.id ? "PUT" : "POST",
            headers: { "content-type": "application/json", "x-csrf-token": readCsrfCookie() },
            body: JSON.stringify(payload),
          });
          const data = (await response.json()) as { id?: string; error?: { message?: string } };
          if (!response.ok) throw new ApiRequestError(data.error?.message || "Gagal menyimpan.", response.status);
          router.push("/admin/produk");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Gagal menyimpan.");
          setPending(false);
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Nama
          <input className={`${inputClass} mt-1`} value={draft.name} onChange={(event) => {
            const name = event.target.value;
            patch("name", name);
            if (!slugTouched) patch("slug", slugify(name));
          }} required />
        </label>
        <label className="text-sm">Slug
          <input className={`${inputClass} mt-1`} value={draft.slug} onChange={(event) => { setSlugTouched(true); patch("slug", event.target.value); }} required />
        </label>
        <label className="text-sm">Kategori
          <select className={`${inputClass} mt-1`} value={draft.categoryId} onChange={(event) => patch("categoryId", event.target.value)}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Bahan
          <select className={`${inputClass} mt-1`} value={draft.materialType} onChange={(event) => patch("materialType", event.target.value)}>
            {materialTypes.map((type) => <option key={type} value={type}>{materialLabel[type]}</option>)}
          </select>
        </label>
      </div>
      <label className={labelClass}>Deskripsi
        <textarea className={`${inputClass} mt-1`} rows={5} value={draft.description} onChange={(event) => patch("description", event.target.value)} />
      </label>
      <label className={labelClass}>Catatan bahan
        <input className={inputClass} value={draft.materialNote} onChange={(event) => patch("materialNote", event.target.value)} />
      </label>
      <label className={labelClass}>Catatan tahan air
        <input className={inputClass} value={draft.waterproofNote} onChange={(event) => patch("waterproofNote", event.target.value)} />
      </label>
      <label className={labelClass}>Perawatan
        <input className={inputClass} value={draft.careNote} onChange={(event) => patch("careNote", event.target.value)} />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">Panduan ukuran
          <select className={`${inputClass} mt-1`} value={draft.sizeChart} onChange={(event) => patch("sizeChart", event.target.value)}>
            {sizeChartKeys.map((key) => <option key={key} value={key}>{sizeCharts[key].title}</option>)}
          </select>
        </label>
        <label className="text-sm">Berat default (g)
          <input className={`${inputClass} mt-1`} value={draft.weightGrams} onChange={(event) => patch("weightGrams", event.target.value)} />
        </label>
        <div className="flex items-end gap-4 pb-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isActive} onChange={(event) => patch("isActive", event.target.checked)} /> Tayang</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isBestSeller} onChange={(event) => patch("isBestSeller", event.target.checked)} /> Unggulan</label>
        </div>
      </div>
      <section>
        <h2 className="font-serif text-2xl">Gambar</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {draft.images.map((image, index) => (
            <li key={`${image.url}-${index}`} className="flex items-center justify-between gap-3 border border-line px-3 py-2">
              <span className="truncate">{image.alt}</span>
              <button type="button" className="underline" onClick={() => patch("images", draft.images.filter((_, imageIndex) => imageIndex !== index))}>Hapus</button>
            </li>
          ))}
        </ul>
        <label className="mt-3 inline-block text-sm">
          Unggah
          <input className="mt-1 block" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file).catch((err: unknown) => setError(err instanceof Error ? err.message : "Unggah gagal."));
          }} />
        </label>
      </section>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Varian</h2>
          <button type="button" className="text-sm underline" onClick={() => patch("variants", [...draft.variants, emptyVariant()])}>Tambah varian</button>
        </div>
        <p className="mt-2 text-sm text-ink-soft">Angka stok menggantikan stok saat ini, bukan menambah.</p>
        <div className="mt-4 space-y-4">
          {draft.variants.map((variant, index) => (
            <div key={variant.id ?? index} className="grid gap-2 border border-line p-3 md:grid-cols-4">
              {(["sku", "size", "color", "colorHex", "price", "compareAtPrice", "stock", "weightGrams"] as const).map((field) => (
                <label key={field} className="text-xs uppercase tracking-wide text-ink-soft">
                  {field}
                  <input className={`${inputClass} mt-1`} value={variant[field]} onChange={(event) => {
                    const next = [...draft.variants];
                    const row = next[index];
                    if (!row) return;
                    next[index] = { ...row, [field]: event.target.value };
                    patch("variants", next);
                  }} />
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={variant.isActive} onChange={(event) => {
                  const next = [...draft.variants];
                  const row = next[index];
                  if (!row) return;
                  next[index] = { ...row, isActive: event.target.checked };
                  patch("variants", next);
                }} />
                Aktif
              </label>
            </div>
          ))}
        </div>
      </section>
      {error ? <p className="text-sm text-clay" role="alert">{error}</p> : null}
      <button className={buttonPrimary} disabled={pending} type="submit">{pending ? "Menyimpan…" : "Simpan"}</button>
    </form>
  );
}

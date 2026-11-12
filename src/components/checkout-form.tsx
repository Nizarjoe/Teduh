"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { regions } from "@/data/regions";
import { apiPost, ApiRequestError } from "@/lib/api";
import { formatIDR } from "@/lib/money";
import type { CheckoutResult, QuoteResponse } from "@/lib/storefront-types";
import { buttonPrimary, inputClass, labelClass } from "@/components/styles";
import { useCart } from "@/stores/cart";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [cityId, setCityId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [notes, setNotes] = useState("");
  const [ship, setShip] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [formError, setFormError] = useState("");

  const province = regions.find((item) => item.id === provinceId);
  const city = province?.cities.find((item) => item.id === cityId);
  const cartItems = useMemo(() => items.map((item) => ({ variantId: item.variantId, qty: item.qty })), [items]);
  const [courierCode, serviceCode] = ship.split(":");

  const quote = useQuery({
    queryKey: ["quote", cartItems, provinceId, cityId, districtId, courierCode, serviceCode, appliedCode, phone],
    enabled: cartItems.length > 0,
    queryFn: () =>
      apiPost<QuoteResponse>("/api/quote", {
        items: cartItems,
        provinceId,
        cityId,
        districtId,
        courierCode: courierCode || "",
        serviceCode: serviceCode || "",
        voucherCode: appliedCode,
        phone,
      }),
  });

  const order = useMutation({
    mutationFn: () => {
      if (quote.data?.total == null) throw new ApiRequestError("Pilih pengiriman dulu.", 400);
      return apiPost<CheckoutResult>("/api/checkout", {
        items: cartItems,
        name,
        phone,
        email,
        provinceId,
        cityId,
        districtId,
        addressLine,
        notes,
        courierCode,
        serviceCode,
        voucherCode: appliedCode,
        expectedTotal: quote.data.total,
      });
    },
    onSuccess: async (result) => {
      clear();
      if (result.mode === "mock" && result.payToken) {
        router.push(`/bayar/${result.orderNumber}?token=${encodeURIComponent(result.payToken)}`);
        return;
      }
      if (result.snapToken && result.snapScriptUrl && result.clientKey) {
        await openSnap(result.snapScriptUrl, result.clientKey, result.snapToken, () => {
          router.push(`/lacak/${result.orderNumber}`);
        });
        return;
      }
      router.push(`/lacak/${result.orderNumber}`);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Pesanan gagal dibuat.");
    },
  });

  if (items.length === 0) {
    return (
      <p className="mt-8">
        Keranjang kosong.{" "}
        <a className="underline underline-offset-4" href="/katalog">
          Kembali ke katalog
        </a>
      </p>
    );
  }

  const data = quote.data;
  const shortStock = data?.items.some((item) => item.available < item.qty) ?? false;

  return (
    <form
      className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_20rem]"
      onSubmit={(event) => {
        event.preventDefault();
        setFormError("");
        order.mutate();
      }}
    >
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="font-serif text-2xl">Kontak</legend>
          <div>
            <label className={labelClass} htmlFor="nama">Nama</label>
            <input id="nama" className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
          </div>
          <div>
            <label className={labelClass} htmlFor="wa">WhatsApp</label>
            <input id="wa" className={inputClass} inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" placeholder="08…" />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email (opsional)</label>
            <input id="email" className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </div>
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="font-serif text-2xl">Alamat</legend>
          <div>
            <label className={labelClass} htmlFor="provinsi">Provinsi</label>
            <select
              id="provinsi"
              className={inputClass}
              value={provinceId}
              onChange={(event) => {
                setProvinceId(event.target.value);
                setCityId("");
                setDistrictId("");
                setShip("");
              }}
              required
            >
              <option value="">Pilih</option>
              {regions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="kota">Kota atau kabupaten</label>
            <select
              id="kota"
              className={inputClass}
              value={cityId}
              onChange={(event) => {
                setCityId(event.target.value);
                setDistrictId("");
                setShip("");
              }}
              required
            >
              <option value="">Pilih</option>
              {province?.cities.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="kecamatan">Kecamatan</label>
            <select
              id="kecamatan"
              className={inputClass}
              value={districtId}
              onChange={(event) => {
                setDistrictId(event.target.value);
                setShip("");
              }}
              required
            >
              <option value="">Pilih</option>
              {city?.districts.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="alamat">Alamat</label>
            <textarea id="alamat" className={inputClass} rows={3} value={addressLine} onChange={(event) => setAddressLine(event.target.value)} required placeholder="Nama jalan, nomor, RT/RW, patokan" />
          </div>
          <div>
            <label className={labelClass} htmlFor="catatan">Catatan untuk kurir (opsional)</label>
            <textarea id="catatan" className={inputClass} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-serif text-2xl">Pengiriman</legend>
          {data?.shippingSource === "perkiraan" ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Tarif ini perkiraan lokal karena kunci Biteship belum diisi. Angka bisa berbeda dari ongkir nyata.
            </p>
          ) : null}
          {quote.isFetching ? <p className="mt-3 text-sm">Menghitung ongkir…</p> : null}
          {quote.isError ? (
            <p className="mt-3 text-sm text-clay" role="alert">
              {quote.error instanceof Error ? quote.error.message : "Ongkir gagal dihitung."}
            </p>
          ) : null}
          <div className="mt-4 space-y-2">
            {(data?.rates ?? []).map((rate) => {
              const value = `${rate.courierCode}:${rate.serviceCode}`;
              return (
                <label key={value} className="flex cursor-pointer items-start justify-between gap-3 border border-line px-3 py-3">
                  <span className="flex items-start gap-3">
                    <input type="radio" name="kurir" value={value} checked={ship === value} onChange={() => setShip(value)} required />
                    <span>
                      <span className="block text-sm font-medium">{rate.courierName} {rate.serviceName}</span>
                      <span className="block text-sm text-ink-soft">{rate.etd}</span>
                    </span>
                  </span>
                  <span className="tabular-nums">{formatIDR(rate.cost)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-serif text-2xl">Voucher</legend>
          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <label className={labelClass} htmlFor="voucher">Kode voucher</label>
              <input id="voucher" className={inputClass} value={voucherCode} onChange={(event) => setVoucherCode(event.target.value.toUpperCase())} placeholder="PERTAMA" />
            </div>
            <button type="button" className="mt-7 border border-ink px-4 py-3 text-sm" onClick={() => setAppliedCode(voucherCode.trim())}>
              Pakai
            </button>
          </div>
          {data?.voucher && !data.voucher.ok ? <p className="mt-2 text-sm text-clay">{data.voucher.message}</p> : null}
          {data?.voucher && data.voucher.ok ? <p className="mt-2 text-sm text-rain">Voucher {data.voucher.code} dipakai.</p> : null}
          <p className="mt-3 text-sm text-ink-soft">PERTAMA potong Rp25.000 untuk nomor yang belum pernah pesan. TEDUH10 potong 10% (maks. Rp30.000) jika belanja minimal Rp150.000.</p>
        </fieldset>
      </div>
      <aside className="h-fit border border-line p-5">
        <h2 className="font-serif text-2xl">Ringkasan</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {(data?.items ?? items.map((item) => ({
            variantId: item.variantId,
            productName: item.productName,
            size: item.size,
            color: item.color,
            qty: item.qty,
            lineTotal: item.unitPrice * item.qty,
            available: 99,
          }))).map((item) => (
            <li key={item.variantId} className="flex justify-between gap-3">
              <span>
                {item.productName}
                <span className="block text-ink-soft">{item.size} · {item.color} · {item.qty}</span>
                {"available" in item && item.available < item.qty ? <span className="block text-clay">Stok tidak cukup</span> : null}
              </span>
              <span className="tabular-nums">{formatIDR(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatIDR(data?.subtotal ?? 0)}</dd></div>
          <div className="flex justify-between"><dt>Diskon</dt><dd className="tabular-nums">{formatIDR(data?.discount ?? 0)}</dd></div>
          <div className="flex justify-between"><dt>Ongkir</dt><dd className="tabular-nums">{data?.shippingCost == null ? "—" : formatIDR(data.shippingCost)}</dd></div>
          <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd className="tabular-nums">{data?.total == null ? "—" : formatIDR(data.total)}</dd></div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">Selesaikan pembayaran dalam 30 menit. Stok ditahan selama itu, lalu dilepas jika belum lunas.</p>
        {formError ? <p className="mt-3 text-sm text-clay" role="alert">{formError}</p> : null}
        <button className={`${buttonPrimary} mt-4 w-full`} type="submit" disabled={order.isPending || shortStock || data?.total == null} aria-busy={order.isPending}>
          {order.isPending ? "Membuat pesanan…" : "Buat pesanan"}
        </button>
      </aside>
    </form>
  );
}

function openSnap(scriptUrl: string, clientKey: string, token: string, done: () => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.dataset.clientKey = clientKey;
    script.onload = () => {
      window.snap?.pay(token, {
        onSuccess: () => { done(); resolve(); },
        onPending: () => { done(); resolve(); },
        onError: () => { done(); resolve(); },
        onClose: () => { done(); resolve(); },
      });
    };
    script.onerror = () => reject(new Error("Snap gagal dimuat."));
    document.body.appendChild(script);
  });
}

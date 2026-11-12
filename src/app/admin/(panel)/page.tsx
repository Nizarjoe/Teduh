import { adminSummary } from "@/db/queries";
import { formatIDR } from "@/lib/money";
import { statusLabel } from "@/lib/order-status";

export default async function AdminHome() {
  const data = await adminSummary();
  return (
    <div>
      <h1 className="font-serif text-4xl">Ringkasan</h1>
      {data.sampleReviews > 0 ? (
        <p className="mt-4 border border-line bg-sand px-4 py-3 text-sm leading-relaxed">
          Masih ada {data.sampleReviews} ulasan contoh dari seed. Itu bukan pembeli. Hapus sebelum tayang dengan perintah{" "}
          <code>npm run db:clear-sample-reviews</code>.
        </p>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="border border-line p-4">
          <p className="text-sm text-ink-soft">Lunas hari ini</p>
          <p className="mt-2 text-2xl tabular-nums">{formatIDR(data.todayTotal)}</p>
          <p className="text-sm text-ink-soft">{data.todayOrders} pesanan</p>
        </section>
        <section className="border border-line p-4">
          <p className="text-sm text-ink-soft">Ulasan menunggu</p>
          <p className="mt-2 text-2xl tabular-nums">{data.pendingReviews}</p>
        </section>
        <section className="border border-line p-4">
          <p className="text-sm text-ink-soft">Status pesanan</p>
          <ul className="mt-2 space-y-1 text-sm">
            {data.statusCounts.map((row) => (
              <li key={row.status} className="flex justify-between gap-3">
                <span>{statusLabel[row.status]}</span>
                <span className="tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Tujuh hari terakhir</h2>
        {data.series.every((day) => day.total === 0) ? (
          <p className="mt-3 text-sm text-ink-soft">Belum ada pesanan lunas dalam 7 hari terakhir.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {data.series.map((day) => (
              <li key={day.day} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-sm">
                <span>{day.label}</span>
                <span className="h-2 bg-line">
                  <span className="block h-2 bg-rain" style={{ width: `${Math.round((day.total / data.max) * 100)}%` }} />
                </span>
                <span className="tabular-nums">{formatIDR(day.total)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Stok menipis</h2>
        {data.lowStock.length === 0 ? <p className="mt-3 text-sm text-ink-soft">Tidak ada varian di bawah 6.</p> : (
          <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
            {data.lowStock.map((row) => (
              <li key={row.sku} className="flex items-center justify-between gap-3 py-2">
                <span>{row.productName} · {row.size} · {row.color}</span>
                <span className="tabular-nums">{row.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

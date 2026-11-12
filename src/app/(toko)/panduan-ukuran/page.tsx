import type { Metadata } from "next";
import { sizeCharts } from "@/data/size-charts";

export const metadata: Metadata = { title: "Panduan ukuran", description: "Ukuran jas hujan Teduh berdasarkan tinggi dan berat." };

export default function SizeGuidePage() {
  return (
    <div>
      <h1 className="font-serif text-4xl md:text-5xl">Panduan ukuran</h1>
      <p className="mt-4 max-w-2xl text-ink-soft">Ukur tinggi dan berat sebelum pesan. Kalau di antara dua ukuran, ambil yang lebih besar agar muat di atas seragam.</p>
      <div className="mt-10 space-y-10">
        {Object.values(sizeCharts).map((chart) => (
          <section key={chart.title}>
            <h2 className="font-serif text-2xl">{chart.title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{chart.note}</p>
            <table className="mt-4 w-full max-w-xl text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {chart.columns.map((column) => <th key={column} className="py-2 font-medium">{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row.join("-")} className="border-b border-line">
                    {row.map((cell) => <td key={cell} className="py-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5">
      <p className="font-serif text-3xl">Teduh</p>
      <h1 className="mt-6 font-serif text-4xl">Halaman ini tidak ada.</h1>
      <p className="mt-3 text-ink-soft">Periksa alamatnya, atau kembali ke katalog.</p>
      <Link href="/katalog" className="mt-6 inline-flex w-fit bg-rain px-5 py-3 text-sm text-paper">Ke katalog</Link>
    </main>
  );
}

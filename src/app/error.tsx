"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5">
      <h1 className="font-serif text-4xl">Ada kendala saat membuka halaman ini.</h1>
      <button type="button" className="mt-6 w-fit border border-ink px-5 py-3 text-sm" onClick={reset}>Coba lagi</button>
    </main>
  );
}

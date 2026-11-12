export function Prose({ title, lede, children }: { title: string; lede?: string; children: React.ReactNode }) {
  return (
    <article className="max-w-2xl">
      <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
      {lede ? <p className="mt-4 text-lg leading-relaxed text-ink-soft">{lede}</p> : null}
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink-soft [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

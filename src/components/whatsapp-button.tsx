import { store, whatsappHref } from "@/data/store";

export function WhatsAppButton() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--wa-dock)] items-center justify-end border-t border-line bg-paper px-[max(1rem,env(safe-area-inset-right))] md:inset-x-auto md:bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:right-[max(1rem,env(safe-area-inset-right))] md:h-auto md:border-0 md:bg-transparent md:p-0">
      <a
        href={whatsappHref()}
        className="border border-rain bg-paper px-3 py-2 text-sm text-rain shadow-[0_8px_24px_rgba(23,33,30,0.12)]"
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
        <span className="sr-only">, chat {store.name}</span>
      </a>
    </div>
  );
}

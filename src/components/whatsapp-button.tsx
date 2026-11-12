import { store, whatsappHref } from "@/data/store";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref()}
      className="fixed bottom-24 left-4 z-40 border border-rain bg-paper px-3 py-2 text-sm text-rain shadow-[0_8px_24px_rgba(23,33,30,0.12)] md:bottom-6"
      target="_blank"
      rel="noopener noreferrer"
    >
      WhatsApp
      <span className="sr-only">, chat {store.name}</span>
    </a>
  );
}

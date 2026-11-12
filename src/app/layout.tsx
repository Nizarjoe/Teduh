import type { Metadata } from "next";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/fraunces/latin-500.css";
import "@fontsource/fraunces/latin-600.css";
import { Analytics } from "@/components/analytics";
import { Providers } from "@/components/providers";
import { store } from "@/data/store";
import { getEnv } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: "Teduh", template: "%s · Teduh" },
  description: store.description,
  applicationName: "Teduh",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Teduh",
    title: "Teduh",
    description: store.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  getEnv();
  return (
    <html lang="id">
      <body>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

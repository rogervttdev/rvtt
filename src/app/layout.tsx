import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Tábula — mesa virtual de D&D",
  description: "Fichas de personagem e mesa multiplayer com grid e dados em tempo real.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@500;700;800&family=Alegreya+Sans:wght@400;500;700&display=swap"
        />
      </head>
      <body className="min-h-dvh">
        <SessionProvider>
          <Nav />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

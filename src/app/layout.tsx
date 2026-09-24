import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Taverna Inicial — sua primeira mesa de D&D",
  description:
    "Um lugar acolhedor para dar os primeiros passos no D&D: crie sua ficha e jogue com amigos numa mesa virtual com mapa e dados.",
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
          href="https://fonts.googleapis.com/css2?family=Almendra:wght@400;700&family=Alegreya+Sans:wght@400;500;700&display=swap"
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

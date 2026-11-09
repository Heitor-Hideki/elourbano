import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const robotoMono = Roboto_Mono({ variable: "--font-roboto-mono", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  title: "EloUrbano · zeladoria colaborativa",
  description: "Relate, priorize e acompanhe problemas nos espaços públicos da sua cidade.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Extensões do navegador (ex.: LanguageTool) injetam atributos no <html> antes da hidratação.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}

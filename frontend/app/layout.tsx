import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "LogiFinance | Gestão financeira para transportadoras",
  description:
    "Controle fretes, custo por quilômetro, manutenção da frota e fluxo de caixa em um só sistema. Feito para transportadoras. Comece grátis por 30 dias.",
  openGraph: {
    title: "LogiFinance | Gestão financeira para transportadoras",
    description:
      "Controle fretes, custo por quilômetro, manutenção da frota e fluxo de caixa em um só sistema.",
    type: "website",
    siteName: "LogiFinance",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-body text-body-md text-on-surface bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

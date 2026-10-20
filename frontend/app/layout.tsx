import type { Metadata } from "next";
import { Gabriela, Raleway } from "next/font/google";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteTools } from "@/components/site/site-tools";
import { Toaster } from "@/components/ui/toast";
import { siteName } from "@/lib/site/navigation";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["500", "600", "700"],
  variable: "--font-raleway",
});

const gabriela = Gabriela({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-gabriela",
});

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    "A ONG Gabriel atua em Campinas na prevenção ao suicídio, com acolhimento, educação e cuidado em saúde mental.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${raleway.variable} ${gabriela.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-3 focus:text-label focus:font-semibold"
        >
          Ir para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
        <SiteTools />
        <Toaster />
      </body>
    </html>
  );
}

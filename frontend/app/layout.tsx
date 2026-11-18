import type { Metadata } from "next";
import { Gabriela, Raleway } from "next/font/google";
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

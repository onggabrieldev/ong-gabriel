import type { Metadata } from "next";
import { NotFoundScreen } from "@/components/site/not-found-screen";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function SiteNotFound() {
  return <NotFoundScreen />;
}

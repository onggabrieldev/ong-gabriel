import type { Metadata } from "next";
import { NotFoundScreen } from "@/components/site/not-found-screen";
import { SiteChrome } from "@/components/site/site-chrome";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundScreen />
    </SiteChrome>
  );
}

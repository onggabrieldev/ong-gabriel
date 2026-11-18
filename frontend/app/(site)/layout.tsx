import type { ReactNode } from "react";
import { SiteChrome } from "@/components/site/site-chrome";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return <SiteChrome>{children}</SiteChrome>;
}

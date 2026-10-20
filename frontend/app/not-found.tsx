import type { Metadata } from "next";
import { StatusScreen } from "@/components/site/status-screen";
import { ButtonLink } from "@/components/ui/button-link";
import { notFoundContent } from "@/lib/site/status-pages";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <StatusScreen message={notFoundContent} code="404">
      <ButtonLink href={notFoundContent.homeLink.href}>{notFoundContent.homeLink.label}</ButtonLink>
      <ButtonLink href={notFoundContent.aboutLink.href} variant="outline">
        {notFoundContent.aboutLink.label}
      </ButtonLink>
    </StatusScreen>
  );
}

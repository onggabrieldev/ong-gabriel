import type { Metadata } from "next";
import { FoundersSection } from "@/components/about/founders-section";
import { GallerySection } from "@/components/about/gallery-section";
import { HistorySection } from "@/components/about/history-section";
import { MissionSection } from "@/components/about/mission-section";
import { ValuesSection } from "@/components/about/values-section";
import { getAboutPage } from "@/lib/about/get-about-page";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a história da ONG Gabriel, nossa missão, nossos valores e quem idealizou o projeto.",
};

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <>
      <HistorySection history={about.history} />
      <MissionSection mission={about.mission} />
      <ValuesSection values={about.values} />
      <FoundersSection founders={about.founders} />
      <GallerySection gallery={about.gallery} />
    </>
  );
}

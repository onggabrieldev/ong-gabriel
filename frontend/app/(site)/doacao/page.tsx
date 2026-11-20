import type { Metadata } from "next";
import { ContactSection } from "@/components/contact/contact-section";
import { HeroSection } from "@/components/donation/hero-section";
import { ImpactSection } from "@/components/donation/impact-section";
import { OptionsSection } from "@/components/donation/options-section";
import { getDonationPage } from "@/lib/donation/get-donation-page";

export const metadata: Metadata = {
  title: "Doação",
  description:
    "Doe para a ONG Gabriel por Pix ou transferência bancária e ajude a manter atendimentos gratuitos de prevenção ao suicídio.",
};

export default async function DonationPage() {
  const donation = await getDonationPage();

  return (
    <>
      <HeroSection hero={donation.hero} />
      <OptionsSection options={donation.options} />
      <ContactSection contact={donation.contact} />
      <ImpactSection impact={donation.impact} />
    </>
  );
}

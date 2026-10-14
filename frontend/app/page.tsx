import { ActivitiesSection } from "@/components/home/activities-section";
import { ContactSection } from "@/components/home/contact-section";
import { DonationSection } from "@/components/home/donation-section";
import { HeroSection } from "@/components/home/hero-section";
import { ImpactSection } from "@/components/home/impact-section";
import { MissionSection } from "@/components/home/mission-section";
import { SupportSection } from "@/components/home/support-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { TributeSection } from "@/components/home/tribute-section";
import { VolunteerSection } from "@/components/home/volunteer-section";
import { getHomePage } from "@/lib/home/get-home-page";

export default async function Home() {
  const home = await getHomePage();

  return (
    <>
      <HeroSection hero={home.hero} />
      <MissionSection mission={home.mission} />
      <ActivitiesSection activities={home.activities} />
      <SupportSection support={home.support} />
      <DonationSection donation={home.donation} />
      <ImpactSection impact={home.impact} />
      <VolunteerSection volunteer={home.volunteer} />
      <TestimonialsSection testimonials={home.testimonials} />
      <ContactSection contact={home.contact} />
      <TributeSection tribute={home.tribute} />
    </>
  );
}

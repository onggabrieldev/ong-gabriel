import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsSection } from "@/components/agenda/events-section";
import { HeroSection } from "@/components/agenda/hero-section";
import { OutreachSection } from "@/components/agenda/outreach-section";
import { PastEventsSection } from "@/components/agenda/past-events-section";
import { SupportSection } from "@/components/home/support-section";
import { getAgendaPage } from "@/lib/agenda/get-agenda-page";
import { getEventFilterOptions, getPastEvents, getUpcomingEvents } from "@/lib/events/get-events";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Confira a agenda de eventos da ONG Gabriel e veja como participar.",
};

function EventsFallback({ heading }: { heading: string }) {
  return (
    <section aria-labelledby="upcoming-events-title" className="bg-canvas">
      <div className="mx-auto max-w-360 px-4 py-12 lg:px-20 lg:pt-20 lg:pb-32">
        <h2 id="upcoming-events-title" className="text-title font-bold text-ink">
          {heading}
        </h2>
      </div>
    </section>
  );
}

export default async function AgendaPage() {
  const [agenda, upcoming, past, filters] = await Promise.all([
    getAgendaPage(),
    getUpcomingEvents(),
    getPastEvents(),
    getEventFilterOptions(),
  ]);

  return (
    <>
      <HeroSection hero={agenda.hero} />
      <Suspense fallback={<EventsFallback heading={agenda.events.heading} />}>
        <EventsSection
          events={upcoming}
          types={filters.types}
          locations={filters.locations}
          periods={filters.periods}
          copy={agenda.events}
          registration={agenda.registration}
          status={agenda.status}
        />
      </Suspense>
      <SupportSection support={agenda.support} />
      <PastEventsSection gallery={agenda.gallery} events={past} />
      <OutreachSection outreach={agenda.outreach} />
    </>
  );
}

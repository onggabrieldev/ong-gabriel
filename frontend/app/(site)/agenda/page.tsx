import type { Metadata } from "next";
import { EventsSection } from "@/components/agenda/events-section";
import { firstSearchParam, readParam } from "@/components/agenda/format-event";
import { HeroSection } from "@/components/agenda/hero-section";
import { OutreachSection } from "@/components/agenda/outreach-section";
import { PastEventsSection } from "@/components/agenda/past-events-section";
import { SupportSection } from "@/components/home/support-section";
import { getAgendaPage } from "@/lib/agenda/get-agenda-page";
import type { AgendaAppliedFilters } from "@/lib/agenda/types";
import { getEventFilterOptions, getPastEvents, getUpcomingEvents } from "@/lib/events/get-events";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Confira a agenda de eventos da ONG Gabriel e veja como participar.",
};

export const instant = false;

type AgendaSearchParams = {
  tipo?: string | string[];
  local?: string | string[];
  periodo?: string | string[];
};

type AgendaPageProps = {
  searchParams: Promise<AgendaSearchParams>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const [agenda, upcoming, past, filters, params] = await Promise.all([
    getAgendaPage(),
    getUpcomingEvents(),
    getPastEvents(),
    getEventFilterOptions(),
    searchParams,
  ]);

  const initialFilters: AgendaAppliedFilters = {
    tipo: readParam(firstSearchParam(params.tipo), filters.types),
    local: readParam(firstSearchParam(params.local), filters.locations),
    periodo: readParam(firstSearchParam(params.periodo), filters.periods),
  };

  return (
    <>
      <HeroSection hero={agenda.hero} />
      <EventsSection
        events={upcoming}
        types={filters.types}
        locations={filters.locations}
        periods={filters.periods}
        copy={agenda.events}
        registration={agenda.registration}
        status={agenda.status}
        initialFilters={initialFilters}
      />
      <SupportSection support={agenda.support} />
      <PastEventsSection gallery={agenda.gallery} events={past} />
      <OutreachSection outreach={agenda.outreach} />
    </>
  );
}

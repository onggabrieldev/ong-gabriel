import type { Metadata } from "next";
import { EventsManager } from "@/components/admin/events-manager";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function EventsAdminPage() {
  return <EventsManager />;
}

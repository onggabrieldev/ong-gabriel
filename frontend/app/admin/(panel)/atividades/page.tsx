import type { Metadata } from "next";
import { ActivitiesManager } from "@/components/admin/activities-manager";

export const metadata: Metadata = {
  title: "Atividades",
};

export default function ActivitiesAdminPage() {
  return <ActivitiesManager />;
}

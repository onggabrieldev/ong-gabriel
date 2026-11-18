import type { Metadata } from "next";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export const metadata: Metadata = {
  title: "Depoimentos",
};

export default function TestimonialsAdminPage() {
  return <TestimonialsManager />;
}

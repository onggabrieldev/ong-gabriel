import type { Metadata } from "next";
import { ContactSection } from "@/components/contact/contact-section";
import { getContactPage } from "@/lib/contact/get-contact-page";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a ONG Gabriel: preencha o formulário ou acesse nossas redes sociais.",
};

export default async function ContactPage() {
  const page = await getContactPage();

  return <ContactSection contact={page.contact} headingLevel="h1" />;
}

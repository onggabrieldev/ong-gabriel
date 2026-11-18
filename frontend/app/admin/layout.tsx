import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toast";

type AdminLayoutProps = {
  children: ReactNode;
};

export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin | ONG Gabriel",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

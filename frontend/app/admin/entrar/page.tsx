import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-cream">
          <p className="text-body text-muted">Carregando…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

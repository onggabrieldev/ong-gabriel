"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useId, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getMe, logout } from "@/lib/admin/api";
import { canAccessAdmin, type MeUser, SessionEndedError } from "@/lib/admin/types";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const menuId = useId();
  const [user, setUser] = useState<MeUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await getMe();
        if (!canAccessAdmin(me)) {
          await logout();
          router.replace("/admin/entrar");
          return;
        }
        if (!cancelled) {
          setUser(me);
        }
      } catch (error) {
        if (error instanceof SessionEndedError) {
          return;
        }
        router.replace("/admin/entrar");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/admin/entrar");
  }

  if (!user) {
    return (
      <div className="flex min-h-full items-center justify-center bg-cream">
        <p role="status" className="text-body text-muted">
          Carregando painel…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-canvas lg:flex-row">
      <AdminSidebar
        username={user.username}
        menuOpen={menuOpen}
        menuId={menuId}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onLogout={() => {
          void handleLogout();
        }}
      />
      <main className="flex-1 px-4 py-8 lg:px-10 lg:py-15">{children}</main>
    </div>
  );
}

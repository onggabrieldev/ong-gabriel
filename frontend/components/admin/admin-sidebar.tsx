"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, MenuIcon } from "@/components/icons/icon";
import { siteBrand } from "@/lib/site/navigation";

const adminNav = [
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/atividades", label: "Atividades" },
  { href: "/admin/agenda", label: "Agenda" },
] as const;

type AdminSidebarProps = {
  username: string;
  menuOpen: boolean;
  menuId: string;
  onToggleMenu: () => void;
  onLogout: () => void;
};

export function AdminSidebar({
  username,
  menuOpen,
  menuId,
  onToggleMenu,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col bg-cream lg:sticky lg:top-0 lg:h-dvh lg:w-90 lg:shrink-0 lg:overflow-y-auto lg:shadow-header">
      <div className="flex items-center gap-3 px-4 py-4 lg:px-4 lg:pt-4">
        <Link
          href="/admin/depoimentos"
          className="flex items-center gap-2 rounded-full transition-colors hover:text-indigo"
        >
          <Image src="/brand/logo.svg" alt="" width={54} height={54} />
          <span className="text-label font-bold text-soil">{siteBrand}</span>
        </Link>
        <button
          type="button"
          className="ms-auto inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-butter lg:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={onToggleMenu}
        >
          {menuOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          <span className="sr-only">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
        </button>
      </div>

      <div
        id={menuId}
        className={`flex-1 flex-col px-4 pb-6 lg:flex lg:pt-10 ${menuOpen ? "flex" : "hidden lg:flex"}`}
      >
        <nav aria-label="Administração" className="flex flex-col gap-2">
          {adminNav.map((item) => {
            const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                onClick={() => {
                  if (menuOpen) {
                    onToggleMenu();
                  }
                }}
                className={`rounded-lg px-2 py-2 text-body text-text transition-colors hover:bg-saffron-soft ${
                  current ? "bg-butter" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3 pt-10">
          <p className="px-2 text-body text-muted">
            Conectado como <span className="font-semibold text-text">{username}</span>
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

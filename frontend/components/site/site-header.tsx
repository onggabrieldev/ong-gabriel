"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useId, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button-link";
import { useCloseOnBackdrop } from "@/components/ui/close-on-backdrop";
import { donationLink, mainNav, siteBrand } from "@/lib/site/navigation";

function isCurrent(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  if (href.startsWith("/#")) {
    return false;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const donationCurrent = isCurrent(donationLink.href, pathname) ? "page" : undefined;
  const menuId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useCloseOnBackdrop(dialogRef);

  function scrollHomeToTop(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") {
      return;
    }
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function openMenu() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function closeMenu() {
    setOpen(false);
    dialogRef.current?.close();
  }

  return (
    <header className="sticky top-0 z-30 bg-cream shadow-header">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-21.5 max-w-360 items-center gap-4 px-4 lg:h-22 lg:px-20"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 rounded-full transition-colors hover:text-indigo"
          onClick={scrollHomeToTop}
        >
          <Image src="/brand/logo.svg" alt="" width={54} height={54} priority />
          <span className="text-label font-bold whitespace-nowrap text-soil">{siteBrand}</span>
        </Link>

        <ul className="ms-auto hidden items-center lg:flex">
          {mainNav.map((item) => {
            const current = isCurrent(item.href, pathname);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`inline-flex items-center px-4 py-1 text-label font-semibold transition-colors hover:text-soil hover:underline hover:decoration-2 hover:underline-offset-8 ${
                    current ? "text-soil underline decoration-2 underline-offset-8" : "text-text"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ms-4 hidden lg:block">
          <ButtonLink href={donationLink.href} aria-current={donationCurrent} className="w-50">
            {donationLink.label}
          </ButtonLink>
        </div>

        <button
          type="button"
          className="ms-auto inline-flex size-12 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sky-deep lg:hidden"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={menuId}
          onClick={openMenu}
        >
          <MenuIcon className="size-7" />
          <span className="sr-only">Abrir menu</span>
        </button>
      </nav>

      <dialog
        ref={dialogRef}
        id={menuId}
        aria-label="Menu"
        className="w-[min(100%,--spacing(80))] rounded-xl bg-cream p-6 text-ink-soft"
        onClose={() => setOpen(false)}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="font-bold text-soil">{siteBrand}</p>
          <button
            type="button"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-sky-deep"
            onClick={closeMenu}
          >
            <CloseIcon className="size-6" />
            <span className="sr-only">Fechar menu</span>
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {mainNav.map((item) => {
            const current = isCurrent(item.href, pathname);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 text-label font-semibold transition-colors hover:text-soil hover:underline hover:decoration-2 hover:underline-offset-8 ${
                    current ? "text-soil underline decoration-2 underline-offset-8" : ""
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <ButtonLink
          href={donationLink.href}
          aria-current={donationCurrent}
          className="mt-6 w-full"
          onClick={closeMenu}
        >
          {donationLink.label}
        </ButtonLink>
      </dialog>
    </header>
  );
}

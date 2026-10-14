import Image from "next/image";
import Link from "next/link";
import { SocialIcon } from "@/components/icons/icon";
import { CopyrightYear } from "@/components/site/copyright-year";
import { mainNav, siteBrand, siteName, socialProfiles } from "@/lib/site/navigation";

export function SiteFooter() {
  return (
    <footer className="bg-canvas text-text">
      <div className="mx-auto flex max-w-360 flex-col gap-8 px-6 py-12 lg:px-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full transition-colors hover:text-indigo"
          >
            <Image src="/brand/logo.svg" alt="" width={54} height={54} />
            <span className="text-title font-bold text-soil">{siteBrand}</span>
          </Link>
          <ul className="flex gap-4">
            {socialProfiles.map((profile) => (
              <li key={profile.id}>
                <a
                  href={profile.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-11 items-center justify-center rounded-full text-soil transition-colors hover:text-indigo"
                >
                  <SocialIcon id={profile.id} className="size-6" />
                  <span className="sr-only">{profile.label} (abre em uma nova aba)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Rodapé">
          <ul className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            {mainNav.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="inline-flex px-2 py-2 text-label font-semibold transition-colors hover:text-soil hover:underline hover:decoration-2 hover:underline-offset-8"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <hr className="border-line" />

        <div className="flex flex-col items-center gap-3 text-center text-sm font-medium text-muted">
          <p>Produzido por Squad Luz Rosa, voluntariado Pipoca Ágil.</p>
          <p>
            {siteName} © <CopyrightYear />. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

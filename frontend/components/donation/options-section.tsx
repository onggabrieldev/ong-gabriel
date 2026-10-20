import Image from "next/image";
import { CopyButton } from "@/components/ui/copy-button";
import type { DonationOptionsContent } from "@/lib/donation/types";

type OptionsSectionProps = {
  options: DonationOptionsContent;
};

export function OptionsSection({ options }: OptionsSectionProps) {
  const { pix, bank } = options;

  return (
    <section id="como-doar" aria-labelledby="options-title" className="scroll-mt-24 bg-canvas">
      <div className="mx-auto flex max-w-360 flex-col gap-10 px-4 py-16 lg:gap-20 lg:px-20 lg:py-20">
        <h2
          id="options-title"
          className="text-center text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
        >
          {options.heading}
        </h2>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-15">
          <article
            aria-labelledby="pix-title"
            className="flex flex-col items-center gap-8 rounded-[1.25rem] bg-cream px-6 py-6 lg:gap-10 lg:px-10"
          >
            <h3 id="pix-title" className="text-center text-title font-bold text-ink">
              {pix.title}
            </h3>
            <Image
              src={pix.qrCode.src}
              alt={pix.qrCode.alt}
              width={pix.qrCode.width}
              height={pix.qrCode.height}
              className="size-50 rounded-lg bg-white [image-rendering:pixelated] lg:size-62.5"
            />
            <div className="flex w-full flex-col gap-4">
              <div>
                <p className="text-label font-semibold text-ink">{pix.keyLabel}</p>
                <p className="mt-2 text-body text-text">
                  {pix.keyType}: <span className="font-semibold text-ink-soft">{pix.key}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <CopyButton
                  value={pix.keyValue}
                  label={pix.copyKeyLabel}
                  copiedMessage="Chave Pix copiada"
                />
                <CopyButton
                  value={pix.code}
                  label={pix.copyCodeLabel}
                  copiedMessage="Código Pix copiado"
                />
              </div>
            </div>
          </article>

          <article
            aria-labelledby="bank-title"
            className="flex flex-col gap-8 rounded-[1.25rem] bg-cream px-6 py-6 lg:gap-10 lg:px-10"
          >
            <h3 id="bank-title" className="text-center text-title font-bold text-ink">
              {bank.title}
            </h3>
            <dl className="flex flex-col gap-6 lg:gap-10 lg:py-5">
              {bank.details.map((detail) => (
                <div key={detail.id} className="flex items-baseline gap-4">
                  <dt className="text-label font-semibold text-ink">{detail.label}:</dt>
                  <dd className="text-body text-text">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}

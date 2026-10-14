import Image from "next/image";
import type { Testimonial } from "@/lib/home/types";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const initial = testimonial.name.trim().charAt(0).toUpperCase();

  return (
    <figure className="flex h-full flex-col gap-4 rounded-md bg-cream px-3 py-6 text-center shadow-photo">
      <blockquote className="flex gap-1 text-body text-graphite">
        <span aria-hidden="true" className="font-display text-title text-sun">
          “
        </span>
        <p className="flex-1">{testimonial.quote}</p>
        <span aria-hidden="true" className="font-display text-title text-sun">
          ”
        </span>
      </blockquote>
      <figcaption className="mt-auto flex items-center justify-center gap-4 py-2">
        {testimonial.portrait ? (
          <Image
            src={testimonial.portrait.src}
            alt=""
            width={70}
            height={70}
            className="size-17.5 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex size-17.5 items-center justify-center rounded-full bg-sky-deep text-title font-bold text-indigo"
          >
            {initial}
          </span>
        )}
        <span>
          <span className="block text-title font-bold text-soil">{testimonial.name}</span>
          <span className="block text-body text-text">{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

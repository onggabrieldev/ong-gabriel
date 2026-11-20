import Image from "next/image";
import { TestimonialCard } from "@/components/home/testimonial-card";
import type { TestimonialsContent } from "@/lib/home/types";

type TestimonialsSectionProps = {
  testimonials: TestimonialsContent;
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="testimonials-title" className="relative overflow-hidden">
      <Image src={testimonials.background.src} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-sky-deep/70" aria-hidden="true" />
      <div className="relative mx-auto max-w-360 px-4 py-16 lg:px-20 lg:py-28">
        <h2 id="testimonials-title" className="sr-only">
          {testimonials.heading}
        </h2>
        <ul className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {testimonials.items.map((testimonial) => (
            <li key={testimonial.id} className="w-full lg:w-[calc((100%_-_--spacing(16))/3)]">
              <TestimonialCard testimonial={testimonial} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

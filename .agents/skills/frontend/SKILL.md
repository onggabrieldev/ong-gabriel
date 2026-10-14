---
name: frontend
description: >
  Next.js and Tailwind conventions for the ONG Gabriel site.
  Use when writing or changing frontend UI, layout, Tailwind classes,
  tokens, or components.
---

# Frontend

Product rules are in `CONTEXT.md`. The app is `frontend/`: Next.js App Router and Tailwind 4. Tokens live in `frontend/app/globals.css`.

## Class names

The spacing scale is `0.25rem` per step. A length on that scale is the step, not an arbitrary rem.

- `max-w-[90rem]` is `max-w-360`
- `lg:h-[21.25rem]` is `lg:h-85`
- `h-[5.375rem]` is `h-21.5`

A ratio is the bare form: `aspect-4/5`, not `aspect-[4/5]`.

A length inside `min()`, `max()`, `clamp()`, or `minmax()` stays in brackets and uses `--spacing(n)`. An underscore in a class is a space.

```html
<div class="w-[min(100%,--spacing(96))]">
```

That `96` is `24rem`.

Keep brackets when the value is not a spacing step: a percentage radius, a one-off line height, or a font size that is not a token. Type tokens in `globals.css` are `text-display`, `text-headline`, `text-title`, `text-label`, and `text-body`.

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

## Controls

Every clickable control gets `cursor-pointer`. Tailwind preflight sets `cursor: default` on `<button>`, so a button without the class looks dead. Links already show a pointer; still add hover.

Hover changes something visible: background, text color, or underline. Do not hover to the same color as the surface behind the control. Use `transition-colors` for color and `transition-transform` for a small move. Respect `prefers-reduced-motion`.

## Dialogs

Use a native `<dialog>` opened with `showModal()` so Escape, focus trap, and focus return stay built in. Name it with `aria-labelledby` or `aria-label`. The control that opens it has `aria-haspopup="dialog"` and `aria-controls`.

The close control is a button with an accessible name, `cursor-pointer`, and a hover state. A click outside the dialog panel closes it. Call `useCloseOnBackdrop` from `frontend/components/ui/close-on-backdrop.ts` with the dialog ref. Do not put that click on `onClick`: Biome treats it as a mouse-only control, and Escape already closes a native dialog.

## Screen readers

`lang` stays on `<html>`. Every control has a name from its text or from visually hidden text. Decorative images use `alt=""`. Meaningful images use a real `alt`. Decorative icons are `aria-hidden`.

Mark the current page with `aria-current="page"`. A control that opens a menu or dialog exposes that state (`aria-expanded`, `aria-haspopup`). An external link says it opens a new tab, in the accessible name.

A form error is tied to its field with `aria-invalid` and `aria-describedby`. An empty reserved error slot is `aria-hidden` so it is not read as a blank paragraph. Status text that appears after an action goes in a live region (`role="status"`).

## Text selection

Selected text uses the brand soil brown, with cream text so it stays readable:

```css
::selection {
  background: var(--color-soil);
  color: var(--color-cream);
}
```

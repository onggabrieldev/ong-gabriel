# Agents

Read `CONTEXT.md` before changing the product. Skills live under `.agents/skills/`.

## Layout

- `backend/` is the FastAPI app. `frontend/` is the Next.js app. Keep that split.
- The uv workspace and the pnpm workspace are rooted at the repository. `uv.lock` and `.venv` stay at the root.
- `bkp-repos/` is a local, gitignored copy of the old Django API and Next.js app. Open it only for a migration question. Do not port the CMS.

## Skills

- Python and FastAPI, including settings and types: `fastapi`.
- Next.js and Tailwind class names: `frontend`.

Type every change in Python and TypeScript.
- A new or changed route: `bruno-endpoints`.

Do not delete, skip, or weaken a test, and do not undo a settled decision, unless the user agrees.

## Secrets

Do not read `.env`, `.env.*`, credentials, tokens, or webhooks. `.env.example` with empty placeholders is fine. Do not copy secret values into code or into Bruno.

## Docs

`docs/` is an Obsidian folder: frontmatter, `[[wikilinks]]`, and callouts. Follow a wikilink to the note that owns the fact. The vault root is this repository.

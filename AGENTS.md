# Agents

Read `CONTEXT.md` before changing the product. Skills live under `.agents/skills/`.

## Layout

- `backend/` is the Django app. `frontend/` is the Next.js app. Keep that split.
- The uv workspace and the pnpm workspace are rooted at the repository. `uv.lock` and `.venv` stay at the root.
- `bkp-repos/` is a local, gitignored copy of the old Django API and Next.js app. Open it only for a migration question. Do not port the CMS.

## Skills

- Python and Django, including settings and types: `django`.
- Next.js and Tailwind class names: `frontend`.
- A new or changed route: `bruno-endpoints`.

Type every change in Python and TypeScript.

Do not delete, skip, or weaken a test, and do not undo a settled decision, unless the user agrees.

## Workflow

Where the work stands and what comes next is in `docs/next-steps.md`. Work on a branch in the main checkout, created from an up-to-date `main`, not in a separate worktree. Leave changes uncommitted until the owner tests and approves them.

## Secrets

Do not read `.env`, `.env.*`, credentials, tokens, or webhooks. `.env.example` with empty placeholders is fine. Do not copy secret values into code or into Bruno.

## Docs

`docs/` is an Obsidian folder: frontmatter, `[[wikilinks]]`, and callouts. Follow a wikilink to the note that owns the fact. The vault root is this repository.

# DocuNest

A lightweight collaborative document editor (Google Docs–inspired), built with
Next.js (App Router), TypeScript, Tailwind CSS and Tiptap.

## Status

Boilerplate. Working end to end today: mocked login, create/rename/edit/save
documents with rich text, `.txt`/`.md` import, owner-based sharing with
editor/viewer access, owned vs. shared lists. **Storage is in-memory** (data is
lost on restart) — see "Next steps".

## Run locally

Requires Node.js 20.19+ (tested on 24).

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (vitest)
npm run lint
npm run build
```

## Review accounts

Sign-in is mocked: pick a seeded user on `/login` (no password).

| User | Email |
| --- | --- |
| Alice Anderson | alice@example.com |
| Bob Bennett | bob@example.com |
| Carol Chen | carol@example.com |

To try sharing: sign in as Alice, create a document, share it with Bob, then
use "Switch user" and sign in as Bob — it appears under "Shared with me".

## File upload

Supported: `.txt`, `.md` (max 1 MB). Each upload becomes a new editable
document titled after the file. Markdown is currently imported as plain text.

## Project layout

```
src/app/              routes + server actions (actions.ts)
src/components/       DocumentEditor (Tiptap), Toolbar
src/lib/access.ts     owner / editor / viewer permission logic
src/lib/store/        DocumentStore interface + in-memory implementation
src/lib/validation.ts zod schemas
src/lib/import.ts     upload parsing
```

## Next steps

- [ ] Durable storage: implement `DocumentStore` on SQLite/Postgres/Supabase
- [ ] Deploy and add the live URL to SUBMISSION.md
- [ ] Render Markdown on import; consider `.docx`
- [ ] Autosave; component/e2e test for the sharing flow
- [ ] Fill in ARCHITECTURE.md and AI_WORKFLOW.md with real notes

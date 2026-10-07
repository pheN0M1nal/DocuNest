# DocuNest

A lightweight collaborative document editor (Google Docs–inspired), built with
Next.js (App Router), TypeScript, Tailwind CSS and Tiptap.

## Status

Boilerplate. Working end to end today: mocked login, create/rename/edit/save
documents with rich text, `.txt`/`.md` import, owner-based sharing with
editor/viewer access, owned vs. shared lists. Data is stored in SQLite via
libSQL (see "Database").

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


## Database

Documents and shares are stored with [libSQL](https://github.com/tursodatabase/libsql).

- **Local development:** nothing to configure. A SQLite file is created at
  `data/docunest.db` (git-ignored) and tables are created on first use.
- **Production (Turso, free tier):** create a database, then set
  `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (see `.env.example`).

```bash
turso db create docunest
turso db show docunest --url
turso db tokens create docunest
```

Seeded users live in code (`src/lib/users.ts`), so sharing can be demoed on a
fresh database with no seeding step.
## File upload

Supported: `.txt`, `.md` (max 1 MB). Each upload becomes a new editable
document titled after the file. Markdown is rendered (headings, lists, bold,
italic); raw HTML is escaped and links are reduced to their text.

## Project layout

```
src/app/              routes + server actions (actions.ts)
src/components/       DocumentEditor (Tiptap), Toolbar
src/lib/access.ts     owner / editor / viewer permission logic
src/lib/store/        DocumentStore interface, libSQL store, in-memory store (tests)
src/lib/validation.ts zod schemas
src/lib/import.ts     upload parsing
```

## Next steps

- [ ] Deploy and add the live URL to SUBMISSION.md
- [ ] Consider `.docx` import
- [ ] Autosave; component/e2e test for the sharing flow
- [ ] Fill in ARCHITECTURE.md and AI_WORKFLOW.md with real notes

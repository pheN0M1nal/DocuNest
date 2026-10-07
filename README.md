# DocuNest

A lightweight collaborative document editor (Google Docs–inspired), built with
Next.js (App Router), TypeScript, Tailwind CSS and Tiptap.

## Status

Working end to end: mocked login, create/rename/edit/autosave
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

## Tests

`npm test` runs 47 tests: access rules, both stores (in-memory and libSQL run
the same cases), file import, and the save, import, share and unshare actions.

## Deploying (Vercel)

1. Create a Turso database and token (see "Database").
2. Import the GitHub repo in Vercel.
3. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` under Settings, Environment
   Variables. The build fails with a clear message if they are missing.
4. Deploy. Tables are created on first use; the seeded users need no setup.

## Notes

- `ARCHITECTURE.md` explains what was prioritized and why.
- `AI_WORKFLOW.md` covers how AI tools were used.
- `SUBMISSION.md` lists what is included, known gaps, and next steps.

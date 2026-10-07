# Persistence

## Goals

- Documents survive refresh, restart, and redeploy
- Sharing data persists with the documents
- HTML formatting round-trips unchanged
- Seeded users can demo sharing right after a fresh deploy

## Notes

- Replace the in-memory store with a durable `DocumentStore` implementation
- Interface is `src/lib/store/types.ts`; UI and actions should not change
- Database choice is open. Must be free for reviewers and work on the deploy target
  - Recommended: Turso (libSQL) for SQLite semantics on Vercel
  - Alternative: Supabase Postgres
  - Local file/SQLite will not work on serverless hosts
- Schema: `documents` (id, title, content_html, owner_id, timestamps) and `shares` (document_id, user_id, access)
- Keep the in-memory store for unit tests
- Document setup (env vars, migrations) in the README

# Architecture note

DocuNest is a small collaborative document editor: create, edit, import and share rich-text documents. It is a single Next.js app (App Router) with no separate API service.

## What I prioritized, and why

1. **The core loop first.** Create, rename, edit, autosave, reopen. If this feels bad, nothing else matters.
2. **A small, testable access model.** One file (`src/lib/access.ts`) decides who is owner, editor, viewer or nobody. Every page and server action goes through it, so the rules live in one place and are unit tested.
3. **Real persistence behind a thin interface.** `DocumentStore` has six methods. The app uses a libSQL implementation; tests also run against an in-memory one, so one test set checks both behave the same.
4. **Depth over breadth.** Four things work well rather than ten working badly. The cuts are listed in `SUBMISSION.md`.

## How it fits together

```
Browser (Tiptap editor, share dialog)
   |  server actions (src/app/actions.ts)
   v
Zod validation  ->  access rules (access.ts)  ->  DocumentStore
                                                   |-- libSQL: local SQLite file, or Turso in production
                                                   '-- in-memory (tests only)
```

- **Frontend:** server components render pages; two client components (`DocumentEditor`, `ShareDialog`) handle interactivity.
- **Backend:** Next.js server actions, not REST routes. Fewer moving parts and typed calls for this scope.
- **Storage:** `documents` and `shares` tables. Content is stored as the HTML the editor produces, which keeps formatting intact and is simple to render.

## Key decisions

- **Tiptap for rich text.** Bold, italic, underline, headings and lists come from its starter kit, with real keyboard shortcuts. Writing an editor from `contenteditable` would have burned the whole time box.
- **Mocked login.** Three seeded users, chosen on `/login`, with the user id in an httpOnly cookie. This keeps the focus on the sharing logic and lets reviewers switch users in one click. It is **not secure** and is explicitly a demo mechanism.
- **Authorization on the server.** The UI hides buttons users can't use, but every action re-checks the role. Someone without access gets a 404, so document ids can't be probed.
- **Autosave with last-write-wins.** Edits save after a one-second pause. There is no merging, so two people editing at once can overwrite each other.
- **Safe imports.** Uploaded Markdown is rendered with `marked`, but raw HTML is escaped and links and images become plain text, so an uploaded file can't inject markup.
- **Turso for production.** SQLite semantics, free tier, works on serverless hosts where a local file would not.

## What I deliberately did not build

Real authentication, real-time collaboration, version history, `.docx` import and tables. See `SUBMISSION.md` for the full list and what I would build next.

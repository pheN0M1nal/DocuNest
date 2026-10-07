# Architecture note

> Draft — update as decisions are finalized.

## What was prioritized
- Core document loop (create, rename, edit, save, reopen) over breadth of formatting.
- A small, testable access model (`src/lib/access.ts`) shared by pages and actions.
- A `DocumentStore` interface so persistence can change without touching UI or actions.

## Key decisions
- **Next.js server actions** instead of a separate REST API: fewer moving parts for this scope.
- **Tiptap** (ProseMirror) for rich text; content stored as HTML.
- **Mocked auth** (seeded users, cookie holds user id): keeps the focus on sharing logic.
  Not secure; it is a demo mechanism only.
- **Authorization is enforced server-side** in every action; "no access" returns 404.

## Deliberately deprioritized
- Real authentication, real-time collaboration, version history, `.docx` import.

## Open decisions
- Persistence choice and deployment target (the in-memory store does not satisfy the persistence requirement).

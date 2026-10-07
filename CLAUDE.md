# DocuNest

Lightweight collaborative document editor (Google Docs-inspired). Next.js App Router, TypeScript, Tailwind, Tiptap, zod, vitest.

The brief is in `context/ask/assignment.md`; the short version is `context/ask/key-points.md`. UX inspiration is `context/inspiration/google-docs.md`. Feature specs are in `context/features/`, driven by `/feature`.

## Code Style

- Super readable code. Short functions, clear names, one job each.
- Keep it simple and to the point. No clever abstractions, no speculative features.
- No large comments. Code explains itself; add a one-line comment only for a non-obvious "why".
- Match the surrounding code's naming and idioms.

## Commands

- `npm run dev` - dev server
- `npm test` - vitest
- `npm run lint`
- `npm run build`

## Architecture

- `src/app/` - routes and server actions (`actions.ts`)
- `src/components/` - client components (editor, toolbar)
- `src/lib/access.ts` - owner/editor/viewer permission rules
- `src/lib/store/` - `DocumentStore` interface and implementations
- `src/lib/validation.ts` - zod schemas
- `src/lib/import.ts` - file import

Authorization is enforced in server actions and pages, never only in the UI.

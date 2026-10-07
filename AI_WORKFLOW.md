# AI workflow note

> Drafted with Claude from the session history. Edit anything that doesn't match your own experience, and fill in the manual testing line.

## Tools used

- **Claude Code** (Sonnet 5.5) in VS Code for scaffolding, implementation, tests and code review.
- A spec-driven loop: one spec file per feature in `context/features/`, driven by a project `/feature` command (load, start, test, review, complete). `CLAUDE.md` set the code style: short, readable, no large comments.

## Where AI materially sped things up

- **Scaffold and boilerplate.** The Next.js app, Tiptap editor, access model, validation and store layer were up in the first session.
- **Two store implementations behind one test set.** The in-memory and libSQL stores share one test file, so adding `unshare` meant writing each test once.
- **Test writing.** The server action tests (permissions for save, import, share and unshare) are mostly AI-written and cover the owner, editor, viewer and stranger cases.
- **Review passes.** Reading each finished feature as a reviewer caught real bugs (below).

## What I changed or rejected

- **Scaffold defaults.** Removed `cacheComponents` and `partialPrefetching` from the generated Next config; they force `<Suspense>` around the cookie-based session reads.
- **Markdown as plain text.** The first import treated `.md` as paragraphs. I replaced it with `marked` plus a restricted renderer, because the library's default would keep raw HTML.
- **Bugs found in review, not by the first pass of code:**
  - Autosave dropped the last edits if you navigated away within a second. Fixed with a save on leave and a "leave site?" warning.
  - Files between 1 and 2 MB hit Next's default 1 MB request cap and got a raw 500 instead of our message. Raised the cap.
  - A failed first schema setup was cached forever. It now retries.
- **A wrong check I caught.** A PowerShell request that "proved" data was missing after a restart was really hitting the login page because the cookie wasn't sent. I re-checked with `curl` before trusting it.
- **Dev-only stale state.** After a store change, the dev server kept the old store cached and returned a 500. I recognized it as a dev cache issue and restarted instead of changing code.

## How I verified it

- **Automated:** 47 unit and action tests, ESLint, TypeScript and a production build before each merge.
- **Live checks:** posted real files and forms to the running app with `curl` (import, share, change, remove, non-owner attempts) and checked the results, including the stored HTML read straight from the database.
- **Real database:** repeated the restart test against Turso, then deleted my test data.
- **Manual UI testing:** _TODO: describe what you clicked through in the browser, and anything you changed after seeing it._

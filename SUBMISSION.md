# Submission

> Fill in before submitting. List exactly what is included.

- Source code
- README.md — setup and run instructions
- ARCHITECTURE.md — architecture note
- AI_WORKFLOW.md — AI workflow note
- SUBMISSION.md — this file
- walkthrough-video.txt — video URL
- Live URL: _TODO_

## Status
- **Working:**
  - Create, rename and edit documents with bold, italic, underline, H1/H2, bulleted and numbered lists; autosave with a visible save status
  - Import `.txt` and `.md` files (max 1 MB) as new editable documents
  - Sharing: the owner shares with another user as editor or viewer, and can change or remove access; owned and shared documents are listed separately
  - Persistence in libSQL (Turso in production, a local SQLite file in development)
  - 47 automated tests covering access rules, both stores, import, and the save, import, share and unshare actions
- **Incomplete:** the live deployment is not up yet; see "Deliberately deprioritized" below for known gaps
- **Next, with 2–4 more hours:**
  - Real authentication in place of the seeded users
  - `.docx` import and Markdown export
  - Version history, then presence indicators
  - Browser tests (Playwright) for the share and edit flows

## Deliberately deprioritized

Known gaps, cut on purpose to stay inside the time box.

**Sharing**
- The share dialog reopens on refresh because `?share=open` stays in the URL
- Clicking outside the dialog does not close it (Escape and ✕ do)
- Dialog look in dark mode not checked in a browser

**File upload**
- Markdown tables are dropped on import (the editor has no tables)
- Only UTF-8 text is read correctly; other encodings import garbled
- Files over 2 MB hit Next.js's request limit and return a generic 500
- `.docx` is not supported

**Product and infrastructure**
- Login is mocked (seeded users, no passwords), not real authentication
- Concurrent edits are last-write-wins; no real-time collaboration or version history

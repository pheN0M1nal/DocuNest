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
- **Working:** _TODO_
- **Incomplete:** _TODO_
- **Next, with 2–4 more hours:** _TODO_

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
- Deploying without the Turso env vars on a read-only host fails with an unclear error

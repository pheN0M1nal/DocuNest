# Current Feature

## Status

Not Started

## Goals

## Notes

## History

- Document Creation and Editing: debounced autosave with save status (saved, unsaved, saving, error), edits kept on failed saves, save on leave and unload warning for unsaved changes, toolbar shortcut hints. Added tests for `saveDocumentSchema` and the `saveDocument` action's permission checks.
- File Upload: `.txt` and `.md` import (max 1 MB) into a new document titled after the file. Markdown is rendered with `marked`; raw HTML is escaped and links and images become text. Clear errors for unsupported, empty, missing and oversized files; server action body limit raised to 2 MB so oversized files get our message. Added tests for `importUpload` and the `importDocument` action.
- Persistence: documents and shares stored in libSQL (local SQLite file in development, Turso when `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set). Schema is created on first use and retried if setup fails. The in-memory store is kept for tests, and one shared test set runs against both stores. Verified on Turso: documents and shares survive a server restart with formatting intact.
- Sharing: Share button and dialog on the editor for the owner, with change and remove access (`unshare` added to both stores and a new `unshareDocument` action). Shared rows show who shared and the access level. Added tests for the share and unshare actions, `roleLabel`, and `unshare` on both stores. Small polish gaps are listed under "Deliberately deprioritized" in SUBMISSION.md.

# Current Feature

## Status

Not Started

## Goals

## Notes

## History

- Document Creation and Editing: debounced autosave with save status (saved, unsaved, saving, error), edits kept on failed saves, save on leave and unload warning for unsaved changes, toolbar shortcut hints. Added tests for `saveDocumentSchema` and the `saveDocument` action's permission checks.
- File Upload: `.txt` and `.md` import (max 1 MB) into a new document titled after the file. Markdown is rendered with `marked`; raw HTML is escaped and links and images become text. Clear errors for unsupported, empty, missing and oversized files; server action body limit raised to 2 MB so oversized files get our message. Added tests for `importUpload` and the `importDocument` action.

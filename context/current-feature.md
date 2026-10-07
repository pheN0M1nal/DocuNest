# Current Feature: Document Creation and Editing

## Status

Not Started

## Goals

- Create a new document from the documents list
- Rename a document inline from the title field
- Edit content in the browser with Tiptap
- Support bold, italic, underline, H1/H2, bulleted and numbered lists
- Save and reopen a document with formatting preserved
- Show save status (saving, saved, error)
- Viewers see content read-only with no toolbar or save button

## Notes

- Content is stored as HTML from `editor.getHTML()`
- Title and content save together via the `saveDocument` server action
- Boilerplate exists in `DocumentEditor.tsx` and `Toolbar.tsx`; polish the UX rather than rebuild
- Nice to have: debounced autosave instead of manual Save only
- Title is required, max 120 characters (see `validation.ts`)
- From key-points: the editing flow must feel usable and coherent; depth over breadth, no extra Google Docs features
- From key-points: a failed save must not lose the user's edits
- Google Docs inspiration: title inline and defaulting to "Untitled document", toolbar highlights active formatting, Ctrl+B/I/U, centered page-like column, "Saving.../Saved" next to the title
- Keep an AI log and note scope cuts as we go (for `AI_WORKFLOW.md` and `SUBMISSION.md`)

## History

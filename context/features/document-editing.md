# Document Creation and Editing

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
- Nice to have: autosave (debounced) instead of manual Save only
- Title is required, max 120 characters (see `validation.ts`)

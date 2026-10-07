# File Upload

## Goals

- Upload a `.txt` or `.md` file from the documents page
- Turn the upload into a new editable document titled after the file
- Render Markdown properly (headings, lists, bold, italic) instead of plain text
- State supported types in the UI and README
- Reject unsupported types, empty files, and files over 1 MB with a clear message

## Notes

- Parsing lives in `src/lib/import.ts`; the `importDocument` server action calls it
- Imported HTML must be escaped or sanitized; never store raw uploaded markup
- `.docx` is out of scope unless time allows (mammoth would be the likely tool)
- Add tests for each supported type and each rejection case

/** File types the upload flow accepts. Surfaced in the UI and README. */
export const SUPPORTED_UPLOAD_EXTENSIONS = [".txt", ".md"] as const;
export const MAX_UPLOAD_BYTES = 1_000_000;

export class UnsupportedFileError extends Error {}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function isSupportedFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SUPPORTED_UPLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Title for an imported document: the filename without its extension. */
export function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").trim() || "Untitled";
}

/**
 * Convert uploaded text into editor HTML.
 * TODO: render Markdown properly (headings, lists, emphasis) for .md files;
 * for now both formats are imported as plain paragraphs.
 */
export function textToHtml(filename: string, text: string): string {
  if (!isSupportedFile(filename)) {
    throw new UnsupportedFileError(
      `Unsupported file type. Supported: ${SUPPORTED_UPLOAD_EXTENSIONS.join(", ")}`,
    );
  }
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return "<p></p>";
  return paragraphs
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

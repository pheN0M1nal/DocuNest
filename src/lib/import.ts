import { Marked } from "marked";
import { MAX_TITLE_LENGTH } from "./validation";

export const SUPPORTED_UPLOAD_EXTENSIONS = [".txt", ".md"] as const;
export const MAX_UPLOAD_BYTES = 1_000_000;

export type ImportResult =
  | { ok: true; title: string; html: string }
  | { ok: false; error: string };

interface UploadedFile {
  name: string;
  size: number;
  text(): Promise<string>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Raw HTML is escaped; links and images become plain text.
const markdown = new Marked({
  async: false,
  renderer: {
    html: ({ text }) => escapeHtml(text),
    link(token) {
      return this.parser.parseInline(token.tokens);
    },
    image: ({ text }) => escapeHtml(text),
  },
});

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

function titleFromFilename(filename: string): string {
  const title = filename.replace(/\.[^.]+$/, "").trim() || "Untitled";
  return title.slice(0, MAX_TITLE_LENGTH);
}

function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function contentToHtml(extension: string, text: string): string {
  const normalized = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const html =
    extension === ".md"
      ? (markdown.parse(normalized) as string)
      : plainTextToHtml(normalized);
  return html.trim() || "<p></p>";
}

export async function importUpload(file: UploadedFile): Promise<ImportResult> {
  if (!file.name) return { ok: false, error: "Choose a file to upload" };

  const extension = extensionOf(file.name);
  if (!(SUPPORTED_UPLOAD_EXTENSIONS as readonly string[]).includes(extension)) {
    return {
      ok: false,
      error: `Unsupported file type "${extension || file.name}". Supported: ${SUPPORTED_UPLOAD_EXTENSIONS.join(", ")}`,
    };
  }
  if (file.size === 0) return { ok: false, error: "File is empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "File is too large (max 1 MB)" };

  const html = contentToHtml(extension, await file.text());
  return { ok: true, title: titleFromFilename(file.name), html };
}

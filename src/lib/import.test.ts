import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, importUpload } from "./import";
import { MAX_TITLE_LENGTH } from "./validation";

function file(name: string, text: string, size = text.length) {
  return { name, size, text: async () => text };
}

async function importOk(name: string, text: string) {
  const result = await importUpload(file(name, text));
  if (!result.ok) throw new Error(result.error);
  return result;
}

describe("importing .txt", () => {
  it("turns blank-line separated text into paragraphs and escapes HTML", async () => {
    const { html } = await importOk("notes.txt", "one\n\n<b>two</b>\nline");
    expect(html).toBe("<p>one</p><p>&lt;b&gt;two&lt;/b&gt;<br>line</p>");
  });

  it("titles the document after the file", async () => {
    const { title } = await importOk("Meeting notes.txt", "hello");
    expect(title).toBe("Meeting notes");
  });

  it("handles Windows line endings and a BOM", async () => {
    const { html } = await importOk("a.txt", "﻿one\r\n\r\ntwo");
    expect(html).toBe("<p>one</p><p>two</p>");
  });

  it("falls back to an empty paragraph for whitespace-only text", async () => {
    const { html } = await importOk("blank.txt", "  \n\n  ");
    expect(html).toBe("<p></p>");
  });
});

describe("importing .md", () => {
  it("renders headings, emphasis and lists", async () => {
    const { html } = await importOk("a.md", "# Title\n\n**bold** and *italic*\n\n- one\n- two\n\n1. first");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
  });

  it("escapes raw HTML instead of keeping it", async () => {
    const { html } = await importOk("a.md", "<script>alert(1)</script>\n\nhi <img src=x onerror=alert(1)>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
  });

  it("keeps link text but drops the link", async () => {
    const { html } = await importOk("a.md", "[click](javascript:alert(1)) ![alt text](x.png)");
    expect(html).not.toContain("href");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("click");
    expect(html).toContain("alt text");
  });
});

describe("rejecting uploads", () => {
  it("rejects unsupported file types", async () => {
    const result = await importUpload(file("report.docx", "x"));
    expect(result).toEqual({
      ok: false,
      error: 'Unsupported file type ".docx". Supported: .txt, .md',
    });
  });

  it("rejects a missing file", async () => {
    expect(await importUpload(file("", ""))).toEqual({ ok: false, error: "Choose a file to upload" });
  });

  it("rejects an empty file", async () => {
    expect(await importUpload(file("empty.txt", ""))).toEqual({ ok: false, error: "File is empty" });
  });

  it("rejects a file over the size limit", async () => {
    const result = await importUpload(file("big.txt", "x", MAX_UPLOAD_BYTES + 1));
    expect(result).toEqual({ ok: false, error: "File is too large (max 1 MB)" });
  });
});

describe("titles", () => {
  it("truncates long filenames to the title limit", async () => {
    const { title } = await importOk(`${"a".repeat(300)}.txt`, "hi");
    expect(title).toHaveLength(MAX_TITLE_LENGTH);
  });
});

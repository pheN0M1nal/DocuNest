import { describe, expect, it } from "vitest";
import { UnsupportedFileError, textToHtml, titleFromFilename } from "./import";

describe("file import", () => {
  it("turns blank-line separated text into paragraphs and escapes HTML", () => {
    expect(textToHtml("notes.txt", "one\n\n<b>two</b>\nline")).toBe(
      "<p>one</p><p>&lt;b&gt;two&lt;/b&gt;<br>line</p>",
    );
  });

  it("rejects unsupported file types", () => {
    expect(() => textToHtml("report.docx", "x")).toThrow(UnsupportedFileError);
  });

  it("derives a title from the filename", () => {
    expect(titleFromFilename("Meeting notes.md")).toBe("Meeting notes");
  });
});

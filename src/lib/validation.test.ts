import { describe, expect, it } from "vitest";
import { MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH, saveDocumentSchema } from "./validation";

const valid = { id: "d1", title: "Plan", contentHtml: "<p>hi</p>" };

describe("saveDocumentSchema", () => {
  it("accepts a valid document and trims the title", () => {
    const result = saveDocumentSchema.parse({ ...valid, title: "  Plan  " });
    expect(result.title).toBe("Plan");
  });

  it("rejects an empty or whitespace title", () => {
    expect(saveDocumentSchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
  });

  it("rejects a title that is too long", () => {
    const title = "a".repeat(MAX_TITLE_LENGTH + 1);
    expect(saveDocumentSchema.safeParse({ ...valid, title }).success).toBe(false);
  });

  it("rejects oversized content", () => {
    const contentHtml = "a".repeat(MAX_CONTENT_LENGTH + 1);
    expect(saveDocumentSchema.safeParse({ ...valid, contentHtml }).success).toBe(false);
  });
});

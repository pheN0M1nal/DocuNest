import { z } from "zod";

export const MAX_TITLE_LENGTH = 120;
/** Upper bound on stored HTML, to reject abusive payloads. */
export const MAX_CONTENT_LENGTH = 500_000;

export const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`);

export const saveDocumentSchema = z.object({
  id: z.string().min(1),
  title: titleSchema,
  contentHtml: z.string().max(MAX_CONTENT_LENGTH, "Document is too large"),
});

export const shareDocumentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  access: z.enum(["editor", "viewer"]),
});

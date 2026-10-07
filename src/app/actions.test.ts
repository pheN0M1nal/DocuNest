import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ userId: "alice" }));

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  SESSION_COOKIE: "docunest_user",
  requireUser: async () => ({ id: session.userId }),
}));
vi.mock("@/lib/store", async () => {
  const { createMemoryStore } = await import("@/lib/store/memory");
  return { store: createMemoryStore() };
});

import { importDocument, saveDocument } from "./actions";
import { store } from "@/lib/store";

async function createSharedDoc() {
  const doc = await store.create({ ownerId: "alice", title: "Plan" });
  await store.share(doc.id, "bob", "editor");
  await store.share(doc.id, "carol", "viewer");
  return doc;
}

describe("saveDocument", () => {
  beforeEach(() => {
    session.userId = "alice";
  });

  it("saves title and content for the owner", async () => {
    const doc = await createSharedDoc();

    const result = await saveDocument({ id: doc.id, title: "New", contentHtml: "<p>x</p>" });

    expect(result).toEqual({ ok: true });
    expect(await store.get(doc.id)).toMatchObject({ title: "New", contentHtml: "<p>x</p>" });
  });

  it("lets an editor save", async () => {
    const doc = await createSharedDoc();
    session.userId = "bob";

    const result = await saveDocument({ id: doc.id, title: "By Bob", contentHtml: "<p></p>" });

    expect(result.ok).toBe(true);
  });

  it("rejects a viewer and leaves the document unchanged", async () => {
    const doc = await createSharedDoc();
    session.userId = "carol";

    const result = await saveDocument({ id: doc.id, title: "Hacked", contentHtml: "<p></p>" });

    expect(result.ok).toBe(false);
    expect((await store.get(doc.id))?.title).toBe("Plan");
  });

  it("rejects a user with no access", async () => {
    const doc = await createSharedDoc();
    session.userId = "stranger";

    const result = await saveDocument({ id: doc.id, title: "Nope", contentHtml: "<p></p>" });

    expect(result.ok).toBe(false);
  });

  it("returns a validation error for an empty title", async () => {
    const doc = await createSharedDoc();

    const result = await saveDocument({ id: doc.id, title: " ", contentHtml: "<p></p>" });

    expect(result).toEqual({ ok: false, error: "Title is required" });
  });
});

async function redirectedTo(action: () => Promise<unknown>): Promise<string> {
  try {
    await action();
  } catch (error) {
    return (error as Error).message.replace("REDIRECT ", "");
  }
  throw new Error("expected a redirect");
}

function uploadForm(file?: File) {
  const form = new FormData();
  if (file) form.set("file", file);
  return form;
}

describe("importDocument", () => {
  beforeEach(() => {
    session.userId = "dana";
  });

  it("creates a document owned by the user and opens it", async () => {
    const file = new File(["# Notes\n\n- one"], "meeting.md");

    const url = await redirectedTo(() => importDocument(uploadForm(file)));

    const [doc] = await store.listForUser("dana");
    expect(url).toBe(`/documents/${doc.id}`);
    expect(doc).toMatchObject({ title: "meeting", ownerId: "dana" });
    expect(doc.contentHtml).toContain("<h1>Notes</h1>");
  });

  it("redirects with an error for an unsupported file and creates nothing", async () => {
    session.userId = "erin";
    const file = new File(["x"], "report.docx");

    const url = await redirectedTo(() => importDocument(uploadForm(file)));

    expect(url).toContain("/documents?error=");
    expect(decodeURIComponent(url)).toContain("Unsupported file type");
    expect(await store.listForUser("erin")).toHaveLength(0);
  });

  it("redirects with an error when no file is chosen", async () => {
    const url = await redirectedTo(() => importDocument(uploadForm()));

    expect(decodeURIComponent(url)).toContain("Choose a file to upload");
  });
});

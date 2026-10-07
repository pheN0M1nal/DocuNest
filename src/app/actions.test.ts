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

import { importDocument, saveDocument, shareDocument, unshareDocument } from "./actions";
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

function shareForm(fields: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

async function createOwnedDoc() {
  session.userId = "owner";
  return store.create({ ownerId: "owner", title: "Plan" });
}

describe("shareDocument", () => {
  it("lets the owner share and reopens the share dialog", async () => {
    const doc = await createOwnedDoc();

    const url = await redirectedTo(() =>
      shareDocument(shareForm({ id: doc.id, userId: "u_bob", access: "editor" })),
    );

    expect(url).toBe(`/documents/${doc.id}?share=open`);
    expect((await store.get(doc.id))?.shares).toEqual([{ userId: "u_bob", access: "editor" }]);
  });

  it("changes an existing user's access without duplicating them", async () => {
    const doc = await createOwnedDoc();
    await store.share(doc.id, "u_bob", "viewer");

    await redirectedTo(() => shareDocument(shareForm({ id: doc.id, userId: "u_bob", access: "editor" })));

    expect((await store.get(doc.id))?.shares).toEqual([{ userId: "u_bob", access: "editor" }]);
  });

  it("does not let an editor share", async () => {
    const doc = await createOwnedDoc();
    await store.share(doc.id, "u_bob", "editor");
    session.userId = "u_bob";

    const url = await redirectedTo(() =>
      shareDocument(shareForm({ id: doc.id, userId: "u_carol", access: "viewer" })),
    );

    expect(url).toBe("/documents");
    expect((await store.get(doc.id))?.shares).toHaveLength(1);
  });

  it("does not let a stranger share", async () => {
    const doc = await createOwnedDoc();
    session.userId = "stranger";

    const url = await redirectedTo(() =>
      shareDocument(shareForm({ id: doc.id, userId: "u_bob", access: "editor" })),
    );

    expect(url).toBe("/documents");
    expect((await store.get(doc.id))?.shares).toHaveLength(0);
  });

  it("rejects sharing with the owner or an unknown user", async () => {
    const doc = await createOwnedDoc();

    for (const userId of ["owner", "u_nobody"]) {
      const url = await redirectedTo(() => shareDocument(shareForm({ id: doc.id, userId, access: "editor" })));
      expect(decodeURIComponent(url)).toContain("Pick another user");
    }
    expect((await store.get(doc.id))?.shares).toHaveLength(0);
  });

  it("rejects an invalid access level", async () => {
    const doc = await createOwnedDoc();

    const url = await redirectedTo(() =>
      shareDocument(shareForm({ id: doc.id, userId: "u_bob", access: "admin" })),
    );

    expect(url).toBe("/documents");
    expect((await store.get(doc.id))?.shares).toHaveLength(0);
  });
});

describe("unshareDocument", () => {
  it("lets the owner remove someone's access", async () => {
    const doc = await createOwnedDoc();
    await store.share(doc.id, "u_bob", "editor");
    await store.share(doc.id, "u_carol", "viewer");

    const url = await redirectedTo(() => unshareDocument(shareForm({ id: doc.id, userId: "u_bob" })));

    expect(url).toBe(`/documents/${doc.id}?share=open`);
    expect((await store.get(doc.id))?.shares).toEqual([{ userId: "u_carol", access: "viewer" }]);
  });

  it("does not let an editor remove anyone", async () => {
    const doc = await createOwnedDoc();
    await store.share(doc.id, "u_bob", "editor");
    await store.share(doc.id, "u_carol", "viewer");
    session.userId = "u_bob";

    const url = await redirectedTo(() => unshareDocument(shareForm({ id: doc.id, userId: "u_carol" })));

    expect(url).toBe("/documents");
    expect((await store.get(doc.id))?.shares).toHaveLength(2);
  });
});

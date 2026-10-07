import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ userId: "alice" }));

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  SESSION_COOKIE: "docunest_user",
  requireUser: async () => ({ id: session.userId }),
}));
vi.mock("@/lib/store", async () => {
  const { createMemoryStore } = await import("@/lib/store/memory");
  return { store: createMemoryStore() };
});

import { saveDocument } from "./actions";
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

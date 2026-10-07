import { describe, expect, it } from "vitest";
import { createMemoryStore } from "./memory";

describe("memory store", () => {
  it("lists owned and shared documents per user", async () => {
    const store = createMemoryStore();
    const doc = await store.create({ ownerId: "alice", title: "Plan" });

    expect(await store.listForUser("bob")).toHaveLength(0);
    await store.share(doc.id, "bob", "viewer");

    expect(await store.listForUser("alice")).toHaveLength(1);
    expect(await store.listForUser("bob")).toHaveLength(1);
  });

  it("persists title and content updates", async () => {
    const store = createMemoryStore();
    const doc = await store.create({ ownerId: "alice", title: "Old" });
    await store.update(doc.id, { title: "New", contentHtml: "<p>hi</p>" });

    expect(await store.get(doc.id)).toMatchObject({ title: "New", contentHtml: "<p>hi</p>" });
  });

  it("replaces an existing share instead of duplicating it", async () => {
    const store = createMemoryStore();
    const doc = await store.create({ ownerId: "alice", title: "Plan" });
    await store.share(doc.id, "bob", "viewer");
    const updated = await store.share(doc.id, "bob", "editor");

    expect(updated?.shares).toEqual([{ userId: "bob", access: "editor" }]);
  });
});

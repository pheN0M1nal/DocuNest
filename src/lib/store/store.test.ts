import { createClient } from "@libsql/client";
import { describe, expect, it } from "vitest";
import { createLibsqlStore } from "./libsql";
import { createMemoryStore } from "./memory";

const implementations = [
  ["memory", createMemoryStore],
  ["libsql", () => createLibsqlStore(createClient({ url: ":memory:" }))],
] as const;

describe.each(implementations)("%s store", (_name, createStore) => {
  it("lists owned and shared documents per user", async () => {
    const store = createStore();
    const doc = await store.create({ ownerId: "alice", title: "Plan" });

    expect(await store.listForUser("bob")).toHaveLength(0);
    await store.share(doc.id, "bob", "viewer");

    expect(await store.listForUser("alice")).toHaveLength(1);
    expect(await store.listForUser("bob")).toHaveLength(1);
  });

  it("persists title and content updates exactly", async () => {
    const store = createStore();
    const doc = await store.create({ ownerId: "alice", title: "Old" });
    const html = '<h1>Hi</h1><p><strong>bold</strong> &amp; <u>under</u></p><ul><li>one</li></ul>';

    await store.update(doc.id, { title: "New", contentHtml: html });

    expect(await store.get(doc.id)).toMatchObject({ title: "New", contentHtml: html });
  });

  it("replaces an existing share instead of duplicating it", async () => {
    const store = createStore();
    const doc = await store.create({ ownerId: "alice", title: "Plan" });
    await store.share(doc.id, "bob", "viewer");

    const updated = await store.share(doc.id, "bob", "editor");

    expect(updated?.shares).toEqual([{ userId: "bob", access: "editor" }]);
  });

  it("returns null for a missing document", async () => {
    const store = createStore();

    expect(await store.get("missing")).toBeNull();
    expect(await store.update("missing", { title: "x", contentHtml: "<p></p>" })).toBeNull();
    expect(await store.share("missing", "bob", "editor")).toBeNull();
  });

  it("lists the most recently updated document first", async () => {
    const store = createStore();
    const first = await store.create({ ownerId: "alice", title: "First" });
    await store.create({ ownerId: "alice", title: "Second" });

    await new Promise((resolve) => setTimeout(resolve, 5));
    await store.update(first.id, { title: "First", contentHtml: "<p>edited</p>" });

    const titles = (await store.listForUser("alice")).map((d) => d.title);
    expect(titles).toEqual(["First", "Second"]);
  });
});

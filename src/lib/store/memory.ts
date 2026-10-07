import { randomUUID } from "node:crypto";
import type { DocumentRecord } from "../types";
import type { DocumentStore } from "./types";

// In-memory store for tests; the app uses the libSQL store.
export function createMemoryStore(): DocumentStore {
  const docs = new Map<string, DocumentRecord>();

  return {
    async listForUser(userId) {
      return [...docs.values()]
        .filter(
          (d) => d.ownerId === userId || d.shares.some((s) => s.userId === userId),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async get(id) {
      return docs.get(id) ?? null;
    },

    async create({ ownerId, title, contentHtml = "<p></p>" }) {
      const now = new Date().toISOString();
      const doc: DocumentRecord = {
        id: randomUUID(),
        title,
        contentHtml,
        ownerId,
        shares: [],
        createdAt: now,
        updatedAt: now,
      };
      docs.set(doc.id, doc);
      return doc;
    },

    async update(id, patch) {
      const doc = docs.get(id);
      if (!doc) return null;
      const next = { ...doc, ...patch, updatedAt: new Date().toISOString() };
      docs.set(id, next);
      return next;
    },

    async share(id, userId, access) {
      const doc = docs.get(id);
      if (!doc) return null;
      const shares = doc.shares.filter((s) => s.userId !== userId);
      shares.push({ userId, access });
      const next = { ...doc, shares, updatedAt: new Date().toISOString() };
      docs.set(id, next);
      return next;
    },

    async unshare(id, userId) {
      const doc = docs.get(id);
      if (!doc) return null;
      const shares = doc.shares.filter((s) => s.userId !== userId);
      const next = { ...doc, shares, updatedAt: new Date().toISOString() };
      docs.set(id, next);
      return next;
    },
  };
}

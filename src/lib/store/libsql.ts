import { randomUUID } from "node:crypto";
import type { Client, Row } from "@libsql/client";
import type { DocumentRecord, Share, ShareAccess } from "../types";
import type { DocumentStore } from "./types";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content_html TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS shares (
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    access TEXT NOT NULL CHECK (access IN ('editor', 'viewer')),
    PRIMARY KEY (document_id, user_id)
  )`,
];

function toDocument(row: Row, shares: Share[]): DocumentRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    contentHtml: String(row.content_html),
    ownerId: String(row.owner_id),
    shares,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function createLibsqlStore(client: Client): DocumentStore {
  let schemaReady: Promise<unknown> | undefined;
  const ready = () =>
    (schemaReady ??= client.batch(SCHEMA, "write").catch((error) => {
      schemaReady = undefined;
      throw error;
    }));

  async function sharesByDocument(ids: string[]): Promise<Map<string, Share[]>> {
    const byDocument = new Map<string, Share[]>();
    if (ids.length === 0) return byDocument;

    const marks = ids.map(() => "?").join(", ");
    const { rows } = await client.execute({
      sql: `SELECT document_id, user_id, access FROM shares WHERE document_id IN (${marks})`,
      args: ids,
    });
    for (const row of rows) {
      const documentId = String(row.document_id);
      const shares = byDocument.get(documentId) ?? [];
      shares.push({ userId: String(row.user_id), access: row.access as ShareAccess });
      byDocument.set(documentId, shares);
    }
    return byDocument;
  }

  async function withShares(rows: Row[]): Promise<DocumentRecord[]> {
    const shares = await sharesByDocument(rows.map((row) => String(row.id)));
    return rows.map((row) => toDocument(row, shares.get(String(row.id)) ?? []));
  }

  const store: DocumentStore = {
    async listForUser(userId) {
      await ready();
      const { rows } = await client.execute({
        sql: `SELECT * FROM documents
              WHERE owner_id = ?1
                 OR id IN (SELECT document_id FROM shares WHERE user_id = ?1)
              ORDER BY updated_at DESC`,
        args: [userId],
      });
      return withShares(rows);
    },

    async get(id) {
      await ready();
      const { rows } = await client.execute({
        sql: "SELECT * FROM documents WHERE id = ?",
        args: [id],
      });
      return (await withShares(rows))[0] ?? null;
    },

    async create({ ownerId, title, contentHtml = "<p></p>" }) {
      await ready();
      const now = new Date().toISOString();
      const id = randomUUID();
      await client.execute({
        sql: `INSERT INTO documents (id, title, content_html, owner_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, title, contentHtml, ownerId, now, now],
      });
      return { id, title, contentHtml, ownerId, shares: [], createdAt: now, updatedAt: now };
    },

    async update(id, { title, contentHtml }) {
      await ready();
      const result = await client.execute({
        sql: "UPDATE documents SET title = ?, content_html = ?, updated_at = ? WHERE id = ?",
        args: [title, contentHtml, new Date().toISOString(), id],
      });
      return result.rowsAffected === 0 ? null : store.get(id);
    },

    async share(id, userId, access) {
      await ready();
      const [, touched] = await client.batch(
        [
          {
            sql: `INSERT INTO shares (document_id, user_id, access)
                  SELECT ?1, ?2, ?3 WHERE EXISTS (SELECT 1 FROM documents WHERE id = ?1)
                  ON CONFLICT (document_id, user_id) DO UPDATE SET access = excluded.access`,
            args: [id, userId, access],
          },
          {
            sql: "UPDATE documents SET updated_at = ? WHERE id = ?",
            args: [new Date().toISOString(), id],
          },
        ],
        "write",
      );
      return touched.rowsAffected === 0 ? null : store.get(id);
    },

    async unshare(id, userId) {
      await ready();
      const [, touched] = await client.batch(
        [
          {
            sql: "DELETE FROM shares WHERE document_id = ? AND user_id = ?",
            args: [id, userId],
          },
          {
            sql: "UPDATE documents SET updated_at = ? WHERE id = ?",
            args: [new Date().toISOString(), id],
          },
        ],
        "write",
      );
      return touched.rowsAffected === 0 ? null : store.get(id);
    },
  };

  return store;
}

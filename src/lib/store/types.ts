import type { DocumentRecord, ShareAccess } from "../types";

/**
 * Persistence boundary. Everything above this interface is storage-agnostic,
 * so the in-memory implementation can be swapped for SQLite/Postgres/etc.
 */
export interface DocumentStore {
  /** Documents the user owns or that were shared with them. */
  listForUser(userId: string): Promise<DocumentRecord[]>;
  get(id: string): Promise<DocumentRecord | null>;
  create(input: {
    ownerId: string;
    title: string;
    contentHtml?: string;
  }): Promise<DocumentRecord>;
  update(
    id: string,
    patch: { title: string; contentHtml: string },
  ): Promise<DocumentRecord | null>;
  /** Grant (or change) a user's access. Returns null if the doc is missing. */
  share(
    id: string,
    userId: string,
    access: ShareAccess,
  ): Promise<DocumentRecord | null>;
  /** Remove a user's access. Returns null if the doc is missing. */
  unshare(id: string, userId: string): Promise<DocumentRecord | null>;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

/** What a user is allowed to do with a document they were shared. */
export type ShareAccess = "editor" | "viewer";

/** A user's effective relationship to a document. */
export type Role = "owner" | ShareAccess;

export interface Share {
  userId: string;
  access: ShareAccess;
}

export interface DocumentRecord {
  id: string;
  title: string;
  /** Rich text stored as HTML produced by the editor. */
  contentHtml: string;
  ownerId: string;
  shares: Share[];
  createdAt: string;
  updatedAt: string;
}

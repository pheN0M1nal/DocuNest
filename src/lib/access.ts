import type { DocumentRecord, Role } from "./types";

/** Resolve a user's role on a document, or null if they have no access. */
export function getRole(doc: DocumentRecord, userId: string): Role | null {
  if (doc.ownerId === userId) return "owner";
  return doc.shares.find((s) => s.userId === userId)?.access ?? null;
}

export function canView(role: Role | null): boolean {
  return role !== null;
}

export function canEdit(role: Role | null): boolean {
  return role === "owner" || role === "editor";
}

export function canShare(role: Role | null): boolean {
  return role === "owner";
}

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  editor: "Can edit",
  viewer: "Can view",
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

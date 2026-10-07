import type { User } from "./types";

/**
 * Seeded accounts for the mocked login flow. Reviewers pick one on /login;
 * there are no passwords by design (see ARCHITECTURE.md).
 */
export const USERS: readonly User[] = [
  { id: "u_alice", name: "Alice Anderson", email: "alice@example.com" },
  { id: "u_bob", name: "Bob Bennett", email: "bob@example.com" },
  { id: "u_carol", name: "Carol Chen", email: "carol@example.com" },
];

export function findUser(id: string | undefined): User | undefined {
  return USERS.find((u) => u.id === id);
}

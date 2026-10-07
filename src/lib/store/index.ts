import { createMemoryStore } from "./memory";
import type { DocumentStore } from "./types";

// Cache on globalThis so dev-mode hot reloads don't wipe the store.
const globalForStore = globalThis as unknown as { docunestStore?: DocumentStore };

export const store: DocumentStore = (globalForStore.docunestStore ??=
  createMemoryStore());

import { mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";
import { createLibsqlStore } from "./libsql";
import type { DocumentStore } from "./types";

const LOCAL_DATABASE_URL = "file:data/docunest.db";

function createStore(): DocumentStore {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    return createLibsqlStore(createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }));
  }
  mkdirSync("data", { recursive: true });
  return createLibsqlStore(createClient({ url: LOCAL_DATABASE_URL }));
}

// Cached on globalThis so dev-mode hot reloads reuse one connection.
const globalForStore = globalThis as unknown as { docunestStore?: DocumentStore };

export const store: DocumentStore = (globalForStore.docunestStore ??= createStore());

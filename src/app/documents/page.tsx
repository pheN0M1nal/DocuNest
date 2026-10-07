import Link from "next/link";
import { createDocument, importDocument, logout } from "@/app/actions";
import { SUPPORTED_UPLOAD_EXTENSIONS } from "@/lib/import";
import { requireUser } from "@/lib/session";
import { store } from "@/lib/store";
import { findUser } from "@/lib/users";
import type { DocumentRecord } from "@/lib/types";

function DocumentList({
  docs,
  emptyText,
  showOwner,
}: {
  docs: DocumentRecord[];
  emptyText: string;
  showOwner?: boolean;
}) {
  if (docs.length === 0) {
    return <p className="text-sm text-neutral-500">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {docs.map((doc) => (
        <li key={doc.id}>
          <Link
            href={`/documents/${doc.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <span className="font-medium">{doc.title}</span>
            <span className="text-sm text-neutral-500">
              {showOwner ? `Shared by ${findUser(doc.ownerId)?.name ?? "unknown"} · ` : ""}
              {new Date(doc.updatedAt).toLocaleString()}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { error } = await searchParams;
  const docs = await store.listForUser(user.id);
  const owned = docs.filter((d) => d.ownerId === user.id);
  const shared = docs.filter((d) => d.ownerId !== user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <form action={logout} className="flex items-center gap-3 text-sm">
          <span className="text-neutral-500">{user.name}</span>
          <button type="submit" className="underline">
            Switch user
          </button>
        </form>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <form action={createDocument}>
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            New document
          </button>
        </form>
        <form action={importDocument} className="flex items-center gap-2 text-sm">
          <input
            type="file"
            name="file"
            accept={SUPPORTED_UPLOAD_EXTENSIONS.join(",")}
            aria-label="File to import"
          />
          <button type="submit" className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700">
            Import
          </button>
          <span className="text-neutral-500">
            Supported: {SUPPORTED_UPLOAD_EXTENSIONS.join(", ")}
          </span>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          My documents
        </h2>
        <DocumentList docs={owned} emptyText="No documents yet. Create one to get started." />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Shared with me
        </h2>
        <DocumentList docs={shared} emptyText="Nothing has been shared with you." showOwner />
      </section>
    </main>
  );
}

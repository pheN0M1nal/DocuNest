import Link from "next/link";
import { notFound } from "next/navigation";
import { shareDocument } from "@/app/actions";
import { DocumentEditor } from "@/components/DocumentEditor";
import { canEdit, canShare, getRole } from "@/lib/access";
import { requireUser } from "@/lib/session";
import { store } from "@/lib/store";
import { USERS, findUser } from "@/lib/users";

export default async function DocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error } = await searchParams;

  const doc = await store.get(id);
  const role = doc ? getRole(doc, user.id) : null;
  // Treat "no access" like "missing" so ids can't be probed.
  if (!doc || !role) notFound();

  const candidates = USERS.filter((u) => u.id !== doc.ownerId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/documents" className="text-sm text-neutral-500 underline">
        ← All documents
      </Link>

      <p className="mt-3 text-sm text-neutral-500">
        {role === "owner"
          ? "You own this document"
          : `Shared by ${findUser(doc.ownerId)?.name ?? "unknown"} · you can ${canEdit(role) ? "edit" : "view"}`}
      </p>

      <DocumentEditor
        id={doc.id}
        initialTitle={doc.title}
        initialHtml={doc.contentHtml}
        editable={canEdit(role)}
      />

      {canShare(role) && (
        <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Sharing</h2>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <ul className="mt-3 space-y-1 text-sm">
            {doc.shares.length === 0 && (
              <li className="text-neutral-500">Not shared with anyone yet.</li>
            )}
            {doc.shares.map((s) => (
              <li key={s.userId}>
                {findUser(s.userId)?.name ?? s.userId} — {s.access}
              </li>
            ))}
          </ul>
          <form action={shareDocument} className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <input type="hidden" name="id" value={doc.id} />
            <select name="userId" aria-label="Share with" className="rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700">
              {candidates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <select name="access" aria-label="Access level" defaultValue="editor" className="rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700">
              <option value="editor">Can edit</option>
              <option value="viewer">Can view</option>
            </select>
            <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
              Share
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

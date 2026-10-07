import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentEditor } from "@/components/DocumentEditor";
import { ShareDialog } from "@/components/ShareDialog";
import { SharePanel } from "@/components/SharePanel";
import { canEdit, canShare, getRole, roleLabel } from "@/lib/access";
import { requireUser } from "@/lib/session";
import { store } from "@/lib/store";
import { findUser } from "@/lib/users";

export default async function DocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; share?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error, share } = await searchParams;

  const doc = await store.get(id);
  const role = doc ? getRole(doc, user.id) : null;
  // Treat "no access" like "missing" so ids can't be probed.
  if (!doc || !role) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/documents" className="text-sm text-neutral-500 underline">
          ← All documents
        </Link>
        {canShare(role) && (
          <ShareDialog defaultOpen={share === "open"}>
            <SharePanel doc={doc} error={error} />
          </ShareDialog>
        )}
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        {role === "owner"
          ? "You own this document"
          : `Shared by ${findUser(doc.ownerId)?.name ?? "unknown"} · ${roleLabel(role)}`}
      </p>

      <DocumentEditor
        id={doc.id}
        initialTitle={doc.title}
        initialHtml={doc.contentHtml}
        editable={canEdit(role)}
      />
    </main>
  );
}

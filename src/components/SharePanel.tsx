import { shareDocument, unshareDocument } from "@/app/actions";
import { roleLabel } from "@/lib/access";
import type { DocumentRecord } from "@/lib/types";
import { USERS, findUser } from "@/lib/users";

const fieldClass =
  "rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700";

function AccessSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select name="access" defaultValue={defaultValue} aria-label="Access level" className={fieldClass}>
      <option value="editor">Can edit</option>
      <option value="viewer">Can view</option>
    </select>
  );
}

export function SharePanel({ doc, error }: { doc: DocumentRecord; error?: string }) {
  const owner = findUser(doc.ownerId);
  const available = USERS.filter(
    (user) => user.id !== doc.ownerId && !doc.shares.some((s) => s.userId === user.id),
  );

  return (
    <div className="mt-4 space-y-4 text-sm">
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        <li className="flex items-center justify-between">
          <span>{owner?.name} (you)</span>
          <span className="text-neutral-500">{roleLabel("owner")}</span>
        </li>
        {doc.shares.map((share) => (
          <li key={share.userId}>
            <form action={shareDocument} className="flex items-center gap-2">
              <input type="hidden" name="id" value={doc.id} />
              <input type="hidden" name="userId" value={share.userId} />
              <span className="flex-1">{findUser(share.userId)?.name ?? share.userId}</span>
              <AccessSelect defaultValue={share.access} />
              <button type="submit" className="underline">
                Update
              </button>
              <button type="submit" formAction={unshareDocument} className="text-red-600 underline">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      {available.length > 0 ? (
        <form action={shareDocument} className="flex items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <input type="hidden" name="id" value={doc.id} />
          <select name="userId" aria-label="Share with" className={`${fieldClass} flex-1`}>
            {available.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <AccessSelect defaultValue="editor" />
          <button type="submit" className="rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
            Share
          </button>
        </form>
      ) : (
        <p className="text-neutral-500">Everyone already has access.</p>
      )}
    </div>
  );
}

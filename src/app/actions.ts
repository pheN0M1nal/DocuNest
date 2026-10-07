"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { canEdit, canShare, getRole } from "@/lib/access";
import { importUpload } from "@/lib/import";
import { requireUser, SESSION_COOKIE } from "@/lib/session";
import { store } from "@/lib/store";
import { findUser } from "@/lib/users";
import { saveDocumentSchema, shareDocumentSchema } from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

function redirectWithError(message: string): never {
  redirect("/documents?error=" + encodeURIComponent(message));
}

export async function login(formData: FormData) {
  const user = findUser(String(formData.get("userId") ?? ""));
  if (!user) redirect("/login");
  const jar = await cookies();
  jar.set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect("/documents");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function createDocument() {
  const user = await requireUser();
  const doc = await store.create({ ownerId: user.id, title: "Untitled document" });
  redirect(`/documents/${doc.id}`);
}

export async function importDocument(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) redirectWithError("Choose a file to upload");

  const result = await importUpload(file);
  if (!result.ok) redirectWithError(result.error);

  const doc = await store.create({
    ownerId: user.id,
    title: result.title,
    contentHtml: result.html,
  });
  redirect(`/documents/${doc.id}`);
}

export async function saveDocument(input: {
  id: string;
  title: string;
  contentHtml: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = saveDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const doc = await store.get(parsed.data.id);
  if (!doc || !canEdit(getRole(doc, user.id))) {
    return { ok: false, error: "Document not found or not editable" };
  }

  await store.update(doc.id, {
    title: parsed.data.title,
    contentHtml: parsed.data.contentHtml,
  });
  revalidatePath("/documents");
  return { ok: true };
}

export async function shareDocument(formData: FormData) {
  const user = await requireUser();
  const parsed = shareDocumentSchema.safeParse({
    id: formData.get("id"),
    userId: formData.get("userId"),
    access: formData.get("access"),
  });
  if (!parsed.success) redirect("/documents");

  const { id, userId, access } = parsed.data;
  const doc = await store.get(id);
  if (!doc || !canShare(getRole(doc, user.id))) redirect("/documents");

  const target = findUser(userId);
  if (!target || target.id === doc.ownerId) {
    redirect(`/documents/${id}?error=` + encodeURIComponent("Pick another user"));
  }

  await store.share(id, target.id, access);
  revalidatePath(`/documents/${id}`);
  redirect(`/documents/${id}`);
}

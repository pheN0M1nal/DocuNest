import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUser } from "./users";
import type { User } from "./types";

export const SESSION_COOKIE = "docunest_user";

export async function getCurrentUser(): Promise<User | undefined> {
  const jar = await cookies();
  return findUser(jar.get(SESSION_COOKIE)?.value);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

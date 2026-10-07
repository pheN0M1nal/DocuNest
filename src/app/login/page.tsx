import { login } from "@/app/actions";
import { USERS } from "@/lib/users";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">DocuNest</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Demo sign-in: pick a seeded account. Sign in as different users to try
        sharing.
      </p>
      <ul className="mt-6 space-y-2">
        {USERS.map((user) => (
          <li key={user.id}>
            <form action={login}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-left hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                <span className="block font-medium">{user.name}</span>
                <span className="block text-sm text-neutral-500">{user.email}</span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}

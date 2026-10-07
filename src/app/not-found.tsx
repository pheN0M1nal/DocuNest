import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Document not found</h1>
      <p className="mt-2 text-sm text-neutral-500">
        It may not exist, or you may not have access to it.
      </p>
      <Link href="/documents" className="mt-6 inline-block text-sm underline">
        Back to your documents
      </Link>
    </main>
  );
}

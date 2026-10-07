"use client";

import { useState, useTransition } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { saveDocument } from "@/app/actions";
import { Toolbar } from "./Toolbar";

interface Props {
  id: string;
  initialTitle: string;
  initialHtml: string;
  editable: boolean;
}

export function DocumentEditor({ id, initialTitle, initialHtml, editable }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<string>("");
  const [pending, startTransition] = useTransition();

  // StarterKit ships bold, italic, underline, headings and lists.
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml,
    editable,
    immediatelyRender: false, // avoid SSR hydration mismatch
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[50vh] rounded-b-lg border border-neutral-300 p-4 focus:outline-none dark:border-neutral-700",
      },
    },
  });

  function save() {
    if (!editor) return;
    setStatus("");
    startTransition(async () => {
      const result = await saveDocument({
        id,
        title,
        contentHtml: editor.getHTML(),
      });
      setStatus(result.ok ? "Saved" : result.error);
    });
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={!editable}
          aria-label="Document title"
          className="w-full bg-transparent text-3xl font-semibold focus:outline-none"
        />
        {editable && (
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        )}
      </div>
      <p role="status" className="mt-1 h-5 text-sm text-neutral-500">
        {editable ? status : "Read-only"}
      </p>

      {editable && editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

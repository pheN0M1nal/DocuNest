"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { saveDocument } from "@/app/actions";
import { Toolbar } from "./Toolbar";

const AUTOSAVE_DELAY_MS = 1000;

type SaveStatus =
  | { kind: "saved" }
  | { kind: "unsaved" }
  | { kind: "saving" }
  | { kind: "error"; message: string };

interface Props {
  id: string;
  initialTitle: string;
  initialHtml: string;
  editable: boolean;
}

function statusText(status: SaveStatus): string {
  switch (status.kind) {
    case "saved":
      return "Saved";
    case "unsaved":
      return "Unsaved changes";
    case "saving":
      return "Saving…";
    case "error":
      return `Not saved: ${status.message}`;
  }
}

export function DocumentEditor({ id, initialTitle, initialHtml, editable }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveStatus>({ kind: "saved" });
  const [revision, setRevision] = useState(0);

  const draft = useRef({ title: initialTitle, contentHtml: initialHtml });
  const latestRevision = useRef(0);
  const savedRevision = useRef(0);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      draft.current.contentHtml = editor.getHTML();
      markChanged();
    },
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[60vh] rounded-b-lg border border-neutral-300 p-6 focus:outline-none dark:border-neutral-700",
      },
    },
  });

  function markChanged() {
    latestRevision.current += 1;
    setRevision(latestRevision.current);
    setStatus({ kind: "unsaved" });
  }

  function changeTitle(value: string) {
    setTitle(value);
    draft.current.title = value;
    markChanged();
  }

  async function save() {
    const savingRevision = latestRevision.current;
    setStatus({ kind: "saving" });
    try {
      const result = await saveDocument({ id, ...draft.current });
      if (result.ok) savedRevision.current = savingRevision;
      if (savingRevision !== latestRevision.current) return;
      setStatus(result.ok ? { kind: "saved" } : { kind: "error", message: result.error });
    } catch {
      setStatus({ kind: "error", message: "Network error, your edits are still here" });
    }
  }

  useEffect(() => {
    if (revision === 0) return;
    const timer = setTimeout(save, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]);

  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      if (savedRevision.current < latestRevision.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, []);

  useEffect(() => {
    const unsaved = savedRevision;
    const latest = latestRevision;
    const pending = draft;
    return () => {
      if (unsaved.current < latest.current) void saveDocument({ id, ...pending.current });
    };
  }, [id]);

  return (
    <div className="mt-2">
      <input
        value={title}
        onChange={(e) => changeTitle(e.target.value)}
        readOnly={!editable}
        aria-label="Document title"
        className="w-full bg-transparent text-3xl font-semibold focus:outline-none"
      />
      <p
        role="status"
        className={`mt-1 h-5 text-sm ${
          status.kind === "error" ? "text-red-600" : "text-neutral-500"
        }`}
      >
        {editable ? statusText(status) : "View only"}
      </p>

      {editable && editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

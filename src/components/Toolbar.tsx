"use client";

import type { Editor } from "@tiptap/react";

interface ButtonProps {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}

function ToolbarButton({ label, hint, active, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      title={hint}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800 ${
        active ? "bg-neutral-200 font-semibold dark:bg-neutral-800" : ""
      }`}
    >
      {label}
    </button>
  );
}

export function Toolbar({ editor }: { editor: Editor }) {
  const run = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="mt-3 flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-neutral-300 p-1 dark:border-neutral-700"
    >
      <ToolbarButton label="B" hint="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => run().toggleBold().run()} />
      <ToolbarButton label="I" hint="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => run().toggleItalic().run()} />
      <ToolbarButton label="U" hint="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => run().toggleUnderline().run()} />
      <ToolbarButton label="H1" hint="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => run().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton label="H2" hint="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => run().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton label="• List" hint="Bulleted list" active={editor.isActive("bulletList")} onClick={() => run().toggleBulletList().run()} />
      <ToolbarButton label="1. List" hint="Numbered list" active={editor.isActive("orderedList")} onClick={() => run().toggleOrderedList().run()} />
    </div>
  );
}

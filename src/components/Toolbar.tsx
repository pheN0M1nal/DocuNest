"use client";

import type { Editor } from "@tiptap/react";

interface ButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

function ToolbarButton({ label, active, onClick }: ButtonProps) {
  return (
    <button
      type="button"
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
  const chain = () => editor.chain().focus();
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="mt-3 flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-neutral-300 p-1 dark:border-neutral-700"
    >
      <ToolbarButton label="B" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()} />
      <ToolbarButton label="I" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()} />
      <ToolbarButton label="U" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()} />
      <ToolbarButton label="H1" active={editor.isActive("heading", { level: 1 })} onClick={() => chain().toggleHeading({ level: 1 }).run()} />
      <ToolbarButton label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton label="• List" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()} />
      <ToolbarButton label="1. List" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()} />
    </div>
  );
}

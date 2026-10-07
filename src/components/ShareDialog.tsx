"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  defaultOpen: boolean;
  children: ReactNode;
}

export function ShareDialog({ defaultOpen, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (defaultOpen && !dialog.current?.open) dialog.current?.showModal();
  }, [defaultOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
      >
        Share
      </button>
      <dialog
        ref={dialog}
        aria-label="Share document"
        className="m-auto w-full max-w-md rounded-xl bg-background p-6 text-foreground backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share document</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="rounded px-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}

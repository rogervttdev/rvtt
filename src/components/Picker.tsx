"use client";

import { useEffect, useRef } from "react";

/** Janela de catálogo em pergaminho */
export function Picker({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="help-dialog picker-dialog"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3">
            <h3 className="font-display text-2xl font-bold">{title}</h3>
            <button className="btn btn-ghost border border-rule px-3 py-1" onClick={onClose}>
              Fechar
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-3">{children}</div>
        </div>
      )}
    </dialog>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { CharacterSheet } from "@/app/fichas/[id]/page";

/**
 * Abre a ficha completa de um personagem numa janela flutuante, sem sair da mesa.
 * Usado tanto pelo jogador ("Minha ficha") quanto pelo mestre (clicando no
 * retrato de qualquer jogador na barra de presença).
 */
export function CharacterSheetModal({ characterId, onClose }: { characterId: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (characterId && !d.open) d.showModal();
    if (!characterId && d.open) d.close();
  }, [characterId]);

  return (
    <dialog
      ref={ref}
      className="sheet-modal"
      aria-label="Ficha do personagem"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {characterId && (
        <div className="sheet-modal-inner">
          <CharacterSheet characterId={characterId} embedded onClose={onClose} />
        </div>
      )}
    </dialog>
  );
}

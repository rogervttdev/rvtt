"use client";

import { useEffect, useRef } from "react";
import { CharacterSheet } from "@/app/fichas/[id]/page";
import { CharacterSummary } from "@/components/mesa/CharacterSummary";

/**
 * Jogador abrindo a própria ficha ("Minha ficha"): abre a ficha completa, com
 * tudo editável. Mestre abrindo a ficha de outro jogador (clicando no retrato
 * dele na barra de presença): abre só o resumo de uma página — não precisa
 * das abas todas pra uma espiada rápida, e evita editar a ficha de outra pessoa.
 */
export function CharacterSheetModal({ characterId, mode = "full", onClose }: { characterId: string | null; mode?: "full" | "resumo"; onClose: () => void }) {
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
          {mode === "resumo" ? <CharacterSummary characterId={characterId} /> : <CharacterSheet characterId={characterId} embedded onClose={onClose} />}
        </div>
      )}
    </dialog>
  );
}

"use client";

import { DiceRoller } from "@/components/DiceRoller";
import type { RollEntry, RollResult } from "@/lib/types";

type Props = { onRoll: (r: RollResult) => void; rolls: RollEntry[] };

/** Rolador de dados + histórico compartilhado da mesa (aparece pra todo mundo). */
export function DicePanel({ onRoll, rolls }: Props) {
  return (
    <div className="mesa-stack">
      <div className="mesa-card">
        <p className="mesa-h">🎲 Rolar dados</p>
        <p className="mesa-hint mb-3">O resultado aparece em destaque na tela de todos e entra no histórico abaixo.</p>
        <DiceRoller onRoll={onRoll} />
      </div>

      <div className="mesa-card">
        <p className="mesa-h">📜 Histórico da mesa</p>
        <div className="mesa-log mt-2" aria-live="polite">
          {rolls.length === 0 && (
            <div className="mesa-empty-state">
              <p className="mesa-empty-state-icon" aria-hidden>
                🎲
              </p>
              <p className="mesa-hint">As rolagens de todo mundo vão aparecer aqui.</p>
            </div>
          )}
          {rolls.map((r) => (
            <div key={r.id} className={`mesa-log-item ${r.crit === "critico" ? "is-crit" : r.crit === "falha" ? "is-fail" : ""}`}>
              <span className="mesa-log-total">{r.total}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{r.label ?? r.author}</span>
                <span className="mesa-hint block truncate">
                  {r.label && `${r.author} · `}
                  {r.detail}
                  {r.crit === "critico" && " · 20 natural!"}
                  {r.crit === "falha" && " · 1 natural"}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

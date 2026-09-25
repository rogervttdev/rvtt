"use client";

import { useState } from "react";
import { initials } from "@/lib/dnd";
import type { Room, Token, TurnEntry } from "@/lib/types";

type Props = {
  room: Room;
  tokens: Token[];
  isGM: boolean;
  onChange: (patch: Partial<Pick<Room, "turn_order" | "current_turn" | "round">>) => void;
};

/**
 * Painel flutuante de iniciativa: o mestre adiciona combatentes, ordena por
 * iniciativa e avança o turno. A rodada e quem está na vez ficam salvos em
 * `rooms` (turn_order/current_turn/round) e chegam a todo mundo em tempo real.
 */
export function InitiativeTracker({ room, tokens, isGM, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [pick, setPick] = useState("");
  const [initiative, setInitiative] = useState(10);

  const order = room.turn_order;
  const tokenById = new Map(tokens.map((t) => [t.id, t]));
  const activeId = order[room.current_turn]?.token_id;
  const inCombat = order.length > 0;

  const available = tokens.filter((t) => !order.some((o) => o.token_id === t.id));

  function addToOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!pick) return;
    const next: TurnEntry[] = [...order, { token_id: pick, initiative }].sort((a, b) => b.initiative - a.initiative);
    onChange({ turn_order: next, current_turn: 0, round: inCombat ? room.round : 1 });
    setPick("");
  }

  function removeFromOrder(tokenId: string) {
    const idx = order.findIndex((o) => o.token_id === tokenId);
    const next = order.filter((o) => o.token_id !== tokenId);
    let current = room.current_turn;
    if (idx >= 0 && idx < current) current -= 1;
    current = next.length ? Math.min(current, next.length - 1) : 0;
    onChange({ turn_order: next, current_turn: current });
  }

  function nextTurn() {
    if (order.length === 0) return;
    const atEnd = room.current_turn >= order.length - 1;
    onChange({ current_turn: atEnd ? 0 : room.current_turn + 1, round: atEnd ? room.round + 1 : room.round });
  }

  function prevTurn() {
    if (order.length === 0) return;
    const atStart = room.current_turn <= 0;
    onChange({ current_turn: atStart ? order.length - 1 : room.current_turn - 1, round: atStart ? Math.max(1, room.round - 1) : room.round });
  }

  function endCombat() {
    onChange({ turn_order: [], current_turn: 0, round: 1 });
  }

  if (collapsed)
    return (
      <button className="initiative-fab" onClick={() => setCollapsed(false)} aria-label="Abrir iniciativa">
        ⚔️ {inCombat ? `Rodada ${room.round}` : "Iniciativa"}
      </button>
    );

  return (
    <div className="initiative-bar" role="region" aria-label="Rastreador de iniciativa">
      <div className="flex items-center gap-2 border-b border-brass-deep px-3 py-1.5">
        <span className="font-display text-lg font-bold text-brass-light">⚔️ Iniciativa</span>
        {inCombat && <span className="chip">Rodada {room.round}</span>}
        <button className="ml-auto text-foam/70 hover:text-foam" onClick={() => setCollapsed(true)} aria-label="Minimizar iniciativa">
          ▾
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
        {order.length === 0 && <p className="py-1 text-sm text-foam/70">Ninguém na ordem ainda.</p>}
        {order.map((o, i) => {
          const t = tokenById.get(o.token_id);
          const isActive = i === room.current_turn;
          return (
            <div key={o.token_id} className={`initiative-chip ${isActive ? "is-active" : ""}`}>
              <span className="initiative-chip-token" style={{ background: t?.color ?? "#8d6a2c" }}>
                {t ? initials(t.label) : "?"}
              </span>
              <span className="min-w-0 max-w-[6rem] truncate">{t?.label ?? "(removido)"}</span>
              <span className="font-display font-bold text-brass-light">{o.initiative}</span>
              {isGM && (
                <button className="text-foam/50 hover:text-blood" onClick={() => removeFromOrder(o.token_id)} aria-label={`Remover ${t?.label} da iniciativa`}>
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isGM && (
        <div className="border-t border-brass-deep/60 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn btn-ghost border border-rule px-3 py-1" onClick={prevTurn} disabled={!inCombat}>
              ← Anterior
            </button>
            <button className="btn btn-brass px-3 py-1" onClick={nextTurn} disabled={!inCombat}>
              Próximo turno →
            </button>
            {inCombat && (
              <button className="btn btn-danger px-3 py-1" onClick={endCombat}>
                Encerrar combate
              </button>
            )}
          </div>
          <form onSubmit={addToOrder} className="mt-2 flex flex-wrap items-center gap-2">
            <select className="field w-auto min-w-[9rem] px-2 py-1 text-sm" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Adicionar à iniciativa">
              <option value="">Adicionar token…</option>
              {available.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              className="field w-20 px-2 py-1 text-sm"
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(Number(e.target.value) || 0)}
              aria-label="Valor de iniciativa"
            />
            <button className="btn btn-ghost border border-rule px-3 py-1" disabled={!pick}>
              Entrar na ordem
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

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
 * Ordem de combate: o mestre adiciona combatentes, ordena por iniciativa e
 * avança o turno. Fica salvo em `rooms` (turn_order/current_turn/round) e
 * chega a todo mundo em tempo real.
 */
export function InitiativeTracker({ room, tokens, isGM, onChange }: Props) {
  const [pick, setPick] = useState("");
  const [initiative, setInitiative] = useState(10);

  const order = room.turn_order;
  const tokenById = new Map(tokens.map((t) => [t.id, t]));
  const inCombat = order.length > 0;
  const available = tokens.filter((t) => t.stats.kind !== "cenario" && !order.some((o) => o.token_id === t.id));

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

  return (
    <div className="mesa-stack">
      <div className="mesa-card">
        <div className="flex items-center gap-2">
          <p className="mesa-h">⚔️ Ordem de combate</p>
          {inCombat && <span className="chip ml-auto">Rodada {room.round}</span>}
        </div>
        {!inCombat && <p className="mesa-hint mt-1">Ninguém na ordem ainda. {isGM ? "Adicione combatentes abaixo." : "Espere o mestre começar o combate."}</p>}

        {order.length > 0 && (
          <ol className="mt-3 space-y-1.5">
            {order.map((o, i) => {
              const t = tokenById.get(o.token_id);
              const isActive = i === room.current_turn;
              return (
                <li key={o.token_id} className={`mesa-choice ${isActive ? "is-on" : ""}`} style={{ cursor: "default" }}>
                  <span className="mesa-portrait !h-9 !w-9 !text-xs" style={{ background: t?.color ?? "#8d6a2c" }} aria-hidden>
                    {t ? initials(t.label) : "?"}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-bold">
                    {isActive && "▶ "}
                    {t?.label ?? "(removido)"}
                  </span>
                  <span className="font-display text-lg font-bold text-ember-deep">{o.initiative}</span>
                  {isGM && (
                    <button className="text-dim hover:text-blood" onClick={() => removeFromOrder(o.token_id)} aria-label={`Remover ${t?.label} da iniciativa`}>
                      ✕
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {isGM && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-ghost flex-1 border border-rule text-sm" onClick={prevTurn} disabled={!inCombat}>
              ← Turno anterior
            </button>
            <button className="btn btn-brass flex-1 text-sm" onClick={nextTurn} disabled={!inCombat}>
              Próximo turno →
            </button>
            {inCombat && (
              <button className="btn btn-danger w-full text-sm" onClick={endCombat}>
                Encerrar combate
              </button>
            )}
          </div>
        )}
      </div>

      {isGM && (
        <div className="mesa-card">
          <p className="mesa-h">➕ Adicionar à ordem</p>
          <form onSubmit={addToOrder} className="mt-2 space-y-2">
            <select className="field" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Adicionar à iniciativa">
              <option value="">Escolha um token no mapa…</option>
              {available.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="block">
              <span className="mesa-label">Valor de iniciativa</span>
              <input className="field" type="number" value={initiative} onChange={(e) => setInitiative(Number(e.target.value) || 0)} />
            </label>
            <button className="btn btn-ghost w-full border border-rule" disabled={!pick}>
              Entrar na ordem
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

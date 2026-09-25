"use client";

import { useState } from "react";
import { Help } from "./Help";
import { MONSTERS, SIZE_LABEL, type MonsterDef } from "@/lib/monstros";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (monster: MonsterDef) => void;
};

/**
 * Gaveta deslizante com o bestiário: clique (ou arraste, no computador) para colocar
 * um monstro no mapa. Fecha sozinha depois de adicionar, no celular.
 */
export function MonsterPanel({ open, onClose, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState("");
  const q = query.trim().toLowerCase();
  const list = MONSTERS.filter((m) => !q || m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q));

  return (
    <>
      {open && <div className="monster-panel-backdrop lg:hidden" onClick={onClose} aria-hidden />}
      <aside className={`monster-panel ${open ? "is-open" : ""}`} aria-label="Bestiário" aria-hidden={!open}>
        <div className="flex items-center justify-between gap-2 border-b border-brass-deep px-4 py-3">
          <h2 className="font-display text-xl font-bold text-brass-light">Bestiário</h2>
          <button className="btn btn-brass px-3 py-1" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto p-4">
          <input
            className="field"
            placeholder="Buscar monstro…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar monstro"
          />
          {added && (
            <p className="text-sm font-semibold text-moss" role="status">
              {added} colocado no mapa.
            </p>
          )}
          <p className="flex items-start gap-1.5 text-xs text-foam/70">
            Clique em “Colocar no mapa”, ou arraste a criatura para a casa desejada.
            <Help
              title="Bestiário"
              paragraphs={[
                "Cada criatura já vem com CA, pontos de vida, deslocamento, atributos e ataques prontos do SRD.",
                "Depois de colocada, os PV do token podem ser ajustados no painel do token selecionado — dá para acompanhar o combate sem abrir uma ficha.",
              ]}
            />
          </p>
          <ul className="space-y-2">
            {list.map((m) => (
              <li
                key={m.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("application/x-monster-id", m.id)}
                className="monster-row"
              >
                <span className="monster-token" style={{ background: m.color }} aria-hidden>
                  {m.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-display text-base font-bold">{m.name}</span>
                    <Help title={m.name}>
                      <p>{m.desc}</p>
                      {m.traits && (
                        <ul className="list-disc space-y-0.5 pl-5">
                          {m.traits.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      )}
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm">
                        <dt className="font-bold">FOR</dt>
                        <dd>{m.abilities.str}</dd>
                        <dt className="font-bold">DES</dt>
                        <dd>{m.abilities.dex}</dd>
                        <dt className="font-bold">CON</dt>
                        <dd>{m.abilities.con}</dd>
                        <dt className="font-bold">INT</dt>
                        <dd>{m.abilities.int}</dd>
                        <dt className="font-bold">SAB</dt>
                        <dd>{m.abilities.wis}</dd>
                        <dt className="font-bold">CAR</dt>
                        <dd>{m.abilities.cha}</dd>
                      </dl>
                    </Help>
                  </div>
                  <p className="text-xs text-foam/70">
                    {SIZE_LABEL[m.size]} · {m.type} · CA {m.ac} · PV {m.hpAvg} ({m.hpFormula}) · {m.speed} m
                  </p>
                  <p className="text-xs text-foam/60">
                    {m.attacks.map((a) => `${a.name} ${a.bonus >= 0 ? "+" : ""}${a.bonus} (${a.damage})`).join(" · ")}
                  </p>
                </div>
                <button
                  className="btn btn-primary shrink-0 px-2.5 py-1.5 text-sm"
                  onClick={() => {
                    onAdd(m);
                    setAdded(m.name);
                  }}
                >
                  Colocar
                </button>
              </li>
            ))}
            {list.length === 0 && <p className="py-4 text-center text-sm text-foam/70">Nenhum monstro encontrado.</p>}
          </ul>
        </div>
      </aside>
    </>
  );
}

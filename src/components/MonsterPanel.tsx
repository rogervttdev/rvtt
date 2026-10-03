"use client";

import { useState } from "react";
import { Help } from "./Help";
import { SceneryIcon } from "./mesa/SceneryArt";
import { SCENERY, SCENERY_CATEGORY_LABEL, type SceneryCategory, type SceneryDef } from "@/lib/cenario";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddScenery: (item: SceneryDef, qty: number) => void;
};

/**
 * Gaveta deslizante com o catálogo de terrenos e objetos de cenário (paredes,
 * mobília, natureza, fogo, perigos). Cada item tem um campo de quantidade —
 * colocar "5" de uma vez insere os cinco tokens já espalhados em casas livres
 * adjacentes. Monstros não têm mais catálogo aqui: qualquer inimigo/aliado
 * entra pela aba "Peças", com nome e números definidos na hora.
 */
export function MonsterPanel({ open, onClose, onAddScenery }: Props) {
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState("");
  const q = query.trim().toLowerCase();
  const sceneryList = SCENERY.filter((s) => !q || s.name.toLowerCase().includes(q));

  return (
    <>
      {open && <div className="monster-panel-backdrop lg:hidden" onClick={onClose} aria-hidden />}
      <aside className={`monster-panel ${open ? "is-open" : ""}`} aria-label="Cenário" aria-hidden={!open}>
        <div className="flex items-center justify-between gap-2 border-b border-brass-deep px-4 py-3">
          <h2 className="font-display text-xl font-bold text-brass-light">🌲 Terrenos e cenário</h2>
          <button className="btn btn-brass px-3 py-1" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4">
          <input className="field" placeholder="Buscar item de cenário…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar" />
          {added && (
            <p className="text-sm font-semibold text-moss" role="status">
              {added} colocado(s) no mapa.
            </p>
          )}
          <p className="flex items-start gap-1.5 text-xs text-foam/70">
            Ideal para montar a cena rápido: "5" árvores ou "10" cadeiras de uma vez.
            <Help
              title="Terrenos e cenário"
              paragraphs={[
                "Esses objetos não têm ficha de combate: servem só para desenhar o mapa (paredes, mobília, natureza, perigos).",
                "Colocar vários de uma vez os espalha em casas livres adjacentes, prontos para reposicionar depois.",
              ]}
            />
          </p>
          {(Object.keys(SCENERY_CATEGORY_LABEL) as SceneryCategory[]).map((cat) => {
            const items = sceneryList.filter((s) => s.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <p className="picker-group text-brass-light">{SCENERY_CATEGORY_LABEL[cat]}</p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <SceneryRow
                      key={item.id}
                      item={item}
                      onAdd={(qty) => {
                        onAddScenery(item, qty);
                        setAdded(`${qty}× ${item.name}`);
                      }}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
          {sceneryList.length === 0 && <p className="py-4 text-center text-sm text-foam/70">Nenhum item encontrado.</p>}
        </div>
      </aside>
    </>
  );
}

function QtyAdd({ onAdd, max = 30 }: { onAdd: (qty: number) => void; max?: number }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="flex shrink-0 items-center gap-1">
      <input
        className="field w-14 px-1 py-1 text-center text-sm"
        type="number"
        min={1}
        max={max}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
        aria-label="Quantidade"
      />
      <button className="btn btn-primary px-2.5 py-1.5 text-sm" onClick={() => onAdd(qty)}>
        Colocar
      </button>
    </div>
  );
}

function SceneryRow({ item, onAdd }: { item: SceneryDef; onAdd: (qty: number) => void }) {
  return (
    <li draggable onDragStart={(e) => e.dataTransfer.setData("application/x-scenery-id", item.id)} className="monster-row">
      <span className="scenery-thumb" aria-hidden>
        <SceneryIcon item={item} className="scenery-thumb-art" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base font-bold">{item.name}</span>
          <Help title={item.name} paragraphs={[item.desc, item.blocks ? "Bloqueia a passagem no grid." : "Não bloqueia a passagem — é só decorativo/de interação."]} />
        </div>
        <p className="text-xs text-foam/70">{item.blocks ? "Bloqueia passagem" : "Passável"}</p>
      </div>
      <QtyAdd onAdd={onAdd} />
    </li>
  );
}

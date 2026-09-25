"use client";

import { useState } from "react";
import { Help } from "./Help";
import { MONSTERS, SIZE_LABEL, type MonsterDef } from "@/lib/monstros";
import { SCENERY, SCENERY_CATEGORY_LABEL, type SceneryCategory, type SceneryDef } from "@/lib/cenario";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddMonster: (monster: MonsterDef, qty: number) => void;
  onAddScenery: (item: SceneryDef, qty: number) => void;
};

type Tab = "monstros" | "cenario";

/**
 * Gaveta deslizante com duas abas: o bestiário (monstros do SRD) e o catálogo
 * de terrenos/objetos de cenário. Cada item tem um campo de quantidade — colocar
 * "5" de uma vez insere os cinco tokens já espalhados em casas livres adjacentes.
 */
export function MonsterPanel({ open, onClose, onAddMonster, onAddScenery }: Props) {
  const [tab, setTab] = useState<Tab>("monstros");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState("");
  const q = query.trim().toLowerCase();

  const monsterList = MONSTERS.filter((m) => !q || m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q));
  const sceneryList = SCENERY.filter((s) => !q || s.name.toLowerCase().includes(q));

  return (
    <>
      {open && <div className="monster-panel-backdrop lg:hidden" onClick={onClose} aria-hidden />}
      <aside className={`monster-panel ${open ? "is-open" : ""}`} aria-label="Bestiário e cenário" aria-hidden={!open}>
        <div className="flex items-center justify-between gap-2 border-b border-brass-deep px-4 py-3">
          <h2 className="font-display text-xl font-bold text-brass-light">Colocar no mapa</h2>
          <button className="btn btn-brass px-3 py-1" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="flex gap-1 border-b border-brass-deep/60 px-4 pt-2">
          {(["monstros", "cenario"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`rounded-t-md px-3 py-1.5 text-sm font-bold ${tab === t ? "bg-vellum text-ember-deep" : "text-foam/70 hover:text-foam"}`}
              onClick={() => setTab(t)}
            >
              {t === "monstros" ? "🐉 Monstros" : "🌲 Terrenos e Cenário"}
            </button>
          ))}
        </div>

        <div className="space-y-3 overflow-y-auto p-4">
          <input
            className="field"
            placeholder={tab === "monstros" ? "Buscar monstro…" : "Buscar item de cenário…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar"
          />
          {added && (
            <p className="text-sm font-semibold text-moss" role="status">
              {added} colocado(s) no mapa.
            </p>
          )}

          {tab === "monstros" ? (
            <>
              <p className="flex items-start gap-1.5 text-xs text-foam/70">
                Escolha a quantidade e clique em "Colocar" — cada um entra numa casa livre.
                <Help title="Bestiário" paragraphs={["Cada criatura já vem com CA, PV, deslocamento, atributos e ataques prontos do SRD.", "Os PV do token podem ser ajustados no painel do token selecionado."]} />
              </p>
              <ul className="space-y-2">
                {monsterList.map((m) => (
                  <MonsterRow key={m.id} m={m} onAdd={(qty) => { onAddMonster(m, qty); setAdded(`${qty}× ${m.name}`); }} />
                ))}
                {monsterList.length === 0 && <p className="py-4 text-center text-sm text-foam/70">Nenhum monstro encontrado.</p>}
              </ul>
            </>
          ) : (
            <>
              <p className="flex items-start gap-1.5 text-xs text-foam/70">
                Ideal para montar a cena rápido: "5" árvores ou "10" cadeiras de uma vez.
                <Help title="Terrenos e cenário" paragraphs={["Esses objetos não têm ficha de combate: servem só para desenhar o mapa (paredes, mobília, natureza, perigos).", "Colocar vários de uma vez os espalha em casas livres adjacentes, prontos para reposicionar depois."]} />
              </p>
              {(Object.keys(SCENERY_CATEGORY_LABEL) as SceneryCategory[]).map((cat) => {
                const items = sceneryList.filter((s) => s.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="picker-group text-brass-light">{SCENERY_CATEGORY_LABEL[cat]}</p>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <SceneryRow key={item.id} item={item} onAdd={(qty) => { onAddScenery(item, qty); setAdded(`${qty}× ${item.name}`); }} />
                      ))}
                    </ul>
                  </div>
                );
              })}
              {sceneryList.length === 0 && <p className="py-4 text-center text-sm text-foam/70">Nenhum item encontrado.</p>}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function QtyAdd({ onAdd, max = 20 }: { onAdd: (qty: number) => void; max?: number }) {
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

function MonsterRow({ m, onAdd }: { m: MonsterDef; onAdd: (qty: number) => void }) {
  return (
    <li
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
        <p className="text-xs text-foam/60">{m.attacks.map((a) => `${a.name} ${a.bonus >= 0 ? "+" : ""}${a.bonus} (${a.damage})`).join(" · ")}</p>
      </div>
      <QtyAdd onAdd={onAdd} />
    </li>
  );
}

function SceneryRow({ item, onAdd }: { item: SceneryDef; onAdd: (qty: number) => void }) {
  return (
    <li
      draggable
      onDragStart={(e) => e.dataTransfer.setData("application/x-scenery-id", item.id)}
      className="monster-row"
    >
      <span className="monster-token text-lg" style={{ background: item.color }} aria-hidden>
        {item.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base font-bold">{item.name}</span>
          <Help title={item.name} paragraphs={[item.desc, item.blocks ? "Bloqueia a passagem no grid." : "Não bloqueia a passagem — é só decorativo/de interação."]} />
        </div>
        <p className="text-xs text-foam/70">{item.blocks ? "Bloqueia passagem" : "Passável"}</p>
      </div>
      <QtyAdd onAdd={onAdd} max={30} />
    </li>
  );
}

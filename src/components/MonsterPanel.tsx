"use client";

import { useMemo, useState } from "react";
import { Help } from "./Help";
import { CR_OPTIONS, MONSTERS, SIZE_LABEL, SIZE_OPTIONS, TYPE_OPTIONS, type MonsterDef } from "@/lib/monstros";
import { SCENERY, SCENERY_CATEGORY_LABEL, type SceneryCategory, type SceneryDef } from "@/lib/cenario";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddMonster: (monster: MonsterDef, qty: number) => void;
  onAddScenery: (item: SceneryDef, qty: number) => void;
};

type Tab = "monstros" | "cenario";

const MAX_SHOWN = 60;

/**
 * Gaveta deslizante com duas abas: o bestiário (as 334 criaturas do SRD, com
 * busca e filtros por ND, tipo e tamanho) e o catálogo de terrenos/objetos de
 * cenário. Cada item tem um campo de quantidade — colocar "5" de uma vez insere
 * os cinco tokens já espalhados em casas livres adjacentes.
 */
export function MonsterPanel({ open, onClose, onAddMonster, onAddScenery }: Props) {
  const [tab, setTab] = useState<Tab>("monstros");
  const [query, setQuery] = useState("");
  const [crMin, setCrMin] = useState<number>(CR_OPTIONS[0]?.value ?? 0);
  const [crMax, setCrMax] = useState<number>(CR_OPTIONS[CR_OPTIONS.length - 1]?.value ?? 30);
  const [typeFilter, setTypeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [added, setAdded] = useState("");
  const q = query.trim().toLowerCase();

  const filtersActive = crMin !== CR_OPTIONS[0]?.value || crMax !== CR_OPTIONS[CR_OPTIONS.length - 1]?.value || typeFilter || sizeFilter;

  const monsterMatches = useMemo(
    () =>
      MONSTERS.filter(
        (m) =>
          (!q || m.name.toLowerCase().includes(q) || m.typePt.toLowerCase().includes(q)) &&
          m.cr >= crMin &&
          m.cr <= crMax &&
          (!typeFilter || m.type === typeFilter) &&
          (!sizeFilter || m.size === sizeFilter),
      ),
    [q, crMin, crMax, typeFilter, sizeFilter],
  );
  const monsterList = monsterMatches.slice(0, MAX_SHOWN);
  const sceneryList = SCENERY.filter((s) => !q || s.name.toLowerCase().includes(q));

  function clearFilters() {
    setCrMin(CR_OPTIONS[0]?.value ?? 0);
    setCrMax(CR_OPTIONS[CR_OPTIONS.length - 1]?.value ?? 30);
    setTypeFilter("");
    setSizeFilter("");
  }

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
              <div className="rounded-md border border-brass-deep/40 bg-black/10 p-2.5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="flex items-center gap-1.5">
                    ND
                    <select className="field w-auto px-1.5 py-1 text-sm" value={crMin} onChange={(e) => setCrMin(Number(e.target.value))} aria-label="Nível de Desafio mínimo">
                      {CR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    até
                    <select className="field w-auto px-1.5 py-1 text-sm" value={crMax} onChange={(e) => setCrMax(Number(e.target.value))} aria-label="Nível de Desafio máximo">
                      {CR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <select className="field w-auto px-1.5 py-1 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Tipo de criatura">
                    <option value="">Todos os tipos</option>
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select className="field w-auto px-1.5 py-1 text-sm" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} aria-label="Tamanho da criatura">
                    <option value="">Todos os tamanhos</option>
                    {SIZE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {filtersActive && (
                    <button className="text-xs font-semibold text-brass-light underline" onClick={clearFilters}>
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
              <p className="flex items-start gap-1.5 text-xs text-foam/70">
                {monsterMatches.length} criatura(s) encontrada(s){monsterMatches.length > MAX_SHOWN ? ` — mostrando as primeiras ${MAX_SHOWN}, refine a busca para ver o resto` : ""}.
                <Help
                  title="Bestiário completo do SRD"
                  paragraphs={[
                    "As 334 criaturas do SRD 5.1, com CA, PV, deslocamento, atributos e ataques prontos. Escolha a quantidade e clique em \"Colocar\" — cada uma entra numa casa livre.",
                    "Cerca de 160 têm nome traduzido; as demais mantêm o nome oficial em inglês do SRD (ainda buscáveis, e o tipo/tamanho já aparecem em português).",
                  ]}
                />
              </p>
              <ul className="space-y-2">
                {monsterList.map((m) => (
                  <MonsterRow key={m.id} m={m} onAdd={(qty) => { onAddMonster(m, qty); setAdded(`${qty}× ${m.name}`); }} />
                ))}
                {monsterList.length === 0 && <p className="py-4 text-center text-sm text-foam/70">Nenhum monstro encontrado com esses filtros.</p>}
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
          <span className="chip">ND {m.crLabel}</span>
          <Help title={m.name}>
            <p>{m.desc}</p>
            {m.senses && <p className="text-sm opacity-80">Sentidos: {m.senses}</p>}
            {m.languages && <p className="text-sm opacity-80">Idiomas: {m.languages}</p>}
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
            <p className="text-xs opacity-70">XP: {m.xp.toLocaleString("pt-BR")}</p>
          </Help>
        </div>
        <p className="text-xs text-foam/70">
          {SIZE_LABEL[m.size]} · {m.typePt} · CA {m.ac} · PV {m.hpAvg} ({m.hpFormula}) · {m.speed} m
          {m.speedNote ? ` (${m.speedNote})` : ""}
        </p>
        {m.attacks.length > 0 && (
          <p className="text-xs text-foam/60">
            {m.attacks.map((a) => `${a.name} ${a.bonus >= 0 ? "+" : ""}${a.bonus} (${a.damage}${a.type ? ` ${a.type}` : ""})`).join(" · ")}
          </p>
        )}
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

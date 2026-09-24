"use client";

import { useMemo, useState } from "react";
import { Help, HelpCalc } from "./Help";
import { Picker } from "./Picker";
import { uid } from "@/lib/dnd";
import {
  COINS,
  ITEMS,
  ITEM_CATEGORY_LABEL,
  PACKS,
  carryCapacity,
  coinsTotalGp,
  coinsWeight,
  convertCoins,
  findItem,
  formatLb,
  lbToKg,
  type CoinKey,
  type Coins,
  type ItemCategory,
  type ItemDef,
} from "@/lib/itens";
import type { InventoryItem } from "@/lib/types";

type Props = {
  inventory: InventoryItem[];
  coins: Coins;
  strScore: number;
  equipmentWeights: { name: string; weight: number }[];
  onInventory: (items: InventoryItem[]) => void;
  onCoins: (coins: Coins) => void;
};

const itemWeight = (i: InventoryItem) => i.weight ?? findItem(i.catalogId)?.weight ?? 0;

/** Soma de carga usada também para o aviso de excesso na ficha */
export function totalLoad(inventory: InventoryItem[], coins: Coins, equipmentWeights: { weight: number }[]) {
  return (
    inventory.reduce((t, i) => t + itemWeight(i) * i.qty, 0) +
    equipmentWeights.reduce((t, e) => t + e.weight, 0) +
    coinsWeight(coins)
  );
}

export function BackpackSection({ inventory, coins, strScore, equipmentWeights, onInventory, onCoins }: Props) {
  const [catalog, setCatalog] = useState(false);
  const [custom, setCustom] = useState({ name: "", weight: "" });

  const itemsLoad = inventory.reduce((t, i) => t + itemWeight(i) * i.qty, 0);
  const equipLoad = equipmentWeights.reduce((t, e) => t + e.weight, 0);
  const coinLoad = coinsWeight(coins);
  const load = itemsLoad + equipLoad + coinLoad;
  const capacity = carryCapacity(strScore);
  const over = load > capacity;
  const pct = capacity > 0 ? Math.min(100, (load / capacity) * 100) : 100;

  function addItem(def: ItemDef, qty = 1) {
    const existing = inventory.find((i) => i.catalogId === def.id);
    if (existing) onInventory(inventory.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i)));
    else onInventory([...inventory, { id: uid(), name: def.name, qty, weight: def.weight, catalogId: def.id }]);
  }

  function addPack(contents: [string, number][]) {
    let next = [...inventory];
    for (const [id, qty] of contents) {
      const def = findItem(id);
      if (!def) continue;
      const existing = next.find((i) => i.catalogId === id);
      next = existing
        ? next.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i))
        : [...next, { id: uid(), name: def.name, qty, weight: def.weight, catalogId: def.id }];
    }
    onInventory(next);
  }

  const setQty = (item: InventoryItem, qty: number) =>
    onInventory(qty <= 0 ? inventory.filter((i) => i !== item) : inventory.map((i) => (i === item ? { ...i, qty } : i)));

  return (
    <section id="mochila" className="mt-10 scroll-mt-20">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl font-bold">Mochila, moedas e carga</h2>
        <Help
          title="Mochila"
          paragraphs={[
            "Aqui fica tudo o que o herói carrega além das armas e armaduras: cordas, tochas, rações, poções e o dinheiro.",
            "Cada item tem um peso em libras (lb), como no livro. A ficha soma tudo e compara com o quanto você aguenta carregar.",
          ]}
        />
      </div>

      {/* ---------- Carga ---------- */}
      <div className={`panel mt-3 p-4 ${over ? "ring-2 ring-blood" : ""}`}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="flex items-center gap-1.5">
            <span className="field-label mb-0">Carga</span>
            <Help
              title="Capacidade de carga"
              paragraphs={[
                "Você aguenta carregar até Força × 15 libras. Acima disso, só consegue empurrar ou arrastar o peso (até o dobro), andando no máximo 1,5 m por turno.",
                "Regra opcional (pergunte ao mestre): acima de Força × 5 você fica sobrecarregado (−3 m de deslocamento); acima de Força × 10, muito sobrecarregado (−6 m e desvantagem em testes de Força, Destreza e Constituição).",
                "50 moedas pesam 1 lb.",
              ]}
            >
              <HelpCalc>
                Força {strScore} × 15 = {formatLb(capacity)} ({lbToKg(capacity)})
              </HelpCalc>
              <HelpCalc>
                Equipamento {formatLb(equipLoad)} + mochila {formatLb(itemsLoad)} + moedas {formatLb(coinLoad)} = {formatLb(load)}
              </HelpCalc>
            </Help>
          </span>
          <span className={`ml-auto font-display text-2xl font-bold ${over ? "text-blood" : ""}`}>
            {formatLb(load)} <span className="text-base text-dim">/ {formatLb(capacity)}</span>
          </span>
        </div>
        <div className="load-bar mt-2" role="meter" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={Math.round(load)} aria-label="Carga carregada">
          <div className={`load-fill ${over ? "is-over" : pct > 66 ? "is-heavy" : ""}`} style={{ width: `${pct}%` }} />
          <span className="load-mark" style={{ left: "33.33%" }} title="Força × 5 (regra opcional)" />
          <span className="load-mark" style={{ left: "66.66%" }} title="Força × 10 (regra opcional)" />
        </div>
        <p className="mt-1 text-xs text-dim">
          Equipamento {formatLb(equipLoad)} · mochila {formatLb(itemsLoad)} · moedas {formatLb(coinLoad)} · cerca de {lbToKg(load)}
        </p>
        {over && (
          <p className="mt-3 rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm font-semibold text-blood" role="alert">
            Excesso de carga! Você passou {formatLb(load - capacity)} do limite. Enquanto estiver assim, só consegue arrastar o peso e anda no máximo 1,5 m por turno. Deixe itens para trás ou divida com o grupo.
          </p>
        )}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.5fr]">
        <CoinPurse coins={coins} onCoins={onCoins} />

        {/* ---------- Itens ---------- */}
        <div className="panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="field-label mb-0">Itens</span>
            <button className="btn btn-primary ml-auto" onClick={() => setCatalog(true)}>
              Abrir catálogo de itens
            </button>
          </div>

          {inventory.length === 0 ? (
            <p className="parchment-grid mt-3 rounded-lg border border-dashed border-brass-deep p-5 text-center text-sm text-dim">
              Mochila vazia. No catálogo há pacotes prontos (Explorador, Masmorras, Assaltante) que enchem a mochila de uma vez.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-rule rounded-lg border border-rule bg-vellum">
              {inventory.map((item) => {
                const def = findItem(item.catalogId);
                const w = itemWeight(item);
                return (
                  <li key={item.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                    <div className="flex items-center">
                      <button className="qty-btn" onClick={() => setQty(item, item.qty - 1)} aria-label={`Menos ${item.name}`}>
                        −
                      </button>
                      <input
                        className="field w-12 rounded-none px-1 py-1 text-center"
                        type="number"
                        min={0}
                        value={item.qty}
                        aria-label={`Quantidade de ${item.name}`}
                        onChange={(e) => setQty(item, Math.max(0, Number(e.target.value) || 0))}
                      />
                      <button className="qty-btn" onClick={() => setQty(item, item.qty + 1)} aria-label={`Mais ${item.name}`}>
                        +
                      </button>
                    </div>
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span className="truncate">{item.name}</span>
                      {def && <ItemHelp def={def} />}
                    </span>
                    {def ? (
                      <span className="text-sm text-dim">{formatLb(w * item.qty)}</span>
                    ) : (
                      <label className="flex items-center gap-1 text-sm text-dim">
                        <input
                          className="field w-16 px-1 py-1 text-center"
                          type="number"
                          min={0}
                          step={0.5}
                          value={item.weight ?? 0}
                          aria-label={`Peso de ${item.name} (lb por unidade)`}
                          onChange={(e) => onInventory(inventory.map((i) => (i === item ? { ...i, weight: Math.max(0, Number(e.target.value) || 0) } : i)))}
                        />
                        lb/un.
                      </label>
                    )}
                    <button className="btn btn-danger px-2 py-1" onClick={() => onInventory(inventory.filter((i) => i !== item))}>
                      Remover
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!custom.name.trim()) return;
              onInventory([...inventory, { id: uid(), name: custom.name.trim(), qty: 1, weight: Math.max(0, Number(custom.weight) || 0) }]);
              setCustom({ name: "", weight: "" });
            }}
          >
            <input className="field min-w-[10rem] flex-1" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="Item fora do catálogo (ex.: mapa do tesouro)" aria-label="Nome do item personalizado" />
            <input className="field w-24" type="number" min={0} step={0.5} value={custom.weight} onChange={(e) => setCustom({ ...custom, weight: e.target.value })} placeholder="Peso lb" aria-label="Peso do item personalizado em libras" />
            <button className="btn btn-ghost border border-rule">Adicionar</button>
          </form>
        </div>
      </div>

      <ItemCatalog open={catalog} onClose={() => setCatalog(false)} onAdd={addItem} onAddPack={addPack} />
    </section>
  );
}

// ---------------------------------------------------------------------------

function ItemHelp({ def }: { def: ItemDef }) {
  return (
    <Help title={def.name}>
      <p>{def.desc}</p>
      <p className="text-sm opacity-80">
        {ITEM_CATEGORY_LABEL[def.category]} · {def.price} · {def.weight ? `${formatLb(def.weight)} (${lbToKg(def.weight)})` : "peso desprezível"}
      </p>
    </Help>
  );
}

function CoinPurse({ coins, onCoins }: { coins: Coins; onCoins: (c: Coins) => void }) {
  const [conv, setConv] = useState<{ amount: string; from: CoinKey; to: CoinKey }>({ amount: "", from: "pp", to: "po" });
  const [msg, setMsg] = useState("");

  function doConvert(e: React.FormEvent) {
    e.preventDefault();
    const r = convertCoins(coins, conv.from, conv.to, Number(conv.amount) || 0);
    const label = (k: CoinKey) => COINS.find((c) => c.key === k)!.short;
    if (!r) {
      setMsg(`Não dá: moedas insuficientes ou poucas para formar 1 ${label(conv.to)}.`);
      return;
    }
    onCoins(r.coins);
    setMsg(`Trocou ${r.used} ${label(conv.from)} por ${r.received} ${label(conv.to)}.`);
    setConv({ ...conv, amount: "" });
  }

  return (
    <div className="panel p-4">
      <div className="flex items-center gap-1.5">
        <span className="field-label mb-0">Bolsa de moedas</span>
        <Help
          title="Moedas e câmbio"
          paragraphs={[
            "O dinheiro do jogo vem em cinco metais. O câmbio oficial é: 1 PL = 10 PO; 1 PO = 2 EP = 10 PP = 100 PC; 1 EP = 5 PP; 1 PP = 10 PC.",
            "Use o trocador abaixo para converter moedas como num cambista: só moedas inteiras são trocadas, e o que sobra fica na bolsa.",
          ]}
        />
        <span className="ml-auto text-sm text-dim">
          Total: <strong className="text-ink">{coinsTotalGp(coins).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} PO</strong>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {COINS.map((c) => (
          <div key={c.key} className="flex flex-col items-center gap-1">
            <span className="coin" style={{ background: `radial-gradient(circle at 35% 30%, #fff8, ${c.color} 45%, ${c.color})` }} aria-hidden>
              {c.short}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-dim">
              {c.metal}
              <Help title={c.name} paragraphs={[c.desc]} />
            </span>
            <input
              className="field px-1 py-1 text-center"
              type="number"
              min={0}
              value={coins[c.key]}
              aria-label={`${c.name}s`}
              onChange={(e) => onCoins({ ...coins, [c.key]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
            />
          </div>
        ))}
      </div>

      <form onSubmit={doConvert} className="mt-4 flex flex-wrap items-center gap-2 border-t border-rule pt-3 text-sm">
        <span className="font-semibold">Trocar</span>
        <input className="field w-20 px-2 py-1" type="number" min={1} value={conv.amount} onChange={(e) => setConv({ ...conv, amount: e.target.value })} placeholder="qtd." aria-label="Quantidade a trocar" />
        <select className="field w-auto px-2 py-1" value={conv.from} onChange={(e) => setConv({ ...conv, from: e.target.value as CoinKey })} aria-label="Moeda de origem">
          {COINS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.short}
            </option>
          ))}
        </select>
        <span>por</span>
        <select className="field w-auto px-2 py-1" value={conv.to} onChange={(e) => setConv({ ...conv, to: e.target.value as CoinKey })} aria-label="Moeda de destino">
          {COINS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.short}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost border border-rule px-3 py-1">Trocar</button>
        {msg && (
          <span className="w-full text-xs text-dim" role="status">
            {msg}
          </span>
        )}
      </form>
    </div>
  );
}

function ItemCatalog({
  open,
  onClose,
  onAdd,
  onAddPack,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (def: ItemDef) => void;
  onAddPack: (contents: [string, number][]) => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ItemCategory | "todos">("todos");
  const [added, setAdded] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(() => {
    const cats = (Object.keys(ITEM_CATEGORY_LABEL) as ItemCategory[]).filter((c) => cat === "todos" || c === cat);
    return cats
      .map((c) => ({ c, list: ITEMS.filter((i) => i.category === c && (!q || i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))) }))
      .filter((g) => g.list.length > 0);
  }, [cat, q]);

  return (
    <Picker open={open} title="Catálogo de itens" onClose={onClose}>
      <div className="sticky top-0 z-10 -mx-5 -mt-1 mb-2 space-y-2 bg-vellum px-5 pb-2 pt-1">
        <input className="field" placeholder="Buscar item (nome ou uso)…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar item" />
        <div className="flex flex-wrap gap-1">
          {(["todos", ...Object.keys(ITEM_CATEGORY_LABEL)] as (ItemCategory | "todos")[]).map((c) => (
            <button
              key={c}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cat === c ? "border-ember-deep bg-ember text-foam" : "border-rule text-dim hover:text-ink"}`}
              onClick={() => setCat(c)}
            >
              {c === "todos" ? "Todos" : ITEM_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        {added && (
          <p className="text-sm font-semibold text-moss" role="status">
            {added}
          </p>
        )}
      </div>

      {cat === "todos" && !q && (
        <div className="mb-4">
          <p className="picker-group">Pacotes prontos</p>
          {PACKS.map((p) => {
            const weight = p.contents.reduce((t, [id, n]) => t + (findItem(id)?.weight ?? 0) * n, 0);
            return (
              <div key={p.id} className="picker-row">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{p.name}</span>
                    <Help title={p.name}>
                      <p>{p.desc} É o jeito mais rápido de montar a mochila inicial: cada item entra separado, com seu peso.</p>
                      <ul className="list-disc pl-5">
                        {p.contents.map(([id, n]) => (
                          <li key={id}>
                            {n > 1 ? `${n}× ` : ""}
                            {findItem(id)?.name}
                          </li>
                        ))}
                      </ul>
                    </Help>
                  </div>
                  <p className="text-sm text-dim">
                    {p.price} · {formatLb(weight)} · {p.contents.length} itens
                  </p>
                </div>
                <button
                  className="btn btn-primary px-3 py-1.5"
                  onClick={() => {
                    onAddPack(p.contents);
                    setAdded(`${p.name} guardado na mochila.`);
                  }}
                >
                  Adicionar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {groups.length === 0 && <p className="py-6 text-center text-dim">Nenhum item encontrado.</p>}
      {groups.map(({ c, list }) => (
        <div key={c} className="mb-4">
          <p className="picker-group">{ITEM_CATEGORY_LABEL[c]}</p>
          {list.map((i) => (
            <div key={i.id} className="picker-row">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{i.name}</span>
                  <ItemHelp def={i} />
                </div>
                <p className="text-sm text-dim">
                  {i.price} · {i.weight ? formatLb(i.weight) : "—"} · {i.desc.split(/[.:]/)[0]}
                </p>
              </div>
              <button
                className="btn btn-primary px-3 py-1.5"
                onClick={() => {
                  onAdd(i);
                  setAdded(`${i.name} guardado na mochila.`);
                }}
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>
      ))}
    </Picker>
  );
}

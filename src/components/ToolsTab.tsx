"use client";

import { Help } from "./Help";
import { formatMod, uid } from "@/lib/dnd";
import { TOOLS, TOOL_GROUP_LABEL, TOOL_SOURCES, formatLb, type ToolGroup } from "@/lib/itens";
import type { InventoryItem } from "@/lib/types";

type Props = {
  toolProfs: string[];
  inventory: InventoryItem[];
  prof: number;
  className?: string;
  background?: string;
  onToolProfs: (ids: string[]) => void;
  onInventory: (items: InventoryItem[]) => void;
};

export function ToolsTab({ toolProfs, inventory, prof, className, background, onToolProfs, onInventory }: Props) {
  const owned = (id: string) => inventory.find((i) => i.catalogId === id)?.qty ?? 0;
  function setOwned(id: string, qty: number) {
    const def = TOOLS.find((t) => t.id === id)!;
    const existing = inventory.find((i) => i.catalogId === id);
    if (qty <= 0) return onInventory(inventory.filter((i) => i.catalogId !== id));
    if (existing) onInventory(inventory.map((i) => (i === existing ? { ...i, qty } : i)));
    else onInventory([...inventory, { id: uid(), name: def.name, qty, weight: def.weight, catalogId: id }]);
  }
  const hints = [className, background].filter((x): x is string => Boolean(x && TOOL_SOURCES[x]));

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl font-bold">Ferramentas</h2>
        <Help
          title="Ferramentas"
          paragraphs={[
            "Ferramentas permitem fazer coisas que precisam de treino: abrir fechaduras, preparar poções, falsificar documentos, tocar música.",
            "Se você é proficiente numa ferramenta, soma o bônus de proficiência no teste feito com ela (o mestre diz qual atributo usar).",
            "Marque “Tenho” para levar a ferramenta: ela vai para a mochila e o peso entra na carga.",
          ]}
        />
        <span className="ml-auto text-sm text-dim">
          Com proficiência, some <strong className="text-ink">{formatMod(prof)}</strong> nos testes.
        </span>
      </div>

      {hints.length > 0 && (
        <p className="panel p-3 text-sm">
          {hints.map((h) => (
            <span key={h} className="block">
              <strong>{h}</strong> costuma dar proficiência em: {TOOL_SOURCES[h]}.
            </span>
          ))}
        </p>
      )}

      {(Object.keys(TOOL_GROUP_LABEL) as ToolGroup[]).map((g) => (
        <section key={g}>
          <p className="picker-group">{TOOL_GROUP_LABEL[g]}</p>
          <ul className="divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-vellum">
            {TOOLS.filter((t) => t.tool === g).map((t) => {
              const isProf = toolProfs.includes(t.id);
              const qty = owned(t.id);
              return (
                <li key={t.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-dim" title="Proficiente">
                    <span className="prof-check">
                      <input
                        type="checkbox"
                        checked={isProf}
                        onChange={(e) => onToolProfs(e.target.checked ? [...toolProfs, t.id] : toolProfs.filter((x) => x !== t.id))}
                        aria-label={`Proficiente em ${t.name}`}
                      />
                      <span className="prof-dot" aria-hidden />
                    </span>
                  </label>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="font-semibold">{t.name}</span>
                    <Help title={t.name}>
                      <p>{t.desc}</p>
                      <p className="text-sm opacity-80">
                        {t.price} · {t.weight ? formatLb(t.weight) : "peso desprezível"}
                      </p>
                    </Help>
                    {isProf && <span className="chip">proficiente {formatMod(prof)}</span>}
                  </span>
                  <span className="w-16 text-right text-sm text-dim">{t.weight ? formatLb(t.weight) : "—"}</span>
                  <span className="w-14 text-right text-sm text-dim">{t.price}</span>
                  <button
                    className={`btn px-3 py-1 ${qty > 0 ? "btn-primary" : "btn-ghost border border-rule"}`}
                    aria-pressed={qty > 0}
                    onClick={() => setOwned(t.id, qty > 0 ? 0 : 1)}
                  >
                    {qty > 0 ? `Tenho${qty > 1 ? ` (${qty})` : ""}` : "Não tenho"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

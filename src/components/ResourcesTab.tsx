"use client";

import { useState } from "react";
import { Help } from "./Help";
import { uid } from "@/lib/dnd";
import type { ResourceDef } from "@/lib/recursos";
import type { Resources } from "@/lib/types";

type Props = {
  defs: ResourceDef[];
  resources: Resources;
  inspiration: boolean;
  onInspiration: (v: boolean) => void;
  onResources: (r: Resources) => void;
};

const UNLIMITED = 99;

export function ResourcesTab({ defs, resources, inspiration, onInspiration, onResources }: Props) {
  const [form, setForm] = useState({ name: "", max: 1, recharge: "long" as "short" | "long" });
  const setUsed = (key: string, max: number, n: number) =>
    onResources({ ...resources, used: { ...resources.used, [key]: Math.max(0, Math.min(max, n)) } });

  const all: (ResourceDef & { custom?: boolean })[] = [
    ...defs,
    ...resources.custom.map((c) => ({ key: `custom:${c.id}`, name: c.name, max: c.max, recharge: c.recharge, desc: "Recurso personalizado.", custom: true })),
  ];

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl font-bold">Recursos</h2>
        <Help
          title="Recursos limitados"
          paragraphs={[
            "Muitos poderes só podem ser usados algumas vezes antes de descansar: a Fúria do bárbaro, o ki do monge, o Canalizar Divindade do clérigo…",
            "Marque cada uso aqui. Os de “descanso curto” voltam com os botões de Descanso Curto ou Longo; os de “descanso longo”, só com o Descanso Longo.",
            "A lista muda sozinha conforme sua classe, subclasse, raça, nível e talentos.",
          ]}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Inspiração do mestre */}
        <div className="panel p-4">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-bold">Inspiração Heroica</span>
            <Help title="Inspiração Heroica" paragraphs={["Dada pelo mestre por boa interpretação. Regra 2024: gaste para rerrolar qualquer dado assim que vê o resultado (não só o d20), usando o novo valor. Não volta com descanso: só quando o mestre der outra, ou um aliado te passar a dele."]} />
          </div>
          <button className={`btn mt-2 w-full ${inspiration ? "btn-primary" : "btn-ghost border border-rule"}`} aria-pressed={inspiration} onClick={() => onInspiration(!inspiration)}>
            {inspiration ? "Tenho inspiração (toque para gastar)" : "Sem inspiração"}
          </button>
        </div>

        {all.map((r) => {
          const unlimited = r.max >= UNLIMITED;
          const used = resources.used[r.key] ?? 0;
          const left = r.max - used;
          const pool = r.max > 12;
          return (
            <div key={r.key} className="panel p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-display text-lg font-bold">{r.name}</span>
                <Help title={r.name} paragraphs={[r.desc, r.recharge === "short" ? "Volta num descanso curto ou longo." : "Volta num descanso longo."]} />
                <span className="chip">{r.recharge === "short" ? "descanso curto" : "descanso longo"}</span>
                {r.custom && (
                  <button
                    className="ml-auto text-xs font-semibold text-blood hover:underline"
                    onClick={() => onResources({ ...resources, custom: resources.custom.filter((c) => `custom:${c.id}` !== r.key) })}
                  >
                    Excluir
                  </button>
                )}
              </div>
              {unlimited ? (
                <p className="mt-2 font-semibold text-moss">Usos ilimitados.</p>
              ) : pool ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-display text-3xl font-bold">{left}</span>
                  <span className="text-dim">de {r.max} restantes</span>
                  <div className="ml-auto flex items-center gap-1">
                    {[1, 5].map((n) => (
                      <button key={n} className="btn btn-ghost border border-rule px-2 py-1" disabled={left <= 0} onClick={() => setUsed(r.key, r.max, used + n)}>
                        −{n}
                      </button>
                    ))}
                    <button className="btn btn-ghost border border-rule px-2 py-1" disabled={used <= 0} onClick={() => setUsed(r.key, r.max, used - 1)}>
                      +1
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {Array.from({ length: r.max }, (_, i) => {
                    const spent = i < used;
                    return (
                      <button
                        key={i}
                        className={`pip pip-lg ${spent ? "is-spent" : ""}`}
                        onClick={() => setUsed(r.key, r.max, spent ? i : i + 1)}
                        aria-label={`${r.name}: uso ${i + 1} ${spent ? "gasto" : "disponível"}`}
                      />
                    );
                  })}
                  <span className="ml-2 text-sm text-dim">
                    {left} de {r.max} {left === 1 ? "restante" : "restantes"}
                  </span>
                  <button className="btn btn-primary ml-auto px-3 py-1" disabled={left <= 0} onClick={() => setUsed(r.key, r.max, used + 1)}>
                    Usar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {defs.length === 0 && <p className="text-dim">Sua classe e raça não têm recursos limitados neste nível. Crie um abaixo se precisar.</p>}

      <form
        className="panel flex flex-wrap items-end gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          onResources({ ...resources, custom: [...resources.custom, { id: uid(), name: form.name.trim(), max: Math.max(1, form.max), recharge: form.recharge }] });
          setForm({ name: "", max: 1, recharge: "long" });
        }}
      >
        <p className="w-full font-display text-lg font-bold">Criar recurso</p>
        <label className="min-w-[12rem] flex-1">
          <span className="field-label">Nome</span>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cargas da varinha, poção especial…" />
        </label>
        <label className="w-24">
          <span className="field-label">Usos</span>
          <input className="field" type="number" min={1} value={form.max} onChange={(e) => setForm({ ...form, max: Number(e.target.value) || 1 })} />
        </label>
        <label className="w-44">
          <span className="field-label">Recupera no</span>
          <select className="field" value={form.recharge} onChange={(e) => setForm({ ...form, recharge: e.target.value as "short" | "long" })}>
            <option value="short">Descanso curto</option>
            <option value="long">Descanso longo</option>
          </select>
        </label>
        <button className="btn btn-primary">Criar</button>
      </form>
    </div>
  );
}

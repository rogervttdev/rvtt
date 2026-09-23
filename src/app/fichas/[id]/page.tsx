"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { supabase } from "@/lib/supabase";
import { ABILITIES, formatMod, modifier, normalizeCharacter, proficiency, rollFormula, uid } from "@/lib/dnd";
import type { AbilityKey, Character } from "@/lib/types";

export default function FichaPage() {
  return (
    <RequireAuth>
      <CharacterEditor />
    </RequireAuth>
  );
}

function CharacterEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [char, setChar] = useState<Character | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [lastRoll, setLastRoll] = useState("");
  const [newItem, setNewItem] = useState("");
  const [newSpell, setNewSpell] = useState({ name: "", level: 0 });

  useEffect(() => {
    supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setStatus("missing");
        setChar(normalizeCharacter(data));
        setStatus("ready");
      });
  }, [id]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patch(p: Partial<Character>) {
    setChar((c) => (c ? { ...c, ...p } : c));
    setDirty(true);
    setMessage("");
  }

  function setAbility(key: AbilityKey, value: number) {
    if (!char) return;
    patch({ abilities: { ...char.abilities, [key]: Math.max(1, Math.min(30, value || 1)) } });
  }

  async function save() {
    if (!char) return;
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, owner_id, created_at, ...rest } = char;
    const { error } = await supabase
      .from("characters")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", char.id);
    setSaving(false);
    if (error) return setMessage(`Não foi possível salvar: ${error.message}`);
    setDirty(false);
    setMessage("Ficha salva.");
  }

  async function remove() {
    if (!char || !confirm(`Excluir a ficha de ${char.name}?`)) return;
    const { error } = await supabase.from("characters").delete().eq("id", char.id);
    if (error) return setMessage(error.message);
    setDirty(false);
    router.push("/fichas");
  }

  function rollCheck(label: string, mod: number) {
    const r = rollFormula(`1d20${mod >= 0 ? "+" : ""}${mod}`);
    if (!r) return;
    const tag = r.crit === "critico" ? " — 20 natural!" : r.crit === "falha" ? " — 1 natural." : "";
    setLastRoll(`${label}: ${r.detail} = ${r.total}${tag}`);
  }

  if (status === "loading") return <p className="p-8 text-dim">Carregando ficha…</p>;
  if (status === "missing" || !char)
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-2xl font-bold">Ficha não encontrada</h1>
        <p className="mt-2 text-dim">Ela pode ter sido excluída ou pertence a outra conta.</p>
        <Link href="/fichas" className="btn btn-primary mt-6">Voltar às fichas</Link>
      </div>
    );

  const prof = proficiency(char.level);
  const hpPct = char.hp_max > 0 ? Math.max(0, Math.min(100, (char.hp_current / char.hp_max) * 100)) : 0;
  const spellsByLevel = [...char.spells].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-8">
      <Link href="/fichas" className="text-sm font-semibold text-module hover:underline">
        ← Todas as fichas
      </Link>

      {/* Identidade */}
      <section className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_90px]">
        <label className="block">
          <span className="field-label">Nome</span>
          <input
            className="field font-display text-2xl font-bold"
            value={char.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="field-label">Raça</span>
          <input className="field" value={char.race ?? ""} onChange={(e) => patch({ race: e.target.value })} placeholder="Meio-orc" />
        </label>
        <label className="block">
          <span className="field-label">Classe</span>
          <input className="field" value={char.class ?? ""} onChange={(e) => patch({ class: e.target.value })} placeholder="Guerreiro" />
        </label>
        <label className="block">
          <span className="field-label">Nível</span>
          <input
            className="field"
            type="number"
            min={1}
            max={20}
            value={char.level}
            onChange={(e) => patch({ level: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
          />
        </label>
      </section>

      {/* Combate */}
      <section className="mt-6 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="panel p-4">
          <div className="flex items-baseline justify-between">
            <span className="field-label">Pontos de vida</span>
            <span className="font-display text-2xl font-bold">
              {char.hp_current}
              <span className="text-base text-dim"> / {char.hp_max}</span>
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-module-soft">
            <div
              className={`h-full ${hpPct <= 25 ? "bg-blood" : "bg-moss"}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="btn btn-ghost border border-module-soft" onClick={() => patch({ hp_current: char.hp_current - 1 })}>
              −1
            </button>
            <button
              className="btn btn-ghost border border-module-soft"
              onClick={() => patch({ hp_current: Math.min(char.hp_max, char.hp_current + 1) })}
            >
              +1
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-dim">
              Atual
              <input
                className="field w-20"
                type="number"
                value={char.hp_current}
                onChange={(e) => patch({ hp_current: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-dim">
              Máx.
              <input
                className="field w-20"
                type="number"
                min={0}
                value={char.hp_max}
                onChange={(e) => patch({ hp_max: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
          </div>
        </div>
        <Stat label="Classe de armadura" value={char.ac} onChange={(v) => patch({ ac: v })} />
        <Stat label="Deslocamento (m)" value={char.speed} onChange={(v) => patch({ speed: v })} />
        <div className="panel flex flex-col justify-center p-4">
          <span className="field-label">Proficiência</span>
          <span className="font-display text-3xl font-bold">{formatMod(prof)}</span>
          <button
            className="mt-1 self-start text-sm font-semibold text-module hover:underline"
            onClick={() => rollCheck("Iniciativa", modifier(char.abilities.dex))}
          >
            Rolar iniciativa ({formatMod(modifier(char.abilities.dex))})
          </button>
        </div>
      </section>

      {/* Atributos */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Atributos</h2>
        <p className="text-sm text-dim">Toque no modificador para rolar um teste.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ABILITIES.map(({ key, label }) => {
            const m = modifier(char.abilities[key]);
            return (
              <div key={key} className="panel flex flex-col items-center p-3 text-center">
                <span className="text-sm font-bold text-dim">{label}</span>
                <button
                  className="my-1 font-display text-3xl font-extrabold text-module-deep hover:text-module"
                  onClick={() => rollCheck(label, m)}
                  aria-label={`Rolar teste de ${label} (${formatMod(m)})`}
                >
                  {formatMod(m)}
                </button>
                <input
                  className="field w-16 py-1 text-center"
                  type="number"
                  min={1}
                  max={30}
                  value={char.abilities[key]}
                  onChange={(e) => setAbility(key, Number(e.target.value))}
                  aria-label={`Valor de ${label}`}
                />
              </div>
            );
          })}
        </div>
        {lastRoll && (
          <p className="mt-3 rounded-md bg-module-soft px-3 py-2 font-semibold text-module-deep" role="status">
            {lastRoll}
          </p>
        )}
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Inventário */}
        <section>
          <h2 className="font-display text-xl font-bold">Inventário</h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newItem.trim()) return;
              patch({ inventory: [...char.inventory, { id: uid(), name: newItem.trim(), qty: 1 }] });
              setNewItem("");
            }}
          >
            <input className="field" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Corda de cânhamo (15 m)" />
            <button className="btn btn-primary">Adicionar</button>
          </form>
          <ul className="mt-3 divide-y divide-module-soft rounded-lg border border-module-soft bg-white">
            {char.inventory.length === 0 && <li className="px-3 py-3 text-sm text-dim">Mochila vazia.</li>}
            {char.inventory.map((item) => (
              <li key={item.id} className="flex items-center gap-2 px-3 py-2">
                <input
                  className="field w-16 py-1 text-center"
                  type="number"
                  min={0}
                  value={item.qty}
                  aria-label={`Quantidade de ${item.name}`}
                  onChange={(e) =>
                    patch({
                      inventory: char.inventory.map((i) =>
                        i.id === item.id ? { ...i, qty: Math.max(0, Number(e.target.value) || 0) } : i,
                      ),
                    })
                  }
                />
                <span className="flex-1">{item.name}</span>
                <button
                  className="btn btn-danger px-2 py-1"
                  onClick={() => patch({ inventory: char.inventory.filter((i) => i.id !== item.id) })}
                  aria-label={`Remover ${item.name}`}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Magias */}
        <section>
          <h2 className="font-display text-xl font-bold">Magias</h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newSpell.name.trim()) return;
              patch({
                spells: [...char.spells, { id: uid(), name: newSpell.name.trim(), level: newSpell.level, prepared: true }],
              });
              setNewSpell({ name: "", level: newSpell.level });
            }}
          >
            <input
              className="field"
              value={newSpell.name}
              onChange={(e) => setNewSpell({ ...newSpell, name: e.target.value })}
              placeholder="Mísseis mágicos"
            />
            <select
              className="field w-28"
              value={newSpell.level}
              onChange={(e) => setNewSpell({ ...newSpell, level: Number(e.target.value) })}
              aria-label="Nível da magia"
            >
              {Array.from({ length: 10 }, (_, l) => (
                <option key={l} value={l}>
                  {l === 0 ? "Truque" : `Nível ${l}`}
                </option>
              ))}
            </select>
            <button className="btn btn-primary">Adicionar</button>
          </form>
          <ul className="mt-3 divide-y divide-module-soft rounded-lg border border-module-soft bg-white">
            {spellsByLevel.length === 0 && <li className="px-3 py-3 text-sm text-dim">Nenhuma magia conhecida.</li>}
            {spellsByLevel.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-3 py-2">
                <input
                  type="checkbox"
                  checked={s.prepared}
                  className="h-4 w-4 accent-[#1d5fa8]"
                  aria-label={`${s.name} preparada`}
                  onChange={(e) =>
                    patch({ spells: char.spells.map((x) => (x.id === s.id ? { ...x, prepared: e.target.checked } : x)) })
                  }
                />
                <span className={`flex-1 ${s.prepared ? "" : "text-dim"}`}>{s.name}</span>
                <span className="text-sm text-dim">{s.level === 0 ? "Truque" : `Nv ${s.level}`}</span>
                <button
                  className="btn btn-danger px-2 py-1"
                  onClick={() => patch({ spells: char.spells.filter((x) => x.id !== s.id) })}
                  aria-label={`Remover ${s.name}`}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <label className="block">
          <span className="font-display text-xl font-bold">Anotações</span>
          <textarea
            className="field mt-3 min-h-32 leading-relaxed"
            value={char.notes ?? ""}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder="Antecedente, idiomas, aliados, segredos…"
          />
        </label>
      </section>

      <button className="btn btn-danger mt-6" onClick={remove}>
        Excluir ficha
      </button>

      {/* Barra de salvar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-module-soft bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <span className="text-sm text-dim" role="status">
            {message || (dirty ? "Alterações não salvas." : "Tudo salvo.")}
          </span>
          <button className="btn btn-primary ml-auto" onClick={save} disabled={!dirty || saving}>
            {saving ? "Salvando…" : "Salvar ficha"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="panel flex flex-col justify-center p-4">
      <span className="field-label">{label}</span>
      <input
        className="w-full bg-transparent font-display text-3xl font-bold outline-none"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

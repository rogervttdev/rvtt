"use client";

import { useEffect, useMemo, useState } from "react";
import { Help, HelpCalc } from "./Help";
import { Picker } from "./Picker";
import { ABILITY_LABEL, formatMod, uid } from "@/lib/dnd";
import { CIRCLE_LABEL, SCHOOL_HELP, SPELL_LIST_CLASSES, SPELL_LIST_LABEL, casterFor, maxCircle, spellSlots, type SpellDef } from "@/lib/magias";
import type { ClassDef } from "@/lib/regras";
import type { Abilities, Resources, Spell } from "@/lib/types";

type Props = {
  spells: Spell[];
  cls?: ClassDef;
  subclass: string;
  level: number;
  mods: Abilities;
  prof: number;
  resources: Resources;
  onSpells: (s: Spell[]) => void;
  onResources: (r: Resources) => void;
  onRoll: (label: string, bonus: number, formula?: string) => void;
  onMessage: (m: string) => void;
};

/** Escolhe o dado de dano do resumo mecânico conforme o nível do personagem (truques escalam). */
function damageFormula(mech: string, charLevel: number) {
  const i = mech.indexOf("Dano: ");
  if (i < 0) return null;
  const rest = mech.slice(i + 6).split(" · ")[0];
  let pick: string | null = null;
  for (const part of rest.split(",").map((x) => x.trim())) {
    const mm = part.match(/^(\d+d\d+(?: ?\+ ?\d+)?)(?: \(nível (\d+)\+\))?/);
    if (mm && (!mm[2] || charLevel >= Number(mm[2]))) pick = mm[1].replace(/ /g, "");
  }
  return pick;
}

export function SpellsTab({ spells, cls, subclass, level, mods, prof, resources, onSpells, onResources, onRoll, onMessage }: Props) {
  const [srd, setSrd] = useState<SpellDef[] | null>(null);
  const [catalog, setCatalog] = useState(false);
  const [custom, setCustom] = useState({ name: "", level: 0 });

  // O catálogo (319 magias) só é baixado quando a aba abre
  useEffect(() => {
    import("@/lib/magias-srd").then((m) => setSrd(m.SRD_SPELLS));
  }, []);

  const caster = casterFor(cls?.name, subclass);
  const slots = spellSlots(caster, level);
  const castMod = caster ? mods[caster.ability] : 0;
  const dc = 8 + prof + castMod;
  const attack = prof + castMod;
  const byId = useMemo(() => new Map((srd ?? []).map((s) => [s.id, s])), [srd]);

  const used = (i: number) => resources.slotsUsed[i] ?? 0;
  function setSlotUsed(i: number, n: number) {
    const next = [...resources.slotsUsed];
    while (next.length <= i) next.push(0);
    next[i] = Math.max(0, Math.min(slots.slots[i] ?? 0, n));
    onResources({ ...resources, slotsUsed: next });
  }

  function cast(sp: Spell) {
    const def = sp.srdId ? byId.get(sp.srdId) : undefined;
    if (sp.level > 0) {
      if (slots.pact) {
        if (sp.level > slots.pact.level) return onMessage(`${sp.name} é de ${sp.level}º círculo; seus espaços de pacto são de ${slots.pact.level}º.`);
        if (resources.pactUsed >= slots.pact.count) return onMessage("Sem espaços de pacto. Eles voltam num descanso curto.");
        onResources({ ...resources, pactUsed: resources.pactUsed + 1 });
        onMessage(`${sp.name} lançada com um espaço de pacto (${slots.pact.level}º círculo).`);
      } else {
        const idx = slots.slots.findIndex((max, i) => i >= sp.level - 1 && used(i) < max);
        if (idx < 0) return onMessage(`Sem espaços de ${sp.level}º círculo ou maior. Eles voltam num descanso longo.`);
        setSlotUsed(idx, used(idx) + 1);
        onMessage(`${sp.name} lançada com um espaço de ${idx + 1}º círculo.`);
      }
    }
    if (def?.mech.includes("Ataque mágico")) onRoll(`Ataque: ${sp.name}`, attack);
  }

  const mine = [...spells].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  const circles = [...new Set(mine.map((s) => s.level))];
  const has = (id: string) => spells.some((s) => s.srdId === id);

  return (
    <div className="mt-6 space-y-8">
      {/* ---------- Conjuração ---------- */}
      <section className="panel p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold">Conjuração</h2>
          <Help
            title="Como funcionam as magias"
            paragraphs={[
              "Regra 2024: as magias vêm de três grandes listas — Arcana (Bardo, Feiticeiro, Bruxo, Mago), Divina (Clérigo, Paladino) e Primordial (Druida, Patrulheiro). O grimório já filtra pela lista da sua classe.",
              "Truques (círculo 0) podem ser lançados à vontade. Magias de 1º círculo em diante gastam um espaço de magia do mesmo círculo ou maior.",
              "Os espaços gastos voltam no descanso longo (para o bruxo, no curto). Toque em “Lançar” para gastar o espaço automaticamente.",
              "Concentração: você só mantém uma magia assim por vez, e pode perdê-la ao sofrer dano (teste de Constituição).",
            ]}
          />
        </div>
        {!caster ? (
          <p className="mt-2 text-dim">
            {cls ? `${cls.name} não lança magias${cls.name === "Guerreiro" || cls.name === "Ladino" ? " (as subclasses Cavaleiro Arcano e Trapaceiro Arcano lançam, a partir do 3º nível)" : ""}.` : "Escolha uma classe na aba Ficha."} Você ainda pode anotar magias vindas de raça ou talentos, como Iniciado em Magia.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-rule bg-vellum/70 p-3">
              <span className="flex items-center gap-1.5 text-sm font-bold text-dim">
                Atributo
                <Help title="Atributo de conjuração" paragraphs={["Cada classe usa um atributo para a magia: Inteligência (mago), Sabedoria (clérigo, druida, patrulheiro) ou Carisma (bardo, bruxo, feiticeiro, paladino)."]} />
              </span>
              <span className="font-display text-2xl font-bold">
                {ABILITY_LABEL[caster.ability]} {formatMod(castMod)}
              </span>
            </div>
            <div className="rounded-md border border-rule bg-vellum/70 p-3">
              <span className="flex items-center gap-1.5 text-sm font-bold text-dim">
                CD de resistência
                <Help title="CD das suas magias" paragraphs={["É o número que o inimigo precisa alcançar na resistência para escapar da sua magia."]}>
                  <HelpCalc>
                    8 {formatMod(prof)} de proficiência {formatMod(castMod)} de {ABILITY_LABEL[caster.ability]} = {dc}
                  </HelpCalc>
                </Help>
              </span>
              <span className="font-display text-2xl font-bold">{dc}</span>
            </div>
            <div className="rounded-md border border-rule bg-vellum/70 p-3">
              <span className="flex items-center gap-1.5 text-sm font-bold text-dim">
                Ataque mágico
                <Help title="Bônus de ataque mágico" paragraphs={["Some ao d20 quando uma magia pede ataque mágico, como Raio de Fogo ou Rajada Mística."]}>
                  <HelpCalc>
                    {formatMod(prof)} de proficiência {formatMod(castMod)} de {ABILITY_LABEL[caster.ability]} = {formatMod(attack)}
                  </HelpCalc>
                </Help>
              </span>
              <button className="font-display text-2xl font-bold text-ember-deep hover:text-ember" onClick={() => onRoll("Ataque mágico", attack)}>
                {formatMod(attack)}
              </button>
            </div>
            {caster.prepares && (
              <p className="text-sm text-dim sm:col-span-3">
                Você prepara magias depois de cada descanso longo: até <strong className="text-ink">{caster.prepares}</strong> (mínimo 1). Marque as preparadas na lista abaixo.
              </p>
            )}
          </div>
        )}

        {/* Espaços */}
        {(slots.slots.length > 0 || slots.pact) && (
          <div className="mt-4 border-t border-rule pt-3">
            <span className="flex items-center gap-1.5 text-sm font-bold text-dim">
              {slots.pact ? "Espaços de Magia de Pacto" : "Espaços de magia"}
              <Help
                title="Espaços de magia"
                paragraphs={[
                  "Cada bolinha é um espaço. Toque para marcar como gasto ou recuperar.",
                  slots.pact
                    ? "Bruxos têm poucos espaços, todos do mesmo círculo, que voltam num descanso curto."
                    : "Os espaços gastos voltam no descanso longo.",
                ]}
              />
            </span>
            <div className="mt-2 flex flex-wrap gap-4">
              {slots.pact ? (
                <SlotRow label={`${slots.pact.level}º círculo`} max={slots.pact.count} used={resources.pactUsed} onChange={(n) => onResources({ ...resources, pactUsed: Math.max(0, Math.min(slots.pact!.count, n)) })} />
              ) : (
                slots.slots.map((max, i) => <SlotRow key={i} label={`${i + 1}º`} max={max} used={used(i)} onChange={(n) => setSlotUsed(i, n)} />)
              )}
            </div>
          </div>
        )}
      </section>

      {/* ---------- Minhas magias ---------- */}
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold">Minhas magias</h2>
          <button className="btn btn-primary ml-auto" onClick={() => setCatalog(true)}>
            Abrir grimório ({srd ? srd.length : "…"} magias)
          </button>
        </div>
        {mine.length === 0 ? (
          <p className="parchment-grid mt-3 rounded-lg border border-dashed border-brass-deep p-6 text-center text-dim">
            Nenhuma magia. Abra o grimório: ele já mostra primeiro as magias da sua classe{caster ? ` até o ${maxCircle(slots)}º círculo` : ""}.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {circles.map((c) => (
              <div key={c}>
                <p className="picker-group">{CIRCLE_LABEL(c)}</p>
                <ul className="space-y-2">
                  {mine
                    .filter((s) => s.level === c)
                    .map((sp) => {
                      const def = sp.srdId ? byId.get(sp.srdId) : undefined;
                      const dmg = def ? damageFormula(def.mech, level) : null;
                      return (
                        <li key={sp.id} className="panel flex flex-wrap items-center gap-2 px-3 py-2">
                          {c > 0 && (
                            <label className="flex items-center gap-1 text-xs font-semibold text-dim" title="Preparada">
                              <span className="prof-check">
                                <input type="checkbox" checked={sp.prepared} onChange={(e) => onSpells(spells.map((x) => (x.id === sp.id ? { ...x, prepared: e.target.checked } : x)))} aria-label={`${sp.name} preparada`} />
                                <span className="prof-dot" aria-hidden />
                              </span>
                            </label>
                          )}
                          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                            <span className={`font-semibold ${c > 0 && !sp.prepared ? "text-dim" : ""}`}>{sp.name}</span>
                            {def && <SpellHelp def={def} />}
                            {def?.conc && <span className="chip">concentração</span>}
                            {def?.ritual && <span className="chip">ritual</span>}
                            {def && <span className="text-xs text-dim">{def.mech}</span>}
                          </span>
                          {dmg && (
                            <button className="attack-pill" onClick={() => onRoll(`Dano: ${sp.name}`, 0, dmg)}>
                              <span className="text-[0.65rem] font-bold uppercase opacity-70">Dano</span>
                              <span className="font-display font-bold">{dmg}</span>
                            </button>
                          )}
                          <button className="btn btn-ghost border border-rule px-3 py-1" onClick={() => cast(sp)}>
                            {c === 0 ? "Usar" : "Lançar"}
                          </button>
                          <button className="btn btn-danger px-2 py-1" onClick={() => onSpells(spells.filter((x) => x.id !== sp.id))}>
                            Remover
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        )}

        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!custom.name.trim()) return;
            onSpells([...spells, { id: uid(), name: custom.name.trim(), level: custom.level, prepared: true }]);
            setCustom({ name: "", level: custom.level });
          }}
        >
          <input className="field min-w-[12rem] flex-1" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="Magia fora do grimório (ex.: Bruxaria)" aria-label="Magia personalizada" />
          <select className="field w-32" value={custom.level} onChange={(e) => setCustom({ ...custom, level: Number(e.target.value) })} aria-label="Círculo">
            {Array.from({ length: 10 }, (_, l) => (
              <option key={l} value={l}>
                {CIRCLE_LABEL(l)}
              </option>
            ))}
          </select>
          <button className="btn btn-ghost border border-rule">Adicionar</button>
        </form>
        <p className="mt-3 text-xs text-dim">
          Grimório com as magias do SRD 5.1 da Wizards of the Coast, licença CC-BY-4.0; nomes e resumos traduzidos, texto completo no original em inglês. Magias do Livro do Jogador fora do SRD podem ser adicionadas no campo acima.
        </p>
      </section>

      <SpellCatalog
        open={catalog}
        onClose={() => setCatalog(false)}
        spells={srd}
        listClasses={caster ? SPELL_LIST_CLASSES[caster.broadList] : undefined}
        listLabel={caster ? SPELL_LIST_LABEL[caster.broadList] : undefined}
        maxLevel={caster ? maxCircle(slots) : 9}
        has={has}
        onToggle={(def) =>
          has(def.id)
            ? onSpells(spells.filter((s) => s.srdId !== def.id))
            : onSpells([...spells, { id: uid(), name: def.name, level: def.level, prepared: true, srdId: def.id }])
        }
      />
    </div>
  );
}

function SlotRow({ label, max, used, onChange }: { label: string; max: number; used: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-16 text-sm font-semibold">{label}</span>
      {Array.from({ length: max }, (_, i) => {
        const spent = i < used;
        return (
          <button
            key={i}
            className={`pip ${spent ? "is-spent" : ""}`}
            onClick={() => onChange(spent ? i : i + 1)}
            aria-label={`Espaço ${i + 1} de ${label}: ${spent ? "gasto" : "disponível"}`}
          />
        );
      })}
      <span className="text-xs text-dim">
        {max - used}/{max}
      </span>
    </div>
  );
}

export function SpellHelp({ def }: { def: SpellDef }) {
  return (
    <Help
      title={def.name}
      preview={
        <>
          <p className="text-xs opacity-80">
            {CIRCLE_LABEL(def.level)} · {def.school}
          </p>
          {def.summary && <p>{def.summary}</p>}
          {def.mech && <p className="font-semibold">{def.mech}</p>}
          <p className="text-xs opacity-80">
            {def.time} · {def.range} · {def.duration}
          </p>
        </>
      }
    >
      <p className="text-sm text-dim">
        {CIRCLE_LABEL(def.level)} de {def.school.toLowerCase()} · em inglês: {def.en}
      </p>
      {def.summary && <p>{def.summary}</p>}
      {def.mech && <p className="help-calc">{def.mech}</p>}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-bold">Tempo</dt>
        <dd>{def.time}</dd>
        <dt className="font-bold">Alcance</dt>
        <dd>{def.range}</dd>
        <dt className="font-bold">Componentes</dt>
        <dd>
          {def.components}
          {def.material ? ` (material: ${def.material})` : ""}
        </dd>
        <dt className="font-bold">Duração</dt>
        <dd>
          {def.conc ? "Concentração, " : ""}
          {def.duration}
          {def.ritual ? " · pode ser ritual" : ""}
        </dd>
        <dt className="font-bold">Escola</dt>
        <dd>
          {def.school}: {SCHOOL_HELP[def.school]}
        </dd>
        <dt className="font-bold">Classes</dt>
        <dd>{def.classes.join(", ")}</dd>
      </dl>
      <p className="text-xs text-dim">V = verbal (falar), S = somático (gestos), M = material (objeto ou foco).</p>
      <details className="rounded-md border border-rule bg-paper/50 p-2 text-sm">
        <summary className="cursor-pointer font-semibold">Texto completo (SRD 5.1, em inglês)</summary>
        <div className="mt-2 space-y-2 whitespace-pre-line">
          {def.desc}
          {def.higher && <p className="mt-2 italic">{def.higher}</p>}
        </div>
      </details>
    </Help>
  );
}

function SpellCatalog({
  open,
  onClose,
  spells,
  listClasses,
  listLabel,
  maxLevel,
  has,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  spells: SpellDef[] | null;
  listClasses?: string[];
  listLabel?: string;
  maxLevel: number;
  has: (id: string) => boolean;
  onToggle: (def: SpellDef) => void;
}) {
  const [query, setQuery] = useState("");
  const [circle, setCircle] = useState<number | "todos">("todos");
  const [onlyMine, setOnlyMine] = useState(true);
  const [upToMax, setUpToMax] = useState(true);
  const q = query.trim().toLowerCase();

  const list = useMemo(
    () =>
      (spells ?? []).filter(
        (s) =>
          (circle === "todos" || s.level === circle) &&
          (!onlyMine || !listClasses || s.classes.some((c) => listClasses.includes(c))) &&
          (!upToMax || s.level <= maxLevel) &&
          (!q || s.name.toLowerCase().includes(q) || s.en.toLowerCase().includes(q) || (s.summary ?? "").toLowerCase().includes(q) || s.mech.toLowerCase().includes(q)),
      ),
    [spells, circle, onlyMine, upToMax, listClasses, maxLevel, q],
  );

  return (
    <Picker open={open} title="Grimório" onClose={onClose}>
      <div className="sticky top-0 z-10 -mx-5 -mt-1 mb-2 space-y-2 bg-vellum px-5 pb-2 pt-1">
        <input className="field" placeholder="Buscar magia (português ou inglês)…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar magia" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <select className="field w-auto px-2 py-1" value={circle} onChange={(e) => setCircle(e.target.value === "todos" ? "todos" : Number(e.target.value))} aria-label="Círculo">
            <option value="todos">Todos os círculos</option>
            {Array.from({ length: 10 }, (_, l) => (
              <option key={l} value={l}>
                {CIRCLE_LABEL(l)}
              </option>
            ))}
          </select>
          {listClasses && (
            <label className="flex items-center gap-1.5">
              <input type="checkbox" className="h-4 w-4 accent-[#a8431f]" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
              Só da lista {listLabel} ({listClasses.join(", ")})
            </label>
          )}
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="h-4 w-4 accent-[#a8431f]" checked={upToMax} onChange={(e) => setUpToMax(e.target.checked)} />
            Só as que já posso lançar
          </label>
          <span className="ml-auto text-dim">{list.length} magias</span>
        </div>
      </div>
      {!spells && <p className="py-6 text-center text-dim">Abrindo o grimório…</p>}
      {spells && list.length === 0 && <p className="py-6 text-center text-dim">Nenhuma magia com esses filtros.</p>}
      {Array.from({ length: 10 }, (_, l) => l)
        .filter((l) => list.some((s) => s.level === l))
        .map((l) => (
          <div key={l} className="mb-4">
            <p className="picker-group">{CIRCLE_LABEL(l)}</p>
            {list
              .filter((s) => s.level === l)
              .map((s) => (
                <div key={s.id} className={`picker-row ${has(s.id) ? "is-selected" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-xs text-dim">({s.en})</span>
                      <SpellHelp def={s} />
                      {s.conc && <span className="chip">concentração</span>}
                      {s.ritual && <span className="chip">ritual</span>}
                    </div>
                    <p className="text-sm text-dim">{s.summary ?? s.mech ?? ""}</p>
                    <p className="text-xs text-dim">
                      {s.school} · {s.time} · {s.range} · {s.duration}
                    </p>
                  </div>
                  <button className={`btn px-3 py-1.5 ${has(s.id) ? "btn-danger border border-blood/40" : "btn-primary"}`} onClick={() => onToggle(s)}>
                    {has(s.id) ? "Remover" : "Adicionar"}
                  </button>
                </div>
              ))}
          </div>
        ))}
    </Picker>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { Help, HelpCalc } from "@/components/Help";
import { PortraitUploader } from "@/components/PortraitUploader";
import { useUser } from "@/components/SessionProvider";
import { supabase } from "@/lib/supabase";
import { deleteAvatar } from "@/lib/avatar";
import { ABILITIES, ABILITY_LABEL, formatMod, modifier, normalizeCharacter, proficiency, rollFormula, uid } from "@/lib/dnd";
import { ABILITY_ABOUT, ALIGNMENTS, GLOSSARIO } from "@/lib/glossario";
import { computeAc, equipmentWeights, findArmor } from "@/lib/equipamento";
import { EquipmentSection } from "@/components/EquipmentSection";
import { ProgressionTab } from "@/components/ProgressionTab";
import { BackpackSection, totalLoad } from "@/components/BackpackSection";
import { carryCapacity } from "@/lib/itens";
import { classResources } from "@/lib/recursos";
import { SpellsTab } from "@/components/SpellsTab";
import { ResourcesTab } from "@/components/ResourcesTab";
import { ToolsTab } from "@/components/ToolsTab";
import { RestControls } from "@/components/RestControls";

const TABS = [
  { id: "ficha", label: "Ficha" },
  { id: "magias", label: "Magias" },
  { id: "recursos", label: "Recursos" },
  { id: "ferramentas", label: "Ferramentas" },
  { id: "progressao", label: "Progressão" },
] as const;
type Tab = (typeof TABS)[number]["id"];
import {
  BACKGROUNDS,
  CLASSES,
  RACES,
  SKILLS,
  findBackground,
  findClass,
  findRace,
  formatMeters,
  grantedSkills,
  racialBonus,
  backgroundBonus,
  speedFor,
  standardArrayFor,
  suggestedHp,
} from "@/lib/regras";
import type { Abilities, AbilityKey, Character, CharacterDetails, RollResult, SkillKey } from "@/lib/types";

export default function FichaPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireAuth>
      <CharacterSheet characterId={id} />
    </RequireAuth>
  );
}

type RollToast = RollResult & { label: string; key: number };

/**
 * Ficha completa do personagem. Usada tanto na página /fichas/[id] quanto,
 * em modo `embedded`, dentro do modal flutuante da mesa ("Minha ficha" e
 * a visão do mestre sobre a ficha de qualquer jogador).
 */
export function CharacterSheet({
  characterId,
  embedded = false,
  onClose,
}: {
  characterId: string;
  embedded?: boolean;
  onClose?: () => void;
}) {
  const id = characterId;
  const router = useRouter();
  const { user } = useUser();
  const [char, setChar] = useState<Character | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedToast, setSavedToast] = useState(false);
  const [roll, setRoll] = useState<RollToast | null>(null);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tab, setTab] = useState<Tab>("ficha");

  useEffect(() => {
    const h = window.location.hash.slice(1) as Tab;
    if (TABS.some((t) => t.id === h)) setTab(h);
  }, []);

  function changeTab(next: Tab) {
    setTab(next);
    history.replaceState(null, "", next === "ficha" ? window.location.pathname : `#${next}`);
  }

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

  // ---------- Valores derivados ----------
  const derived = useMemo(() => {
    if (!char) return null;
    const d = char.details;
    const race = findRace(char.race);
    const sub = race?.subraces?.find((s) => s.name === d.subrace);
    const cls = findClass(char.class);
    const bg = findBackground(d.background);
    const bonus = { ...racialBonus(race, sub, d.bonusChoices) };
    const bgBonus = backgroundBonus(bg, d.backgroundAbilityMode, d.backgroundFocus);
    for (const [k, v] of Object.entries(bgBonus)) bonus[k as AbilityKey] = (bonus[k as AbilityKey] ?? 0) + (v ?? 0);
    const scores = {} as Abilities;
    const mods = {} as Abilities;
    for (const { key } of ABILITIES) {
      scores[key] = char.abilities[key] + (bonus[key] ?? 0);
      mods[key] = modifier(scores[key]);
    }
    const prof = proficiency(char.level);
    const granted = grantedSkills(race, bg);
    const chosen = new Set(d.skills.filter((s) => !granted.has(s)));
    const isProf = (s: SkillKey) => granted.has(s) || chosen.has(s);
    const skillBonus = (s: SkillKey) => mods[SKILLS.find((x) => x.key === s)!.ability] + (isProf(s) ? prof : 0);
    // Regra do Livro do Jogador: se raça e antecedente derem a mesma perícia, escolhe-se outra no lugar
    const overlap = (race?.skills ?? []).filter((s) => bg?.skills.includes(s)).length;
    const allowedChoices = (cls?.skillCount ?? 0) + (race?.chooseSkills ?? 0) + (cls ? overlap : 0);
    return {
      race,
      sub,
      cls,
      bg,
      bonus,
      scores,
      mods,
      prof,
      granted,
      chosen,
      isProf,
      skillBonus,
      allowedChoices,
      overlap,
      ac: computeAc(char.equipment, cls, mods),
      armorSpeedPenalty: (() => {
        const armor = findArmor(char.equipment.armor);
        return armor?.strength && scores.str < armor.strength && race?.name !== "Anão" ? 3 : 0;
      })(),
      speed: speedFor(race, sub),
      hpSuggestion: (() => {
        const base = suggestedHp(cls, char.level, mods.con, sub);
        return base === null ? null : base + (char.feats.includes("Robusto") ? 2 * char.level : 0);
      })(),
      initiative: mods.dex + (char.feats.includes("Alerta") ? 5 : 0),
      passive: 10 + skillBonus("percepcao") + (char.feats.includes("Observador") ? 5 : 0),
      speedParts: (() => {
        const parts: { label: string; value: number }[] = [];
        const armor = findArmor(char.equipment.armor);
        if (cls?.name === "Bárbaro" && char.level >= 5 && armor?.category !== "pesada") parts.push({ label: "Movimento Rápido", value: 3 });
        if (cls?.name === "Monge" && char.level >= 2 && !armor && !char.equipment.shield) {
          const m = char.level >= 18 ? 9 : char.level >= 14 ? 7.5 : char.level >= 10 ? 6 : char.level >= 6 ? 4.5 : 3;
          parts.push({ label: "Movimento sem Armadura", value: m });
        }
        if (char.feats.includes("Mobilidade")) parts.push({ label: "talento Mobilidade", value: 3 });
        return parts;
      })(),
    };
  }, [char]);

  function patch(p: Partial<Character>) {
    setChar((c) => (c ? { ...c, ...p } : c));
    setDirty(true);
    setMessage("");
  }

  function patchDetails(p: Partial<CharacterDetails>) {
    setChar((c) => (c ? { ...c, details: { ...c.details, ...p } } : c));
    setDirty(true);
    setMessage("");
  }

  function doRoll(label: string, bonus: number, formula?: string) {
    const r = rollFormula(formula ?? `1d20${bonus >= 0 ? "+" : ""}${bonus}`);
    if (!r) return;
    setRoll({ ...r, label, key: Date.now() });
    if (rollTimer.current) clearTimeout(rollTimer.current);
    rollTimer.current = setTimeout(() => setRoll(null), 7000);
  }

  async function save() {
    if (!char) return;
    setSaving(true);
    // Envia explicitamente todas as colunas da ficha; a posse (user_id) nunca é alterada aqui.
    // O peso total é recalculado agora, na hora de salvar, para ir sempre coerente com o
    // inventário, as moedas e o equipamento atuais.
    const ac = derived?.ac.total ?? char.ac;
    const weight = totalLoad(char.inventory, char.coins, equipmentWeights(char.equipment));
    const payload = {
      name: char.name,
      race: char.race || null,
      class: char.class || null,
      level: char.level,
      abilities: char.abilities,
      hp_current: char.hp_current,
      hp_max: char.hp_max,
      ac,
      speed: char.speed,
      alignment: char.alignment || null,
      // Armas ficam dentro de equipment.weapons (cada uma referencia o catálogo por id;
      // nome, dano, tipo, maestria e peso são resolvidos de lá — ver src/lib/equipamento.ts —
      // então não duplicamos esses dados na ficha, evitando divergência se o catálogo mudar).
      equipment: char.equipment,
      subclass: char.subclass || null,
      feats: char.feats,
      xp: char.xp,
      coins: char.coins,
      resources: char.resources,
      tool_profs: char.tool_profs,
      inventory: char.inventory,
      spells: char.spells,
      notes: char.notes,
      details: char.details,
      total_weight: Math.round(weight * 100) / 100,
      updated_at: new Date().toISOString(),
    };
    // Pede de volta a linha como o banco realmente a gravou: fecha o ciclo e garante que a
    // ficha na tela nunca fica dessincronizada do que está persistido, mesmo que algum
    // valor tenha sido normalizado/arredondado pelo Postgres.
    const { data, error } = await supabase.from("characters").update(payload).eq("id", char.id).select("*").single();
    setSaving(false);
    if (error) return setMessage(`Não foi possível salvar: ${error.message}`);
    if (data) setChar(normalizeCharacter(data));
    setDirty(false);
    setMessage("Ficha salva com sucesso!");
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  /** O retrato é salvo na hora, sem depender do botão "Salvar ficha". */
  async function saveAvatar(url: string | null) {
    if (!char) return;
    const { error } = await supabase
      .from("characters")
      .update({ avatar_url: url, updated_at: new Date().toISOString() })
      .eq("id", char.id);
    if (error) {
      if (/avatar_url/i.test(error.message))
        throw new Error("A coluna avatar_url ainda não existe. Rode o supabase/schema.sql atualizado.");
      throw new Error(error.message);
    }
    setChar((c) => (c ? { ...c, avatar_url: url } : c));
  }

  async function remove() {
    if (!char || !confirm(`Excluir a ficha de ${char.name}?`)) return;
    const { error } = await supabase.from("characters").delete().eq("id", char.id);
    if (error) return setMessage(error.message);
    deleteAvatar(char.avatar_url).catch(() => {});
    setDirty(false);
    if (embedded) onClose?.();
    else router.push("/fichas");
  }

  if (status === "loading") return <p className="p-8 text-dim">Abrindo a ficha…</p>;
  if (status === "missing" || !char || !derived)
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-2xl font-bold">Ficha não encontrada</h1>
        <p className="mt-2 text-dim">Ela pode ter sido excluída ou pertence a outra conta.</p>
        {embedded ? (
          <button className="btn btn-primary mt-6" onClick={onClose}>
            Fechar
          </button>
        ) : (
          <Link href="/fichas" className="btn btn-primary mt-6">
            Voltar às fichas
          </Link>
        )}
      </div>
    );

  const d = char.details;
  const load = totalLoad(char.inventory, char.coins, equipmentWeights(char.equipment));
  const overloaded = load > carryCapacity(derived.scores.str);
  const normalSpeed = derived.speed + derived.speedParts.reduce((t, p) => t + p.value, 0) - derived.armorSpeedPenalty;
  const totalSpeed = overloaded ? Math.min(1.5, normalSpeed) : normalSpeed;
  const alignment = ALIGNMENTS.find((a) => a.name === char.alignment);
  const { race, sub, cls, bg, bonus, scores, mods, prof, granted, chosen, isProf, skillBonus, allowedChoices, overlap } = derived;
  const hpPct = char.hp_max > 0 ? Math.max(0, Math.min(100, (char.hp_current / char.hp_max) * 100)) : 0;
  const hitDiceLeft = Math.max(0, char.level - d.hitDiceSpent);
  const resourceDefs = classResources({
    className: cls?.name,
    subclass: char.subclass,
    race: race?.name,
    level: char.level,
    mods,
    feats: char.feats,
  });

  function shortRest(healed: number, diceSpent: number) {
    if (!char) return;
    const used = { ...char.resources.used };
    for (const r of resourceDefs) if (r.recharge === "short") used[r.key] = 0;
    for (const c of char.resources.custom) if (c.recharge === "short") used[`custom:${c.id}`] = 0;
    setChar({
      ...char,
      hp_current: Math.min(char.hp_max, char.hp_current + healed),
      details: { ...char.details, hitDiceSpent: char.details.hitDiceSpent + diceSpent },
      resources: { ...char.resources, used, pactUsed: 0 },
    });
    setDirty(true);
    setMessage(`Descanso curto concluído${healed ? `: +${healed} PV` : ""}. Recursos de descanso curto recuperados. Lembre de salvar.`);
  }

  function longRest() {
    if (!char) return;
    const recovered = Math.min(char.details.hitDiceSpent, Math.max(1, Math.floor(char.level / 2)));
    setChar({
      ...char,
      hp_current: char.hp_max,
      details: { ...char.details, hitDiceSpent: char.details.hitDiceSpent - recovered },
      resources: { ...char.resources, used: {}, slotsUsed: [], pactUsed: 0 },
    });
    setDirty(true);
    setMessage(`Descanso longo concluído: PV cheios, ${recovered} dado(s) de vida, espaços de magia e recursos recuperados. Lembre de salvar.`);
  }

  function toggleSkill(s: SkillKey, on: boolean) {
    const next = new Set(d.skills);
    if (on) next.add(s);
    else next.delete(s);
    patchDetails({ skills: [...next] });
  }

  return (
    <div className={embedded ? "px-4 pb-8 pt-2" : "mx-auto max-w-6xl px-4 pb-32 pt-8"}>
      {embedded ? (
        <button className="text-sm font-semibold text-ember hover:underline" onClick={onClose}>
          ← Fechar ficha
        </button>
      ) : (
        <Link href="/fichas" className="text-sm font-semibold text-ember hover:underline">
          ← Todas as fichas
        </Link>
      )}

      {/* ---------- Identidade ---------- */}
      <section id="identidade" className="mt-4 flex scroll-mt-20 flex-col gap-5 sm:flex-row sm:items-center">
        <PortraitUploader
          url={char.avatar_url}
          name={char.name}
          userId={user.id}
          characterId={char.id}
          onChange={saveAvatar}
        />
        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_140px]">
          <div>
            <label htmlFor="nome" className="field-label">
              Nome do personagem
            </label>
            <input
              id="nome"
              className="field font-display text-2xl font-bold"
              value={char.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
            <p className="mt-2 text-sm text-dim">
              <button className="xp-chip" onClick={() => changeTab("progressao")} title="Ver experiência">
                {char.xp.toLocaleString("pt-BR")} XP
              </button>{" "}
              {[sub?.name ?? race?.name, cls ? (char.subclass ? `${cls.name} (${char.subclass})` : cls.name) : null, bg?.name, char.alignment].filter(Boolean).join(" · ") || "Escolha raça, classe e antecedente logo abaixo."}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="nivel" className="field-label mb-0">
                Nível
              </label>
              <Help title="Nível" paragraphs={GLOSSARIO.nivel} />
            </div>
            <select
              id="nivel"
              className="field mt-1"
              value={char.level}
              onChange={(e) => patch({ level: Number(e.target.value) })}
            >
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}º nível
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ---------- Abas ---------- */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div className="sheet-tabs min-w-0 flex-1 overflow-x-auto" role="tablist" aria-label="Partes da ficha">
          {TABS.map((t) => (
            <button key={t.id} role="tab" className="sheet-tab" aria-selected={tab === t.id} onClick={() => changeTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <RestControls
          hitDie={cls?.hitDie}
          level={char.level}
          conMod={mods.con}
          hitDiceSpent={d.hitDiceSpent}
          hp={char.hp_current}
          hpMax={char.hp_max}
          isWarlock={cls?.name === "Bruxo"}
          isWizard={cls?.name === "Mago"}
          onShortRest={shortRest}
          onLongRest={longRest}
        />
      </div>

      {tab === "magias" && (
        <SpellsTab
          spells={char.spells}
          cls={cls}
          subclass={char.subclass ?? ""}
          level={char.level}
          mods={mods}
          prof={prof}
          resources={char.resources}
          onSpells={(spells) => patch({ spells })}
          onResources={(resources) => patch({ resources })}
          onRoll={doRoll}
          onMessage={setMessage}
        />
      )}

      {tab === "recursos" && (
        <ResourcesTab
          defs={resourceDefs}
          resources={char.resources}
          inspiration={d.inspiration}
          onInspiration={(inspiration) => patchDetails({ inspiration })}
          onResources={(resources) => patch({ resources })}
        />
      )}

      {tab === "ferramentas" && (
        <ToolsTab
          toolProfs={char.tool_profs}
          inventory={char.inventory}
          prof={prof}
          className={cls?.name}
          background={bg?.name}
          onToolProfs={(tool_profs) => patch({ tool_profs })}
          onInventory={(inventory) => patch({ inventory })}
        />
      )}

      {tab === "progressao" && (
        <ProgressionTab
          cls={cls}
          level={char.level}
          subclass={char.subclass ?? ""}
          feats={char.feats}
          xp={char.xp}
          onXp={(xp) => patch({ xp })}
          onLevel={(level) => patch({ level })}
          onSubclass={(subclass) => patch({ subclass })}
          onFeats={(feats) => patch({ feats })}
        />
      )}

      {tab === "ficha" && (
      <>
      {/* ---------- Origem ---------- */}
      <section id="origem" className="mt-10 scroll-mt-20">
        <h2 className="font-display text-2xl font-bold">Origem</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {/* Raça */}
          <div className="panel p-4">
            <div className="flex items-center gap-1.5">
              <label htmlFor="raca" className="field-label mb-0">
                Raça
              </label>
              <Help title="Raça" paragraphs={GLOSSARIO.raca} />
            </div>
            <select
              id="raca"
              className="field mt-1"
              value={char.race ?? ""}
              onChange={(e) => {
                const r = findRace(e.target.value);
                patch({ race: e.target.value });
                patchDetails({ subrace: r?.subraces?.[0]?.name ?? "", bonusChoices: [] });
              }}
            >
              <option value="">Escolha uma raça…</option>
              {RACES.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
              {char.race && !race && <option value={char.race}>{char.race} (personalizada)</option>}
            </select>

            {race && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="leading-relaxed">{race.desc}</p>
                <p>
                  <strong>Deslocamento:</strong> {formatMeters(speedFor(race, sub))}
                </p>
                <ul className="list-disc space-y-0.5 pl-5 text-dim">
                  {race.traits.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {race?.subraces && (
              <div className="mt-3 border-t border-rule pt-3">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="subraca" className="field-label mb-0">
                    Sub-raça
                  </label>
                  <Help title="Sub-raça" paragraphs={GLOSSARIO.subraca} />
                </div>
                <select id="subraca" className="field mt-1" value={d.subrace} onChange={(e) => patchDetails({ subrace: e.target.value })}>
                  {race.subraces.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {sub && (
                  <div className="mt-2 text-sm">
                    <p>{sub.desc}</p>
                    <ul className="mt-1 list-disc pl-5 text-dim">
                      {sub.traits.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {race?.chooseBonus && (
              <div className="mt-3 border-t border-rule pt-3">
                <p className="field-label">Seus dois +1 (não pode ser Carisma)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((i) => (
                    <select
                      key={i}
                      className="field"
                      aria-label={`Atributo do ${i + 1}º bônus de +1`}
                      value={d.bonusChoices[i] ?? ""}
                      onChange={(e) => {
                        const next = [...d.bonusChoices];
                        next[i] = e.target.value as AbilityKey;
                        patchDetails({ bonusChoices: next.filter(Boolean).slice(0, 2) as AbilityKey[] });
                      }}
                    >
                      <option value="">Escolha…</option>
                      {ABILITIES.filter((a) => a.key !== "cha" && (a.key === d.bonusChoices[i] || !d.bonusChoices.includes(a.key))).map((a) => (
                        <option key={a.key} value={a.key}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Classe */}
          <div className="panel p-4">
            <div className="flex items-center gap-1.5">
              <label htmlFor="classe" className="field-label mb-0">
                Classe
              </label>
              <Help title="Classe" paragraphs={GLOSSARIO.classe} />
            </div>
            <select id="classe" className="field mt-1" value={char.class ?? ""} onChange={(e) => patch({ class: e.target.value })}>
              <option value="">Escolha uma classe…</option>
              {CLASSES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (d{c.hitDie})
                </option>
              ))}
              {char.class && !cls && <option value={char.class}>{char.class} (personalizada)</option>}
            </select>
            {cls && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="leading-relaxed">{cls.desc}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt className="font-bold">Dado de vida</dt>
                  <dd>d{cls.hitDie}</dd>
                  <dt className="font-bold">Mais importante</dt>
                  <dd>{cls.primary}</dd>
                  <dt className="font-bold">Resistências</dt>
                  <dd>{cls.saves.map((k) => ABILITY_LABEL[k]).join(" e ")}</dd>
                  <dt className="font-bold">Perícias</dt>
                  <dd>
                    escolha {cls.skillCount}
                    {cls.skillOptions === "any"
                      ? " quaisquer"
                      : ` entre ${cls.skillOptions.map((s) => SKILLS.find((x) => x.key === s)!.label).join(", ")}`}
                  </dd>
                </dl>
              </div>
            )}
          </div>

          {/* Antecedente e tendência */}
          <div className="panel p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="antecedente" className="field-label mb-0">
                    Antecedente
                  </label>
                  <Help title="Antecedente" paragraphs={GLOSSARIO.antecedente} />
                </div>
                <select
                  id="antecedente"
                  className="field mt-1 px-2 text-[0.95rem]"
                  value={d.background}
                  onChange={(e) => {
                    const oldBg = findBackground(d.background);
                    const newBg = findBackground(e.target.value);
                    let feats = char.feats;
                    if (oldBg) feats = feats.filter((f) => f !== oldBg.feat);
                    if (newBg && !feats.includes(newBg.feat)) feats = [...feats, newBg.feat];
                    patch({ feats });
                    patchDetails({ background: e.target.value, backgroundAbilityMode: "even", backgroundFocus: { plus2: null, plus1: null } });
                  }}
                >
                  <option value="">Escolha…</option>
                  {BACKGROUNDS.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="tendencia" className="field-label mb-0">
                    Tendência
                  </label>
                  <Help title="Tendência" paragraphs={GLOSSARIO.tendencia}>
                    <ul className="space-y-1.5">
                      {ALIGNMENTS.map((al) => (
                        <li key={al.name}>
                          <strong>{al.name}:</strong> {al.desc}
                        </li>
                      ))}
                    </ul>
                  </Help>
                </div>
                <select id="tendencia" className="field mt-1 px-2 text-[0.95rem]" value={char.alignment ?? ""} onChange={(e) => patch({ alignment: e.target.value })}>
                  <option value="">Escolha…</option>
                  {ALIGNMENTS.map((al) => (
                    <option key={al.name} value={al.name}>
                      {al.name}
                    </option>
                  ))}
                  {char.alignment && !alignment && <option value={char.alignment}>{char.alignment}</option>}
                </select>
              </div>
            </div>
            {bg && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="leading-relaxed">{bg.desc}</p>
                <p>
                  <strong>Perícias treinadas:</strong> {bg.skills.map((s) => SKILLS.find((x) => x.key === s)!.label).join(" e ")}
                </p>
                <p>
                  <strong>Ferramenta:</strong> {bg.tool}
                </p>
                <p className="flex flex-wrap items-center gap-1.5">
                  <strong>Talento de Origem:</strong> {bg.feat}
                  <span className="chip">grátis no 1º nível</span>
                  <Help
                    title="Talento de Origem"
                    paragraphs={[
                      "Regra 2024: todo antecedente já vem com um talento pronto, ganho de graça no 1º nível — sem gastar o Aumento no Valor de Habilidade.",
                      "A ficha adiciona esse talento sozinha à aba Progressão → Talentos quando você escolhe o antecedente, e o troca se você mudar de antecedente depois.",
                    ]}
                  />
                </p>

                <div className="border-t border-rule pt-2">
                  <p className="flex items-center gap-1.5 font-semibold">
                    Bônus de atributo
                    <Help
                      title="Bônus de atributo do antecedente"
                      paragraphs={[
                        "Regra 2024: o bônus de atributo vem do antecedente, não mais da raça. Distribua +1 nos três atributos do antecedente, ou +2 em um deles e +1 em outro.",
                      ]}
                    />
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-3">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="bg-ability-mode"
                        checked={d.backgroundAbilityMode === "even"}
                        onChange={() => patchDetails({ backgroundAbilityMode: "even" })}
                      />
                      +1 nos três ({bg.abilities.map((a) => ABILITY_LABEL[a]).join(", ")})
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="bg-ability-mode"
                        checked={d.backgroundAbilityMode === "focus"}
                        onChange={() => patchDetails({ backgroundAbilityMode: "focus" })}
                      />
                      +2 em um, +1 em outro
                    </label>
                  </div>
                  {d.backgroundAbilityMode === "focus" && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <select
                        className="field px-2 py-1 text-sm"
                        aria-label="Atributo que recebe +2"
                        value={d.backgroundFocus.plus2 ?? ""}
                        onChange={(e) => patchDetails({ backgroundFocus: { ...d.backgroundFocus, plus2: (e.target.value || null) as AbilityKey | null } })}
                      >
                        <option value="">+2 em…</option>
                        {bg.abilities.map((a) => (
                          <option key={a} value={a} disabled={a === d.backgroundFocus.plus1}>
                            {ABILITY_LABEL[a]}
                          </option>
                        ))}
                      </select>
                      <select
                        className="field px-2 py-1 text-sm"
                        aria-label="Atributo que recebe +1"
                        value={d.backgroundFocus.plus1 ?? ""}
                        onChange={(e) => patchDetails({ backgroundFocus: { ...d.backgroundFocus, plus1: (e.target.value || null) as AbilityKey | null } })}
                      >
                        <option value="">+1 em…</option>
                        {bg.abilities.map((a) => (
                          <option key={a} value={a} disabled={a === d.backgroundFocus.plus2}>
                            {ABILITY_LABEL[a]}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
            {alignment && (
              <div className="mt-3 border-t border-rule pt-3 text-sm">
                <p className="flex items-center gap-1.5 font-semibold">
                  {alignment.name}
                  <Help title={alignment.name} paragraphs={[alignment.desc, "Use a tendência como bússola para decidir como seu herói reage às situações. Ela pode mudar com a história."]} />
                </p>
                <p className="leading-relaxed text-dim">{alignment.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Atributos ---------- */}
      <section id="atributos" className="mt-10 scroll-mt-20">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold">Atributos</h2>
          <Help title="Atributos" paragraphs={GLOSSARIO.atributos} />
          <span className="ml-2 flex items-center gap-1.5 text-sm text-dim">
            Modificador (selo) <Help title="Modificador" paragraphs={GLOSSARIO.modificador} />
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              className="btn btn-ghost border border-rule"
              disabled={!cls}
              onClick={() => cls && patch({ abilities: standardArrayFor(cls) })}
              title={cls ? undefined : "Escolha uma classe primeiro"}
            >
              {cls ? `Usar arranjo padrão para ${cls.name}` : "Escolha uma classe para o arranjo padrão"}
            </button>
            <Help title="Arranjo padrão" paragraphs={GLOSSARIO.arranjo} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ABILITIES.map(({ key, label, hint }) => {
            const b = bonus[key] ?? 0;
            return (
              <div key={key} className="panel ability-card flex flex-col items-center px-3 pb-3 pt-3 text-center">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{label}</span>
                  <Help title={label}>
                    <p>{ABILITY_ABOUT[key]}</p>
                    <HelpCalc>
                      Base {char.abilities[key]}
                      {b ? ` + ${b} do antecedente` : ""} = {scores[key]}. Modificador: ({scores[key]} − 10) ÷ 2
                      {scores[key] % 2 !== 0 ? ", arredondando para baixo," : ""} = {formatMod(mods[key])}
                    </HelpCalc>
                  </Help>
                </div>
                <span className="ability-total" aria-label={`Valor total de ${label}: ${scores[key]}`}>
                  {scores[key]}
                </span>
                <button
                  className="mod-seal"
                  onClick={() => doRoll(`Teste de ${label}`, mods[key])}
                  aria-label={`Modificador ${formatMod(mods[key])}. Rolar teste de ${label}`}
                  title="Modificador: toque para rolar um teste"
                >
                  {formatMod(mods[key])}
                </button>
                <div className="mt-2 flex items-center gap-1">
                  <input
                    className="field w-14 px-1 py-1 text-center"
                    type="number"
                    min={3}
                    max={20}
                    value={char.abilities[key]}
                    onChange={(e) =>
                      patch({ abilities: { ...char.abilities, [key]: Math.max(1, Math.min(20, Number(e.target.value) || 1)) } })
                    }
                    aria-label={`Valor base de ${label}`}
                  />
                  {b !== 0 && <span className="chip">+{b} antecedente</span>}
                </div>
                <span className="mt-2 text-xs leading-snug text-dim">{hint}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-dim">
          O número grande é o valor total; o selo embaixo é o modificador (toque para rolar). A caixinha é o valor base, e o bônus do antecedente é somado sozinho.
          <Help title="Valor base e bônus do antecedente" paragraphs={GLOSSARIO.base_racial} />
        </p>
      </section>

      {/* ---------- Combate ---------- */}
      <section id="combate" className="mt-10 scroll-mt-20">
        <h2 className="font-display text-2xl font-bold">Combate</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* PV */}
          <div className="panel p-4 md:row-span-2">
            <div className="flex items-baseline justify-between">
              <span className="flex items-center gap-1.5">
                <span className="field-label mb-0">Pontos de vida</span>
                <Help title="Pontos de vida" paragraphs={GLOSSARIO.pv}>
                  {derived.hpSuggestion !== null && cls && (
                    <HelpCalc>
                      Sugestão: d{cls.hitDie} cheio ({cls.hitDie}) {formatMod(mods.con)} de Constituição
                      {char.level > 1 ? ` + ${char.level - 1} nível(is) × (${Math.floor(cls.hitDie / 2) + 1} ${formatMod(mods.con)})` : ""}
                      {sub?.hpPerLevel ? ` + ${char.level} da Tenacidade anã` : ""}{char.feats.includes("Robusto") ? ` + ${2 * char.level} do talento Robusto` : ""} = {derived.hpSuggestion}
                    </HelpCalc>
                  )}
                </Help>
              </span>
              <span className="font-display text-3xl font-bold">
                {char.hp_current}
                <span className="text-base text-dim"> / {char.hp_max}</span>
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-rule">
              <div className={`h-full ${hpPct <= 25 ? "bg-blood" : "bg-moss"}`} style={{ width: `${hpPct}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className="btn btn-ghost border border-rule" onClick={() => patch({ hp_current: char.hp_current - 1 })}>
                −1 dano
              </button>
              <button
                className="btn btn-ghost border border-rule"
                onClick={() => patch({ hp_current: Math.min(char.hp_max, char.hp_current + 1) })}
              >
                +1 cura
              </button>
              <label className="ml-auto flex items-center gap-2 text-sm text-dim">
                Atual
                <input className="field w-20" type="number" value={char.hp_current} onChange={(e) => patch({ hp_current: Number(e.target.value) || 0 })} />
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
            {derived.hpSuggestion !== null && derived.hpSuggestion !== char.hp_max && (
              <p className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-brass/15 px-3 py-2 text-sm">
                PV máximo sugerido para seu nível: <strong>{derived.hpSuggestion}</strong>
                <button
                  className="font-bold text-ember-deep underline"
                  onClick={() => patch({ hp_max: derived.hpSuggestion!, hp_current: derived.hpSuggestion! })}
                >
                  Usar
                </button>
              </p>
            )}

            <div className="mt-4 border-t border-rule pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="field-label mb-0">Dados de vida</span>
                  <Help title="Dados de vida" paragraphs={GLOSSARIO.dados_vida}>
                    {cls && (
                      <HelpCalc>
                        {cls.name} usa d{cls.hitDie}. No {char.level}º nível você tem {char.level}d{cls.hitDie}; cada um cura 1d{cls.hitDie}{" "}
                        {formatMod(mods.con)} num descanso curto.
                      </HelpCalc>
                    )}
                  </Help>
                </span>
                <span className="font-display text-xl font-bold">
                  {hitDiceLeft}/{char.level}
                  {cls ? ` d${cls.hitDie}` : ""}
                </span>
              </div>
              <p className="mt-2 text-xs text-dim">Gaste e recupere dados de vida com os botões de Descanso curto e Descanso longo, acima das abas.</p>
            </div>
          </div>

          <StatBox label="Classe de armadura" help={<Help title="Classe de armadura" paragraphs={GLOSSARIO.ca}><HelpCalc>{derived.ac.parts.join(" ")} = {derived.ac.total}</HelpCalc></Help>}>
            <span className="font-display text-4xl font-bold">{derived.ac.total}</span>
            <a href="#equipamento" className="text-xs font-semibold text-ember-deep underline">
              calculada pelo equipamento
            </a>
          </StatBox>

          <StatBox label="Iniciativa" help={<Help title="Iniciativa" paragraphs={GLOSSARIO.iniciativa}><HelpCalc>{formatMod(mods.dex)} de Destreza{char.feats.includes("Alerta") ? " +5 do talento Alerta" : ""} = {formatMod(derived.initiative)}</HelpCalc></Help>}>
            <button
              className="text-left font-display text-4xl font-bold text-ember-deep hover:text-ember"
              onClick={() => doRoll("Iniciativa", derived.initiative)}
              aria-label={`Rolar iniciativa (${formatMod(derived.initiative)})`}
            >
              {formatMod(derived.initiative)}
            </button>
            <span className="text-xs text-dim">toque para rolar</span>
          </StatBox>

          <StatBox label="Deslocamento" help={<Help title="Deslocamento" paragraphs={GLOSSARIO.deslocamento}><HelpCalc>{race ? `${sub?.speed ? sub.name : race.name}: ${formatMeters(derived.speed)}` : "Sem raça escolhida: 9 m"}{derived.speedParts.map((p) => ` + ${formatMeters(p.value)} (${p.label})`).join("")}{derived.armorSpeedPenalty ? " − 3 m (armadura pesada sem Força suficiente)" : ""} = {formatMeters(totalSpeed)}, ou {Math.floor(totalSpeed / 1.5)} quadrados no mapa.</HelpCalc></Help>}>
            <span className="font-display text-4xl font-bold">{formatMeters(totalSpeed)}</span>
            <span className="text-xs text-dim">
              {Math.floor(totalSpeed / 1.5)} quadrados
              {derived.armorSpeedPenalty ? " · −3 m pela armadura pesada" : ""}
            </span>
            {overloaded && (
              <a href="#mochila" className="text-xs font-bold text-blood underline">
                Excesso de carga: máx. 1,5 m
              </a>
            )}
          </StatBox>

          <StatBox label="Proficiência" help={<Help title="Bônus de proficiência" paragraphs={GLOSSARIO.proficiencia}><HelpCalc>No {char.level}º nível o seu bônus é {formatMod(prof)}.</HelpCalc></Help>}>
            <span className="font-display text-4xl font-bold">{formatMod(prof)}</span>
          </StatBox>

          <StatBox label="Percepção passiva" help={<Help title="Percepção passiva" paragraphs={GLOSSARIO.percepcao_passiva}><HelpCalc>10 {formatMod(skillBonus("percepcao"))} (seu bônus de Percepção){char.feats.includes("Observador") ? " +5 do talento Observador" : ""} = {derived.passive}</HelpCalc></Help>}>
            <span className="font-display text-4xl font-bold">{derived.passive}</span>
          </StatBox>

          <StatBox label="Inspiração Heroica" help={<Help title="Inspiração" paragraphs={GLOSSARIO.inspiracao} />}>
            <button
              className={`btn w-full ${d.inspiration ? "btn-primary" : "btn-ghost border border-rule"}`}
              aria-pressed={d.inspiration}
              onClick={() => patchDetails({ inspiration: !d.inspiration })}
            >
              {d.inspiration ? "Tenho — rerrolar 1 dado" : "Sem inspiração"}
            </button>
          </StatBox>
        </div>
      </section>

      <EquipmentSection
        equipment={char.equipment}
        mods={mods}
        scores={scores}
        prof={prof}
        cls={cls}
        race={race}
        sub={sub}
        ac={derived.ac}
        onChange={(equipment) => patch({ equipment })}
        onRoll={doRoll}
      />

      {/* ---------- Testes de resistência ---------- */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl font-bold">Testes de resistência</h2>
          <Help title="Testes de resistência" paragraphs={GLOSSARIO.resistencias}>
            {cls && <HelpCalc>Como {cls.name}, você é treinado em {cls.saves.map((k) => ABILITY_LABEL[k]).join(" e ")}: soma {formatMod(prof)} nesses dois.</HelpCalc>}
          </Help>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ABILITIES.map(({ key, label }) => {
            const trained = Boolean(cls?.saves.includes(key));
            const total = mods[key] + (trained ? prof : 0);
            return (
              <button
                key={key}
                className="panel flex items-center gap-2 px-3 py-2 text-left hover:border-brass-deep"
                onClick={() => doRoll(`Resistência de ${label}`, total)}
                title={`${formatMod(mods[key])} de ${label}${trained ? ` ${formatMod(prof)} de proficiência` : ""} = ${formatMod(total)}. Toque para rolar.`}
              >
                <span className={`prof-dot ${trained ? "is-on" : ""}`} aria-hidden />
                <span className="flex-1 text-sm font-semibold">{label}</span>
                <span className="font-display text-xl font-bold text-ember-deep">{formatMod(total)}</span>
                <span className="sr-only">{trained ? "(treinado)" : ""}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- Perícias ---------- */}
      <section id="pericias" className="mt-10 scroll-mt-20">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold">Perícias</h2>
          <Help title="Perícias" paragraphs={GLOSSARIO.pericias} />
          <span className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${chosen.size > allowedChoices ? "bg-blood/10 text-blood" : "bg-brass/20 text-brass-deep"}`}>
            {allowedChoices === 0
              ? "Escolha uma classe para saber quantas perícias marcar"
              : `Escolhidas: ${chosen.size} de ${allowedChoices} (${[
                  cls && `${cls.skillCount} do ${cls.name}`,
                  race?.chooseSkills && `${race.chooseSkills} do ${race.name}`,
                  cls && overlap && `${overlap} por perícia repetida`,
                ]
                  .filter(Boolean)
                  .join(" + ")})`}
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ABILITIES.map(({ key, label }) => {
            const list = SKILLS.filter((s) => s.ability === key);
            return (
              <div key={key} className="panel p-3">
                <h3 className="mb-2 flex items-baseline justify-between font-display text-lg font-bold">
                  {label}
                  <span className="font-sans text-sm font-semibold text-dim">mod. {formatMod(mods[key])}</span>
                </h3>
                {list.length === 0 ? (
                  <p className="flex items-start gap-1.5 text-sm text-dim">
                    Nenhuma perícia usa Constituição.
                    <Help title="E a Constituição?" paragraphs={GLOSSARIO.constituicao_pericias} />
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {list.map((s) => {
                      const from = granted.get(s.key);
                      const suggested = cls && (cls.skillOptions === "any" || cls.skillOptions.includes(s.key));
                      const total = skillBonus(s.key);
                      return (
                        <li key={s.key} className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-rule/30">
                          <span className="prof-check">
                            <input
                              type="checkbox"
                              checked={isProf(s.key)}
                              disabled={Boolean(from)}
                              onChange={(e) => toggleSkill(s.key, e.target.checked)}
                              aria-label={`Proficiente em ${s.label}`}
                            />
                            <span className="prof-dot" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1 text-sm">
                            <span className="font-semibold">{s.label}</span>
                            {suggested && !from && <span className="ml-1 text-brass-deep" title="Sugerida para a sua classe">★</span>}
                            {from && <span className="chip ml-1.5">{from}</span>}
                          </span>
                          <button
                            className="w-10 text-right font-display text-lg font-bold text-ember-deep hover:text-ember"
                            onClick={() => doRoll(s.label, total)}
                            aria-label={`Rolar ${s.label} (${formatMod(total)})`}
                          >
                            {formatMod(total)}
                          </button>
                          <Help title={s.label}>
                            <p>{s.desc}</p>
                            <p>Usa {label}.</p>
                            <HelpCalc>
                              {formatMod(mods[key])} de {label}
                              {isProf(s.key) ? ` ${formatMod(prof)} de proficiência` : " (sem proficiência)"} = {formatMod(total)}
                            </HelpCalc>
                          </Help>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-dim">★ sugerida para a sua classe · as etiquetas mostram perícias que vêm prontas.</p>
      </section>

      <BackpackSection
        inventory={char.inventory}
        coins={char.coins}
        strScore={scores.str}
        equipmentWeights={equipmentWeights(char.equipment)}
        onInventory={(inventory) => patch({ inventory })}
        onCoins={(coins) => patch({ coins })}
      />

      <section className="mt-10">
        <label htmlFor="notas" className="font-display text-2xl font-bold">
          História e anotações
        </label>
        <textarea
          id="notas"
          className="field mt-3 min-h-32 leading-relaxed"
          value={char.notes ?? ""}
          onChange={(e) => patch({ notes: e.target.value })}
          placeholder="De onde seu herói vem? O que ele procura? Anote também idiomas, aliados e segredos."
        />
      </section>

      </>
      )}

      <button className="btn btn-danger mt-6" onClick={remove}>
        Excluir ficha
      </button>

      {/* ---------- Resultado da rolagem ---------- */}
      {roll && (
        <div key={roll.key} className="parchment-card fixed inset-x-4 bottom-20 z-30 mx-auto max-w-sm px-5 py-3 text-center" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-dim">{roll.label}</p>
          <p className={`font-display text-5xl font-bold ${roll.crit === "critico" ? "text-moss" : roll.crit === "falha" ? "text-blood" : "text-ember-deep"}`}>
            {roll.total}
          </p>
          <p className="text-xs text-dim">
            {roll.detail}
            {roll.crit === "critico" && " — 20 natural!"}
            {roll.crit === "falha" && " — 1 natural."}
          </p>
        </div>
      )}

      {/* ---------- Toast: ficha salva ---------- */}
      {savedToast && (
        <div className="save-toast" role="status" aria-live="polite">
          ✅ Ficha salva com sucesso!
        </div>
      )}

      {/* ---------- Barra de salvar ---------- */}
      <div className={embedded ? "sticky bottom-0 z-20 -mx-4 mt-6 border-t-2 border-brass-deep bg-vellum/95" : "fixed inset-x-0 bottom-0 z-20 border-t-2 border-brass-deep bg-vellum/95"}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="text-sm text-dim" role="status">
            {message || (dirty ? "Alterações não salvas." : "Tudo salvo.")}
          </span>
          {embedded && (
            <span className="ml-auto flex gap-2">
              <button className="btn btn-ghost border border-rule" onClick={onClose}>
                Fechar
              </button>
              <button className="btn btn-primary" onClick={save} disabled={!dirty || saving}>
                {saving ? "Salvando…" : "Salvar ficha"}
              </button>
            </span>
          )}
          {!embedded && (
            <button className="btn btn-primary ml-auto" onClick={save} disabled={!dirty || saving}>
              {saving ? "Salvando…" : "Salvar ficha"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, help, children }: { label: string; help: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="panel flex flex-col justify-center gap-1 p-4">
      <span className="flex items-center gap-1.5">
        <span className="field-label mb-0">{label}</span>
        {help}
      </span>
      {children}
    </div>
  );
}


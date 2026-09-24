"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Help, HelpCalc } from "./Help";
import { formatMod, uid } from "@/lib/dnd";
import { GLOSSARIO } from "@/lib/glossario";
import {
  ARMORS,
  ARMOR_CATEGORY_LABEL,
  DAMAGE_HELP,
  FOCI,
  FOCUS_GROUP_LABEL,
  PROP_HELP,
  PROP_LABEL,
  SHIELD,
  WEAPONS,
  WEAPON_GROUPS,
  armorProficient,
  buildAttack,
  findArmor,
  findFocus,
  findWeapon,
  weaponProficient,
  type ArmorDef,
  type Attack,
  type FocusGroup,
  type WeaponDef,
} from "@/lib/equipamento";
import type { ClassDef, RaceDef, SubraceDef } from "@/lib/regras";
import type { Abilities, Equipment } from "@/lib/types";

type Props = {
  equipment: Equipment;
  mods: Abilities;
  scores: Abilities;
  prof: number;
  cls?: ClassDef;
  race?: RaceDef;
  sub?: SubraceDef;
  ac: { total: number; parts: string[] };
  onChange: (eq: Equipment) => void;
  onRoll: (label: string, bonus: number, formula?: string) => void;
};

export function EquipmentSection({ equipment: eq, mods, scores, prof, cls, race, sub, ac, onChange, onRoll }: Props) {
  const [picker, setPicker] = useState<"armor" | "weapon" | "focus" | null>(null);
  const armor = findArmor(eq.armor);
  const focus = findFocus(eq.focus);
  const set = (p: Partial<Equipment>) => onChange({ ...eq, ...p });

  const attacks = useMemo(() => {
    const list: (Attack & { fromFocus?: boolean })[] = eq.weapons
      .map((w) => {
        const def = findWeapon(w.id);
        return def ? buildAttack(w.uid, def, mods, prof, weaponProficient(def, cls, race, sub)) : null;
      })
      .filter(Boolean) as Attack[];
    const staff = focus?.weapon ? findWeapon(focus.weapon) : undefined;
    if (focus && staff)
      list.push({ ...buildAttack(`foco-${focus.id}`, staff, mods, prof, weaponProficient(staff, cls, race, sub), `${focus.name} (como bordão)`), fromFocus: true });
    return list;
  }, [eq.weapons, focus, mods, prof, cls, race, sub]);

  const armorTrained = armor ? armorProficient(armor.category, cls, sub) : true;
  const shieldTrained = armorProficient("escudo", cls, sub);
  const strShort = armor?.strength && scores.str < armor.strength && race?.name !== "Anão";
  const twoHanded = eq.shield && eq.weapons.some((w) => findWeapon(w.id)?.props.includes("duas_maos"));

  return (
    <section id="equipamento" className="mt-10 scroll-mt-20">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl font-bold">Equipamento</h2>
        <Help title="Equipamento" paragraphs={GLOSSARIO.equipamento} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr]">
        {/* CA calculada */}
        <div className="panel flex flex-col gap-2 p-4 lg:row-span-2">
          <span className="flex items-center gap-1.5">
            <span className="field-label mb-0">Classe de armadura</span>
            <Help title="Classe de armadura" paragraphs={GLOSSARIO.ca}>
              <HelpCalc>Sua CA: {ac.parts.join(" ")} = {ac.total}</HelpCalc>
            </Help>
          </span>
          <div className="flex items-center gap-4">
            <span className="ac-shield" aria-label={`Classe de armadura ${ac.total}`}>
              {ac.total}
            </span>
            <p className="text-sm leading-relaxed text-dim">
              {ac.parts.join(" · ")}
              <span className="mt-1 block text-xs">Atualiza sozinha ao trocar armadura, escudo ou Destreza.</span>
            </p>
          </div>
          <label className="mt-1 flex items-center gap-2 text-sm text-dim">
            Bônus extra (itens mágicos, magias)
            <input
              type="number"
              className="field w-16 px-1 py-1 text-center"
              value={eq.acBonus}
              onChange={(e) => set({ acBonus: Number(e.target.value) || 0 })}
            />
          </label>
        </div>

        {/* Armadura */}
        <div className="panel p-4">
          <span className="flex items-center gap-1.5">
            <span className="field-label mb-0">Armadura</span>
            <Help title="Armaduras" paragraphs={GLOSSARIO.armadura} />
          </span>
          <div className="mt-2 flex items-center gap-2">
            {armor ? (
              <Help title={armor.name} label={<span className="text-sm">{armor.name}</span>} className="!text-base">
                <ArmorHelp armor={armor} />
              </Help>
            ) : (
              <span className="font-semibold">Sem armadura</span>
            )}
            {armor && <span className="chip">{{ leve: "leve", media: "média", pesada: "pesada" }[armor.category]}</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {armor?.stealthDisadv && <Help title="Desvantagem em Furtividade" label="Desv. em Furtividade" paragraphs={GLOSSARIO.furtividade} />}
            {armor?.strength && <Help title="Força mínima" label={`Força ${armor.strength}`} paragraphs={GLOSSARIO.forca_minima} />}
          </div>
          {!armorTrained && <p className="mt-2 text-sm font-semibold text-blood">Sua classe não é treinada nessa armadura.</p>}
          {strShort && <p className="mt-2 text-sm font-semibold text-blood">Força abaixo de {armor!.strength}: deslocamento −3 m.</p>}
          <button className="btn btn-ghost mt-3 w-full border border-rule" onClick={() => setPicker("armor")}>
            {armor ? "Trocar armadura" : "Escolher armadura"}
          </button>
        </div>

        {/* Escudo */}
        <div className="panel p-4">
          <span className="flex items-center gap-1.5">
            <span className="field-label mb-0">Escudo</span>
            <Help title="Escudo" paragraphs={GLOSSARIO.escudo}>
              <p>
                {SHIELD.desc} Preço: {SHIELD.price}.
              </p>
            </Help>
          </span>
          <button
            className={`btn mt-2 w-full ${eq.shield ? "btn-primary" : "btn-ghost border border-rule"}`}
            aria-pressed={eq.shield}
            onClick={() => set({ shield: !eq.shield })}
          >
            {eq.shield ? "Usando escudo (+2 CA)" : "Sem escudo"}
          </button>
          {eq.shield && !shieldTrained && <p className="mt-2 text-sm font-semibold text-blood">Sua classe não é treinada com escudo.</p>}
          {twoHanded && <p className="mt-2 text-sm text-ember-deep">Atenção: armas de duas mãos não podem ser usadas junto com o escudo.</p>}
        </div>

        {/* Foco */}
        <div className="panel p-4 md:col-span-2">
          <span className="flex items-center gap-1.5">
            <span className="field-label mb-0">Foco de conjuração ou cajado</span>
            <Help title="Foco de conjuração" paragraphs={GLOSSARIO.foco} />
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {focus ? (
              <>
                <Help title={focus.name} label={<span className="text-sm">{focus.name}</span>}>
                  <p>{focus.desc}</p>
                  <p>Tipo: {FOCUS_GROUP_LABEL[focus.group].label.toLowerCase()} ({FOCUS_GROUP_LABEL[focus.group].who}).</p>
                </Help>
                <span className="text-sm text-dim">{FOCUS_GROUP_LABEL[focus.group].label}</span>
              </>
            ) : (
              <span className="text-sm text-dim">Nenhum. Só conjuradores precisam de um foco.</span>
            )}
            <span className="ml-auto flex gap-2">
              {focus && (
                <button className="btn btn-danger px-2 py-1" onClick={() => set({ focus: null })}>
                  Remover
                </button>
              )}
              <button className="btn btn-ghost border border-rule" onClick={() => setPicker("focus")}>
                {focus ? "Trocar" : "Escolher foco"}
              </button>
            </span>
          </div>
        </div>
      </div>

      {/* Armas e ataques */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <h3 className="font-display text-xl font-bold">Armas e ataques</h3>
        <Help title="Ataques" paragraphs={GLOSSARIO.ataques} />
        <span className="flex items-center gap-1 text-sm text-dim">
          Tipos de arma <Help title="Armas simples e marciais" paragraphs={GLOSSARIO.armas} />
        </span>
        <button className="btn btn-primary ml-auto" onClick={() => setPicker("weapon")}>
          Adicionar arma
        </button>
      </div>

      {attacks.length === 0 ? (
        <p className="parchment-grid mt-3 rounded-lg border border-dashed border-brass-deep p-6 text-center text-dim">
          Nenhuma arma ainda. Toque em “Adicionar arma”: o ataque e o dano aparecem aqui já calculados.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {attacks.map((a) => (
            <AttackRow
              key={a.uid}
              attack={a}
              prof={prof}
              onRoll={onRoll}
              onRemove={a.fromFocus ? undefined : () => set({ weapons: eq.weapons.filter((w) => w.uid !== a.uid) })}
            />
          ))}
        </ul>
      )}

      {/* ---------- Catálogos ---------- */}
      <Picker open={picker === "armor"} title="Escolher armadura" onClose={() => setPicker(null)}>
        <button
          className="picker-row w-full text-left"
          onClick={() => {
            set({ armor: null });
            setPicker(null);
          }}
        >
          <span className="font-semibold">Sem armadura</span>
          <span className="text-sm text-dim">CA 10 + Destreza{cls?.unarmored ? " (+ Defesa sem Armadura)" : ""}</span>
        </button>
        {(["leve", "media", "pesada"] as const).map((cat) => (
          <div key={cat} className="mt-4">
            <p className="picker-group">
              {ARMOR_CATEGORY_LABEL[cat]}
              <span className={armorProficient(cat, cls, sub) ? "text-moss" : "text-blood"}>
                {armorProficient(cat, cls, sub) ? " · você é treinado" : " · sem treino"}
              </span>
            </p>
            {ARMORS.filter((x) => x.category === cat).map((x) => (
              <div key={x.id} className={`picker-row ${eq.armor === x.id ? "is-selected" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">{x.name}</span>
                    <Help title={x.name}>
                      <ArmorHelp armor={x} />
                    </Help>
                  </div>
                  <p className="text-sm text-dim">
                    CA {x.ac}
                    {cat === "leve" ? " + Des" : cat === "media" ? " + Des (máx. 2)" : ""}
                    {x.strength ? ` · Força ${x.strength}` : ""}
                    {x.stealthDisadv ? " · desv. Furtividade" : ""} · {x.price}
                  </p>
                </div>
                <button
                  className="btn btn-primary px-3 py-1.5"
                  onClick={() => {
                    set({ armor: x.id });
                    setPicker(null);
                  }}
                >
                  {eq.armor === x.id ? "Vestindo" : "Vestir"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </Picker>

      <WeaponPicker
        open={picker === "weapon"}
        onClose={() => setPicker(null)}
        isTrained={(w) => weaponProficient(w, cls, race, sub)}
        onAdd={(w) => set({ weapons: [...eq.weapons, { uid: uid(), id: w.id }] })}
      />

      <Picker open={picker === "focus"} title="Escolher foco de conjuração" onClose={() => setPicker(null)}>
        {(Object.keys(FOCUS_GROUP_LABEL) as FocusGroup[]).map((g) => (
          <div key={g} className="mt-4 first:mt-0">
            <p className="picker-group">
              {FOCUS_GROUP_LABEL[g].label} <span className="font-normal text-dim">· {FOCUS_GROUP_LABEL[g].who}</span>
            </p>
            {FOCI.filter((f) => f.group === g).map((f) => (
              <div key={f.id} className={`picker-row ${eq.focus === f.id ? "is-selected" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{f.name}</span>
                    <Help title={f.name} paragraphs={[f.desc]} />
                    {f.weapon && <span className="chip">serve de arma</span>}
                  </div>
                  <p className="text-sm text-dim">
                    {f.desc.split(".")[0]}.{f.price ? ` · ${f.price}` : ""}
                  </p>
                </div>
                <button
                  className="btn btn-primary px-3 py-1.5"
                  onClick={() => {
                    set({ focus: f.id });
                    setPicker(null);
                  }}
                >
                  {eq.focus === f.id ? "Escolhido" : "Escolher"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </Picker>
    </section>
  );
}

// ---------------------------------------------------------------------------

function ArmorHelp({ armor }: { armor: ArmorDef }) {
  const formula =
    armor.category === "leve"
      ? `${armor.ac} + seu modificador de Destreza`
      : armor.category === "media"
        ? `${armor.ac} + Destreza (no máximo +2)`
        : `${armor.ac} fixo (Destreza não conta)`;
  return (
    <>
      <p>{armor.desc}</p>
      <HelpCalc>CA = {formula}</HelpCalc>
      {armor.strength && <p>Pede Força {armor.strength}; com menos, você anda 3 m a menos por turno.</p>}
      {armor.stealthDisadv && <p>Faz barulho: desvantagem em testes de Furtividade.</p>}
      <p className="text-sm opacity-80">Preço: {armor.price}</p>
    </>
  );
}

function PropChips({ weapon }: { weapon: WeaponDef }) {
  return (
    <>
      {weapon.props.map((p) => (
        <Help
          key={p}
          title={PROP_LABEL[p]}
          label={`${PROP_LABEL[p]}${p === "versatil" && weapon.versatile ? ` (${weapon.versatile})` : ""}${(p === "arremesso" || p === "municao") && weapon.range ? ` ${weapon.range} m` : ""}`}
          paragraphs={[PROP_HELP[p], ...(p === "especial" && weapon.special ? [weapon.special] : [])]}
        />
      ))}
    </>
  );
}

function AttackRow({
  attack: a,
  prof,
  onRoll,
  onRemove,
}: {
  attack: Attack;
  prof: number;
  onRoll: Props["onRoll"];
  onRemove?: () => void;
}) {
  const w = a.weapon;
  const abilityName = a.ability === "dex" ? "Destreza" : "Força";
  return (
    <li className="panel flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-[10rem] flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-lg font-bold">{a.label}</span>
          <Help title={w.name}>
            <p>{w.desc}</p>
            <p>
              Arma {w.category === "simples" ? "simples" : "marcial"} {w.kind === "corpo" ? "corpo a corpo" : "à distância"}.
              {w.range ? ` Alcance ${w.range} m.` : ""}
            </p>
            {w.special && <p>{w.special}</p>}
          </Help>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <PropChips weapon={w} />
        </div>
      </div>

      <div className="flex items-center gap-1 text-center">
        <button className="attack-pill" onClick={() => onRoll(`Ataque: ${a.label}`, a.toHit)} aria-label={`Rolar ataque com ${a.label}`}>
          <span className="text-[0.65rem] font-bold uppercase tracking-wide opacity-70">Ataque</span>
          <span className="font-display text-2xl font-bold">{formatMod(a.toHit)}</span>
        </button>
        <Help title="Bônus de ataque">
          <p>Role d20 + esse bônus. Se igualar ou passar a CA do inimigo, você acerta.</p>
          <HelpCalc>
            {formatMod(a.abilityMod)} de {abilityName}
            {a.proficient ? ` ${formatMod(prof)} de proficiência` : " (sem treino nessa arma: não soma proficiência)"} = {formatMod(a.toHit)}
          </HelpCalc>
          {w.props.includes("acuidade") && <p>Arma de acuidade: a ficha usou o maior entre Força e Destreza.</p>}
        </Help>
      </div>

      <div className="flex items-center gap-1 text-center">
        <button
          className="attack-pill"
          disabled={a.damage === "—"}
          onClick={() => onRoll(`Dano: ${a.label}`, 0, a.damage)}
          aria-label={`Rolar dano de ${a.label}`}
        >
          <span className="text-[0.65rem] font-bold uppercase tracking-wide opacity-70">Dano</span>
          <span className="font-display text-xl font-bold">{a.damage}</span>
        </button>
        {a.damageTwoHands && (
          <button className="attack-pill" onClick={() => onRoll(`Dano (duas mãos): ${a.label}`, 0, a.damageTwoHands)} aria-label={`Rolar dano com duas mãos de ${a.label}`}>
            <span className="text-[0.65rem] font-bold uppercase tracking-wide opacity-70">2 mãos</span>
            <span className="font-display text-xl font-bold">{a.damageTwoHands}</span>
          </button>
        )}
        {w.damageType && (
          <Help title={`Dano ${w.damageType}`} label={w.damageType} paragraphs={[DAMAGE_HELP[w.damageType]]}>
            <HelpCalc>
              {w.damage} da arma {formatMod(a.abilityMod)} de {abilityName} = {a.damage}
            </HelpCalc>
          </Help>
        )}
      </div>

      {!a.proficient && <span className="w-full text-xs font-semibold text-blood sm:w-auto">sem treino</span>}
      {onRemove ? (
        <button className="btn btn-danger px-2 py-1" onClick={onRemove}>
          Remover
        </button>
      ) : (
        <span className="text-xs text-dim">vem do foco</span>
      )}
    </li>
  );
}

function WeaponPicker({
  open,
  onClose,
  isTrained,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  isTrained: (w: WeaponDef) => boolean;
  onAdd: (w: WeaponDef) => void;
}) {
  const [query, setQuery] = useState("");
  const [onlyTrained, setOnlyTrained] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const q = query.trim().toLowerCase();

  return (
    <Picker open={open} title="Adicionar arma" onClose={onClose}>
      <div className="sticky top-0 z-10 -mx-5 -mt-1 mb-2 flex flex-wrap items-center gap-2 bg-vellum px-5 pb-2 pt-1">
        <input className="field flex-1" placeholder="Buscar arma…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar arma" />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[#a8431f]" checked={onlyTrained} onChange={(e) => setOnlyTrained(e.target.checked)} />
          Só as que sei usar
        </label>
        {added && (
          <span className="w-full text-sm font-semibold text-moss" role="status">
            {added} adicionada à ficha.
          </span>
        )}
      </div>
      {WEAPON_GROUPS.map((g) => {
        const list = WEAPONS.filter(
          (w) => w.category === g.category && w.kind === g.kind && (!q || w.name.toLowerCase().includes(q)) && (!onlyTrained || isTrained(w)),
        );
        if (list.length === 0) return null;
        return (
          <div key={g.label} className="mt-4 first:mt-0">
            <p className="picker-group">{g.label}</p>
            {list.map((w) => (
              <div key={w.id} className="picker-row">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">{w.name}</span>
                    <Help title={w.name}>
                      <p>{w.desc}</p>
                      {w.special && <p>{w.special}</p>}
                      <p className="text-sm opacity-80">Preço: {w.price}</p>
                    </Help>
                    <span className={`text-xs font-semibold ${isTrained(w) ? "text-moss" : "text-blood"}`}>{isTrained(w) ? "treinado" : "sem treino"}</span>
                  </div>
                  <p className="text-sm text-dim">
                    {w.damage} {w.damageType ?? ""}
                    {w.versatile ? ` (${w.versatile} com duas mãos)` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <PropChips weapon={w} />
                  </div>
                </div>
                <button
                  className="btn btn-primary px-3 py-1.5"
                  onClick={() => {
                    onAdd(w);
                    setAdded(w.name);
                  }}
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </Picker>
  );
}

/** Janela de catálogo em pergaminho */
function Picker({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="help-dialog picker-dialog"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3">
            <h3 className="font-display text-2xl font-bold">{title}</h3>
            <button className="btn btn-ghost border border-rule px-3 py-1" onClick={onClose}>
              Fechar
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-3">{children}</div>
        </div>
      )}
    </dialog>
  );
}

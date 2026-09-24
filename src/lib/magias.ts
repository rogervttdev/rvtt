/**
 * Regras de conjuração do D&D 5e: atributo, espaços de magia por nível e Magia de Pacto.
 */
import type { AbilityKey } from "./types";

export type SpellDef = {
  id: string;
  name: string;
  en: string;
  level: number;
  school: string;
  time: string;
  range: string;
  components: string;
  material?: string;
  duration: string;
  conc: boolean;
  ritual: boolean;
  classes: string[];
  /** Resumo mecânico em português, gerado dos dados (ataque, resistência, dano, cura, área) */
  mech: string;
  /** Texto completo do SRD 5.1 (inglês) */
  desc: string;
  higher?: string;
  /** Explicação curta em português (truques e 1º círculo) */
  summary?: string;
};

export const CIRCLE_LABEL = (l: number) => (l === 0 ? "Truques" : `${l}º círculo`);

export const SCHOOL_HELP: Record<string, string> = {
  Abjuração: "Magias de proteção: escudos, barreiras e anular outras magias.",
  Conjuração: "Magias que criam objetos ou trazem criaturas e coisas de outro lugar.",
  Adivinhação: "Magias de conhecimento: descobrir segredos, ver longe, prever o futuro.",
  Encantamento: "Magias que afetam a mente: enfeitiçar, acalmar, dar ordens.",
  Evocação: "Magias de energia pura: fogo, raio, gelo e também cura.",
  Ilusão: "Magias que enganam os sentidos: imagens, sons e disfarces.",
  Necromancia: "Magias de vida e morte: drenar energia, falar com mortos, animar cadáveres.",
  Transmutação: "Magias que transformam: mudar formas, voar, acelerar.",
};

type CasterKind = "full" | "half" | "third" | "pact";

type Caster = { ability: AbilityKey; kind: CasterKind; prepares: string | null; list: string };

const CASTERS: Record<string, Caster> = {
  Bardo: { ability: "cha", kind: "full", prepares: null, list: "Bardo" },
  Clérigo: { ability: "wis", kind: "full", prepares: "mod. de Sabedoria + nível de clérigo", list: "Clérigo" },
  Druida: { ability: "wis", kind: "full", prepares: "mod. de Sabedoria + nível de druida", list: "Druida" },
  Feiticeiro: { ability: "cha", kind: "full", prepares: null, list: "Feiticeiro" },
  Mago: { ability: "int", kind: "full", prepares: "mod. de Inteligência + nível de mago", list: "Mago" },
  Paladino: { ability: "cha", kind: "half", prepares: "mod. de Carisma + metade do nível de paladino", list: "Paladino" },
  Patrulheiro: { ability: "wis", kind: "half", prepares: null, list: "Patrulheiro" },
  Bruxo: { ability: "cha", kind: "pact", prepares: null, list: "Bruxo" },
};
const SUBCLASS_CASTERS: Record<string, Caster> = {
  "Cavaleiro Arcano": { ability: "int", kind: "third", prepares: null, list: "Mago" },
  "Trapaceiro Arcano": { ability: "int", kind: "third", prepares: null, list: "Mago" },
};

export function casterFor(className?: string | null, subclass?: string | null): Caster | null {
  if (className && CASTERS[className]) return CASTERS[className];
  if (subclass && SUBCLASS_CASTERS[subclass]) return SUBCLASS_CASTERS[subclass];
  return null;
}

/** Espaços por nível de conjurador completo (índice 0 = 1º círculo). */
const FULL: number[][] = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

export type Slots = { slots: number[]; pact: { count: number; level: number } | null };

export function spellSlots(caster: Caster | null, level: number): Slots {
  if (!caster) return { slots: [], pact: null };
  if (caster.kind === "pact") {
    const count = level >= 17 ? 4 : level >= 11 ? 3 : level >= 2 ? 2 : 1;
    const slotLevel = Math.min(5, Math.ceil(level / 2));
    return { slots: [], pact: { count, level: slotLevel } };
  }
  const eff = caster.kind === "full" ? level : caster.kind === "half" ? (level >= 2 ? Math.ceil(level / 2) : 0) : level >= 3 ? Math.ceil(level / 3) : 0;
  return { slots: eff > 0 ? FULL[eff - 1] : [], pact: null };
}

/** Maior círculo de magia que o personagem consegue lançar. */
export function maxCircle(s: Slots) {
  return s.pact ? s.pact.level : s.slots.length;
}

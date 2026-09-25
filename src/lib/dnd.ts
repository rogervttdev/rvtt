import type { Abilities, AbilityKey, Character, RollResult } from "./types";

export const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "Força",
  dex: "Destreza",
  con: "Constituição",
  int: "Inteligência",
  wis: "Sabedoria",
  cha: "Carisma",
};

export const ABILITIES: { key: AbilityKey; label: string; short: string; hint: string }[] = [
  { key: "str", label: "Força", short: "For", hint: "Golpes, carregar peso" },
  { key: "dex", label: "Destreza", short: "Des", hint: "Agilidade, arcos, furtividade" },
  { key: "con", label: "Constituição", short: "Con", hint: "Vigor e pontos de vida" },
  { key: "int", label: "Inteligência", short: "Int", hint: "Estudo, memória, magia arcana" },
  { key: "wis", label: "Sabedoria", short: "Sab", hint: "Percepção e intuição" },
  { key: "cha", label: "Carisma", short: "Car", hint: "Conversa, charme, liderança" },
];

export const DEFAULT_ABILITIES: Abilities = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

export const TOKEN_COLORS = ["#a8431f", "#4c7a36", "#2f5d7c", "#7a4a8c", "#b8862c", "#5a3a24", "#8f2417", "#2a1c12"];

export const modifier = (score: number) => Math.floor((score - 10) / 2);
export const formatMod = (m: number) => (m >= 0 ? `+${m}` : `−${Math.abs(m)}`);
export const proficiency = (level: number) => Math.ceil(Math.max(1, level) / 4) + 1;

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function initials(label: string | null | undefined) {
  const words = (label ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Garante formato válido mesmo se a linha do banco tiver campos nulos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCharacter(row: any): Character {
  return {
    id: row.id,
    user_id: row.user_id ?? row.owner_id,
    name: row.name ?? "Sem nome",
    avatar_url: row.avatar_url ?? null,
    alignment: row.alignment ?? "",
    subclass: row.subclass ?? "",
    xp: Math.max(0, Number(row.xp ?? 0)),
    resources: {
      used: row.resources?.used && typeof row.resources.used === "object" ? row.resources.used : {},
      custom: Array.isArray(row.resources?.custom) ? row.resources.custom : [],
      slotsUsed: Array.isArray(row.resources?.slotsUsed) ? row.resources.slotsUsed : [],
      pactUsed: Number(row.resources?.pactUsed ?? 0),
    },
    tool_profs: Array.isArray(row.tool_profs) ? row.tool_profs : [],
    coins: {
      pc: Number(row.coins?.pc ?? 0),
      pp: Number(row.coins?.pp ?? 0),
      ep: Number(row.coins?.ep ?? 0),
      po: Number(row.coins?.po ?? 0),
      pl: Number(row.coins?.pl ?? 0),
    },
    feats: Array.isArray(row.feats) ? row.feats.filter((f: unknown) => typeof f === "string") : [],
    equipment: {
      armor: row.equipment?.armor ?? null,
      shield: Boolean(row.equipment?.shield),
      weapons: Array.isArray(row.equipment?.weapons) ? row.equipment.weapons : [],
      focus: row.equipment?.focus ?? null,
      acBonus: Number(row.equipment?.acBonus ?? 0),
    },
    race: row.race ?? "",
    class: row.class ?? "",
    level: Number(row.level ?? 1),
    abilities: { ...DEFAULT_ABILITIES, ...(row.abilities ?? {}) },
    hp_current: Number(row.hp_current ?? 0),
    hp_max: Number(row.hp_max ?? 0),
    ac: Number(row.ac ?? 10),
    speed: Number(row.speed ?? 9),
    inventory: Array.isArray(row.inventory) ? row.inventory : [],
    spells: Array.isArray(row.spells) ? row.spells : [],
    notes: row.notes ?? "",
    details: {
      subrace: row.details?.subrace ?? "",
      background: row.details?.background ?? "",
      skills: Array.isArray(row.details?.skills) ? row.details.skills : [],
      bonusChoices: Array.isArray(row.details?.bonusChoices) ? row.details.bonusChoices : [],
      backgroundAbilityMode: row.details?.backgroundAbilityMode === "focus" ? "focus" : "even",
      backgroundFocus: {
        plus2: row.details?.backgroundFocus?.plus2 ?? null,
        plus1: row.details?.backgroundFocus?.plus1 ?? null,
      },
      inspiration: Boolean(row.details?.inspiration),
      hitDiceSpent: Number(row.details?.hitDiceSpent ?? 0),
    },
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
  };
}

// ---------- Dados ----------

function randInt(sides: number) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / sides) * sides;
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return (x % sides) + 1;
}

const DICE_TERM = /^(\d*)d(\d+)(?:(kh|kl)(\d+))?$/;

/**
 * Aceita fórmulas como: 1d20+5, 2d6+1d4-1, d8, 2d20kh1 (vantagem), 2d20kl1 (desvantagem), 4d6kh3.
 * Retorna null se a fórmula for inválida.
 */
export function rollFormula(raw: string): RollResult | null {
  const input = raw.toLowerCase().replace(/\s+/g, "");
  if (!input || !/^[+-]?[0-9dkhl+-]+$/.test(input)) return null;

  const terms = input.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join("") !== input) return null;

  let total = 0;
  let crit: RollResult["crit"] = null;
  let singleD20s = 0;
  const parts: string[] = [];

  for (const [i, term] of terms.entries()) {
    const negative = term.startsWith("-");
    const sign = negative ? -1 : 1;
    const body = term.replace(/^[+-]/, "");
    const joiner = i === 0 ? (negative ? "−" : "") : negative ? " − " : " + ";

    const dice = DICE_TERM.exec(body);
    if (dice) {
      const count = dice[1] ? parseInt(dice[1], 10) : 1;
      const sides = parseInt(dice[2], 10);
      if (count < 1 || count > 100 || sides < 2 || sides > 1000) return null;

      const rolls = Array.from({ length: count }, () => randInt(sides));
      let keptIdx = rolls.map((_, idx) => idx);
      if (dice[3]) {
        const n = parseInt(dice[4], 10);
        if (n < 1 || n > count) return null;
        keptIdx = rolls
          .map((v, idx) => ({ v, idx }))
          .sort((a, b) => (dice[3] === "kh" ? b.v - a.v : a.v - b.v))
          .slice(0, n)
          .map((k) => k.idx);
      }
      const kept = new Set(keptIdx);
      const sum = rolls.reduce((s, v, idx) => (kept.has(idx) ? s + v : s), 0);
      total += sign * sum;

      const keptStr = rolls.filter((_, idx) => kept.has(idx)).join(", ");
      const dropped = rolls.filter((_, idx) => !kept.has(idx));
      parts.push(
        `${joiner}${body} [${keptStr}${dropped.length ? `; descartado: ${dropped.join(", ")}` : ""}]`,
      );

      if (sides === 20 && kept.size === 1) {
        singleD20s++;
        const value = rolls[keptIdx[0]];
        crit = value === 20 ? "critico" : value === 1 ? "falha" : null;
      }
    } else if (/^\d+$/.test(body)) {
      const n = parseInt(body, 10);
      if (n > 100000) return null;
      total += sign * n;
      parts.push(`${joiner}${n}`);
    } else {
      return null;
    }
  }

  if (singleD20s !== 1) crit = null;
  return { formula: input, detail: parts.join(""), total, crit };
}

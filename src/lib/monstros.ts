/**
 * Bestiário do SRD 5.1/5.2, Wizards of the Coast LLC, licença Creative Commons
 * Attribution 4.0 (CC-BY-4.0): https://creativecommons.org/licenses/by/4.0/legalcode
 *
 * O catálogo completo (334 criaturas) mora em `monstros-srd.ts`, gerado a
 * partir do projeto 5e-bits/5e-database. Aqui só ficam os tipos, os ajustes
 * de nome/descrição para as criaturas mais comuns e as funções auxiliares
 * usadas pelo resto do app. Só criaturas de conteúdo aberto (nenhuma "Product
 * Identity" como Observador, Devorador de Mentes, Githyanki etc.).
 */
import { SRD_MONSTERS } from "./monstros-srd";
import type { CreatureSize, TokenAttack, TokenStats } from "./types";

export type SrdMonster = {
  id: string;
  name: string;
  namePt?: string | null;
  size: CreatureSize;
  type: string;
  typePt: string;
  alignment: string;
  ac: number;
  hpFormula: string;
  hpAvg: number;
  speed: number;
  speedNote?: string | null;
  abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  cr: number;
  crLabel: string;
  xp: number;
  attacks: TokenAttack[];
  traits?: string[] | null;
  senses?: string | null;
  languages?: string | null;
  color: string;
};

/** Mantido por compatibilidade com o resto do app: sempre tem uma descrição em português. */
export type MonsterDef = SrdMonster & { desc: string };

export const SIZE_LABEL: Record<CreatureSize, string> = {
  minusculo: "Miniúsculo",
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
  enorme: "Enorme",
  imenso: "Imenso",
};

/** Quantas células de grid a criatura ocupa por lado (regra de tamanho do D&D). */
export const SIZE_CELLS: Record<CreatureSize, number> = {
  minusculo: 1,
  pequeno: 1,
  medio: 1,
  grande: 2,
  enorme: 3,
  imenso: 4,
};

// ---------------------------------------------------------------------------
// Ajustes manuais: ids em português já usados em mesas antigas, e as
// descrições didáticas escritas à mão para as 12 criaturas mais comuns.
// ---------------------------------------------------------------------------

const ID_ALIASES: Record<string, string> = {
  skeleton: "esqueleto",
  zombie: "zumbi",
  wolf: "lobo",
  "brown-bear": "urso-pardo",
  "giant-spider": "aranha-gigante",
  ogre: "ogro",
  bandit: "bandido",
  ghoul: "carniçal",
  "giant-rat": "rato-gigante",
};

const MANUAL: Record<string, { namePt: string; desc: string }> = {
  goblin: { namePt: "Goblin", desc: "Pequeno, covarde e numeroso. Prefere emboscar em grupo e fugir se a luta virar." },
  kobold: { namePt: "Kobold", desc: "Réptil pequeno e covarde, mas perigoso em bando e com armadilhas." },
  esqueleto: { namePt: "Esqueleto", desc: "Ossos animados por magia sombria, sem vontade própria além de obedecer." },
  zumbi: { namePt: "Zumbi", desc: "Lento e sem juízo, mas resistente e implacável. Vem sempre em bando." },
  orc: { namePt: "Orc", desc: "Forte e agressivo, ataca de frente sem muita estratégia." },
  lobo: { namePt: "Lobo", desc: "Caça em bando e tenta derrubar quem se afasta do grupo." },
  "urso-pardo": { namePt: "Urso Pardo", desc: "Grande e forte; ataca duas vezes por turno se provocado." },
  "aranha-gigante": { namePt: "Aranha Gigante", desc: "Tece teias grudentas e ataca de emboscada, envenenando a presa." },
  ogro: { namePt: "Ogro", desc: "Enorme, burro e brutal, mas causa dano muito alto num só golpe." },
  bandido: { namePt: "Bandido", desc: "Assaltante comum, luta por dinheiro e foge se a luta virar contra ele." },
  "carniçal": { namePt: "Carniçal", desc: "Morto-vivo faminto que caça em cemitérios e ruínas, paralisando as vítimas." },
  "rato-gigante": { namePt: "Rato Gigante", desc: "Comum em esgotos e porões, quase inofensivo sozinho, perigoso em bando." },
};

/** As 334 criaturas do SRD, com nomes e ids ajustados e uma descrição sempre presente. */
export const MONSTERS: MonsterDef[] = SRD_MONSTERS.map((m): MonsterDef => {
  const id = ID_ALIASES[m.id] ?? m.id;
  const manual = MANUAL[id];
  return {
    ...m,
    id,
    name: manual?.namePt ?? m.namePt ?? m.name,
    desc:
      manual?.desc ??
      `${m.typePt} de porte ${SIZE_LABEL[m.size].toLowerCase()}, Nível de Desafio ${m.crLabel}${
        m.alignment ? `, tendência ${m.alignment}` : ""
      }.`,
  };
});

export const findMonster = (id?: string) => MONSTERS.find((m) => m.id === id);

/** Cria o objeto de stats (coluna tokens.stats) a partir de um monstro do catálogo. */
export function statsFromMonster(m: MonsterDef): TokenStats {
  return {
    ac: m.ac,
    hp_current: m.hpAvg,
    hp_max: m.hpAvg,
    speed: m.speed,
    size: m.size,
    abilities: m.abilities,
    attacks: m.attacks,
    monsterId: m.id,
  };
}

export const DEFAULT_TOKEN_STATS: TokenStats = { ac: 10, hp_current: 10, hp_max: 10, speed: 9, size: "medio" };

/** Garante que a ficha de combate do token sempre tenha os campos mínimos preenchidos. */
export function normalizeTokenStats(raw: unknown): TokenStats {
  const r = (raw ?? {}) as Partial<TokenStats>;
  return {
    ac: Number(r.ac ?? 10),
    hp_current: Number(r.hp_current ?? r.hp_max ?? 10),
    hp_max: Number(r.hp_max ?? 10),
    speed: Number(r.speed ?? 9),
    size: (r.size as CreatureSize) ?? "medio",
    abilities: r.abilities,
    attacks: r.attacks,
    monsterId: r.monsterId,
    sceneryId: r.sceneryId,
    kind: r.kind,
    icon: r.icon,
    blocks: r.blocks,
  };
}

// ---------------------------------------------------------------------------
// Filtros do Bestiário
// ---------------------------------------------------------------------------

const CR_LABEL_BY_VALUE = new Map(MONSTERS.map((m) => [m.cr, m.crLabel]));

/** Todos os valores de ND presentes no bestiário, em ordem crescente, com o rótulo (ex.: "1/8"). */
export const CR_OPTIONS: { value: number; label: string }[] = [...CR_LABEL_BY_VALUE.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([value, label]) => ({ value, label }));

/** Todos os tipos de criatura presentes, ordenados pelo nome em português. */
export const TYPE_OPTIONS: { value: string; label: string }[] = [...new Map(MONSTERS.map((m) => [m.type, m.typePt])).entries()]
  .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
  .map(([value, label]) => ({ value, label }));

export const SIZE_OPTIONS: { value: CreatureSize; label: string }[] = (
  ["minusculo", "pequeno", "medio", "grande", "enorme", "imenso"] as CreatureSize[]
).map((value) => ({ value, label: SIZE_LABEL[value] }));

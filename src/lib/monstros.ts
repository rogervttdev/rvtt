/**
 * Monstros do SRD 5.1 (System Reference Document), Wizards of the Coast LLC,
 * licença Creative Commons Attribution 4.0 (CC-BY-4.0):
 * https://creativecommons.org/licenses/by/4.0/legalcode
 *
 * Só criaturas de conteúdo aberto (nenhuma "Product Identity" como Observador,
 * Devorador de Mentes, Githyanki etc.). Nomes na tradução oficial brasileira.
 */
import type { CreatureSize, TokenAttack, TokenStats } from "./types";

export type MonsterDef = {
  id: string;
  name: string;
  size: CreatureSize;
  type: string;
  ac: number;
  hpFormula: string;
  hpAvg: number;
  speed: number;
  abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  attacks: TokenAttack[];
  traits?: string[];
  desc: string;
  color: string;
};

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

export const MONSTERS: MonsterDef[] = [
  {
    id: "goblin", name: "Goblin", size: "pequeno", type: "humanoide", ac: 15, hpFormula: "2d6", hpAvg: 7, speed: 9,
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    attacks: [{ name: "Cimitarra", bonus: 4, damage: "1d6+2" }, { name: "Arco curto", bonus: 4, damage: "1d6+2" }],
    traits: ["Fuga ágil: pode Desengajar ou se Esconder como ação bônus"],
    desc: "Pequeno, covarde e numeroso. Prefere emboscar em grupo e fugir se a luta virar.",
    color: "#4c7a36",
  },
  {
    id: "kobold", name: "Kobold", size: "pequeno", type: "réptil", ac: 12, hpFormula: "2d6-2", hpAvg: 5, speed: 9,
    abilities: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
    attacks: [{ name: "Adaga", bonus: 4, damage: "1d4+2" }, { name: "Funda", bonus: 4, damage: "1d4+2" }],
    traits: ["Tática de matilha: vantagem no ataque se um aliado estiver ao lado do alvo", "Sensibilidade à luz do sol: desvantagem em ataques e Percepção sob luz do sol"],
    desc: "Réptil pequeno e covarde, mas perigoso em bando e com armadilhas.",
    color: "#8f2417",
  },
  {
    id: "esqueleto", name: "Esqueleto", size: "medio", type: "morto-vivo", ac: 13, hpFormula: "2d8+4", hpAvg: 13, speed: 9,
    abilities: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    attacks: [{ name: "Espada curta", bonus: 4, damage: "1d6+2" }, { name: "Arco curto", bonus: 4, damage: "1d6+2" }],
    traits: ["Imune a veneno", "Vulnerável a dano de concussão"],
    desc: "Ossos animados por magia sombria, sem vontade própria além de obedecer." ,
    color: "#b8b8a8",
  },
  {
    id: "zumbi", name: "Zumbi", size: "medio", type: "morto-vivo", ac: 8, hpFormula: "3d8+9", hpAvg: 22, speed: 6,
    abilities: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
    attacks: [{ name: "Aperto", bonus: 3, damage: "1d6+1" }],
    traits: ["Fortidão de morto-vivo: ao ir a 0 PV, faz um teste de Constituição para ficar com 1 PV"],
    desc: "Lento e sem juízo, mas resistente e implacável. Vem sempre em bando.",
    color: "#5a6b4a",
  },
  {
    id: "orc", name: "Orc", size: "medio", type: "humanoide", ac: 13, hpFormula: "2d8+3", hpAvg: 15, speed: 9,
    abilities: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    attacks: [{ name: "Machado grande", bonus: 5, damage: "1d12+3" }, { name: "Azagaia", bonus: 5, damage: "1d6+3" }],
    traits: ["Fúria implacável: ao cair a 0 PV, faz um teste de Constituição para ficar com 1 PV"],
    desc: "Forte e agressivo, ataca de frente sem muita estratégia.",
    color: "#5f7a3a",
  },
  {
    id: "lobo", name: "Lobo", size: "medio", type: "fera", ac: 13, hpFormula: "2d8+2", hpAvg: 11, speed: 12,
    abilities: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
    attacks: [{ name: "Mordida", bonus: 4, damage: "2d4+2" }],
    traits: ["Tática de matilha: vantagem se um aliado estiver ao lado do alvo", "Percepção auditiva e olfativa aguçadas"],
    desc: "Caça em bando e tenta derrubar quem se afasta do grupo.",
    color: "#6b6b6b",
  },
  {
    id: "urso-pardo", name: "Urso Pardo", size: "grande", type: "fera", ac: 11, hpFormula: "4d10+12", hpAvg: 34, speed: 12,
    abilities: { str: 19, dex: 10, con: 16, int: 2, wis: 13, cha: 7 },
    attacks: [{ name: "Garra", bonus: 7, damage: "2d6+5" }, { name: "Mordida", bonus: 7, damage: "1d8+5" }],
    desc: "Grande e forte; ataca duas vezes por turno se provocado.",
    color: "#6b4a2a",
  },
  {
    id: "aranha-gigante", name: "Aranha Gigante", size: "grande", type: "monstruosidade", ac: 14, hpFormula: "4d10+4", hpAvg: 26, speed: 9,
    abilities: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
    attacks: [{ name: "Mordida", bonus: 5, damage: "1d8+3" }],
    traits: ["Veneno na mordida (resistência de Constituição ou fica envenenado)", "Escala paredes e teias sem precisar de teste", "Sente vibrações em teias a até 18 m"],
    desc: "Tece teias grudentas e ataca de emboscada, envenenando a presa.",
    color: "#2a1c12",
  },
  {
    id: "ogro", name: "Ogro", size: "grande", type: "gigante", ac: 11, hpFormula: "7d10+21", hpAvg: 59, speed: 12,
    abilities: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
    attacks: [{ name: "Porrete grande", bonus: 6, damage: "2d8+4" }],
    desc: "Enorme, burro e brutal, mas causa dano muito alto num só golpe.",
    color: "#7a6a4a",
  },
  {
    id: "bandido", name: "Bandido", size: "medio", type: "humanoide", ac: 12, hpFormula: "2d8+2", hpAvg: 11, speed: 9,
    abilities: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
    attacks: [{ name: "Cimitarra", bonus: 3, damage: "1d6+1" }, { name: "Besta leve", bonus: 3, damage: "1d8+1" }],
    desc: "Assaltante comum, luta por dinheiro e foge se a luta virar contra ele.",
    color: "#8d6a2c",
  },
  {
    id: "carniçal", name: "Carniçal", size: "medio", type: "morto-vivo", ac: 12, hpFormula: "5d8", hpAvg: 22, speed: 9,
    abilities: { str: 13, dex: 15, con: 10, int: 7, wis: 10, cha: 6 },
    attacks: [{ name: "Garras", bonus: 2, damage: "2d4+2" }, { name: "Mordida", bonus: 2, damage: "2d6+2" }],
    traits: ["Garras paralisam humanoides que falharem na resistência de Constituição (elfos são imunes)"],
    desc: "Morto-vivo faminto que caça em cemitérios e ruínas, paralisando as vítimas.",
    color: "#4a4a3a",
  },
  {
    id: "rato-gigante", name: "Rato Gigante", size: "pequeno", type: "fera", ac: 12, hpFormula: "2d6", hpAvg: 7, speed: 9,
    abilities: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 },
    attacks: [{ name: "Mordida", bonus: 4, damage: "1d4+2" }],
    traits: ["Tática de matilha: vantagem se um aliado estiver ao lado do alvo"],
    desc: "Comum em esgotos e porões, quase inofensivo sozinho, perigoso em bando.",
    color: "#7a6a5a",
  },
];

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

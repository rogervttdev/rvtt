/**
 * Regras do D&D 5ª edição usadas na ficha para iniciantes.
 * Base: SRD 5.1 (2014). Atualizado com as mudanças da revisão 2024 (D&D 5.5) do
 * SRD 5.2 — ambos da Wizards of the Coast LLC, sob licença Creative Commons
 * Attribution 4.0 (CC-BY-4.0): https://creativecommons.org/licenses/by/4.0/legalcode
 *
 * Mudanças de 2024 aplicadas aqui:
 * - Antecedentes (BACKGROUNDS) seguem o novo formato: 3 atributos, 2 perícias,
 *   1 ferramenta e um Talento de Origem — e são agora a única fonte de bônus
 *   de atributo (o bônus de raça de 2014 foi zerado por isso; os demais traços
 *   de raça, como deslocamento e visão no escuro, continuam no padrão 2014).
 * - Nomes seguem a tradução oficial brasileira quando existente.
 */
import type { Abilities, AbilityKey, SkillKey } from "./types";

type Bonus = Partial<Record<AbilityKey, number>>;

// ---------------------------------------------------------------------------
// Perícias
// ---------------------------------------------------------------------------

export const SKILLS: { key: SkillKey; label: string; ability: AbilityKey; desc: string }[] = [
  { key: "atletismo", label: "Atletismo", ability: "str", desc: "Escalar, nadar, saltar longe, agarrar alguém ou empurrar uma porta emperrada." },
  { key: "acrobacia", label: "Acrobacia", ability: "dex", desc: "Manter o equilíbrio numa ponte bamba, dar cambalhotas ou cair de pé." },
  { key: "furtividade", label: "Furtividade", ability: "dex", desc: "Esconder-se e andar sem fazer barulho para não ser notado." },
  { key: "prestidigitacao", label: "Prestidigitação", ability: "dex", desc: "Truques de mão: bater carteiras, esconder um objeto, trocar algo sem ninguém ver." },
  { key: "arcanismo", label: "Arcanismo", ability: "int", desc: "Saber sobre magia, runas, itens mágicos e outros planos de existência." },
  { key: "historia", label: "História", ability: "int", desc: "Lembrar de reinos, guerras antigas, lendas e pessoas famosas." },
  { key: "investigacao", label: "Investigação", ability: "int", desc: "Examinar com calma e deduzir: achar pistas, armadilhas e passagens secretas." },
  { key: "natureza", label: "Natureza", ability: "int", desc: "Conhecer plantas, animais, terrenos e o clima." },
  { key: "religiao", label: "Religião", ability: "int", desc: "Conhecer deuses, rituais, símbolos sagrados e cultos." },
  { key: "adestrar", label: "Adestrar Animais", ability: "wis", desc: "Acalmar um animal assustado, guiar uma montaria ou perceber o que um bicho quer." },
  { key: "intuicao", label: "Intuição", ability: "wis", desc: "Perceber se alguém está mentindo ou qual é a verdadeira intenção de uma pessoa." },
  { key: "medicina", label: "Medicina", ability: "wis", desc: "Estabilizar um aliado caído para ele não morrer e reconhecer doenças." },
  { key: "percepcao", label: "Percepção", ability: "wis", desc: "Notar o que está ao redor com os sentidos: uma emboscada, um som distante, um detalhe estranho. É a perícia mais pedida pelos mestres." },
  { key: "sobrevivencia", label: "Sobrevivência", ability: "wis", desc: "Seguir rastros, caçar, achar o caminho e prever o tempo." },
  { key: "atuacao", label: "Atuação", ability: "cha", desc: "Entreter uma plateia com música, dança, poesia ou teatro." },
  { key: "enganacao", label: "Enganação", ability: "cha", desc: "Mentir de forma convincente, blefar ou se disfarçar." },
  { key: "intimidacao", label: "Intimidação", ability: "cha", desc: "Convencer pelo medo: ameaças, cara feia e presença imponente." },
  { key: "persuasao", label: "Persuasão", ability: "cha", desc: "Convencer com gentileza, diplomacia e bons argumentos." },
];

export const skillByKey = (k: SkillKey) => SKILLS.find((s) => s.key === k)!;

// ---------------------------------------------------------------------------
// Raças
// ---------------------------------------------------------------------------

export type SubraceDef = {
  name: string;
  /** Zerado: em 2024 o bônus de atributo vem do antecedente, não da raça. */
  bonus: Bonus;
  speed?: number;
  hpPerLevel?: number;
  desc: string;
  traits: string[];
};

export type RaceDef = {
  name: string;
  /** Zerado: em 2024 o bônus de atributo vem do antecedente, não da raça. */
  bonus: Bonus;
  /** Deslocamento em metros */
  speed: number;
  skills?: SkillKey[];
  /** Meio-Elfo: quantos atributos diferentes recebem +1 à escolha */
  chooseBonus?: number;
  /** Perícias extras à escolha (Meio-Elfo) */
  chooseSkills?: number;
  desc: string;
  traits: string[];
  subraces?: SubraceDef[];
};

export const RACES: RaceDef[] = [
  {
    name: "Humano",
    bonus: {},
    speed: 9,
    desc: "Versáteis e ambiciosos, os humanos se dão bem em qualquer classe. Boa escolha para o primeiro personagem.",
    traits: ["Fala o Comum e mais um idioma à escolha", "Versátil: aprende uma perícia à escolha"],
  },
  {
    name: "Anão",
    bonus: {},
    speed: 7.5,
    desc: "Robustos, teimosos e resistentes, forjados nas montanhas. Aguentam muito castigo.",
    traits: [
      "Visão no escuro: enxerga no escuro a até 18 m, em tons de cinza",
      "Resiliência anã: vantagem contra veneno e resistência a dano de veneno",
      "Armadura pesada não reduz seu deslocamento",
    ],
    subraces: [
      { name: "Anão da Colina", bonus: {}, hpPerLevel: 1, desc: "Sábio e ainda mais resistente.", traits: ["Tenacidade anã: +1 PV máximo a cada nível"] },
      { name: "Anão da Montanha", bonus: {}, desc: "Forte e acostumado ao combate.", traits: ["Sabe usar armaduras leves e médias"] },
    ],
  },
  {
    name: "Elfo",
    bonus: {},
    speed: 9,
    skills: ["percepcao"],
    desc: "Graciosos, de vida longa e ligados à magia e à natureza.",
    traits: [
      "Visão no escuro (18 m)",
      "Sentidos aguçados: proficiência em Percepção",
      "Ancestral feérico: vantagem contra ser enfeitiçado; magia não o faz dormir",
      "Transe: medita 4 horas em vez de dormir 8",
    ],
    subraces: [
      { name: "Alto Elfo", bonus: {}, desc: "Estudioso e mágico.", traits: ["Conhece um truque de mago", "Um idioma extra"] },
      { name: "Elfo da Floresta", bonus: {}, speed: 10.5, desc: "Rápido e furtivo nas matas.", traits: ["Pés ligeiros: deslocamento de 10,5 m", "Máscara da natureza: se esconde em chuva, neblina ou folhagem"] },
      { name: "Elfo Negro (Drow)", bonus: {}, desc: "Vem das profundezas do subterrâneo.", traits: ["Visão no escuro superior (36 m)", "Sensibilidade à luz do sol", "Magia drow: conhece o truque Globos de Luz"] },
    ],
  },
  {
    name: "Halfling",
    bonus: {},
    speed: 7.5,
    desc: "Pequenos, alegres e surpreendentemente corajosos. A sorte parece estar sempre do lado deles.",
    traits: [
      "Sortudo: se tirar 1 natural no d20 de um ataque, teste ou resistência, rola de novo",
      "Bravura: vantagem contra ficar amedrontado",
      "Agilidade halfling: passa pelo espaço de criaturas maiores",
    ],
    subraces: [
      { name: "Pés Leves", bonus: {}, desc: "Simpático e bom em passar despercebido.", traits: ["Pode se esconder atrás de uma criatura maior"] },
      { name: "Robusto", bonus: {}, desc: "Resistente como um anão.", traits: ["Vantagem contra veneno e resistência a dano de veneno"] },
    ],
  },
  {
    name: "Draconato",
    bonus: {},
    speed: 9,
    desc: "Descendentes de dragões (também chamados de Dracónion). Orgulhosos, altos e imponentes.",
    traits: [
      "Ancestral dracônico: escolha a cor do dragão; ela define o tipo do sopro e da resistência",
      "Arma de sopro: solta fogo, gelo, raio, ácido ou veneno uma vez por descanso",
      "Resistência ao tipo de dano do seu ancestral",
    ],
  },
  {
    name: "Gnomo",
    bonus: {},
    speed: 7.5,
    desc: "Pequenos, curiosos e inventivos, sempre com uma ideia nova.",
    traits: ["Visão no escuro (18 m)", "Esperteza gnômica: vantagem em resistências de Inteligência, Sabedoria e Carisma contra magia"],
    subraces: [
      { name: "Gnomo da Floresta", bonus: {}, desc: "Ilusionista nato e amigo dos bichos.", traits: ["Conhece o truque Ilusão Menor", "Fala com pequenos animais"] },
      { name: "Gnomo das Rochas", bonus: {}, desc: "Engenhoso inventor.", traits: ["Conhecimento de artífice", "Monta pequenas engenhocas"] },
    ],
  },
  {
    name: "Meio-Elfo",
    bonus: {},
    chooseSkills: 2,
    speed: 9,
    desc: "Filhos de dois mundos, carismáticos e adaptáveis. Combinam com quase tudo.",
    traits: [
      "Duas perícias extras à sua escolha",
      "Visão no escuro (18 m)",
      "Ancestral feérico: vantagem contra ser enfeitiçado",
    ],
  },
  {
    name: "Meio-Orc",
    bonus: {},
    speed: 9,
    skills: ["intimidacao"],
    desc: "Fortes e ferozes, com o sangue quente dos orcs. Guerreiros natos.",
    traits: [
      "Visão no escuro (18 m)",
      "Ameaçador: proficiência em Intimidação",
      "Resistência implacável: uma vez por descanso longo, ao cair a 0 PV fica com 1",
      "Ataques selvagens: no acerto crítico corpo a corpo, rola um dado de dano extra",
    ],
  },
  {
    name: "Tiefling",
    bonus: {},
    speed: 9,
    desc: "Marcados por uma herança infernal: chifres, cauda e olhos marcantes. Muitas vezes olhados com desconfiança.",
    traits: ["Visão no escuro (18 m)", "Resistência infernal: resistência a dano de fogo", "Legado infernal: conhece o truque Taumaturgia"],
  },
];

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export type ClassDef = {
  name: string;
  hitDie: number;
  saves: AbilityKey[];
  skillCount: number;
  /** "any" = qualquer perícia */
  skillOptions: SkillKey[] | "any";
  /** Ordem de importância dos atributos, usada no arranjo padrão */
  priority: AbilityKey[];
  primary: string;
  desc: string;
  /** Defesa sem armadura especial */
  unarmored?: AbilityKey;
};

export const CLASSES: ClassDef[] = [
  {
    name: "Bárbaro", hitDie: 12, saves: ["str", "con"], skillCount: 2,
    skillOptions: ["adestrar", "atletismo", "intimidacao", "natureza", "percepcao", "sobrevivencia"],
    priority: ["str", "con", "dex", "wis", "cha", "int"], primary: "Força", unarmored: "con",
    desc: "Guerreiro selvagem que entra em fúria na batalha. Muitos PV e golpes fortes; simples de jogar.",
  },
  {
    name: "Bardo", hitDie: 8, saves: ["dex", "cha"], skillCount: 3, skillOptions: "any",
    priority: ["cha", "dex", "con", "wis", "int", "str"], primary: "Carisma",
    desc: "Artista mágico: inspira os amigos, cura e resolve tudo na conversa. Sabe um pouco de tudo.",
  },
  {
    name: "Bruxo", hitDie: 8, saves: ["wis", "cha"], skillCount: 2,
    skillOptions: ["arcanismo", "enganacao", "historia", "intimidacao", "investigacao", "natureza", "religiao"],
    priority: ["cha", "con", "dex", "wis", "int", "str"], primary: "Carisma",
    desc: "Fez um pacto com um ser poderoso em troca de magia. Poucas magias, mas muito fortes.",
  },
  {
    name: "Clérigo", hitDie: 8, saves: ["wis", "cha"], skillCount: 2,
    skillOptions: ["historia", "intuicao", "medicina", "persuasao", "religiao"],
    priority: ["wis", "con", "str", "dex", "cha", "int"], primary: "Sabedoria",
    desc: "Servo de uma divindade: cura aliados, protege o grupo e enfrenta mortos-vivos.",
  },
  {
    name: "Druida", hitDie: 8, saves: ["int", "wis"], skillCount: 2,
    skillOptions: ["arcanismo", "adestrar", "intuicao", "medicina", "natureza", "percepcao", "religiao", "sobrevivencia"],
    priority: ["wis", "con", "dex", "int", "cha", "str"], primary: "Sabedoria",
    desc: "Guardião da natureza que se transforma em animais e controla plantas e o clima.",
  },
  {
    name: "Feiticeiro", hitDie: 6, saves: ["con", "cha"], skillCount: 2,
    skillOptions: ["arcanismo", "enganacao", "intuicao", "intimidacao", "persuasao", "religiao"],
    priority: ["cha", "con", "dex", "wis", "int", "str"], primary: "Carisma",
    desc: "Nasceu com magia no sangue. Pode moldar os feitiços, mas é frágil de perto.",
  },
  {
    name: "Guerreiro", hitDie: 10, saves: ["str", "con"], skillCount: 2,
    skillOptions: ["acrobacia", "adestrar", "atletismo", "historia", "intuicao", "intimidacao", "percepcao", "sobrevivencia"],
    priority: ["str", "con", "dex", "wis", "cha", "int"], primary: "Força ou Destreza",
    desc: "Mestre das armas e armaduras. A classe mais fácil para começar.",
  },
  {
    name: "Ladino", hitDie: 8, saves: ["dex", "int"], skillCount: 4,
    skillOptions: ["acrobacia", "atletismo", "atuacao", "enganacao", "furtividade", "intimidacao", "intuicao", "investigacao", "percepcao", "persuasao", "prestidigitacao"],
    priority: ["dex", "con", "int", "wis", "cha", "str"], primary: "Destreza",
    desc: "Especialista em furtividade, armadilhas e golpes certeiros pelas costas.",
  },
  {
    name: "Mago", hitDie: 6, saves: ["int", "wis"], skillCount: 2,
    skillOptions: ["arcanismo", "historia", "intuicao", "investigacao", "medicina", "religiao"],
    priority: ["int", "con", "dex", "wis", "cha", "str"], primary: "Inteligência",
    desc: "Estudioso da magia com o maior livro de feitiços. Muito poderoso, mas frágil.",
  },
  {
    name: "Monge", hitDie: 8, saves: ["str", "dex"], skillCount: 2,
    skillOptions: ["acrobacia", "atletismo", "furtividade", "historia", "intuicao", "religiao"],
    priority: ["dex", "wis", "con", "str", "int", "cha"], primary: "Destreza e Sabedoria", unarmored: "wis",
    desc: "Lutador de artes marciais, rápido e sem armadura, que canaliza a energia ki.",
  },
  {
    name: "Paladino", hitDie: 10, saves: ["wis", "cha"], skillCount: 2,
    skillOptions: ["atletismo", "intimidacao", "intuicao", "medicina", "persuasao", "religiao"],
    priority: ["str", "cha", "con", "wis", "dex", "int"], primary: "Força e Carisma",
    desc: "Cavaleiro sagrado ligado a um juramento. Luta bem, protege e cura.",
  },
  {
    name: "Patrulheiro", hitDie: 10, saves: ["str", "dex"], skillCount: 3,
    skillOptions: ["adestrar", "atletismo", "furtividade", "intuicao", "investigacao", "natureza", "percepcao", "sobrevivencia"],
    priority: ["dex", "wis", "con", "str", "int", "cha"], primary: "Destreza e Sabedoria",
    desc: "Caçador e rastreador dos ermos, ótimo com arco e na exploração.",
  },
];

// ---------------------------------------------------------------------------
// Antecedentes (formato 2024: 3 atributos, 2 perícias, 1 ferramenta, 1 Talento de Origem)
// ---------------------------------------------------------------------------

export type BackgroundDef = {
  name: string;
  /** As 3 habilidades entre as quais o jogador distribui +2/+1 ou +1/+1/+1 */
  abilities: AbilityKey[];
  skills: SkillKey[];
  tool: string;
  /** Nome do Talento de Origem concedido automaticamente no 1º nível */
  feat: string;
  desc: string;
};

export const BACKGROUNDS: BackgroundDef[] = [
  { name: "Acólito", abilities: ["int", "wis", "cha"], skills: ["intuicao", "religiao"], tool: "Suprimentos de caligrafia", feat: "Iniciado em Magia (Clérigo)", desc: "Cresceu servindo num templo, entre rituais e orações." },
  { name: "Artesão", abilities: ["str", "dex", "int"], skills: ["investigacao", "persuasao"], tool: "Uma ferramenta de artesão à escolha", feat: "Artesão", desc: "Aprendeu um ofício manual — ferreiro, carpinteiro, alfaiate — antes de virar aventureiro." },
  { name: "Charlatão", abilities: ["dex", "con", "cha"], skills: ["enganacao", "prestidigitacao"], tool: "Kit de falsificação", feat: "Habilidoso", desc: "Sempre teve lábia para enganar os outros e sumir antes de ser pego." },
  { name: "Criminoso", abilities: ["dex", "con", "int"], skills: ["prestidigitacao", "furtividade"], tool: "Ferramentas de ladrão", feat: "Alerta", desc: "Tem um passado no crime e contatos no submundo." },
  { name: "Artista", abilities: ["str", "dex", "cha"], skills: ["acrobacia", "atuacao"], tool: "Kit de disfarce", feat: "Músico", desc: "Vive de se apresentar: música, dança, teatro ou acrobacias." },
  { name: "Fazendeiro", abilities: ["str", "con", "wis"], skills: ["adestrar", "natureza"], tool: "Ferramentas de carpinteiro", feat: "Robusto", desc: "Cresceu trabalhando na terra, cuidando de plantações e animais." },
  { name: "Guarda", abilities: ["str", "int", "wis"], skills: ["atletismo", "percepcao"], tool: "Um jogo à escolha", feat: "Alerta", desc: "Vigiava um portão, um muro ou uma caravana, sempre atento a problemas." },
  { name: "Guia", abilities: ["dex", "con", "wis"], skills: ["furtividade", "sobrevivencia"], tool: "Ferramentas de cartógrafo", feat: "Iniciado em Magia (Druida)", desc: "Conhece os caminhos dos ermos como poucos, e leva viajantes em segurança." },
  { name: "Eremita", abilities: ["con", "wis", "cha"], skills: ["medicina", "religiao"], tool: "Kit de herbalismo", feat: "Curandeiro", desc: "Viveu isolado por muito tempo e descobriu algo importante." },
  { name: "Mercador", abilities: ["con", "int", "cha"], skills: ["adestrar", "persuasao"], tool: "Ferramentas de navegador", feat: "Sortudo", desc: "Viajou por rotas comerciais negociando mercadorias de todo tipo." },
  { name: "Nobre", abilities: ["str", "int", "cha"], skills: ["historia", "persuasao"], tool: "Um jogo à escolha", feat: "Habilidoso", desc: "Nasceu numa família rica e poderosa, com título e privilégios." },
  { name: "Sábio", abilities: ["con", "int", "wis"], skills: ["arcanismo", "historia"], tool: "Suprimentos de caligrafia", feat: "Iniciado em Magia (Mago)", desc: "Passou anos estudando em bibliotecas e academias." },
  { name: "Marinheiro", abilities: ["str", "dex", "wis"], skills: ["acrobacia", "percepcao"], tool: "Ferramentas de navegador", feat: "Brigão de Taverna", desc: "Passou anos em navios, enfrentando tempestades e brigas de porto." },
  { name: "Escriba", abilities: ["dex", "int", "wis"], skills: ["investigacao", "percepcao"], tool: "Suprimentos de caligrafia", feat: "Habilidoso", desc: "Copiava e catalogava textos importantes, com olho fino para detalhes." },
  { name: "Soldado", abilities: ["str", "dex", "con"], skills: ["atletismo", "intimidacao"], tool: "Um jogo à escolha", feat: "Atacante Selvagem", desc: "Serviu num exército ou milícia e conhece a disciplina da guerra." },
  { name: "Forasteiro", abilities: ["dex", "wis", "cha"], skills: ["intuicao", "furtividade"], tool: "Ferramentas de ladrão", feat: "Sortudo", desc: "Cresceu sozinho, longe de casa, e aprendeu a se virar por conta própria." },
];

// ---------------------------------------------------------------------------
// Cálculos
// ---------------------------------------------------------------------------

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const findRace = (name?: string | null) => RACES.find((r) => r.name === name);
export const findClass = (name?: string | null) => CLASSES.find((c) => c.name === name);
export const findBackground = (name?: string | null) => BACKGROUNDS.find((b) => b.name === name);

export function racialBonus(race: RaceDef | undefined, sub: SubraceDef | undefined, choices: AbilityKey[]): Bonus {
  const total: Bonus = {};
  const add = (b?: Bonus) => {
    for (const [k, v] of Object.entries(b ?? {})) total[k as AbilityKey] = (total[k as AbilityKey] ?? 0) + (v ?? 0);
  };
  add(race?.bonus);
  add(sub?.bonus);
  if (race?.chooseBonus) for (const k of choices.slice(0, race.chooseBonus)) add({ [k]: 1 });
  return total;
}

export type BackgroundAbilityMode = "even" | "focus";
export type BackgroundFocus = { plus2: AbilityKey | null; plus1: AbilityKey | null };

/**
 * Bônus de atributo do antecedente (regra 2024): +1 nos três atributos listados,
 * ou +2 em um deles e +1 em outro, à escolha do jogador. "even" é o padrão seguro
 * (não exige nenhuma escolha extra).
 */
export function backgroundBonus(bg: BackgroundDef | undefined, mode: BackgroundAbilityMode, focus: BackgroundFocus): Bonus {
  if (!bg) return {};
  const total: Bonus = {};
  if (mode === "focus" && focus.plus2 && focus.plus1 && focus.plus2 !== focus.plus1 && bg.abilities.includes(focus.plus2) && bg.abilities.includes(focus.plus1)) {
    total[focus.plus2] = 2;
    total[focus.plus1] = 1;
  } else {
    for (const k of bg.abilities) total[k] = 1;
  }
  return total;
}

/** Perícias que vêm automaticamente, com a origem (para mostrar ao jogador). */
export function grantedSkills(race?: RaceDef, background?: BackgroundDef) {
  const map = new Map<SkillKey, string>();
  for (const s of background?.skills ?? []) map.set(s, `antecedente ${background!.name}`);
  for (const s of race?.skills ?? []) if (!map.has(s)) map.set(s, `raça ${race!.name}`);
  return map;
}

export const speedFor = (race?: RaceDef, sub?: SubraceDef) => sub?.speed ?? race?.speed ?? 9;

export const formatMeters = (m: number) => `${m.toLocaleString("pt-BR")} m`;

/** PV máximo pela regra de valor fixo: dado cheio no 1º nível e média nos seguintes. */
export function suggestedHp(cls: ClassDef | undefined, level: number, conMod: number, sub?: SubraceDef) {
  if (!cls) return null;
  const first = cls.hitDie + conMod;
  const perLevel = Math.floor(cls.hitDie / 2) + 1 + conMod;
  const extra = (sub?.hpPerLevel ?? 0) * level;
  return Math.max(1, first) + Math.max(1, perLevel) * (level - 1) + extra;
}

/** CA sem armadura (considera a Defesa sem Armadura do Bárbaro e do Monge). */
export function unarmoredAc(cls: ClassDef | undefined, mods: Abilities) {
  return 10 + mods.dex + (cls?.unarmored ? mods[cls.unarmored] : 0);
}

/** Distribui o arranjo padrão pela ordem de prioridade da classe. */
export function standardArrayFor(cls: ClassDef): Abilities {
  const out = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } as Abilities;
  cls.priority.forEach((k, i) => (out[k] = STANDARD_ARRAY[i]));
  return out;
}

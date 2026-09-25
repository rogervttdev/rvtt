export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type Abilities = Record<AbilityKey, number>;

export type InventoryItem = {
  id: string;
  name: string;
  qty: number;
  /** Peso de UMA unidade, em libras */
  weight?: number;
  /** id do item no catálogo (src/lib/itens.ts), quando veio de lá */
  catalogId?: string;
};
export type Spell = {
  id: string;
  name: string;
  level: number;
  prepared: boolean;
  /** id da magia no SRD (src/lib/magias-srd.ts), quando veio do catálogo */
  srdId?: string;
};

/** Controle de usos: recursos de classe, espaços de magia e recursos personalizados (coluna jsonb `resources`). */
export type Resources = {
  used: Record<string, number>;
  custom: { id: string; name: string; max: number; recharge: "short" | "long" }[];
  /** Espaços gastos por círculo (índice 0 = 1º) */
  slotsUsed: number[];
  pactUsed: number;
};

export type SkillKey =
  | "atletismo"
  | "acrobacia"
  | "furtividade"
  | "prestidigitacao"
  | "arcanismo"
  | "historia"
  | "investigacao"
  | "natureza"
  | "religiao"
  | "adestrar"
  | "intuicao"
  | "medicina"
  | "percepcao"
  | "sobrevivencia"
  | "atuacao"
  | "enganacao"
  | "intimidacao"
  | "persuasao";

/** Equipamento escolhido do catálogo (coluna jsonb `equipment`). */
export type Equipment = {
  armor: string | null;
  shield: boolean;
  weapons: { uid: string; id: string }[];
  focus: string | null;
  /** Ajuste manual na CA (item mágico, magia etc.) */
  acBonus: number;
};

/** Dados extras da ficha, guardados na coluna jsonb `details`. */
export type CharacterDetails = {
  subrace: string;
  background: string;
  /** Perícias escolhidas pelo jogador (as da raça e do antecedente são automáticas). */
  skills: SkillKey[];
  /** Escolhas de +1 do Meio-Elfo. */
  bonusChoices: AbilityKey[];
  /** Como distribuir o bônus de atributo do antecedente (regra 2024): +1/+1/+1 ou +2/+1. */
  backgroundAbilityMode: "even" | "focus";
  backgroundFocus: { plus2: AbilityKey | null; plus1: AbilityKey | null };
  inspiration: boolean;
  hitDiceSpent: number;
};

export type Character = {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  alignment: string | null;
  equipment: Equipment;
  subclass: string | null;
  xp: number;
  resources: Resources;
  /** Ferramentas em que o personagem é proficiente (ids do catálogo) */
  tool_profs: string[];
  coins: { pc: number; pp: number; ep: number; po: number; pl: number };
  /** Nomes dos talentos escolhidos */
  feats: string[];
  race: string | null;
  class: string | null;
  level: number;
  abilities: Abilities;
  hp_current: number;
  hp_max: number;
  ac: number;
  speed: number;
  inventory: InventoryItem[];
  spells: Spell[];
  notes: string | null;
  details: CharacterDetails;
  created_at: string;
  updated_at: string;
};

export type Room = {
  id: string;
  owner_id: string;
  name: string;
  cols: number;
  rows: number;
  background_url: string | null;
  created_at: string;
};

export type CreatureSize = "minusculo" | "pequeno" | "medio" | "grande" | "enorme" | "imenso";

export type TokenAttack = { name: string; bonus: number; damage: string };

/** Estado de combate do token: PV, CA, deslocamento, atributos e ataques — mostrado no tooltip. */
export type TokenStats = {
  ac: number;
  hp_current: number;
  hp_max: number;
  speed: number;
  size: CreatureSize;
  abilities?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  attacks?: TokenAttack[];
  /** id do monstro no catálogo (src/lib/monstros.ts), quando veio de lá */
  monsterId?: string;
};

export type Token = {
  id: string;
  room_id: string;
  owner_id: string;
  character_id: string | null;
  label: string;
  color: string;
  x: number;
  y: number;
  stats: TokenStats;
  created_at?: string;
};

export type RollResult = {
  formula: string;
  detail: string;
  total: number;
  crit: "critico" | "falha" | null;
};

export type RollEntry = RollResult & {
  id: string;
  author: string;
  authorId: string;
  at: number;
};

export type PresenceUser = { user_id: string; name: string };

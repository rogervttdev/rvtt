export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type Abilities = Record<AbilityKey, number>;

export type InventoryItem = { id: string; name: string; qty: number };
export type Spell = { id: string; name: string; level: number; prepared: boolean };

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

/** Dados extras da ficha, guardados na coluna jsonb `details`. */
export type CharacterDetails = {
  subrace: string;
  background: string;
  /** Perícias escolhidas pelo jogador (as da raça e do antecedente são automáticas). */
  skills: SkillKey[];
  /** Escolhas de +1 do Meio-Elfo. */
  bonusChoices: AbilityKey[];
  inspiration: boolean;
  hitDiceSpent: number;
};

export type Character = {
  id: string;
  user_id: string;
  name: string;
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

export type Token = {
  id: string;
  room_id: string;
  owner_id: string;
  character_id: string | null;
  label: string;
  color: string;
  x: number;
  y: number;
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

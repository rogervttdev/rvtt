/**
 * Terrenos e objetos de cenário: peças sem ficha de combate, só para montar o mapa
 * (paredes, mobília, natureza, perigos). Ícones em emoji — sem depender de imagens.
 */
import type { CreatureSize } from "./types";

export type SceneryCategory = "estruturas" | "fogo" | "natureza" | "mobilia" | "perigos";

export const SCENERY_CATEGORY_LABEL: Record<SceneryCategory, string> = {
  estruturas: "Paredes e estruturas",
  fogo: "Fogo e luz",
  natureza: "Natureza",
  mobilia: "Mobília",
  perigos: "Perigos e armadilhas",
};

export type SceneryDef = {
  id: string;
  name: string;
  category: SceneryCategory;
  icon: string;
  color: string;
  size: CreatureSize;
  /** Impede passagem (parede, árvore grossa…) — só informativo por enquanto */
  blocks: boolean;
  desc: string;
};

export const SCENERY: SceneryDef[] = [
  // Paredes e estruturas
  { id: "parede", name: "Parede", category: "estruturas", icon: "🧱", color: "#8d7a63", size: "medio", blocks: true, desc: "Segmento de parede de pedra ou madeira. Bloqueia passagem e visão." },
  { id: "muro-pedra", name: "Muro de Pedra", category: "estruturas", icon: "🪨", color: "#7a7266", size: "medio", blocks: true, desc: "Muro baixo de pedras empilhadas. Dá cobertura parcial." },
  { id: "cerca-madeira", name: "Cerca de Madeira", category: "estruturas", icon: "🚧", color: "#8a5a33", size: "medio", blocks: false, desc: "Cerca simples de estacas. Não bloqueia flechas, só o passo." },
  { id: "porta", name: "Porta", category: "estruturas", icon: "🚪", color: "#6b4428", size: "medio", blocks: true, desc: "Porta de madeira. Pode estar trancada." },
  { id: "estante", name: "Estante", category: "estruturas", icon: "📚", color: "#7a5a3a", size: "medio", blocks: true, desc: "Estante cheia de livros ou potes. Dá cobertura." },
  // Fogo e luz
  { id: "fogueira", name: "Fogueira", category: "fogo", icon: "🔥", color: "#c65a2a", size: "medio", blocks: false, desc: "Fogueira de acampamento. Ilumina a área ao redor." },
  { id: "tocha", name: "Tocha", category: "fogo", icon: "🔦", color: "#c99a4a", size: "pequeno", blocks: false, desc: "Tocha presa na parede ou fincada no chão." },
  { id: "lareira", name: "Lareira", category: "fogo", icon: "🏮", color: "#7a3a1a", size: "medio", blocks: true, desc: "Lareira de pedra, comum em salões e tavernas." },
  // Natureza
  { id: "arvore", name: "Árvore", category: "natureza", icon: "🌳", color: "#3f6b2a", size: "medio", blocks: true, desc: "Árvore grande. Dá cobertura e bloqueia a passagem." },
  { id: "arbusto", name: "Arbusto", category: "natureza", icon: "🌿", color: "#4c7a36", size: "pequeno", blocks: false, desc: "Moita baixa. Dá cobertura parcial e esconde quem se abaixa." },
  { id: "rocha", name: "Rocha", category: "natureza", icon: "🪨", color: "#6b6b60", size: "pequeno", blocks: true, desc: "Pedregulho isolado no caminho." },
  { id: "montanha", name: "Montanha", category: "natureza", icon: "⛰️", color: "#5a5248", size: "grande", blocks: true, desc: "Elevação rochosa grande, intransponível a pé sem escalada." },
  { id: "desfiladeiro", name: "Desfiladeiro", category: "natureza", icon: "🕳️", color: "#2a1c12", size: "grande", blocks: true, desc: "Fenda funda no terreno. Cair aqui machuca — ou pior." },
  // Mobília
  { id: "mesa", name: "Mesa", category: "mobilia", icon: "🍽️", color: "#8a5a33", size: "medio", blocks: false, desc: "Mesa de madeira. Dá cobertura parcial a quem se agachar atrás." },
  { id: "cadeira", name: "Cadeira", category: "mobilia", icon: "🪑", color: "#7a5a3a", size: "pequeno", blocks: false, desc: "Cadeira simples de madeira." },
  { id: "bau", name: "Baú", category: "mobilia", icon: "🧰", color: "#6b4a2a", size: "pequeno", blocks: false, desc: "Baú de madeira com fecho. Pode guardar tesouro." },
  { id: "cama", name: "Cama", category: "mobilia", icon: "🛏️", color: "#8a6a4a", size: "medio", blocks: false, desc: "Cama simples, num quarto ou alojamento." },
  // Perigos
  { id: "poco-agua", name: "Poço de Água", category: "perigos", icon: "💧", color: "#2e6f7a", size: "medio", blocks: false, desc: "Poço ou fonte de água parada. Pode esconder algo no fundo." },
  { id: "lama", name: "Lama", category: "perigos", icon: "🟫", color: "#5a4530", size: "medio", blocks: false, desc: "Terreno difícil: atola quem tenta correr por ali." },
  { id: "armadilha", name: "Armadilha", category: "perigos", icon: "⚠️", color: "#a8321f", size: "pequeno", blocks: false, desc: "Armadilha escondida (o mestre decide o efeito ao ser acionada)." },
];

export const findScenery = (id?: string) => SCENERY.find((s) => s.id === id);

import type { TokenStats } from "./types";

/** Cria os stats (coluna tokens.stats) de um item de cenário: sem PV/CA relevantes, só aparência. */
export function statsFromScenery(item: SceneryDef): TokenStats {
  return {
    ac: 10,
    hp_current: 1,
    hp_max: 1,
    speed: 0,
    size: item.size,
    sceneryId: item.id,
    kind: "cenario",
    icon: item.icon,
    blocks: item.blocks,
  };
}

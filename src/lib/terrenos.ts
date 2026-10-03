export type Terrain = "madeira" | "pedra" | "grama" | "deserto";

export type TerrainDef = {
  id: Terrain;
  name: string;
  icon: string;
  /** Cor de fundo do tabuleiro (2D) e do chão (3D). */
  floor: string;
  /** Cor das linhas de grade. */
  grid: string;
};

export const TERRAINS: TerrainDef[] = [
  { id: "madeira", name: "Madeira", icon: "🪵", floor: "#e8d4a0", grid: "rgb(90 58 36 / 0.32)" },
  { id: "pedra", name: "Pedra", icon: "🪨", floor: "#9a9aa0", grid: "rgb(50 50 56 / 0.35)" },
  { id: "grama", name: "Grama", icon: "🌿", floor: "#8fae5c", grid: "rgb(40 60 22 / 0.35)" },
  { id: "deserto", name: "Deserto", icon: "🏜️", floor: "#e0c589", grid: "rgb(120 90 40 / 0.35)" },
];

export const findTerrain = (id?: string) => TERRAINS.find((t) => t.id === id) ?? TERRAINS[0];

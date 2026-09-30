/**
 * Efeitos ativos de classe: estados que o jogador liga/desliga em combate
 * (por enquanto, a Fúria do Bárbaro). Ficam salvos tanto na ficha
 * (`characters.details.activeEffects`) quanto no token da mesa
 * (`tokens.stats.active_effects`), para o badge aparecer no mapa em tempo real.
 */
import type { TokenAttack } from "./types";

export type ActiveEffectId = "rage";

export const ACTIVE_EFFECT_LABEL: Record<ActiveEffectId, string> = { rage: "Fúria" };
export const ACTIVE_EFFECT_BADGE: Record<ActiveEffectId, string> = { rage: "🔥 Em fúria" };

/** +2 (1º–8º nível), +3 (9º–15º) ou +4 (16º+) de dano em ataques corpo a corpo com Força. */
export function rageDamageBonus(level: number) {
  return level >= 16 ? 4 : level >= 9 ? 3 : 2;
}

/** Quantas vezes o Bárbaro pode entrar em fúria por descanso longo, conforme o nível. */
export function rageUsesMax(level: number) {
  return level >= 20 ? 99 : level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2;
}

/** Formata "1d8+3" (ou similar) somando o bônus de fúria, quando o ataque não é à distância. */
export function damageWithRage(attack: Pick<TokenAttack, "damage" | "ranged">, raging: boolean, level: number) {
  if (!raging || attack.damage === "—" || attack.ranged) return attack.damage;
  return `${attack.damage}+${rageDamageBonus(level)}`;
}

export const RAGING_CLASSES = ["Bárbaro"];

/**
 * Liga/desliga a Fúria a partir dos stats de um token: ligar gasta um uso (se houver);
 * desligar não devolve o uso. Devolve só as chaves que mudaram, prontas para
 * `updateTokenStats`, ou `null` se não houver mais usos disponíveis.
 */
export function toggleRageStats(stats: { active_effects?: string[]; level?: number; furiaUsed?: number }) {
  const raging = stats.active_effects?.includes("rage") ?? false;
  if (raging) {
    return { active_effects: (stats.active_effects ?? []).filter((e) => e !== "rage") };
  }
  const max = rageUsesMax(stats.level ?? 1);
  const used = stats.furiaUsed ?? 0;
  if (used >= max) return null;
  return { active_effects: [...(stats.active_effects ?? []), "rage"], furiaUsed: used + 1 };
}

/**
 * Traduz uma ficha de personagem completa (Character) nos números de combate
 * prontos para um token no mapa: CA, atributos, proficiência e a lista de
 * ataques com bônus e dano já calculados. Reaproveita exatamente as mesmas
 * regras usadas na ficha (src/lib/regras.ts e src/lib/equipamento.ts), então
 * o token na mesa sempre reflete a ficha de verdade — sem duplicar lógica.
 */
import { DEFAULT_ABILITIES, modifier, proficiency } from "./dnd";
import { computeAc, buildAttack, resolveEquippedWeapon, weaponProficient } from "./equipamento";
import { backgroundBonus, findBackground, findClass, findRace, racialBonus } from "./regras";
import type { Abilities, AbilityKey, Character, TokenAttack } from "./types";

export type CharacterCombat = {
  ac: number;
  mods: Abilities;
  prof: number;
  attacks: TokenAttack[];
  classKey: string | null;
  level: number;
};

export function characterCombat(char: Character): CharacterCombat {
  const race = findRace(char.race);
  const sub = race?.subraces?.find((s) => s.name === char.details.subrace);
  const cls = findClass(char.class);
  const bg = findBackground(char.details.background);

  const bonus = { ...racialBonus(race, sub, char.details.bonusChoices) };
  const bgBonus = backgroundBonus(bg, char.details.backgroundAbilityMode, char.details.backgroundFocus);
  for (const [k, v] of Object.entries(bgBonus)) bonus[k as AbilityKey] = (bonus[k as AbilityKey] ?? 0) + (v ?? 0);

  const mods = {} as Abilities;
  (Object.keys(DEFAULT_ABILITIES) as AbilityKey[]).forEach((k) => {
    const score = char.abilities[k] + (bonus[k] ?? 0);
    mods[k] = modifier(score);
  });

  const prof = proficiency(char.level);
  const ac = computeAc(char.equipment, cls, mods).total;

  const attacks: TokenAttack[] = char.equipment.weapons
    .map((w) => {
      const def = resolveEquippedWeapon(w);
      if (!def) return null;
      const a = buildAttack(w.uid, def, mods, prof, weaponProficient(def, cls, race, sub));
      const attack: TokenAttack = { name: a.label, bonus: a.toHit, damage: a.damage, ranged: def.kind === "distancia" };
      if (def.damageType) attack.type = def.damageType;
      return attack;
    })
    .filter((a): a is TokenAttack => a !== null);

  return { ac, mods, prof, attacks, classKey: char.class || null, level: char.level };
}

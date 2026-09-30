"use client";

import { useEffect, useRef, useState } from "react";
import Dice3D from "react-3d-dice";
import type { RollEntry } from "@/lib/types";

type Phase = "rolling" | "result";

const ROLL_MS = 1000;
const HOLD_MS = 2200;
const COLOR_NORMAL = 0xa8431f; // ember, a cor de destaque do app
const COLOR_CRIT = 0x4c7a36; // verde (musgo) para 20 natural
const COLOR_FAIL = 0x8f2417; // vermelho (sangue) para 1 natural

/**
 * Overlay que aparece por cima da mesa quando alguém rola dados: um dado 3D de
 * verdade (Three.js) gira no ar e cai mostrando exatamente o resultado que a
 * mesa já calculou, antes de ir para o histórico. Feito com a react-3d-dice.
 */
export function DiceOverlay({ roll, onDone }: { roll: RollEntry | null; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("rolling");
  const triggerRef = useRef(0);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!roll) return;
    setPhase("rolling");
    triggerRef.current += 1;
    setTrigger(triggerRef.current);
    const revealTimer = setTimeout(() => setPhase("result"), ROLL_MS);
    const doneTimer = setTimeout(onDone, ROLL_MS + HOLD_MS);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll?.id]);

  if (!roll) return null;

  const groups = groupDice(roll);
  const rolling = phase === "rolling";
  const color = !rolling && roll.crit === "critico" ? COLOR_CRIT : !rolling && roll.crit === "falha" ? COLOR_FAIL : COLOR_NORMAL;

  return (
    <div className="dice-overlay" role="status" aria-live="assertive">
      <div className={`dice-overlay-3d ${groups.length > 1 ? "is-multi" : ""}`}>
        {groups.map((g, i) => (
          <div key={i} className="dice-overlay-die-box">
            <Dice3D sides={g.sides} color={color} results={g.values} isRolling={rolling} rollTrigger={trigger} height={180} />
          </div>
        ))}
      </div>
      {!rolling && <p className={`dice-overlay-total ${roll.crit === "critico" ? "is-crit" : roll.crit === "falha" ? "is-fail" : ""}`}>{roll.total}</p>}
      <p className="dice-overlay-author">{roll.label ?? roll.author}</p>
      {!rolling && (
        <>
          <p className="dice-overlay-detail">
            {roll.label && `${roll.author} · `}
            {roll.detail}
          </p>
          {roll.crit === "critico" && <p className="dice-overlay-tag is-crit">20 natural!</p>}
          {roll.crit === "falha" && <p className="dice-overlay-tag is-fail">1 natural…</p>}
        </>
      )}
    </div>
  );
}

/** Agrupa os dados físicos da rolagem por número de lados (um <Dice3D> por grupo). */
function groupDice(roll: RollEntry): { sides: number; values: number[] }[] {
  if (roll.dice && roll.dice.length > 0) {
    const bySides = new Map<number, number[]>();
    for (const d of roll.dice) bySides.set(d.sides, [...(bySides.get(d.sides) ?? []), d.value]);
    return [...bySides.entries()].map(([sides, values]) => ({ sides, values }));
  }
  // Reserva, para rolagens antigas sem o detalhamento por dado.
  const matches = [...roll.formula.matchAll(/d(\d+)/g)].map((m) => Number(m[1]));
  const sides = matches.length ? Math.max(...matches) : 20;
  return [{ sides, values: [roll.total] }];
}

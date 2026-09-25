"use client";

import { useEffect, useMemo, useState } from "react";
import type { RollEntry } from "@/lib/types";

type Phase = "rolling" | "result";

/**
 * Overlay que aparece por cima da mesa quando alguém rola dados: mostra o dado
 * "girando" (números aleatórios piscando, como um caça-níquel) por um instante
 * e depois revela o resultado final em destaque, antes de ir para o histórico.
 */
export function DiceOverlay({ roll, onDone }: { roll: RollEntry | null; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("rolling");
  const [flicker, setFlicker] = useState(0);

  // O maior dado citado na fórmula decide o ícone e o teto do "embaralhamento"
  const die = useMemo(() => {
    if (!roll) return 20;
    const dice = [...roll.formula.matchAll(/d(\d+)/g)].map((m) => Number(m[1]));
    return dice.length ? Math.max(...dice) : 20;
  }, [roll]);

  useEffect(() => {
    if (!roll) return;
    setPhase("rolling");
    const flickerTimer = setInterval(() => setFlicker((f) => f + 1), 70);
    const revealTimer = setTimeout(() => setPhase("result"), 900);
    const doneTimer = setTimeout(onDone, 900 + 1500);
    return () => {
      clearInterval(flickerTimer);
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll?.id]);

  if (!roll) return null;
  const shown = phase === "rolling" ? 1 + (flicker % die) : roll.total;
  const critClass = roll.crit === "critico" ? "is-crit" : roll.crit === "falha" ? "is-fail" : "";

  return (
    <div className="dice-overlay" role="status" aria-live="assertive">
      <div className={`dice-overlay-die ${phase === "rolling" ? "is-spinning" : "is-settled"} ${critClass}`}>
        <DieShape sides={die} />
        <span className="dice-overlay-number">{shown}</span>
      </div>
      <p className="dice-overlay-author">{roll.author}</p>
      {phase === "result" && (
        <>
          <p className="dice-overlay-detail">{roll.detail}</p>
          {roll.crit === "critico" && <p className="dice-overlay-tag is-crit">20 natural!</p>}
          {roll.crit === "falha" && <p className="dice-overlay-tag is-fail">1 natural…</p>}
        </>
      )}
    </div>
  );
}

/** Silhueta simples do dado (losango para a maioria, hexágono para o d20) em CSS puro. */
function DieShape({ sides }: { sides: number }) {
  const shape = sides >= 20 ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : sides >= 8 ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : "polygon(50% 0%, 100% 100%, 0% 100%)";
  return <span className="dice-overlay-shape" style={{ clipPath: shape }} aria-hidden />;
}

"use client";

import { useState } from "react";
import { rollFormula } from "@/lib/dnd";
import type { RollResult } from "@/lib/types";

const QUICK = [4, 6, 8, 10, 12, 20, 100];

export function DiceRoller({ onRoll }: { onRoll: (r: RollResult) => void }) {
  const [formula, setFormula] = useState("1d20");
  const [error, setError] = useState("");

  function roll(f: string) {
    const r = rollFormula(f);
    if (!r) {
      setError("Fórmula inválida. Exemplos: 1d20+5, 2d6+3, 2d20kh1.");
      return;
    }
    setError("");
    onRoll(r);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {QUICK.map((s) => (
          <button key={s} className="die-btn" onClick={() => roll(`1d${s}`)} aria-label={`Rolar 1d${s}`}>
            d{s}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <button className="btn btn-ghost border border-module-soft" onClick={() => roll("2d20kh1")}>
          Vantagem
        </button>
        <button className="btn btn-ghost border border-module-soft" onClick={() => roll("2d20kl1")}>
          Desvantagem
        </button>
      </div>
      <form
        className="flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          roll(formula);
        }}
      >
        <input
          className="field font-semibold"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          aria-label="Fórmula de dados"
          placeholder="1d20+5"
        />
        <button className="btn btn-primary">Rolar</button>
      </form>
      {error && <p className="text-xs text-blood" role="alert">{error}</p>}
    </div>
  );
}

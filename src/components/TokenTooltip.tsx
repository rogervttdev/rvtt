"use client";

import { SIZE_LABEL } from "@/lib/monstros";
import type { Token } from "@/lib/types";

/**
 * Card flutuante mostrado ao passar o mouse (ou tocar) num token: nome, CA, PV, deslocamento e ações.
 * `x`/`y` são a posição em pixels na tela (viewport), já calculada por quem chama.
 */
export function TokenTooltip({ token, x, y }: { token: Token; x: number; y: number }) {
  const s = token.stats;
  const hpPct = s.hp_max > 0 ? Math.max(0, Math.min(100, (s.hp_current / s.hp_max) * 100)) : 0;

  return (
    <div
      className="token-tooltip"
      style={{ left: x, top: y }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: token.color }} aria-hidden />
        <p className="min-w-0 truncate font-display text-lg font-bold">{token.label}</p>
        {s.size && s.size !== "medio" && <span className="chip shrink-0">{SIZE_LABEL[s.size]}</span>}
      </div>

      <div className="mt-1.5 flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1" title="Classe de Armadura">
          <span className="token-tooltip-ac">{s.ac}</span> CA
        </span>
        <span className="flex-1">
          <span className="font-semibold">{s.hp_current}</span>
          <span className="text-foam/70"> / {s.hp_max} PV</span>
          <span className="token-tooltip-hpbar">
            <span className={`token-tooltip-hpfill ${hpPct <= 25 ? "is-low" : ""}`} style={{ width: `${hpPct}%` }} />
          </span>
        </span>
        <span title="Deslocamento">{s.speed} m</span>
      </div>

      {s.attacks && s.attacks.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 border-t border-brass-deep/40 pt-1.5 text-xs">
          {s.attacks.slice(0, 3).map((a) => (
            <li key={a.name} className="flex justify-between gap-2">
              <span className="truncate">{a.name}</span>
              <span className="shrink-0 text-brass-light">
                {a.bonus >= 0 ? "+" : ""}
                {a.bonus} · {a.damage}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

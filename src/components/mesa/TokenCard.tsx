"use client";

import Link from "next/link";
import { rageDamageBonus, rageUsesMax, RAGING_CLASSES, damageWithRage } from "@/lib/estados";
import type { Token } from "@/lib/types";

type Props = {
  token: Token;
  canControl: boolean;
  ownerId: string;
  userId: string;
  onUpdateStats: (t: Token, patch: Partial<Token["stats"]>) => void;
  onToggleRage: (t: Token) => void;
  onRoll: (label: string, formula: string) => void;
  onRemove: (t: Token) => void;
};

/** Ficha de bolso da peça selecionada: vida, CA, ataques com botão de rolar e poderes de classe. */
export function TokenCard({ token: t, canControl, ownerId, userId, onUpdateStats, onToggleRage, onRoll, onRemove }: Props) {
  const hpPct = t.stats.hp_max > 0 ? Math.max(0, Math.min(100, (t.stats.hp_current / t.stats.hp_max) * 100)) : 0;
  const hpClass = hpPct <= 25 ? "is-low" : hpPct <= 60 ? "is-mid" : "";
  const raging = Boolean(t.stats.active_effects?.includes("rage"));
  const canRage = Boolean(t.stats.classKey && RAGING_CLASSES.includes(t.stats.classKey));

  function bump(delta: number) {
    onUpdateStats(t, { hp_current: Math.max(0, Math.min(t.stats.hp_max, t.stats.hp_current + delta)) });
  }

  return (
    <div className="mesa-card">
      <div className="flex items-center gap-3">
        <span className="mesa-portrait" style={{ background: t.color }} aria-hidden>
          {t.label.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="mesa-h truncate">{t.label}</p>
          <p className="mesa-hint">
            Casa {t.x + 1}, {t.y + 1}
            {!canControl && " · você só pode olhar"}
          </p>
        </div>
      </div>

      {t.stats.kind !== "cenario" && (
        <>
          <div className="mt-3">
            <div className="mesa-hp">
              <div className={`mesa-hp-fill ${hpClass}`} style={{ width: `${hpPct}%` }} />
              <span className="mesa-hp-text">
                {t.stats.hp_current} / {t.stats.hp_max} PV
              </span>
            </div>
            <div className="mesa-quick">
              <button className="mesa-quick-btn is-dmg" disabled={!canControl} onClick={() => bump(-5)}>
                −5
              </button>
              <button className="mesa-quick-btn is-dmg" disabled={!canControl} onClick={() => bump(-1)}>
                −1
              </button>
              <button className="mesa-quick-btn is-heal" disabled={!canControl} onClick={() => bump(1)}>
                +1
              </button>
              <button className="mesa-quick-btn is-heal" disabled={!canControl} onClick={() => bump(5)}>
                +5
              </button>
            </div>
          </div>

          <div className="mesa-stats">
            <div className="mesa-stat">
              <span className="mesa-stat-icon" aria-hidden>
                🛡️
              </span>
              <span className="mesa-stat-value">{t.stats.ac}</span>
              <span className="mesa-stat-label">CA</span>
            </div>
            <div className="mesa-stat">
              <span className="mesa-stat-icon" aria-hidden>
                👟
              </span>
              <span className="mesa-stat-value">{t.stats.speed}</span>
              <span className="mesa-stat-label">Metros</span>
            </div>
            <div className="mesa-stat">
              <span className="mesa-stat-icon" aria-hidden>
                📏
              </span>
              <span className="mesa-stat-value">{t.stats.hp_max}</span>
              <span className="mesa-stat-label">PV máx.</span>
            </div>
          </div>

          {canControl && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-semibold text-brass-deep">Ajustar PV/CA na mão</summary>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <label className="block">
                  <span className="mesa-label !mb-0.5 !text-[0.6rem]">PV atual</span>
                  <input
                    className="field px-2 py-1"
                    type="number"
                    value={t.stats.hp_current}
                    onChange={(e) => onUpdateStats(t, { hp_current: Math.max(0, Math.min(t.stats.hp_max, Number(e.target.value) || 0)) })}
                  />
                </label>
                <label className="block">
                  <span className="mesa-label !mb-0.5 !text-[0.6rem]">PV máx.</span>
                  <input className="field px-2 py-1" type="number" value={t.stats.hp_max} onChange={(e) => onUpdateStats(t, { hp_max: Math.max(1, Number(e.target.value) || 1) })} />
                </label>
                <label className="block">
                  <span className="mesa-label !mb-0.5 !text-[0.6rem]">CA</span>
                  <input className="field px-2 py-1" type="number" value={t.stats.ac} onChange={(e) => onUpdateStats(t, { ac: Math.max(0, Number(e.target.value) || 0) })} />
                </label>
              </div>
            </details>
          )}
        </>
      )}

      {t.stats.kind === "cenario" && <p className="mesa-hint mt-2">{t.stats.blocks ? "Bloqueia a passagem no grid." : "Só decorativo — não bloqueia passagem."}</p>}

      {t.stats.attacks && t.stats.attacks.length > 0 && (
        <>
          <div className="mesa-divider" />
          <p className="mesa-label">⚔️ Armas e ataques</p>
          <div className="space-y-2">
            {t.stats.attacks.map((a) => {
              const damage = damageWithRage(a, raging, t.stats.level ?? 1);
              return (
                <div key={a.name} className="mesa-attack">
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">
                    {a.name}
                    {a.type && <span className="ml-1 text-xs font-normal text-dim">({a.type})</span>}
                  </span>
                  <button className="mesa-roll-btn" onClick={() => onRoll(`Ataque: ${a.name} (${t.label})`, `1d20${a.bonus >= 0 ? "+" : ""}${a.bonus}`)}>
                    <span className="mesa-roll-tag">Acerto</span>
                    <span className="mesa-roll-val">
                      {a.bonus >= 0 ? "+" : ""}
                      {a.bonus}
                    </span>
                  </button>
                  <button className="mesa-roll-btn is-dmg" onClick={() => onRoll(`Dano: ${a.name} (${t.label})`, damage)}>
                    <span className="mesa-roll-tag">Dano</span>
                    <span className="mesa-roll-val">{damage}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {canRage && (
        <>
          <div className="mesa-divider" />
          <p className="mesa-label">✨ Poderes de classe</p>
          {(() => {
            const level = t.stats.level ?? 1;
            const max = rageUsesMax(level);
            const used = t.stats.furiaUsed ?? 0;
            const left = Math.max(0, max - used);
            return (
              <div>
                <button className={`mesa-power ${raging ? "is-on" : ""}`} disabled={!canControl} aria-pressed={raging} onClick={() => onToggleRage(t)}>
                  <span className="mesa-power-icon" aria-hidden>
                    🔥
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-bold leading-tight">{raging ? `Em fúria (+${rageDamageBonus(level)} dano)` : "Fúria"}</span>
                    <span className="mesa-pips" aria-hidden>
                      {Array.from({ length: max }, (_, i) => (
                        <span key={i} className={`mesa-pip ${i < used ? "is-spent" : ""}`} />
                      ))}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold opacity-80">{left} restam</span>
                </button>
                {used > 0 && canControl && (
                  <button className="mt-1 text-xs font-semibold text-brass-deep underline" onClick={() => onUpdateStats(t, { furiaUsed: 0 })}>
                    Descanso longo: zerar usos
                  </button>
                )}
              </div>
            );
          })()}
        </>
      )}

      <div className="mesa-divider" />
      <div className="flex flex-wrap gap-2">
        {t.character_id && t.owner_id === userId && (
          <Link href={`/fichas/${t.character_id}`} target="_blank" className="btn btn-ghost border border-rule text-sm">
            Abrir ficha completa
          </Link>
        )}
        {canControl && (
          <button className="btn btn-danger ml-auto text-sm" onClick={() => onRemove(t)}>
            Remover do mapa
          </button>
        )}
      </div>
      {t.owner_id === ownerId && t.owner_id !== userId && <p className="mt-1 text-xs text-dim">Peça do mestre.</p>}
    </div>
  );
}

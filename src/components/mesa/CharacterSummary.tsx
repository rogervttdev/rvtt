"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ABILITY_LABEL, formatMod, modifier, normalizeCharacter } from "@/lib/dnd";
import { characterCombat } from "@/lib/personagem";
import { findRace, findClass } from "@/lib/regras";
import { CONDITIONS } from "@/lib/condicoes";
import type { AbilityKey, Character } from "@/lib/types";

/**
 * Resumo de uma página só, só para consulta — o que o Mestre vê ao clicar no
 * nome de um jogador na mesa. Sem abas, sem edição: identidade, PV/CA/deslocamento,
 * atributos e ataques, de relance. Para editar, é o próprio jogador quem abre a
 * ficha completa dele.
 */
export function CharacterSummary({ characterId }: { characterId: string }) {
  const [char, setChar] = useState<Character | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    supabase
      .from("characters")
      .select("*")
      .eq("id", characterId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) return setStatus("missing");
        setChar(normalizeCharacter(data));
        setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [characterId]);

  if (status === "loading") return <p className="p-6 text-dim">Abrindo a ficha…</p>;
  if (status === "missing" || !char) return <p className="p-6 text-dim">Não foi possível abrir essa ficha.</p>;

  const race = findRace(char.race);
  const cls = findClass(char.class);
  const combat = characterCombat(char);
  const raging = char.details.activeEffects.includes("rage");

  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <span className="mesa-portrait !h-16 !w-16 !text-xl" style={{ background: "#8d6a2c" }} aria-hidden>
          {char.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold leading-tight">{char.name}</p>
          <p className="text-dim">
            {race?.name ?? char.race} {cls?.name ?? char.class} · nível {char.level}
            {char.alignment ? ` · ${char.alignment}` : ""}
          </p>
        </div>
      </div>

      <div className="mesa-stats mt-4">
        <div className="mesa-stat">
          <span className="mesa-stat-icon" aria-hidden>
            ❤️
          </span>
          <span className="mesa-stat-value">
            {char.hp_current}/{char.hp_max}
          </span>
          <span className="mesa-stat-label">PV</span>
        </div>
        <div className="mesa-stat">
          <span className="mesa-stat-icon" aria-hidden>
            🛡️
          </span>
          <span className="mesa-stat-value">{combat.ac}</span>
          <span className="mesa-stat-label">CA</span>
        </div>
        <div className="mesa-stat">
          <span className="mesa-stat-icon" aria-hidden>
            👟
          </span>
          <span className="mesa-stat-value">{char.speed}</span>
          <span className="mesa-stat-label">Metros</span>
        </div>
      </div>

      <div className="mesa-divider" />
      <p className="mesa-label">Atributos</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {(Object.keys(ABILITY_LABEL) as AbilityKey[]).map((k) => (
          <div key={k} className="mesa-stat">
            <span className="mesa-stat-label">{ABILITY_LABEL[k].slice(0, 3).toUpperCase()}</span>
            <span className="mesa-stat-value">{formatMod(modifier(char.abilities[k]))}</span>
          </div>
        ))}
      </div>

      {combat.attacks.length > 0 && (
        <>
          <div className="mesa-divider" />
          <p className="mesa-label">Armas e ataques</p>
          <div className="space-y-1.5">
            {combat.attacks.map((a) => (
              <div key={a.name} className="mesa-attack">
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{a.name}</span>
                <span className="chip">
                  Acerto {a.bonus >= 0 ? "+" : ""}
                  {a.bonus}
                </span>
                <span className="chip">
                  {a.damage}
                  {a.type ? ` ${a.type}` : ""}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {(char.details.conditions.length > 0 || raging) && (
        <>
          <div className="mesa-divider" />
          <p className="mesa-label">Condições ativas</p>
          <p className="flex flex-wrap gap-1.5">
            {raging && <span className="chip">🔥 Em fúria</span>}
            {char.details.conditions.map((id) => {
              const c = CONDITIONS.find((x) => x.id === id);
              return c ? (
                <span key={id} className="chip">
                  {c.icon} {c.name}
                </span>
              ) : null;
            })}
          </p>
        </>
      )}
    </div>
  );
}

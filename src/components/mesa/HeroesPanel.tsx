"use client";

import { useState } from "react";
import { TOKEN_COLORS } from "@/lib/dnd";
import type { TokenStats } from "@/lib/types";

type CharOption = { id: string; name: string; hp_current: number; hp_max: number; ac: number; speed: number; class: string | null; level: number };

type Props = {
  characters: CharOption[];
  onAdd: (t: { label: string; color: string; character_id: string | null; stats?: TokenStats }) => Promise<void>;
  fetchCombat: (characterId: string) => Promise<TokenStats | null>;
};

/** Formulário para colocar um herói (ou uma peça livre, tipo NPC) no mapa. */
export function HeroesPanel({ characters, onAdd, fetchCombat }: Props) {
  const [source, setSource] = useState<string>(characters[0]?.id ?? "custom");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(TOKEN_COLORS[0]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const char = characters.find((c) => c.id === source);
    const finalLabel = char ? char.name : label.trim();
    if (!finalLabel) return;
    setBusy(true);
    let stats: TokenStats | undefined;
    if (char) {
      stats = (await fetchCombat(char.id)) ?? { ac: char.ac, hp_current: char.hp_current, hp_max: char.hp_max, speed: char.speed, size: "medio", classKey: char.class ?? undefined, level: char.level };
    }
    await onAdd({ label: finalLabel, color, character_id: char?.id ?? null, stats });
    setBusy(false);
    setLabel("");
  }

  return (
    <div className="mesa-card">
      <p className="mesa-h">🧙 Colocar herói no mapa</p>
      <p className="mesa-hint mb-3">Escolha seu personagem — CA, vida e ataques entram sozinhos.</p>
      <form onSubmit={submit} className="space-y-2.5">
        {characters.length > 0 && (
          <div className="space-y-1.5" role="radiogroup" aria-label="Seu personagem">
            {characters.map((c) => (
              <label key={c.id} className={`mesa-choice ${source === c.id ? "is-on" : ""}`}>
                <input type="radio" name="char" checked={source === c.id} onChange={() => setSource(c.id)} />
                <span className="flex-1">
                  <span className="block font-display text-base font-bold leading-tight">{c.name}</span>
                  <span className="mesa-hint">
                    {c.class ?? "Aventureiro"} · nível {c.level} · CA {c.ac} · {c.hp_max} PV
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        <label className={`mesa-choice ${source === "custom" ? "is-on" : ""}`}>
          <input type="radio" name="char" checked={source === "custom"} onChange={() => setSource("custom")} />
          <span className="flex-1">
            <span className="block font-display text-base font-bold leading-tight">Peça livre (NPC, aliado…)</span>
            <span className="mesa-hint">Sem ficha — dá pra nomear na hora.</span>
          </span>
        </label>
        {source === "custom" && (
          <input className="field" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nome da peça (ex.: Mercador Tobias)" aria-label="Nome do token" />
        )}

        <div>
          <p className="mesa-label">Cor da peça</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor do token">
            {TOKEN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={`Cor ${c}`}
                onClick={() => setColor(c)}
                className={`mesa-swatch ${color === c ? "is-on" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <button className="btn btn-primary w-full" disabled={busy || (source === "custom" && !label.trim())}>
          {busy ? "Colocando…" : "📍 Colocar no mapa"}
        </button>
      </form>
    </div>
  );
}

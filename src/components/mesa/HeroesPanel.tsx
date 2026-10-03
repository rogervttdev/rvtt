"use client";

import { useState } from "react";
import { TOKEN_COLORS } from "@/lib/dnd";
import type { TokenStats } from "@/lib/types";

type CharOption = { id: string; name: string; hp_current: number; hp_max: number; ac: number; speed: number; class: string | null; level: number };
type Role = "personagem" | "aliado" | "inimigo";

type Props = {
  characters: CharOption[];
  onAdd: (t: { label: string; color: string; character_id: string | null; stats?: TokenStats }) => Promise<void>;
  fetchCombat: (characterId: string) => Promise<TokenStats | null>;
};

const ROLE_INFO: Record<Role, { label: string; icon: string; color: string; hint: string }> = {
  personagem: { label: "Personagem", icon: "🧙", color: "#2e6fb0", hint: "Uma ficha sua, já com CA, vida e ataques calculados." },
  aliado: { label: "Aliado", icon: "🤝", color: "#4c7a36", hint: "NPC amigo — você define o nome e os números na mão." },
  inimigo: { label: "Inimigo", icon: "⚔️", color: "#a8321f", hint: "Monstro ou vilão — você define o nome e os números na mão." },
};

/** Formulário para colocar qualquer peça no mapa: seu personagem, um aliado ou um inimigo. */
export function HeroesPanel({ characters, onAdd, fetchCombat }: Props) {
  const [role, setRole] = useState<Role>(characters.length > 0 ? "personagem" : "inimigo");
  const [source, setSource] = useState<string>(characters[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(TOKEN_COLORS[0]);
  const [hp, setHp] = useState(10);
  const [ac, setAc] = useState(10);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (role === "personagem") {
      const char = characters.find((c) => c.id === source);
      if (!char) return setBusy(false);
      const stats: TokenStats = (await fetchCombat(char.id)) ?? {
        ac: char.ac,
        hp_current: char.hp_current,
        hp_max: char.hp_max,
        speed: char.speed,
        size: "medio",
        classKey: char.class ?? undefined,
        level: char.level,
      };
      await onAdd({ label: char.name, color, character_id: char.id, stats: { ...stats, role } });
    } else {
      const finalLabel = label.trim() || (role === "aliado" ? "Aliado" : "Inimigo");
      const stats: TokenStats = { ac, hp_current: hp, hp_max: hp, speed: 9, size: "medio", role };
      await onAdd({ label: finalLabel, color, character_id: null, stats });
    }
    setBusy(false);
    setLabel("");
  }

  return (
    <div className="mesa-card">
      <p className="mesa-h">📍 Colocar peça no mapa</p>
      <p className="mesa-hint mb-3">Escolha o papel da peça — o resto é só o básico, pra não travar sua criatividade.</p>
      <form onSubmit={submit} className="space-y-2.5">
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Papel da peça">
          {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
            <label key={r} className={`mesa-choice !flex-col !items-center !text-center ${role === r ? "is-on" : ""}`}>
              <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} />
              <span aria-hidden className="text-lg">
                {ROLE_INFO[r].icon}
              </span>
              <span className="font-display text-sm font-bold leading-tight">{ROLE_INFO[r].label}</span>
            </label>
          ))}
        </div>
        <p className="mesa-hint">{ROLE_INFO[role].hint}</p>

        {role === "personagem" ? (
          characters.length > 0 ? (
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
          ) : (
            <p className="mesa-empty-state">
              <span className="mesa-empty-state-icon">📜</span>
              <span className="mesa-hint">Você ainda não tem uma ficha. Crie uma em "Fichas" primeiro.</span>
            </p>
          )
        ) : (
          <>
            <input
              className="field"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={role === "aliado" ? "Nome (ex.: Mercador Tobias)" : "Nome (ex.: Capitão bandido)"}
              aria-label="Nome da peça"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mesa-label">PV</span>
                <input className="field" type="number" min={1} value={hp} onChange={(e) => setHp(Math.max(1, Number(e.target.value) || 1))} />
              </label>
              <label className="block">
                <span className="mesa-label">CA</span>
                <input className="field" type="number" min={0} value={ac} onChange={(e) => setAc(Math.max(0, Number(e.target.value) || 0))} />
              </label>
            </div>
          </>
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

        <button className="btn btn-primary w-full" disabled={busy || (role === "personagem" && !source)}>
          {busy ? "Colocando…" : "📍 Colocar no mapa"}
        </button>
      </form>
    </div>
  );
}

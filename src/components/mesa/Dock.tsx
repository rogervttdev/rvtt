"use client";

export type DockAction = "herois" | "cenario" | "dados" | "combate" | "ficha" | "ajuda";

type Props = {
  isGM: boolean;
  active: DockAction | null;
  combatOpen: boolean;
  hasSheet: boolean;
  onAction: (a: DockAction) => void;
};

type Item = { id: DockAction; icon: string; label: string; hint: string; gmOnly?: boolean; needsSheet?: boolean };

const ITEMS: Item[] = [
  { id: "herois", icon: "📍", label: "Peças", hint: "Colocar seu personagem, um aliado ou um inimigo no mapa" },
  { id: "ficha", icon: "📜", label: "Ficha", hint: "Abrir a ficha do seu personagem sem sair da mesa", needsSheet: true },
  { id: "dados", icon: "🎲", label: "Dados", hint: "Rolar dados e ver as rolagens de todo mundo" },
  { id: "combate", icon: "⚔️", label: "Combate", hint: "Ordem dos turnos e rodada atual" },
  { id: "cenario", icon: "🌲", label: "Cenário", hint: "Paredes, árvores, mobília e armadilhas", gmOnly: true },
  { id: "ajuda", icon: "❓", label: "Ajuda", hint: "Passo a passo de como jogar" },
];

/** Barra de ferramentas grande e rotulada: cada botão diz o que faz, sem precisar adivinhar ícone. */
export function Dock({ isGM, active, combatOpen, hasSheet, onAction }: Props) {
  const items = ITEMS.filter((i) => !i.gmOnly || isGM);
  return (
    <nav className="mesa-dock" aria-label="Ferramentas da mesa">
      {items.map((it, idx) => {
        const isActive = it.id === "combate" ? combatOpen : active === it.id;
        const showSep = it.id === "cenario" || (it.id === "ajuda" && idx > 0 && !isGM);
        return (
          <span key={it.id} className="contents">
            {showSep && <span className="mesa-dock-sep" aria-hidden />}
            <button
              className={`mesa-dock-btn ${isActive ? "is-active" : ""}`}
              onClick={() => onAction(it.id)}
              disabled={it.needsSheet && !hasSheet}
              title={it.needsSheet && !hasSheet ? "Você ainda não tem um personagem. Crie um em Fichas." : it.hint}
              aria-pressed={isActive}
            >
              <span className="mesa-dock-icon" aria-hidden>
                {it.icon}
              </span>
              {it.label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

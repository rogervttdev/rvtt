"use client";

import { useEffect, useRef } from "react";

type Props = { open: boolean; isGM: boolean; onClose: () => void };

const PLAYER_STEPS = [
  { icon: "🧙", title: "Coloque seu herói no mapa", text: "Toque em “Heróis” na barra ao lado, escolha seu personagem e aperte “Colocar no mapa”." },
  { icon: "✋", title: "Arraste para se mover", text: "Segure a sua peça e arraste até a casa desejada. Todos veem o movimento na hora. No teclado, use as setas." },
  { icon: "🎯", title: "Toque na peça para agir", text: "No painel “Ação” aparecem sua vida, armadura, ataques e poderes. Um toque em “Atacar” ou “Dano” rola os dados para você." },
  { icon: "🎲", title: "Role dados à vontade", text: "Em “Dados” você rola qualquer dado. O resultado aparece grande na tela de todo mundo e fica no histórico." },
];

const GM_STEPS = [
  { icon: "🔗", title: "Chame seus jogadores", text: "Use “Convidar amigos” no topo: o link da mesa é copiado e você só precisa colar no chat." },
  { icon: "🐉", title: "Monte a cena", text: "Em “Monstros” e “Cenário” escolha a quantidade e clique em “Colocar”: as peças entram sozinhas no mapa. Também dá para arrastar." },
  { icon: "⚔️", title: "Comande o combate", text: "Em “Combate”, coloque todo mundo na ordem de iniciativa e use “Próximo turno”. A peça da vez ganha um brilho dourado." },
  { icon: "📜", title: "Espie as fichas", text: "Clique no avatar de um jogador (no topo) para abrir a ficha dele sem sair da mesa. Em “Mesa” você ajusta o tamanho e a imagem do mapa." },
];

/** Passo a passo curtinho para quem nunca usou uma mesa virtual. Aparece só na primeira visita. */
export function WelcomeGuide({ open, isGM, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const steps = isGM ? GM_STEPS : PLAYER_STEPS;

  return (
    <dialog ref={ref} className="mesa-guide" aria-labelledby="mesa-guide-title" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="p-6">
        <p className="text-center text-4xl" aria-hidden>
          {isGM ? "👑" : "🗺️"}
        </p>
        <h2 id="mesa-guide-title" className="mt-1 text-center font-display text-2xl font-bold">
          {isGM ? "Bem-vindo, mestre!" : "Bem-vindo à mesa!"}
        </h2>
        <p className="mt-1 text-center text-sm text-dim">Quatro passos e você já está jogando.</p>

        <ol className="mt-5 space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="mesa-guide-step">
              <span className="mesa-guide-num" aria-hidden>
                {i + 1}
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight">
                  <span aria-hidden>{s.icon} </span>
                  {s.title}
                </p>
                <p className="mt-0.5 text-[0.95rem] leading-snug text-dim">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <button className="btn btn-primary mt-6 w-full" onClick={onClose} autoFocus>
          Entendi, vamos jogar!
        </button>
        <p className="mt-2 text-center text-xs text-dim">Você pode rever isto a qualquer momento em “❓ Ajuda”.</p>
      </div>
    </dialog>
  );
}

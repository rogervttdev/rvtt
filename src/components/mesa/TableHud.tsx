"use client";

import { initials } from "@/lib/dnd";
import type { PresenceUser } from "@/lib/types";

type Props = {
  roomName: string;
  connected: boolean;
  isGM: boolean;
  ownerId: string;
  userId: string;
  online: PresenceUser[];
  copied: boolean;
  /** Devolve o id do personagem que esse jogador trouxe à mesa (se houver). */
  charIdForUser: (userId: string) => string | null;
  onOpenSheet: (characterId: string) => void;
  onInvite: () => void;
  onHelp: () => void;
};

const AVATAR_COLORS = ["#a8431f", "#2f5d7c", "#4c7a36", "#7a4a8c", "#b98a1f", "#5a3a24"];
const MAX_AVATARS = 6;

/** Barra superior: nome da mesa, estado da conexão, quem está jogando e atalhos de convite/ajuda. */
export function TableHud({ roomName, connected, isGM, ownerId, userId, online, copied, charIdForUser, onOpenSheet, onInvite, onHelp }: Props) {
  const shown = online.slice(0, MAX_AVATARS);
  const extra = online.length - shown.length;

  return (
    <header className="mesa-hud">
      <h1 className="mesa-title">{roomName}</h1>
      <span className={`mesa-pill ${connected ? "is-on" : "is-off"}`} role="status">
        <span className="mesa-pill-dot" aria-hidden />
        {connected ? "Conectado" : "Reconectando…"}
      </span>
      {isGM && <span className="mesa-pill is-gm">👑 Você é o mestre</span>}

      <div className="mesa-party" aria-label={`${online.length} pessoa(s) na mesa`}>
        {shown.map((p, i) => {
          const charId = charIdForUser(p.user_id);
          const clickable = isGM && p.user_id !== userId && Boolean(charId);
          const gm = p.user_id === ownerId;
          const cls = `mesa-avatar ${gm ? "is-gm" : ""} ${clickable ? "is-clickable" : ""}`;
          const style = { background: AVATAR_COLORS[i % AVATAR_COLORS.length] };
          const label = `${p.name}${gm ? " (mestre)" : ""}${p.user_id === userId ? " — você" : ""}${clickable ? ". Clique para ver a ficha." : ""}`;
          const content = (
            <>
              {gm && <span className="mesa-avatar-crown" aria-hidden>👑</span>}
              {initials(p.name)}
            </>
          );
          return clickable ? (
            <button key={p.user_id} className={cls} style={style} title={label} aria-label={label} onClick={() => onOpenSheet(charId!)}>
              {content}
            </button>
          ) : (
            <span key={p.user_id} className={cls} style={style} title={label}>
              {content}
            </span>
          );
        })}
        {extra > 0 && <span className="mesa-avatar" title={`Mais ${extra} pessoa(s)`}>+{extra}</span>}
      </div>

      <button className="mesa-hud-btn" onClick={onInvite} title="Copia o link da mesa para você enviar aos amigos">
        {copied ? "✅ Link copiado!" : "🔗 Convidar amigos"}
      </button>
      <button className="mesa-hud-btn" onClick={onHelp} title="Ver o passo a passo de como jogar">
        ❓ Como jogar
      </button>
    </header>
  );
}

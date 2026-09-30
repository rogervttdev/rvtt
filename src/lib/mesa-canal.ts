"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { PresenceUser, Room, RollEntry, Token, TokenStats } from "./types";

/** O que a mesa faz quando chega um evento de outro jogador. */
export type RoomHandlers = {
  onTokenMove: (p: { id: string; x: number; y: number }) => void;
  onTokenAdd: (t: Token) => void;
  onTokenAddBatch: (ts: Token[]) => void;
  onTokenUpdate: (p: { id: string; stats: Partial<TokenStats> }) => void;
  onTokenRemove: (p: { id: string }) => void;
  onRoll: (r: RollEntry) => void;
  onRoomUpdate: (r: Room) => void;
};

/**
 * Conecta a mesa ao canal `room:<id>` do Supabase Realtime:
 * - Broadcast: movimentos, tokens, rolagens e configuração, sem passar pelo banco;
 * - Presence: quem está online agora.
 * Devolve `send` (para avisar os outros), `connected` e a lista `online`.
 * Os handlers ficam num ref, então trocar de função não derruba a conexão.
 */
export function useRoomChannel(roomId: string, user: { id: string }, displayName: string, handlers: RoomHandlers) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef(handlers);
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState<PresenceUser[]>([]);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false }, presence: { key: user.id } },
    });
    const h = () => handlersRef.current;

    channel
      .on("broadcast", { event: "token-move" }, ({ payload }) => h().onTokenMove(payload as { id: string; x: number; y: number }))
      .on("broadcast", { event: "token-add" }, ({ payload }) => h().onTokenAdd(payload as Token))
      .on("broadcast", { event: "token-add-batch" }, ({ payload }) => h().onTokenAddBatch(payload as Token[]))
      .on("broadcast", { event: "token-update" }, ({ payload }) => h().onTokenUpdate(payload as { id: string; stats: Partial<TokenStats> }))
      .on("broadcast", { event: "token-remove" }, ({ payload }) => h().onTokenRemove(payload as { id: string }))
      .on("broadcast", { event: "roll" }, ({ payload }) => h().onRoll(payload as RollEntry))
      .on("broadcast", { event: "room-update" }, ({ payload }) => h().onRoomUpdate(payload as Room))
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        setOnline(
          Object.values(state)
            .map((list) => list[0])
            .filter(Boolean)
            .map((p) => ({ user_id: p.user_id, name: p.name })),
        );
      })
      .subscribe(async (s) => {
        setConnected(s === "SUBSCRIBED");
        if (s === "SUBSCRIBED") await channel.track({ user_id: user.id, name: displayName });
      });

    channelRef.current = channel;
    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, user.id, displayName]);

  const send = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  return { send, connected, online };
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { RequireAuth } from "@/components/RequireAuth";
import { useUser } from "@/components/SessionProvider";
import { DiceRoller } from "@/components/DiceRoller";
import { supabase } from "@/lib/supabase";
import { TOKEN_COLORS, initials, uid } from "@/lib/dnd";
import { DEFAULT_TOKEN_STATS, MONSTERS, SIZE_CELLS, normalizeTokenStats, statsFromMonster, type MonsterDef } from "@/lib/monstros";
import { MonsterPanel } from "@/components/MonsterPanel";
import { TokenTooltip } from "@/components/TokenTooltip";
import { InitiativeTracker } from "@/components/InitiativeTracker";
import { DiceOverlay } from "@/components/DiceOverlay";
import { CharacterSheetModal } from "@/components/CharacterSheetModal";
import { SCENERY, statsFromScenery, type SceneryDef } from "@/lib/cenario";
import type { PresenceUser, Room, RollEntry, RollResult, Token, TokenStats } from "@/lib/types";

export default function MesaPage() {
  return (
    <RequireAuth>
      <GameTable />
    </RequireAuth>
  );
}

type Drag = { id: string; x: number; y: number; moved: boolean };

function GameTable() {
  const { id: roomId } = useParams<{ id: string }>();
  const { user, displayName } = useUser();

  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [myChars, setMyChars] = useState<{ id: string; name: string; hp_current: number; hp_max: number; ac: number; speed: number }[]>([]);
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [cell, setCell] = useState(50); // 50px por quadrado, como no tabuleiro físico
  const [selected, setSelected] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [bestiaryOpen, setBestiaryOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [diceQueue, setDiceQueue] = useState<RollEntry[]>([]);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [charPicker, setCharPicker] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);

  const isGM = room?.owner_id === user.id;
  const canControl = useCallback((t: Token) => t.owner_id === user.id || isGM, [user.id, isGM]);

  // ---------- Carga inicial ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [roomRes, tokenRes, charRes] = await Promise.all([
        supabase.from("rooms").select("*").eq("id", roomId).maybeSingle(),
        supabase.from("tokens").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("characters").select("id,name,hp_current,hp_max,ac,speed").eq("user_id", user.id).order("name"),
      ]);
      if (cancelled) return;
      if (!roomRes.data) return setStatus("missing");
      const r = roomRes.data as Room;
      setRoom({ ...r, turn_order: Array.isArray(r.turn_order) ? r.turn_order : [], current_turn: r.current_turn ?? 0, round: r.round ?? 1 });
      setTokens(((tokenRes.data as Token[]) ?? []).map((t) => ({ ...t, stats: normalizeTokenStats(t.stats) })));
      setMyChars((charRes.data as typeof myChars) ?? []);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, user.id]);

  // ---------- Realtime: Broadcast + Presence ----------
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false }, presence: { key: user.id } },
    });

    channel
      .on("broadcast", { event: "token-move" }, ({ payload }) => {
        const { id, x, y } = payload as { id: string; x: number; y: number };
        setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, x, y } : t)));
      })
      .on("broadcast", { event: "token-add" }, ({ payload }) => {
        const token = { ...(payload as Token), stats: normalizeTokenStats((payload as Token).stats) };
        setTokens((ts) => (ts.some((t) => t.id === token.id) ? ts : [...ts, token]));
      })
      .on("broadcast", { event: "token-update" }, ({ payload }) => {
        const { id, stats } = payload as { id: string; stats: Partial<TokenStats> };
        setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, stats: { ...t.stats, ...stats } } : t)));
      })
      .on("broadcast", { event: "token-remove" }, ({ payload }) => {
        const { id } = payload as { id: string };
        setTokens((ts) => ts.filter((t) => t.id !== id));
      })
      .on("broadcast", { event: "roll" }, ({ payload }) => {
        const entry = payload as RollEntry;
        setRolls((rs) => [entry, ...rs].slice(0, 60));
        setDiceQueue((q) => [...q, entry]);
      })
      .on("broadcast", { event: "token-add-batch" }, ({ payload }) => {
        const batch = (payload as Token[]).map((t) => ({ ...t, stats: normalizeTokenStats(t.stats) }));
        setTokens((ts) => [...ts, ...batch.filter((t) => !ts.some((x) => x.id === t.id))]);
      })
      .on("broadcast", { event: "room-update" }, ({ payload }) => {
        setRoom(payload as Room);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users = Object.values(state)
          .map((list) => list[0])
          .filter(Boolean)
          .map((p) => ({ user_id: p.user_id, name: p.name }));
        setOnline(users);
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

  // ---------- Tokens ----------
  const moveToken = useCallback(
    (id: string, x: number, y: number) => {
      setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, x, y } : t)));
      send("token-move", { id, x, y });
    },
    [send],
  );

  const persistPosition = useCallback(async (id: string, x: number, y: number) => {
    const { error } = await supabase.from("tokens").update({ x, y }).eq("id", id);
    if (error) setError(`Não foi possível salvar a posição: ${error.message}`);
  }, []);

  function cellFromPointer(clientX: number, clientY: number, span = 1) {
    const rect = boardRef.current!.getBoundingClientRect();
    const cols = room?.cols ?? 1;
    const rows = room?.rows ?? 1;
    return {
      x: Math.max(0, Math.min(cols - span, Math.floor((clientX - rect.left) / cell))),
      y: Math.max(0, Math.min(rows - span, Math.floor((clientY - rect.top) / cell))),
    };
  }

  function onTokenPointerDown(e: React.PointerEvent<HTMLButtonElement>, t: Token) {
    setSelected(t.id);
    if (!canControl(t)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: t.id, x: t.x, y: t.y, moved: false };
    setDraggingId(t.id);
  }

  function onTokenPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const span = SIZE_CELLS[tokens.find((t) => t.id === drag.id)?.stats.size ?? "medio"];
    const { x, y } = cellFromPointer(e.clientX, e.clientY, span);
    if (x !== drag.x || y !== drag.y) {
      dragRef.current = { ...drag, x, y, moved: true };
      moveToken(drag.id, x, y);
    }
  }

  function onTokenPointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    if (drag?.moved) persistPosition(drag.id, drag.x, drag.y);
  }

  function onTokenKeyDown(e: React.KeyboardEvent, t: Token) {
    const delta: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    if (e.key === "Delete" && canControl(t)) return void removeToken(t);
    const d = delta[e.key];
    if (!d || !room || !canControl(t)) return;
    e.preventDefault();
    const span = SIZE_CELLS[t.stats.size];
    const x = Math.max(0, Math.min(room.cols - span, t.x + d[0]));
    const y = Math.max(0, Math.min(room.rows - span, t.y + d[1]));
    moveToken(t.id, x, y);
    persistPosition(t.id, x, y);
  }

  /** Marca no set todas as células cobertas por um token de `span` casas de lado. */
  function markOccupied(occupied: Set<string>, x: number, y: number, span: number) {
    for (let dx = 0; dx < span; dx++) for (let dy = 0; dy < span; dy++) occupied.add(`${x + dx},${y + dy}`);
  }

  /** Acha `count` casas livres adjacentes no grid, respeitando o tamanho (footprint) da criatura. */
  function freeSpots(span: number, count: number): { x: number; y: number }[] {
    if (!room) return [];
    const occupied = new Set<string>();
    for (const t of tokens) markOccupied(occupied, t.x, t.y, SIZE_CELLS[t.stats.size]);
    const spots: { x: number; y: number }[] = [];
    for (let y = 0; y <= room.rows - span && spots.length < count; y++)
      for (let x = 0; x <= room.cols - span && spots.length < count; x++) {
        let free = true;
        outer: for (let dx = 0; dx < span; dx++)
          for (let dy = 0; dy < span; dy++)
            if (occupied.has(`${x + dx},${y + dy}`)) {
              free = false;
              break outer;
            }
        if (free) {
          spots.push({ x, y });
          markOccupied(occupied, x, y, span);
        }
      }
    return spots;
  }

  function freeSpot(span: number) {
    return freeSpots(span, 1)[0] ?? { x: 0, y: 0 };
  }

  async function addToken(input: { label: string; color: string; character_id: string | null; stats?: TokenStats; at?: { x: number; y: number } }) {
    if (!room) return;
    const stats = input.stats ?? DEFAULT_TOKEN_STATS;
    const spot = input.at ?? freeSpot(SIZE_CELLS[stats.size]);

    const { data, error } = await supabase
      .from("tokens")
      .insert({ room_id: room.id, owner_id: user.id, label: input.label, color: input.color, character_id: input.character_id, stats, ...spot })
      .select("*")
      .single();
    if (error) return setError(`Não foi possível criar o token: ${error.message}`);
    const token = { ...(data as Token), stats: normalizeTokenStats((data as Token).stats) };
    setTokens((ts) => [...ts, token]);
    setSelected(token.id);
    send("token-add", token);
  }

  /** Instancia N monstros do bestiário direto no mapa, com CA/PV/ataques prontos. */
  async function addMonster(m: MonsterDef, qty = 1) {
    if (!room) return;
    const span = SIZE_CELLS[m.size];
    const spots = freeSpots(span, qty);
    const rows = spots.map((spot) => ({
      room_id: room.id,
      owner_id: user.id,
      label: qty > 1 ? `${m.name} ${spots.indexOf(spot) + 1}` : m.name,
      color: m.color,
      character_id: null,
      stats: statsFromMonster(m),
      ...spot,
    }));
    if (rows.length === 0) return;
    const { data, error } = await supabase.from("tokens").insert(rows).select("*");
    if (error) return setError(`Não foi possível colocar: ${error.message}`);
    const batch = (data as Token[]).map((t) => ({ ...t, stats: normalizeTokenStats(t.stats) }));
    setTokens((ts) => [...ts, ...batch]);
    send("token-add-batch", batch);
  }

  /** Instancia N itens de cenário (paredes, mobília, natureza…) já espalhados em casas livres. */
  async function addScenery(item: SceneryDef, qty = 1, at?: { x: number; y: number }) {
    if (!room) return;
    const span = SIZE_CELLS[item.size];
    const spots = at ? [at] : freeSpots(span, qty);
    const rows = spots.map((spot, i) => ({
      room_id: room.id,
      owner_id: user.id,
      label: qty > 1 ? `${item.name} ${i + 1}` : item.name,
      color: item.color,
      character_id: null,
      stats: statsFromScenery(item),
      ...spot,
    }));
    if (rows.length === 0) return;
    const { data, error } = await supabase.from("tokens").insert(rows).select("*");
    if (error) return setError(`Não foi possível colocar: ${error.message}`);
    const batch = (data as Token[]).map((t) => ({ ...t, stats: normalizeTokenStats(t.stats) }));
    setTokens((ts) => [...ts, ...batch]);
    send("token-add-batch", batch);
  }

  /** Ajusta PV (ou outro campo de combate) do token: salva no banco e avisa todo mundo na hora. */
  async function updateTokenStats(t: Token, patch: Partial<TokenStats>) {
    const stats = { ...t.stats, ...patch };
    setTokens((ts) => ts.map((x) => (x.id === t.id ? { ...x, stats } : x)));
    send("token-update", { id: t.id, stats: patch });
    const { error } = await supabase.from("tokens").update({ stats }).eq("id", t.id);
    if (error) setError(`Não foi possível salvar: ${error.message}`);
  }

  async function removeToken(t: Token) {
    const { error } = await supabase.from("tokens").delete().eq("id", t.id);
    if (error) return setError(`Não foi possível remover: ${error.message}`);
    setTokens((ts) => ts.filter((x) => x.id !== t.id));
    setSelected(null);
    send("token-remove", { id: t.id });
  }

  // ---------- Dados ----------
  function handleRoll(r: RollResult) {
    const entry: RollEntry = { ...r, id: uid(), author: displayName, authorId: user.id, at: Date.now() };
    setRolls((rs) => [entry, ...rs].slice(0, 60));
    setDiceQueue((q) => [...q, entry]);
    send("roll", entry);
  }

  // ---------- Configuração da mesa (mestre) ----------
  async function saveRoom(p: Partial<Room>) {
    if (!room) return;
    const next = { ...room, ...p };
    const { error } = await supabase
      .from("rooms")
      .update({ name: next.name, cols: next.cols, rows: next.rows, background_url: next.background_url })
      .eq("id", room.id);
    if (error) return setError(error.message);
    setRoom(next);
    send("room-update", next);
  }

  /** Atualiza a ordem de iniciativa, quem está na vez e a rodada — salva e avisa todo mundo. */
  async function updateTurns(patch: Partial<Pick<Room, "turn_order" | "current_turn" | "round">>) {
    if (!room) return;
    const next = { ...room, ...patch };
    setRoom(next);
    send("room-update", next);
    const { error } = await supabase
      .from("rooms")
      .update({ turn_order: next.turn_order, current_turn: next.current_turn, round: next.round })
      .eq("id", room.id);
    if (error) setError(`Não foi possível salvar a iniciativa: ${error.message}`);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const selectedToken = useMemo(() => tokens.find((t) => t.id === selected) ?? null, [tokens, selected]);

  /** Personagem que esse jogador trouxe para a mesa (pelo token vinculado a ele). */
  const charIdForUser = useCallback(
    (uid: string) => tokens.find((t) => t.owner_id === uid && t.character_id)?.character_id ?? null,
    [tokens],
  );

  function openMyCharacter() {
    const fromToken = charIdForUser(user.id);
    if (fromToken) return setSheetId(fromToken);
    if (myChars.length === 1) return setSheetId(myChars[0].id);
    if (myChars.length > 1) return setCharPicker(true);
  }

  if (status === "loading") return <p className="p-8 text-dim">Abrindo a mesa…</p>;
  if (status === "missing" || !room)
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-2xl font-bold">Mesa não encontrada</h1>
        <p className="mt-2 text-dim">Confira o link com o mestre da mesa.</p>
        <Link href="/mesas" className="btn btn-primary mt-6">Voltar às mesas</Link>
      </div>
    );

  const gridLine = "rgb(90 58 36 / 0.32)";
  const bgLayers = [
    `linear-gradient(to right, ${gridLine} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,
    ...(room.background_url ? [`url("${room.background_url.replace(/"/g, "%22")}")`] : []),
  ];

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-3.5rem)] lg:flex-row">
      {/* ---------- Mapa ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-rule bg-vellum px-4 py-2">
          <h1 className="font-display text-xl font-bold">{room.name}</h1>
          <span className={`text-xs font-semibold ${connected ? "text-moss" : "text-blood"}`}>
            {connected ? "● Conectado" : "● Reconectando…"}
          </span>
          {isGM && <span className="rounded bg-rule px-2 py-0.5 text-xs font-bold text-ember-deep">Você é o mestre</span>}
          <label className="ml-auto flex items-center gap-2 text-sm text-dim">
            Zoom
            <input type="range" min={30} max={100} step={2} value={cell} onChange={(e) => setCell(Number(e.target.value))} />
          </label>
          <button className="btn btn-ghost border border-rule" onClick={() => setBestiaryOpen(true)}>
            🐉 Bestiário
          </button>
          <button className="btn btn-ghost border border-rule" onClick={copyLink}>
            {copied ? "Link copiado" : "Copiar convite"}
          </button>
        </div>

        <InitiativeTracker room={room} tokens={tokens} isGM={isGM} onChange={updateTurns} />

        {error && (
          <p className="flex items-center justify-between bg-blood/10 px-4 py-2 text-sm text-blood" role="alert">
            {error}
            <button className="font-bold" onClick={() => setError("")}>Fechar</button>
          </p>
        )}

        <div className="h-[65vh] overflow-auto tavern-wood p-6 lg:h-auto lg:flex-1">
          <div
            ref={boardRef}
            className="relative mx-auto select-none shadow-[0_0_0_3px_#8d6a2c,0_12px_30px_-8px_rgb(0_0_0/0.6)]"
            style={{
              width: room.cols * cell,
              height: room.rows * cell,
              backgroundColor: "#f3e6c7",
              backgroundImage: bgLayers.join(","),
              backgroundSize: `${cell}px ${cell}px, ${cell}px ${cell}px, 100% 100%`,
            }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const monsterId = e.dataTransfer.getData("application/x-monster-id");
              const sceneryId = e.dataTransfer.getData("application/x-scenery-id");
              if (monsterId) {
                const m = MONSTERS.find((x) => x.id === monsterId);
                if (!m) return;
                const at = cellFromPointer(e.clientX, e.clientY, SIZE_CELLS[m.size]);
                addToken({ label: m.name, color: m.color, character_id: null, stats: statsFromMonster(m), at });
              } else if (sceneryId) {
                const item = SCENERY.find((x) => x.id === sceneryId);
                if (!item) return;
                const at = cellFromPointer(e.clientX, e.clientY, SIZE_CELLS[item.size]);
                addScenery(item, 1, at);
              }
            }}
          >
            {tokens.map((t) => {
              const isSel = t.id === selected;
              const mine = canControl(t);
              const span = SIZE_CELLS[t.stats.size];
              const hpPct = t.stats.hp_max > 0 ? Math.max(0, Math.min(100, (t.stats.hp_current / t.stats.hp_max) * 100)) : 0;
              const isScenery = t.stats.kind === "cenario";
              const isActiveTurn = room.turn_order[room.current_turn]?.token_id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  aria-label={`${t.label}, coluna ${t.x + 1}, linha ${t.y + 1}${isScenery ? "" : `, ${t.stats.hp_current} de ${t.stats.hp_max} PV`}${mine ? ". Use as setas para mover." : ""}${isActiveTurn ? ". É a vez dele agora." : ""}`}
                  onPointerDown={(e) => onTokenPointerDown(e, t)}
                  onPointerMove={onTokenPointerMove}
                  onPointerUp={onTokenPointerUp}
                  onPointerCancel={onTokenPointerUp}
                  onPointerEnter={(e) => {
                    setHoveredId(t.id);
                    setHoverPos({ x: e.clientX, y: e.clientY - cell * 0.6 });
                  }}
                  onPointerLeave={() => setHoveredId((id) => (id === t.id ? null : id))}
                  onKeyDown={(e) => onTokenKeyDown(e, t)}
                  onFocus={() => {
                    setSelected(t.id);
                    setHoveredId(t.id);
                  }}
                  onBlur={() => setHoveredId((id) => (id === t.id ? null : id))}
                  className={`absolute flex flex-col items-center justify-center font-display font-bold text-[#fbeed3] ${
                    isScenery ? "rounded-md" : "rounded-full"
                  } ${isActiveTurn ? "token-active-turn" : ""} ${mine ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                  style={{
                    left: t.x * cell + cell * 0.08,
                    top: t.y * cell + cell * 0.08,
                    width: span * cell - cell * 0.16,
                    height: span * cell - cell * 0.16,
                    fontSize: isScenery ? cell * 0.5 : cell * 0.32,
                    background: t.color,
                    border: `${Math.max(2, cell * 0.05)}px solid ${isSel ? "#2a1c12" : "#f6ecd4"}`,
                    boxShadow: isSel ? "0 0 0 3px rgb(195 154 78 / .8), 0 4px 10px rgb(42 28 18 / .45)" : "0 2px 4px rgb(42 28 18 / .45)",
                    transition: draggingId === t.id ? "none" : "left 110ms ease-out, top 110ms ease-out",
                    touchAction: "none",
                    zIndex: isSel ? 10 : isActiveTurn ? 5 : 1,
                  }}
                >
                  {isScenery ? t.stats.icon ?? "❓" : initials(t.label)}
                  {!isScenery && hpPct < 100 && (
                    <span className="mt-0.5 block h-1 w-2/3 overflow-hidden rounded-full bg-black/40" aria-hidden>
                      <span className={`block h-full ${hpPct <= 25 ? "bg-blood" : "bg-moss"}`} style={{ width: `${hpPct}%` }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {hoveredId && (() => {
        const t = tokens.find((x) => x.id === hoveredId);
        return t ? <TokenTooltip token={t} x={hoverPos.x} y={hoverPos.y} /> : null;
      })()}

      <MonsterPanel open={bestiaryOpen} onClose={() => setBestiaryOpen(false)} onAddMonster={addMonster} onAddScenery={addScenery} />

      {/* ---------- Painel lateral ---------- */}
      <aside className="w-full shrink-0 space-y-6 overflow-y-auto border-l border-rule bg-paper p-4 lg:w-[340px]">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold">Na mesa ({online.length})</h2>
          <ul className="flex flex-wrap gap-1.5">
            {online.map((p) => {
              const charId = charIdForUser(p.user_id);
              const clickable = isGM && p.user_id !== user.id && charId;
              const Tag = clickable ? "button" : "span";
              return (
                <li key={p.user_id}>
                  <Tag
                    className={`rounded-full bg-vellum px-3 py-1 text-sm shadow-[0_0_0_1px_var(--color-rule)] ${clickable ? "cursor-pointer hover:shadow-[0_0_0_1px_var(--color-brass-deep)]" : ""}`}
                    onClick={clickable ? () => setSheetId(charId) : undefined}
                    title={clickable ? `Ver a ficha de ${p.name}` : undefined}
                  >
                    <span className="mr-1 text-moss">●</span>
                    {p.name}
                    {p.user_id === room.owner_id && <span className="text-dim"> (mestre)</span>}
                  </Tag>
                </li>
              );
            })}
          </ul>
          {isGM && <p className="mt-1.5 text-xs text-dim">Clique no nome de um jogador para abrir a ficha dele.</p>}
        </section>

        {selectedToken && (
          <section className="panel p-3">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 shrink-0 rounded-full" style={{ background: selectedToken.color }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold">{selectedToken.label}</p>
                <p className="text-xs text-dim">
                  Coluna {selectedToken.x + 1}, linha {selectedToken.y + 1}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <label className="block">
                <span className="field-label">PV atual</span>
                <input
                  className="field px-2 py-1"
                  type="number"
                  value={selectedToken.stats.hp_current}
                  disabled={!canControl(selectedToken)}
                  onChange={(e) => updateTokenStats(selectedToken, { hp_current: Math.max(0, Math.min(selectedToken.stats.hp_max, Number(e.target.value) || 0)) })}
                />
              </label>
              <label className="block">
                <span className="field-label">PV máx.</span>
                <input
                  className="field px-2 py-1"
                  type="number"
                  value={selectedToken.stats.hp_max}
                  disabled={!canControl(selectedToken)}
                  onChange={(e) => updateTokenStats(selectedToken, { hp_max: Math.max(1, Number(e.target.value) || 1) })}
                />
              </label>
              <label className="block">
                <span className="field-label">CA</span>
                <input
                  className="field px-2 py-1"
                  type="number"
                  value={selectedToken.stats.ac}
                  disabled={!canControl(selectedToken)}
                  onChange={(e) => updateTokenStats(selectedToken, { ac: Math.max(0, Number(e.target.value) || 0) })}
                />
              </label>
            </div>
            {canControl(selectedToken) && (
              <div className="mt-2 flex gap-2">
                <button
                  className="btn btn-ghost flex-1 border border-rule px-2 py-1 text-sm"
                  onClick={() => updateTokenStats(selectedToken, { hp_current: Math.max(0, selectedToken.stats.hp_current - 1) })}
                >
                  −1 PV (dano)
                </button>
                <button
                  className="btn btn-ghost flex-1 border border-rule px-2 py-1 text-sm"
                  onClick={() => updateTokenStats(selectedToken, { hp_current: Math.min(selectedToken.stats.hp_max, selectedToken.stats.hp_current + 1) })}
                >
                  +1 PV (cura)
                </button>
              </div>
            )}
            {selectedToken.stats.attacks && selectedToken.stats.attacks.length > 0 && (
              <ul className="mt-2 space-y-0.5 border-t border-rule pt-2 text-xs text-dim">
                {selectedToken.stats.attacks.map((a) => (
                  <li key={a.name}>
                    {a.name}: {a.bonus >= 0 ? "+" : ""}
                    {a.bonus} ({a.damage})
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedToken.character_id && selectedToken.owner_id === user.id && (
                <Link href={`/fichas/${selectedToken.character_id}`} target="_blank" className="btn btn-ghost border border-rule">
                  Abrir ficha
                </Link>
              )}
              {canControl(selectedToken) && (
                <button className="btn btn-danger" onClick={() => removeToken(selectedToken)}>
                  Remover token
                </button>
              )}
            </div>
          </section>
        )}

        <AddTokenForm characters={myChars} onAdd={addToken} />

        <section>
          <h2 className="mb-2 font-display text-lg font-bold">Dados</h2>
          <DiceRoller onRoll={handleRoll} />
          <ol className="mt-3 max-h-72 space-y-1.5 overflow-y-auto" aria-live="polite">
            {rolls.length === 0 && <li className="text-sm text-dim">As rolagens de todos aparecem aqui.</li>}
            {rolls.map((r) => (
              <li
                key={r.id}
                className={`rounded-md border bg-vellum px-3 py-2 ${
                  r.crit === "critico" ? "border-moss" : r.crit === "falha" ? "border-blood" : "border-rule"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{r.author}</span>
                  <span
                    className={`font-display text-2xl font-extrabold ${
                      r.crit === "critico" ? "text-moss" : r.crit === "falha" ? "text-blood" : "text-ember-deep"
                    }`}
                  >
                    {r.total}
                  </span>
                </div>
                <p className="text-xs text-dim">
                  {r.detail}
                  {r.crit === "critico" && " — 20 natural!"}
                  {r.crit === "falha" && " — 1 natural."}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {isGM && <RoomSettings room={room} onSave={saveRoom} />}
      </aside>

      {/* ---------- Botão flutuante "Minha ficha" (jogador) ---------- */}
      {!isGM && (
        <div className="my-sheet-fab">
          {charPicker && (
            <div className="my-sheet-picker">
              <p className="mb-1 text-xs font-bold text-dim">Qual personagem?</p>
              {myChars.map((c) => (
                <button
                  key={c.id}
                  className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-rule"
                  onClick={() => {
                    setSheetId(c.id);
                    setCharPicker(false);
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
          <button className="btn btn-primary shadow-lg" onClick={openMyCharacter} disabled={myChars.length === 0}>
            📜 Minha ficha
          </button>
        </div>
      )}

      <CharacterSheetModal characterId={sheetId} onClose={() => setSheetId(null)} />

      <DiceOverlay roll={diceQueue[0] ?? null} onDone={() => setDiceQueue((q) => q.slice(1))} />
    </div>
  );
}

function AddTokenForm({
  characters,
  onAdd,
}: {
  characters: { id: string; name: string; hp_current: number; hp_max: number; ac: number; speed: number }[];
  onAdd: (t: { label: string; color: string; character_id: string | null; stats?: TokenStats }) => Promise<void>;
}) {
  const [source, setSource] = useState<string>("custom");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(TOKEN_COLORS[0]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const char = characters.find((c) => c.id === source);
    const finalLabel = char ? char.name : label.trim();
    if (!finalLabel) return;
    setBusy(true);
    await onAdd({
      label: finalLabel,
      color,
      character_id: char?.id ?? null,
      stats: char
        ? { ac: char.ac, hp_current: char.hp_current, hp_max: char.hp_max, speed: char.speed, size: "medio" }
        : undefined,
    });
    setBusy(false);
    setLabel("");
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <h2 className="font-display text-lg font-bold">Colocar token</h2>
      <select className="field" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Origem do token">
        <option value="custom">Token livre (monstro, NPC…)</option>
        {characters.map((c) => (
          <option key={c.id} value={c.id}>
            Personagem: {c.name}
          </option>
        ))}
      </select>
      {source === "custom" && (
        <input className="field" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Goblin 1" aria-label="Nome do token" />
      )}
      <div className="flex gap-1.5" role="radiogroup" aria-label="Cor do token">
        {TOKEN_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={color === c}
            aria-label={`Cor ${c}`}
            onClick={() => setColor(c)}
            className="h-7 w-7 rounded-full"
            style={{ background: c, outline: color === c ? "2px solid #2a1c12" : "none", outlineOffset: 2 }}
          />
        ))}
      </div>
      <button className="btn btn-primary w-full" disabled={busy || (source === "custom" && !label.trim())}>
        {busy ? "Colocando…" : "Colocar no mapa"}
      </button>
    </form>
  );
}

function RoomSettings({ room, onSave }: { room: Room; onSave: (p: Partial<Room>) => Promise<void> }) {
  const [form, setForm] = useState({
    name: room.name,
    cols: room.cols,
    rows: room.rows,
    background_url: room.background_url ?? "",
  });
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-2 border-t border-rule pt-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({
          name: form.name.trim() || room.name,
          cols: Math.max(5, Math.min(80, form.cols || room.cols)),
          rows: Math.max(5, Math.min(80, form.rows || room.rows)),
          background_url: form.background_url.trim() || null,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }}
    >
      <h2 className="font-display text-lg font-bold">Configurar mesa</h2>
      <label className="block">
        <span className="field-label">Nome</span>
        <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="field-label">Colunas</span>
          <input className="field" type="number" min={5} max={80} value={form.cols} onChange={(e) => setForm({ ...form, cols: Number(e.target.value) })} />
        </label>
        <label className="block">
          <span className="field-label">Linhas</span>
          <input className="field" type="number" min={5} max={80} value={form.rows} onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })} />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Imagem do mapa (URL)</span>
        <input
          className="field"
          value={form.background_url}
          onChange={(e) => setForm({ ...form, background_url: e.target.value })}
          placeholder="https://…/masmorra.jpg"
        />
      </label>
      <button className="btn btn-primary w-full">{saved ? "Mesa atualizada" : "Salvar configurações"}</button>
    </form>
  );
}

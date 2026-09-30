"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useUser } from "@/components/SessionProvider";
import { supabase } from "@/lib/supabase";
import { useRoomChannel } from "@/lib/mesa-canal";
import { initials, normalizeCharacter, rollFormula, uid } from "@/lib/dnd";
import { DEFAULT_TOKEN_STATS, MONSTERS, SIZE_CELLS, normalizeTokenStats, statsFromMonster, type MonsterDef } from "@/lib/monstros";
import { MonsterPanel } from "@/components/MonsterPanel";
import { TokenTooltip } from "@/components/TokenTooltip";
import { InitiativeTracker } from "@/components/InitiativeTracker";
import { DiceOverlay } from "@/components/DiceOverlay";
import { CharacterSheetModal } from "@/components/CharacterSheetModal";
import { SCENERY, statsFromScenery, type SceneryDef } from "@/lib/cenario";
import { toggleRageStats } from "@/lib/estados";
import { characterCombat } from "@/lib/personagem";
import { TableHud } from "@/components/mesa/TableHud";
import { Dock, type DockAction } from "@/components/mesa/Dock";
import { StageControls } from "@/components/mesa/StageControls";
import { WelcomeGuide } from "@/components/mesa/WelcomeGuide";
import { TokenCard } from "@/components/mesa/TokenCard";
import { HeroesPanel } from "@/components/mesa/HeroesPanel";
import { DicePanel } from "@/components/mesa/DicePanel";
import "@/components/mesa/mesa.css";
import type { Room, RollEntry, RollResult, Token, TokenStats } from "@/lib/types";

export default function MesaPage() {
  return (
    <RequireAuth>
      <GameTable />
    </RequireAuth>
  );
}

type Drag = { id: string; x: number; y: number; moved: boolean };
type SideTab = "acao" | "herois" | "dados" | "combate" | "mesa";
type CharOption = { id: string; name: string; hp_current: number; hp_max: number; ac: number; speed: number; class: string | null; level: number };

function GameTable() {
  const { id: roomId } = useParams<{ id: string }>();
  const { user, displayName } = useUser();

  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [myChars, setMyChars] = useState<CharOption[]>([]);
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [cell, setCell] = useState(50); // 50px por quadrado, como no tabuleiro físico
  const [selected, setSelected] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [bestiaryTab, setBestiaryTab] = useState<"monstros" | "cenario" | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [diceQueue, setDiceQueue] = useState<RollEntry[]>([]);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [charPicker, setCharPicker] = useState(false);
  const [tab, setTab] = useState<SideTab>("herois");
  const [guideOpen, setGuideOpen] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
        supabase.from("characters").select("id,name,hp_current,hp_max,ac,speed,class,level").eq("user_id", user.id).order("name"),
      ]);
      if (cancelled) return;
      if (!roomRes.data) return setStatus("missing");
      const r = roomRes.data as Room;
      setRoom({ ...r, turn_order: Array.isArray(r.turn_order) ? r.turn_order : [], current_turn: r.current_turn ?? 0, round: r.round ?? 1 });
      setTokens(((tokenRes.data as Token[]) ?? []).map((t) => ({ ...t, stats: normalizeTokenStats(t.stats) })));
      setMyChars((charRes.data as CharOption[]) ?? []);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, user.id]);

  // Primeira visita: mostra o passo a passo sozinho (uma vez por navegador)
  useEffect(() => {
    if (status !== "ready") return;
    if (!localStorage.getItem("taverna-mesa-guia-visto")) setGuideOpen(true);
  }, [status]);
  function closeGuide() {
    setGuideOpen(false);
    localStorage.setItem("taverna-mesa-guia-visto", "1");
  }

  // ---------- Realtime: Broadcast + Presence ----------
  const { send, connected, online } = useRoomChannel(roomId, user, displayName, {
    onTokenMove: ({ id, x, y }) => setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, x, y } : t))),
    onTokenAdd: (token) => {
      const t = { ...token, stats: normalizeTokenStats(token.stats) };
      setTokens((ts) => (ts.some((x) => x.id === t.id) ? ts : [...ts, t]));
    },
    onTokenAddBatch: (batch) => {
      const norm = batch.map((t) => ({ ...t, stats: normalizeTokenStats(t.stats) }));
      setTokens((ts) => [...ts, ...norm.filter((t) => !ts.some((x) => x.id === t.id))]);
    },
    onTokenUpdate: ({ id, stats }) => setTokens((ts) => ts.map((t) => (t.id === id ? { ...t, stats: { ...t.stats, ...stats } } : t))),
    onTokenRemove: ({ id }) => setTokens((ts) => ts.filter((t) => t.id !== id)),
    onRoll: (entry) => {
      setRolls((rs) => [entry, ...rs].slice(0, 60));
      setDiceQueue((q) => [...q, entry]);
    },
    onRoomUpdate: (r) => setRoom(r),
  });

  // ---------- Tokens: mover ----------
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

  function selectToken(id: string) {
    setSelected(id);
    setTab("acao");
  }

  function onTokenPointerDown(e: React.PointerEvent<HTMLButtonElement>, t: Token) {
    selectToken(t.id);
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
    selectToken(token.id);
    send("token-add", token);
  }

  /** Busca a ficha completa e calcula CA/ataques prontos, para o token nascer completo. */
  async function fetchCombatStats(characterId: string): Promise<TokenStats | null> {
    const { data: full } = await supabase.from("characters").select("*").eq("id", characterId).maybeSingle();
    if (!full) return null;
    const char = normalizeCharacter(full);
    const combat = characterCombat(char);
    return {
      ac: combat.ac,
      hp_current: char.hp_current,
      hp_max: char.hp_max,
      speed: char.speed,
      size: "medio",
      classKey: combat.classKey ?? undefined,
      level: combat.level,
      attacks: combat.attacks,
    };
  }

  /** Instancia N monstros do bestiário direto no mapa, com CA/PV/ataques prontos. */
  async function addMonster(m: MonsterDef, qty = 1) {
    if (!room) return;
    const span = SIZE_CELLS[m.size];
    const spots = freeSpots(span, qty);
    const rows = spots.map((spot, i) => ({
      room_id: room.id,
      owner_id: user.id,
      label: qty > 1 ? `${m.name} ${i + 1}` : m.name,
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
    setTokens((ts) => ts.filter((x) => x.id !== t.id));
    if (selected === t.id) setSelected(null);
    send("token-remove", { id: t.id });
    const { error } = await supabase.from("tokens").delete().eq("id", t.id);
    if (error) setError(`Não foi possível remover: ${error.message}`);
  }

  // ---------- Dados ----------
  function handleRoll(r: RollResult) {
    const entry: RollEntry = { ...r, id: uid(), author: displayName, authorId: user.id, at: Date.now() };
    setRolls((rs) => [entry, ...rs].slice(0, 60));
    setDiceQueue((q) => [...q, entry]);
    send("roll", entry);
  }

  /** Rola uma fórmula (ataque, dano…) e manda pro chat/histórico de todos, com animação. */
  function rollAndSend(label: string, formula: string) {
    const r = rollFormula(formula);
    if (!r) return;
    handleRoll({ ...r, label });
  }

  /** Liga/desliga a Fúria no token: gasta um uso ao ativar, aparece no mapa em tempo real. */
  function toggleRage(t: Token) {
    const next = toggleRageStats(t.stats);
    if (!next) return setError("Sem usos de Fúria — descanse para recuperar.");
    updateTokenStats(t, next);
  }

  // ---------- Configuração da mesa (mestre) ----------
  async function saveRoom(p: Partial<Room>) {
    if (!room) return;
    const next = { ...room, ...p };
    const { error } = await supabase
      .from("rooms")
      .update({ name: next.name, cols: next.cols, rows: next.rows, background_url: next.background_url })
      .eq("id", room.id);
    setRoom(next);
    send("room-update", next);
    if (error) setError(`Não foi possível salvar a mesa: ${error.message}`);
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

  function fitToScreen() {
    if (!room || !stageRef.current) return;
    const available = stageRef.current.clientWidth - 56;
    const fit = Math.floor(available / room.cols);
    setCell(Math.max(30, Math.min(100, fit)));
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

  function onDockAction(a: DockAction) {
    if (a === "monstros") return setBestiaryTab("monstros");
    if (a === "cenario") return setBestiaryTab("cenario");
    if (a === "ficha") return openMyCharacter();
    if (a === "ajuda") return setGuideOpen(true);
    setTab(a);
  }

  if (status === "loading") return <p className="p-8 text-dim">Abrindo a mesa…</p>;
  if (status === "missing" || !room)
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-2xl font-bold">Mesa não encontrada</h1>
        <p className="mt-2 text-dim">Confira o link com o mestre da mesa.</p>
        <Link href="/mesas" className="btn btn-primary mt-6">
          Voltar às mesas
        </Link>
      </div>
    );

  const gridLine = "rgb(90 58 36 / 0.32)";
  const bgLayers = [
    `linear-gradient(to right, ${gridLine} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,
    ...(room.background_url ? [`url("${room.background_url.replace(/"/g, "%22")}")`] : []),
  ];

  const TABS: { id: SideTab; icon: string; label: string }[] = [
    ...(selectedToken ? [{ id: "acao" as const, icon: "🎯", label: "Ação" }] : []),
    { id: "herois", icon: "🧙", label: "Heróis" },
    { id: "dados", icon: "🎲", label: "Dados" },
    { id: "combate", icon: "⚔️", label: "Combate" },
    ...(isGM ? [{ id: "mesa" as const, icon: "⚙️", label: "Mesa" }] : []),
  ];
  const currentTab = TABS.some((t) => t.id === tab) ? tab : "herois";

  return (
    <div className="mesa-root">
      <TableHud
        roomName={room.name}
        connected={connected}
        isGM={isGM}
        ownerId={room.owner_id}
        userId={user.id}
        online={online}
        copied={copied}
        charIdForUser={charIdForUser}
        onOpenSheet={setSheetId}
        onInvite={copyLink}
        onHelp={() => setGuideOpen(true)}
      />

      <div className="mesa-body">
        <Dock
          isGM={isGM}
          active={tab === "herois" || tab === "dados" ? tab : null}
          combatOpen={tab === "combate"}
          hasSheet={myChars.length > 0}
          onAction={onDockAction}
        />

        <div className="mesa-stage-wrap">
          {error && (
            <p className="mesa-alert" role="alert">
              ⚠️ {error}
              <button className="font-bold underline" onClick={() => setError("")}>
                Fechar
              </button>
            </p>
          )}

          <div ref={stageRef} className="mesa-stage">
            <div
              ref={boardRef}
              className="mesa-board"
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
                      selectToken(t.id);
                      setHoveredId(t.id);
                    }}
                    onBlur={() => setHoveredId((id) => (id === t.id ? null : id))}
                    className={`mesa-token ${isScenery ? "rounded-md" : "rounded-full"} ${isActiveTurn ? "token-active-turn is-turn" : ""} ${
                      mine ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                    }`}
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
                      zIndex: isSel ? 12 : isActiveTurn ? 6 : 2,
                    }}
                  >
                    {isScenery ? t.stats.icon ?? "❓" : initials(t.label)}
                    {!isScenery && t.stats.active_effects?.includes("rage") && (
                      <span className="rage-badge" aria-hidden title="Em fúria">
                        🔥
                      </span>
                    )}
                    {!isScenery && hpPct < 100 && (
                      <span className="mt-0.5 block h-1 w-2/3 overflow-hidden rounded-full bg-black/40" aria-hidden>
                        <span className={`block h-full ${hpPct <= 25 ? "bg-blood" : "bg-moss"}`} style={{ width: `${hpPct}%` }} />
                      </span>
                    )}
                    {cell >= 40 && <span className="mesa-token-name">{t.label}</span>}
                  </button>
                );
              })}
            </div>

            {tokens.length === 0 && (
              <div className="mesa-empty">
                <div className="mesa-empty-card">
                  <p className="text-3xl" aria-hidden>
                    🗺️
                  </p>
                  <p className="mt-1 font-display text-lg font-bold">O mapa está vazio</p>
                  <p className="mesa-hint mt-1">
                    Use “🧙 Heróis” para colocar seu personagem{isGM ? ", ou “🐉 Monstros” / “🌲 Cenário” para montar a cena" : ""}.
                  </p>
                </div>
              </div>
            )}
          </div>

          <StageControls cell={cell} onChange={setCell} onFit={fitToScreen} />
        </div>

        {/* ---------- Painel lateral por abas ---------- */}
        <aside className="mesa-side">
          <div className="mesa-tabs" role="tablist" aria-label="Painel da mesa">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={currentTab === t.id} className={`mesa-tab ${currentTab === t.id ? "is-active" : ""}`} onClick={() => setTab(t.id)}>
                <span className="mesa-tab-icon" aria-hidden>
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="mesa-panel">
            {currentTab === "acao" && selectedToken && (
              <TokenCard
                token={selectedToken}
                canControl={canControl(selectedToken)}
                ownerId={room.owner_id}
                userId={user.id}
                onUpdateStats={updateTokenStats}
                onToggleRage={toggleRage}
                onRoll={rollAndSend}
                onRemove={removeToken}
              />
            )}

            {currentTab === "herois" && (
              <div className="mesa-stack">
                <div className="mesa-card">
                  <p className="mesa-h">👥 Na mesa agora ({online.length})</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {online.map((p) => (
                      <li key={p.user_id} className="rounded-full bg-white/50 px-3 py-1 text-sm font-semibold shadow-[0_0_0_1px_var(--color-rule)]">
                        <span className="mr-1 text-moss">●</span>
                        {p.name}
                        {p.user_id === room.owner_id && <span className="text-dim"> (mestre)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <HeroesPanel characters={myChars} onAdd={addToken} fetchCombat={fetchCombatStats} />
              </div>
            )}

            {currentTab === "dados" && <DicePanel onRoll={handleRoll} rolls={rolls} />}

            {currentTab === "combate" && <InitiativeTracker room={room} tokens={tokens} isGM={isGM} onChange={updateTurns} />}

            {currentTab === "mesa" && isGM && <RoomSettings room={room} onSave={saveRoom} />}
          </div>
        </aside>
      </div>

      {hoveredId &&
        (() => {
          const t = tokens.find((x) => x.id === hoveredId);
          return t ? <TokenTooltip token={t} x={hoverPos.x} y={hoverPos.y} /> : null;
        })()}

      <MonsterPanel
        open={bestiaryTab !== null}
        initialTab={bestiaryTab ?? undefined}
        onClose={() => setBestiaryTab(null)}
        onAddMonster={addMonster}
        onAddScenery={addScenery}
      />

      {charPicker && (
        <div className="my-sheet-fab">
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
        </div>
      )}

      <WelcomeGuide open={guideOpen} isGM={isGM} onClose={closeGuide} />
      <CharacterSheetModal characterId={sheetId} onClose={() => setSheetId(null)} />
      <DiceOverlay roll={diceQueue[0] ?? null} onDone={() => setDiceQueue((q) => q.slice(1))} />
    </div>
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
      className="mesa-card"
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
      <p className="mesa-h">⚙️ Configurar a mesa</p>
      <div className="mt-2 space-y-2.5">
        <label className="block">
          <span className="mesa-label">Nome da mesa</span>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mesa-label">Colunas</span>
            <input className="field" type="number" min={5} max={80} value={form.cols} onChange={(e) => setForm({ ...form, cols: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className="mesa-label">Linhas</span>
            <input className="field" type="number" min={5} max={80} value={form.rows} onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })} />
          </label>
        </div>
        <label className="block">
          <span className="mesa-label">Imagem do mapa (URL)</span>
          <input
            className="field"
            value={form.background_url}
            onChange={(e) => setForm({ ...form, background_url: e.target.value })}
            placeholder="https://…/masmorra.jpg"
          />
        </label>
        <button className="btn btn-primary w-full">{saved ? "✅ Mesa atualizada" : "Salvar configurações"}</button>
      </div>
    </form>
  );
}

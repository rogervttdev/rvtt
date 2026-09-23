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
import type { PresenceUser, Room, RollEntry, RollResult, Token } from "@/lib/types";

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
  const [myChars, setMyChars] = useState<{ id: string; name: string }[]>([]);
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [cell, setCell] = useState(48);
  const [selected, setSelected] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
        supabase.from("characters").select("id,name").eq("owner_id", user.id).order("name"),
      ]);
      if (cancelled) return;
      if (!roomRes.data) return setStatus("missing");
      setRoom(roomRes.data as Room);
      setTokens((tokenRes.data as Token[]) ?? []);
      setMyChars((charRes.data as { id: string; name: string }[]) ?? []);
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
        const token = payload as Token;
        setTokens((ts) => (ts.some((t) => t.id === token.id) ? ts : [...ts, token]));
      })
      .on("broadcast", { event: "token-remove" }, ({ payload }) => {
        const { id } = payload as { id: string };
        setTokens((ts) => ts.filter((t) => t.id !== id));
      })
      .on("broadcast", { event: "roll" }, ({ payload }) => {
        setRolls((rs) => [payload as RollEntry, ...rs].slice(0, 60));
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

  function cellFromPointer(clientX: number, clientY: number) {
    const rect = boardRef.current!.getBoundingClientRect();
    const cols = room?.cols ?? 1;
    const rows = room?.rows ?? 1;
    return {
      x: Math.max(0, Math.min(cols - 1, Math.floor((clientX - rect.left) / cell))),
      y: Math.max(0, Math.min(rows - 1, Math.floor((clientY - rect.top) / cell))),
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
    const { x, y } = cellFromPointer(e.clientX, e.clientY);
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
    const x = Math.max(0, Math.min(room.cols - 1, t.x + d[0]));
    const y = Math.max(0, Math.min(room.rows - 1, t.y + d[1]));
    moveToken(t.id, x, y);
    persistPosition(t.id, x, y);
  }

  async function addToken(input: { label: string; color: string; character_id: string | null }) {
    if (!room) return;
    const occupied = new Set(tokens.map((t) => `${t.x},${t.y}`));
    let spot = { x: 0, y: 0 };
    outer: for (let y = 0; y < room.rows; y++)
      for (let x = 0; x < room.cols; x++)
        if (!occupied.has(`${x},${y}`)) {
          spot = { x, y };
          break outer;
        }

    const { data, error } = await supabase
      .from("tokens")
      .insert({ room_id: room.id, owner_id: user.id, ...input, ...spot })
      .select("*")
      .single();
    if (error) return setError(`Não foi possível criar o token: ${error.message}`);
    const token = data as Token;
    setTokens((ts) => [...ts, token]);
    setSelected(token.id);
    send("token-add", token);
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

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const selectedToken = useMemo(() => tokens.find((t) => t.id === selected) ?? null, [tokens, selected]);

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
            <input type="range" min={24} max={96} step={4} value={cell} onChange={(e) => setCell(Number(e.target.value))} />
          </label>
          <button className="btn btn-ghost border border-rule" onClick={copyLink}>
            {copied ? "Link copiado" : "Copiar convite"}
          </button>
        </div>

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
          >
            {tokens.map((t) => {
              const isSel = t.id === selected;
              const mine = canControl(t);
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  aria-label={`${t.label}, coluna ${t.x + 1}, linha ${t.y + 1}${mine ? ". Use as setas para mover." : ""}`}
                  onPointerDown={(e) => onTokenPointerDown(e, t)}
                  onPointerMove={onTokenPointerMove}
                  onPointerUp={onTokenPointerUp}
                  onPointerCancel={onTokenPointerUp}
                  onKeyDown={(e) => onTokenKeyDown(e, t)}
                  onFocus={() => setSelected(t.id)}
                  className={`absolute flex items-center justify-center rounded-full font-display font-bold text-[#fbeed3] ${
                    mine ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                  }`}
                  style={{
                    left: t.x * cell + cell * 0.08,
                    top: t.y * cell + cell * 0.08,
                    width: cell * 0.84,
                    height: cell * 0.84,
                    fontSize: cell * 0.32,
                    background: t.color,
                    border: `${Math.max(2, cell * 0.05)}px solid ${isSel ? "#2a1c12" : "#f6ecd4"}`,
                    boxShadow: isSel ? "0 0 0 3px rgb(195 154 78 / .8), 0 4px 10px rgb(42 28 18 / .45)" : "0 2px 4px rgb(42 28 18 / .45)",
                    transition: draggingId === t.id ? "none" : "left 110ms ease-out, top 110ms ease-out",
                    touchAction: "none",
                    zIndex: isSel ? 10 : 1,
                  }}
                >
                  {initials(t.label)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------- Painel lateral ---------- */}
      <aside className="w-full shrink-0 space-y-6 overflow-y-auto border-l border-rule bg-paper p-4 lg:w-[340px]">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold">Na mesa ({online.length})</h2>
          <ul className="flex flex-wrap gap-1.5">
            {online.map((p) => (
              <li key={p.user_id} className="rounded-full bg-vellum px-3 py-1 text-sm shadow-[0_0_0_1px_var(--color-rule)]">
                <span className="mr-1 text-moss">●</span>
                {p.name}
                {p.user_id === room.owner_id && <span className="text-dim"> (mestre)</span>}
              </li>
            ))}
          </ul>
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
    </div>
  );
}

function AddTokenForm({
  characters,
  onAdd,
}: {
  characters: { id: string; name: string }[];
  onAdd: (t: { label: string; color: string; character_id: string | null }) => Promise<void>;
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
    await onAdd({ label: finalLabel, color, character_id: char?.id ?? null });
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

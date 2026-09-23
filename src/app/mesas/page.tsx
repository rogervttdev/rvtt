"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useUser } from "@/components/SessionProvider";
import { supabase } from "@/lib/supabase";
import type { Room } from "@/lib/types";

export default function MesasPage() {
  return (
    <RequireAuth>
      <RoomList />
    </RequireAuth>
  );
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function RoomList() {
  const { user } = useUser();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [form, setForm] = useState({ name: "", cols: 24, rows: 16 });
  const [join, setJoin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("rooms")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setRooms((data as Room[]) ?? []);
      });
  }, [user.id]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        owner_id: user.id,
        name: form.name.trim() || "Nova mesa",
        cols: clamp(form.cols, 5, 80),
        rows: clamp(form.rows, 5, 80),
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) return setError(error.message);
    router.push(`/mesa/${data.id}`);
  }

  async function remove(r: Room) {
    if (!confirm(`Excluir a mesa "${r.name}" e todos os tokens dela?`)) return;
    const { error } = await supabase.from("rooms").delete().eq("id", r.id);
    if (error) return setError(error.message);
    setRooms((rs) => rs?.filter((x) => x.id !== r.id) ?? null);
  }

  function enter(e: React.FormEvent) {
    e.preventDefault();
    const match = join.match(UUID);
    if (!match) return setError("Cole o link da mesa ou o código dela (formato xxxxxxxx-xxxx-…).");
    router.push(`/mesa/${match[0]}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">Mesas</h1>
      <p className="text-dim">Crie uma mesa como mestre ou entre na de alguém pelo link.</p>

      {error && <p className="mt-4 text-sm text-blood" role="alert">{error}</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form onSubmit={create} className="panel space-y-3 p-5">
          <h2 className="font-display text-xl font-bold">Nova mesa</h2>
          <label className="block">
            <span className="field-label">Nome</span>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="A Mina Perdida de Phandelver" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="field-label">Colunas</span>
              <input className="field" type="number" min={5} max={80} value={form.cols} onChange={(e) => setForm({ ...form, cols: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className="field-label">Linhas</span>
              <input className="field" type="number" min={5} max={80} value={form.rows} onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })} />
            </label>
          </div>
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? "Criando…" : "Criar e abrir mesa"}
          </button>
        </form>

        <form onSubmit={enter} className="panel space-y-3 p-5">
          <h2 className="font-display text-xl font-bold">Entrar numa mesa</h2>
          <label className="block">
            <span className="field-label">Link ou código</span>
            <input className="field" value={join} onChange={(e) => setJoin(e.target.value)} placeholder="https://…/mesa/…" />
          </label>
          <button className="btn btn-ghost w-full border border-module-soft">Entrar</button>
        </form>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold">Mesas que você mestra</h2>
      {rooms === null ? (
        <p className="mt-3 text-dim">Carregando…</p>
      ) : rooms.length === 0 ? (
        <p className="mt-3 text-dim">Você ainda não criou nenhuma mesa.</p>
      ) : (
        <ul className="mt-3 divide-y divide-module-soft overflow-hidden rounded-lg border border-module-soft bg-white">
          {rooms.map((r) => (
            <li key={r.id} className="flex items-center gap-4 px-4 py-3 hover:bg-paper">
              <Link href={`/mesa/${r.id}`} className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg font-bold">{r.name}</span>
                <span className="block text-sm text-dim">
                  Grid {r.cols} × {r.rows}
                </span>
              </Link>
              <Link href={`/mesa/${r.id}`} className="btn btn-primary">Abrir</Link>
              <button className="btn btn-danger" onClick={() => remove(r)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(n) || min));

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useUser } from "@/components/SessionProvider";
import { supabase } from "@/lib/supabase";
import { deleteAvatar } from "@/lib/avatar";
import { initials, normalizeCharacter } from "@/lib/dnd";
import type { Character } from "@/lib/types";

export default function FichasPage() {
  return (
    <RequireAuth>
      <CharacterList />
    </RequireAuth>
  );
}

function CharacterList() {
  const { user } = useUser();
  const router = useRouter();
  const [chars, setChars] = useState<Character[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase
      .from("characters")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setChars((data ?? []).map(normalizeCharacter));
      });
  }, [user.id]);

  async function create() {
    setCreating(true);
    const { data, error } = await supabase
      .from("characters")
      .insert({ user_id: user.id, name: "Novo personagem" })
      .select("id")
      .single();
    setCreating(false);
    if (error) return setError(error.message);
    router.push(`/fichas/${data.id}`);
  }

  async function remove(c: Character) {
    if (!confirm(`Excluir a ficha de ${c.name}? Isso não pode ser desfeito.`)) return;
    const { error } = await supabase.from("characters").delete().eq("id", c.id);
    if (error) return setError(error.message);
    deleteAvatar(c.avatar_url).catch(() => {});
    setChars((cs) => cs?.filter((x) => x.id !== c.id) ?? null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Fichas</h1>
          <p className="text-dim">Os heróis que você trouxe para a taverna. Toque em um para editar.</p>
        </div>
        <button className="btn btn-primary" onClick={create} disabled={creating}>
          {creating ? "Criando…" : "Criar personagem"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-blood" role="alert">{error}</p>}

      {chars === null ? (
        <p className="mt-8 text-dim">Carregando fichas…</p>
      ) : chars.length === 0 ? (
        <div className="parchment-grid mt-8 rounded-lg border border-dashed border-brass-deep p-10 text-center">
          <p className="font-display text-2xl font-bold text-ember-deep">Nenhum herói por aqui ainda.</p>
          <p className="mt-1 text-dim">Toque em “Criar personagem” e dê um nome ao seu herói. O resto você preenche aos poucos.</p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-vellum">
          {chars.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-paper">
              <Link href={`/fichas/${c.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <span className="relative">
                  {c.avatar_url ? (
                    <span className="portrait-thumb block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <span className="portrait-thumb flex items-center justify-center font-display text-lg font-bold text-brass-deep">
                      {initials(c.name)}
                    </span>
                  )}
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#5f200c] bg-ember text-xs font-bold text-foam" title={`${c.level}º nível`}>
                    {c.level}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-lg font-bold">{c.name}</span>
                  <span className="block truncate text-sm text-dim">
                    {[c.details.subrace || c.race, c.class].filter(Boolean).join(", ") || "Raça e classe ainda não escolhidas"} · {c.level}º nível
                  </span>
                </span>
              </Link>
              <span className="hidden text-right text-sm sm:block">
                <span className="block font-bold">
                  {c.hp_current}/{c.hp_max} PV
                </span>
                <span className="block text-dim">CA {c.ac}</span>
              </span>
              <button className="btn btn-danger" onClick={() => remove(c)} aria-label={`Excluir ${c.name}`}>
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

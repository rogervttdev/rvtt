"use client";

import Link from "next/link";
import { useSession } from "@/components/SessionProvider";
import { AuthForm } from "@/components/AuthForm";
import { ConfigWarning } from "@/components/ConfigWarning";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Home() {
  const { user, loading, displayName } = useSession();

  return (
    <div>
      <section className="graph-paper border-b border-module-soft">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-module-deep sm:text-5xl">
              Suas fichas e sua mesa, no mesmo mapa.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink">
              Crie personagens de D&amp;D 5e, abra uma mesa com grid e jogue com o grupo: tokens e dados aparecem para
              todos na hora.
            </p>
          </div>

          <div className="panel p-6 shadow-sm">
            {!isSupabaseConfigured ? (
              <ConfigWarning />
            ) : loading ? (
              <p className="text-dim">Carregando…</p>
            ) : user ? (
              <div className="space-y-4">
                <p className="font-display text-2xl font-bold">Bem-vindo de volta, {displayName}.</p>
                <div className="grid gap-2">
                  <Link href="/fichas" className="btn btn-primary">Abrir minhas fichas</Link>
                  <Link href="/mesas" className="btn btn-ghost border border-module-soft">Ir para as mesas</Link>
                </div>
              </div>
            ) : (
              <AuthForm />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

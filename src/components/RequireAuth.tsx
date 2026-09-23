"use client";

import { useSession } from "./SessionProvider";
import { AuthForm } from "./AuthForm";
import { ConfigWarning } from "./ConfigWarning";
import { isSupabaseConfigured } from "@/lib/supabase";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  if (!isSupabaseConfigured) return <ConfigWarning />;
  if (loading) return <p className="p-8 text-dim">Carregando…</p>;
  if (!user)
    return (
      <div className="px-4 py-12">
        <h1 className="mb-6 text-center font-display text-3xl font-bold">Entre para continuar</h1>
        <AuthForm />
      </div>
    );
  return <>{children}</>;
}

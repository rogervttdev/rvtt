"use client";

import { useSession } from "./SessionProvider";
import { AuthForm } from "./AuthForm";
import { ConfigWarning } from "./ConfigWarning";
import { isSupabaseConfigured } from "@/lib/supabase";
import { TavernLogo } from "./Logo";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  if (!isSupabaseConfigured) return <ConfigWarning />;
  if (loading) return <p className="p-8 text-dim">Acendendo as velas…</p>;
  if (!user)
    return (
      <div className="tavern-wood min-h-[calc(100dvh-3.5rem)] px-4 py-12">
        <div className="mb-4 flex justify-center">
          <TavernLogo size={112} priority className="drop-shadow-[0_10px_18px_rgb(0_0_0/0.55)]" />
        </div>
        <h1 className="mb-2 text-center font-display text-4xl font-bold text-brass-light">A porta está logo ali</h1>
        <p className="mb-8 text-center text-foam/80">Entre ou crie sua conta para continuar.</p>
        <div className="parchment-card mx-auto max-w-sm p-6">
          <AuthForm />
        </div>
      </div>
    );
  return <>{children}</>;
}

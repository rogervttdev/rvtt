"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type SessionContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  displayName: string;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  loading: true,
  displayName: "",
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      setUsername(null);
      return;
    }
    supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setUsername(data?.username ?? null));
  }, [userId]);

  const user = session?.user ?? null;
  const displayName =
    username ||
    (user?.user_metadata?.username as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <SessionContext.Provider value={{ session, user, loading, displayName }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);

/** Use somente dentro de <RequireAuth>, onde o usuário já está garantido. */
export function useUser() {
  const ctx = useContext(SessionContext);
  if (!ctx.user) throw new Error("useUser precisa estar dentro de <RequireAuth>");
  return { user: ctx.user, displayName: ctx.displayName };
}

import { createClient, type SupportedStorage } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** false quando as variáveis de ambiente não foram configuradas (a UI mostra um aviso). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// ---------- "Lembrar de mim" ----------
// Marcado: a sessão fica no localStorage e sobrevive ao fechar o navegador.
// Desmarcado: a sessão fica no sessionStorage e termina quando a aba/navegador é fechado.
const REMEMBER_KEY = "taverna:lembrar";
const EMAIL_KEY = "taverna:email";
const hasWindow = () => typeof window !== "undefined";

export function getRememberMe(): boolean {
  if (!hasWindow()) return true;
  try {
    return localStorage.getItem(REMEMBER_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setRememberMe(remember: boolean, email?: string) {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
    if (remember && email) localStorage.setItem(EMAIL_KEY, email);
    if (!remember) localStorage.removeItem(EMAIL_KEY);
  } catch {
    /* navegador sem storage: segue sem lembrar */
  }
}

/** E-mail salvo da última vez que a pessoa marcou "Lembrar de mim". */
export function getSavedEmail(): string {
  if (!hasWindow()) return "";
  try {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

const rememberAwareStorage: SupportedStorage = {
  getItem(key) {
    if (!hasWindow()) return null;
    try {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    if (!hasWindow()) return;
    try {
      if (getRememberMe()) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      }
    } catch {
      /* ignora */
    }
  },
  removeItem(key) {
    if (!hasWindow()) return;
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      /* ignora */
    }
  },
};

// Os valores de fallback só existem para que o build na Vercel não quebre
// caso as variáveis ainda não tenham sido cadastradas.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: rememberAwareStorage,
    },
    realtime: {
      params: { eventsPerSecond: 20 },
    },
  },
);

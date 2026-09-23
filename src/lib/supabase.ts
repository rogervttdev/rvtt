import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** false quando as variáveis de ambiente não foram configuradas (a UI mostra um aviso). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

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
    },
    realtime: {
      params: { eventsPerSecond: 20 },
    },
  },
);

export function ConfigWarning() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold">A taverna ainda não abriu as portas</h1>
      <p className="mt-3 leading-relaxed text-dim">
        Falta conectar o Supabase. Cadastre <code className="rounded bg-rule/60 px-1">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
        <code className="rounded bg-rule/60 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo{" "}
        <code className="rounded bg-rule/60 px-1">.env.local</code> ou nas variáveis de ambiente da Vercel e faça um novo deploy.
      </p>
    </div>
  );
}

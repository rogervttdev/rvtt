"use client";

import { useEffect, useState } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";

export function AuthForm() {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);

  // Se o Google (ou o Supabase) devolver um erro na URL, mostra na caixa de login
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    const desc = params.get("error_description");
    if (desc) setError(traduzir(desc.replace(/\+/g, " ")));
  }, []);

  async function google() {
    setGoogleBusy(true);
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      setError(traduzir(error.message));
      setGoogleBusy(false);
    }
    // Sem erro, o navegador já está indo para o Google.
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduzir(error.message));
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() || email.split("@")[0] },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) setError(traduzir(error.message));
      else if (!data.session) setInfo("Conta criada! Abra o link que enviamos para o seu e-mail e depois volte para entrar.");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 flex rounded-lg border border-rule bg-paper/70 p-1 shadow-[inset_0_1px_3px_rgb(90_58_36/0.25)]" role="tablist">
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-semibold sm:text-base ${
              mode === m
                ? "bg-ember text-foam shadow-[inset_0_1px_0_rgb(255_215_170/0.35),0_1px_2px_rgb(0_0_0/0.3)]"
                : "text-dim hover:text-ink"
            }`}
          >
            {m === "entrar" ? "Já tenho conta" : "Sou novo aqui"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "criar" && (
          <label className="block">
            <span className="field-label">Nome na mesa</span>
            <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Como o grupo vai te chamar" />
          </label>
        )}
        <label className="block">
          <span className="field-label">E-mail</span>
          <input className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="field-label">Senha</span>
          <input
            className="field"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-blood" role="alert">{error}</p>}
        {info && <p className="text-sm text-moss" role="status">{info}</p>}
        {mode === "criar" && !info && (
          <p className="text-sm text-dim">Grátis e sem compromisso. Só usamos seu e-mail para você entrar.</p>
        )}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Um instante…" : mode === "entrar" ? "Entrar na taverna" : "Criar minha conta"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-sm text-dim" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-brass-deep/60 to-brass-deep/60" />
        <span className="font-display text-base">ou</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-brass-deep/60 to-brass-deep/60" />
      </div>

      <button type="button" className="btn btn-google w-full" onClick={google} disabled={googleBusy || busy}>
        <span className="google-seal">
          <GoogleIcon />
        </span>
        <span className="flex-1 text-center">{googleBusy ? "Abrindo o Google…" : "Entrar com o Google"}</span>
      </button>
      <p className="mt-2 text-center text-xs text-dim">Serve tanto para entrar quanto para criar sua conta.</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function traduzir(msg: string) {
  if (/provider is not enabled|unsupported provider/i.test(msg))
    return "O login com o Google ainda não foi ativado no Supabase (Authentication → Providers → Google).";
  if (/access_denied|denied/i.test(msg)) return "O login com o Google foi cancelado.";
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Use a aba Entrar.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}

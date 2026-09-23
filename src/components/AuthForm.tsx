"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function AuthForm() {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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
      else if (!data.session) setInfo("Conta criada. Abra o link que enviamos para o seu e-mail e depois entre aqui.");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 flex rounded-md border border-module-soft bg-white p-1" role="tablist">
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded px-3 py-1.5 text-sm font-semibold ${
              mode === m ? "bg-module text-white" : "text-dim hover:text-ink"
            }`}
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "criar" && (
          <label className="block">
            <span className="field-label">Nome na mesa</span>
            <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Como os outros vão te ver" />
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
        {info && <p className="text-sm text-module-deep" role="status">{info}</p>}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}

function traduzir(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Use a aba Entrar.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}

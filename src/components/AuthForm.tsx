"use client";

import { useEffect, useState } from "react";
import { supabase, getRememberMe, getSavedEmail, setRememberMe } from "@/lib/supabase";
import { PasswordInput } from "./PasswordInput";

type Mode = "entrar" | "criar";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Recupera a preferência e o e-mail salvos (só no navegador)
  useEffect(() => {
    setRemember(getRememberMe());
    const saved = getSavedEmail();
    if (saved) setEmail(saved);
  }, []);

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    // Precisa ser gravado ANTES do login, para a sessão ir para o armazenamento certo
    setRememberMe(remember, email);

    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduzir(error.message));
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() || email.split("@")[0] } },
      });
      if (error) {
        setError(traduzir(error.message));
      } else if (data.user && data.user.identities?.length === 0) {
        setError("Esse e-mail já tem conta. Use a aba “Já tenho conta”.");
      } else if (!data.session) {
        // Só acontece se "Confirm email" continuar ligado no Supabase
        setInfo(
          "Conta criada, mas o Supabase ainda está pedindo confirmação por e-mail. Desligue “Confirm email” em Authentication → Providers → Email para o acesso ser imediato.",
        );
      }
      // Com sessão, a pessoa já está dentro: o app atualiza sozinho.
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 flex rounded-lg border border-rule bg-paper/70 p-1 shadow-[inset_0_1px_3px_rgb(90_58_36/0.25)]" role="tablist">
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
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
            <input
              className="field"
              autoComplete="nickname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Como o grupo vai te chamar"
            />
          </label>
        )}

        <label className="block">
          <span className="field-label">E-mail</span>
          <input
            className="field"
            type="email"
            name="email"
            required
            autoComplete={mode === "entrar" ? "username" : "email"}
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
          />
        </label>

        <div>
          <label htmlFor="senha" className="field-label">
            Senha
          </label>
          <PasswordInput
            id="senha"
            name="password"
            required
            minLength={6}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "criar" && <p className="mt-1 text-xs text-dim">Pelo menos 6 caracteres.</p>}
        </div>

        <label className="remember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span className="remember-box" aria-hidden>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="block font-semibold">Lembrar de mim</span>
            <span className="block text-xs text-dim">
              {remember ? "Você continua conectado mesmo fechando o navegador." : "A sessão termina ao fechar o navegador."}
            </span>
          </span>
        </label>

        {error && <p className="text-sm text-blood" role="alert">{error}</p>}
        {info && <p className="text-sm text-ember-deep" role="status">{info}</p>}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Um instante…" : mode === "entrar" ? "Entrar na taverna" : "Criar conta e entrar"}
        </button>
      </form>
    </div>
  );
}

function traduzir(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg))
    return "Esta conta foi criada quando a confirmação por e-mail ainda estava ligada. Confirme pelo e-mail recebido ou peça ao administrador para confirmá-la no Supabase.";
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Use a aba “Já tenho conta”.";
  if (/rate limit|security purposes|too many/i.test(msg)) return "Muitas tentativas em pouco tempo. Espere um minuto e tente de novo.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}

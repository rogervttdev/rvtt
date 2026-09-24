"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Step = "entrar" | "criar" | "confirmar";

export function AuthForm() {
  const [step, setStep] = useState<Step>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Contagem regressiva para reenviar o código
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function goTo(next: Step) {
    setStep(next);
    setError("");
    setInfo("");
  }

  function openConfirm(message?: string) {
    setCode("");
    setStep("confirmar");
    setError("");
    setInfo(message ?? "");
    setCooldown(60);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    if (step === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (/email not confirmed/i.test(error.message)) {
          // Conta existe mas não foi confirmada: manda um novo código e abre a etapa de confirmação
          await supabase.auth.resend({ type: "signup", email });
          openConfirm("Sua conta ainda não foi confirmada. Enviamos um novo código.");
        } else {
          setError(traduzir(error.message));
        }
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() || email.split("@")[0] },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(traduzir(error.message));
      } else if (data.user && data.user.identities?.length === 0) {
        // O Supabase devolve um usuário sem identidades quando o e-mail já está cadastrado e confirmado
        setError("Esse e-mail já tem conta. Use a aba “Já tenho conta”.");
      } else if (!data.session) {
        openConfirm();
      }
      // Se vier sessão, a confirmação por e-mail está desligada no Supabase e a pessoa já entrou.
    }
    setBusy(false);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) return setError("O código tem 6 dígitos. Confira o e-mail e digite todos.");
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
    setBusy(false);
    if (error) setError(traduzir(error.message));
    // Sem erro, a sessão é criada e o app libera o acesso sozinho.
  }

  async function resend() {
    setError("");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return setError(traduzir(error.message));
    setInfo("Outra coruja levantou voo. Confira também a caixa de spam.");
    setCooldown(60);
  }

  // ---------- Etapa de confirmação ----------
  if (step === "confirmar") {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <OwlMessenger />
        <h3 className="mt-3 font-display text-2xl font-bold leading-tight">Uma coruja mensageira foi enviada!</h3>
        <p className="mt-2 leading-relaxed text-dim">
          Ela levou um código de confirmação para <strong className="text-ink [overflow-wrap:anywhere]">{email}</strong>. Digite o
          código abaixo para entrar na Taverna.
        </p>

        <form onSubmit={verify} className="mt-5 space-y-3 text-left">
          <label className="block">
            <span className="field-label text-center">Código de confirmação</span>
            <input
              className="field code-field"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={10}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
              aria-describedby="code-help"
            />
          </label>
          <p id="code-help" className="text-center text-xs text-dim">
            O código vale por pouco tempo. Se não chegar em alguns minutos, olhe a pasta de spam.
          </p>

          {error && <p className="text-center text-sm text-blood" role="alert">{error}</p>}
          {info && <p className="text-center text-sm text-moss" role="status">{info}</p>}

          <button className="btn btn-primary w-full" disabled={busy || code.length < 6}>
            {busy ? "Conferindo o selo…" : "Confirmar e entrar"}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-1 text-sm">
          <button className="font-semibold text-ember-deep hover:underline disabled:text-dim disabled:no-underline" onClick={resend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Reenviar código em ${cooldown}s` : "Reenviar código"}
          </button>
          <button className="text-dim hover:text-ink hover:underline" onClick={() => goTo("criar")}>
            Usei o e-mail errado
          </button>
        </div>
      </div>
    );
  }

  // ---------- Entrar / Criar conta ----------
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 flex rounded-lg border border-rule bg-paper/70 p-1 shadow-[inset_0_1px_3px_rgb(90_58_36/0.25)]" role="tablist">
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={step === m}
            onClick={() => goTo(m)}
            className={`flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-semibold sm:text-base ${
              step === m
                ? "bg-ember text-foam shadow-[inset_0_1px_0_rgb(255_215_170/0.35),0_1px_2px_rgb(0_0_0/0.3)]"
                : "text-dim hover:text-ink"
            }`}
          >
            {m === "entrar" ? "Já tenho conta" : "Sou novo aqui"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {step === "criar" && (
          <label className="block">
            <span className="field-label">Nome na mesa</span>
            <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Como o grupo vai te chamar" />
          </label>
        )}
        <label className="block">
          <span className="field-label">E-mail</span>
          <input className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} />
        </label>
        <label className="block">
          <span className="field-label">Senha</span>
          <input
            className="field"
            type="password"
            required
            minLength={6}
            autoComplete={step === "entrar" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-blood" role="alert">{error}</p>}
        {info && <p className="text-sm text-moss" role="status">{info}</p>}
        {step === "criar" && !error && (
          <p className="text-sm text-dim">Vamos mandar um código de 6 dígitos para o seu e-mail para confirmar que é você.</p>
        )}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Um instante…" : step === "entrar" ? "Entrar na taverna" : "Criar minha conta"}
        </button>
      </form>

      {step === "entrar" && (
        <p className="mt-4 text-center text-sm text-dim">
          Criou a conta e não confirmou?{" "}
          <button
            className="font-semibold text-ember-deep hover:underline"
            onClick={async () => {
              if (!email) return setError("Digite seu e-mail acima para receber um novo código.");
              await supabase.auth.resend({ type: "signup", email });
              openConfirm("Enviamos um novo código para o seu e-mail.");
            }}
          >
            Digitar o código
          </button>
        </p>
      )}
    </div>
  );
}

/** Coruja com um envelope lacrado no bico */
function OwlMessenger() {
  return (
    <svg viewBox="0 0 120 96" className="mx-auto h-24 w-auto" aria-hidden>
      <ellipse cx="60" cy="90" rx="34" ry="4" fill="#8d6a2c" opacity=".25" />
      {/* asas */}
      <path d="M30 48c-14 4-22 16-24 30 10-4 18-10 26-18z" fill="#6b4428" stroke="#2a1c12" strokeWidth="2" />
      <path d="M90 48c14 4 22 16 24 30-10-4-18-10-26-18z" fill="#6b4428" stroke="#2a1c12" strokeWidth="2" />
      {/* corpo */}
      <path d="M60 18c-18 0-30 12-30 32 0 20 12 34 30 34s30-14 30-34c0-20-12-32-30-32z" fill="#8a5a33" stroke="#2a1c12" strokeWidth="2" />
      <path d="M60 50c-10 0-17 8-17 18 0 8 7 14 17 14s17-6 17-14c0-10-7-18-17-18z" fill="#e6c987" opacity=".8" />
      <path d="M50 64l4 3M58 62l2 4M66 64l-3 3M54 72l3 2M64 72l-3 2" stroke="#8d6a2c" strokeWidth="1.6" strokeLinecap="round" />
      {/* orelhas */}
      <path d="M36 26l-4-12 12 8zM84 26l4-12-12 8z" fill="#6b4428" stroke="#2a1c12" strokeWidth="2" strokeLinejoin="round" />
      {/* olhos */}
      <circle cx="48" cy="36" r="10" fill="#fbeed3" stroke="#2a1c12" strokeWidth="2" />
      <circle cx="72" cy="36" r="10" fill="#fbeed3" stroke="#2a1c12" strokeWidth="2" />
      <circle cx="49" cy="37" r="4.5" fill="#2a1c12" />
      <circle cx="71" cy="37" r="4.5" fill="#2a1c12" />
      <circle cx="50.5" cy="35.5" r="1.4" fill="#fff" />
      <circle cx="72.5" cy="35.5" r="1.4" fill="#fff" />
      {/* envelope no bico */}
      <g transform="translate(46 44) rotate(-6)">
        <rect width="30" height="20" rx="2" fill="#fbf4e2" stroke="#2a1c12" strokeWidth="1.8" />
        <path d="M1 2l14 10L29 2" fill="none" stroke="#2a1c12" strokeWidth="1.6" />
        <circle cx="15" cy="12" r="4" fill="#a8431f" stroke="#5f200c" strokeWidth="1" />
      </g>
      <path d="M57 42l3 5 3-5z" fill="#c39a4e" stroke="#2a1c12" strokeWidth="1.4" strokeLinejoin="round" />
      {/* patas */}
      <path d="M52 84v4M56 84v4M64 84v4M68 84v4" stroke="#8d6a2c" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function traduzir(msg: string) {
  if (/token has expired|invalid|otp/i.test(msg) && /token|otp/i.test(msg))
    return "Código inválido ou expirado. Confira os números ou peça um novo código.";
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Use a aba “Já tenho conta”.";
  if (/rate limit|security purposes|too many/i.test(msg))
    return "Muitas tentativas em pouco tempo. Espere um minuto e tente de novo.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}

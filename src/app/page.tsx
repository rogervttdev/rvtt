"use client";

import Link from "next/link";
import { useSession } from "@/components/SessionProvider";
import { AuthForm } from "@/components/AuthForm";
import { ConfigWarning } from "@/components/ConfigWarning";
import { TavernLogo } from "@/components/Logo";
import { isSupabaseConfigured } from "@/lib/supabase";

const STEPS = [
  {
    title: "Crie sua conta",
    text: "Só e-mail e senha. Leva menos de um minuto e é de graça.",
  },
  {
    title: "Monte sua primeira ficha",
    text: "Dê um nome ao seu herói e escolha raça e classe. A ficha calcula os bônus sozinha, e pode deixar os números no padrão até o mestre te ajudar.",
  },
  {
    title: "Sente-se à mesa",
    text: "O mestre manda um link. Você abre, coloca seu personagem no mapa e rola os dados junto com o grupo.",
  },
];

const GLOSSARY = [
  { term: "Mestre", def: "A pessoa que narra a história, interpreta os monstros e explica as regras. Você não precisa saber tudo: ele guia." },
  { term: "d20", def: "O dado de 20 lados. Quase tudo no jogo começa rolando um: quanto maior o resultado, melhor." },
  { term: "Ficha", def: "O papel (aqui, a tela) com tudo sobre seu personagem: quem ele é, no que é bom e o que carrega." },
  { term: "PV", def: "Pontos de vida. Quando chegam a zero, seu personagem cai e precisa de ajuda dos amigos." },
  { term: "CA", def: "Classe de armadura. É o quão difícil é acertar você; um ataque precisa igualar ou passar esse número." },
  { term: "Token", def: "A peça redonda que representa seu personagem no mapa. É só arrastar para andar." },
];

export default function Home() {
  const { user, loading, displayName } = useSession();

  return (
    <div>
      {/* ---------- Entrada da taverna ---------- */}
      <section className="tavern-wood border-b-4 border-brass-deep">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.15fr_1fr] md:items-center md:py-24">
          <div>
            <div className="flex items-center gap-4">
              <TavernLogo
                size={160}
                priority
                className="max-h-24 sm:max-h-40 drop-shadow-[0_10px_18px_rgb(0_0_0/0.55)]"
              />
              <span className="font-display text-3xl font-bold leading-none text-brass-light sm:text-4xl">
                Taverna
                <br />
                Inicial
              </span>
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-foam sm:text-6xl">
              Puxe uma cadeira. Sua primeira aventura começa aqui.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-foam/85">
              Nunca jogou D&amp;D? Tudo bem, todo aventureiro já foi novato. Aqui você monta seu personagem com calma e
              joga com os amigos numa mesa na tela: o mapa, as peças e os dados ficam à vista de todos.
            </p>
          </div>

          <div className="parchment-card p-6 sm:p-8">
            {!isSupabaseConfigured ? (
              <ConfigWarning />
            ) : loading ? (
              <p className="text-dim">Acendendo as velas…</p>
            ) : user ? (
              <div className="space-y-5">
                <p className="font-display text-3xl font-bold leading-tight">Que bom te ver de novo, {displayName}.</p>
                <p className="text-dim">Sua mesa de sempre está guardada. Por onde quer começar?</p>
                <div className="grid gap-3">
                  <Link href="/fichas" className="btn btn-primary">Abrir minhas fichas</Link>
                  <Link href="/mesas" className="btn btn-ghost border border-rule">Ir para as mesas</Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mb-1 font-display text-2xl font-bold">Bem-vindo, viajante</h2>
                <p className="mb-5 text-sm text-dim">Crie sua conta ou entre, se já esteve por aqui.</p>
                <AuthForm />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Como funciona ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">Do primeiro passo à primeira rolagem</h2>
        <p className="mt-2 max-w-2xl text-dim">Três passos, na ordem. Nenhum exige saber as regras de cor.</p>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="panel relative p-6 pt-8">
              <span className="absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full border-2 border-brass-deep bg-ember font-display text-xl font-bold text-foam shadow-[0_2px_0_#4a180a]">
                {i + 1}
              </span>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-dim">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Glossário ---------- */}
      <section className="border-t border-rule bg-vellum/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-bold">Pequeno dicionário da taverna</h2>
          <p className="mt-2 max-w-2xl text-dim">As palavras que você vai ouvir na primeira sessão.</p>
          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {GLOSSARY.map((g) => (
              <div key={g.term} className="border-l-2 border-brass pl-4">
                <dt className="font-display text-xl font-bold text-ember-deep">{g.term}</dt>
                <dd className="mt-1 leading-relaxed">{g.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="tavern-wood py-8 text-center text-sm text-foam/70">
        Taverna Inicial — feita para quem está chegando agora ao D&amp;D.
      </footer>
    </div>
  );
}

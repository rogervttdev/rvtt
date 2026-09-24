"use client";

import { useMemo, useState } from "react";
import { Help } from "./Help";
import { Picker } from "./Picker";
import { CLASS_FEATURES, FEATS, SUBCLASSES, asiLevels, findFeat, type Feature } from "@/lib/progressao";
import type { ClassDef } from "@/lib/regras";

type Props = {
  cls?: ClassDef;
  level: number;
  subclass: string;
  feats: string[];
  onSubclass: (name: string) => void;
  onFeats: (feats: string[]) => void;
};

type Row = Feature & { source: "classe" | "subclasse" | "pendente" };

export function ProgressionTab({ cls, level, subclass, feats, onSubclass, onFeats }: Props) {
  const [showLocked, setShowLocked] = useState(false);
  const [catalog, setCatalog] = useState(false);
  const [query, setQuery] = useState("");

  const group = cls ? SUBCLASSES[cls.name] : undefined;
  const sub = group?.options.find((o) => o.name === subclass);
  const subUnlocked = Boolean(group && level >= group.level);

  const rows = useMemo(() => {
    if (!cls) return [] as Row[];
    const list: Row[] = (CLASS_FEATURES[cls.name] ?? []).map((f) => ({ ...f, source: "classe" as const }));
    if (sub) list.push(...sub.features.map((f) => ({ ...f, source: "subclasse" as const })));
    else if (group) {
      // Níveis em que a subclasse dá algo, para lembrar o jogador
      const levels = new Set(group.options.flatMap((o) => o.features.map((f) => f.level)));
      for (const l of levels)
        list.push({ level: l, name: `Característica de ${group.label}`, desc: `Escolha ${group.label.toLowerCase()} acima para ver o que você ganha neste nível.`, source: "pendente" });
    }
    const rank = { classe: 0, subclasse: 1, pendente: 2 } as const;
    return list.sort((a, b) => a.level - b.level || rank[a.source] - rank[b.source]);
  }, [cls, sub, group]);

  const byLevel = useMemo(() => {
    const map = new Map<number, Row[]>();
    for (const r of rows) map.set(r.level, [...(map.get(r.level) ?? []), r]);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [rows]);

  const asiReached = asiLevels(cls?.name).filter((l) => l <= level);
  const nextLevel = byLevel.find(([l]) => l > level);

  if (!cls)
    return (
      <div className="parchment-grid mt-6 rounded-lg border border-dashed border-brass-deep p-10 text-center">
        <p className="font-display text-2xl font-bold text-ember-deep">Escolha uma classe primeiro</p>
        <p className="mt-1 text-dim">Na aba Ficha, em Origem. Depois as habilidades de cada nível aparecem aqui.</p>
      </div>
    );

  const q = query.trim().toLowerCase();
  const catalogList = FEATS.filter((f) => !q || f.name.toLowerCase().includes(q) || f.en.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));

  return (
    <div className="mt-6 space-y-10">
      {/* ---------- Subclasse ---------- */}
      {group && (
        <section>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold">{group.label}</h2>
            <Help
              title="Subclasse"
              paragraphs={[
                "A subclasse é uma especialização dentro da sua classe: dois guerreiros podem seguir caminhos bem diferentes.",
                `Para ${cls.name}, a escolha acontece no ${group.level}º nível e dá habilidades extras em alguns níveis seguintes, que aparecem na linha do tempo abaixo.`,
              ]}
            />
          </div>
          {!subUnlocked ? (
            <p className="panel mt-3 p-4 text-dim">
              Liberada no <strong className="text-ink">{group.level}º nível</strong>. Você pode ler as opções agora para ir planejando.
            </p>
          ) : null}
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {group.options.map((o) => {
              const selected = o.name === subclass;
              return (
                <div key={o.name} className={`panel flex flex-col p-4 ${selected ? "ring-2 ring-brass-deep" : ""} ${!subUnlocked ? "opacity-80" : ""}`}>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-lg font-bold">{o.name}</h3>
                    <Help title={o.name}>
                      <p>{o.desc}</p>
                      <ul className="space-y-1.5">
                        {o.features.map((f) => (
                          <li key={f.level + f.name}>
                            <strong>
                              {f.level}º — {f.name}:
                            </strong>{" "}
                            {f.desc}
                          </li>
                        ))}
                      </ul>
                    </Help>
                  </div>
                  <p className="mt-1 text-sm text-dim">{o.desc}</p>
                  <ul className="mt-2 flex-1 space-y-0.5 text-sm">
                    {o.features.map((f) => (
                      <li key={f.level + f.name} className={f.level <= level ? "" : "text-dim"}>
                        <span className="font-semibold">{f.level}º</span> {f.name}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`btn mt-3 ${selected ? "btn-primary" : "btn-ghost border border-rule"}`}
                    disabled={!subUnlocked}
                    onClick={() => onSubclass(selected ? "" : o.name)}
                    aria-pressed={selected}
                  >
                    {selected ? "Escolhida" : subUnlocked ? "Escolher" : `No ${group.level}º nível`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Linha do tempo ---------- */}
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold">Habilidades por nível</h2>
          <Help
            title="Habilidades de classe"
            paragraphs={[
              "Cada nível que você sobe traz algo novo: mais ataques, novos poderes ou a melhora de um que você já tem.",
              "As habilidades até o seu nível atual estão liberadas. As seguintes aparecem apagadas para você saber o que vem pela frente. Ao mudar o nível na aba Ficha, elas se liberam sozinhas.",
            ]}
          />
          {nextLevel && (
            <span className="ml-auto text-sm text-dim">
              Próximo nível com novidade: <strong className="text-ink">{nextLevel[0]}º</strong>
            </span>
          )}
        </div>

        <ol className="timeline mt-4">
          {byLevel
            .filter(([l]) => showLocked || l <= level)
            .map(([l, items]) => {
              const unlocked = l <= level;
              return (
                <li key={l} className={`timeline-item ${unlocked ? "is-unlocked" : "is-locked"}`}>
                  <span className="timeline-dot" aria-hidden>
                    {l}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-dim">
                      {l}º nível {unlocked ? "" : "· bloqueado"}
                    </p>
                    <ul className="mt-1 space-y-2">
                      {items.map((f) => (
                        <li key={f.name + f.source} className="rounded-md border border-rule bg-vellum/70 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-display text-lg font-bold">{f.name}</span>
                            {f.source === "subclasse" && <span className="chip">{subclass}</span>}
                            {f.asi && <span className="chip">ou talento</span>}
                            <Help title={f.name} paragraphs={[f.desc]} />
                          </div>
                          {unlocked && <p className="mt-0.5 text-sm leading-relaxed">{f.desc}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
        </ol>
        <button className="btn btn-ghost mt-3 border border-rule" onClick={() => setShowLocked((v) => !v)}>
          {showLocked ? "Esconder os próximos níveis" : "Ver o que vem nos próximos níveis"}
        </button>
      </section>

      {/* ---------- Talentos ---------- */}
      <section id="talentos">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold">Talentos</h2>
          <Help
            title="Talentos"
            paragraphs={[
              "Talentos são habilidades especiais que deixam o personagem único. São uma regra opcional: confirme com o mestre se a mesa usa.",
              "Nos níveis de Aumento no Valor de Habilidade você escolhe: +2 em atributos ou um talento. Alguns talentos também dão +1 em um atributo — lembre de somar no valor base.",
              "O Humano variante (se o mestre permitir) começa com um talento já no 1º nível.",
            ]}
          />
          <span className="rounded-full bg-brass/20 px-3 py-1 text-sm font-semibold text-brass-deep">
            {asiReached.length === 0
              ? "Nenhum aumento de atributo liberado ainda"
              : `${asiReached.length} aumento(s) liberado(s) (${asiReached.map((l) => `${l}º`).join(", ")}) · ${feats.length} talento(s) escolhido(s)`}
          </span>
          <button className="btn btn-primary ml-auto" onClick={() => setCatalog(true)}>
            Abrir catálogo de talentos
          </button>
        </div>

        {feats.length === 0 ? (
          <p className="parchment-grid mt-3 rounded-lg border border-dashed border-brass-deep p-6 text-center text-dim">
            Nenhum talento. Abra o catálogo para conhecer os {FEATS.length} talentos oficiais.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {feats.map((name) => {
              const f = findFeat(name);
              return (
                <li key={name} className="panel p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-lg font-bold">{name}</span>
                    {f && <FeatHelp name={name} />}
                    <button className="btn btn-danger ml-auto px-2 py-1" onClick={() => onFeats(feats.filter((x) => x !== name))}>
                      Remover
                    </button>
                  </div>
                  {f && (
                    <>
                      <p className="mt-1 text-sm leading-relaxed">{f.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {f.bonus && <span className="chip">{f.bonus}</span>}
                        {f.prereq && <span className="chip">Requer: {f.prereq}</span>}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Picker open={catalog} title="Catálogo de talentos" onClose={() => setCatalog(false)}>
        <div className="sticky top-0 z-10 -mx-5 -mt-1 mb-2 bg-vellum px-5 pb-2 pt-1">
          <input className="field" placeholder="Buscar talento (nome ou efeito)…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar talento" />
        </div>
        {catalogList.length === 0 && <p className="py-6 text-center text-dim">Nenhum talento com esse nome.</p>}
        {catalogList.map((f) => {
          const has = feats.includes(f.name);
          return (
            <div key={f.name} className={`picker-row ${has ? "is-selected" : ""}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold">{f.name}</span>
                  <span className="text-xs text-dim">({f.en})</span>
                  <FeatHelp name={f.name} />
                </div>
                <p className="text-sm text-dim">{f.desc}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {f.bonus && <span className="chip">{f.bonus}</span>}
                  {f.prereq && <span className="chip">Requer: {f.prereq}</span>}
                </div>
              </div>
              <button
                className={`btn px-3 py-1.5 ${has ? "btn-danger border border-blood/40" : "btn-primary"}`}
                onClick={() => onFeats(has ? feats.filter((x) => x !== f.name) : [...feats, f.name])}
              >
                {has ? "Remover" : "Adicionar"}
              </button>
            </div>
          );
        })}
      </Picker>
    </div>
  );
}

function FeatHelp({ name }: { name: string }) {
  const f = findFeat(name);
  if (!f) return null;
  return (
    <Help title={f.name}>
      <p>{f.desc}</p>
      {f.bonus && <p>Também dá {f.bonus} (some no valor base do atributo).</p>}
      {f.prereq && <p>Pré-requisito: {f.prereq}.</p>}
      <p className="text-sm opacity-80">Nome em inglês: {f.en}</p>
    </Help>
  );
}

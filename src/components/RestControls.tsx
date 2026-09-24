"use client";

import { useState } from "react";
import { Help } from "./Help";
import { Picker } from "./Picker";
import { formatMod, rollFormula } from "@/lib/dnd";

type Props = {
  hitDie?: number;
  level: number;
  conMod: number;
  hitDiceSpent: number;
  hp: number;
  hpMax: number;
  isWarlock: boolean;
  isWizard: boolean;
  onShortRest: (healed: number, diceSpent: number) => void;
  onLongRest: () => void;
};

export function RestControls({ hitDie, level, conMod, hitDiceSpent, hp, hpMax, isWarlock, isWizard, onShortRest, onLongRest }: Props) {
  const [open, setOpen] = useState<"curto" | "longo" | null>(null);
  const [rolls, setRolls] = useState<{ die: number; total: number }[]>([]);

  const available = Math.max(0, level - hitDiceSpent - rolls.length);
  const healed = rolls.reduce((t, r) => t + r.total, 0);
  const recoverDice = Math.max(1, Math.floor(level / 2));

  function rollHitDie() {
    if (!hitDie || available <= 0) return;
    const r = rollFormula(`1d${hitDie}`);
    if (!r) return;
    setRolls((rs) => [...rs, { die: r.total, total: Math.max(0, r.total + conMod) }]);
  }

  function close() {
    setOpen(null);
    setRolls([]);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button className="btn btn-ghost border border-rule px-3 py-1.5" onClick={() => setOpen("curto")}>
        Descanso curto
      </button>
      <button className="btn btn-brass px-3 py-1.5" onClick={() => setOpen("longo")}>
        Descanso longo
      </button>
      <Help
        title="Descansos"
        paragraphs={[
          "Descanso curto: cerca de 1 hora parado. Você pode gastar dados de vida para se curar (cada dado + modificador de Constituição). Recursos de descanso curto (Surto de Ação, ki, Canalizar Divindade, espaços de pacto do bruxo…) voltam.",
          "Descanso longo: pelo menos 8 horas, com sono. Recupera todos os PV, metade dos dados de vida gastos (mínimo 1), todos os espaços de magia e todos os recursos. Só um por dia.",
        ]}
      />

      <Picker open={open === "curto"} title="Descanso curto" onClose={close}>
        <div className="space-y-3">
          <p>Uma hora para respirar, enfaixar feridas e comer algo. Gaste dados de vida para recuperar PV.</p>
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-rule bg-paper/50 p-3">
            <span>
              PV: <strong>{Math.min(hpMax, hp + healed)}</strong> / {hpMax}
            </span>
            <span>
              Dados de vida: <strong>{available}</strong> de {level} {hitDie ? `(d${hitDie})` : ""}
            </span>
            <button className="btn btn-primary ml-auto" disabled={!hitDie || available <= 0 || hp + healed >= hpMax} onClick={rollHitDie}>
              Rolar 1 dado de vida
            </button>
          </div>
          {!hitDie && <p className="text-sm text-blood">Escolha uma classe para saber o seu dado de vida.</p>}
          {rolls.length > 0 && (
            <ul className="space-y-1 text-sm">
              {rolls.map((r, i) => (
                <li key={i}>
                  d{hitDie}: {r.die} {formatMod(conMod)} = <strong>{r.total} PV</strong>
                </li>
              ))}
              <li className="font-semibold text-moss">Total recuperado: {healed} PV</li>
            </ul>
          )}
          <ul className="list-disc pl-5 text-sm text-dim">
            <li>Recursos marcados como “descanso curto” voltam.</li>
            {isWarlock && <li>Seus espaços de Magia de Pacto voltam.</li>}
            {isWizard && <li>Mago: você pode usar a Recuperação Arcana (aba Recursos) e desmarcar os espaços recuperados na aba Magias.</li>}
          </ul>
          <div className="flex justify-end gap-2">
            <button className="btn btn-ghost border border-rule" onClick={close}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onShortRest(healed, rolls.length);
                close();
              }}
            >
              Concluir descanso curto
            </button>
          </div>
        </div>
      </Picker>

      <Picker open={open === "longo"} title="Descanso longo" onClose={close}>
        <div className="space-y-3">
          <p>Uma boa noite de sono na taverna (ou no acampamento). Ao acordar:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              PV voltam ao máximo: <strong>{hpMax}</strong>.
            </li>
            <li>
              Recupera <strong>{Math.min(hitDiceSpent, recoverDice)}</strong> dado(s) de vida (metade do nível, mínimo 1).
            </li>
            <li>Todos os espaços de magia voltam.</li>
            <li>Todos os recursos (Fúria, Canalizar Divindade, pontos de feitiçaria…) voltam.</li>
          </ul>
          <p className="text-sm text-dim">Regra: só um descanso longo a cada 24 horas, e você precisa ter pelo menos 1 PV.</p>
          <div className="flex justify-end gap-2">
            <button className="btn btn-ghost border border-rule" onClick={close}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              disabled={hp <= 0}
              onClick={() => {
                onLongRest();
                close();
              }}
            >
              Descansar até o amanhecer
            </button>
          </div>
        </div>
      </Picker>
    </div>
  );
}

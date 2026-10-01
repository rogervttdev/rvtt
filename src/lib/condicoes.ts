/**
 * As 15 condições do SRD 5.2.1 (System Reference Document), Wizards of the Coast LLC,
 * licença Creative Commons Attribution 4.0 (CC-BY-4.0):
 * https://creativecommons.org/licenses/by/4.0/legalcode
 *
 * Os textos abaixo são um resumo mecânico traduzido e reescrito com nossas próprias
 * palavras (não uma cópia literal do documento) — o bastante para lembrar o efeito
 * à mesa sem precisar abrir o livro.
 */

export type ConditionId =
  | "cego"
  | "caido"
  | "agarrado"
  | "atordoado"
  | "amedrontado"
  | "enfeiticado"
  | "surdo"
  | "incapacitado"
  | "invisivel"
  | "paralisado"
  | "petrificado"
  | "envenenado"
  | "contido"
  | "inconsciente"
  | "exausto";

export type ConditionDef = {
  id: ConditionId;
  name: string;
  icon: string;
  desc: string;
};

export const CONDITIONS: ConditionDef[] = [
  { id: "cego", name: "Cego", icon: "🙈", desc: "Falha automática em qualquer teste que exija visão. Ataques contra você têm vantagem; seus ataques têm desvantagem." },
  { id: "surdo", name: "Surdo", icon: "🙉", desc: "Não ouve nada e falha automaticamente em qualquer teste que exija audição." },
  { id: "enfeiticado", name: "Enfeitiçado", icon: "💞", desc: "Não pode atacar quem o enfeitiçou nem usar habilidades/magias contra ele. Quem o enfeitiçou tem vantagem em testes sociais contra você." },
  { id: "amedrontado", name: "Amedrontado", icon: "😱", desc: "Desvantagem em testes de habilidade e ataques enquanto a fonte do medo estiver visível. Não consegue se aproximar dela de boa vontade." },
  { id: "agarrado", name: "Agarrado", icon: "🤼", desc: "Deslocamento vira 0 e não aumenta. Termina se quem agarrou ficar incapacitado ou se a distância entre os dois ultrapassar o alcance do agarrão." },
  { id: "incapacitado", name: "Incapacitado", icon: "🌀", desc: "Não pode realizar ações, ações bônus nem reações. Não consegue se concentrar em nada, é surpreendido e não consegue falar." },
  { id: "invisivel", name: "Invisível", icon: "👻", desc: "Não pode ser visto sem um efeito especial. Para fins de ataque, você é considerado fortemente obscurecido. Ataques contra você têm desvantagem; os seus têm vantagem." },
  { id: "paralisado", name: "Paralisado", icon: "⚡", desc: "Incapacitado e não pode se mover nem falar. Falha automaticamente em testes de resistência de Força e Destreza. Ataques contra você têm vantagem, e qualquer acerto a até 1,5 m é crítico automático." },
  { id: "petrificado", name: "Petrificado", icon: "🗿", desc: "Transformado em substância sólida inanimada (pedra), incapacitado, não se move nem fala e é alheio ao redor. Peso ×10. Resistência a todo dano. Imune a veneno e à condição Envenenado." },
  { id: "envenenado", name: "Envenenado", icon: "🤢", desc: "Desvantagem em testes de habilidade e em rolagens de ataque." },
  { id: "caido", name: "Caído", icon: "🤸", desc: "Só pode se arrastar ou usar metade do deslocamento para ficar de pé. Desvantagem em ataques; ataques corpo a corpo contra você têm vantagem, os à distância têm desvantagem." },
  { id: "contido", name: "Contido", icon: "🕸️", desc: "Deslocamento vira 0. Desvantagem em testes de Destreza e em seus próprios ataques; ataques contra você têm vantagem." },
  { id: "atordoado", name: "Atordoado", icon: "💫", desc: "Incapacitado, não se move, e só consegue falar de forma hesitante. Falha automaticamente em testes de resistência de Força e Destreza. Ataques contra você têm vantagem." },
  { id: "inconsciente", name: "Inconsciente", icon: "😵", desc: "Incapacitado, caído, larga o que segura e é alheio ao redor. Falha automaticamente em testes de Força e Destreza. Ataques contra você têm vantagem, e qualquer acerto a até 1,5 m é crítico automático." },
  {
    id: "exausto",
    name: "Exausto",
    icon: "🥵",
    desc: "Tem níveis (some até 6 = morte). Cada nível dá −2 em todos os testes de d20 por nível, e reduz o deslocamento em 3 m por nível. Um descanso longo remove 1 nível.",
  },
];

export const findCondition = (id?: string) => CONDITIONS.find((c) => c.id === id);

/** Penalidade de exaustão (regra 2024): −2 por nível em qualquer teste de d20. */
export function exhaustionPenalty(level: number) {
  return -2 * Math.max(0, level);
}

/** Redução de deslocamento por exaustão: −3 m por nível. */
export function exhaustionSpeedPenalty(level: number) {
  return 3 * Math.max(0, level);
}

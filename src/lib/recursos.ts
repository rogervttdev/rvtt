/**
 * Recursos limitados por descanso (Fúria, Canalizar Divindade, Ki…), gerados pela classe, subclasse, raça e talentos.
 */
import type { Abilities } from "./types";

export type Recharge = "short" | "long";
export type ResourceDef = { key: string; name: string; max: number; recharge: Recharge; desc: string };

export function classResources(opts: {
  className?: string;
  subclass?: string | null;
  race?: string | null;
  level: number;
  mods: Abilities;
  feats: string[];
}): ResourceDef[] {
  const { className, subclass, race, level: l, mods, feats } = opts;
  const out: ResourceDef[] = [];
  const add = (r: ResourceDef) => r.max > 0 && out.push(r);

  switch (className) {
    case "Bárbaro":
      add({ key: "furia", name: "Fúria", max: l >= 20 ? 99 : l >= 17 ? 6 : l >= 12 ? 5 : l >= 6 ? 4 : l >= 3 ? 3 : 2, recharge: "long", desc: `Ação bônus para entrar em fúria por 1 minuto: vantagem em Força, +${l >= 16 ? 4 : l >= 9 ? 3 : 2} de dano corpo a corpo e resistência a dano físico.${l >= 20 ? " No 20º nível, os usos são ilimitados." : ""}` });
      break;
    case "Bardo":
      add({ key: "inspiracao-bardo", name: `Inspiração de Bardo (d${l >= 15 ? 12 : l >= 10 ? 10 : l >= 5 ? 8 : 6})`, max: Math.max(1, mods.cha), recharge: l >= 5 ? "short" : "long", desc: "Ação bônus: um aliado ganha um dado para somar a um teste, ataque ou resistência nos próximos 10 minutos. Usos = modificador de Carisma." });
      break;
    case "Clérigo":
      if (l >= 2) add({ key: "canalizar", name: "Canalizar Divindade", max: l >= 18 ? 3 : l >= 6 ? 2 : 1, recharge: "short", desc: "Expulsar Mortos-Vivos ou o poder do seu domínio." });
      if (l >= 10) add({ key: "intervencao", name: "Intervenção Divina", max: 1, recharge: "long", desc: "Pede ajuda ao seu deus (role d100 ≤ seu nível). Se funcionar, só pode tentar de novo após 7 dias." });
      break;
    case "Druida":
      if (l >= 2 && l < 20) add({ key: "forma-selvagem", name: "Forma Selvagem", max: 2, recharge: "short", desc: "Transforma-se em um animal que já viu." });
      break;
    case "Feiticeiro":
      if (l >= 2) add({ key: "pontos-feiticaria", name: "Pontos de feitiçaria", max: l, recharge: "long", desc: "Crie espaços de magia ou use Metamagia." });
      break;
    case "Guerreiro":
      add({ key: "retomar-folego", name: "Retomar o Fôlego", max: 1, recharge: "short", desc: `Ação bônus: recupera 1d10 + ${l} PV.` });
      if (l >= 2) add({ key: "surto-acao", name: "Surto de Ação", max: l >= 17 ? 2 : 1, recharge: "short", desc: "Uma ação extra no seu turno." });
      if (l >= 9) add({ key: "indomavel", name: "Indomável", max: l >= 17 ? 3 : l >= 13 ? 2 : 1, recharge: "long", desc: "Rola de novo um teste de resistência que falhou." });
      break;
    case "Ladino":
      if (l >= 20) add({ key: "golpe-sorte", name: "Golpe de Sorte", max: 1, recharge: "short", desc: "Transforma um erro em acerto ou um teste em 20." });
      break;
    case "Mago":
      add({ key: "recuperacao-arcana", name: "Recuperação Arcana", max: 1, recharge: "long", desc: `Num descanso curto, recupera espaços de magia somando até ${Math.ceil(l / 2)} círculos (nenhum de 6º ou maior).` });
      break;
    case "Monge":
      if (l >= 2) add({ key: "ki", name: "Pontos de ki", max: l, recharge: "short", desc: "Rajada de Golpes, Defesa Paciente, Passo do Vento, Ataque Atordoante e mais." });
      break;
    case "Paladino":
      add({ key: "sentido-divino", name: "Sentido Divino", max: 1 + Math.max(0, mods.cha), recharge: "long", desc: "Sente celestiais, corruptores e mortos-vivos a até 18 m." });
      add({ key: "cura-maos", name: "Cura pelas Mãos (reserva de PV)", max: 5 * l, recharge: "long", desc: "Reserva de cura: toque e gaste quantos pontos quiser. 5 pontos também curam uma doença ou veneno." });
      if (l >= 3) add({ key: "canalizar", name: "Canalizar Divindade", max: 1, recharge: "short", desc: "O poder do seu juramento sagrado." });
      if (l >= 14) add({ key: "toque-purificador", name: "Toque Purificador", max: Math.max(1, mods.cha), recharge: "long", desc: "Encerra uma magia em você ou em um aliado." });
      break;
    case "Bruxo":
      if (l >= 20) add({ key: "mestre-mistico", name: "Mestre Místico", max: 1, recharge: "long", desc: "Recupera todos os espaços de Magia de Pacto." });
      break;
  }

  if (subclass === "Mestre de Batalha" && l >= 3)
    add({ key: "superioridade", name: `Dados de superioridade (d${l >= 18 ? 12 : l >= 10 ? 10 : 8})`, max: l >= 15 ? 6 : l >= 7 ? 5 : 4, recharge: "short", desc: "Gaste nas manobras: derrubar, desarmar, ataque preciso…" });
  if (subclass === "Domínio da Guerra")
    add({ key: "sacerdote-guerra", name: "Sacerdote de Guerra", max: Math.max(1, mods.wis), recharge: "long", desc: "Ataque extra como ação bônus ao usar a ação Atacar." });
  if (subclass === "Domínio da Luz" || subclass === "Domínio da Tempestade")
    add({ key: subclass === "Domínio da Luz" ? "labareda" : "ira-tempestade", name: subclass === "Domínio da Luz" ? "Labareda Protetora" : "Ira da Tempestade", max: Math.max(1, mods.wis), recharge: "long", desc: "Reação do seu domínio (veja a aba Progressão)." });
  if (subclass === "A Arquifada") add({ key: "presenca-feerica", name: "Presença Feérica", max: 1, recharge: "short", desc: "Enfeitiça ou amedronta criaturas ao seu redor." });
  if (subclass === "O Corruptor" && l >= 6) add({ key: "sorte-obscuro", name: "Sorte do Próprio Obscuro", max: 1, recharge: "short", desc: "+1d10 em um teste de atributo ou resistência." });
  if (subclass === "Magia Selvagem") add({ key: "mares-caos", name: "Marés do Caos", max: 1, recharge: "long", desc: "Vantagem em uma rolagem." });

  if (race === "Draconato") add({ key: "sopro", name: "Arma de Sopro", max: 1, recharge: "short", desc: `Dano ${l >= 16 ? "5d6" : l >= 11 ? "4d6" : l >= 6 ? "3d6" : "2d6"} do elemento do seu ancestral, em área.` });
  if (race === "Meio-Orc") add({ key: "resistencia-implacavel", name: "Resistência Implacável", max: 1, recharge: "long", desc: "Ao cair a 0 PV, fica com 1 PV." });

  if (feats.includes("Sortudo")) add({ key: "sortudo", name: "Pontos de sorte", max: 3, recharge: "long", desc: "Role um d20 extra e escolha o resultado." });
  if (feats.includes("Adepto Marcial") && subclass !== "Mestre de Batalha") add({ key: "adepto-marcial", name: "Dado de superioridade (d6)", max: 1, recharge: "short", desc: "Use numa das duas manobras aprendidas." });

  return out;
}

import type { AbilityKey } from "./types";

/** Explicações para iniciantes. Cada item é uma lista de parágrafos. */
export const GLOSSARIO = {
  nivel: [
    "O nível mostra a experiência do seu personagem. Todo mundo começa no 1º nível e sobe ao ganhar experiência nas aventuras, até o 20º.",
    "Subir de nível aumenta os pontos de vida, o bônus de proficiência e libera novos poderes da classe.",
  ],
  raca: [
    "A raça é o povo de onde seu herói vem: humano, elfo, anão e outros.",
    "Ela soma bônus em alguns atributos, define seu deslocamento e dá habilidades naturais, como enxergar no escuro. Os bônus já são aplicados sozinhos na ficha.",
  ],
  subraca: [
    "Algumas raças se dividem em sub-raças, grupos com costumes e talentos um pouco diferentes.",
    "A sub-raça soma mais um bônus de atributo e uma habilidade própria.",
  ],
  classe: [
    "A classe é a profissão de aventureiro do seu herói: o que ele faz melhor no grupo.",
    "Ela decide quantos pontos de vida você tem (pelo dado de vida), em quais testes de resistência você é treinado, quais perícias pode escolher e quais poderes ganha a cada nível.",
  ],
  antecedente: [
    "O antecedente é o que seu herói fazia antes de virar aventureiro: soldado, nobre, órfão das ruas…",
    "Ele ajuda a imaginar a história do personagem e dá duas perícias treinadas, que já aparecem marcadas na ficha.",
  ],
  atributos: [
    "São os seis números que descrevem o corpo e a mente do herói: Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma.",
    "Um valor 10 é a média de uma pessoa comum; aventureiros costumam ter entre 8 e 18. Você quase nunca usa o valor em si nas rolagens: usa o modificador que sai dele.",
  ],
  modificador: [
    "O modificador é o número que você realmente soma nos dados.",
    "A conta é: (valor do atributo − 10) ÷ 2, arredondando para baixo. Assim 10 ou 11 dá +0, 12 ou 13 dá +1, 14 ou 15 dá +2, 8 ou 9 dá −1.",
    "Toque no modificador de um atributo para rolar um teste simples com ele: d20 + modificador.",
  ],
  arranjo: [
    "O arranjo padrão é o jeito mais simples de montar os atributos: você recebe seis valores fixos (15, 14, 13, 12, 10 e 8) e distribui entre os seis atributos.",
    "O botão coloca os maiores valores nos atributos mais importantes para a sua classe. Depois disso, o bônus da raça é somado por cima. Você pode trocar os valores à mão se quiser.",
  ],
  base_racial: [
    "O número pequeno é o valor base, que você distribui. A etiqueta mostra o que a raça soma.",
    "O valor final (base + raça) é o que conta para calcular o modificador.",
  ],
  proficiencia: [
    "O bônus de proficiência representa treino. Ele começa em +2 e sobe com o nível: +3 no 5º, +4 no 9º, +5 no 13º e +6 no 17º.",
    "Você soma esse bônus quando faz algo em que é treinado: perícias marcadas, os testes de resistência da sua classe e ataques com armas que sabe usar.",
  ],
  resistencias: [
    "Testes de resistência servem para escapar de algo ruim: pular para longe de uma bola de fogo (Destreza), resistir a um veneno (Constituição), não ter a mente controlada (Sabedoria).",
    "Você rola d20 + modificador do atributo. Se a sua classe te treinou naquele teste (os marcados com o selo), soma também o bônus de proficiência. Cada classe é treinada em dois.",
  ],
  pericias: [
    "Perícias são tarefas específicas feitas com um atributo: Furtividade usa Destreza, Persuasão usa Carisma.",
    "Quando você tenta algo com resultado incerto, o mestre pede um teste: d20 + modificador do atributo + bônus de proficiência, se a perícia estiver marcada.",
    "As perícias do antecedente e da raça vêm marcadas sozinhas. As da classe você escolhe: as sugeridas para a sua classe têm uma estrelinha.",
  ],
  constituicao_pericias: [
    "Constituição não tem perícias. Ela aparece nos seus pontos de vida (soma o modificador a cada nível), nos testes de resistência contra venenos e cansaço e para manter a concentração em magias.",
  ],
  ca: [
    "Classe de Armadura (CA) é o quão difícil é te acertar. O inimigo rola d20 + bônus de ataque e precisa igualar ou passar a sua CA.",
    "Sem armadura: 10 + modificador de Destreza. Com armadura de couro: 11 + Destreza; brunea: 14 + Destreza (máx. +2); cota de malha: 16. Um escudo soma +2.",
    "Pergunte ao mestre com qual armadura seu personagem começa e ajuste o número aqui.",
  ],
  iniciativa: [
    "A iniciativa define a ordem dos turnos num combate. No começo da luta, todos rolam d20 + modificador de Destreza e quem tirar mais age primeiro.",
    "Por isso personagens ágeis costumam agir antes dos outros.",
  ],
  deslocamento: [
    "É quantos metros você anda no seu turno durante um combate. No mapa, cada quadrado tem 1,5 m: 9 m equivalem a 6 quadrados.",
    "O valor vem da raça: anões, halflings e gnomos têm pernas curtas e andam 7,5 m.",
  ],
  dados_vida: [
    "Cada classe tem um dado que mostra o quão resistente ela é: d6 para magos e feiticeiros, d12 para bárbaros. Você tem um dado de vida para cada nível.",
    "Eles definem seus PV máximos. E num descanso curto (cerca de 1 hora) você pode gastar alguns: rola cada dado + modificador de Constituição e recupera esses PV. Num descanso longo, recupera metade dos dados gastos.",
  ],
  pv: [
    "Pontos de vida (PV) são sua energia para continuar de pé. Dano tira PV; cura e descanso devolvem.",
    "Em 0 PV você cai inconsciente e passa a fazer testes contra a morte a cada turno: é hora dos amigos te ajudarem.",
    "No 1º nível, o máximo é o valor cheio do seu dado de vida + modificador de Constituição. A cada nível seguinte, soma a média do dado + Constituição. A sugestão da ficha já faz essa conta.",
  ],
  inspiracao: [
    "Inspiração é um prêmio que o mestre dá quando você interpreta bem o personagem, tem uma ideia brilhante ou faz o grupo rir.",
    "Você pode gastá-la para ter vantagem numa rolagem: rola dois d20 e fica com o maior. Só dá para ter uma de cada vez.",
  ],
  percepcao_passiva: [
    "É o quanto você nota sem estar procurando: 10 + seu bônus de Percepção.",
    "O mestre compara esse número com a Furtividade de quem tenta se esconder de você, sem você precisar rolar nada.",
  ],
} satisfies Record<string, string[]>;

export type GlossarioKey = keyof typeof GLOSSARIO;

export const ABILITY_ABOUT: Record<AbilityKey, string> = {
  str: "Força é o poder físico: golpear com espadas e machados, carregar peso, empurrar e escalar (Atletismo).",
  dex: "Destreza é agilidade e reflexo: usar arcos e armas leves, desviar de golpes (soma na CA), agir primeiro na iniciativa e ser furtivo.",
  con: "Constituição é saúde e vigor: soma nos pontos de vida a cada nível e ajuda a resistir a venenos e ao cansaço.",
  int: "Inteligência é raciocínio e memória: conhecimento, investigação e a magia dos magos.",
  wis: "Sabedoria é atenção e bom senso: perceber perigos, ler as pessoas e a magia de clérigos e druidas.",
  cha: "Carisma é presença e personalidade: convencer, enganar, intimidar e a magia de bardos, bruxos, feiticeiros e paladinos.",
};

import type { AbilityKey } from "./types";

/** Explicações para iniciantes. Cada item é uma lista de parágrafos. */
export const GLOSSARIO = {
  nivel: [
    "O nível mostra a experiência do seu personagem. Todo mundo começa no 1º nível e sobe ao ganhar experiência nas aventuras, até o 20º.",
    "Subir de nível aumenta os pontos de vida, o bônus de proficiência e libera novos poderes da classe.",
  ],
  raca: [
    "A raça é o povo de onde seu herói vem: humano, elfo, anão e outros.",
    "Ela define seu deslocamento e dá habilidades naturais, como enxergar no escuro. Na regra 2024, a raça não soma mais bônus de atributo — isso agora vem do antecedente.",
  ],
  subraca: [
    "Algumas raças se dividem em sub-raças, grupos com costumes e talentos um pouco diferentes.",
    "A sub-raça dá uma habilidade própria (o bônus de atributo, na regra 2024, vem do antecedente, não da sub-raça).",
  ],
  classe: [
    "A classe é a profissão de aventureiro do seu herói: o que ele faz melhor no grupo.",
    "Ela decide quantos pontos de vida você tem (pelo dado de vida), em quais testes de resistência você é treinado, quais perícias pode escolher e quais poderes ganha a cada nível.",
  ],
  antecedente: [
    "O antecedente é o que seu herói fazia antes de virar aventureiro: soldado, artesão, sábio…",
    "Na regra 2024, ele ajuda a imaginar a história do personagem e dá o bônus de atributo, duas perícias treinadas, uma ferramenta e um Talento de Origem — tudo aplicado sozinho na ficha.",
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
    "O número pequeno é o valor base, que você distribui. A etiqueta mostra o que o antecedente soma (regra 2024: o bônus de atributo vem do antecedente, não da raça).",
    "O valor final (base + antecedente) é o que conta para calcular o modificador.",
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
    "Inspiração Heroica é um prêmio que o mestre dá quando você interpreta bem o personagem, tem uma ideia brilhante ou faz o grupo rir.",
    "Regra 2024: ao invés de dar vantagem, ela deixa você rerrolar qualquer dado (não só o d20) assim que vê o resultado, e usar o novo valor, para melhor ou para pior. Só dá para ter uma de cada vez; se ganhar outra e já tiver uma, pode passá-la a um aliado sem inspiração.",
  ],
  percepcao_passiva: [
    "É o quanto você nota sem estar procurando: 10 + seu bônus de Percepção.",
    "O mestre compara esse número com a Furtividade de quem tenta se esconder de você, sem você precisar rolar nada.",
  ],
  tendencia: [
    "A tendência resume a moral e o jeito de agir do personagem em duas palavras.",
    "O primeiro eixo diz como ele vê regras e tradições: Leal (respeita leis e compromissos), Neutro ou Caótico (valoriza a liberdade e age por impulso). O segundo diz como trata os outros: Bom, Neutro ou Mau.",
    "É um guia para interpretar, não uma prisão: seu herói pode mudar com a história. Para a primeira mesa, tendências boas ou neutras costumam combinar melhor com o grupo. Converse com o mestre antes de escolher uma tendência má.",
  ],
  equipamento: [
    "Aqui você escolhe o que o herói carrega para a luta. A ficha calcula sozinha a Classe de Armadura e monta os ataques com o dano certo.",
    "Pergunte ao mestre qual equipamento inicial a sua classe recebe. Normalmente é uma armadura, uma ou duas armas e um pacote de aventureiro.",
  ],
  armadura: [
    "A armadura aumenta a sua Classe de Armadura (CA), deixando você mais difícil de acertar.",
    "Leves somam toda a sua Destreza. Médias somam no máximo +2 de Destreza. Pesadas não somam Destreza, mas têm CA alta e algumas pedem Força mínima.",
    "Usar uma armadura sem treino da sua classe dá desvantagem em testes e ataques de Força e Destreza, e impede de lançar magias.",
  ],
  escudo: [
    "O escudo soma +2 na CA, mas ocupa uma mão: não dá para usar arma de duas mãos junto, e conjuradores precisam da outra mão livre para gestos (ou de um foco no escudo, como o emblema sagrado).",
  ],
  furtividade: [
    "Desvantagem em Furtividade: armaduras barulhentas fazem você rolar dois d20 e ficar com o menor ao tentar se esconder ou andar em silêncio.",
  ],
  forca_minima: [
    "Algumas armaduras pesadas exigem Força mínima. Se a sua Força for menor, seu deslocamento cai 3 metros (anões não sofrem essa penalidade).",
  ],
  armas: [
    "Armas simples (adagas, maças, arcos curtos) quase todo mundo sabe usar. Armas marciais (espadas longas, machados grandes, arcos longos) exigem treino de guerreiro: bárbaros, guerreiros, paladinos e patrulheiros.",
    "Se sua classe ou raça não te treinou na arma, você ainda pode usá-la, mas não soma o bônus de proficiência no ataque.",
  ],
  ataques: [
    "Para atacar, role d20 + bônus de ataque. Se o resultado igualar ou passar a CA do alvo, você acerta e rola o dano.",
    "Bônus de ataque = modificador de Força (ou Destreza, em armas à distância e de acuidade) + bônus de proficiência, se você for treinado na arma.",
    "Dano = dado da arma + o mesmo modificador. Tirou 20 natural no ataque? É um acerto crítico: role os dados de dano duas vezes.",
  ],
  foco: [
    "Um foco de conjuração é o objeto que o conjurador segura para canalizar a magia. Ele substitui os materiais simples que algumas magias pedem.",
    "Cada tipo de conjurador usa o seu: foco arcano (feiticeiro, bruxo e mago), foco druídico (druida), símbolo sagrado (clérigo e paladino) e instrumento musical (bardo). Cajados ainda servem como arma.",
  ],
} satisfies Record<string, string[]>;

export const ALIGNMENTS: { name: string; desc: string }[] = [
  { name: "Leal e Bom", desc: "Faz o que é certo seguindo regras, promessas e honra. O cavaleiro justo que protege os inocentes." },
  { name: "Neutro e Bom", desc: "Faz o bem da melhor forma possível, sem se prender a leis nem se rebelar contra elas. O curandeiro que ajuda quem precisa." },
  { name: "Caótico e Bom", desc: "Segue a própria consciência: bondoso, mas avesso a regras e autoridades. O herói fora da lei que rouba dos ricos para dar aos pobres." },
  { name: "Leal e Neutro", desc: "Age de acordo com a lei, a tradição ou um código pessoal, acima de ser bom ou mau. O juiz imparcial ou o soldado disciplinado." },
  { name: "Neutro", desc: "Evita tomar partido e age conforme a situação pede. Prefere o equilíbrio aos extremos." },
  { name: "Caótico e Neutro", desc: "Segue os próprios desejos e valoriza a liberdade acima de tudo. Imprevisível, mas não cruel." },
  { name: "Leal e Mau", desc: "Toma o que quer de forma metódica, dentro de uma ordem ou hierarquia. O tirano ou o cavaleiro sombrio que cumpre sua palavra." },
  { name: "Neutro e Mau", desc: "Faz o que for preciso para se dar bem, sem compaixão nem lealdade verdadeira. O mercenário egoísta." },
  { name: "Caótico e Mau", desc: "Age com violência e crueldade movido por raiva, ódio ou prazer. Raramente combina com um grupo de heróis." },
];

export type GlossarioKey = keyof typeof GLOSSARIO;

export const ABILITY_ABOUT: Record<AbilityKey, string> = {
  str: "Força é o poder físico: golpear com espadas e machados, carregar peso, empurrar e escalar (Atletismo).",
  dex: "Destreza é agilidade e reflexo: usar arcos e armas leves, desviar de golpes (soma na CA), agir primeiro na iniciativa e ser furtivo.",
  con: "Constituição é saúde e vigor: soma nos pontos de vida a cada nível e ajuda a resistir a venenos e ao cansaço.",
  int: "Inteligência é raciocínio e memória: conhecimento, investigação e a magia dos magos.",
  wis: "Sabedoria é atenção e bom senso: perceber perigos, ler as pessoas e a magia de clérigos e druidas.",
  cha: "Carisma é presença e personalidade: convencer, enganar, intimidar e a magia de bardos, bruxos, feiticeiros e paladinos.",
};

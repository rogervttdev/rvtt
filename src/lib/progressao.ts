/**
 * Progressão do Livro do Jogador (D&D 5e): características de classe por nível,
 * subclasses e talentos. Textos resumidos e explicados para iniciantes.
 */

export type Feature = { level: number; name: string; desc: string; asi?: boolean };

const ASI_DESC =
  "Some +2 em um atributo ou +1 em dois atributos (máximo 20). Se o mestre usar talentos, você pode trocar este aumento por um talento da aba Talentos.";
const asi = (level: number): Feature => ({ level, name: "Aumento no Valor de Habilidade", desc: ASI_DESC, asi: true });

// ---------------------------------------------------------------------------
// Características de cada classe (sem as da subclasse)
// ---------------------------------------------------------------------------

export const CLASS_FEATURES: Record<string, Feature[]> = {
  Bárbaro: [
    { level: 1, name: "Fúria", desc: "Como ação bônus, entra em fúria por 1 minuto: vantagem em testes de Força, dano extra em ataques corpo a corpo com Força e resistência a dano cortante, perfurante e de concussão. Usos por descanso longo aumentam com o nível." },
    { level: 1, name: "Defesa sem Armadura", desc: "Sem armadura, sua CA é 10 + Destreza + Constituição. Pode usar escudo." },
    { level: 2, name: "Ataque Descuidado", desc: "No primeiro ataque do turno, pode atacar com vantagem; em troca, ataques contra você também têm vantagem até seu próximo turno." },
    { level: 2, name: "Sentido de Perigo", desc: "Vantagem em testes de resistência de Destreza contra efeitos que você pode ver, como armadilhas e magias." },
    { level: 3, name: "Caminho Primitivo", desc: "Escolha sua subclasse: o caminho que molda sua fúria." },
    asi(4),
    { level: 5, name: "Ataque Extra", desc: "Ao usar a ação Atacar, faz dois ataques em vez de um." },
    { level: 5, name: "Movimento Rápido", desc: "+3 m de deslocamento quando não usa armadura pesada." },
    { level: 7, name: "Instinto Selvagem", desc: "Vantagem na iniciativa. Se for surpreendido, ainda pode agir no primeiro turno se entrar em fúria." },
    asi(8),
    { level: 9, name: "Crítico Brutal", desc: "Em um acerto crítico corpo a corpo, rola um dado de dano extra da arma (dois no 13º nível, três no 17º)." },
    { level: 11, name: "Fúria Implacável", desc: "Em fúria, ao cair a 0 PV, faça um teste de Constituição (CD 10, aumenta a cada uso) para ficar com 1 PV." },
    asi(12),
    { level: 13, name: "Crítico Brutal (2 dados)", desc: "Crítico corpo a corpo rola dois dados de dano extras." },
    { level: 15, name: "Fúria Persistente", desc: "Sua fúria só termina antes da hora se você cair inconsciente ou escolher encerrá-la." },
    asi(16),
    { level: 17, name: "Crítico Brutal (3 dados)", desc: "Crítico corpo a corpo rola três dados de dano extras." },
    { level: 18, name: "Força Indomável", desc: "Se o total de um teste de Força for menor que seu valor de Força, use o valor de Força no lugar." },
    asi(19),
    { level: 20, name: "Campeão Primitivo", desc: "Força e Constituição aumentam em 4 (máximo 24)." },
  ],
  Bardo: [
    { level: 1, name: "Conjuração", desc: "Lança magias de bardo usando Carisma. Um instrumento musical serve de foco." },
    { level: 1, name: "Inspiração de Bardo (d6)", desc: "Como ação bônus, dá a um aliado um dado de inspiração para somar a um teste, ataque ou resistência. Usos iguais ao seu modificador de Carisma por descanso longo." },
    { level: 2, name: "Pau para Toda Obra", desc: "Soma metade do bônus de proficiência em testes de atributo em que não é proficiente." },
    { level: 2, name: "Canção de Descanso (d6)", desc: "Durante um descanso curto, aliados que gastarem dados de vida recuperam 1d6 PV a mais." },
    { level: 3, name: "Colégio de Bardo", desc: "Escolha sua subclasse: o colégio onde você aprendeu sua arte." },
    { level: 3, name: "Aptidão", desc: "Escolha duas perícias proficientes: você soma o dobro do bônus de proficiência nelas." },
    asi(4),
    { level: 5, name: "Inspiração de Bardo (d8) e Fonte de Inspiração", desc: "O dado de inspiração vira d8 e os usos voltam também em descansos curtos." },
    { level: 6, name: "Contra-Encanto", desc: "Com uma música, você e aliados próximos ganham vantagem contra ficar amedrontados ou enfeitiçados." },
    asi(8),
    { level: 9, name: "Canção de Descanso (d8)", desc: "A cura extra no descanso curto vira 1d8." },
    { level: 10, name: "Inspiração (d10), Aptidão e Segredos Mágicos", desc: "Dado de inspiração vira d10, mais duas perícias com aptidão e você aprende duas magias de qualquer classe." },
    asi(12),
    { level: 13, name: "Canção de Descanso (d10)", desc: "A cura extra no descanso curto vira 1d10." },
    { level: 14, name: "Segredos Mágicos", desc: "Aprende mais duas magias de qualquer classe." },
    { level: 15, name: "Inspiração de Bardo (d12)", desc: "O dado de inspiração vira d12." },
    asi(16),
    { level: 17, name: "Canção de Descanso (d12)", desc: "A cura extra no descanso curto vira 1d12." },
    { level: 18, name: "Segredos Mágicos", desc: "Aprende mais duas magias de qualquer classe." },
    asi(19),
    { level: 20, name: "Inspiração Superior", desc: "Se rolar iniciativa sem nenhum uso de inspiração, recupera um." },
  ],
  Bruxo: [
    { level: 3, name: "Patrono Transcendental", desc: "Escolha sua subclasse: o ser poderoso com quem você fez o pacto." },
    { level: 1, name: "Magia de Pacto", desc: "Poucos espaços de magia, mas sempre no nível mais alto que você alcança, e eles voltam em um descanso curto. Usa Carisma." },
    { level: 2, name: "Invocações Místicas", desc: "Aprende duas invocações: poderes permanentes, como melhorar o Rajada Mística ou ver no escuro mágico. Ganha mais conforme sobe de nível." },
    { level: 3, name: "Dádiva do Pacto", desc: "Seu patrono dá um presente: uma arma mágica que você invoca (Lâmina), um familiar especial (Corrente) ou um livro de truques extras (Tomo)." },
    asi(4),
    asi(8),
    { level: 11, name: "Arcana Mística (6º nível)", desc: "Escolhe uma magia de 6º nível para lançar uma vez por descanso longo, sem gastar espaço." },
    asi(12),
    { level: 13, name: "Arcana Mística (7º nível)", desc: "Ganha uma magia de 7º nível do mesmo jeito." },
    { level: 15, name: "Arcana Mística (8º nível)", desc: "Ganha uma magia de 8º nível do mesmo jeito." },
    asi(16),
    { level: 17, name: "Arcana Mística (9º nível)", desc: "Ganha uma magia de 9º nível do mesmo jeito." },
    asi(19),
    { level: 20, name: "Mestre Místico", desc: "Uma vez por descanso longo, passa 1 minuto suplicando ao patrono e recupera todos os espaços de Magia de Pacto." },
  ],
  Clérigo: [
    { level: 1, name: "Conjuração", desc: "Prepara magias de clérigo todo dia usando Sabedoria. Um símbolo sagrado serve de foco." },
    { level: 3, name: "Domínio Divino", desc: "Escolha sua subclasse: o aspecto do seu deus que você representa." },
    { level: 2, name: "Canalizar Divindade (1/descanso)", desc: "Canaliza poder divino. Todo clérigo pode Expulsar Mortos-Vivos (eles fogem); o domínio dá outra opção. Volta em descanso curto." },
    asi(4),
    { level: 5, name: "Destruir Mortos-Vivos (ND 1/2)", desc: "Mortos-vivos fracos que falharem contra seu Expulsar são destruídos na hora. O limite de força aumenta com o nível." },
    { level: 6, name: "Canalizar Divindade (2/descanso)", desc: "Pode canalizar divindade duas vezes entre descansos." },
    asi(8),
    { level: 10, name: "Intervenção Divina", desc: "Pede ajuda direta ao seu deus. Role d100: se tirar igual ou menos que seu nível, o deus intervém." },
    asi(12),
    asi(16),
    { level: 18, name: "Canalizar Divindade (3/descanso)", desc: "Pode canalizar divindade três vezes entre descansos." },
    asi(19),
    { level: 20, name: "Intervenção Divina Aprimorada", desc: "Seu pedido de intervenção divina funciona automaticamente." },
  ],
  Druida: [
    { level: 1, name: "Druídico", desc: "Conhece o idioma secreto dos druidas." },
    { level: 1, name: "Conjuração", desc: "Prepara magias de druida todo dia usando Sabedoria. Um foco druídico serve de foco." },
    { level: 2, name: "Forma Selvagem", desc: "Duas vezes por descanso curto, vira um animal que já viu (no começo, bichos fracos e sem voo ou nado). Usa os PV da fera; ao zerar, volta à sua forma." },
    { level: 3, name: "Círculo Druídico", desc: "Escolha sua subclasse: o círculo de druidas ao qual você pertence." },
    { level: 4, name: "Forma Selvagem Aprimorada", desc: "Pode virar feras um pouco mais fortes e que nadam." },
    asi(4),
    { level: 8, name: "Forma Selvagem Aprimorada", desc: "Pode virar feras mais fortes, inclusive voadoras." },
    asi(8),
    asi(12),
    asi(16),
    { level: 18, name: "Corpo Atemporal e Magias de Fera", desc: "Envelhece muito devagar e pode lançar magias enquanto está em forma animal." },
    asi(19),
    { level: 20, name: "Arquidruida", desc: "Usa a Forma Selvagem quantas vezes quiser e ignora vários componentes das magias." },
  ],
  Feiticeiro: [
    { level: 1, name: "Conjuração", desc: "Magia inata usando Carisma. Conhece poucas magias, mas as lança com flexibilidade." },
    { level: 3, name: "Origem de Feitiçaria", desc: "Escolha sua subclasse: de onde vem o seu poder." },
    { level: 2, name: "Fonte de Magia", desc: "Ganha pontos de feitiçaria (igual ao nível) para criar espaços de magia ou transformar espaços em pontos." },
    { level: 3, name: "Metamagia", desc: "Aprende duas formas de moldar magias com pontos de feitiçaria: lançar em dois alvos, mais longe, mais rápido, sem gestos…" },
    asi(4),
    asi(8),
    { level: 10, name: "Metamagia", desc: "Aprende mais uma opção de Metamagia." },
    asi(12),
    asi(16),
    { level: 17, name: "Metamagia", desc: "Aprende mais uma opção de Metamagia." },
    asi(19),
    { level: 20, name: "Restauração Mística", desc: "Recupera 4 pontos de feitiçaria ao terminar um descanso curto." },
  ],
  Guerreiro: [
    { level: 1, name: "Estilo de Luta", desc: "Escolha uma especialidade: Arquearia (+2 em ataques à distância), Defesa (+1 CA com armadura), Duelismo (+2 de dano com arma em uma mão), Combate com Armas Grandes, Proteção ou Combate com Duas Armas." },
    { level: 1, name: "Retomar o Fôlego", desc: "Uma vez por descanso curto, como ação bônus, recupera 1d10 + seu nível de guerreiro em PV." },
    { level: 2, name: "Surto de Ação", desc: "Uma vez por descanso curto, ganha uma ação extra no seu turno." },
    { level: 3, name: "Arquétipo Marcial", desc: "Escolha sua subclasse: o estilo de guerreiro que você segue." },
    asi(4),
    { level: 5, name: "Ataque Extra", desc: "Ao usar a ação Atacar, faz dois ataques." },
    asi(6),
    asi(8),
    { level: 9, name: "Indomável", desc: "Uma vez por descanso longo, pode rolar de novo um teste de resistência que falhou." },
    { level: 11, name: "Ataque Extra (2)", desc: "Faz três ataques com a ação Atacar." },
    asi(12),
    { level: 13, name: "Indomável (2 usos)", desc: "Pode usar Indomável duas vezes por descanso longo." },
    asi(14),
    asi(16),
    { level: 17, name: "Surto de Ação (2 usos) e Indomável (3 usos)", desc: "Dois Surtos de Ação por descanso (um por turno) e três usos de Indomável." },
    asi(19),
    { level: 20, name: "Ataque Extra (3)", desc: "Faz quatro ataques com a ação Atacar." },
  ],
  Ladino: [
    { level: 1, name: "Aptidão", desc: "Escolha duas perícias proficientes (ou uma e ferramentas de ladrão): soma o dobro do bônus de proficiência nelas." },
    { level: 1, name: "Ataque Furtivo (1d6)", desc: "Uma vez por turno, causa dano extra ao acertar com arma de acuidade ou à distância se tiver vantagem ou um aliado ao lado do alvo. Cresce 1d6 a cada dois níveis (10d6 no 19º)." },
    { level: 1, name: "Gíria de Ladrão", desc: "Conhece o código secreto de sinais e palavras dos ladrões." },
    { level: 2, name: "Ação Ardilosa", desc: "Como ação bônus, pode Correr, Desengajar ou Esconder-se em todo turno." },
    { level: 3, name: "Arquétipo de Ladino", desc: "Escolha sua subclasse: o tipo de ladino que você é." },
    asi(4),
    { level: 5, name: "Esquiva Sobrenatural", desc: "Quando um ataque que você vê te acerta, usa a reação para sofrer metade do dano." },
    { level: 6, name: "Aptidão", desc: "Mais duas perícias com o dobro de proficiência." },
    { level: 7, name: "Evasão", desc: "Em efeitos de área com resistência de Destreza (como Bola de Fogo), passar não causa dano e falhar causa metade." },
    asi(8),
    asi(10),
    { level: 11, name: "Talento Confiável", desc: "Em perícias proficientes, qualquer resultado de 9 ou menos no d20 conta como 10." },
    asi(12),
    { level: 14, name: "Sentido Cego", desc: "Sabe onde estão criaturas escondidas ou invisíveis a até 3 m." },
    { level: 15, name: "Mente Escorregadia", desc: "Ganha proficiência em testes de resistência de Sabedoria." },
    asi(16),
    { level: 18, name: "Elusivo", desc: "Ataques contra você nunca têm vantagem enquanto você estiver consciente." },
    asi(19),
    { level: 20, name: "Golpe de Sorte", desc: "Uma vez por descanso curto, transforma um erro em acerto ou um teste falho em 20." },
  ],
  Mago: [
    { level: 1, name: "Conjuração", desc: "Aprende magias de um grimório e prepara algumas por dia usando Inteligência. A maior lista de magias do jogo." },
    { level: 1, name: "Recuperação Arcana", desc: "Uma vez por dia, num descanso curto, recupera espaços de magia que somem até metade do seu nível." },
    { level: 3, name: "Tradição Arcana", desc: "Escolha sua subclasse: a escola de magia em que você se especializa." },
    asi(4),
    asi(8),
    asi(12),
    asi(16),
    { level: 18, name: "Domínio de Magia", desc: "Escolhe uma magia de 1º e uma de 2º nível para lançar à vontade, sem gastar espaço." },
    asi(19),
    { level: 20, name: "Assinatura Mágica", desc: "Duas magias de 3º nível ficam sempre preparadas e podem ser lançadas uma vez cada por descanso curto sem gastar espaço." },
  ],
  Monge: [
    { level: 1, name: "Defesa sem Armadura", desc: "Sem armadura e sem escudo, sua CA é 10 + Destreza + Sabedoria." },
    { level: 1, name: "Artes Marciais", desc: "Golpes desarmados e armas de monge usam Destreza, causam 1d4 (cresce com o nível) e permitem um soco extra como ação bônus." },
    { level: 2, name: "Ki", desc: "Pontos de ki (igual ao nível) para Rajada de Golpes (dois socos extras), Defesa Paciente (Esquivar como ação bônus) ou Passo do Vento. Voltam em descanso curto." },
    { level: 2, name: "Movimento sem Armadura", desc: "+3 m de deslocamento sem armadura (aumenta com o nível)." },
    { level: 3, name: "Tradição Monástica", desc: "Escolha sua subclasse: a tradição do seu mosteiro." },
    { level: 3, name: "Defletir Projéteis", desc: "Usa a reação para reduzir o dano de um projétil; se zerar, pode pegá-lo e arremessá-lo de volta." },
    asi(4),
    { level: 4, name: "Queda Lenta", desc: "Usa a reação para reduzir o dano de queda em 5 × seu nível de monge." },
    { level: 5, name: "Ataque Extra", desc: "Ao usar a ação Atacar, faz dois ataques." },
    { level: 5, name: "Ataque Atordoante", desc: "Ao acertar, gaste 1 ki: o alvo faz resistência de Constituição ou fica atordoado até o fim do seu próximo turno." },
    { level: 6, name: "Golpes de Ki", desc: "Seus golpes desarmados contam como mágicos para vencer resistências." },
    { level: 7, name: "Evasão", desc: "Em efeitos de área com resistência de Destreza, passar não causa dano e falhar causa metade." },
    { level: 7, name: "Mente Tranquila", desc: "Usa a ação para encerrar um efeito que o deixe enfeitiçado ou amedrontado." },
    asi(8),
    { level: 9, name: "Movimento sem Armadura Aprimorado", desc: "Pode correr por superfícies verticais e sobre líquidos no seu turno." },
    { level: 10, name: "Pureza Corporal", desc: "Imune a doenças e venenos." },
    asi(12),
    { level: 13, name: "Idioma do Sol e da Lua", desc: "Entende e é entendido em qualquer idioma falado." },
    { level: 14, name: "Alma de Diamante", desc: "Proficiência em todas as resistências; pode gastar 1 ki para rolar de novo uma que falhou." },
    { level: 15, name: "Corpo Atemporal", desc: "Não sofre os efeitos da velhice e não precisa comer nem beber." },
    asi(16),
    { level: 18, name: "Corpo Vazio", desc: "Gasta 4 ki para ficar invisível e resistente a quase todo dano por 1 minuto." },
    asi(19),
    { level: 20, name: "Autoperfeição", desc: "Se rolar iniciativa sem ki, recupera 4 pontos." },
  ],
  Paladino: [
    { level: 1, name: "Sentido Divino", desc: "Por um instante, sente celestiais, corruptores e mortos-vivos a até 18 m." },
    { level: 1, name: "Cura pelas Mãos", desc: "Tem uma reserva de cura igual a 5 × seu nível de paladino por descanso longo, que distribui tocando aliados." },
    { level: 2, name: "Estilo de Luta", desc: "Escolha Defesa, Duelismo, Combate com Armas Grandes ou Proteção." },
    { level: 2, name: "Conjuração", desc: "Prepara magias de paladino usando Carisma." },
    { level: 2, name: "Destruição Divina", desc: "Ao acertar um ataque corpo a corpo, gaste um espaço de magia para causar 2d8 de dano radiante extra (mais contra mortos-vivos)." },
    { level: 3, name: "Saúde Divina", desc: "Imune a doenças." },
    { level: 3, name: "Juramento Sagrado", desc: "Escolha sua subclasse: o juramento que guia o seu caminho." },
    asi(4),
    { level: 5, name: "Ataque Extra", desc: "Ao usar a ação Atacar, faz dois ataques." },
    { level: 6, name: "Aura de Proteção", desc: "Você e aliados a até 3 m somam seu modificador de Carisma em todos os testes de resistência." },
    asi(8),
    { level: 10, name: "Aura de Coragem", desc: "Você e aliados a até 3 m não podem ficar amedrontados." },
    { level: 11, name: "Destruição Divina Aprimorada", desc: "Todo ataque corpo a corpo que acerta causa 1d8 de dano radiante extra." },
    asi(12),
    { level: 14, name: "Toque Purificador", desc: "Encerra uma magia em você ou num aliado com um toque." },
    asi(16),
    { level: 18, name: "Auras Aprimoradas", desc: "Suas auras passam a alcançar 9 m." },
    asi(19),
  ],
  Patrulheiro: [
    { level: 1, name: "Inimigo Favorito", desc: "Escolha um tipo de criatura (feras, mortos-vivos…): vantagem para rastreá-la e lembrar informações sobre ela, e aprende um idioma dela." },
    { level: 1, name: "Explorador Natural", desc: "Escolha um terreno favorito: você e seu grupo viajam sem se perder, encontram comida e não são retardados por terreno difícil nele." },
    { level: 2, name: "Estilo de Luta", desc: "Escolha Arquearia, Defesa, Duelismo ou Combate com Duas Armas." },
    { level: 2, name: "Conjuração", desc: "Conhece magias de patrulheiro usando Sabedoria." },
    { level: 3, name: "Arquétipo de Patrulheiro", desc: "Escolha sua subclasse: caçador ou mestre das feras." },
    { level: 3, name: "Consciência Primitiva", desc: "Gasta um espaço de magia para sentir se há inimigos favoritos por perto." },
    asi(4),
    { level: 5, name: "Ataque Extra", desc: "Ao usar a ação Atacar, faz dois ataques." },
    { level: 6, name: "Inimigo Favorito e Explorador Natural Aprimorados", desc: "Escolha mais um inimigo favorito e mais um terreno favorito." },
    asi(8),
    { level: 8, name: "Pés Ligeiros", desc: "Terreno difícil não mágico não te atrasa e plantas não te arranham." },
    { level: 10, name: "Camuflagem Natural", desc: "Gasta 1 minuto para se camuflar: +10 em Furtividade enquanto ficar parado." },
    asi(12),
    { level: 14, name: "Desaparecer", desc: "Pode se Esconder como ação bônus e não pode ser rastreado por meios não mágicos." },
    asi(16),
    { level: 18, name: "Sentidos Selvagens", desc: "Ataca criaturas invisíveis sem desvantagem e sabe onde estão a até 9 m." },
    asi(19),
    { level: 20, name: "Matador de Inimigos", desc: "Uma vez por turno, soma Sabedoria no ataque ou no dano contra um inimigo favorito." },
  ],
};

// ---------------------------------------------------------------------------
// Subclasses
// ---------------------------------------------------------------------------

export type SubclassDef = { name: string; desc: string; features: Feature[] };
export type SubclassGroup = { label: string; level: number; options: SubclassDef[] };

export const SUBCLASSES: Record<string, SubclassGroup> = {
  Bárbaro: {
    label: "Caminho Primitivo",
    level: 3,
    options: [
    {
        name: "Caminho do Berserker",
        desc: "Fúria pura e violenta: mais ataques, a qualquer custo.",
        features: [
          { level: 3, name: "Frenesi", desc: "Na fúria, pode entrar em frenesi: faz um ataque extra como ação bônus a cada turno, mas fica exausto quando a fúria acaba." },
          { level: 6, name: "Fúria Irracional", desc: "Em fúria, não pode ser enfeitiçado nem amedrontado." },
          { level: 10, name: "Presença Intimidante", desc: "Usa a ação para amedrontar uma criatura com sua presença assustadora." },
          { level: 14, name: "Retaliação", desc: "Quando uma criatura próxima te causa dano, pode atacá-la de volta com a reação." },
        ],
      },
  ],
  },
  Bardo: {
    label: "Colégio de Bardo",
    level: 3,
    options: [
    {
        name: "Colégio do Conhecimento",
        desc: "O bardo que sabe de tudo e atrapalha os inimigos com palavras.",
        features: [
          { level: 3, name: "Proficiências Adicionais", desc: "Ganha proficiência em três perícias quaisquer." },
          { level: 3, name: "Palavras Cortantes", desc: "Usa a reação e um dado de inspiração para diminuir o ataque, o teste ou o dano de um inimigo." },
          { level: 6, name: "Segredos Mágicos Adicionais", desc: "Aprende duas magias de qualquer classe." },
          { level: 14, name: "Perícia Inigualável", desc: "Pode gastar um dado de inspiração em seus próprios testes de atributo." },
        ],
      },
  ],
  },
  Bruxo: {
    label: "Patrono Transcendental",
    level: 3,
    options: [
    {
        name: "O Corruptor",
        desc: "Um ser dos planos inferiores, como um diabo ou demônio.",
        features: [
          { level: 1, name: "Bênção do Obscuro", desc: "Ao derrubar um inimigo a 0 PV, ganha PV temporários (Carisma + nível de bruxo)." },
          { level: 6, name: "Sorte do Próprio Obscuro", desc: "Uma vez por descanso curto, soma 1d10 a um teste de atributo ou resistência." },
          { level: 10, name: "Resistência Infernal", desc: "Escolhe um tipo de dano a cada descanso para ter resistência." },
          { level: 14, name: "Arremessar no Inferno", desc: "Ao acertar um ataque, manda o alvo por um instante aos planos inferiores: ele volta com 10d10 de dano psíquico." },
        ],
      },
  ],
  },
  Clérigo: {
    label: "Domínio Divino",
    level: 3,
    options: [
    {
        name: "Domínio da Vida",
        desc: "Deuses da cura e da vida. O melhor curador do jogo.",
        features: [
          { level: 1, name: "Proficiência Adicional", desc: "Armaduras pesadas." },
          { level: 1, name: "Discípulo da Vida", desc: "Magias de cura curam 2 + o nível da magia a mais." },
          { level: 2, name: "Canalizar Divindade: Preservar a Vida", desc: "Distribui cura igual a 5 × seu nível entre aliados feridos." },
          { level: 6, name: "Curandeiro Abençoado", desc: "Ao curar outra pessoa, você também se cura um pouco." },
          { level: 8, name: "Golpe Divino", desc: "Uma vez por turno, +1d8 de dano radiante com arma (2d8 no 14º)." },
          { level: 17, name: "Cura Suprema", desc: "Suas magias de cura sempre curam o valor máximo dos dados." },
        ],
      },
  ],
  },
  Druida: {
    label: "Círculo Druídico",
    level: 3,
    options: [
    {
        name: "Círculo da Terra",
        desc: "Druidas místicos, guardiões de conhecimentos antigos. Mais magia.",
        features: [
          { level: 2, name: "Truque Adicional e Recuperação Natural", desc: "Um truque de druida extra e, uma vez por dia, recupera espaços de magia num descanso curto." },
          { level: 3, name: "Magias do Círculo", desc: "Escolha um terreno (ártico, costa, deserto, floresta, montanha…): ganha magias extras sempre preparadas." },
          { level: 6, name: "Passo da Terra", desc: "Terreno difícil não mágico não te atrasa e plantas não te ferem." },
          { level: 10, name: "Proteção da Natureza", desc: "Imune a veneno, doenças e ao encanto/medo de elementais e fadas." },
          { level: 14, name: "Santuário Natural", desc: "Feras e plantas hesitam em te atacar." },
        ],
      },
  ],
  },
  Feiticeiro: {
    label: "Origem de Feitiçaria",
    level: 3,
    options: [
    {
        name: "Linhagem Dracônica",
        desc: "Sangue de dragão corre nas suas veias.",
        features: [
          { level: 1, name: "Ancestral Dracônico e Resiliência Dracônica", desc: "Escolha um tipo de dragão. +1 PV por nível e, sem armadura, CA 13 + Destreza (escamas)." },
          { level: 6, name: "Afinidade Elemental", desc: "Soma Carisma ao dano de magias do elemento do seu dragão." },
          { level: 14, name: "Asas de Dragão", desc: "Faz brotar asas e voa." },
          { level: 18, name: "Presença Dracônica", desc: "Emana uma aura de medo ou fascínio." },
        ],
      },
  ],
  },
  Guerreiro: {
    label: "Arquétipo Marcial",
    level: 3,
    options: [
    {
        name: "Campeão",
        desc: "Força e perfeição física. O arquétipo mais simples para iniciantes.",
        features: [
          { level: 3, name: "Crítico Aprimorado", desc: "Seus ataques com arma são críticos com 19 ou 20." },
          { level: 7, name: "Atleta Notável", desc: "Soma metade da proficiência em testes de Força, Destreza e Constituição sem proficiência e salta mais longe." },
          { level: 10, name: "Estilo de Luta Adicional", desc: "Escolha um segundo Estilo de Luta." },
          { level: 15, name: "Crítico Superior", desc: "Críticos com 18, 19 ou 20." },
          { level: 18, name: "Sobrevivente", desc: "Com menos da metade dos PV, recupera 5 + Constituição a cada turno." },
        ],
      },
  ],
  },
  Ladino: {
    label: "Arquétipo de Ladino",
    level: 3,
    options: [
    {
        name: "Ladrão",
        desc: "Especialista em furtos, escaladas e itens.",
        features: [
          { level: 3, name: "Mãos Rápidas e Trabalho no Segundo Andar", desc: "Usa objetos e abre fechaduras como ação bônus; escala sem gastar movimento extra e salta mais longe." },
          { level: 9, name: "Furtividade Suprema", desc: "Vantagem em Furtividade se andar devagar." },
          { level: 13, name: "Usar Instrumento Mágico", desc: "Usa itens mágicos que exigem classe, raça ou nível." },
          { level: 17, name: "Reflexos de Ladrão", desc: "Tem dois turnos na primeira rodada de combate." },
        ],
      },
  ],
  },
  Mago: {
    label: "Tradição Arcana",
    level: 3,
    options: [
    { name: "Escola de Evocação", desc: "Explosões de energia: fogo, gelo, raio. A escola mais simples para começar.", features: [
        { level: 2, name: "Esculpir Magias", desc: "Suas explosões de área não atingem os aliados que você escolher." },
        { level: 6, name: "Truque Potente", desc: "Mesmo quando o alvo passa na resistência, seus truques causam metade do dano." },
        { level: 10, name: "Evocação Potencializada", desc: "Soma Inteligência ao dano das evocações." },
        { level: 14, name: "Sobrecarga", desc: "Causa o dano máximo com uma magia (arriscado se repetir no mesmo dia)." } ] },
  ],
  },
  Monge: {
    label: "Tradição Monástica",
    level: 3,
    options: [
    {
        name: "Caminho da Mão Aberta",
        desc: "Mestres do combate desarmado.",
        features: [
          { level: 3, name: "Técnica da Mão Aberta", desc: "A Rajada de Golpes pode derrubar, empurrar ou impedir reações do alvo." },
          { level: 6, name: "Integridade Corporal", desc: "Uma vez por descanso longo, cura 3 × seu nível de monge." },
          { level: 11, name: "Tranquilidade", desc: "Após o descanso longo, fica protegido como pela magia Santuário." },
          { level: 17, name: "Palma Vibrante", desc: "Gasta ki para criar vibrações que podem derrubar o alvo a 0 PV depois." },
        ],
      },
  ],
  },
  Paladino: {
    label: "Juramento Sagrado",
    level: 3,
    options: [
    {
        name: "Juramento de Devoção",
        desc: "O cavaleiro honrado de armadura brilhante.",
        features: [
          { level: 3, name: "Magias do Juramento e Canalizar Divindade", desc: "Magias extras sempre preparadas. Arma Sagrada (soma Carisma no ataque e brilha) ou Expulsar o Profano." },
          { level: 7, name: "Aura de Devoção", desc: "Você e aliados próximos não podem ser enfeitiçados." },
          { level: 15, name: "Pureza de Espírito", desc: "Fica sempre sob Proteção contra o Bem e o Mal." },
          { level: 20, name: "Auréola Sagrada", desc: "Uma vez por dia, emana luz solar que fere inimigos e protege você." },
        ],
      },
  ],
  },
  Patrulheiro: {
    label: "Arquétipo de Patrulheiro",
    level: 3,
    options: [
    {
        name: "Caçador",
        desc: "Especialista em enfrentar as ameaças dos ermos.",
        features: [
          { level: 3, name: "Presa do Caçador", desc: "Escolha: Matador de Colossos (+1d8 em alvos feridos), Matador de Gigantes (contra-ataca criaturas grandes) ou Destruidor de Hordas (ataque extra em inimigo ao lado)." },
          { level: 7, name: "Táticas Defensivas", desc: "Escolha uma defesa: contra medo, contra vários ataques ou contra ataques de oportunidade." },
          { level: 11, name: "Ataque Múltiplo", desc: "Rajada de flechas em uma área ou giro atacando todos ao redor." },
          { level: 15, name: "Defesa Superior do Caçador", desc: "Evasão, esquiva sobrenatural ou resistir a sequências de ataques." },
        ],
      },
  ],
  },
};

// ---------------------------------------------------------------------------
// Talentos
// ---------------------------------------------------------------------------

export type FeatDef = {
  name: string;
  /** Nome em inglês, para consultar livros e vídeos */
  en: string;
  prereq?: string;
  /** Aumento de atributo, se houver */
  bonus?: string;
  desc: string;
  /** Talento de Origem (regra 2024): concedido de graça no 1º nível pelo antecedente */
  origin?: boolean;
};

export const FEATS: FeatDef[] = [
  { name: "Adepto Elemental", en: "Elemental Adept", prereq: "Conjurar ao menos uma magia", desc: "Escolha ácido, frio, fogo, elétrico ou trovejante: suas magias ignoram resistência a esse dano e dados que tirarem 1 contam como 2." },
  { name: "Adepto Marcial", en: "Martial Adept", desc: "Aprende duas manobras do Mestre de Batalha e ganha um dado de superioridade (d6) por descanso curto." },
  { name: "Agarrador", en: "Grappler", prereq: "Força 13", desc: "Vantagem nos ataques contra quem você está agarrando e pode tentar imobilizá-lo." },
  { name: "Alerta", en: "Alert", desc: "+5 na iniciativa, não pode ser surpreendido e inimigos escondidos não ganham vantagem contra você.", origin: true },
  { name: "Atacante Selvagem", en: "Savage Attacker", desc: "Uma vez por turno, rola o dano de uma arma corpo a corpo duas vezes e usa o maior." , origin: true },
  { name: "Atirador de Elite", en: "Sharpshooter", desc: "Ignora cobertura parcial e distância longa. Pode aceitar −5 no ataque à distância para causar +10 de dano." },
  { name: "Atirador de Magia", en: "Spell Sniper", prereq: "Conjurar ao menos uma magia", desc: "Dobra o alcance das magias de ataque, ignora cobertura parcial e aprende um truque de ataque." },
  { name: "Atleta", en: "Athlete", bonus: "+1 Força ou Destreza", desc: "Levanta-se do chão gastando pouco movimento, escala sem custo extra e salta com pouca corrida." },
  { name: "Ator", en: "Actor", bonus: "+1 Carisma", desc: "Vantagem em Enganação e Atuação ao se passar por outra pessoa e imita vozes e sons." },
  { name: "Blindagem Leve", en: "Lightly Armored", bonus: "+1 Força ou Destreza", desc: "Ganha proficiência em armaduras leves." },
  { name: "Blindagem Moderada", en: "Moderately Armored", prereq: "Proficiência em armadura leve", bonus: "+1 Força ou Destreza", desc: "Ganha proficiência em armaduras médias e escudos." },
  { name: "Blindagem Pesada", en: "Heavily Armored", prereq: "Proficiência em armadura média", bonus: "+1 Força", desc: "Ganha proficiência em armaduras pesadas." },
  { name: "Brigão de Taverna", en: "Tavern Brawler", bonus: "+1 Força ou Constituição", desc: "Soco causa 1d4, sabe usar objetos improvisados como arma (cadeiras, canecas!) e agarra como ação bônus após acertar." , origin: true },
  { name: "Combatente Montado", en: "Mounted Combatant", desc: "Vantagem contra criaturas menores que sua montaria e protege a montaria de ataques e efeitos de área." },
  { name: "Conjurador de Guerra", en: "War Caster", prereq: "Conjurar ao menos uma magia", desc: "Vantagem para manter a concentração, conjura com as mãos ocupadas e pode lançar uma magia como ataque de oportunidade." },
  { name: "Conjurador Ritualista", en: "Ritual Caster", prereq: "Inteligência ou Sabedoria 13", desc: "Ganha um livro com duas magias de ritual e pode copiar outras que encontrar." },
  { name: "Curandeiro", en: "Healer", desc: "Estabiliza aliados caídos com 1 PV usando um kit de primeiros-socorros e cura 1d6 + 4 + nível do alvo." , origin: true },
  { name: "Duelista Defensivo", en: "Defensive Duelist", prereq: "Destreza 13", desc: "Com uma arma de acuidade, usa a reação para somar sua proficiência na CA contra um ataque." },
  { name: "Durável", en: "Durable", bonus: "+1 Constituição", desc: "Ao gastar dados de vida, recupera no mínimo o dobro do seu modificador de Constituição." },
  { name: "Especialista em Besta", en: "Crossbow Expert", desc: "Ignora a propriedade Recarga, não tem desvantagem atirando de perto e ataca com besta de mão como ação bônus." },
  { name: "Espreitador", en: "Skulker", prereq: "Destreza 13", desc: "Esconde-se na penumbra, errar um ataque escondido não revela sua posição e enxerga normal na penumbra." },
  { name: "Explorador de Masmorras", en: "Dungeon Delver", desc: "Vantagem para achar portas secretas e contra armadilhas, e resistência ao dano delas." },
  { name: "Habilidoso", en: "Skilled", desc: "Ganha proficiência em três perícias ou ferramentas quaisquer." , origin: true },
  { name: "Artesão", en: "Crafter", desc: "Ganha proficiência com três ferramentas de artesão à escolha. Ao comprar itens comuns, paga 20% a menos, e pode fabricar certos itens simples num descanso longo.", origin: true },
  { name: "Iniciado em Magia", en: "Magic Initiate", desc: "Escolha uma classe conjuradora: aprende dois truques e uma magia de 1º nível dela (uma vez por dia).", origin: true },
  { name: "Músico", en: "Musician", desc: "Ganha proficiência com três instrumentos musicais à escolha. Tocando por 1 minuto num descanso, dá Inspiração Heroica a um número de aliados igual à sua proficiência.", origin: true },
  { name: "Investida", en: "Charger", desc: "Após Correr, faz um ataque como ação bônus: +5 de dano ou empurra o alvo 3 m." },
  { name: "Líder Inspirador", en: "Inspiring Leader", prereq: "Carisma 13", desc: "Um discurso de 10 minutos dá a até seis aliados PV temporários iguais a seu nível + Carisma." },
  { name: "Linguista", en: "Linguist", bonus: "+1 Inteligência", desc: "Aprende três idiomas e cria códigos secretos." },
  { name: "Lutador com Duas Armas", en: "Dual Wielder", desc: "+1 na CA com uma arma em cada mão, pode usar armas que não são leves e saca duas ao mesmo tempo." },
  { name: "Matador de Magos", en: "Mage Slayer", desc: "Ataca como reação quem conjura perto de você, atrapalha a concentração deles e tem vantagem contra magias deles." },
  { name: "Mente Aguçada", en: "Keen Mind", bonus: "+1 Inteligência", desc: "Sempre sabe onde fica o norte e que horas são, e lembra de tudo que viu ou ouviu no último mês." },
  { name: "Mestre de Armas", en: "Weapon Master", bonus: "+1 Força ou Destreza", desc: "Ganha proficiência em quatro armas à escolha." },
  { name: "Mestre de Armas Grandes", en: "Great Weapon Master", desc: "Ao critar ou derrubar alguém, ataca de novo como ação bônus. Pode aceitar −5 no ataque com arma pesada para +10 de dano." },
  { name: "Mestre em Armadura Média", en: "Medium Armor Master", prereq: "Proficiência em armadura média", desc: "Armadura média sem desvantagem em Furtividade e soma até +3 de Destreza na CA." },
  { name: "Mestre em Armadura Pesada", en: "Heavy Armor Master", prereq: "Proficiência em armadura pesada", bonus: "+1 Força", desc: "Com armadura pesada, reduz em 3 o dano cortante, perfurante e de concussão não mágico." },
  { name: "Mestre em Armas de Haste", en: "Polearm Master", desc: "Com glaive, alabarda ou bordão, ataca com a outra ponta como ação bônus e ataca quem entra no seu alcance." },
  { name: "Mestre em Escudo", en: "Shield Master", desc: "Empurra com o escudo como ação bônus e soma o escudo em resistências de Destreza." },
  { name: "Mobilidade", en: "Mobile", desc: "+3 m de deslocamento, ignora terreno difícil ao Correr e não provoca ataque de oportunidade de quem você atacou." },
  { name: "Observador", en: "Observant", bonus: "+1 Inteligência ou Sabedoria", desc: "Lê lábios e ganha +5 na Percepção e na Investigação passivas." },
  { name: "Resiliente", en: "Resilient", bonus: "+1 no atributo escolhido", desc: "Escolha um atributo: +1 nele e proficiência nos testes de resistência dele." },
  { name: "Robusto", en: "Tough", desc: "Seus PV máximos aumentam em 2 por nível." , origin: true },
  { name: "Sentinela", en: "Sentinel", desc: "Quem você acerta com ataque de oportunidade para de andar. Protege aliados atacando quem os ataca perto de você." },
  { name: "Sortudo", en: "Lucky", desc: "Três pontos de sorte por descanso longo: role um d20 extra em qualquer ataque, teste ou resistência (ou contra um ataque em você) e escolha o resultado." , origin: true },
];

export const findFeat = (name: string) => FEATS.find((f) => f.name === name);

/** Níveis em que a classe ganha Aumento no Valor de Habilidade (que pode virar talento). */
export function asiLevels(className?: string | null) {
  return (CLASS_FEATURES[className ?? ""] ?? []).filter((f) => f.asi).map((f) => f.level);
}

// ---------------------------------------------------------------------------
// Experiência (tabela oficial do Livro do Jogador)
// ---------------------------------------------------------------------------

/** XP mínima para cada nível (índice 0 = 1º nível). */
export const XP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

/** Maior nível que a XP permite. */
export const levelForXp = (xp: number) => {
  let lvl = 1;
  XP_TABLE.forEach((min, i) => {
    if (xp >= min) lvl = i + 1;
  });
  return lvl;
};

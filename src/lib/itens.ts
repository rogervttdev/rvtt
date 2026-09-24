/**
 * Mochila: equipamento de aventura do Livro do Jogador (D&D 5e), moedas e carga.
 * Preços em po/pp/pc e pesos em libras (lb), como no livro.
 */

export type ItemCategory = "aventura" | "iluminacao" | "recipientes" | "comida" | "roupas" | "municao" | "consumiveis" | "ferramentas" | "kits";

export const ITEM_CATEGORY_LABEL: Record<ItemCategory, string> = {
  aventura: "Equipamento de aventura",
  iluminacao: "Luz e fogo",
  recipientes: "Bolsas e recipientes",
  comida: "Comida e acampamento",
  roupas: "Roupas",
  municao: "Munição",
  consumiveis: "Poções e alquimia",
  ferramentas: "Ferramentas",
  kits: "Kits",
};

export type ItemDef = { id: string; name: string; category: ItemCategory; price: string; weight: number; desc: string };

export const ITEMS: ItemDef[] = [
  // Equipamento de aventura
  { id: "corda-canhamo", name: "Corda de cânhamo (15 m)", category: "aventura", price: "1 po", weight: 10, desc: "Aguenta até 2 pessoas. Serve para descer em buracos, amarrar prisioneiros, atravessar abismos. Nunca saia sem uma." },
  { id: "corda-seda", name: "Corda de seda (15 m)", category: "aventura", price: "10 po", weight: 5, desc: "Tão resistente quanto a de cânhamo, mas pesa metade." },
  { id: "arpeu", name: "Arpéu", category: "aventura", price: "2 po", weight: 4, desc: "Gancho de metal que se prende na ponta da corda para arremessar e agarrar em muros e janelas." },
  { id: "pe-de-cabra", name: "Pé de cabra", category: "aventura", price: "2 po", weight: 5, desc: "Dá vantagem em testes de Força para arrombar portas, baús e janelas onde dê para fazer alavanca." },
  { id: "martelo", name: "Martelo", category: "aventura", price: "1 po", weight: 3, desc: "Ferramenta para pregar cravos, montar acampamento e fazer pequenos consertos." },
  { id: "marreta", name: "Marreta", category: "aventura", price: "2 po", weight: 10, desc: "Martelo grande para quebrar pedras e trancas." },
  { id: "cravos", name: "Cravos de ferro (10)", category: "aventura", price: "1 po", weight: 5, desc: "Pregos grandes para travar portas abertas ou fechadas e prender cordas na pedra." },
  { id: "vara", name: "Vara de 3 m", category: "aventura", price: "5 pc", weight: 7, desc: "O truque clássico: cutucar o chão à frente para achar armadilhas e poços antes de pisar." },
  { id: "pa", name: "Pá", category: "aventura", price: "2 po", weight: 5, desc: "Para cavar trincheiras, covas e desenterrar tesouros." },
  { id: "picareta", name: "Picareta de minerador", category: "aventura", price: "2 po", weight: 10, desc: "Quebra rocha e abre passagem em túneis." },
  { id: "corrente", name: "Corrente (3 m)", category: "aventura", price: "5 po", weight: 10, desc: "Corrente de metal difícil de quebrar (teste de Força CD 20)." },
  { id: "algemas", name: "Algemas", category: "aventura", price: "2 po", weight: 6, desc: "Prendem criaturas Pequenas ou Médias. Escapar exige Destreza CD 20; quebrar, Força CD 20." },
  { id: "fechadura", name: "Fechadura", category: "aventura", price: "10 po", weight: 1, desc: "Vem com chave. Sem ela, abrir exige ferramentas de ladrão e Destreza CD 15." },
  { id: "estrepes", name: "Estrepes (bolsa com 20)", category: "aventura", price: "1 po", weight: 2, desc: "Pontas de metal jogadas no chão: quem passa sem cuidado leva 1 de dano e anda mais devagar. Ótimo para fugas." },
  { id: "esferas", name: "Esferas de metal (bolsa com 1.000)", category: "aventura", price: "1 po", weight: 2, desc: "Espalhadas no chão, fazem quem passar correndo escorregar e cair." },
  { id: "espelho", name: "Espelho de aço", category: "aventura", price: "5 po", weight: 0.5, desc: "Para olhar em volta de cantos sem se expor e se proteger de olhares petrificantes." },
  { id: "luneta", name: "Luneta", category: "aventura", price: "1.000 po", weight: 1, desc: "Aumenta duas vezes o tamanho do que você observa de longe." },
  { id: "lupa", name: "Lupa", category: "aventura", price: "100 po", weight: 0, desc: "Vantagem para examinar objetos pequenos ou muito detalhados. Também acende fogo com luz do sol." },
  { id: "ampulheta", name: "Ampulheta", category: "aventura", price: "25 po", weight: 1, desc: "Marca a passagem do tempo." },
  { id: "apito", name: "Apito de sinalização", category: "aventura", price: "5 pc", weight: 0, desc: "Som alto e agudo para chamar o grupo ou dar alarme." },
  { id: "sineta", name: "Sineta", category: "aventura", price: "1 po", weight: 0, desc: "Pendurada numa porta ou numa linha, avisa quando alguém passa." },
  { id: "giz", name: "Giz (1 pedaço)", category: "aventura", price: "1 pc", weight: 0, desc: "Para marcar paredes e não se perder em labirintos." },
  { id: "livro", name: "Livro", category: "aventura", price: "25 po", weight: 5, desc: "Poesia, história, conhecimento… ou um diário de viagem." },
  { id: "papel", name: "Papel (1 folha)", category: "aventura", price: "2 pp", weight: 0, desc: "Para anotações e mapas." },
  { id: "pergaminho", name: "Pergaminho (1 folha)", category: "aventura", price: "1 pp", weight: 0, desc: "Folha de couro fino para escrever." },
  { id: "tinta", name: "Tinta (frasco de 30 ml)", category: "aventura", price: "10 po", weight: 0, desc: "Para escrever e copiar magias." },
  { id: "caneta", name: "Caneta tinteiro", category: "aventura", price: "2 pc", weight: 0, desc: "Pena para escrever com tinta." },
  { id: "bolsa-componentes", name: "Bolsa de componentes", category: "aventura", price: "25 po", weight: 2, desc: "Bolsinha com os materiais simples das magias. Substitui o foco de conjuração para qualquer conjurador." },
  { id: "sinete", name: "Anel de sinete", category: "aventura", price: "5 po", weight: 0, desc: "Anel com seu brasão para selar cartas com cera." },
  { id: "balanca", name: "Balança de mercador", category: "aventura", price: "5 po", weight: 3, desc: "Pesa itens e moedas para negociar sem ser enganado." },
  { id: "abaco", name: "Ábaco", category: "aventura", price: "2 po", weight: 2, desc: "Ajuda nas contas de comerciantes." },
  { id: "ariete", name: "Aríete portátil", category: "aventura", price: "4 po", weight: 35, desc: "Dá +4 em testes de Força para derrubar portas; com ajuda de outra pessoa, vantagem." },
  { id: "escada", name: "Escada (3 m)", category: "aventura", price: "1 pp", weight: 25, desc: "Escada de madeira. Pesada, mas às vezes indispensável." },
  { id: "armadilha-caca", name: "Armadilha de caça", category: "aventura", price: "5 po", weight: 25, desc: "Mandíbula de metal que prende quem pisa: 1d4 de dano perfurante e fica presa." },
  { id: "pedra-amolar", name: "Pedra de amolar", category: "aventura", price: "1 pc", weight: 1, desc: "Mantém as lâminas afiadas." },
  { id: "perfume", name: "Perfume (frasco)", category: "aventura", price: "5 po", weight: 0, desc: "Para impressionar na corte ou disfarçar o cheiro da masmorra." },
  { id: "sabao", name: "Sabão", category: "aventura", price: "2 pc", weight: 0, desc: "Para se lavar depois da aventura. O taverneiro agradece." },
  // Luz e fogo
  { id: "tocha", name: "Tocha", category: "iluminacao", price: "1 pc", weight: 1, desc: "Queima por 1 hora: luz plena em 6 m e penumbra por mais 6 m. Serve de arma improvisada (1 de dano de fogo)." },
  { id: "vela", name: "Vela", category: "iluminacao", price: "1 pc", weight: 0, desc: "Queima por 1 hora: luz plena em 1,5 m e penumbra por mais 1,5 m." },
  { id: "lamparina", name: "Lamparina", category: "iluminacao", price: "5 pp", weight: 1, desc: "Com um frasco de óleo, ilumina 4,5 m (mais 9 m de penumbra) por 6 horas." },
  { id: "lanterna-coberta", name: "Lanterna coberta", category: "iluminacao", price: "5 po", weight: 2, desc: "Ilumina 9 m (mais 9 m de penumbra) por 6 horas com um frasco de óleo. Dá para fechar a cobertura e esconder a luz." },
  { id: "lanterna-furta-fogo", name: "Lanterna furta-fogo", category: "iluminacao", price: "10 po", weight: 2, desc: "Luz em cone de 18 m (mais 18 m de penumbra), ótima para explorar corredores." },
  { id: "oleo", name: "Óleo (frasco)", category: "iluminacao", price: "1 pp", weight: 1, desc: "Combustível de lamparinas. Espalhado no chão e aceso, queima por 2 rodadas causando 5 de dano de fogo." },
  { id: "estojo-pederneira", name: "Estojo de pederneira", category: "iluminacao", price: "5 pp", weight: 1, desc: "Pederneira, aço e isca para acender fogo. Acender uma tocha leva uma ação." },
  // Bolsas e recipientes
  { id: "mochila", name: "Mochila", category: "recipientes", price: "2 po", weight: 5, desc: "Leva até 30 lb de coisas. Todo aventureiro tem uma." },
  { id: "bolsa", name: "Bolsa", category: "recipientes", price: "5 pp", weight: 1, desc: "Bolsinha de couro para moedas e pequenos objetos." },
  { id: "saco", name: "Saco", category: "recipientes", price: "1 pc", weight: 0.5, desc: "Saco de pano para tesouros e mantimentos (até 30 lb)." },
  { id: "aljava", name: "Aljava", category: "recipientes", price: "1 po", weight: 1, desc: "Guarda até 20 flechas." },
  { id: "estojo-virotes", name: "Estojo para virotes", category: "recipientes", price: "1 po", weight: 1, desc: "Guarda até 20 virotes de besta." },
  { id: "estojo-mapas", name: "Estojo para mapas e pergaminhos", category: "recipientes", price: "1 po", weight: 1, desc: "Tubo que protege até 10 folhas enroladas." },
  { id: "cantil", name: "Cantil", category: "recipientes", price: "2 pp", weight: 5, desc: "Leva água para um dia de viagem (peso já cheio)." },
  { id: "garrafa", name: "Garrafa de vidro", category: "recipientes", price: "2 po", weight: 2, desc: "Para bebidas e líquidos." },
  { id: "frasco", name: "Frasco", category: "recipientes", price: "2 pc", weight: 1, desc: "Frasco de barro para líquidos." },
  { id: "caneca", name: "Caneca", category: "recipientes", price: "2 pc", weight: 1, desc: "A companheira de toda taverna. Brindes são obrigatórios." },
  { id: "cesto", name: "Cesto", category: "recipientes", price: "4 pp", weight: 2, desc: "Para carregar mantimentos e ervas." },
  { id: "bau", name: "Baú", category: "recipientes", price: "5 po", weight: 25, desc: "Caixa grande de madeira com fecho. Melhor deixar na carroça." },
  { id: "barril", name: "Barril", category: "recipientes", price: "2 po", weight: 70, desc: "Para água, vinho ou cerveja da taverna. Muito pesado para carregar." },
  // Comida e acampamento
  { id: "racoes", name: "Rações de viagem (1 dia)", category: "comida", price: "5 pp", weight: 2, desc: "Comida seca que não estraga: carne salgada, frutas secas, biscoitos e nozes. Uma por dia de viagem." },
  { id: "kit-refeicao", name: "Kit de refeição", category: "comida", price: "2 pp", weight: 1, desc: "Prato, copo e talheres de metal que viram uma panelinha." },
  { id: "panela", name: "Panela de ferro", category: "comida", price: "2 po", weight: 10, desc: "Para cozinhar ensopados no acampamento." },
  { id: "saco-dormir", name: "Saco de dormir", category: "comida", price: "1 po", weight: 7, desc: "Para descansar melhor ao relento." },
  { id: "cobertor", name: "Cobertor", category: "comida", price: "5 pp", weight: 3, desc: "Protege do frio nas noites de viagem." },
  { id: "tenda", name: "Tenda (duas pessoas)", category: "comida", price: "2 po", weight: 20, desc: "Abrigo de lona para dormir protegido da chuva." },
  { id: "kit-pesca", name: "Kit de pesca", category: "comida", price: "1 po", weight: 4, desc: "Vara, linha, anzóis e iscas para pescar o jantar." },
  // Roupas
  { id: "roupas-comuns", name: "Roupas comuns", category: "roupas", price: "5 pp", weight: 3, desc: "As roupas do dia a dia do povo." },
  { id: "roupas-viajante", name: "Roupas de viajante", category: "roupas", price: "2 po", weight: 4, desc: "Botas, capa e roupas resistentes para a estrada." },
  { id: "roupas-finas", name: "Roupas finas", category: "roupas", price: "15 po", weight: 6, desc: "Trajes elegantes para festas e audiências com nobres." },
  { id: "traje-artista", name: "Traje de artista", category: "roupas", price: "5 po", weight: 4, desc: "Figurino colorido para apresentações." },
  { id: "vestes", name: "Vestes", category: "roupas", price: "1 po", weight: 4, desc: "Túnica longa de sacerdotes e estudiosos." },
  // Munição
  { id: "flechas", name: "Flechas (20)", category: "municao", price: "1 po", weight: 1, desc: "Munição para arcos curtos e longos. Depois da luta, dá para recuperar metade." },
  { id: "virotes", name: "Virotes (20)", category: "municao", price: "1 po", weight: 1.5, desc: "Munição para bestas." },
  { id: "balas-funda", name: "Balas de funda (20)", category: "municao", price: "4 pc", weight: 1.5, desc: "Munição para fundas. Pedras lisas também servem." },
  { id: "agulhas", name: "Agulhas de zarabatana (50)", category: "municao", price: "1 po", weight: 1, desc: "Munição para zarabatanas." },
  // Poções e alquimia
  { id: "pocao-cura", name: "Poção de Cura", category: "consumiveis", price: "50 po", weight: 0.5, desc: "Líquido vermelho brilhante. Beber (uma ação) cura 2d4 + 2 PV. Todo grupo deveria ter algumas." },
  { id: "antidoto", name: "Antídoto (frasco)", category: "consumiveis", price: "50 po", weight: 0, desc: "Dá vantagem contra venenos por 1 hora." },
  { id: "acido", name: "Ácido (frasco)", category: "consumiveis", price: "25 po", weight: 1, desc: "Arremessado a até 6 m, causa 2d6 de dano de ácido." },
  { id: "fogo-alquimista", name: "Fogo de alquimista (frasco)", category: "consumiveis", price: "50 po", weight: 1, desc: "Líquido que pega fogo no ar: o alvo leva 1d4 de fogo a cada turno até apagar as chamas." },
  { id: "agua-benta", name: "Água benta (frasco)", category: "consumiveis", price: "25 po", weight: 1, desc: "Arremessada em mortos-vivos ou corruptores, causa 2d6 de dano radiante." },
  { id: "veneno", name: "Veneno básico (frasco)", category: "consumiveis", price: "100 po", weight: 0, desc: "Passado numa arma ou munição, o alvo resiste com Constituição (CD 10) ou leva 1d4 de veneno extra. Dura 1 minuto." },
  // Ferramentas
  { id: "ferramentas-ladrao", name: "Ferramentas de ladrão", category: "ferramentas", price: "25 po", weight: 1, desc: "Gazuas e limas para abrir fechaduras e desarmar armadilhas. Com proficiência, soma o bônus no teste." },
  { id: "ferramentas-navegador", name: "Ferramentas de navegador", category: "ferramentas", price: "25 po", weight: 2, desc: "Instrumentos para traçar rotas e não se perder no mar." },
  { id: "suprimentos-alquimista", name: "Suprimentos de alquimista", category: "ferramentas", price: "50 po", weight: 8, desc: "Frascos e reagentes para identificar e preparar substâncias." },
  { id: "ferramentas-ferreiro", name: "Ferramentas de ferreiro", category: "ferramentas", price: "20 po", weight: 8, desc: "Para consertar e forjar armas e armaduras de metal." },
  { id: "ferramentas-carpinteiro", name: "Ferramentas de carpinteiro", category: "ferramentas", price: "8 po", weight: 6, desc: "Serrote, martelo e pregos para construir e consertar madeira." },
  { id: "utensilios-cozinheiro", name: "Utensílios de cozinheiro", category: "ferramentas", price: "1 po", weight: 8, desc: "Panelas e facas para preparar boas refeições." },
  { id: "suprimentos-caligrafia", name: "Suprimentos de caligrafia", category: "ferramentas", price: "10 po", weight: 5, desc: "Penas, tintas e papéis para escrita bonita e documentos." },
  { id: "suprimentos-pintor", name: "Suprimentos de pintor", category: "ferramentas", price: "10 po", weight: 5, desc: "Tintas e pincéis para retratos e mapas." },
  { id: "jogo-dados", name: "Jogo de dados", category: "ferramentas", price: "1 pp", weight: 0, desc: "Para apostar na taverna." },
  { id: "baralho", name: "Baralho", category: "ferramentas", price: "5 pp", weight: 0, desc: "Cartas para jogos de sorte e blefe." },
  // Kits
  { id: "kit-curandeiro", name: "Kit de curandeiro", category: "kits", price: "5 po", weight: 3, desc: "Bandagens e ervas com 10 usos: estabiliza um aliado caído a 0 PV sem precisar de teste de Medicina." },
  { id: "kit-escalada", name: "Kit de escalada", category: "kits", price: "25 po", weight: 12, desc: "Pitões, luvas e arnês: dá vantagem em testes para escalar e impede quedas longas." },
  { id: "kit-herbalismo", name: "Kit de herbalismo", category: "kits", price: "5 po", weight: 3, desc: "Para identificar plantas e preparar antídotos e poções de cura." },
  { id: "kit-disfarce", name: "Kit de disfarce", category: "kits", price: "25 po", weight: 3, desc: "Maquiagem, tintas de cabelo e acessórios para mudar a aparência." },
  { id: "kit-falsificacao", name: "Kit de falsificação", category: "kits", price: "15 po", weight: 5, desc: "Papéis, tintas e selos para falsificar documentos." },
  { id: "kit-venenos", name: "Kit de venenos", category: "kits", price: "50 po", weight: 2, desc: "Frascos e ferramentas para preparar e aplicar venenos com segurança." },
];

export const findItem = (id?: string) => ITEMS.find((i) => i.id === id);

/** Pacotes de equipamento do Livro do Jogador: adicionam cada item separado na mochila. */
export const PACKS: { id: string; name: string; price: string; desc: string; contents: [string, number][] }[] = [
  {
    id: "explorador",
    name: "Pacote de Explorador",
    price: "10 po",
    desc: "Para viagens longas pela natureza.",
    contents: [["mochila", 1], ["saco-dormir", 1], ["kit-refeicao", 1], ["estojo-pederneira", 1], ["tocha", 10], ["racoes", 10], ["cantil", 1], ["corda-canhamo", 1]],
  },
  {
    id: "masmorra",
    name: "Pacote de Aventureiro (masmorras)",
    price: "12 po",
    desc: "Para explorar ruínas e subterrâneos.",
    contents: [["mochila", 1], ["pe-de-cabra", 1], ["martelo", 1], ["cravos", 1], ["tocha", 10], ["estojo-pederneira", 1], ["racoes", 10], ["cantil", 1], ["corda-canhamo", 1]],
  },
  {
    id: "assaltante",
    name: "Pacote de Assaltante",
    price: "16 po",
    desc: "Para quem entra onde não foi convidado.",
    contents: [["mochila", 1], ["esferas", 1], ["sineta", 1], ["vela", 5], ["pe-de-cabra", 1], ["martelo", 1], ["cravos", 1], ["lanterna-coberta", 1], ["oleo", 2], ["racoes", 5], ["estojo-pederneira", 1], ["cantil", 1], ["corda-canhamo", 1]],
  },
];

// ---------------------------------------------------------------------------
// Moedas
// ---------------------------------------------------------------------------

export type CoinKey = "pc" | "pp" | "ep" | "po" | "pl";
export type Coins = Record<CoinKey, number>;

export const EMPTY_COINS: Coins = { pc: 0, pp: 0, ep: 0, po: 0, pl: 0 };

/** Valor de cada moeda em peças de cobre (tabela oficial de câmbio). */
export const COIN_IN_CP: Record<CoinKey, number> = { pc: 1, pp: 10, ep: 50, po: 100, pl: 1000 };

export const COINS: { key: CoinKey; short: string; name: string; metal: string; color: string; desc: string }[] = [
  { key: "pc", short: "PC", name: "Peça de cobre", metal: "cobre", color: "#b56a3a", desc: "A moeda do povo. Um pão ou uma vela custam 1 PC. 10 PC = 1 PP." },
  { key: "pp", short: "PP", name: "Peça de prata", metal: "prata", color: "#b9bcc2", desc: "Um dia de trabalho braçal paga 1 PP. 10 PP = 1 PO." },
  { key: "ep", short: "EP", name: "Peça de electrum", metal: "electrum", color: "#d4c26a", desc: "Moeda rara de ouro com prata, comum em tesouros antigos. 1 EP = 5 PP; 2 EP = 1 PO. (Na edição brasileira aparece como PE.)" },
  { key: "po", short: "PO", name: "Peça de ouro", metal: "ouro", color: "#d9a93a", desc: "A moeda dos aventureiros: armas, armaduras e poções têm preço em PO. 1 PO = 10 PP = 100 PC." },
  { key: "pl", short: "PL", name: "Peça de platina", metal: "platina", color: "#dfe3e8", desc: "Moeda de grandes negócios e tesouros. 1 PL = 10 PO." },
];

/** Converte `amount` moedas de `from` para `to`. Só troca moedas inteiras; o que sobra fica na moeda original. */
export function convertCoins(coins: Coins, from: CoinKey, to: CoinKey, amount: number): { coins: Coins; received: number; used: number } | null {
  const qty = Math.floor(Math.min(amount, coins[from]));
  if (qty <= 0 || from === to) return null;
  const rateFrom = COIN_IN_CP[from];
  const rateTo = COIN_IN_CP[to];
  // Quantas moedas de origem são realmente necessárias para gerar moedas inteiras de destino
  const received = Math.floor((qty * rateFrom) / rateTo);
  if (received <= 0) return null;
  const used = Math.ceil((received * rateTo) / rateFrom);
  return { coins: { ...coins, [from]: coins[from] - used, [to]: coins[to] + received }, received, used };
}

export const coinsTotalGp = (c: Coins) => (c.pc * 1 + c.pp * 10 + c.ep * 50 + c.po * 100 + c.pl * 1000) / 100;
export const coinsCount = (c: Coins) => c.pc + c.pp + c.ep + c.po + c.pl;
/** Regra oficial: 50 moedas pesam 1 lb. */
export const coinsWeight = (c: Coins) => coinsCount(c) / 50;

// ---------------------------------------------------------------------------
// Carga
// ---------------------------------------------------------------------------

/** Capacidade de carga: Força × 15 (lb). */
export const carryCapacity = (str: number) => str * 15;

export const formatLb = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("pt-BR")} lb`;
export const lbToKg = (n: number) => `${(Math.round(n * 0.4536 * 10) / 10).toLocaleString("pt-BR")} kg`;

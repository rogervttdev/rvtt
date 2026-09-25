/**
 * Equipamento do Livro do Jogador (D&D 5e), nomes da edição brasileira.
 * Distâncias convertidas para metros (1,5 m = 5 pés).
 *
 * A propriedade de Maestria de cada arma (mastery) vem da revisão 2024 (D&D 5.5),
 * SRD 5.2 da Wizards of the Coast LLC, licença Creative Commons Attribution 4.0
 * (CC-BY-4.0): https://creativecommons.org/licenses/by/4.0/legalcode
 */
import type { Abilities, Equipment } from "./types";
import type { ClassDef, RaceDef, SubraceDef } from "./regras";

// ---------------------------------------------------------------------------
// Armaduras
// ---------------------------------------------------------------------------

export type ArmorCategory = "leve" | "media" | "pesada";

export type ArmorDef = {
  id: string;
  name: string;
  category: ArmorCategory;
  /** CA base */
  ac: number;
  strength?: number;
  stealthDisadv?: boolean;
  price: string;
  /** Peso em libras (lb) */
  weight: number;
  desc: string;
};

export const ARMOR_CATEGORY_LABEL: Record<ArmorCategory, string> = {
  leve: "Armaduras leves",
  media: "Armaduras médias",
  pesada: "Armaduras pesadas",
};

export const ARMORS: ArmorDef[] = [
  { id: "acolchoada", weight: 8, name: "Acolchoada", category: "leve", ac: 11, stealthDisadv: true, price: "5 po", desc: "Camadas de tecido grosso acolchoado. Barata, mas faz barulho e esquenta." },
  { id: "couro", weight: 10, name: "Couro", category: "leve", ac: 11, price: "10 po", desc: "Peitoral e ombreiras de couro endurecido. Leve e silenciosa: a escolha clássica de ladinos e bardos." },
  { id: "couro-batido", weight: 13, name: "Couro batido", category: "leve", ac: 12, price: "45 po", desc: "Couro reforçado com rebites de metal. A melhor armadura leve." },
  { id: "gibao-peles", weight: 12, name: "Gibão de peles", category: "media", ac: 12, price: "10 po", desc: "Peles grossas de animais. Comum entre tribos e bárbaros." },
  { id: "camisao-malha", weight: 20, name: "Camisão de malha", category: "media", ac: 13, price: "50 po", desc: "Uma camisa de anéis de metal usada por baixo da roupa. Discreta." },
  { id: "brunea", weight: 45, name: "Brunea", category: "media", ac: 14, stealthDisadv: true, price: "50 po", desc: "Casaco de couro coberto de escamas de metal. Protege bem, mas tilinta ao andar." },
  { id: "peitoral", weight: 20, name: "Peitoral", category: "media", ac: 14, price: "400 po", desc: "Placa de metal moldada no peito. Boa proteção sem atrapalhar a furtividade." },
  { id: "meia-armadura", weight: 40, name: "Meia-armadura", category: "media", ac: 15, stealthDisadv: true, price: "750 po", desc: "Placas de metal cobrindo a maior parte do corpo. A melhor armadura média." },
  { id: "cota-aneis", weight: 40, name: "Cota de anéis", category: "pesada", ac: 14, stealthDisadv: true, price: "30 po", desc: "Couro com argolas de metal costuradas. A armadura pesada mais simples." },
  { id: "cota-malha", weight: 55, name: "Cota de malha", category: "pesada", ac: 16, strength: 13, stealthDisadv: true, price: "75 po", desc: "Malha de anéis entrelaçados sobre tecido acolchoado. Clássica de guerreiros e clérigos iniciantes." },
  { id: "cota-talas", weight: 60, name: "Cota de talas", category: "pesada", ac: 17, strength: 15, stealthDisadv: true, price: "200 po", desc: "Tiras verticais de metal presas em couro." },
  { id: "placas", weight: 65, name: "Placas", category: "pesada", ac: 18, strength: 15, stealthDisadv: true, price: "1.500 po", desc: "Armadura completa de placas encaixadas. A melhor proteção que existe, e a mais cara." },
];

export const SHIELD = { name: "Escudo", bonus: 2, price: "10 po", weight: 6, desc: "Carregado em uma mão, soma +2 na CA. Mas ocupa essa mão: não dá para usar arma de duas mãos junto." };

export const findArmor = (id?: string | null) => ARMORS.find((a) => a.id === id);

// ---------------------------------------------------------------------------
// Armas
// ---------------------------------------------------------------------------

export type WeaponProp =
  | "acuidade"
  | "leve"
  | "pesada"
  | "duas_maos"
  | "versatil"
  | "arremesso"
  | "municao"
  | "recarga"
  | "alcance"
  | "especial";

export type DamageType = "cortante" | "perfurante" | "concussão";

/** Propriedades de Maestria de arma (regra 2024). Cada arma tem uma fixa. */
export type WeaponMastery = "cleave" | "graze" | "nick" | "push" | "sap" | "slow" | "topple" | "vex";

export const MASTERY_LABEL: Record<WeaponMastery, string> = {
  cleave: "Fenda",
  graze: "Roçar",
  nick: "Fresta",
  push: "Empurrão",
  sap: "Enfraquecer",
  slow: "Lentidão",
  topple: "Derrubar",
  vex: "Provocar",
};

export const MASTERY_HELP: Record<WeaponMastery, string> = {
  cleave: "Se você acertar um golpe corpo a corpo, pode atacar de novo com a mesma arma contra uma segunda criatura ao alcance, a até 1,5 m da primeira. Se acertar, ela leva o dado de dano da arma (sem somar o modificador). Só uma vez por turno.",
  graze: "Se o seu ataque errar a criatura, ela ainda leva o dano igual ao seu modificador de atributo (do mesmo tipo da arma). Um erro nunca é totalmente em vão.",
  nick: "O ataque extra de uma arma Leve pode ser feito junto com a ação de Atacar, em vez de gastar a ação bônus. Só uma vez por turno.",
  push: "Se você acertar, pode empurrar a criatura até 3 m para longe de você, se ela for do seu tamanho ou menor.",
  sap: "Se você acertar, a criatura fica com desvantagem no próximo ataque dela antes do início do seu próximo turno.",
  slow: "Se você acertar e causar dano, pode reduzir o deslocamento da criatura em 3 m até o início do seu próximo turno. Não acumula com outra Lentidão.",
  topple: "Se você acertar, pode forçar a criatura a um teste de Constituição (CD 8 + seu modificador + proficiência) ou ela cai caída.",
  vex: "Se você acertar e causar dano, ganha vantagem no seu próximo ataque contra essa criatura antes do fim do seu próximo turno.",
};

export type WeaponDef = {
  id: string;
  name: string;
  category: "simples" | "marcial";
  kind: "corpo" | "distancia";
  damage: string;
  damageType: DamageType | null;
  props: WeaponProp[];
  versatile?: string;
  /** "normal/longo" em metros */
  range?: string;
  price: string;
  /** Peso em libras (lb) */
  weight: number;
  /** Propriedade de Maestria (regra 2024); ausente em armas fora do núcleo do SRD */
  mastery?: WeaponMastery;
  desc: string;
  special?: string;
};

export const WEAPON_GROUPS: { label: string; category: WeaponDef["category"]; kind: WeaponDef["kind"] }[] = [
  { label: "Armas simples corpo a corpo", category: "simples", kind: "corpo" },
  { label: "Armas simples à distância", category: "simples", kind: "distancia" },
  { label: "Armas marciais corpo a corpo", category: "marcial", kind: "corpo" },
  { label: "Armas marciais à distância", category: "marcial", kind: "distancia" },
];

export const WEAPONS: WeaponDef[] = [
  // Ataque desarmado — regra 2024: qualquer criatura pode usar, sempre "treinado"
  { id: "desarmado", name: "Ataque desarmado", category: "simples", kind: "corpo", damage: "1", damageType: "concussão", props: [], weight: 0, price: "—", desc: "Um soco, cotovelada ou joelhada. Todo mundo sabe usar. Ao acertar, você escolhe: causar dano, Agarrar ou Empurrar o alvo (veja Manobras, abaixo da lista de ataques)." },
  // Simples corpo a corpo
  { id: "adaga", weight: 1, mastery: "nick", name: "Adaga", category: "simples", kind: "corpo", damage: "1d4", damageType: "perfurante", props: ["acuidade", "leve", "arremesso"], range: "6/18", price: "2 po", desc: "Lâmina curta, fácil de esconder e de arremessar. Todo aventureiro devia ter uma." },
  { id: "azagaia", weight: 2, mastery: "slow", name: "Azagaia", category: "simples", kind: "corpo", damage: "1d6", damageType: "perfurante", props: ["arremesso"], range: "9/36", price: "5 pp", desc: "Lança leve feita para ser arremessada." },
  { id: "bordao", weight: 4, mastery: "topple", name: "Bordão", category: "simples", kind: "corpo", damage: "1d6", damageType: "concussão", props: ["versatil"], versatile: "1d8", price: "2 pp", desc: "Um bastão longo de madeira. Arma favorita de magos e monges." },
  { id: "clava", weight: 2, mastery: "slow", name: "Clava", category: "simples", kind: "corpo", damage: "1d4", damageType: "concussão", props: ["leve"], price: "1 pp", desc: "Um pedaço de pau firme. Simples e barata." },
  { id: "clava-grande", weight: 10, mastery: "push", name: "Clava grande", category: "simples", kind: "corpo", damage: "1d8", damageType: "concussão", props: ["duas_maos"], price: "2 pp", desc: "Um porrete enorme, usado com as duas mãos." },
  { id: "foice-curta", weight: 2, mastery: "nick", name: "Foice curta", category: "simples", kind: "corpo", damage: "1d4", damageType: "cortante", props: ["leve"], price: "1 po", desc: "Ferramenta de colheita que também serve de arma." },
  { id: "lanca", weight: 3, mastery: "sap", name: "Lança", category: "simples", kind: "corpo", damage: "1d6", damageType: "perfurante", props: ["arremesso", "versatil"], versatile: "1d8", range: "6/18", price: "1 po", desc: "Haste com ponta de metal. Dá para usar com uma ou duas mãos, ou arremessar." },
  { id: "maca", weight: 4, mastery: "sap", name: "Maça", category: "simples", kind: "corpo", damage: "1d6", damageType: "concussão", props: [], price: "5 po", desc: "Cabo com uma cabeça pesada de metal. Clássica de clérigos." },
  { id: "machadinha", weight: 2, mastery: "vex", name: "Machadinha", category: "simples", kind: "corpo", damage: "1d6", damageType: "cortante", props: ["leve", "arremesso"], range: "6/18", price: "5 po", desc: "Machado pequeno de uma mão, bom para arremessar." },
  { id: "martelo-leve", weight: 2, mastery: "nick", name: "Martelo leve", category: "simples", kind: "corpo", damage: "1d4", damageType: "concussão", props: ["leve", "arremesso"], range: "6/18", price: "2 po", desc: "Martelo pequeno, equilibrado para arremesso." },
  // Simples à distância
  { id: "arco-curto", weight: 2, mastery: "vex", name: "Arco curto", category: "simples", kind: "distancia", damage: "1d6", damageType: "perfurante", props: ["municao", "duas_maos"], range: "24/96", price: "25 po", desc: "Arco pequeno e prático. Precisa de flechas." },
  { id: "besta-leve", weight: 5, mastery: "slow", name: "Besta leve", category: "simples", kind: "distancia", damage: "1d8", damageType: "perfurante", props: ["municao", "recarga", "duas_maos"], range: "24/96", price: "25 po", desc: "Dispara virotes com força. Fácil de usar, mas demora para recarregar." },
  { id: "dardo", weight: 0.25, mastery: "vex", name: "Dardo", category: "simples", kind: "distancia", damage: "1d4", damageType: "perfurante", props: ["acuidade", "arremesso"], range: "6/18", price: "5 pc", desc: "Pequena ponta para arremessar. Magos costumam levar alguns." },
  { id: "funda", weight: 0, mastery: "slow", name: "Funda", category: "simples", kind: "distancia", damage: "1d4", damageType: "concussão", props: ["municao"], range: "9/36", price: "1 pp", desc: "Tira de couro que lança pedras ou balas de metal." },
  // Marciais corpo a corpo
  { id: "alabarda", weight: 6, mastery: "cleave", name: "Alabarda", category: "marcial", kind: "corpo", damage: "1d10", damageType: "cortante", props: ["pesada", "alcance", "duas_maos"], price: "20 po", desc: "Machado na ponta de uma haste longa: acerta inimigos a 3 m." },
  { id: "chicote", weight: 3, mastery: "slow", name: "Chicote", category: "marcial", kind: "corpo", damage: "1d4", damageType: "cortante", props: ["acuidade", "alcance"], price: "2 po", desc: "Pouco dano, mas alcança a 3 m." },
  { id: "cimitarra", weight: 3, mastery: "nick", name: "Cimitarra", category: "marcial", kind: "corpo", damage: "1d6", damageType: "cortante", props: ["acuidade", "leve"], price: "25 po", desc: "Espada curva e ágil. Druidas também sabem usar." },
  { id: "espada-curta", weight: 2, mastery: "vex", name: "Espada curta", category: "marcial", kind: "corpo", damage: "1d6", damageType: "perfurante", props: ["acuidade", "leve"], price: "10 po", desc: "Lâmina ágil, ótima para lutar com uma em cada mão." },
  { id: "espada-grande", weight: 6, mastery: "graze", name: "Espada grande", category: "marcial", kind: "corpo", damage: "2d6", damageType: "cortante", props: ["pesada", "duas_maos"], price: "50 po", desc: "Espadona de duas mãos com dano alto e constante." },
  { id: "espada-longa", weight: 3, mastery: "sap", name: "Espada longa", category: "marcial", kind: "corpo", damage: "1d8", damageType: "cortante", props: ["versatil"], versatile: "1d10", price: "15 po", desc: "A espada clássica do cavaleiro. Uma ou duas mãos." },
  { id: "glaive", weight: 6, mastery: "graze", name: "Glaive", category: "marcial", kind: "corpo", damage: "1d10", damageType: "cortante", props: ["pesada", "alcance", "duas_maos"], price: "20 po", desc: "Lâmina longa na ponta de uma haste, alcança a 3 m." },
  { id: "lanca-montaria", weight: 6, mastery: "topple", name: "Lança de montaria", category: "marcial", kind: "corpo", damage: "1d12", damageType: "perfurante", props: ["alcance", "especial"], price: "10 po", desc: "Lança de cavaleiro para investidas montadas.", special: "Tem desvantagem para atacar alguém a até 1,5 m. Precisa das duas mãos quando você não está montado." },
  { id: "maca-estrela", weight: 4, mastery: "sap", name: "Maça estrela", category: "marcial", kind: "corpo", damage: "1d8", damageType: "perfurante", props: [], price: "15 po", desc: "Bola de metal cheia de espinhos num cabo." },
  { id: "machado-batalha", weight: 4, mastery: "topple", name: "Machado de batalha", category: "marcial", kind: "corpo", damage: "1d8", damageType: "cortante", props: ["versatil"], versatile: "1d10", price: "10 po", desc: "Machado de guerra. Favorito dos anões." },
  { id: "machado-grande", weight: 7, mastery: "cleave", name: "Machado grande", category: "marcial", kind: "corpo", damage: "1d12", damageType: "cortante", props: ["pesada", "duas_maos"], price: "30 po", desc: "Machado enorme de duas mãos, o maior dado de dano entre as armas. Clássico de bárbaros." },
  { id: "malho", weight: 10, mastery: "topple", name: "Malho", category: "marcial", kind: "corpo", damage: "2d6", damageType: "concussão", props: ["pesada", "duas_maos"], price: "10 po", desc: "Marreta de guerra de duas mãos." },
  { id: "mangual", weight: 2, mastery: "sap", name: "Mangual", category: "marcial", kind: "corpo", damage: "1d8", damageType: "concussão", props: [], price: "10 po", desc: "Bola de metal presa ao cabo por uma corrente." },
  { id: "martelo-guerra", weight: 2, mastery: "push", name: "Martelo de guerra", category: "marcial", kind: "corpo", damage: "1d8", damageType: "concussão", props: ["versatil"], versatile: "1d10", price: "15 po", desc: "Martelo pesado de batalha, uma ou duas mãos." },
  { id: "picareta-guerra", weight: 2, mastery: "sap", name: "Picareta de guerra", category: "marcial", kind: "corpo", damage: "1d8", damageType: "perfurante", props: [], price: "5 po", desc: "Picareta feita para furar armaduras." },
  { id: "pique", weight: 18, mastery: "push", name: "Pique", category: "marcial", kind: "corpo", damage: "1d10", damageType: "perfurante", props: ["pesada", "alcance", "duas_maos"], price: "5 po", desc: "Lança muito longa, alcança a 3 m." },
  { id: "rapieira", weight: 2, mastery: "vex", name: "Rapieira", category: "marcial", kind: "corpo", damage: "1d8", damageType: "perfurante", props: ["acuidade"], price: "25 po", desc: "Espada fina e elegante. A melhor arma de Destreza para uma mão." },
  { id: "tridente", weight: 4, mastery: "topple", name: "Tridente", category: "marcial", kind: "corpo", damage: "1d6", damageType: "perfurante", props: ["arremesso", "versatil"], versatile: "1d8", range: "6/18", price: "5 po", desc: "Lança de três pontas." },
  // Marciais à distância
  { id: "arco-longo", weight: 2, mastery: "slow", name: "Arco longo", category: "marcial", kind: "distancia", damage: "1d8", damageType: "perfurante", props: ["municao", "pesada", "duas_maos"], range: "45/180", price: "50 po", desc: "Arco grande com o maior alcance do jogo. Clássico de patrulheiros." },
  { id: "besta-mao", weight: 3, mastery: "vex", name: "Besta de mão", category: "marcial", kind: "distancia", damage: "1d6", damageType: "perfurante", props: ["municao", "leve", "recarga"], range: "9/36", price: "75 po", desc: "Besta pequena, usada com uma mão." },
  { id: "besta-pesada", weight: 18, mastery: "push", name: "Besta pesada", category: "marcial", kind: "distancia", damage: "1d10", damageType: "perfurante", props: ["municao", "pesada", "recarga", "duas_maos"], range: "30/120", price: "50 po", desc: "Besta grande e potente." },
  { id: "rede", weight: 3, name: "Rede", category: "marcial", kind: "distancia", damage: "—", damageType: null, props: ["arremesso", "especial"], range: "1,5/4,5", price: "1 po", desc: "Não causa dano: prende o alvo.", special: "Um acerto deixa a criatura (Grande ou menor) impedida até se soltar: teste de Força CD 10 ou 5 de dano cortante na rede." },
  { id: "zarabatana", weight: 1, mastery: "vex", name: "Zarabatana", category: "marcial", kind: "distancia", damage: "1", damageType: "perfurante", props: ["municao", "recarga"], range: "7,5/30", price: "10 po", desc: "Tubo que sopra agulhas. Dano mínimo; útil com venenos." },
];

export const findWeapon = (id?: string | null) => WEAPONS.find((w) => w.id === id);

export const PROP_LABEL: Record<WeaponProp, string> = {
  acuidade: "Acuidade",
  leve: "Leve",
  pesada: "Pesada",
  duas_maos: "Duas mãos",
  versatil: "Versátil",
  arremesso: "Arremesso",
  municao: "Munição",
  recarga: "Recarga",
  alcance: "Alcance",
  especial: "Especial",
};

export const PROP_HELP: Record<WeaponProp, string> = {
  acuidade: "Arma ágil: no ataque e no dano você pode usar Destreza em vez de Força. A ficha já escolhe o maior dos dois.",
  leve: "Pequena e fácil de manejar. Dá para lutar com uma arma leve em cada mão: a da outra mão faz um ataque extra (sem somar o modificador no dano).",
  pesada: "Grande demais para criaturas pequenas: halflings e gnomos têm desvantagem ao atacar com ela.",
  duas_maos: "Precisa das duas mãos para atacar. Não dá para usar com escudo.",
  versatil: "Pode ser usada com uma ou duas mãos. Com as duas, o dano fica maior (o dado entre parênteses).",
  arremesso: "Pode ser arremessada. Usa o mesmo atributo do ataque corpo a corpo. O primeiro número é o alcance normal; até o segundo você ataca com desvantagem.",
  municao: "Precisa de munição (flechas, virotes, balas ou agulhas). Após a luta, dá para recuperar metade gastando um minuto procurando.",
  recarga: "Demora para recarregar: só um disparo por ação, mesmo que você tenha mais de um ataque.",
  alcance: "Arma comprida: ataca inimigos a até 3 m (dois quadrados) em vez de 1,5 m.",
  especial: "Tem uma regra própria, explicada na descrição da arma.",
};

export const DAMAGE_HELP: Record<DamageType, string> = {
  cortante: "Dano de lâminas e machados. Alguns monstros resistem a um tipo de dano e sofrem só metade.",
  perfurante: "Dano de pontas: lanças, flechas, adagas. Alguns monstros resistem a um tipo de dano e sofrem só metade.",
  concussão: "Dano de impacto: martelos, maças, porretes. Esqueletos, por exemplo, são vulneráveis a ele.",
};

// ---------------------------------------------------------------------------
// Focos de conjuração e cajados
// ---------------------------------------------------------------------------

export type FocusGroup = "arcano" | "druidico" | "sagrado" | "instrumento" | "magico";

export type FocusDef = {
  id: string;
  name: string;
  group: FocusGroup;
  desc: string;
  /** Cajados também servem de arma (bordão) */
  weapon?: string;
  price?: string;
  /** Peso em libras (lb) */
  weight: number;
};

export const FOCUS_GROUP_LABEL: Record<FocusGroup, { label: string; who: string }> = {
  arcano: { label: "Focos arcanos", who: "Feiticeiro, Bruxo e Mago" },
  druidico: { label: "Focos druídicos", who: "Druida" },
  sagrado: { label: "Símbolos sagrados", who: "Clérigo e Paladino" },
  instrumento: { label: "Instrumentos musicais", who: "Bardo" },
  magico: { label: "Cajados mágicos", who: "Itens raros: só com permissão do mestre" },
};

export const FOCI: FocusDef[] = [
  { id: "cajado-arcano", weight: 4, name: "Cajado arcano", group: "arcano", weapon: "bordao", price: "5 po", desc: "Bastão longo entalhado com runas. Canaliza a magia e ainda serve de arma (como um bordão)." },
  { id: "varinha-arcana", weight: 1, name: "Varinha", group: "arcano", price: "10 po", desc: "Vareta fina de madeira ou osso para apontar feitiços." },
  { id: "orbe", weight: 3, name: "Orbe", group: "arcano", price: "20 po", desc: "Esfera de cristal ou vidro que brilha ao conjurar." },
  { id: "cristal", weight: 1, name: "Cristal", group: "arcano", price: "10 po", desc: "Pedra lapidada que concentra energia mágica." },
  { id: "bastao", weight: 2, name: "Bastão", group: "arcano", price: "10 po", desc: "Cetro curto de metal ou madeira nobre." },
  { id: "cajado-druidico", weight: 4, name: "Cajado de madeira", group: "druidico", weapon: "bordao", price: "5 po", desc: "Galho vivo de uma árvore sagrada. Serve de foco e de arma (como um bordão)." },
  { id: "ramo-visco", weight: 0, name: "Ramo de visco", group: "druidico", price: "1 po", desc: "Raminho de visco colhido com foice dourada." },
  { id: "totem", weight: 0, name: "Totem", group: "druidico", price: "1 po", desc: "Objeto com penas, pelos, ossos ou dentes de animais sagrados." },
  { id: "varinha-teixo", weight: 1, name: "Varinha de teixo", group: "druidico", price: "10 po", desc: "Varinha feita de madeira de teixo." },
  { id: "amuleto", weight: 1, name: "Amuleto", group: "sagrado", price: "5 po", desc: "Pingente com o símbolo do seu deus, usado no pescoço." },
  { id: "emblema", weight: 0, name: "Emblema", group: "sagrado", price: "5 po", desc: "O símbolo do deus pintado ou gravado no escudo ou na roupa." },
  { id: "relicario", weight: 2, name: "Relicário", group: "sagrado", price: "5 po", desc: "Caixinha com um fragmento de algo sagrado." },
  { id: "alaude", weight: 2, name: "Alaúde", group: "instrumento", price: "35 po", desc: "Instrumento de cordas, o favorito dos bardos." },
  { id: "flauta", weight: 1, name: "Flauta", group: "instrumento", price: "2 po", desc: "Instrumento de sopro leve e barato." },
  { id: "tambor", weight: 3, name: "Tambor", group: "instrumento", price: "6 po", desc: "Instrumento de percussão para ritmos de batalha." },
  { id: "lira", weight: 2, name: "Lira", group: "instrumento", price: "30 po", desc: "Pequena harpa de mão." },
  { id: "cajado-cura", weight: 4, name: "Cajado de Cura", group: "magico", weapon: "bordao", desc: "Item mágico raro (exige sintonização: bardo, clérigo ou druida). Tem 10 cargas para lançar Curar Ferimentos, Restauração Menor e Curar Ferimentos em Massa." },
  { id: "cajado-fogo", weight: 4, name: "Cajado de Fogo", group: "magico", weapon: "bordao", desc: "Item mágico muito raro (exige sintonização: druida, feiticeiro, bruxo ou mago). Dá resistência a fogo e tem 10 cargas para Mãos Flamejantes, Bola de Fogo e Muralha de Fogo." },
  { id: "cajado-gelo", weight: 4, name: "Cajado de Gelo", group: "magico", weapon: "bordao", desc: "Item mágico muito raro (exige sintonização: druida, feiticeiro, bruxo ou mago). Dá resistência a frio e tem 10 cargas para Névoa, Cone de Frio, Tempestade de Gelo e Muralha de Gelo." },
];

export const findFocus = (id?: string | null) => FOCI.find((f) => f.id === id);

// ---------------------------------------------------------------------------
// Proficiências por classe e raça
// ---------------------------------------------------------------------------

type ArmorProf = ArmorCategory | "escudo";

const CLASS_ARMOR: Record<string, ArmorProf[]> = {
  Bárbaro: ["leve", "media", "escudo"],
  Bardo: ["leve"],
  Bruxo: ["leve"],
  Clérigo: ["leve", "media", "escudo"],
  Druida: ["leve", "media", "escudo"],
  Feiticeiro: [],
  Guerreiro: ["leve", "media", "pesada", "escudo"],
  Ladino: ["leve"],
  Mago: [],
  Monge: [],
  Paladino: ["leve", "media", "pesada", "escudo"],
  Patrulheiro: ["leve", "media", "escudo"],
};

const CLASS_WEAPONS: Record<string, { categories: WeaponDef["category"][]; extra: string[] }> = {
  Bárbaro: { categories: ["simples", "marcial"], extra: [] },
  Bardo: { categories: ["simples"], extra: ["besta-mao", "espada-longa", "rapieira", "espada-curta"] },
  Bruxo: { categories: ["simples"], extra: [] },
  Clérigo: { categories: ["simples"], extra: [] },
  Druida: { categories: [], extra: ["clava", "adaga", "dardo", "azagaia", "maca", "bordao", "cimitarra", "foice-curta", "funda", "lanca"] },
  Feiticeiro: { categories: [], extra: ["adaga", "dardo", "funda", "bordao", "besta-leve"] },
  Guerreiro: { categories: ["simples", "marcial"], extra: [] },
  Ladino: { categories: ["simples"], extra: ["besta-mao", "espada-longa", "rapieira", "espada-curta"] },
  Mago: { categories: [], extra: ["adaga", "dardo", "funda", "bordao", "besta-leve"] },
  Monge: { categories: ["simples"], extra: ["espada-curta"] },
  Paladino: { categories: ["simples", "marcial"], extra: [] },
  Patrulheiro: { categories: ["simples", "marcial"], extra: [] },
};

const RACE_WEAPONS: Record<string, string[]> = {
  Anão: ["machado-batalha", "machadinha", "martelo-leve", "martelo-guerra"],
  "Alto Elfo": ["espada-longa", "espada-curta", "arco-curto", "arco-longo"],
  "Elfo da Floresta": ["espada-longa", "espada-curta", "arco-curto", "arco-longo"],
  "Elfo Negro (Drow)": ["rapieira", "espada-curta", "besta-mao"],
};

export function armorProficient(cat: ArmorProf, cls?: ClassDef, sub?: SubraceDef) {
  if (sub?.name === "Anão da Montanha" && (cat === "leve" || cat === "media")) return true;
  return Boolean(cls && CLASS_ARMOR[cls.name]?.includes(cat));
}

export function weaponProficient(w: WeaponDef, cls?: ClassDef, race?: RaceDef, sub?: SubraceDef) {
  if (w.id === "desarmado") return true; // Ataque desarmado: qualquer criatura é "treinada"
  const c = cls ? CLASS_WEAPONS[cls.name] : undefined;
  if (c && (c.categories.includes(w.category) || c.extra.includes(w.id))) return true;
  return [race?.name, sub?.name].some((n) => n && RACE_WEAPONS[n]?.includes(w.id));
}

// ---------------------------------------------------------------------------
// Cálculos
// ---------------------------------------------------------------------------

export const EMPTY_EQUIPMENT: Equipment = { armor: null, shield: false, weapons: [], focus: null, acBonus: 0 };

const fmt = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

/** CA automática a partir da armadura, do escudo e da Destreza, com a conta explicada. */
export function computeAc(eq: Equipment, cls: ClassDef | undefined, mods: Abilities) {
  const armor = findArmor(eq.armor);
  const parts: string[] = [];
  let total: number;

  if (!armor) {
    const unarmored = cls?.unarmored && !(cls.name === "Monge" && eq.shield) ? cls.unarmored : undefined;
    total = 10 + mods.dex + (unarmored ? mods[unarmored] : 0);
    parts.push("10 sem armadura", `${fmt(mods.dex)} Destreza`);
    if (unarmored) parts.push(`${fmt(mods[unarmored])} ${unarmored === "con" ? "Constituição" : "Sabedoria"} (Defesa sem Armadura)`);
  } else if (armor.category === "leve") {
    total = armor.ac + mods.dex;
    parts.push(`${armor.ac} ${armor.name}`, `${fmt(mods.dex)} Destreza`);
  } else if (armor.category === "media") {
    const dex = Math.min(2, mods.dex);
    total = armor.ac + dex;
    parts.push(`${armor.ac} ${armor.name}`, `${fmt(dex)} Destreza${mods.dex > 2 ? " (máx. +2)" : ""}`);
  } else {
    total = armor.ac;
    parts.push(`${armor.ac} ${armor.name} (pesada: Destreza não conta)`);
  }
  if (eq.shield) {
    total += SHIELD.bonus;
    parts.push(`+${SHIELD.bonus} Escudo`);
  }
  if (eq.acBonus) {
    total += eq.acBonus;
    parts.push(`${fmt(eq.acBonus)} bônus extra`);
  }
  return { total, parts };
}

export type Attack = {
  uid: string;
  weapon: WeaponDef;
  /** Nome exibido (ex.: "Cajado arcano (bordão)") */
  label: string;
  ability: "str" | "dex";
  abilityMod: number;
  proficient: boolean;
  toHit: number;
  damage: string;
  damageTwoHands?: string;
};

export function buildAttack(
  uid: string,
  weapon: WeaponDef,
  mods: Abilities,
  prof: number,
  proficient: boolean,
  label = weapon.name,
): Attack {
  // Acuidade: o melhor entre Força e Destreza. Armas à distância: Destreza. Resto: Força.
  const ability: "str" | "dex" = weapon.props.includes("acuidade")
    ? mods.dex > mods.str
      ? "dex"
      : "str"
    : weapon.kind === "distancia"
      ? "dex"
      : "str";
  const abilityMod = mods[ability];
  const withMod = (dice: string) => (dice === "—" ? "—" : abilityMod === 0 ? dice : `${dice}${abilityMod > 0 ? "+" : ""}${abilityMod}`);
  return {
    uid,
    weapon,
    label,
    ability,
    abilityMod,
    proficient,
    toHit: abilityMod + (proficient ? prof : 0),
    damage: weapon.damage === "1" ? `${Math.max(1, 1 + abilityMod)}` : withMod(weapon.damage),
    damageTwoHands: weapon.versatile ? withMod(weapon.versatile) : undefined,
  };
}

/** Peso (lb) de armadura, escudo, armas e foco equipados, item a item. */
export function equipmentWeights(eq: Equipment) {
  const list: { name: string; weight: number }[] = [];
  const armor = findArmor(eq.armor);
  if (armor) list.push({ name: armor.name, weight: armor.weight });
  if (eq.shield) list.push({ name: SHIELD.name, weight: SHIELD.weight });
  for (const w of eq.weapons) {
    const def = findWeapon(w.id);
    // Se o id não for reconhecido no catálogo, usa o peso salvo na própria ficha
    // (cópia feita quando a arma foi equipada) em vez de simplesmente ignorá-la.
    if (def) list.push({ name: def.name, weight: def.weight });
    else if (w.weight) list.push({ name: w.name ?? "Arma", weight: w.weight });
  }
  const focus = findFocus(eq.focus);
  if (focus) list.push({ name: focus.name, weight: focus.weight });
  return list;
}

/** CD (2024) para o alvo resistir a Agarrar ou Empurrar: 8 + proficiência + o maior entre Força e Destreza. */
export function maneuverDc(prof: number, mods: Abilities) {
  return 8 + prof + Math.max(mods.str, mods.dex);
}

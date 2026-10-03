# Taverna Inicial — VTT de D&D para iniciantes

Next.js (App Router + Tailwind CSS v4) + Supabase (Auth, Database, Realtime).

- **/fichas** — lista, cria e exclui personagens
- **/fichas/[id]** — ficha guiada para iniciantes (D&D 5e): raças e sub-raças, classes, antecedentes, 18 perícias, testes de resistência, PV/CA/iniciativa/deslocamento/dados de vida/inspiração, com balões de ajuda explicando cada número
- **/mesas** — cria mesas (como mestre) e entra em mesas pelo link
- **/mesa/[id]** — mesa multiplayer: grid, tokens arrastáveis em tempo real (Broadcast), jogadores online (Presence), rolagem de dados compartilhada e configuração da mesa pelo mestre

## 1. Banco de dados (Supabase)

> **Atualizando de uma versão anterior?** Rode o `supabase/schema.sql` de novo. Ele cria a coluna `user_id` nas fichas (copiando o antigo `owner_id`), a coluna `details` e as novas políticas de RLS baseadas em `user_id = auth.uid()`.


Abra **SQL Editor** no Supabase, cole `supabase/schema.sql` e rode.
O script é idempotente: como você já tem `profiles`, `characters`, `rooms` e `tokens`, ele só adiciona as colunas que faltarem, as políticas de RLS e o gatilho que cria o perfil no cadastro.

> Se alguma tabela já tiver colunas obrigatórias (NOT NULL sem valor padrão) que o app não preenche, a inserção vai falhar. Nesse caso, dê um valor padrão a essa coluna ou torne-a opcional.

## 2. Autenticação

Supabase → **Authentication → URL Configuration**:
- **Site URL**: a URL da Vercel (ex.: `https://seu-app.vercel.app`)
- **Redirect URLs**: adicione também `http://localhost:3000`


## 2.1 Cadastro com acesso imediato

O cadastro usa `supabase.auth.signUp` e já entra na conta, sem código nem link de confirmação. Para isso:

- Supabase → **Authentication → Providers → Email** (ou Sign In / Providers): **desligue "Confirm email"** e salve.

Se isso ficar ligado, a conta é criada mas não entra sozinha; a tela avisa o que ajustar.
Contas criadas enquanto a confirmação estava ligada e que nunca foram confirmadas podem ser liberadas em Authentication → Users → (usuário) → "Confirm email".

### Lembrar de mim

A caixa "Lembrar de mim" (marcada por padrão) guarda a sessão do Supabase no `localStorage`, então a pessoa continua conectada mesmo fechando o navegador, e o e-mail fica preenchido na próxima visita. Desmarcada, a sessão vai para o `sessionStorage` e termina ao fechar o navegador. A lógica fica em `src/lib/supabase.ts` (armazenamento personalizado passado em `auth.storage`).

Os campos usam `autocomplete` corretos, então o gerenciador de senhas do navegador também oferece para salvar e preencher o login.

## 3. Rodar localmente

```bash
cp .env.example .env.local   # preencha URL e anon key (Project Settings → API)
npm install
npm run dev
```

## 4. Deploy na Vercel

1. Suba a pasta para um repositório no GitHub (os arquivos ficam na raiz, `src/` incluso).
2. Na Vercel: **Add New → Project** → importe o repositório. Framework: Next.js (detectado sozinho). Root Directory: `./`.
3. Em **Environment Variables**, cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` **antes** do deploy (variáveis `NEXT_PUBLIC_` são embutidas no build; se mudar depois, faça Redeploy).
4. Deploy.

## Como o tempo real funciona

Cada mesa usa o canal `room:<id>`:
- **Broadcast** — `token-move`, `token-add`, `token-add-batch`, `token-update`, `token-remove`, `roll`, `room-update` (baixa latência, sem passar pelo banco)
- **Presence** — lista de quem está conectado
- O banco guarda o estado: ao soltar um token a posição é salva em `tokens`, então quem entra depois vê o mapa atualizado.

Permissões: cada jogador move/remove os próprios tokens; o mestre (dono da mesa) move/remove qualquer um e altera a configuração.

## Tabuleiro em 3D de verdade

O mapa tem um botão **"2D / 3D"** no canto do palco. O 2D continua sendo o modo padrão (mais leve, com arrastar-e-soltar do bestiário/cenário direto do catálogo); o 3D (`src/components/mesa/Board3D.tsx`) usa **React Three Fiber** (a camada React do Three.js — a mesma tecnologia do dado físico) pra desenhar:

- A mesa com profundidade de verdade: câmera em ângulo, base de madeira com volume, grade sobre o tabuleiro, zoom e giro de câmera (arrastar com o botão direito/dois dedos gira; a roda/pinça faz zoom, dentro de limites pra não perder o tabuleiro de vista).
- **Tokens como cilindros 3D de verdade**, com anel dourado de seleção, anel de "é a vez dele" na iniciativa, barra de vida e as iniciais sempre viradas pra câmera (billboard).
- **Cenário com geometria 3D real** por categoria: árvores (cone + tronco), rochas/montanhas (poliedro), fogueiras e tochas com luz própria piscando, móveis e paredes como blocos, perigos como discos no chão.
- As **mesmas funções** de selecionar, arrastar, mover por teclado (setas, com o token selecionado) e sincronizar em tempo real do modo 2D — só a parte visual muda, então trocar de 2D pra 3D a qualquer momento nunca perde nada.
- Nenhuma dependência de rede: o texto das etiquetas é desenhado num canvas local (`useLabelTexture`), não baixado de fonte externa — isso evitava um erro real que encontrei e corrigi durante os testes.
- **Botão "Travar câmera"** (canto superior esquerdo do palco, no modo 3D): deixa a câmera parada, sem girar — útil pra organizar várias peças em sequência sem a visão ficando se mexendo. Além disso, arrastar uma peça já não gira mais a câmera sozinho (antes, como os dois gestos usam o clique esquerdo do mouse, um atrapalhava o outro).
- **Móveis com várias partes, não só um bloco**: mesa (tampo + 4 pernas), cadeira (assento + encosto + pernas), cama (estrado + colchão + travesseiro + cabeceira), baú (base + tampa arredondada + fecho) e estante (fundo + laterais + prateleiras) — todos proporcionais ao tamanho da casa do grid. Paredes, portas e cercas continuam como blocos — ficam bem assim.
- **Miniatura de classe para o personagem do jogador**: o token de quem tem uma ficha vinculada mostra uma miniatura com a cara da classe dele, não mais um cilindro genérico — guerreiro/bárbaro/paladino/patrulheiro/monge ganham ombreiras e espada; mago/feiticeiro/bruxo ganham chapéu pontudo e cajado com orbe; clérigo/druida ganham auréola e símbolo sagrado; ladino/bardo ganham capuz e adagas. Monstros e peças livres continuam com o cilindro simples.

**Limitação conhecida:** no modo 3D, arrastar uma carta do bestiário/cenário direto pro mapa não funciona (só o botão "Colocar") — é uma limitação de como o arrastar-e-soltar do navegador conversa com uma tela WebGL. No 2D as duas formas continuam funcionando.

## Visual da mesa (HUD, dock e painel por abas)

A mesa foi redesenhada para ser entendida por quem nunca usou uma mesa virtual, sem perder nada do que já funcionava:

- **Barra superior (HUD)**: nome da mesa, status da conexão ("Conectado"/"Reconectando…"), selo de mestre, avatares de quem está na mesa agora (o mestre clica num avatar para abrir a ficha daquele jogador) e os botões "Convidar amigos" e "Como jogar".
- **Dock lateral**: cada ferramenta é um botão grande com ícone **e** palavra — Heróis, Ficha, Dados, Combate, Monstros e Cenário (só para o mestre) e Ajuda. Nada para adivinhar.
- **Painel por abas** (à direita): "Ação" (aparece sozinha ao clicar num token — PV com barra e botões rápidos +5/+1/−1/−5, CA, deslocamento, armas com botão de rolar ataque/dano, e poderes de classe como a Fúria), "Heróis" (colocar personagem no mapa), "Dados" (rolar e ver o histórico) e "Combate" (ordem de iniciativa). O mestre tem também a aba "Mesa" com as configurações.
- **Passo a passo** (`src/components/mesa/WelcomeGuide.tsx`): aparece sozinho na primeira visita de cada pessoa (jogador ou mestre têm textos diferentes) e pode ser reaberto a qualquer momento em "❓ Ajuda".
- **Zoom com botões** (`src/components/mesa/StageControls.tsx`): `−`/`+` e "Ajustar", que calcula o tamanho de célula para o mapa caber inteiro na tela.
- Cada peça no mapa agora mostra o **nome embaixo** (quando o zoom permite), além do PV e do selo de Fúria — sem precisar passar o mouse para saber quem é quem.
- Nada mudou na parte de dados: o hook `src/lib/mesa-canal.ts` concentra a conexão Realtime (Broadcast + Presence) num só lugar, usado pela página da mesa.

## Página inicial

A entrada do site (`src/app/page.tsx`) é o layout clássico de duas colunas — logo, título e texto de boas-vindas à esquerda, formulário de entrada à direita, dentro de um cartão de pergaminho envelhecido (`.parchment-card`, já usado em outras partes do app). Sem ilustração nem personagens desenhados: a pegada de RPG vem da textura de madeira no fundo, da tipografia e da paleta de latão/pergaminho, como no resto do app. Abaixo, os três passos de "Como funciona" e o pequeno dicionário de termos.

## SRD 5.2.1: Condições, Testes de Morte, Exaustão, Crítico e tradução total

- **As 15 condições oficiais** (`src/lib/condicoes.ts`), extraídas e traduzidas diretamente do glossário do SRD 5.2.1: Cego, Surdo, Enfeitiçado, Amedrontado, Agarrado, Incapacitado, Invisível, Paralisado, Petrificado, Envenenado, Caído, Contido, Atordoado, Inconsciente e Exausto. Marque/desmarque no token (mesa) ou na ficha — some sozinho num selo visível sobre o token no mapa, em tempo real para todos.
- **Testes de resistência contra a morte** (regra exata do SRD 5.2.1): aparece sozinho quando os PV chegam a 0, tanto na ficha quanto no token da mesa. 1d20: 10+ é sucesso, 1 natural conta como duas falhas, 20 natural recupera 1 PV na hora; 3 sucessos estabiliza, 3 falhas mata.
- **Exaustão** (regra 2024, nível único 0–6): −2 em todos os testes de d20 e −3 m de deslocamento por nível; nível 6 é morte; descanso longo remove 1 nível.
- **Dano crítico correto**: um botão "Crítico" ao lado de "Dano" (na ficha e no token da mesa) dobra de verdade os dados de dano (ex.: `1d8+3` vira `2d8+3`, modificador somado só uma vez), como manda a regra — antes o crítico só mudava a cor do resultado, sem dobrar o dado.
- **Tradução total para português**: as 334 criaturas do bestiário agora têm nome, ataques (ex.: "Mordida", "Cimitarra"), sentidos (convertidos de pés para metros) e idiomas 100% em português — antes cerca de 172 ficavam com o nome original em inglês. As 319 magias já estavam totalmente em português desde a entrega anterior. A única exceção deliberada: o texto longo e técnico de cada magia (campo interno, mostrado só no "ver mais" de cada feitiço) e as características especiais de alguns monstros (ex.: "Fuga Ágil" do Goblin) continuam no original em inglês — traduzir com fidelidade as centenas de parágrafos de regra ficou fora do escopo desta rodada.

## Bestiário completo, cenário em lote, iniciativa, dados e ficha flutuante

- **Bestiário do SRD** (botão "🐉 Bestiário"): as **334 criaturas** do SRD 5.1 — nenhuma de Product Identity (Observador, Devorador de Mentes, Githyanki etc.) — com busca em tempo real e filtros por **Nível de Desafio** (0 a 30), **Tipo** (Aberração, Fera, Morto-vivo, Dragão…) e **Tamanho**. Cada uma já vem com CA, PV, deslocamento, atributos e ataques prontos. Dados em `src/lib/monstros-srd.ts` (gerado do projeto 5e-bits/5e-database, licença MIT, que organiza o próprio SRD 5.1 da Wizards, CC-BY-4.0) e ajustes finos em `src/lib/monstros.ts`. Cerca de 160 criaturas têm nome traduzido; as demais mantêm o nome oficial em inglês (tipo e tamanho sempre em português).
- **Terrenos e cenário, com visual isométrico** (segunda aba do mesmo painel): paredes, fogueiras, natureza, mobília e perigos (`src/lib/cenario.ts`), sem ficha de combate. Cada peça é desenhada em `src/components/mesa/SceneryArt.tsx` com um pequeno motor de ilustração isométrica próprio (caixas, cones, cilindros e poças com três tons de sombra cada, luz vinda de cima) — dá volume e profundidade reais sem pesar o mapa, já que é tudo SVG vetorial: nada de WebGL por peça, que ficaria pesado com muitas peças na tela ao mesmo tempo. No mapa, a peça de cenário aparece só com a ilustração (sem fundo colorido atrás), sentada diretamente no chão com sombra de contato.
- **Colocação em lote**: em qualquer item (monstro ou cenário), escolha a quantidade e clique em "Colocar" — um único `insert` cria todos os tokens de uma vez, já espalhados em casas livres adjacentes. Também dá para arrastar um item para uma casa específica.
- **Rastreador de Iniciativa** (`src/components/InitiativeTracker.tsx`): barra fixa no topo do mapa. O mestre adiciona qualquer token à ordem com um valor de iniciativa, avança/volta o turno e acompanha a rodada atual; o token da vez ganha um anel dourado pulsante no mapa. Fica em `rooms.turn_order` (jsonb), `rooms.current_turn` e `rooms.round`.
- **Animação de dados em 3D de verdade** (`src/components/DiceOverlay.tsx`, biblioteca `react-3d-dice` sobre Three.js): toda rolagem aparece num overlay central com um dado físico de verdade (com faces e números reais) girando no ar por ~1 s e caindo **exatamente** no número que a mesa já calculou — nunca há divergência entre o visual e o resultado. Fórmulas com mais de um dado (ex.: `2d6+3`) mostram um dado físico para cada um, lado a lado. O dado brilha verde num 20 natural e vermelho num 1 natural. Funciona em qualquer navegador com WebGL (todos os atuais).
- **Ficha flutuante sobre a mesa** (`src/components/CharacterSheetModal.tsx`): jogadores têm o botão "📜 Minha ficha"; o mestre pode clicar no nome de qualquer jogador presente (barra "Na mesa") para abrir a ficha dele. A ficha completa (`CharacterSheet`, extraída de `/fichas/[id]`) abre num modal sobre o mapa, sem trocar de página.

## Ficha para iniciantes

- **Abas reorganizadas**: "Visão Geral" (origem, atributos, combate, testes de resistência, perícias, história) e "Equipamento" (armadura, escudo, foco, armas e ataques, manobras, mochila e moedas) — antes tudo isso vivia misturado numa aba só chamada "Ficha". As abas de Magias, Recursos, Ferramentas e Progressão continuam como antes.

- Regras em `src/lib/regras.ts` (raças, sub-raças, classes, antecedentes e perícias do Livro do Jogador) e textos de ajuda em `src/lib/glossario.ts`.
- O valor digitado em cada atributo é o **valor base**; o bônus da raça é somado automaticamente.
- Perícias do antecedente e da raça vêm marcadas; as da classe são escolhidas (as sugeridas têm ★).
- Os selos "?" mostram um balão ao passar o mouse e abrem uma janela ao clicar/tocar (componente `src/components/Help.tsx`).
- Sub-raça, antecedente, perícias escolhidas, inspiração e dados de vida gastos ficam na coluna `details` (jsonb).

## Tendência e equipamento

- **Tendência**: as 9 tendências oficiais, ao lado do antecedente (coluna `characters.alignment`).
- **Equipamento** (coluna `characters.equipment`, jsonb): armadura, escudo, armas e foco de conjuração escolhidos em catálogos com todas as armaduras (leves, médias, pesadas), escudo, armas simples e marciais e focos (arcanos, druídicos, símbolos sagrados, instrumentos e cajados mágicos). Dados em `src/lib/equipamento.ts`.
- A **CA** é calculada sozinha (armadura + Destreza conforme o tipo + escudo + bônus extra) e salva na coluna `ac`.
- Os **ataques** são montados automaticamente: bônus de ataque (Força, ou Destreza para armas à distância/acuidade, + proficiência se a classe/raça é treinada) e dano (dado da arma + modificador; versáteis mostram também o dano com duas mãos). Cajados servem de arma (como bordão).
- Cada item, propriedade (Acuidade, Leve, Versátil…) e tipo de dano tem um balão explicativo.

## Aba "Progressão e talentos"

- **Habilidades por nível** das 12 classes (1º ao 20º), liberadas conforme o nível da ficha; as próximas aparecem bloqueadas.
- **Subclasse**: todas as do Livro do Jogador (36), com as habilidades de cada nível; o botão só é liberado no nível certo da classe. Salva na coluna `characters.subclass`.
- **Talentos**: catálogo com os 42 talentos oficiais (nome em português e inglês, pré-requisito e bônus de atributo). Os escolhidos ficam em `characters.feats` (jsonb). Alerta, Observador, Mobilidade e Robusto já entram nos cálculos da ficha.
- Dados em `src/lib/progressao.ts`.

## Persistência da ficha (salvar/carregar)

- O botão "Salvar ficha" envia explicitamente **todas** as colunas: nome, raça, classe, nível, atributos, PV, CA, deslocamento, tendência, equipamento (armadura/escudo/armas/foco), subclasse, talentos, XP, moedas, recursos, proficiências em ferramentas, mochila, magias, anotações, `details` (sub-raça, antecedente, perícias, tendência de atributo do antecedente, inspiração, dados de vida) e o **peso total** (`total_weight`), recalculado na hora de salvar a partir da mochila + moedas + equipamento.
- Depois de salvar, o app busca de volta a linha exatamente como o Supabase gravou (`select().single()`) e atualiza a ficha na tela com ela — assim a ficha nunca fica dessincronizada do banco. Aparece um toast verde "✅ Ficha salva com sucesso!" no canto da tela.
- **Armas não duplicam dados**: cada arma equipada guarda o `id` do catálogo (`src/lib/equipamento.ts`) **e também uma cópia própria** (nome, dano, tipo de dano, maestria e peso), feita no momento em que a arma foi adicionada. O bônus de ataque é sempre recalculado ao vivo (depende dos atributos do personagem), mas se o `id` alguma vez não for reconhecido no catálogo, a arma continua aparecendo com nome, dano e maestria corretos em vez de sumir da lista — inclusive contando no peso total. Fichas salvas antes dessa mudança continuam funcionando normalmente (o campo extra é só um reforço).
- **Ao carregar** (`normalizeCharacter`, em `src/lib/dnd.ts`): todo campo tem um valor seguro de reserva mesmo que a coluna esteja ausente, `null` ou num formato inesperado (ficha salva antes de uma coluna existir, por exemplo) — arrays viram `[]`, objetos viram `{}` preenchido com zeros, números inválidos viram `0`. A Carga (peso) é calculada direto no corpo do componente a partir do estado já carregado, então aparece correta assim que a ficha abre, sem precisar de nenhuma interação.
- **Se você estiver vindo de uma versão anterior do projeto**, rode o `supabase/schema.sql` de novo: ele adiciona a coluna `total_weight` (as demais colunas de equipamento/mochila/moedas já existiam nas versões anteriores).

## Experiência, mochila, moedas e carga

- **XP** (coluna `characters.xp`): barra de progresso na aba Progressão com a tabela oficial (300, 900, 2.700… 355.000). Campo para somar a XP da sessão; ao atingir o próximo nível aparece o aviso "Hora de subir de nível!" com botão para subir.
- **Mochila** (coluna `characters.inventory`): catálogo com o equipamento de aventura do Livro do Jogador em categorias (aventura, luz e fogo, recipientes, comida e acampamento, roupas, munição, poções e alquimia, ferramentas, kits), com preço, peso e explicação de cada item, além de pacotes prontos (Explorador, Masmorras, Assaltante). Itens fora do catálogo podem ser criados com peso próprio. Dados em `src/lib/itens.ts`.
- **Moedas** (coluna `characters.coins`, jsonb): PC, PP, EP, PO e PL, total em PO e trocador com o câmbio oficial (1 PL = 10 PO; 1 PO = 2 EP = 10 PP = 100 PC).
- **Carga**: soma armadura, escudo, armas, foco, itens da mochila e moedas (50 moedas = 1 lb), em libras. Capacidade = Força × 15. Acima disso aparece o aviso de excesso de carga e o deslocamento cai para 1,5 m.

## Retrato do personagem

Na ficha, a moldura ao lado do nome aceita PNG, JPG ou WEBP (clique, toque ou arraste a imagem). A foto é reduzida no navegador (máx. 640 px), enviada ao **Supabase Storage** no bucket público `characters`, na pasta `characters/<user_id>/`, e a URL fica salva na coluna `characters.avatar_url`. O retrato é salvo na hora, sem precisar do botão "Salvar ficha". Ao trocar ou excluir, o arquivo antigo é apagado.

O `schema.sql` cria o bucket e as políticas: qualquer um vê as imagens pela URL, mas cada jogador só envia, troca ou apaga arquivos da própria pasta.

## Dados

Fórmulas aceitas: `1d20+5`, `2d6+1d4-1`, `d8`, `2d20kh1` (vantagem), `2d20kl1` (desvantagem), `4d6kh3`.

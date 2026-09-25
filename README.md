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

## Bestiário completo, cenário em lote, iniciativa, dados e ficha flutuante

- **Bestiário do SRD** (botão "🐉 Bestiário"): as **334 criaturas** do SRD 5.1 — nenhuma de Product Identity (Observador, Devorador de Mentes, Githyanki etc.) — com busca em tempo real e filtros por **Nível de Desafio** (0 a 30), **Tipo** (Aberração, Fera, Morto-vivo, Dragão…) e **Tamanho**. Cada uma já vem com CA, PV, deslocamento, atributos e ataques prontos. Dados em `src/lib/monstros-srd.ts` (gerado do projeto 5e-bits/5e-database, licença MIT, que organiza o próprio SRD 5.1 da Wizards, CC-BY-4.0) e ajustes finos em `src/lib/monstros.ts`. Cerca de 160 criaturas têm nome traduzido; as demais mantêm o nome oficial em inglês (tipo e tamanho sempre em português).
- **Terrenos e cenário** (segunda aba do mesmo painel): paredes, fogueiras, natureza, mobília e perigos (`src/lib/cenario.ts`), sem ficha de combate.
- **Colocação em lote**: em qualquer item (monstro ou cenário), escolha a quantidade e clique em "Colocar" — um único `insert` cria todos os tokens de uma vez, já espalhados em casas livres adjacentes. Também dá para arrastar um item para uma casa específica.
- **Rastreador de Iniciativa** (`src/components/InitiativeTracker.tsx`): barra fixa no topo do mapa. O mestre adiciona qualquer token à ordem com um valor de iniciativa, avança/volta o turno e acompanha a rodada atual; o token da vez ganha um anel dourado pulsante no mapa. Fica em `rooms.turn_order` (jsonb), `rooms.current_turn` e `rooms.round`.
- **Animação de dados** (`src/components/DiceOverlay.tsx`): toda rolagem aparece num overlay central com o dado girando (CSS) por ~0,9 s e depois revela o total em destaque, com brilho verde num 20 natural e vermelho num 1 natural, antes de ir para o histórico.
- **Ficha flutuante sobre a mesa** (`src/components/CharacterSheetModal.tsx`): jogadores têm o botão "📜 Minha ficha"; o mestre pode clicar no nome de qualquer jogador presente (barra "Na mesa") para abrir a ficha dele. A ficha completa (`CharacterSheet`, extraída de `/fichas/[id]`) abre num modal sobre o mapa, sem trocar de página.

## Ficha para iniciantes

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

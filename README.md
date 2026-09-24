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
- **Broadcast** — `token-move`, `token-add`, `token-remove`, `roll`, `room-update` (baixa latência, sem passar pelo banco)
- **Presence** — lista de quem está conectado
- O banco guarda o estado: ao soltar um token a posição é salva em `tokens`, então quem entra depois vê o mapa atualizado.

Permissões: cada jogador move/remove os próprios tokens; o mestre (dono da mesa) move/remove qualquer um e altera a configuração.

## Ficha para iniciantes

- Regras em `src/lib/regras.ts` (raças, sub-raças, classes, antecedentes e perícias do Livro do Jogador) e textos de ajuda em `src/lib/glossario.ts`.
- O valor digitado em cada atributo é o **valor base**; o bônus da raça é somado automaticamente.
- Perícias do antecedente e da raça vêm marcadas; as da classe são escolhidas (as sugeridas têm ★).
- Os selos "?" mostram um balão ao passar o mouse e abrem uma janela ao clicar/tocar (componente `src/components/Help.tsx`).
- Sub-raça, antecedente, perícias escolhidas, inspiração e dados de vida gastos ficam na coluna `details` (jsonb).

## Dados

Fórmulas aceitas: `1d20+5`, `2d6+1d4-1`, `d8`, `2d20kh1` (vantagem), `2d20kl1` (desvantagem), `4d6kh3`.

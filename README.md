# Taverna Inicial — VTT de D&D para iniciantes

Next.js (App Router + Tailwind CSS v4) + Supabase (Auth, Database, Realtime).

- **/fichas** — lista, cria e exclui personagens
- **/fichas/[id]** — editor da ficha: atributos (com rolagem de teste), PV, CA, deslocamento, inventário, magias e anotações
- **/mesas** — cria mesas (como mestre) e entra em mesas pelo link
- **/mesa/[id]** — mesa multiplayer: grid, tokens arrastáveis em tempo real (Broadcast), jogadores online (Presence), rolagem de dados compartilhada e configuração da mesa pelo mestre

## 1. Banco de dados (Supabase)

Abra **SQL Editor** no Supabase, cole `supabase/schema.sql` e rode.
O script é idempotente: como você já tem `profiles`, `characters`, `rooms` e `tokens`, ele só adiciona as colunas que faltarem, as políticas de RLS e o gatilho que cria o perfil no cadastro.

> Se alguma tabela já tiver colunas obrigatórias (NOT NULL sem valor padrão) que o app não preenche, a inserção vai falhar. Nesse caso, dê um valor padrão a essa coluna ou torne-a opcional.

## 2. Autenticação

Supabase → **Authentication → URL Configuration**:
- **Site URL**: a URL da Vercel (ex.: `https://seu-app.vercel.app`)
- **Redirect URLs**: adicione também `http://localhost:3000`

Se quiser testar sem confirmar e-mail, desative **Confirm email** em Authentication → Providers → Email.

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

## Dados

Fórmulas aceitas: `1d20+5`, `2d6+1d4-1`, `d8`, `2d20kh1` (vantagem), `2d20kl1` (desvantagem), `4d6kh3`.

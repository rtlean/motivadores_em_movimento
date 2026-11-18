# Motivadores em Movimento

App web para aplicar o **Moving Motivators** (Management 3.0) e o **Radar da Felicidade** nos times Seal Team e Fênix Team.

Stack: React + Vite (front), funções serverless da Vercel em `/api` (back) e Neon Postgres (banco).

## Telas
Como jogar · Participantes (cadastro com editar/excluir) · 1. Ordenar · 2. Mudança · 3. Resultado · 4. Painel dos times (Seal, Fênix, compilado) · 5. Radar da Felicidade (por pessoa, por time, compilado e notas individuais).

## Configuração
1. Crie um projeto no Neon e rode `db/schema.sql` no SQL Editor.
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (string de conexão do Neon).
3. `npm install`
4. Rodar local com API: `npx vercel dev` (porta 3000).
5. Testes da lógica: `npm test`

## Deploy (Vercel)
Importe o repositório na Vercel e cadastre a variável de ambiente `DATABASE_URL`. O build (`npm run build`) e as funções em `/api` são detectados automaticamente.

## Segurança
A API não tem login: quem tiver o link pode ver e alterar cadastros e notas. Proteja o deploy (ex.: Vercel Password Protection) ou adicione autenticação antes de usar com dados reais.

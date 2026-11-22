# Motivadores em Movimento

App web para aplicar o **Moving Motivators** (Management 3.0) e o **Radar da Felicidade** nos times Seal Team e Fênix Team.

Stack: React + Vite (front), funções serverless da Vercel em `/api` (back) e Neon Postgres (banco).

## Telas
Como jogar · Participantes (cadastro com editar/excluir) · 1. Ordenar · 2. Mudança · 3. Resultado · 4. Painel dos times (Seal, Fênix, compilado) · 5. Radar da Felicidade (por pessoa, por time, compilado e notas individuais).

## Configuração
1. Crie um projeto no Neon e rode `db/schema.sql` no SQL Editor.
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (string de conexão do Neon) e `APP_PASSWORD` (senha de acesso ao app).
3. `npm install`
4. Rodar local com API: `npx vercel dev` (porta 3000).
5. Testes da lógica: `npm test`

## Deploy (Vercel)
Importe o repositório na Vercel e cadastre as variáveis de ambiente `DATABASE_URL` e `APP_PASSWORD`. O build (`npm run build`) e as funções em `/api` são detectados automaticamente.

## Segurança
O app pede uma senha única (`APP_PASSWORD`), conferida em todas as chamadas da API. Sem essa variável configurada, a API recusa tudo. Compartilhe a senha só com quem conduz a dinâmica. Para vários facilitadores com acessos separados, troque por login individual.

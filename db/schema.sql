-- Neon Postgres schema for Motivadores em Movimento
create extension if not exists pgcrypto;

create table if not exists participantes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) between 1 and 100),
  funcao text not null default '' check (length(funcao) <= 100),
  tempo text not null check (tempo in ('Menos de 1 ano','1 a 3 anos','3 a 5 anos','Mais de 5 anos')),
  time text not null check (time in ('Seal Team','Fênix Team')),
  created_at timestamptz not null default now()
);
create unique index if not exists participantes_nome_uq on participantes (lower(trim(nome)));

-- One current result per participant (latest save wins).
create table if not exists resultados (
  participante_id uuid primary key references participantes(id) on delete cascade,
  ordem jsonb not null,
  imp jsonb not null default '{}',
  fel jsonb not null default '{}',
  mudanca text not null default '' check (length(mudanca) <= 200),
  updated_at timestamptz not null default now()
);

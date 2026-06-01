-- ============================================================
-- Experenciei — database schema
-- Idempotent: safe to run multiple times in the SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------
create table if not exists profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  papel       text        not null check (papel in ('mentor', 'aluno', 'admin')),
  categoria   text        not null check (categoria in ('estudante', 'medico')),
  nome        text        not null,
  foto        text,
  cidade      text,
  status      text        not null default 'pendente'
                          check (status in ('pendente', 'ativo', 'inativo', 'rejeitado')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists mentor_profiles (
  id                uuid    primary key references profiles(id) on delete cascade,
  crm               text    not null,
  uf                char(2) not null,
  especialidade     text    not null,
  subespecialidades text[]  not null default '{}',
  anos_experiencia  int,
  mini_curriculo    text,
  ambientes         text[]  not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists student_profiles (
  id             uuid primary key references profiles(id) on delete cascade,
  crm            text,
  especialidade  text,
  ano_formacao   int,
  nivel          text check (nivel in ('estudante', 'residente', 'especialista')),
  objetivos      text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists documents (
  id          uuid        primary key default gen_random_uuid(),
  profile_id  uuid        not null references profiles(id) on delete cascade,
  tipo        text        not null,
  arquivo     text        not null,
  status      text        not null default 'pendente'
                          check (status in ('pendente', 'aprovado', 'rejeitado')),
  revisor     uuid        references profiles(id),
  data        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at       on profiles;
drop trigger if exists trg_mentor_profiles_updated_at on mentor_profiles;
drop trigger if exists trg_student_profiles_updated_at on student_profiles;

create trigger trg_profiles_updated_at
  before update on profiles for each row execute function set_updated_at();
create trigger trg_mentor_profiles_updated_at
  before update on mentor_profiles for each row execute function set_updated_at();
create trigger trg_student_profiles_updated_at
  before update on student_profiles for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Grants — allow anon/authenticated roles to use the tables
-- (needed when tables are created via SQL editor, not the UI)
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update          on profiles         to authenticated;
grant select, insert, update          on mentor_profiles  to authenticated;
grant select, insert, update          on student_profiles to authenticated;
grant select, insert, update, delete  on documents        to authenticated;

-- anon can read active mentor profiles without logging in
grant select on profiles        to anon;
grant select on mentor_profiles to anon;

-- ------------------------------------------------------------
-- Row Level Security — enable + drop all policies first
-- ------------------------------------------------------------
alter table profiles         enable row level security;
alter table mentor_profiles  enable row level security;
alter table student_profiles enable row level security;
alter table documents        enable row level security;

-- profiles
drop policy if exists "profiles: owner select" on profiles;
drop policy if exists "profiles: owner insert" on profiles;
drop policy if exists "profiles: owner update" on profiles;

create policy "profiles: owner select"
  on profiles for select
  using (auth.uid() = id or (papel = 'mentor' and status = 'ativo'));

create policy "profiles: owner insert"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner update"
  on profiles for update
  using (auth.uid() = id);

-- mentor_profiles
drop policy if exists "mentor_profiles: public select" on mentor_profiles;
drop policy if exists "mentor_profiles: owner insert"  on mentor_profiles;
drop policy if exists "mentor_profiles: owner update"  on mentor_profiles;

create policy "mentor_profiles: public select"
  on mentor_profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from profiles
      where profiles.id = mentor_profiles.id and profiles.status = 'ativo'
    )
  );

create policy "mentor_profiles: owner insert"
  on mentor_profiles for insert
  with check (auth.uid() = id);

create policy "mentor_profiles: owner update"
  on mentor_profiles for update
  using (auth.uid() = id);

-- student_profiles
drop policy if exists "student_profiles: owner select" on student_profiles;
drop policy if exists "student_profiles: owner insert" on student_profiles;
drop policy if exists "student_profiles: owner update" on student_profiles;

create policy "student_profiles: owner select"
  on student_profiles for select using (auth.uid() = id);

create policy "student_profiles: owner insert"
  on student_profiles for insert with check (auth.uid() = id);

create policy "student_profiles: owner update"
  on student_profiles for update using (auth.uid() = id);

-- documents
drop policy if exists "documents: owner select" on documents;
drop policy if exists "documents: owner insert" on documents;

create policy "documents: owner select"
  on documents for select using (auth.uid() = profile_id);

create policy "documents: owner insert"
  on documents for insert with check (auth.uid() = profile_id);

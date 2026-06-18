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
  status      text        not null default 'enviado'
                          check (status in ('enviado')),
  data        timestamptz not null default now()
);

-- Migrate existing rows and re-apply constraint (idempotent)
alter table documents drop constraint if exists documents_status_check;
alter table documents alter column status set default 'enviado';
alter table documents add constraint documents_status_check check (status in ('enviado'));

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
grant select, insert, update, delete  on offerings        to authenticated;
grant select, insert, update, delete  on procedures       to authenticated;

-- anon can browse published offerings and mentor names without logging in
-- bookings grant is required so Postgres can plan RLS policies that reference
-- the bookings table; the bookings RLS (auth.uid() = aluno_id) ensures anon
-- sees zero rows.
grant select on profiles        to anon;
grant select on mentor_profiles to anon;
grant select on procedures      to anon;
grant select on offerings       to anon;
grant select on bookings        to anon;

-- ------------------------------------------------------------
-- Row Level Security — enable + drop all policies first
-- ------------------------------------------------------------
alter table profiles         enable row level security;
alter table mentor_profiles  enable row level security;
alter table student_profiles enable row level security;
alter table documents        enable row level security;

-- profiles (select policy defined below with full anon support)
drop policy if exists "profiles: owner select" on profiles;
drop policy if exists "profiles: owner insert" on profiles;
drop policy if exists "profiles: owner update" on profiles;

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

-- ------------------------------------------------------------
-- Procedures catalog
-- ------------------------------------------------------------
create table if not exists procedures (
  id            uuid        primary key default gen_random_uuid(),
  nome          text        not null unique,
  especialidade text        not null,
  complexidade  text        not null
                            check (complexidade in ('basico', 'intermediario', 'avancado')),
  created_at    timestamptz not null default now()
);


alter table procedures enable row level security;

drop policy if exists "procedures: anyone read" on procedures;
drop policy if exists "procedures: admin write" on procedures;

create policy "procedures: anyone read"
  on procedures for select using (true);

create policy "procedures: admin write"
  on procedures for insert
  with check (exists (select 1 from profiles where id = auth.uid() and papel = 'admin'));

-- Seed (idempotent via unique nome)
insert into procedures (nome, especialidade, complexidade) values
  ('Revascularização Miocárdica',          'Cirurgia Cardiovascular', 'avancado'),
  ('Troca de Valva Aórtica',               'Cirurgia Cardiovascular', 'avancado'),
  ('Troca de Valva Mitral',                'Cirurgia Cardiovascular', 'avancado'),
  ('Correção de Aneurisma Aórtico',        'Cirurgia Cardiovascular', 'avancado'),
  ('Colecistectomia Laparoscópica',        'Cirurgia Geral',          'intermediario'),
  ('Apendicectomia Laparoscópica',         'Cirurgia Geral',          'basico'),
  ('Herniorrafia Inguinal',                'Cirurgia Geral',          'basico'),
  ('Gastrectomia Parcial',                 'Cirurgia Geral',          'avancado'),
  ('Artroscopia de Joelho',                'Ortopedia',               'intermediario'),
  ('Artroplastia Total de Quadril',        'Ortopedia',               'avancado'),
  ('Artroplastia Total de Joelho',         'Ortopedia',               'avancado'),
  ('Osteossíntese de Fêmur',               'Ortopedia',               'intermediario'),
  ('Craniotomia',                          'Neurocirurgia',           'avancado'),
  ('Microdiscectomia Lombar',              'Neurocirurgia',           'intermediario'),
  ('Prostatectomia Radical Laparoscópica', 'Urologia',                'avancado'),
  ('Nefrectomia Parcial',                  'Urologia',                'avancado'),
  ('Histerectomia Total Laparoscópica',    'Ginecologia',             'intermediario'),
  ('Miomectomia Laparoscópica',            'Ginecologia',             'intermediario')
on conflict (nome) do nothing;

-- ------------------------------------------------------------
-- Offerings (mentorias criadas pelo mentor)
-- ------------------------------------------------------------
create table if not exists offerings (
  id               uuid          primary key default gen_random_uuid(),
  mentor_id        uuid          not null references profiles(id) on delete cascade,
  procedure_id     uuid          references procedures(id),
  titulo           text          not null,
  descricao        text,
  max_vagas        int           not null default 1
                                 check (max_vagas between 1 and 20),
  preco            numeric(10,2) not null check (preco >= 0),
  inicio           timestamptz   not null,
  fim              timestamptz   not null,
  cidade           text          not null,
  local_descricao  text,
  status           text          not null default 'publicado'
                                 check (status in ('rascunho', 'publicado', 'encerrado')),
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

drop trigger if exists trg_offerings_updated_at on offerings;
create trigger trg_offerings_updated_at
  before update on offerings for each row execute function set_updated_at();


alter table offerings enable row level security;

drop policy if exists "offerings: read published or own"   on offerings;
drop policy if exists "offerings: read published"          on offerings;
drop policy if exists "offerings: auth read own or booked" on offerings;
drop policy if exists "offerings: mentor insert"           on offerings;
drop policy if exists "offerings: mentor update"           on offerings;
drop policy if exists "offerings: mentor delete"           on offerings;

-- Anon + authenticated: published offerings only (no bookings reference avoids 401 for anon)
create policy "offerings: read published"
  on offerings for select
  using (status = 'publicado');

-- Authenticated: also see own offerings and offerings they've booked
create policy "offerings: auth read own or booked"
  on offerings for select
  using (
    auth.uid() is not null
    and (
      auth.uid() = mentor_id
      or exists (
        select 1 from bookings
        where bookings.offering_id = offerings.id
          and bookings.aluno_id = auth.uid()
      )
    )
  );

create policy "offerings: mentor insert"
  on offerings for insert
  with check (auth.uid() = mentor_id);

create policy "offerings: mentor update"
  on offerings for update
  using (auth.uid() = mentor_id);

create policy "offerings: mentor delete"
  on offerings for delete
  using (auth.uid() = mentor_id);

-- ------------------------------------------------------------
-- Bookings (candidaturas de alunos a offerings)
-- ------------------------------------------------------------
create table if not exists bookings (
  id          uuid        primary key default gen_random_uuid(),
  aluno_id    uuid        not null references profiles(id) on delete cascade,
  mentor_id   uuid        not null references profiles(id) on delete cascade,
  offering_id uuid        not null references offerings(id) on delete cascade,
  mensagem    text,
  status      text        not null default 'pendente'
                          check (status in ('pendente','confirmado','rejeitado','concluido','cancelado')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (aluno_id, offering_id)
);

drop trigger if exists trg_bookings_updated_at on bookings;
create trigger trg_bookings_updated_at
  before update on bookings for each row execute function set_updated_at();

grant select, insert, update on bookings to authenticated;

alter table bookings enable row level security;

drop policy if exists "bookings: aluno select"  on bookings;
drop policy if exists "bookings: aluno insert"  on bookings;
drop policy if exists "bookings: mentor select" on bookings;
drop policy if exists "bookings: mentor update" on bookings;
drop policy if exists "bookings: aluno update"  on bookings;

create policy "bookings: aluno select"
  on bookings for select using (auth.uid() = aluno_id);

create policy "bookings: aluno insert"
  on bookings for insert with check (auth.uid() = aluno_id);

create policy "bookings: aluno update"
  on bookings for update
  using (auth.uid() = aluno_id);

create policy "bookings: mentor select"
  on bookings for select using (auth.uid() = mentor_id);

create policy "bookings: mentor update"
  on bookings for update using (auth.uid() = mentor_id);

-- ------------------------------------------------------------
-- Updated profiles read policy
-- Expands visibility to: active mentors, mentors with published
-- offerings (for landing/student explore), and student applicants
-- visible to the relevant mentor.
-- ------------------------------------------------------------
drop policy if exists "profiles: owner select"              on profiles;
drop policy if exists "profiles: mentor sees applicant"     on profiles;
drop policy if exists "profiles: anon see mentor offering"  on profiles;

create policy "profiles: owner select"
  on profiles for select
  using (
    auth.uid() = id
    or (papel = 'mentor' and status = 'ativo')
    or (papel = 'mentor' and exists (
      select 1 from offerings
      where offerings.mentor_id = profiles.id
        and offerings.status = 'publicado'
    ))
    or (papel = 'mentor' and auth.uid() is not null and exists (
      select 1 from bookings
      where bookings.mentor_id = profiles.id
        and bookings.aluno_id = auth.uid()
    ))
    or (papel = 'aluno' and auth.uid() is not null and exists (
      select 1 from bookings
      where bookings.aluno_id = profiles.id
        and bookings.mentor_id = auth.uid()
    ))
  );

-- Allows anon (landing page) to see names of mentors with published offerings
create policy "profiles: anon see mentor offering"
  on profiles for select
  using (
    papel = 'mentor'
    and exists (
      select 1 from offerings
      where offerings.mentor_id = profiles.id
        and offerings.status = 'publicado'
    )
  );

-- ------------------------------------------------------------
-- Messages (async chat between student and mentor per offering)
-- Booking_id is optional: NULL means pre-booking chat, otherwise tied to a booking
-- ------------------------------------------------------------
create table if not exists messages (
  id            uuid        primary key default gen_random_uuid(),
  offering_id   uuid        not null references offerings(id) on delete cascade,
  booking_id    uuid        references bookings(id) on delete cascade,
  sender_id     uuid        not null references profiles(id) on delete cascade,
  conteudo      text        not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

grant select, insert, update on messages to authenticated;

alter table messages enable row level security;

drop policy if exists "messages: sender or parties select" on messages;
drop policy if exists "messages: sender insert" on messages;

create policy "messages: sender or parties select"
  on messages for select
  using (
    auth.uid() = sender_id
    or (
      booking_id is not null
      and exists (
        select 1 from bookings b
        where b.id = booking_id
          and (b.aluno_id = auth.uid() or b.mentor_id = auth.uid())
      )
    )
    or (
      booking_id is null
      and exists (
        select 1 from offerings o
        where o.id = offering_id
          and o.mentor_id = auth.uid()
      )
    )
  );

create policy "messages: sender insert"
  on messages for insert
  with check (auth.uid() = sender_id);

-- ------------------------------------------------------------
-- Storage bucket for document uploads (identity, CRM, etc.)
-- Run in Supabase SQL Editor — requires storage schema access.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "documents storage: owner upload" on storage.objects;
drop policy if exists "documents storage: owner select" on storage.objects;

create policy "documents storage: owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "documents storage: owner select"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- Tabela de avaliações mútuas (aluno ↔ mentor) pós-mentoria
-- Execute no Supabase SQL Editor após schema.sql e admin_policies.sql
-- =============================================================================

create table if not exists avaliacoes (
  id          uuid          primary key default gen_random_uuid(),
  booking_id  uuid          not null references bookings(id) on delete cascade,
  autor_id    uuid          not null references profiles(id),
  autor_nome  text          not null,
  avaliado_id uuid          not null references profiles(id),
  direcao     text          not null
                            check (direcao in ('aluno_para_mentor', 'mentor_para_aluno')),
  nota        smallint      not null check (nota between 1 and 5),
  comentario  text,
  created_at  timestamptz   not null default now(),
  unique (booking_id, autor_id)
);

alter table avaliacoes enable row level security;

-- Permissões de tabela (necessário além das policies RLS)
grant select, insert on avaliacoes to authenticated;
grant select on avaliacoes to anon;

-- Preenche autor_nome automaticamente (mesmo padrão de trg_fill_message_sender_nome,
-- evita precisar de policy de SELECT em profiles de terceiros só para exibir o nome).
create or replace function fill_avaliacao_autor_nome()
returns trigger language plpgsql security definer as $$
begin
  select nome into new.autor_nome from profiles where id = new.autor_id;
  return new;
end;
$$;

drop trigger if exists trg_fill_avaliacao_autor_nome on avaliacoes;
create trigger trg_fill_avaliacao_autor_nome
  before insert on avaliacoes
  for each row execute function fill_avaliacao_autor_nome();

-- Avaliações de aluno sobre mentor são públicas (ranking + futura exibição no perfil do mentor)
create policy "avaliacoes: select pública (aluno_para_mentor)"
  on avaliacoes for select
  using (direcao = 'aluno_para_mentor');

-- Avaliações de mentor sobre aluno são privadas: autor, avaliado ou admin
create policy "avaliacoes: select privada (mentor_para_aluno)"
  on avaliacoes for select
  using (
    direcao = 'mentor_para_aluno'
    and (autor_id = auth.uid() or avaliado_id = auth.uid() or is_admin())
  );

-- Só pode avaliar quem participou de um booking concluído, na direção correta
create policy "avaliacoes: insert"
  on avaliacoes for insert
  with check (
    autor_id = auth.uid()
    and exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.status = 'concluido'
        and (
          (direcao = 'aluno_para_mentor' and b.aluno_id = auth.uid() and avaliado_id = b.mentor_id)
          or
          (direcao = 'mentor_para_aluno' and b.mentor_id = auth.uid() and avaliado_id = b.aluno_id)
        )
    )
  );

-- =============================================================================
-- Painel Administrativo — políticas RLS e utilidades
-- Execute este arquivo no Supabase SQL Editor após o schema.sql principal
-- =============================================================================

-- Nova coluna para armazenar o motivo de rejeição (visível ao usuário)
alter table profiles add column if not exists motivo_rejeicao text;

-- ─── Função auxiliar is_admin() ───────────────────────────────────────────────
-- security definer evita recursão circular: a policy de profiles não pode fazer
-- "select from profiles" diretamente sem gerar loop infinito no RLS.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and papel = 'admin'
  )
$$;

-- ─── Políticas RLS para admin ─────────────────────────────────────────────────

drop policy if exists "profiles: admin select" on profiles;
drop policy if exists "profiles: admin update" on profiles;
drop policy if exists "documents: admin select" on documents;
drop policy if exists "documents storage: admin select" on storage.objects;

-- Profiles: admin pode ler todos os perfis (não apenas o próprio)
create policy "profiles: admin select"
  on profiles for select
  using (is_admin());

-- Profiles: admin pode atualizar qualquer perfil (status, motivo_rejeicao, etc.)
create policy "profiles: admin update"
  on profiles for update
  using (is_admin());

-- Documents: admin pode ler todos os documentos
create policy "documents: admin select"
  on documents for select
  using (is_admin());

-- Storage: admin pode gerar signed URLs dos documentos de qualquer usuário
create policy "documents storage: admin select"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and is_admin()
  );

-- ─── Trigger: valida transições de status ────────────────────────────────────
-- Impede que usuários comuns alterem seu próprio status para 'ativo', 'inativo'
-- ou 'rejeitado'. A única transição permitida para não-admins é:
--   rejeitado → pendente  (solicitar nova análise)
-- O trigger também limpa motivo_rejeicao ao re-solicitar análise.
create or replace function validate_profile_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if OLD.status is distinct from NEW.status then
    if not is_admin() then
      -- Única transição autorizada para usuário comum
      if not (OLD.status = 'rejeitado' and NEW.status = 'pendente') then
        raise exception 'Transição de status não autorizada: % → %', OLD.status, NEW.status;
      end if;
      -- Garante limpeza do motivo ao re-solicitar
      NEW.motivo_rejeicao := null;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_validate_profile_status on profiles;

create trigger trg_validate_profile_status
  before update on profiles
  for each row
  execute function validate_profile_status_change();

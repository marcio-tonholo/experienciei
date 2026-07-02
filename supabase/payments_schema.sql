-- =============================================================================
-- Tabela de pagamentos — Stripe Checkout
-- Execute no Supabase SQL Editor após schema.sql e admin_policies.sql
-- =============================================================================

create table if not exists payments (
  id                    uuid          primary key default gen_random_uuid(),
  booking_id            uuid          not null unique references bookings(id) on delete cascade,
  aluno_id              uuid          not null references profiles(id),
  mentor_id             uuid          not null references profiles(id),
  offering_id           uuid          not null references offerings(id),
  valor_bruto           numeric(10,2) not null,
  stripe_session_id     text          unique,
  stripe_payment_intent text,
  metodo_pagamento      text,           -- 'card' (preenchido após checkout.session.completed; pix será adicionado futuramente)
  -- comissao_pct numeric(5,2) default 0, -- reservado para futura implementação de comissão
  status                text          not null default 'pendente'
                                      check (status in ('pendente', 'pago', 'falhou', 'expirado')),
  repasse_status        text          not null default 'pendente'
                                      check (repasse_status in ('pendente', 'repassado')),
  repasse_em            timestamptz,
  created_at            timestamptz   not null default now(),
  updated_at            timestamptz   not null default now()
);

alter table payments enable row level security;

-- Permissões de tabela (necessário além das policies RLS)
grant select, insert, update on payments to authenticated;

-- Aluno vê seus próprios pagamentos
create policy "payments: aluno select"
  on payments for select
  using (auth.uid() = aluno_id);

-- Mentor vê pagamentos das suas mentorias
create policy "payments: mentor select"
  on payments for select
  using (auth.uid() = mentor_id);

-- Admin lê todos os pagamentos
create policy "payments: admin select"
  on payments for select
  using (is_admin());

-- Admin atualiza repasse_status (marcar como repassado)
create policy "payments: admin update"
  on payments for update
  using (is_admin());

-- Trigger: atualiza updated_at automaticamente
create or replace function update_payments_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger trg_payments_updated_at
  before update on payments
  for each row
  execute function update_payments_updated_at();

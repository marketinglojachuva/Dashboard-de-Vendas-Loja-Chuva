create table if not exists public.historico_importacoes_ml (
  id text primary key,
  data_importacao timestamptz not null default now(),
  periodo_referencia text not null check (periodo_referencia in ('Semana Atual', 'Período Anterior')),
  payload_dados jsonb not null default '{}'::jsonb
);

create index if not exists historico_importacoes_ml_data_importacao_idx
  on public.historico_importacoes_ml (data_importacao desc);

alter table public.historico_importacoes_ml enable row level security;

create policy "historico_importacoes_ml_select_public"
  on public.historico_importacoes_ml for select
  to anon, authenticated
  using (true);

create policy "historico_importacoes_ml_insert_public"
  on public.historico_importacoes_ml for insert
  to anon, authenticated
  with check (true);

create policy "historico_importacoes_ml_update_public"
  on public.historico_importacoes_ml for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "historico_importacoes_ml_delete_public"
  on public.historico_importacoes_ml for delete
  to anon, authenticated
  using (true);

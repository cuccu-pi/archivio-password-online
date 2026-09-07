-- Un solo record cifrato per utente, più semplice e più sicuro per un vault personale
create table if not exists public.vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique default 'local-user',
  vault_json text not null,
  updated_at timestamptz not null default now()
);

-- Abilita accesso anonimo per una configurazione personale e semplificata
alter table public.vault_entries enable row level security;

create policy "Allow anon full access for personal vault"
on public.vault_entries
for all
using (true)
with check (true);

create index if not exists idx_vault_entries_updated_at
on public.vault_entries (updated_at desc);

create table if not exists operational_activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table operational_activity_logs enable row level security;

drop policy if exists "operational_activity_logs_owner" on operational_activity_logs;
create policy "operational_activity_logs_owner"
on operational_activity_logs for all
to authenticated
using (actor_id = auth.uid())
with check (actor_id = auth.uid());

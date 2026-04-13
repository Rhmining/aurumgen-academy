create table if not exists airum_evaluations (
  id bigint generated always as identity primary key,
  message_id uuid not null unique references airum_messages(id) on delete cascade,
  retrieval_score numeric,
  answer_score numeric,
  source_count integer not null default 0,
  avg_similarity numeric,
  flags text[] default '{}',
  created_at timestamptz default now()
);

alter table airum_evaluations enable row level security;

drop policy if exists "airum_evaluations_owner" on airum_evaluations;
create policy "airum_evaluations_owner"
on airum_evaluations for all
to authenticated
using (
  exists (
    select 1
    from airum_messages
    join airum_sessions on airum_sessions.id = airum_messages.session_id
    where airum_messages.id = airum_evaluations.message_id
      and airum_sessions.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from airum_messages
    join airum_sessions on airum_sessions.id = airum_messages.session_id
    where airum_messages.id = airum_evaluations.message_id
      and airum_sessions.owner_id = auth.uid()
  )
);

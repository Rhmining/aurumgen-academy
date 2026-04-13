create table if not exists airum_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('student', 'parent', 'teacher', 'aiadmin', 'developer')),
  title text not null default 'Percakapan Baru',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists airum_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references airum_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create table if not exists airum_citations (
  id bigint generated always as identity primary key,
  message_id uuid not null references airum_messages(id) on delete cascade,
  document_id bigint not null references ai_documents(id) on delete cascade,
  chunk_index integer not null,
  title text not null,
  category text not null,
  similarity numeric,
  retrieval_method text,
  snippet text,
  created_at timestamptz default now()
);

alter table airum_sessions enable row level security;
alter table airum_messages enable row level security;
alter table airum_citations enable row level security;

create or replace function set_airum_session_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists airum_sessions_set_updated_at on airum_sessions;
create trigger airum_sessions_set_updated_at
before update on airum_sessions
for each row execute procedure set_airum_session_updated_at();

drop policy if exists "airum_sessions_owner" on airum_sessions;
create policy "airum_sessions_owner"
on airum_sessions for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "airum_messages_owner" on airum_messages;
create policy "airum_messages_owner"
on airum_messages for all
to authenticated
using (
  exists (
    select 1 from airum_sessions
    where airum_sessions.id = airum_messages.session_id
      and airum_sessions.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from airum_sessions
    where airum_sessions.id = airum_messages.session_id
      and airum_sessions.owner_id = auth.uid()
  )
);

drop policy if exists "airum_citations_owner" on airum_citations;
create policy "airum_citations_owner"
on airum_citations for all
to authenticated
using (
  exists (
    select 1
    from airum_messages
    join airum_sessions on airum_sessions.id = airum_messages.session_id
    where airum_messages.id = airum_citations.message_id
      and airum_sessions.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from airum_messages
    join airum_sessions on airum_sessions.id = airum_messages.session_id
    where airum_messages.id = airum_citations.message_id
      and airum_sessions.owner_id = auth.uid()
  )
);

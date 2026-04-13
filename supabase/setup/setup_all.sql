-- AURUMGEN Academy Supabase setup
-- Jalankan file ini di Supabase SQL Editor jika Anda ingin setup dalam satu paste.

create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  role text not null check (role in ('student', 'parent', 'teacher', 'aiadmin', 'developer')),
  created_at timestamptz default now()
);

create table if not exists curriculum_items (
  id bigint generated always as identity primary key,
  title text not null,
  pathway text not null,
  subject text not null,
  created_at timestamptz default now()
);

create table if not exists materials (
  id bigint generated always as identity primary key,
  title text not null,
  subject text not null,
  storage_path text,
  created_at timestamptz default now()
);

create table if not exists question_bank (
  id bigint generated always as identity primary key,
  prompt text not null,
  difficulty text not null,
  created_at timestamptz default now()
);

create table if not exists progress_snapshots (
  id bigint generated always as identity primary key,
  profile_id uuid not null,
  score numeric,
  created_at timestamptz default now()
);

create table if not exists ai_documents (
  id bigint generated always as identity primary key,
  title text not null,
  status text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table curriculum_items enable row level security;
alter table materials enable row level security;
alter table question_bank enable row level security;
alter table progress_snapshots enable row level security;
alter table ai_documents enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table materials
  add column if not exists pathway text default 'IGCSE',
  add column if not exists description text,
  add column if not exists visibility text not null default 'private' check (visibility in ('private', 'portal', 'published')),
  add column if not exists owner_id uuid references profiles(id) on delete cascade;

alter table question_bank
  add column if not exists subject text default 'General',
  add column if not exists pathway text default 'IGCSE',
  add column if not exists exam_board text not null default 'IGCSE',
  add column if not exists answer_key text,
  add column if not exists tags text[] default '{}',
  add column if not exists owner_id uuid references profiles(id) on delete cascade,
  drop constraint if exists question_bank_difficulty_check,
  add constraint question_bank_difficulty_check check (difficulty in ('easy', 'medium', 'hard'));

alter table ai_documents
  add column if not exists category text not null default 'knowledge',
  add column if not exists source_type text not null default 'manual',
  add column if not exists content text not null default '',
  add column if not exists owner_id uuid references profiles(id) on delete cascade,
  drop constraint if exists ai_documents_status_check,
  add constraint ai_documents_status_check check (status in ('draft', 'queued', 'processed', 'published'));

drop policy if exists "profiles_select_self" on profiles;
create policy "profiles_select_self"
on profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self"
on profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "materials_read_authenticated" on materials;
create policy "materials_read_authenticated"
on materials for select
to authenticated
using (true);

drop policy if exists "materials_write_teacher" on materials;
create policy "materials_write_teacher"
on materials for insert
to authenticated
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "materials_update_teacher" on materials;
create policy "materials_update_teacher"
on materials for update
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id)
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "materials_delete_teacher" on materials;
create policy "materials_delete_teacher"
on materials for delete
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "question_bank_read_authenticated" on question_bank;
create policy "question_bank_read_authenticated"
on question_bank for select
to authenticated
using (true);

drop policy if exists "question_bank_write_teacher" on question_bank;
create policy "question_bank_write_teacher"
on question_bank for insert
to authenticated
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "question_bank_update_teacher" on question_bank;
create policy "question_bank_update_teacher"
on question_bank for update
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id)
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "question_bank_delete_teacher" on question_bank;
create policy "question_bank_delete_teacher"
on question_bank for delete
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "ai_documents_read_internal" on ai_documents;
create policy "ai_documents_read_internal"
on ai_documents for select
to authenticated
using (public.current_role() in ('teacher', 'aiadmin', 'developer'));

drop policy if exists "ai_documents_write_internal" on ai_documents;
create policy "ai_documents_write_internal"
on ai_documents for insert
to authenticated
with check (public.current_role() in ('aiadmin', 'developer') and auth.uid() = owner_id);

drop policy if exists "ai_documents_update_internal" on ai_documents;
create policy "ai_documents_update_internal"
on ai_documents for update
to authenticated
using (public.current_role() in ('aiadmin', 'developer') and auth.uid() = owner_id)
with check (public.current_role() in ('aiadmin', 'developer') and auth.uid() = owner_id);

drop policy if exists "ai_documents_delete_internal" on ai_documents;
create policy "ai_documents_delete_internal"
on ai_documents for delete
to authenticated
using (public.current_role() in ('aiadmin', 'developer') and auth.uid() = owner_id);

insert into storage.buckets (id, name, public)
values
  ('materials', 'materials', false),
  ('ai-documents', 'ai-documents', false)
on conflict (id) do nothing;

alter table materials
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint;

alter table ai_documents
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint;

drop policy if exists "materials_bucket_read" on storage.objects;
create policy "materials_bucket_read"
on storage.objects for select
to authenticated
using (bucket_id = 'materials');

drop policy if exists "materials_bucket_write" on storage.objects;
create policy "materials_bucket_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "materials_bucket_update" on storage.objects;
create policy "materials_bucket_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "materials_bucket_delete" on storage.objects;
create policy "materials_bucket_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'materials'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "ai_documents_bucket_read" on storage.objects;
create policy "ai_documents_bucket_read"
on storage.objects for select
to authenticated
using (bucket_id = 'ai-documents');

drop policy if exists "ai_documents_bucket_write" on storage.objects;
create policy "ai_documents_bucket_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ai-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "ai_documents_bucket_update" on storage.objects;
create policy "ai_documents_bucket_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'ai-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'ai-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "ai_documents_bucket_delete" on storage.objects;
create policy "ai_documents_bucket_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ai-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create table if not exists ai_document_chunks (
  id bigint generated always as identity primary key,
  document_id bigint not null references ai_documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_estimate integer not null default 0,
  created_at timestamptz default now(),
  unique (document_id, chunk_index)
);

alter table ai_documents
  add column if not exists chunk_count integer default 0,
  add column if not exists ingestion_status text not null default 'idle' check (ingestion_status in ('idle', 'queued', 'processing', 'processed', 'failed')),
  add column if not exists last_ingested_at timestamptz;

alter table ai_document_chunks enable row level security;

drop policy if exists "ai_document_chunks_read_internal" on ai_document_chunks;
create policy "ai_document_chunks_read_internal"
on ai_document_chunks for select
to authenticated
using (
  exists (
    select 1 from ai_documents
    where ai_documents.id = ai_document_chunks.document_id
      and public.current_role() in ('teacher', 'aiadmin', 'developer')
  )
);

drop policy if exists "ai_document_chunks_write_internal" on ai_document_chunks;
create policy "ai_document_chunks_write_internal"
on ai_document_chunks for all
to authenticated
using (
  exists (
    select 1 from ai_documents
    where ai_documents.id = ai_document_chunks.document_id
      and public.current_role() in ('aiadmin', 'developer')
      and auth.uid() = ai_documents.owner_id
  )
)
with check (
  exists (
    select 1 from ai_documents
    where ai_documents.id = ai_document_chunks.document_id
      and public.current_role() in ('aiadmin', 'developer')
      and auth.uid() = ai_documents.owner_id
  )
);

drop policy if exists "ai_documents_read_internal" on ai_documents;
create policy "ai_documents_read_internal"
on ai_documents for select
to authenticated
using (
  public.current_role() in ('teacher', 'aiadmin', 'developer')
  or (
    ingestion_status = 'processed'
    and status = 'processed'
    and category = 'knowledge'
  )
);

drop policy if exists "ai_document_chunks_read_internal" on ai_document_chunks;
create policy "ai_document_chunks_read_internal"
on ai_document_chunks for select
to authenticated
using (
  exists (
    select 1 from ai_documents
    where ai_documents.id = ai_document_chunks.document_id
      and (
        public.current_role() in ('teacher', 'aiadmin', 'developer')
        or (
          ai_documents.ingestion_status = 'processed'
          and ai_documents.status = 'processed'
          and ai_documents.category = 'knowledge'
        )
      )
  )
);

create extension if not exists vector;

alter table ai_document_chunks
  add column if not exists embedding vector(1536);

create index if not exists ai_document_chunks_embedding_hnsw
on ai_document_chunks
using hnsw (embedding vector_cosine_ops);

create or replace function match_ai_document_chunks(
  query_embedding vector(1536),
  match_count int default 4,
  filter_category text default null
)
returns table (
  id bigint,
  document_id bigint,
  chunk_index integer,
  content text,
  token_estimate integer,
  similarity float,
  title text,
  category text
)
language sql
stable
set search_path = public
as $$
  select
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.token_estimate,
    1 - (c.embedding <=> query_embedding) as similarity,
    d.title,
    d.category
  from ai_document_chunks c
  join ai_documents d on d.id = c.document_id
  where c.embedding is not null
    and d.status = 'processed'
    and d.ingestion_status = 'processed'
    and (filter_category is null or d.category = filter_category)
  order by c.embedding <=> query_embedding
  limit match_count
$$;


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

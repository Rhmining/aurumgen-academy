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

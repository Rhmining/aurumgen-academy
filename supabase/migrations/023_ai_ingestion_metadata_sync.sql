-- Ensure ingestion metadata updates do not silently no-op under RLS.
-- This RPC runs as security definer but still enforces document ownership
-- or super-account access through auth context checks.

create or replace function public.set_ai_document_ingestion_state(
  target_document_id bigint,
  next_ingestion_status text,
  next_status text default null,
  next_chunk_count integer default null,
  next_last_ingested_at timestamptz default null
)
returns public.ai_documents
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.ai_documents;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.ai_documents
    where id = target_document_id
      and (
        public.is_super_account()
        or auth.uid() = owner_id
      )
  ) then
    raise exception 'Document access denied';
  end if;

  update public.ai_documents
  set
    ingestion_status = coalesce(next_ingestion_status, ingestion_status),
    status = coalesce(next_status, status),
    chunk_count = coalesce(next_chunk_count, chunk_count),
    last_ingested_at = coalesce(next_last_ingested_at, last_ingested_at)
  where id = target_document_id
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'Failed to update ai_documents metadata';
  end if;

  return updated_row;
end;
$$;

grant execute on function public.set_ai_document_ingestion_state(bigint, text, text, integer, timestamptz) to authenticated;

drop policy if exists "ai_documents_universal_access" on public.ai_documents;
drop policy if exists "ai_documents_super_access_user" on public.ai_documents;

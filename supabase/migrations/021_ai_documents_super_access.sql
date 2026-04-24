create or replace function public.is_super_account()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in ('dr.rachmat.hidayat@gmail.com')
$$;

drop policy if exists "ai_documents_read_internal" on ai_documents;
create policy "ai_documents_read_internal"
on ai_documents for select
to authenticated
using (
  public.is_super_account()
  or public.current_role() in ('teacher', 'aiadmin', 'developer')
  or (
    ingestion_status = 'processed'
    and status = 'processed'
    and category = 'knowledge'
  )
);

drop policy if exists "ai_documents_write_internal" on ai_documents;
create policy "ai_documents_write_internal"
on ai_documents for insert
to authenticated
with check (
  auth.uid() = owner_id
  and (
    public.is_super_account()
    or public.current_role() in ('aiadmin', 'developer')
  )
);

drop policy if exists "ai_documents_update_internal" on ai_documents;
create policy "ai_documents_update_internal"
on ai_documents for update
to authenticated
using (
  public.is_super_account()
  or (
    public.current_role() in ('aiadmin', 'developer')
    and auth.uid() = owner_id
  )
)
with check (
  public.is_super_account()
  or (
    public.current_role() in ('aiadmin', 'developer')
    and auth.uid() = owner_id
  )
);

drop policy if exists "ai_documents_delete_internal" on ai_documents;
create policy "ai_documents_delete_internal"
on ai_documents for delete
to authenticated
using (
  public.is_super_account()
  or (
    public.current_role() in ('aiadmin', 'developer')
    and auth.uid() = owner_id
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
        public.is_super_account()
        or public.current_role() in ('teacher', 'aiadmin', 'developer')
        or (
          ai_documents.ingestion_status = 'processed'
          and ai_documents.status = 'processed'
          and ai_documents.category = 'knowledge'
        )
      )
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
      and (
        public.is_super_account()
        or (
          public.current_role() in ('aiadmin', 'developer')
          and auth.uid() = ai_documents.owner_id
        )
      )
  )
)
with check (
  exists (
    select 1 from ai_documents
    where ai_documents.id = ai_document_chunks.document_id
      and (
        public.is_super_account()
        or (
          public.current_role() in ('aiadmin', 'developer')
          and auth.uid() = ai_documents.owner_id
        )
      )
  )
);

drop policy if exists "ai_documents_bucket_write" on storage.objects;
create policy "ai_documents_bucket_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ai-documents'
  and (
    public.is_super_account()
    or auth.uid()::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "ai_documents_bucket_update" on storage.objects;
create policy "ai_documents_bucket_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'ai-documents'
  and (
    public.is_super_account()
    or auth.uid()::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'ai-documents'
  and (
    public.is_super_account()
    or auth.uid()::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "ai_documents_bucket_delete" on storage.objects;
create policy "ai_documents_bucket_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ai-documents'
  and (
    public.is_super_account()
    or auth.uid()::text = (storage.foldername(name))[1]
  )
);

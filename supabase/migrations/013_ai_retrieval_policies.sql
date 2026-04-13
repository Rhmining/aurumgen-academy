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

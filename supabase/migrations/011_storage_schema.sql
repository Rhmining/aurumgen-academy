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

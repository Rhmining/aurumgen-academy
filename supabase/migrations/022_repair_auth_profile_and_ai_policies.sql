-- Repair migration for live projects that drifted and now surface
-- "permission denied for table users" during AI knowledge workflows.
--
-- Goal:
-- 1. Re-establish auth/profile helper functions without any dependency on users/auth.users
--    outside the signup trigger.
-- 2. Hard-reset the RLS policies used by profiles, ai_documents, ai_document_chunks,
--    operational_activity_logs, and ai-documents storage bucket.
-- 3. Keep super-account access based on JWT email only, not table joins.

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

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_super_account()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in ('dr.rachmat.hidayat@gmail.com')
$$;

alter table if exists public.profiles enable row level security;
alter table if exists public.ai_documents enable row level security;
alter table if exists public.ai_document_chunks enable row level security;
alter table if exists public.operational_activity_logs enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "ai_documents_read_internal" on public.ai_documents;
create policy "ai_documents_read_internal"
on public.ai_documents for select
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

drop policy if exists "ai_documents_write_internal" on public.ai_documents;
create policy "ai_documents_write_internal"
on public.ai_documents for insert
to authenticated
with check (
  auth.uid() = owner_id
  and (
    public.is_super_account()
    or public.current_role() in ('aiadmin', 'developer')
  )
);

drop policy if exists "ai_documents_update_internal" on public.ai_documents;
create policy "ai_documents_update_internal"
on public.ai_documents for update
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

drop policy if exists "ai_documents_delete_internal" on public.ai_documents;
create policy "ai_documents_delete_internal"
on public.ai_documents for delete
to authenticated
using (
  public.is_super_account()
  or (
    public.current_role() in ('aiadmin', 'developer')
    and auth.uid() = owner_id
  )
);

drop policy if exists "ai_document_chunks_read_internal" on public.ai_document_chunks;
create policy "ai_document_chunks_read_internal"
on public.ai_document_chunks for select
to authenticated
using (
  exists (
    select 1
    from public.ai_documents
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

drop policy if exists "ai_document_chunks_write_internal" on public.ai_document_chunks;
create policy "ai_document_chunks_write_internal"
on public.ai_document_chunks for all
to authenticated
using (
  exists (
    select 1
    from public.ai_documents
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
    select 1
    from public.ai_documents
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

drop policy if exists "operational_activity_logs_owner" on public.operational_activity_logs;
create policy "operational_activity_logs_owner"
on public.operational_activity_logs for all
to authenticated
using (actor_id = auth.uid())
with check (actor_id = auth.uid());

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

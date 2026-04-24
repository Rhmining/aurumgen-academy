-- Jalankan di Supabase SQL Editor pada project live yang error.
-- Tujuan:
-- 1. Mencari object database yang mereferensikan users/auth.users.
-- 2. Memeriksa privilege yang terkait auth.users dan object ai_documents.
-- 3. Menemukan policy/function/view yang kemungkinan memicu "permission denied for table users".

-- A. Cari view / materialized view yang menyebut users/auth.users
select
  schemaname,
  viewname,
  definition
from pg_views
where definition ilike '%auth.users%'
   or definition ilike '% users %'
order by schemaname, viewname;

-- B. Cari function yang body-nya menyebut users/auth.users
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_def
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where pg_get_functiondef(p.oid) ilike '%auth.users%'
   or pg_get_functiondef(p.oid) ilike '% users %'
order by 1, 2;

-- C. Cari policy yang ekspresinya menyebut users/auth.users
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where coalesce(qual, '') ilike '%auth.users%'
   or coalesce(with_check, '') ilike '%auth.users%'
   or coalesce(qual, '') ilike '% users %'
   or coalesce(with_check, '') ilike '% users %'
order by schemaname, tablename, policyname;

-- D. Lihat privilege untuk auth.users
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'auth'
  and table_name = 'users'
order by grantee, privilege_type;

-- E. Lihat privilege untuk tabel inti flow ai_documents
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where (table_schema, table_name) in (
  ('public', 'profiles'),
  ('public', 'ai_documents'),
  ('public', 'ai_document_chunks'),
  ('public', 'operational_activity_logs'),
  ('storage', 'objects')
)
order by table_schema, table_name, grantee, privilege_type;

-- F. Lihat policy aktif untuk tabel inti
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in ('profiles', 'ai_documents', 'ai_document_chunks', 'operational_activity_logs', 'objects')
order by schemaname, tablename, policyname;

-- G. Cek function trigger auth profile
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_def
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('handle_new_user', 'current_role', 'is_super_account');

-- H. Jika ingin cek apakah user saat ini bisa mengakses auth.users lewat SQL role aktif:
-- Jalankan manual saat perlu. Query ini memang bisa gagal dan justru mengonfirmasi masalah privilege.
-- select count(*) from auth.users;

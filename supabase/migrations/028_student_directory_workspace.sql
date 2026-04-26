alter table if exists public.profiles
  add column if not exists email text,
  add column if not exists pathway text default 'IGCSE',
  add column if not exists stage text default 'active',
  add column if not exists guardian_name text,
  add column if not exists guardian_email text,
  add column if not exists mentor_notes text,
  add column if not exists teacher_owner_id uuid references public.profiles(id) on delete set null;

alter table if exists public.profiles
  drop constraint if exists profiles_stage_check;

alter table if exists public.profiles
  add constraint profiles_stage_check
  check (stage in ('lead', 'active', 'paused', 'alumni'));

alter table if exists public.profiles enable row level security;

drop policy if exists "profiles_insert_student_teacher" on public.profiles;
create policy "profiles_insert_student_teacher"
on public.profiles for insert
to authenticated
with check (
  role = 'student'
  and teacher_owner_id = auth.uid()
  and public.current_role() in ('teacher', 'developer')
);

drop policy if exists "profiles_update_student_teacher" on public.profiles;
create policy "profiles_update_student_teacher"
on public.profiles for update
to authenticated
using (
  role = 'student'
  and teacher_owner_id = auth.uid()
  and public.current_role() in ('teacher', 'developer')
)
with check (
  role = 'student'
  and teacher_owner_id = auth.uid()
  and public.current_role() in ('teacher', 'developer')
);

drop policy if exists "profiles_delete_student_teacher" on public.profiles;
create policy "profiles_delete_student_teacher"
on public.profiles for delete
to authenticated
using (
  role = 'student'
  and teacher_owner_id = auth.uid()
  and public.current_role() in ('teacher', 'developer')
);

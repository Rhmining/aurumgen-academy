alter table if exists public.question_bank
  add column if not exists subject text default 'General',
  add column if not exists pathway text default 'IGCSE',
  add column if not exists exam_board text not null default 'IGCSE',
  add column if not exists answer_key text,
  add column if not exists tags text[] default '{}',
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

alter table if exists public.question_bank
  alter column tags set default '{}';

alter table if exists public.question_bank
  drop constraint if exists question_bank_difficulty_check,
  add constraint question_bank_difficulty_check check (difficulty in ('easy', 'medium', 'hard'));

alter table if exists public.question_bank enable row level security;

drop policy if exists "question_bank_read_authenticated" on public.question_bank;
create policy "question_bank_read_authenticated"
on public.question_bank for select
to authenticated
using (
  public.current_role() = 'developer'
  or auth.uid() = owner_id
);

drop policy if exists "question_bank_write_teacher" on public.question_bank;
create policy "question_bank_write_teacher"
on public.question_bank for insert
to authenticated
with check (
  public.current_role() in ('teacher', 'developer')
  and auth.uid() = owner_id
);

drop policy if exists "question_bank_update_teacher" on public.question_bank;
create policy "question_bank_update_teacher"
on public.question_bank for update
to authenticated
using (
  public.current_role() in ('teacher', 'developer')
  and auth.uid() = owner_id
)
with check (
  public.current_role() in ('teacher', 'developer')
  and auth.uid() = owner_id
);

drop policy if exists "question_bank_delete_teacher" on public.question_bank;
create policy "question_bank_delete_teacher"
on public.question_bank for delete
to authenticated
using (
  public.current_role() in ('teacher', 'developer')
  and auth.uid() = owner_id
);

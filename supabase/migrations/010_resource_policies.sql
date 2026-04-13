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

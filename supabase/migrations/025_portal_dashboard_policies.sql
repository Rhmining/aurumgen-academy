alter table if exists public.curriculum_items enable row level security;
alter table if exists public.progress_snapshots enable row level security;
alter table if exists public.profiles enable row level security;

drop policy if exists "curriculum_items_read_authenticated" on public.curriculum_items;
create policy "curriculum_items_read_authenticated"
on public.curriculum_items for select
to authenticated
using (true);

drop policy if exists "curriculum_items_write_internal" on public.curriculum_items;
create policy "curriculum_items_write_internal"
on public.curriculum_items for insert
to authenticated
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "curriculum_items_update_internal" on public.curriculum_items;
create policy "curriculum_items_update_internal"
on public.curriculum_items for update
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id)
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "curriculum_items_delete_internal" on public.curriculum_items;
create policy "curriculum_items_delete_internal"
on public.curriculum_items for delete
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "progress_snapshots_read_by_scope" on public.progress_snapshots;
create policy "progress_snapshots_read_by_scope"
on public.progress_snapshots for select
to authenticated
using (
  profile_id = auth.uid()
  or public.current_role() in ('teacher', 'developer')
);

drop policy if exists "progress_snapshots_write_internal" on public.progress_snapshots;
create policy "progress_snapshots_write_internal"
on public.progress_snapshots for insert
to authenticated
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "progress_snapshots_update_internal" on public.progress_snapshots;
create policy "progress_snapshots_update_internal"
on public.progress_snapshots for update
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id)
with check (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "progress_snapshots_delete_internal" on public.progress_snapshots;
create policy "progress_snapshots_delete_internal"
on public.progress_snapshots for delete
to authenticated
using (public.current_role() in ('teacher', 'developer') and auth.uid() = owner_id);

drop policy if exists "profiles_select_internal_readonly" on public.profiles;
create policy "profiles_select_internal_readonly"
on public.profiles for select
to authenticated
using (
  auth.uid() = id
  or public.current_role() in ('teacher', 'aiadmin', 'developer')
);

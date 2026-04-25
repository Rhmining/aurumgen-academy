alter table if exists public.progress_snapshots
  add column if not exists subject text default 'General',
  add column if not exists notes text;

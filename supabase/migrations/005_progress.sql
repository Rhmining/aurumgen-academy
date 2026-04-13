create table if not exists progress_snapshots (
  id bigint generated always as identity primary key,
  profile_id uuid not null,
  score numeric,
  created_at timestamptz default now()
);

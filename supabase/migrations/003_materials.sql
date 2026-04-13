create table if not exists materials (
  id bigint generated always as identity primary key,
  title text not null,
  subject text not null,
  storage_path text,
  created_at timestamptz default now()
);

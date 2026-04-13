create table if not exists curriculum_items (
  id bigint generated always as identity primary key,
  title text not null,
  pathway text not null,
  subject text not null,
  created_at timestamptz default now()
);

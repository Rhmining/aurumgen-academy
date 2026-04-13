create table if not exists ai_documents (
  id bigint generated always as identity primary key,
  title text not null,
  status text not null,
  created_at timestamptz default now()
);

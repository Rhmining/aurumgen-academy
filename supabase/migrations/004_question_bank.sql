create table if not exists question_bank (
  id bigint generated always as identity primary key,
  prompt text not null,
  difficulty text not null,
  created_at timestamptz default now()
);

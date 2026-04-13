create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  role text not null check (role in ('student', 'parent', 'teacher', 'aiadmin', 'developer')),
  created_at timestamptz default now()
);

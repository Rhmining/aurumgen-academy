alter table materials
  add column if not exists pathway text default 'IGCSE',
  add column if not exists description text,
  add column if not exists visibility text not null default 'private' check (visibility in ('private', 'portal', 'published')),
  add column if not exists owner_id uuid references profiles(id) on delete cascade;

alter table question_bank
  add column if not exists subject text default 'General',
  add column if not exists pathway text default 'IGCSE',
  add column if not exists exam_board text not null default 'IGCSE',
  add column if not exists answer_key text,
  add column if not exists tags text[] default '{}',
  add column if not exists owner_id uuid references profiles(id) on delete cascade,
  drop constraint if exists question_bank_difficulty_check,
  add constraint question_bank_difficulty_check check (difficulty in ('easy', 'medium', 'hard'));

alter table ai_documents
  add column if not exists category text not null default 'knowledge',
  add column if not exists source_type text not null default 'manual',
  add column if not exists content text not null default '',
  add column if not exists owner_id uuid references profiles(id) on delete cascade,
  drop constraint if exists ai_documents_status_check,
  add constraint ai_documents_status_check check (status in ('draft', 'queued', 'processed', 'published'));

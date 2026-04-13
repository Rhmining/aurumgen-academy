alter table ai_documents
  add column if not exists extraction_status text not null default 'manual_content' check (extraction_status in ('parser_succeeded', 'parser_failed', 'manual_content')),
  add column if not exists extraction_method text,
  add column if not exists extraction_note text;

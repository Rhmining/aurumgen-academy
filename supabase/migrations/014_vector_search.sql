create extension if not exists vector;

alter table ai_document_chunks
  add column if not exists embedding vector(1536);

create index if not exists ai_document_chunks_embedding_hnsw
on ai_document_chunks
using hnsw (embedding vector_cosine_ops);

create or replace function match_ai_document_chunks(
  query_embedding vector(1536),
  match_count int default 4,
  filter_category text default null
)
returns table (
  id bigint,
  document_id bigint,
  chunk_index integer,
  content text,
  token_estimate integer,
  similarity float,
  title text,
  category text
)
language sql
stable
set search_path = public
as $$
  select
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.token_estimate,
    1 - (c.embedding <=> query_embedding) as similarity,
    d.title,
    d.category
  from ai_document_chunks c
  join ai_documents d on d.id = c.document_id
  where c.embedding is not null
    and d.status = 'processed'
    and d.ingestion_status = 'processed'
    and (filter_category is null or d.category = filter_category)
  order by c.embedding <=> query_embedding
  limit match_count
$$;

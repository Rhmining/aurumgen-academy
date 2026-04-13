alter table airum_evaluations
  add column if not exists evaluator_mode text not null default 'heuristic' check (evaluator_mode in ('heuristic', 'llm')),
  add column if not exists evaluator_model text,
  add column if not exists notes text;

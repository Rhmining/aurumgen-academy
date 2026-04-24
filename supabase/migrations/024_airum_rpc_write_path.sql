drop function if exists public.create_airum_session(uuid, text, text);
create or replace function public.create_airum_session(
  p_owner_id uuid,
  p_role text,
  p_title text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
begin
  if v_user_id is null then
    raise exception 'Silakan login terlebih dahulu.' using errcode = '42501';
  end if;

  if p_owner_id is distinct from v_user_id then
    raise exception 'Owner AIRUM tidak cocok dengan user aktif.' using errcode = '42501';
  end if;

  if p_role not in ('student', 'parent', 'teacher', 'aiadmin', 'developer') then
    raise exception 'Role AIRUM tidak valid.' using errcode = '22023';
  end if;

  insert into public.airum_sessions (owner_id, role, title)
  values (
    p_owner_id,
    p_role,
    coalesce(nullif(trim(p_title), ''), 'Percakapan Baru')
  )
  returning id into v_session_id;

  return v_session_id;
end;
$function$;

grant execute on function public.create_airum_session(uuid, text, text) to authenticated;

drop function if exists public.record_airum_turn(uuid, text, text, text, text, jsonb, jsonb);
create or replace function public.record_airum_turn(
  p_session_id uuid,
  p_role text,
  p_title text,
  p_user_message text,
  p_assistant_message text,
  p_citations jsonb default '[]'::jsonb,
  p_evaluation jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id uuid := auth.uid();
  v_owner_id uuid;
  v_user_message_id uuid;
  v_assistant_message_id uuid;
  v_flags text[] := '{}'::text[];
begin
  if v_user_id is null then
    raise exception 'Silakan login terlebih dahulu.' using errcode = '42501';
  end if;

  select owner_id
  into v_owner_id
  from public.airum_sessions
  where id = p_session_id;

  if v_owner_id is null then
    raise exception 'Session AIRUM tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_owner_id is distinct from v_user_id then
    raise exception 'Session AIRUM bukan milik user aktif.' using errcode = '42501';
  end if;

  if p_role not in ('student', 'parent', 'teacher', 'aiadmin', 'developer') then
    raise exception 'Role AIRUM tidak valid.' using errcode = '22023';
  end if;

  insert into public.airum_messages (session_id, role, content)
  values (p_session_id, 'user', coalesce(p_user_message, ''))
  returning id into v_user_message_id;

  insert into public.airum_messages (session_id, role, content)
  values (p_session_id, 'assistant', coalesce(p_assistant_message, ''))
  returning id into v_assistant_message_id;

  if jsonb_typeof(coalesce(p_citations, '[]'::jsonb)) = 'array'
     and jsonb_array_length(coalesce(p_citations, '[]'::jsonb)) > 0 then
    insert into public.airum_citations (
      message_id,
      document_id,
      chunk_index,
      title,
      category,
      similarity,
      retrieval_method,
      snippet
    )
    select
      v_assistant_message_id,
      (source ->> 'documentId')::bigint,
      (source ->> 'chunkIndex')::integer,
      coalesce(source ->> 'title', 'Dokumen'),
      coalesce(source ->> 'category', 'knowledge'),
      case
        when nullif(source ->> 'similarity', '') is null then null
        else (source ->> 'similarity')::numeric
      end,
      nullif(source ->> 'retrievalMethod', ''),
      nullif(source ->> 'snippet', '')
    from jsonb_array_elements(p_citations) as source;
  end if;

  if jsonb_typeof(coalesce(p_evaluation -> 'flags', '[]'::jsonb)) = 'array' then
    select coalesce(array_agg(flag), '{}'::text[])
    into v_flags
    from jsonb_array_elements_text(coalesce(p_evaluation -> 'flags', '[]'::jsonb)) as flag;
  end if;

  insert into public.airum_evaluations (
    message_id,
    retrieval_score,
    answer_score,
    source_count,
    avg_similarity,
    flags,
    evaluator_mode,
    evaluator_model,
    notes
  )
  values (
    v_assistant_message_id,
    case
      when nullif(p_evaluation ->> 'retrievalScore', '') is null then null
      else (p_evaluation ->> 'retrievalScore')::numeric
    end,
    case
      when nullif(p_evaluation ->> 'answerScore', '') is null then null
      else (p_evaluation ->> 'answerScore')::numeric
    end,
    coalesce((p_evaluation ->> 'sourceCount')::integer, 0),
    case
      when nullif(p_evaluation ->> 'avgSimilarity', '') is null then null
      else (p_evaluation ->> 'avgSimilarity')::numeric
    end,
    v_flags,
    nullif(p_evaluation ->> 'evaluatorMode', ''),
    nullif(p_evaluation ->> 'evaluatorModel', ''),
    nullif(p_evaluation ->> 'notes', '')
  )
  on conflict (message_id) do update
  set
    retrieval_score = excluded.retrieval_score,
    answer_score = excluded.answer_score,
    source_count = excluded.source_count,
    avg_similarity = excluded.avg_similarity,
    flags = excluded.flags,
    evaluator_mode = excluded.evaluator_mode,
    evaluator_model = excluded.evaluator_model,
    notes = excluded.notes;

  update public.airum_sessions
  set
    title = coalesce(nullif(trim(p_title), ''), title),
    role = p_role
  where id = p_session_id;

  return jsonb_build_object(
    'user_message_id', v_user_message_id,
    'assistant_message_id', v_assistant_message_id
  );
end;
$function$;

grant execute on function public.record_airum_turn(uuid, text, text, text, text, jsonb, jsonb) to authenticated;

export type UserRole = "student" | "parent" | "teacher" | "aiadmin" | "developer";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ProfileRecord = {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export type MaterialRecord = {
  id: number;
  title: string;
  subject: string;
  pathway: string;
  description: string | null;
  visibility: "private" | "portal" | "published";
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  owner_id: string;
  created_at: string;
};

export type CurriculumItemRecord = {
  id: number;
  title: string;
  pathway: string;
  subject: string;
  owner_id?: string | null;
  created_at: string;
};

export type ProgressSnapshotRecord = {
  id: number;
  profile_id: string;
  score: number | null;
  subject?: string | null;
  notes?: string | null;
  owner_id?: string | null;
  created_at: string;
};

export type QuestionBankRecord = {
  id: number;
  subject: string;
  pathway: string;
  difficulty: "easy" | "medium" | "hard";
  exam_board: string;
  prompt: string;
  answer_key: string | null;
  tags: string[] | null;
  owner_id: string;
  created_at: string;
};

export type AiDocumentRecord = {
  id: number;
  title: string;
  category: string;
  source_type: string;
  content: string;
  status: "draft" | "queued" | "processed" | "published";
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  extraction_status?: "parser_succeeded" | "parser_failed" | "manual_content";
  extraction_method?: string | null;
  extraction_note?: string | null;
  chunk_count?: number | null;
  ingestion_status?: "idle" | "queued" | "processing" | "processed" | "failed" | null;
  last_ingested_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  owner_id: string;
  created_at: string;
};

export type AirumSessionRecord = {
  id: string;
  title: string;
  role: UserRole;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type AirumMessageRecord = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type AirumCitationRecord = {
  id: number;
  message_id: string;
  document_id: number;
  chunk_index: number;
  title: string;
  category: string;
  similarity: number | null;
  retrieval_method: string | null;
  snippet: string | null;
  created_at: string;
};


export type AirumEvaluationRecord = {
  id: number;
  message_id: string;
  retrieval_score: number | null;
  answer_score: number | null;
  source_count: number;
  avg_similarity: number | null;
  flags: string[] | null;
  evaluator_mode?: "heuristic" | "llm";
  evaluator_model?: string | null;
  notes?: string | null;
  created_at: string;
};

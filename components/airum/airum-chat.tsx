"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/lib/db/types";
import { readJsonResponse } from "@/lib/api/read-json-response";

type KnowledgeSource = {
  documentId: number;
  chunkIndex: number;
  title: string;
  category: string;
  similarity?: number;
  retrievalMethod?: "vector" | "keyword" | "hybrid";
  snippet?: string;
};

type ChatEntry = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: KnowledgeSource[];
};

type ChatSession = {
  id: string;
  title: string;
  updated_at: string;
};

type SessionPayload = {
  items?: ChatSession[];
  messages?: { id: string; role: "user" | "assistant"; content: string }[];
  citations?: Array<{
    message_id: string;
    document_id: number;
    chunk_index: number;
    title: string;
    category: string;
    similarity?: number | null;
    retrieval_method?: "vector" | "keyword" | "hybrid" | null;
    snippet?: string | null;
  }>;
  sessionId?: string;
  assistantMessageId?: string;
  outputText?: string;
  sources?: KnowledgeSource[];
};

const starterMessages: Record<UserRole, string> = {
  student: "Halo, saya siap membantu belajar hari ini.",
  parent: "Halo, saya bisa bantu merangkum progres dan rekomendasi belajar.",
  teacher: "Halo, saya siap bantu merancang materi, soal, atau intervensi kelas.",
  aiadmin: "Halo, saya bisa bantu evaluasi kualitas knowledge base dan prompt.",
  developer: "Halo, saya siap bantu debug alur AI-RUM dan observability."
};

function buildStarter(role: UserRole): ChatEntry[] {
  return [{ role: "assistant", content: starterMessages[role], sources: [] }];
}

export function AirumChat({ role }: { role: UserRole }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatEntry[]>(buildStarter(role));
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRealConversation = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages]
  );

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter((session) => session.title.toLowerCase().includes(query));
  }, [search, sessions]);

  async function loadSessions() {
    try {
      const response = await fetch("/api/ai-rum/sessions", { cache: "no-store" });
      const payload = (await readJsonResponse(response)) as SessionPayload;

      const items = Array.isArray(payload.items) ? payload.items : [];
      setSessions(items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat session.");
    }
  }

  async function loadSession(sessionId: string) {
    setIsLoadingSession(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-rum/sessions/${sessionId}`, { cache: "no-store" });
      const payload = (await readJsonResponse(response)) as SessionPayload;

      const citationsByMessage = new Map<string, KnowledgeSource[]>();
      for (const citation of Array.isArray(payload.citations) ? payload.citations : []) {
        const bucket = citationsByMessage.get(citation.message_id) ?? [];
        bucket.push({
          documentId: citation.document_id,
          chunkIndex: citation.chunk_index,
          title: citation.title,
          category: citation.category,
          similarity: citation.similarity ?? undefined,
          retrievalMethod: citation.retrieval_method ?? undefined,
          snippet: citation.snippet ?? undefined
        });
        citationsByMessage.set(citation.message_id, bucket);
      }

      const nextMessages = (Array.isArray(payload.messages) ? payload.messages : []).map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        sources: citationsByMessage.get(message.id) ?? []
      }));

      setActiveSessionId(sessionId);
      setMessages(nextMessages.length > 0 ? nextMessages : buildStarter(role));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat session.");
    } finally {
      setIsLoadingSession(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function handleNewChat() {
    setActiveSessionId(null);
    setMessages(buildStarter(role));
    setError(null);
  }

  async function handleRenameSession(sessionId: string, currentTitle: string) {
    const nextTitle = window.prompt("Ubah judul session", currentTitle)?.trim();
    if (!nextTitle || nextTitle === currentTitle) return;

    const response = await fetch(`/api/ai-rum/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle })
    });
    await readJsonResponse(response);
    await loadSessions();
  }

  async function handleDeleteSession(sessionId: string) {
    const confirmed = window.confirm("Hapus session ini?");
    if (!confirmed) return;

    const response = await fetch(`/api/ai-rum/sessions/${sessionId}`, {
      method: "DELETE"
    });
    await readJsonResponse(response);

    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages(buildStarter(role));
    }

    await loadSessions();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const optimisticMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(optimisticMessages);
    setInput("");
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-rum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          sessionId: activeSessionId,
          messages: optimisticMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      const payload = (await readJsonResponse(response)) as SessionPayload;

      const nextSessionId = typeof payload.sessionId === "string" ? payload.sessionId : activeSessionId;
      setActiveSessionId(nextSessionId ?? null);
      setMessages((current) => [
        ...current,
        {
          id: typeof payload.assistantMessageId === "string" ? payload.assistantMessageId : undefined,
          role: "assistant",
          content: typeof payload.outputText === "string" ? payload.outputText : "Belum ada jawaban.",
          sources: Array.isArray(payload.sources) ? payload.sources : []
        }
      ]);
      await loadSessions();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Permintaan ke AI-RUM gagal.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="surface rounded-[2rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Riwayat Chat</p>
            <p className="mt-1 text-xs text-[rgb(var(--muted))]">Simpan dan buka ulang percakapan AI-RUM.</p>
          </div>
          <button
            type="button"
            onClick={() => void handleNewChat()}
            className="rounded-full border border-black/10 px-3 py-2 text-sm"
          >
            Baru
          </button>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari session..."
          className="mt-4 w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3 text-sm"
        />

        <div className="mt-4 space-y-2">
          {!hasRealConversation && !activeSessionId ? (
            <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">
              Percakapan baru siap dimulai.
            </div>
          ) : null}
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                activeSessionId === session.id
                  ? "border-ink bg-black/5 dark:bg-white/5"
                  : "border-black/10 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => void loadSession(session.id)}
                className="w-full text-left"
              >
                <div className="font-medium">{session.title}</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">{new Date(session.updated_at).toLocaleString("id-ID")}</div>
              </button>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleRenameSession(session.id, session.title)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteSession(session.id)}
                  className="rounded-full border border-coral/30 px-3 py-1.5 text-xs text-coral"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="surface rounded-[2rem] p-5">
        <div className="space-y-3">
          {isLoadingSession ? (
            <div className="rounded-3xl bg-black/5 px-4 py-3 text-sm dark:bg-white/5">Memuat session...</div>
          ) : null}
          {messages.map((message, index) => (
            <div key={`${message.id ?? message.role}-${index}`}>
              <div
                className={`rounded-3xl px-4 py-3 text-sm ${
                  message.role === "assistant"
                    ? "bg-black/5 dark:bg-white/5"
                    : "ml-auto max-w-[85%] bg-ink text-white"
                }`}
              >
                {message.content}
              </div>
              {message.role === "assistant" && (message.sources?.length ?? 0) > 0 ? (
                <div className="mt-2 space-y-2">
                  {message.sources?.map((source) => (
                    <a
                      key={`${source.documentId}-${source.chunkIndex}`}
                      href={`/ai-knowledge/documents/${source.documentId}#chunk-${source.chunkIndex}`}
                      className="block rounded-2xl border border-black/10 px-3 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      {source.title} • chunk {source.chunkIndex}
                      {typeof source.similarity === "number"
                        ? ` • score ${source.similarity.toFixed(2)}`
                        : ""}
                      {source.retrievalMethod ? ` • ${source.retrievalMethod}` : ""}
                      {source.snippet ? (
                        <span className="mt-1 block text-xs text-[rgb(var(--muted))]">
                          {source.snippet}
                        </span>
                      ) : null}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={4}
            placeholder="Tulis pertanyaan Anda untuk AI-RUM..."
            className="w-full rounded-3xl border border-black/10 bg-transparent px-4 py-3"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="self-end rounded-full bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Mengirim..." : "Kirim ke AI-RUM"}
          </button>
        </form>

        {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
      </div>
    </section>
  );
}

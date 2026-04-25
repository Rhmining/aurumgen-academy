"use client";

import { TeacherShell } from "@/components/teacher/teacher-shell";
import { ResourceManager } from "@/components/data/resource-manager";
import type { QuestionBankRecord } from "@/lib/db/types";
import { readJsonResponse } from "@/lib/api/read-json-response";

export default function TeacherQuestionBankPage() {
  return (
    <TeacherShell title="Question Bank" description="Bangun bank soal berdasarkan topik, level, dan exam board.">
      <ResourceManager<QuestionBankRecord>
        endpoint="/api/question-bank"
        title="Question authoring"
        description="CRUD awal untuk bank soal aktif dengan metadata subject, pathway, difficulty, dan answer key."
        emptyState="Belum ada soal. Tambahkan prompt pertama dari panel kiri."
        fields={[
          { name: "subject", label: "Subject", placeholder: "Mathematics" },
          { name: "pathway", label: "Pathway", placeholder: "IB" },
          { name: "difficulty", label: "Difficulty", placeholder: "easy / medium / hard" },
          { name: "exam_board", label: "Exam board", placeholder: "IB / IGCSE" },
          { name: "tags", label: "Tags", placeholder: "algebra, functions, hl" },
          { name: "prompt", label: "Question prompt", type: "textarea", placeholder: "Tulis soal di sini" },
          { name: "answer_key", label: "Answer key", type: "textarea", placeholder: "Pembahasan atau jawaban model" }
        ]}
        renderSummary={(item) => ({
          title: `${item.subject} • ${item.difficulty}`,
          detail: `${item.pathway} • ${item.exam_board} • ${
            item.answer_key?.trim() ? "Answer key siap" : "Perlu answer key"
          }${item.tags?.length ? ` • Tags: ${item.tags.join(", ")}` : ""} • ${item.prompt.slice(0, 110)}`
        })}
        renderItemActions={({ item, refresh, setStatus }) => (
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/question-bank/${item.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ difficulty })
                    });
                    await readJsonResponse(response);
                    setStatus(`Difficulty soal diubah ke ${difficulty}.`);
                    await refresh();
                  } catch (error) {
                    setStatus(error instanceof Error ? error.message : "Gagal mengubah difficulty.");
                  }
                }}
                className="rounded-full border border-black/10 px-4 py-2 text-sm"
              >
                {difficulty}
              </button>
            ))}
          </div>
        )}
      />
    </TeacherShell>
  );
}

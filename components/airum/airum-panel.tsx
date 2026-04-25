 "use client";

import { useState } from "react";
import { airumModes } from "@/lib/airum/modes";
import { quickPrompts } from "@/lib/airum/quick-prompts";
import { AirumChat } from "@/components/airum/airum-chat";
import type { UserRole } from "@/lib/db/types";

export function AirumPanel({ role = "student" }: { role?: UserRole }) {
  const [draftPrompt, setDraftPrompt] = useState("");

  return (
    <section className="space-y-6">
      <div className="surface rounded-[2rem] p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <p className="eyebrow">AI-RUM</p>
            <h2 className="mt-4 font-display text-3xl">Pendamping belajar digital yang siap dipersonalisasi</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {airumModes.map((mode) => (
                <article key={mode.title} className="rounded-3xl border border-black/5 p-4 dark:border-white/10">
                  <h3 className="font-semibold">{mode.title}</h3>
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">{mode.description}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="w-full rounded-[1.75rem] border border-black/5 p-5 lg:max-w-sm dark:border-white/10">
            <p className="text-sm font-semibold">Quick prompts</p>
            <div className="mt-4 space-y-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraftPrompt(prompt)}
                  className="block w-full rounded-2xl bg-black/5 px-4 py-3 text-left text-sm transition hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AirumChat role={role} draftPrompt={draftPrompt} />
    </section>
  );
}

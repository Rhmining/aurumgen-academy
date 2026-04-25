"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { readJsonResponse } from "@/lib/api/read-json-response";

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};

type ResourceManagerProps<T extends Record<string, unknown>> = {
  endpoint: string;
  title: string;
  description: string;
  fields: FieldConfig[];
  emptyState: string;
  renderSummary: (item: T) => { title: string; detail: string };
  initialForm?: Record<string, string>;
  renderFormExtras?: (helpers: {
    form: Record<string, string>;
    setField: (name: string, value: string) => void;
  }) => ReactNode;
  renderItemActions?: (helpers: {
    item: T;
    refresh: () => Promise<void>;
    setStatus: (message: string | null) => void;
  }) => ReactNode;
};

export function ResourceManager<T extends Record<string, unknown>>({
  endpoint,
  title,
  description,
  fields,
  emptyState,
  renderSummary,
  initialForm,
  renderFormExtras,
  renderItemActions
}: ResourceManagerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [form, setForm] = useState<Record<string, string>>(initialForm ?? {});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = await readJsonResponse(response);
      setItems(Array.isArray(payload.items) ? (payload.items as T[]) : []);
    } catch (loadError) {
      setStatus(loadError instanceof Error ? loadError.message : "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [endpoint]);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const method = editingId ? "PATCH" : "POST";
    const target = editingId ? `${endpoint}/${editingId}` : endpoint;

    try {
      const response = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      await readJsonResponse(response);

      setForm(initialForm ?? {});
      setEditingId(null);
      setStatus("Perubahan berhasil disimpan.");
      await loadItems();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Penyimpanan gagal.");
    }
  }

  async function handleDelete(id: number) {
    setStatus(null);
    try {
      const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      await readJsonResponse(response);

      await loadItems();
      setStatus("Data berhasil dihapus.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal menghapus data.");
    }
  }

  function handleEdit(item: T) {
    setEditingId(Number(item.id));
    const nextForm = Object.entries(item).reduce<Record<string, string>>(
      (accumulator, [key, value]) => {
        if (typeof value === "string" || typeof value === "number") {
          accumulator[key] = String(value);
        } else if (Array.isArray(value)) {
          accumulator[key] = value.join(", ");
        } else if (value == null) {
          accumulator[key] = "";
        }

        return accumulator;
      },
      { ...(initialForm ?? {}) }
    );
    setForm(nextForm);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="surface rounded-[2rem] p-6">
        <h2 className="font-display text-3xl">{title}</h2>
        <p className="mt-3 text-sm text-[rgb(var(--muted))]">{description}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className="mb-2 block text-sm font-medium">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  rows={4}
                  value={form[field.name] ?? ""}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
                  placeholder={field.placeholder}
                />
              ) : field.type === "select" ? (
                <select
                  value={form[field.name] ?? ""}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
                >
                  <option value="">Pilih...</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form[field.name] ?? ""}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3"
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}

          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
              {editingId ? "Update" : "Tambah"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm ?? {});
                }}
                className="rounded-full border border-black/10 px-5 py-3 text-sm"
              >
                Batal edit
              </button>
            ) : null}
          </div>

          {renderFormExtras
            ? renderFormExtras({
                form,
                setField: updateField
              })
            : null}
        </form>

        {status ? <p className="mt-4 text-sm text-coral">{status}</p> : null}
      </section>

      <section className="space-y-4">
        {loading ? (
          <article className="surface rounded-[2rem] p-6 text-sm text-[rgb(var(--muted))]">Memuat data...</article>
        ) : items.length === 0 ? (
          <article className="surface rounded-[2rem] p-6 text-sm text-[rgb(var(--muted))]">{emptyState}</article>
        ) : (
          items.map((item) => {
            const summary = renderSummary(item);
            return (
              <article key={String(item.id)} className="surface rounded-[2rem] p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold">{summary.title}</h3>
                    <p className="mt-2 text-sm text-[rgb(var(--muted))]">{summary.detail}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-full border border-black/10 px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(Number(item.id))}
                      className="rounded-full border border-coral/30 px-4 py-2 text-sm text-coral"
                    >
                      Hapus
                    </button>
                    {renderItemActions
                      ? renderItemActions({
                          item,
                          refresh: loadItems,
                          setStatus
                        })
                      : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

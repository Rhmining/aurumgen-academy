"use client";

import Link from "next/link";

export function DocumentDetailLink({ documentId }: { documentId: number }) {
  return (
    <Link
      href={`/ai-knowledge/documents/${documentId}`}
      className="rounded-full border border-black/10 px-4 py-2 text-sm"
    >
      Detail
    </Link>
  );
}

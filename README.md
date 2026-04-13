# AURUMGEN Academy

Platform academy multi-role berbasis **Next.js 15 + React 19 + TypeScript + Tailwind + Supabase + OpenAI** untuk kebutuhan public site, student/parent portal, teacher workspace, knowledge ingestion, dan AI-RUM assistant internal.

## Modul utama

- Public pages: `/`, `/programs`, `/pathway`, `/login`
- Portal: `/portal/student`, `/portal/parent`, `/portal/materials`, `/portal/curriculum`, `/portal/progress`
- Teacher workspace: `/teacher`, `/teacher/materials`, `/teacher/question-bank`, `/teacher/curriculum`, `/teacher/students`, `/teacher/airum-test`
- AI knowledge hub: `/ai-knowledge`, `/ai-knowledge/documents`, `/ai-knowledge/sources`, `/ai-knowledge/ingestion`, `/ai-knowledge/pipeline`, `/ai-knowledge/prompts`
- Developer console: `/developer`, `/developer/logs`, `/developer/models`, `/developer/costs`, `/developer/api-playground`, `/developer/pipeline`

## Kapabilitas inti

- Auth multi-role berbasis Supabase Auth + profile/role guards
- CRUD materials, question bank, dan AI documents
- Upload file ke Supabase Storage dengan text extraction untuk PDF/DOCX/TXT
- Knowledge ingestion: chunking, embeddings, retrieval, review queue, chunk editor
- AI-RUM chat dengan Responses API, session history, retrieval analytics, dan evaluator kualitas
- Operational activity logs untuk aksi sensitif utama di knowledge/content workflows

## Menjalankan proyek

1. Install dependency

```bash
npm install
```

2. Siapkan environment

```bash
cp .env.local.example .env.local
```

Isi minimal:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `OPENAI_RESPONSES_MODEL`
- `OPENAI_EVALUATOR_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `NEXT_PUBLIC_SITE_URL`

3. Jalankan development server

```bash
npm run dev
```

4. Validasi lokal sebelum deploy

```bash
npm run typecheck
npm run build
```

## Setup backend

Panduan setup Supabase dan strategi parser:

- [docs/SUPABASE_SETUP.md](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/docs/SUPABASE_SETUP.md)
- [docs/VERCEL_DEPLOY.md](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/docs/VERCEL_DEPLOY.md)
- [docs/PARSER_STRATEGY.md](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/docs/PARSER_STRATEGY.md)

Pastikan migration terbaru sampai `020_operational_activity_logs.sql` sudah dijalankan.

## Kesiapan tayang

Repo ini sudah siap untuk internal production MVP, tetapi go-live penuh tetap bergantung pada environment nyata:

- Env production harus lengkap dan valid
- Supabase migration dan storage bucket harus sinkron
- Smoke test end-to-end perlu dijalankan untuk login, upload, extraction, ingestion, AI-RUM, review queue, dan audit logs
- Monitoring eksternal, alerting, serta strategi OCR scanned PDF masih menjadi pekerjaan lanjutan

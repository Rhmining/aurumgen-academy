# Deploy AURUMGEN Academy ke Vercel

Panduan ini membawa repo **AURUMGEN Academy** dari kondisi lokal ke deployment Vercel yang siap diuji live.

## 1. Prasyarat

Sebelum deploy, siapkan:

- akun Vercel
- project Supabase yang sudah aktif
- domain utama yang akan dipakai, misalnya `academy.aurumgen.com` atau `aurumgenacademy.com`
- repo Git yang berisi proyek ini

## 2. Pastikan verifikasi lokal sudah lolos

Jalankan dari root project:

```bash
npm install
npm run preflight:vercel
npm run typecheck
npm run build
```

Build lokal terakhir di repo ini sudah lolos. Config `outputFileTracingRoot` juga sudah ditambahkan agar trace build Vercel mengikuti root project dengan benar.

## 3. Push repo ke Git provider

Jika belum:

1. Buat repository di GitHub, GitLab, atau Bitbucket.
2. Push isi project ini ke branch utama Anda.

Vercel paling mudah dihubungkan lewat import dari Git provider.

## 4. Import project ke Vercel

Di dashboard Vercel:

1. Klik `Add New...`
2. Pilih `Project`
3. Import repository AURUMGEN Academy
4. Framework seharusnya otomatis terdeteksi sebagai `Next.js`
5. Biarkan build command default: `next build`

Vercel mendokumentasikan deployment Next.js sebagai alur default untuk project Next.js. Sumber: [Vercel Next.js](https://vercel.com/docs/frameworks/nextjs)

## 5. Isi Environment Variables di Vercel

Tambahkan environment variables berikut minimal untuk **Production**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `OPENAI_RESPONSES_MODEL`
- `OPENAI_EVALUATOR_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `NEXT_PUBLIC_SITE_URL`

Nilai yang disarankan:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_RESPONSES_MODEL=gpt-5
OPENAI_EVALUATOR_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

Untuk environment:

- `Production`: isi nilai domain live
- `Preview`: boleh isi domain preview atau domain staging jika punya
- `Development`: opsional, jika ingin sinkron dengan `vercel env pull`

Vercel memisahkan env berdasarkan `Production`, `Preview`, dan `Development`. Sumber: [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

## 6. Deploy pertama

Setelah env diisi:

1. Jalankan deploy pertama dari dashboard Vercel
2. Tunggu build selesai
3. Buka domain `.vercel.app` yang diberikan
4. Pastikan homepage dan `/login` terbuka normal

## 7. Konfigurasi Supabase Auth untuk Vercel

Di Supabase, buka:

`Authentication > URL Configuration`

Atur:

- `Site URL` = domain production Anda
- `Redirect URLs` tambahkan:
  - `http://localhost:3000/**`
  - `https://your-production-domain.com/**`
  - `https://*.vercel.app/**` jika ingin cepat mengizinkan preview
  - atau lebih ketat: `https://*-your-team-slug.vercel.app/**`

Supabase mendokumentasikan bahwa untuk Vercel, `Site URL` sebaiknya diarahkan ke domain resmi production dan preview URLs ditambahkan ke daftar redirect terpisah. Sumber: [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

Karena AURUMGEN memakai callback di:

```txt
/api/auth/callback
```

maka URL callback production nyatanya menjadi:

```txt
https://your-production-domain.com/api/auth/callback
```

Untuk preview deployment Vercel, callback akan mengikuti domain preview tersebut.

## 8. Jalankan migration Supabase production

Sebelum traffic live, pastikan seluruh migration di folder [supabase/migrations](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations) sudah dijalankan sampai:

- `020_operational_activity_logs.sql`

Jika belum, fitur berikut akan bermasalah:

- auth/profile sync
- materials
- question bank
- AI documents
- chunking/retrieval
- evaluations
- operational logs

## 9. Pastikan storage bucket tersedia

Storage yang dipakai app:

- `materials`
- `ai-documents`

Pastikan bucket dan policy hasil migration benar-benar sudah ada di project Supabase production.

## 10. Tambahkan custom domain di Vercel

Setelah deployment `.vercel.app` lolos:

1. Buka project di Vercel
2. Masuk ke `Settings > Domains`
3. Tambahkan custom domain
4. Ikuti instruksi DNS dari Vercel
5. Tunggu status `Valid Configuration`

Panduan resmi: [Vercel Custom Domain](https://vercel.com/docs/domains/set-up-custom-domain)

## 11. Smoke test setelah deploy

Lakukan urutan uji ini di domain live:

1. Buka homepage `/`
2. Buka `/login`
3. Signup akun baru atau login akun yang ada
4. Pastikan redirect role berjalan benar
5. Login sebagai `teacher`, buka `/teacher/materials`, buat 1 materi
6. Upload 1 file materi
7. Login sebagai `aiadmin`, buka `/ai-knowledge/documents`
8. Upload 1 dokumen AI, simpan, lalu pastikan ingestion berjalan
9. Uji `/teacher/airum-test` atau `/portal/student`
10. Buka `/developer` dan `/developer/logs` untuk cek env summary serta audit log

## 12. Checklist sebelum benar-benar live

- Semua env production sudah terisi
- Supabase `Site URL` sudah domain production yang benar
- Redirect URLs sudah mencakup localhost + production + preview
- Migration production sudah lengkap
- Storage bucket sudah ada
- Login/logout normal
- Upload file normal
- Ingestion dokumen normal
- AI-RUM menjawab dan retrieval bekerja
- Activity logs muncul

## 13. Yang masih perlu dianggap batasan

Walau deployment Vercel cocok untuk launch awal, repo ini masih punya batasan operasional yang perlu diingat:

- OCR untuk scanned PDF belum ada
- rate limit masih in-memory, belum distributed
- belum ada worker async terpisah untuk pekerjaan berat
- monitoring eksternal dan alerting belum dipasang

Jadi status paling aman untuk saat ini adalah:

- **siap deploy dan siap diuji live**
- **siap production awal / MVP**
- **belum final enterprise-hardening**

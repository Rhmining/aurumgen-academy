# Supabase Setup AURUMGEN Academy

Dokumen ini menyiapkan **Auth**, **profiles trigger**, **RLS**, **Storage bucket**, dan **seed data** supaya proyek bisa langsung dipakai.

## 1. Buat project Supabase

1. Buat project baru di Supabase.
2. Ambil `Project URL` dan `anon public key`.
3. Salin [`.env.local.example`](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/.env.local.example) menjadi `.env.local`, lalu isi:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
OPENAI_RESPONSES_MODEL=gpt-5
OPENAI_EVALUATOR_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

## 2. Jalankan migration SQL

Urutan file migration yang perlu dijalankan di SQL Editor atau Supabase CLI:

1. [001_profiles.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/001_profiles.sql)
2. [002_curriculum.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/002_curriculum.sql)
3. [003_materials.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/003_materials.sql)
4. [004_question_bank.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/004_question_bank.sql)
5. [005_progress.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/005_progress.sql)
6. [006_ai_knowledge.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/006_ai_knowledge.sql)
7. [007_rls_policies.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/007_rls_policies.sql)
8. [008_auth_profiles.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/008_auth_profiles.sql)
9. [009_resource_schema.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/009_resource_schema.sql)
10. [010_resource_policies.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/010_resource_policies.sql)
11. [011_storage_schema.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/011_storage_schema.sql)
12. [012_ai_document_chunks.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/012_ai_document_chunks.sql)
13. [013_ai_retrieval_policies.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/013_ai_retrieval_policies.sql)
14. [014_vector_search.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/014_vector_search.sql)
15. [015_airum_chat_history.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/015_airum_chat_history.sql)
16. [016_airum_evaluations.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/016_airum_evaluations.sql)
17. [017_ai_document_review.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/017_ai_document_review.sql)
18. [018_airum_evaluator_metadata.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/018_airum_evaluator_metadata.sql)
19. [019_ai_document_extraction_status.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/019_ai_document_extraction_status.sql)
20. [020_operational_activity_logs.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/020_operational_activity_logs.sql)
21. [021_ai_documents_super_access.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/021_ai_documents_super_access.sql)
22. [022_repair_auth_profile_and_ai_policies.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/022_repair_auth_profile_and_ai_policies.sql)
23. [023_ai_ingestion_metadata_sync.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/023_ai_ingestion_metadata_sync.sql)
24. [024_airum_rpc_write_path.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/migrations/024_airum_rpc_write_path.sql)

## 3. Konfigurasi Auth

Di dashboard Supabase:

1. Buka `Authentication > Providers > Email`.
2. Aktifkan Email provider.
3. Untuk pengujian lokal, Anda bisa mematikan email confirmation dulu agar signup langsung bisa login.
4. Pastikan URL callback aplikasi mengarah ke:

```txt
http://localhost:3000/api/auth/callback
```

Untuk production di Vercel, set juga:

- `Site URL` ke domain production Anda, misalnya `https://your-production-domain.com`
- `Redirect URLs` minimal berisi:
  - `http://localhost:3000/**`
  - `https://your-production-domain.com/**`
  - `https://*.vercel.app/**` atau pola preview yang lebih ketat sesuai team slug

Panduan deploy lengkap ada di [docs/VERCEL_DEPLOY.md](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/docs/VERCEL_DEPLOY.md).

## 4. Buat akun role

Cara paling mudah:

1. Jalankan aplikasi dengan `npm run dev`.
2. Buka `/login`.
3. Buat akun baru untuk setiap role yang dibutuhkan: `student`, `parent`, `teacher`, `aiadmin`, `developer`.

Saat signup, metadata `full_name` dan `role` akan dikirim ke Supabase Auth, lalu trigger `handle_new_user()` akan otomatis membuat atau memperbarui record di tabel `profiles`.

## 5. Jalankan seed data

Eksekusi [seed.sql](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/supabase/seed.sql) setelah migration selesai jika Anda ingin contoh data awal untuk dashboard.

Catatan:
- `seed.sql` memakai profile demo UUID tetap.
- Seed ini berguna untuk melihat struktur data, tetapi untuk flow auth nyata Anda tetap sebaiknya membuat user dari UI signup agar `auth.users` dan `profiles` sinkron.

## 6. Storage buckets

Migration `011_storage_schema.sql` akan membuat bucket berikut:

- `materials`
- `ai-documents`

Keduanya bersifat non-public dan memakai policy berbasis folder user:

- file disimpan di path `auth.uid()/timestamp-nama-file`
- hanya user pemilik folder yang bisa menulis, update, dan delete file tersebut

## 7. Verifikasi cepat

Setelah setup selesai:

1. Login sebagai `teacher`, lalu buka `/teacher/materials`.
2. Upload file materi lalu simpan metadata.
3. Login sebagai `aiadmin`, lalu buka `/ai-knowledge/documents`.
4. Upload file teks atau markdown dan pastikan kontennya otomatis masuk ke field `content`.
5. Untuk file `PDF`/`DOCX`, lihat strategi parser di [docs/PARSER_STRATEGY.md](/Users/rachmathidayat/Documents/AURUMGEN%20ACADEMY/docs/PARSER_STRATEGY.md) karena parser production-grade belum diaktifkan.
6. Simpan dokumen AI dan pastikan `chunk_count` terisi setelah auto-ingestion.
7. Uji chat AI-RUM di `/portal/student` atau `/teacher/airum-test`.

## 8. Jika ada error umum

- `Environment Supabase belum diatur`: `.env.local` belum lengkap.
- `Silakan login terlebih dahulu`: session belum terbentuk atau cookie auth belum aktif.
- `new row violates row-level security policy`: role user tidak cocok dengan policy atau `profiles` belum terisi.
- Upload gagal ke Storage: pastikan migration `011_storage_schema.sql` sudah dijalankan.
- Chunking tidak terbentuk: pastikan migration `012_ai_document_chunks.sql` sudah dijalankan.
- Retrieval knowledge kosong: pastikan migration `013_ai_retrieval_policies.sql` sudah dijalankan.
- Vector search gagal: pastikan migration `014_vector_search.sql` sudah dijalankan dan `OPENAI_EMBEDDING_MODEL` tersedia.
- Riwayat chat AI-RUM tidak tersimpan: pastikan migration `015_airum_chat_history.sql` sudah dijalankan.
- Skor evaluasi AI-RUM tidak muncul: pastikan migration `016_airum_evaluations.sql` sudah dijalankan.
- Metadata review dokumen tidak muncul: pastikan migration `017_ai_document_review.sql` sudah dijalankan.
- Mode evaluator atau notes judge tidak tersimpan: pastikan migration `018_airum_evaluator_metadata.sql` sudah dijalankan.
- Extraction status dokumen tidak muncul: pastikan migration `019_ai_document_extraction_status.sql` sudah dijalankan.
- Activity log operasional tidak muncul: pastikan migration `020_operational_activity_logs.sql` sudah dijalankan.
- AIRUM gagal membuat session atau menyimpan chat: pastikan migration `024_airum_rpc_write_path.sql` sudah dijalankan.

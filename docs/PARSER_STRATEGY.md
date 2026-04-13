# Parser Strategy

Dokumen ini merangkum strategi parser file non-text untuk AURUMGEN Academy agar ingestion dokumen bisa naik dari level MVP ke level operasional serius.

## Tujuan

- Mendukung ekstraksi teks yang lebih andal untuk `PDF` dan `DOCX`
- Menjaga metadata upload tetap konsisten di `ai_documents`
- Menurunkan pekerjaan manual copy-paste ke field `content`
- Menjaga hasil ekstraksi cukup bersih untuk chunking dan embedding

## Status Saat Ini

Tahap 1 sudah aktif di codebase ini:

- `DOCX` diekstrak dengan `mammoth`
- `PDF` teks biasa diekstrak dengan `pdf-parse`

Catatan:

- PDF hasil scan, layout kompleks, atau tabel padat masih bisa menghasilkan teks yang kurang rapi
- Jika parser gagal, file tetap diunggah dan user bisa melanjutkan secara manual

## Rekomendasi Tahap Implementasi

### Tahap 1: parser lokal langsung di route upload

Pilihan yang paling ringan:

- `mammoth` untuk `DOCX`
- `pdf-parse` atau `pdfjs-dist` untuk `PDF`

Kelebihan:

- Integrasi cepat dengan route upload yang sudah ada
- Cocok untuk dokumen ukuran kecil sampai menengah
- Biaya operasional rendah

Risiko:

- Parsing PDF kompleks sering berantakan untuk tabel, dua kolom, atau scan
- Waktu respons upload bisa lebih lama

## Tahap 2: extraction worker async

Untuk dokumen yang lebih berat, arah yang lebih aman adalah:

1. Upload file ke Supabase Storage
2. Simpan record `ai_documents` dengan status `queued`
3. Worker terpisah membaca file dari storage
4. Worker mengekstrak teks dan mengisi `content`
5. Worker memicu chunking, embedding, dan indexing

Kelebihan:

- Upload UI tetap cepat
- Retry dan logging lebih mudah
- Lebih cocok untuk batch processing

## Tahap 3: advanced document intelligence

Kalau kebutuhan dokumen naik:

- Gunakan parser OCR untuk PDF hasil scan
- Pertimbangkan pipeline layout-aware untuk tabel dan heading
- Simpan hasil extraction per halaman/section agar chunk editor lebih presisi

## Rekomendasi Praktis Saat Ini

Untuk codebase ini, langkah paling masuk akal berikutnya adalah:

1. Tambahkan status extraction yang disimpan ke database per dokumen
2. Bedakan `parser_succeeded`, `parser_failed`, dan `manual_content`
3. Tambahkan worker async untuk file besar
4. Tambahkan OCR pipeline untuk PDF scan
5. Gunakan `manual chunk editor` sebagai fallback operasional

## Aturan Fallback

- Jika parser gagal, file tetap disimpan
- UI memberi tahu bahwa extraction belum tersedia atau gagal
- User tetap bisa mengisi `content` manual
- Dokumen jangan otomatis di-ingest jika `content` kosong

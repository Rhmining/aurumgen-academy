insert into profiles (id, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'Demo Student', 'student'),
  ('00000000-0000-0000-0000-000000000002', 'Demo Teacher', 'teacher'),
  ('00000000-0000-0000-0000-000000000003', 'Demo AI Admin', 'aiadmin')
on conflict (id) do nothing;

insert into curriculum_items (title, pathway, subject)
values
  ('Cell Structure Mastery', 'IGCSE', 'Biology'),
  ('Functions and Graphs Sprint', 'IB', 'Mathematics')
on conflict do nothing;

insert into materials (title, subject, pathway, description, visibility, owner_id)
values
  ('IGCSE Biology Chapter 3', 'Biology', 'IGCSE', 'Materi dasar untuk sistem sel.', 'portal', '00000000-0000-0000-0000-000000000002'),
  ('IB Math HL Functions', 'Mathematics', 'IB', 'Ringkasan konsep fungsi dan grafik.', 'private', '00000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into question_bank (subject, pathway, difficulty, exam_board, prompt, answer_key, tags, owner_id)
values
  ('Biology', 'IGCSE', 'medium', 'Cambridge IGCSE', 'Jelaskan fungsi membran sel.', 'Membran sel mengatur keluar-masuk zat.', array['cells', 'core'], '00000000-0000-0000-0000-000000000002'),
  ('Mathematics', 'IB', 'hard', 'IB', 'Turunkan fungsi f(x)=3x^2 + 2x - 5.', 'f''(x)=6x+2', array['derivative', 'hl'], '00000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into ai_documents (title, category, source_type, content, status, owner_id)
values
  ('IGCSE Biology Notes', 'knowledge', 'manual', 'Core notes for IGCSE Biology ready for chunking.', 'processed', '00000000-0000-0000-0000-000000000003'),
  ('University Pathway Guide', 'pathway', 'manual', 'Guidance for parent and student consultations.', 'draft', '00000000-0000-0000-0000-000000000003')
on conflict do nothing;

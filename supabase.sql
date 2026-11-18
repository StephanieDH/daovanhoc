-- Đảo Câu Văn: bảng lưu số sao và bài thi thử theo mã học sinh.
-- Chạy một lần trong Supabase → SQL Editor → New query → dán toàn bộ → Run.
create table if not exists public.dcv_progress (
  code        text primary key,
  best        jsonb not null default '{}'::jsonb,
  essays      jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Bật bảo mật theo dòng và KHÔNG tạo policy nào:
-- trình duyệt không đọc/ghi trực tiếp được, chỉ máy chủ Vercel (dùng khóa service_role) mới truy cập.
alter table public.dcv_progress enable row level security;

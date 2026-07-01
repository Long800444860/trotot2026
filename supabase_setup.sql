-- Chạy lệnh này trong Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste vào → Run

create table if not exists rooms (
  id          bigint generated always as identity primary key,
  created_at  timestamp with time zone default now(),
  ten         text not null,
  ma          text,
  kv          text not null,
  dc          text,
  gia         numeric not null,
  loai        text,
  tang        text,
  dien_tich   numeric,
  tienich     text[],
  dich_vu     text,
  luuy        text,
  mota        text,
  available   boolean default true,
  is_new      boolean default true,
  images      text[]
);

-- Nếu bảng đã tồn tại, chỉ thêm cột mới (không mất data cũ):
alter table rooms add column if not exists dien_tich numeric;
alter table rooms add column if not exists dich_vu text;

-- Cho phép đọc public
alter table rooms enable row level security;

create policy if not exists "Public read" on rooms for select using (true);
create policy if not exists "Auth insert" on rooms for insert with check (true);
create policy if not exists "Auth update" on rooms for update using (true);
create policy if not exists "Auth delete" on rooms for delete using (true);

-- Chạy lệnh này trong Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste vào → Run

create table rooms (
  id          bigint generated always as identity primary key,
  created_at  timestamp with time zone default now(),
  ten         text not null,
  ma          text,
  kv          text not null,
  dc          text,
  gia         numeric not null,
  loai        text,
  tang        text,
  tienich     text[],
  dien        text,
  nuoc        text,
  wifi        text,
  vs          text,
  luuy        text,
  mota        text,
  available   boolean default true,
  is_new      boolean default true,
  images      text[]
);

-- Cho phép đọc public (khách xem listing)
alter table rooms enable row level security;

create policy "Public read" on rooms
  for select using (true);

create policy "Auth insert" on rooms
  for insert with check (true);

create policy "Auth update" on rooms
  for update using (true);

create policy "Auth delete" on rooms
  for delete using (true);

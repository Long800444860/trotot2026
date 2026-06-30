# TrọTốt – Hướng dẫn deploy

## Tổng quan
- **Trang chủ** (`/`): khách xem listing, lọc phòng, liên hệ
- **Trang admin** (`/admin`): bạn paste bài Zalo → tự điền form → upload ảnh → lưu

---

## Bước 1 — Tạo database (Supabase)

1. Vào **https://supabase.com** → Sign up (miễn phí)
2. Bấm **New project**, đặt tên (vd: `trotot`), chọn region **Southeast Asia**
3. Đợi project khởi tạo (~1 phút)
4. Vào **SQL Editor** → **New query** → copy toàn bộ nội dung file `supabase_setup.sql` → bấm **Run**
5. Vào **Settings → API**, copy:
   - `Project URL` → dán vào `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → dán vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Bước 2 — Tạo storage ảnh (Cloudinary)

1. Vào **https://cloudinary.com** → Sign up (miễn phí, 25GB)
2. Vào **Settings → Upload → Upload presets** → **Add upload preset**
   - Signing mode: **Unsigned**
   - Đặt tên preset (vd: `trotot_images`)
   - Bấm Save
3. Copy:
   - Cloud name (góc trên dashboard) → `NEXT_PUBLIC_CLOUDINARY_CLOUD`
   - Preset name vừa tạo → `NEXT_PUBLIC_CLOUDINARY_PRESET`

---

## Bước 3 — Cài đặt & chạy thử local

> Cần có **Node.js** (tải tại https://nodejs.org, chọn LTS)

```bash
# 1. Mở Terminal / Command Prompt, vào thư mục project
cd trotot

# 2. Cài thư viện
npm install

# 3. Tạo file cấu hình (copy từ example)
cp .env.local.example .env.local

# 4. Mở file .env.local bằng Notepad/TextEdit, điền các giá trị vừa copy ở bước 1 & 2

# 5. Chạy thử
npm run dev
```

Mở trình duyệt vào **http://localhost:3000** để xem listing
Vào **http://localhost:3000/admin** để quản lý phòng

---

## Bước 4 — Deploy lên Vercel

1. Vào **https://vercel.com** → Sign up bằng GitHub (miễn phí)
2. Bấm **Add New → Project**
3. Chọn **Import** từ thư mục local hoặc drag & drop folder `trotot`
   - Nếu chưa có GitHub: **Vercel CLI** → `npm i -g vercel` → `vercel` trong thư mục project
4. Trong phần **Environment Variables**, thêm từng dòng từ file `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD`
   - `NEXT_PUBLIC_CLOUDINARY_PRESET`
   - `NEXT_PUBLIC_ADMIN_PASS` ← **đổi thành mật khẩu riêng của bạn**
   - `NEXT_PUBLIC_HOTLINE` ← số điện thoại của bạn
5. Bấm **Deploy** → đợi ~2 phút
6. Vercel tự tạo link dạng `trotot.vercel.app`

---

## Bước 5 (tuỳ chọn) — Gắn domain riêng

1. Mua domain tại Nhân Hòa (https://nhanhoa.com) hoặc Tenten (~200k/năm)
2. Trong Vercel → **Settings → Domains** → thêm domain
3. Làm theo hướng dẫn trỏ DNS

---

## Cách dùng hàng ngày

### Đăng phòng mới:
1. Vào `yourdomain.com/admin` → nhập mật khẩu
2. Copy bài đăng từ nhóm Zalo → paste vào ô → bấm **Tự động điền**
3. Kiểm tra lại thông tin, upload ảnh từ điện thoại
4. Bấm **Lưu** → phòng hiện ngay trên listing

### Đánh dấu đã cho thuê:
Vào admin → bấm **Đánh dấu đã thuê** → badge đổi sang "Đã thuê"

---

## Chi phí hàng tháng

| Dịch vụ | Free tier | Tính phí khi |
|---------|-----------|--------------|
| Vercel | Không giới hạn build | >100GB bandwidth/tháng |
| Supabase | 500MB DB, 1GB storage | DB > 500MB |
| Cloudinary | 25GB storage, 25GB bandwidth | Vượt quota |

**→ Thực tế: miễn phí hoàn toàn cho vài trăm phòng và vài nghìn lượt xem/tháng**

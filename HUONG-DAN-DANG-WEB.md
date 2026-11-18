# Đưa Đảo Câu Văn lên mạng (GitHub + Supabase + Vercel)

Mã nguồn đã sẵn sàng trong thư mục này (git, nhánh `main`). Bạn làm 3 việc dưới đây; các bước còn lại Claude làm.

## 1. GitHub: tạo kho trống
1. Vào https://github.com/new (tài khoản StephanieDH).
2. Repository name: `dao-cau-van`, chọn **Private**.
3. **Không** tick "Add a README", không thêm .gitignore hay license.
4. Bấm **Create repository**, rồi báo Claude để Claude đẩy mã lên.

## 2. Supabase: tạo bảng lưu sao
1. Mở dự án Supabase (dùng chung dự án của app tiếng Anh được).
2. **SQL Editor** → **New query** → dán toàn bộ nội dung file `supabase.sql` → **Run**.
3. Bảng `dcv_progress` xuất hiện trong Table Editor là xong.

## 3. Vercel: tạo trang web
1. Vào https://vercel.com/new → **Import** kho `dao-cau-van`.
2. Framework Preset: **Other**. Không cần sửa Build Command.
3. Mở **Environment Variables**, thêm 2 biến:
   - `SUPABASE_URL`: lấy ở Supabase → Project Settings → API → Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: lấy ở cùng trang, khóa **service_role** (secret).
   Nếu dùng chung dự án Supabase với app tiếng Anh, hai giá trị này giống trong Vercel của app `english-exam-web`.
4. Bấm **Deploy**, rồi gửi địa chỉ web cho Claude kiểm tra.

Khóa service_role là khóa bí mật: chỉ dán vào Vercel, không gửi qua chat.

## Sau khi lên mạng
- Học sinh mở web, nhập mã (ví dụ AN0307) để lưu sao. Thầy cô, bố mẹ nhập đúng mã đó để xem sao và các bài thi thử đã nộp.
- Mỗi lần Claude sửa game rồi đẩy lên GitHub, Vercel tự cập nhật trang web.

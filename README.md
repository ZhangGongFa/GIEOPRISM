# GIEO PRISM GEN 5 · WEBSITE HOÀN THIỆN

Website tuyển thành viên tĩnh, sẵn sàng đưa lên GitHub và Vercel. HTML/CSS/JS thuần, không backend, không database, không API nhận hồ sơ.

## Thông tin chiến dịch

- GIEO PRISM — Sắc riêng tỏa sáng, cùng GIEO rực rỡ
- Vòng 1: 06/11–14/11/2026 — CV & câu hỏi
- Vòng 2: 15/11–20/11/2026 — Phỏng vấn
- Chào đón: 21/11/2026 — Công bố & teambuilding (không phải vòng 3)
- **Google Form chính thức**: https://forms.gle/DwpvgDW2SwatiURV6

## Tính năng

1. Giao diện PRISM bốn màu, logo CLB, ảnh tập thể nội bộ, cuộn trang có animation, lăng kính phát sáng/chuyển động; hỗ trợ `prefers-reduced-motion`.
2. Chi tiết 4 ban, quiz 12 câu giúp định hướng ban phù hợp (không dùng làm tiêu chí xét tuyển).
3. CV Studio có thể chọn **một hoặc nhiều ban** cùng lúc, không có nguyện vọng 1/2. Mỗi ban có **3 câu hỏi chuyên môn** và ứng viên phải trả lời **tất cả** câu hỏi của các ban đã chọn.
4. Bản xem trước CV chứa đủ ban được chọn và **toàn bộ câu hỏi + câu trả lời**, hỗ trợ in thành PDF dài nhiều trang, với hai kiểu PRISM/MINIMAL.
5. Nút Google Form chính thức; ứng viên tự tải PDF lên Google Form.

## Xem trước tại máy

Chạy `RUN_WINDOWS.bat` trên Windows có Node.js 20+ hoặc chạy:

```bash
npm run dev
```

Mở http://127.0.0.1:8780

## Đưa lên GitHub → Vercel

- Tạo repo mới, đẩy **toàn bộ nội dung** folder này lên **gốc repo** (index.html ở root).
- Vercel → Add New → Project → Import GitHub repo.
- Framework preset: **Other**; Build Command: bỏ trống; Output Directory: `.`
- Deploy. Dùng HTTPS do Vercel cấp.
- Nút mở form đã cài sẵn trong `config.js`, không phải sửa nữa.

## Kiểm tra trước khi chia sẻ fanpage

- Đúng thời gian tuyển, thông tin về bốn ban, đường dẫn Google Form.
- Quiz và mobile hoạt động; có thể chọn cùng lúc 2–4 ban.
- Tất cả câu hỏi chuyên môn hiện theo ban, câu trả lời xuất đầy đủ trong PDF nhiều trang (Chrome/Edge: In → Lưu dưới dạng PDF, bật đồ họa nền nếu muốn giữ màu).
- Form Google phải có mục **Tải tệp** và hướng dẫn đăng nhập Google khi cần; website không tự nộp tệp thay ứng viên.
- Nên thử bằng tài khoản sinh viên ngoài Ban Tổ chức để kiểm tra quyền truy cập Form.

## Chỉnh sửa

- `index.html`: thông tin, cấu trúc, ngày tháng, FAQ.
- `assets/styles.css`: màu sắc, hiệu ứng.
- `assets/data.js`: storytelling các ban, **professionalQuestions** và quiz.
- `assets/app.js`: tương tác, CV, xuất PDF.
- `assets/gieo-logo.png`, `assets/gieo-team.webp`: ảnh nội bộ (đổi cùng tên để cập nhật).
- `config.js`: link Google Form và fanpage.

- Danh sách **đầy đủ 12 câu hỏi chuyên môn** nằm trong `CAU_HOI_CHUYEN_MON.md`.

**Bảo mật:** Source không gửi CV hoặc câu trả lời về website và không dùng localStorage/sessionStorage. CV chỉ được dựng trên trình duyệt trước khi người dùng in PDF. Dữ liệu điền trên Google Form chịu chính sách của Google Form/CLB. Không thêm tracker hoặc công cụ thu dữ liệu bên thứ ba nếu chưa thông báo cho ứng viên.

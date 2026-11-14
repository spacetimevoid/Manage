# Manage (Personal Study Vault)

Reader PDF dùng Accent ladder với thang teal Manage trong shell Open plane được bảo toàn. Mở mặc định đề D1 tại trang đã lưu, hoặc tài liệu gần nhất nếu D1 không còn. URL nguồn luôn được tôn trọng. Câu hỏi chính: Tôi có thể đọc trang đề rõ hơn mà không mất vị trí đang học như thế nào? Gương mặt là trang PDF thật; dấu riêng nối trang nguồn, chế độ hiển thị và ghi chú trong cùng ngữ cảnh.

Thu phóng 100% tương ứng 96 CSS px/inch PDF, độc lập mật độ màn hình. Có Vừa chiều rộng, Vừa trang, phần trăm tùy chỉnh 25–400%, điều chỉnh pane ghi chú, tập trung trong ứng dụng và fullscreen tùy trình duyệt. Tùy chọn đọc lưu riêng trong localStorage theo đề; metadata, ghi chú và tệp tiếp tục ở IndexedDB. Đóng/mở ghi chú giữ bản nháp trong phiên, Lưu ghi chú mới commit nội dung. Thay đổi zoom không render lại toàn bộ form.

Khoảng đệm giấy 12px desktop và 8px phone nhường diện tích đọc; gutter giữa các pane vẫn 24px. Màu của PDF được giữ nguyên, không tính là màu chrome Manage. Các view danh sách và Tổng quan giữ thiết kế hiện hữu.

Ứng dụng học tập cá nhân bằng HTML, CSS và JavaScript modules. Cần Node.js 22 trở lên cho các script. Không có bước cài dependency.

`npm run dev` phục vụ ứng dụng tại localhost:5173. `npm run check`, `npm test`, `npm run build` kiểm tra và xuất trang tĩnh vào `dist`. Triển khai toàn bộ nội dung `dist` lên hosting HTTPS (Vercel). Có thể đổi cổng bằng `npm run dev -- --port 3000`.

Tài liệu và Problems dùng Achromatic ledger trong shell Open plane hiện hữu, font Instrument Sans tải cục bộ. Gương mặt và dấu riêng là các dạng bài theo môn, nhấn teal khi khớp bộ lọc, cùng liên kết đề nguồn và trang. Tổng quan giữ bố cục Editorial greeting hiện hữu. PDF.js và Lucide được vendored, giữ giấy phép trong `public/vendor`; bộ nền tasteskill giữ giấy phép trong `src`.

Dữ liệu và tệp người học lưu bằng IndexedDB trong trình duyệt hiện tại, không có backend hoặc đồng bộ tài khoản. Service worker cache giao diện và bộ mẫu sau lần tải thành công; tài liệu cá nhân chỉ sẵn sàng cục bộ sau giao dịch lưu thành công. PWA cần HTTPS hoặc localhost, khả năng cài phụ thuộc trình duyệt.

## Các câu hỏi của màn hình
- Tổng quan: Tôi nên học gì tiếp theo?
- Tài liệu: Đề nào khớp nội dung tôi cần học?
- Nạp/chỉnh sửa đề: Đề thuộc môn nào, chứa những dạng bài nào và có hạn khi nào?
- Làm đề: Tôi đang giải phần nào? Ghi chú: Cần nhớ chiến thuật hoặc bẫy nào?
- Cắt câu hỏi: Lưu vùng nào và vì sao đã sai?
- Problems: Câu nào khớp dạng bài tôi cần ôn? Chi tiết: Sai ở đâu, thuộc dạng nào và giải lại thế nào?

## Cấu trúc thư mục
```text
.
├── BUILD-VERIFICATION.md
├── README.md
├── agents.md
├── docs/
│   ├── AI_INSTRUCTIONS.md
│   ├── ARCHITECTURE.md
│   └── PRD.md
├── index.html
├── package.json
├── public/
│   ├── assets/
│   │   ├── documents/
│   │   ├── fonts/
│   │   ├── previews/
│   │   └── problems/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.webmanifest
│   ├── mark.svg
│   ├── sw.js
│   └── vendor/
├── scripts/
│   ├── browser-check.mjs
│   ├── build.mjs
│   ├── check.mjs
│   ├── filter-check.mjs
│   ├── reader-check.mjs
│   ├── repair-check.mjs
│   └── serve.mjs
├── src/
│   ├── LICENSE-tasteskill
│   ├── app.js
│   ├── charts.js
│   ├── data.js
│   ├── kit.css
│   ├── reader-geometry.js
│   ├── reader.js
│   ├── storage.js
│   ├── styles.css
│   └── types.js
├── tests/
│   ├── data.test.mjs
│   └── fixtures/
└── vercel.json
```

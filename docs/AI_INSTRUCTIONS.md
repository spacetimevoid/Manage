# Quy tắc Định hướng Dành cho AI (AI_INSTRUCTIONS.md)
## Dự án: Personal Study Vault

---

Tài liệu này quy định các nguyên tắc bắt buộc mọi AI Assistant (và các subagent) phải tuân thủ nghiêm ngặt trong suốt quá trình phát triển mã nguồn của dự án **Personal Study Vault**.

### 1. Bốn Nguyên Tắc Vàng (Core Rules)

> [!IMPORTANT]
> #### Rule 1: Luôn đối chiếu Context Docs trước khi viết mã
> TRƯỚC KHI bắt đầu code bất kỳ tính năng nào hoặc đề xuất giải pháp, AI **phải đọc lại** hai tài liệu nền tảng:
> - [`docs/PRD.md`](./PRD.md)
> - [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)
> Mọi đoạn code sinh ra phải bám sát mục tiêu, triết lý tối giản và kiến trúc đã thống nhất trong hai tài liệu trên.

> [!IMPORTANT]
> #### Rule 2: Giữ vững tinh thần Vanilla & Tối giản (Zero Bloat)
> - Ưu tiên giải pháp code thuần (Vanilla JavaScript ES6+, HTML5 ngữ nghĩa, CSS3 hiện đại).
> - **TUYỆT ĐỐI KHÔNG** tự ý cài đặt thêm thư viện, framework hay package bên ngoài (thông qua `npm`, `yarn`, `pnpm` hoặc liên kết CDN bên thứ ba) nếu **chưa có sự đồng ý rõ ràng** của User.
> - Khai thác tối đa các Web API sẵn có của trình duyệt: Canvas API (crop ảnh), IndexedDB API (lưu trữ), Service Worker (cache offline), File API (xử lý tệp).

> [!IMPORTANT]
> #### Rule 3: Báo cáo và xin xác nhận trước khi sửa đổi cấu trúc dữ liệu
> - Khi phát sinh nhu cầu thay đổi, bổ sung trường dữ liệu (fields), thay đổi kiểu dữ liệu hoặc sửa đổi mô hình quan hệ giữa các thực thể (Exams, Snippets, Tags), AI **phải trình bày lý do, schema đề xuất và xin xác nhận từ User** trước khi triển khai vào code.
> - Cập nhật đồng bộ vào `docs/ARCHITECTURE.md` sau khi User phê duyệt.

> [!IMPORTANT]
> #### Rule 4: Kỷ luật Git chặt chẽ (Atomic Commits)
> - **BẮT BUỘC** phải thực hiện `git add` và `git commit` với thông điệp rõ ràng, chuẩn mực (theo chuẩn Conventional Commits) sau **MỖI LẦN** hoàn thành một phần việc, tạo một file mới hoặc sửa đổi một khối logic chức năng.
> - **TUYỆT ĐỐI KHÔNG** được gộp quá nhiều thay đổi không liên quan vào một commit duy nhất.
> - Cấu trúc commit message:
>   - `feat(...)`: Tính năng mới
>   - `fix(...)`: Sửa lỗi
>   - `docs(...)`: Cập nhật tài liệu
>   - `refactor(...)`: Cải tiến mã nguồn nhưng không đổi chức năng
>   - `style(...)`: Định dạng CSS/UI

---

### 2. Tiêu chuẩn Mã nguồn (Coding Standards)
1. **Module hóa rõ ràng**: Sử dụng ES Modules (`import`/`export`) với cấu trúc phân tầng rành mạch (`components`, `services`, `storage`, `utils`).
2. **Bảo toàn chú thích**: Giữ lại các chú thích kỹ thuật quan trọng và docstrings giải thích logic nghiệp vụ.
3. **Phòng ngừa lỗi trình duyệt**: Luôn kiểm tra tính tương thích của API và có phương án xử lý lỗi (graceful degradation/try-catch) đối với các thao tác bất đồng bộ (Async/Await, Google Drive API, IndexedDB).

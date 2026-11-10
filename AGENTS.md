# AGENTS.md — Hướng dẫn làm việc trong dự án Manage

> **Dự án:** `Manage` — Personal Study Vault.
> **Mục đích:** Website cá nhân lưu trữ đề thi, tài liệu học tập, bài tập khó và ghi chú lỗi sai; hỗ trợ ôn tập lại và xuất sang Anki.
> **Đối tượng:** Chỉ một người dùng. Ưu tiên tốc độ, sự rõ ràng và thao tác nhanh hơn mọi tính năng "đẹp để trình diễn".
> **Ngôn ngữ:** Tài liệu và trao đổi bằng tiếng Việt. Toàn bộ UI, nhãn nút, dữ liệu mẫu và nội dung hiển thị phải là **tiếng Anh**.

---

## 1. Đọc trước khi code

Thứ tự ưu tiên khi có mâu thuẫn:

1. Yêu cầu trực tiếp của người dùng.
2. File này (`AGENTS.md`).
3. `docs/ARCHITECTURE.md` và `docs/SUPABASE_SCHEMA.sql`.
4. `docs/PRD.md`.
5. Quy ước đang có trong code.

Trước khi thêm tính năng hoặc sửa luồng dữ liệu, đọc tối thiểu:

- `docs/PRD.md` — mục tiêu sản phẩm và các luồng chính.
- `docs/ARCHITECTURE.md` — kiến trúc, stack, storage.
- `docs/SUPABASE_SCHEMA.sql` — schema thật đang dùng.
- `src/index.html` — UI và logic hiện tại.
- `src/js/supabase-config.js` — khởi tạo Supabase client.

> Lưu ý: PRD còn nhắc tới Google Drive, nhưng implementation hiện tại đã chuyển sang **Supabase Database + Supabase Storage**. Khi có mâu thuẫn, ưu tiên code và `ARCHITECTURE.md`; nếu cần, đề xuất cập nhật lại PRD thay vì tự ý đổi kiến trúc.

---

## 2. Bối cảnh sản phẩm

`Manage` giải quyết bốn việc:

1. **Nạp tài liệu:** upload đề thi, ảnh bài làm, ghi chú viết tay (PDF, PNG, JPG).
2. **Theo dõi:** deadline, trạng thái `pending`, `in_progress`, `completed`, mục quá hạn.
3. **Trích xuất bài khó:** cắt vùng câu hỏi từ đề hoặc ảnh, lưu vào Problem Vault kèm tag, ghi chú lỗi sai và ảnh lời giải.
4. **Ôn tập:** tìm kiếm/lọc theo tag, xem lại bài khó, xuất Anki TSV.

Các view hiện có trong sidebar:

| View | Vai trò |
| :--- | :--- |
| `Today` | Việc đến hạn hôm nay và việc quá hạn |
| `Upcoming` | Timeline theo ngày/tuần/tháng |
| `Problem Vault` | Kho câu hỏi khó, ảnh crop, lời giải, tag |
| `Sources` | Kho đề/tài liệu gốc, trạng thái và số bài đã trích xuất |
| `Settings & Sync` | Tài khoản, trạng thái Supabase, xuất Anki |

### Không làm nếu chưa được yêu cầu

- Không thêm landing page, hero section, pricing, blog, onboarding nhiều bước.
- Không thêm mạng xã hội, chat, notification realtime, gamification.
- Không đổi mô hình dữ liệu, tên bảng, tên cột hoặc bucket.
- Không refactor lớn file `src/index.html` chỉ vì muốn "sạch hơn".
- Không thêm framework, build step, package manager hoặc thư viện mới.

---

## 3. Tech stack và ràng buộc kỹ thuật

### Stack hiện tại

- **HTML5 + CSS3 + Vanilla JavaScript** (ES6+).
- **Tailwind CSS qua CDN** (`cdn.tailwindcss.com`).
- **Supabase JS v2 qua CDN**: Auth, PostgreSQL, Storage.
- **PDF.js qua CDN**: render PDF và tạo thumbnail.
- **Vercel Static Hosting**: deploy trực tiếp, không build.
- Không có `package.json`, bundler, test runner hay backend riêng.

### Quy tắc bắt buộc

- **Zero-bloat:** không cài npm package, không thêm CDN mới nếu chưa được người dùng đồng ý rõ ràng.
- Ưu tiên Web API gốc: Canvas, File API, Blob, localStorage, Service Worker.
- Giữ khả năng chạy bằng cách mở file tĩnh qua HTTP server; không phụ thuộc build step.
- Pin version CDN khi có thể. Không dùng `latest`.
- Không thêm secret. Chỉ dùng `SUPABASE_ANON_KEY` ở client; **tuyệt đối không** đưa `service_role` key vào repo hoặc trình duyệt.
- Không sửa file trong `.kilo/worktrees/`, `Manage (test)/` hoặc thư mục prototype bên ngoài repo này trừ khi được yêu cầu.

### Cấu trúc repo

```text
.
├── AGENTS.md
├── README.md
├── index.html                 # Redirect về src/index.html
├── vercel.json                # Rewrite / -> /src/index.html
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── SUPABASE_SCHEMA.sql
│   └── AI_INSTRUCTIONS.md
└── src/
    ├── index.html             # Toàn bộ markup + app logic hiện tại
    ├── css/                   # CSS bổ sung (hiện chưa dùng)
    ├── js/
    │   └── supabase-config.js
    └── assets/
```

### Hướng phát triển code

- Logic mới, đặc biệt là phần có thể tách rời, nên đặt trong `src/js/` dưới dạng module hoặc file riêng có tiền tố rõ ràng, thay vì tiếp tục làm phình `src/index.html`.
- Không tách file hàng loạt trong một lần. Chỉ tách phần đang sửa và giữ nguyên hành vi.
- Giữ nguyên ID, class Tailwind, hàm toàn cục và inline handler hiện có cho đến khi có kế hoạch refactor được duyệt.
- Tên hàm theo pattern đang dùng: `render*`, `open*`, `close*`, `handle*`, `save*`, `delete*`, `toggle*`.

---

## 4. Ngôn ngữ và copy

- **UI = 100% tiếng Anh.** Không trộn tiếng Việt vào nhãn, nút, placeholder, toast, empty state, tên tag.
- **Docs, comment kỹ thuật và trao đổi = tiếng Việt** nếu cần giải thích nghiệp vụ.
- Không viết kiểu song ngữ trong UI:
  - Sai: `Add task (thêm việc)`, `Dashboard (bảng điều khiển)`.
  - Đúng: `Add task`, `Dashboard`.
- Copy ngắn, động từ rõ ràng: `Add task`, `Upload source`, `Save note`, `Export .tsv`.
- Không dùng emoji trong UI, tên môn, tag hay dữ liệu mẫu. Icon trang trí phải là SVG inline, không phải emoji.
- Thông báo lỗi nói người dùng cần làm gì, không chỉ nói "Error".

---

## 5. Ngôn ngữ thiết kế — Todoist Dark Mode

Tham chiếu thị giác của dự án là **Todoist Dark Mode**: nền than chì, sidebar tách nhẹ, danh sách dày thông tin, điểm nhấn đỏ tiết chế, không gradient, không glassmorphism, không bóng đổ nặng.

### 5.1. Token màu

Dùng các giá trị đang có trong code. Không tự thêm màu mới nếu không thật sự cần.

| Token | Giá trị | Dùng cho |
| :--- | :--- | :--- |
| App background | `#1f1f1f` | Nền workspace |
| Sidebar | `#262626` | Sidebar, card, modal surface |
| Surface phụ | `#242424` / `#2a2a2a` | Empty state, input, khối phụ |
| Hover | `#2f2f2f` / `#333333` | Hover item, nút phụ |
| Active | `#363636` | Nav item đang chọn |
| Border | `#333333` | Viền card, input, divider chính |
| Divider mảnh | `#2a2a2a` | Đường kẻ giữa các row |
| Accent | `#dc2626` | CTA chính, overdue, điểm nhấn |
| Accent hover | `#ef4444` | Hover CTA |
| Accent text | `#f87171` | Chữ/icon đỏ trên nền tối |
| Text chính | `#e5e7eb` | Nội dung cần đọc |
| Text phụ | `#9ca3af` | Metadata, mô tả |
| Text mờ | `#6b7280` | Placeholder, item hoàn thành |
| Success | `#34d399` | Trạng thái hoàn thành, kết nối OK |

Ngoại lệ đã có: CTA `Upload Source` dùng `#e0564c`. Giữ nguyên nếu đang sửa khu vực đó; không nhân bản thêm sắc đỏ thứ ba.

### 5.2. Typography

- Font hệ thống: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- Không dùng web font, font serif hay font trang trí.
- Cỡ chữ thực dụng: body/list `12–14px`, metadata `10–11px`, tiêu đề view `20–24px`.
- Tiêu đề `font-semibold`/`font-bold`, nội dung `font-normal`. Không bôi đậm toàn bộ giao diện.
- Độ tương phản ưu tiên hơn hiệu ứng. Chữ phụ vẫn phải đọc được trên nền `#1f1f1f`.

### 5.3. Layout

- Sidebar desktop rộng `256px` (`w-64`), cố định; mobile là drawer trượt với backdrop.
- Header mobile cao `48px`; sidebar header desktop cao `56px`.
- Nội dung căn giữa theo độ rộng phù hợp:
  - Today/Upcoming: `max-w-3xl`.
  - Problem Vault: `max-w-5xl`.
  - Sources: `max-w-7xl`.
- Khoảng cách theo bội số 4px. Mật độ cao nhưng thoáng ở cấp section.
- Radius: `6–12px` cho card/input, `full` chỉ cho avatar, badge tròn và checkbox.
- Bóng đổ rất nhẹ hoặc không dùng; ưu tiên border 1px.

### 5.4. Component patterns

- **Task row:** checkbox tròn, tiêu đề 14px, metadata nhỏ bên dưới, divider 1px; hover đổi nền nhẹ, không nhảy layout.
- **Source card:** thumbnail hoặc fallback, tiêu đề, metadata môn/ngày/dung lượng, trạng thái; grid 1 → 2 → 3 cột.
- **Vault card:** ảnh câu hỏi là trọng tâm, tag và ghi chú ngắn; không nhồi quá nhiều metadata.
- **Modal:** overlay tối, surface `#242424`, border `#383838`, tối đa `92vh`, nội dung cuộn bên trong.
- **Empty state:** ngắn, một hành động chính, không minh họa lớn.
- **Toast:** góc màn hình, tự biến mất sau ~2.5s, không chặn thao tác.

### 5.5. Motion và accessibility

- Transition `120–200ms`, chỉ dùng cho màu nền, viền, opacity, transform nhẹ.
- Tôn trọng `prefers-reduced-motion`; không animation khi người dùng đã tắt.
- Mọi nút chỉ có icon phải có `aria-label` hoặc `title`.
- Giữ `:focus-visible` rõ ràng. Không xóa outline mà không thay thế.
- Touch target tối thiểu `44 × 44px` trên mobile.
- Không khóa zoom trang bằng `user-scalable=no` nếu đang sửa viewport; ưu tiên khả năng truy cập.

### 5.6. Responsive

Kiểm tra tối thiểu ở:

- Mobile: `390px`
- Tablet: `768px`
- Desktop: `1440px`

Yêu cầu: không tràn ngang, sidebar mở/đóng được, modal dùng được bằng bàn phím, bảng/card không vỡ bố cục.

---

## 6. Dữ liệu và Supabase

### Bảng `sources`

Đại diện cho đề thi/tài liệu gốc.

Các cột quan trọng: `id`, `title`, `file_path`, `subject`, `status` (`pending` / `in_progress` / `completed`), `due_date`, `file_size`, `extracted_count`, `thumbnail_url`, `notes`, `created_at`.

### Bảng `problems`

Đại diện cho câu hỏi khó đã trích xuất.

Các cột quan trọng: `id`, `source_id`, `image_path`, `solution_image_path`, `tags` (`text[]`), `note_text`, `anki_exported`, `created_at`.

### Storage buckets

- `sources` — file đề gốc.
- `problem_snippets` — ảnh câu hỏi và ảnh lời giải đã crop.

### Quy tắc dữ liệu

- `problems.source_id` liên kết tới `sources.id` và có thể là `null` với bài nhập từ ngoài (External Problem); xóa source sẽ cascade các problem đang liên kết.
- `tags` lưu dạng mảng text, lọc bằng toán tử PostgreSQL; không lưu tag dưới dạng chuỗi phân tách dấu phẩy.
- `extracted_count` được cập nhật bằng trigger; không tự cộng/trừ thủ công ở client.
- Ảnh crop nên được nén trước khi upload; ưu tiên PNG cho nét chữ, JPEG khi ảnh lớn.
- Luôn `escapeHtml()` khi render dữ liệu người dùng vào `innerHTML`.
- Kiểm tra `error` của mọi lời gọi Supabase và hiển thị toast phù hợp.
- localStorage chỉ dùng cho cache tiện ích (thumbnail, notes nháp, vị trí splitter). Nguồn sự thật vẫn là Supabase.

### Thay đổi schema

Trước khi thêm/xóa/đổi cột, kiểu dữ liệu, policy hoặc bucket:

1. Trình bày lý do và schema đề xuất.
2. Xin xác nhận của người dùng.
3. Cập nhật `docs/SUPABASE_SCHEMA.sql` và `docs/ARCHITECTURE.md`.
4. Viết migration idempotent (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS` trước `CREATE POLICY`).

Không hạ thấp RLS hoặc mở quyền ghi công khai hơn mức hiện tại. Nếu thấy policy đang quá rộng, báo lại thay vì tự ý siết có thể làm hỏng app.

---

## 7. Coding standards

- Indent 2 spaces; dấu nháy đơn cho string JavaScript; luôn dùng dấu chấm phẩy.
- Ưu tiên `const`, chỉ dùng `let` khi cần gán lại. Không dùng `var` trong code mới.
- Dùng `async/await` và `try/catch` cho thao tác Supabase, file, canvas.
- Không để promise rơi không xử lý.
- Hàm ngắn, một trách nhiệm. Nếu hàm vượt ~60 dòng, cân nhắc tách.
- Đặt tên ID/class theo kebab-case cho DOM (`vaultSearchInput` là ngoại lệ đang tồn tại; giữ nguyên khi sửa).
- Không log dữ liệu nhạy cảm, token, nội dung file hay email ra console trong code production.
- Comment giải thích **vì sao**, không kể lại code. Không thêm comment song ngữ thừa.
- Không dùng `innerHTML` với dữ liệu chưa escape. Với text thuần, dùng `textContent`.
- Giữ tương thích Safari/iOS vì người dùng có thể dùng iPad/iPhone.

---

## 8. Quy trình làm việc cho AI agent

1. **Đọc context:** file này + tài liệu liên quan + đoạn code sẽ sửa.
2. **Khảo sát trước khi sửa:** tìm hàm, ID, sự kiện, luồng dữ liệu đang tồn tại. Không đoán.
3. **Nêu kế hoạch ngắn** nếu thay đổi chạm từ 2 file trở lên hoặc ảnh hưởng schema.
4. **Làm thay đổi nhỏ nhất** đáp ứng yêu cầu. Không "tiện tay" refactor phần không liên quan.
5. **Kiểm tra thủ công** theo checklist bên dưới.
6. **Báo cáo:** đã đổi gì, file nào, cách kiểm tra, điều gì còn hạn chế.
7. **Commit** sau mỗi đơn vị logic hoàn chỉnh.

### Checklist trước khi kết thúc

- [ ] UI không trộn tiếng Việt; không có emoji trong nhãn/dữ liệu.
- [ ] Đúng token màu và kiểu chữ; không thêm màu/font tùy ý.
- [ ] Mobile 390px, tablet 768px, desktop 1440px không vỡ layout.
- [ ] Không lỗi console; không request Supabase thất bại ngoài dự kiến.
- [ ] Dữ liệu người dùng được escape trước khi render.
- [ ] Trạng thái rỗng, loading, lỗi đều có phản hồi rõ ràng.
- [ ] Thao tác chính vẫn dùng được bằng bàn phím.
- [ ] Không thêm dependency mới.
- [ ] Không sửa schema nếu chưa được duyệt.

### Lệnh chạy local

Không có build step. Chạy static server từ thư mục `src`:

```bash
cd src
python3 -m http.server 8000
```

Mở `http://localhost:8000`. Kiểm tra thêm bằng cách chạy từ root repo để xác nhận redirect `index.html` vẫn hoạt động.

### Kiểm tra cú pháp

- JavaScript trong HTML: kiểm tra bằng Console trình duyệt; không có test runner.
- File `.js` rời: `node --check <file>` nếu máy có Node.
- SQL: chạy trong Supabase SQL Editor trên project test trước khi áp dụng project thật.

---

## 9. Git

- Theo **Conventional Commits**:
  - `feat(vault): ...`
  - `fix(sources): ...`
  - `style(ui): ...`
  - `docs: ...`
  - `refactor(...): ...`
  - `chore(...): ...`
- Scope gợi ý: `auth`, `today`, `upcoming`, `vault`, `sources`, `settings`, `ui`, `db`, `docs`.
- Commit nguyên tử: một mục đích, một commit. Không gộp nhiều thay đổi không liên quan.
- Không commit file rác, ảnh chụp tạm, `.DS_Store`, token hay file cấu hình cá nhân.
- Trước khi commit, xem lại `git diff` và `git status`.

---

## 10. Ưu tiên kế tiếp (chỉ khi được yêu cầu)

Các hạng mục còn thiếu, xếp theo giá trị thực dụng:

1. **Tách logic khỏi `src/index.html`** thành module nhỏ trong `src/js/` mà không đổi hành vi.
2. **PWA thật**: `manifest.webmanifest`, service worker, cache shell và dữ liệu đã xem.
3. **Tối ưu mobile**: bottom navigation, vùng chạm, crop ảnh bằng cảm ứng.
4. **Tìm kiếm hợp nhất** `Cmd+K` trên Sources + Problem Vault.
5. **Ôn tập ngắt quãng**: trường lịch ôn, hàng đợi `Due today`, lịch sử làm lại.
6. **Anki tốt hơn**: xuất kèm media, hoặc `.apkg` nếu thật sự cần.
7. **Siết RLS** theo user thay vì policy mở cho `anon`.

Không tự bắt đầu các hạng mục trên nếu người dùng chỉ yêu cầu một thay đổi nhỏ.

---

## 11. Định nghĩa "xong"

Một thay đổi chỉ được coi là xong khi:

- Đúng yêu cầu, không lan sang phạm vi khác.
- Giao diện nhất quán với Todoist Dark Mode và các token ở trên.
- Hoạt động ở cả desktop và mobile.
- Không thêm dependency, không phá cấu trúc dữ liệu.
- Đã kiểm tra thủ công luồng chính.
- Đã commit với message rõ ràng.
- Đã báo lại file thay đổi và cách kiểm tra.

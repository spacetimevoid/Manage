# Kết quả Build

## Repair 1: trạng thái sẵn sàng của PDF desktop

Phát hiện `#app` đã báo `aria-busy=false` khi metadata sẵn sàng, trước khi canvas PDF render xong. Reader nay đồng bộ trạng thái tải của ứng dụng với lượt render hiện hành; canvas được đưa vào khung rồi mới báo hết tải. Luồng lỗi vẫn kết thúc trạng thái tải và giữ nút thử lại. Không sửa PDF, bố cục, token hoặc control.

`npm.cmd run check`, `npm.cmd test` (7 mục), `npm.cmd run build` và `node scripts/reader-check.mjs` (71 mục) đều đạt. Bài kiểm tra giữ yêu cầu PDF đầu tiên chờ để xác nhận ứng dụng vẫn báo đang tải, sau đó xác nhận canvas có kích thước hợp lệ và skeleton đã kết thúc trước khi chụp. Không lỗi console hoặc console.assert. Chrome dùng các tệp build qua interception, không khởi động preview server. Đã xem lại `.taste/reader-check/desktop.png` tại 1440×900 và `reader-390.png` tại 390×844: trang PDF đủ bốn cạnh. TasteCode cần chụp lại lượt Preview với bản build này; ảnh desktop loading cũ không phải bằng chứng render bị treo. Chưa kiểm tra thiết bị cảm ứng thật, bàn phím ảo, screen reader hoặc fullscreen được cấp quyền.

## Cập nhật nút reader theo hình 2

Phần control reader dùng Achromatic ledger: pill trắng, chữ ink, viền trung tính, không còn nền teal trên chế độ được chọn. Ô trang rộng 70px, cao 48px; chọn mode cao 48px với chevron Lucide bên phải. Previous tròn, xám khi disabled; next không khung khi nghỉ nhưng vẫn có box 44px. Zoom, reset, crop và nút header đồng bộ pill. Giữ toàn bộ handler, preference phiên bản 2 và Vừa trang mặc định.

Câu hỏi reader: “Tôi đang đọc trang nào và có thể chuyển trang hoặc đổi cách hiển thị ngay ở đâu?”. Gương mặt là PDF nguyên bản; signature là cụm trang học pill và chevron thoáng theo user-reference-2. Ngoại lệ sheet có chủ đích: giữ shell Open plane, sidebar 224px, font Instrument Sans và dấu M theo brand thay No sidebar/Geist; dùng radius pill và field 48px theo ảnh người dùng thay control 6px/36px. Không đổi typography tiêu đề, panel, textarea hoặc view ngoài reader; không thêm chart/KPI.

Kiểm tra lượt này: syntax, token-only additions, kit licenses, asset destinations và build đạt; 7 unit tests đạt. Reader Chrome đạt 69 mục, hồi quy ứng dụng 51 mục, bộ lọc 35 mục và bố cục Tổng quan bốn độ rộng đều đạt; không lỗi console hoặc console.assert. Đã kiểm tra Enter nhập trang, biên đầu/cuối, style pill và mode trung tính, sáu độ rộng 390–1440px, viewport thấp, tên dài, notes/draft/quota, zoom nhanh, focus/Escape, crop, reduced motion, font loaded và tabular digits. Đã xem ảnh desktop, 390px, 1101px và trạng thái trang đầu; giấy vẫn đủ bốn cạnh. Kit và charts sẵn có được tái sử dụng cùng license; không cài dependency hoặc để preview server chạy thường trực.

Chưa kiểm tra thiết bị cảm ứng thật, bàn phím ảo, screen reader, browser zoom giao diện trình duyệt hoặc fullscreen được cấp quyền trên từng trình duyệt. Các kiểm tra viewport không thay thế thiết bị thật.

Verify before publishing: dữ liệu mẫu, hạn và notes ở `src/data.js`; nhãn dạng bài ở `src/types.js`; PDF minh họa ở `public/assets/documents`. Giữ nguyên bộ mẫu và notice, không coi đây là lịch sử học thật.

## Reader PDF linh hoạt

Đã nối reader mới vào ứng dụng hiện hữu bằng `src/reader.js`, phép tính tỷ lệ tại `src/reader-geometry.js`. Kit và charts giữ nguyên dòng giấy phép; không cài dependency. Điều chỉnh chỉ scope reader, crop tiếp tục dùng luồng đã có. Mặc định là D1 tại trang đã lưu; liên kết URL rõ ràng không bị ghi đè. Giữ dữ liệu mẫu sáu đề, 20 trang, sáu Problems, hai notes và nhãn dạng bài.

Kiểm tra reader riêng: `node scripts/reader-check.mjs` đạt 31 mục với Chrome, không lỗi console hoặc console.assert. Đã kiểm tra sáu độ rộng 390, 640, 768, 1100, 1101 và 1440px; một h1, box tương tác ít nhất 44px, không overflow toàn trang, FontFace Instrument Sans loaded và check đủ 400/500/600/700. Desktop khung giấy bắt đầu khoảng 212px, cao khoảng 672px; mobile bắt đầu khoảng 311px, cao khoảng 517px. Đã xem ảnh desktop, phone và ghi chú mobile tại `.taste/reader-check/`.

Đã thao tác fit-width, fit-page, phần trăm, giới hạn trang, chuyển trang, giữ anchor khi zoom, bật/tắt ghi chú, đổi độ rộng pane, giữ draft, lưu quota lỗi/thử lại, reload giữ tùy chọn, tập trung/Escape và fullscreen bị từ chối. Fixture PDF gốc tại `tests/fixtures/reader-mixed.pdf` có trang dọc, ngang và vuông, chỉ dùng trong browser profile kiểm thử và được gỡ khỏi kho sau bài kiểm tra. Đã đối chiếu kích thước render thực với CSS inch, không đưa fixture vào dữ liệu mẫu hoặc bản build.

`npm.cmd test`: sáu bài đạt, thêm phép tính zoom và giới hạn trang. `npm.cmd run check` và `npm.cmd run build` đạt. Bộ trình duyệt hồi quy hiện hữu đạt 51 mục; bộ lọc đạt 35 mục, bố cục Tổng quan qua kiểm tra tọa độ. Kiểm tra reader dùng Fetch interception, không cần server; bộ hồi quy dùng server tạm đóng sau kiểm tra, không để Preview thường trực.

Giới hạn: chưa thử màn hình cảm ứng vật lý, Safari/Firefox, trình đọc màn hình, bàn phím ảo, fullscreen được cho phép trên thiết bị thật hoặc mọi PDF bên ngoài có font/kích thước đặc biệt. Reduced motion được kiểm tra bằng media emulation. Không có cấu hình TypeScript hoặc lint độc lập; check bao gồm cú pháp và quy tắc token. Verify before publishing: giữ/xác nhận bộ mẫu, ngày hạn và ghi chú trong `src/data.js`, nhãn tại `src/types.js`, tài liệu minh họa trong `public/assets/documents`; không coi đây là lịch sử học thật hoặc tài liệu HOCMAI trong ảnh tham chiếu.

Sửa sau Review lần 1: danh sách Tài liệu dùng trạng thái học độc lập với cảnh báo hạn ở cả desktop/mobile; cảnh báo nằm cùng ngày hạn. Môn học chỉ xuất hiện một lần theo breakpoint. Bộ mẫu thuần nhất dùng notice chung; danh sách trộn mẫu và cá nhân vẫn đánh dấu từng đề mẫu. Các hàng co theo nội dung còn lại, không đổi token hoặc shell. `check`, năm unit tests và `build` đạt; `filter-check.mjs` đạt 35 kiểm tra (bao gồm trạng thái, cảnh báo, metadata duy nhất và chiều cao hàng ở sáu độ rộng), không có lỗi console/assertion. `repair-check.mjs` xác nhận bố cục Tổng quan vẫn giữ nguyên. Đã xem ảnh kết quả 1440px và 390px; các kiểm tra trình duyệt dùng Fetch interception, không khởi động server.

Phần Tài liệu, Problems và metadata mới dùng Achromatic ledger sáng trong shell Open plane hiện hữu. Instrument Sans và dấu M được giữ. Gương mặt là dạng bài theo môn; dấu riêng kết nối nhãn khớp trong kết quả với bộ lọc, giữ nguồn đề và trang. Tổng quan, reader, ghi chú và hình học crop được bảo toàn. Câu hỏi của từng view và danh sách “Verify before publishing:” nằm trong README.md.

## Kiểm tra đã chạy

- `npm.cmd run check`: cú pháp JavaScript, JSON, token thiết kế, dòng giấy phép kit và tất cả đích asset hợp lệ.
- `npm.cmd test`: năm bài đạt, gồm tổng số, liên kết nguồn, tìm kiếm tiếng Việt, lọc kết hợp, danh mục dạng bài, chuẩn hóa nhãn, migration bảo toàn metadata và số không của tài khoản rỗng.
- `npm.cmd run build`: xuất toàn bộ ứng dụng và tài sản vào `dist`.
- `npm.cmd run test:browser`: 51 mục đạt trên Chrome headless, không có lỗi JavaScript hoặc console.assert thất bại. Báo cáo chi tiết và ảnh tại `.taste/build-check/`.
- `node scripts/filter-check.mjs`: 29 kiểm tra đạt, gồm lọc D1/P2, reset giữ q/sort, bỏ dạng không tương thích khi đổi môn, thêm nhiều nhãn/chống trùng, chặn lưu nhãn khác môn, giữ query khi quay lại, Hủy/Áp dụng/Escape, trả focus, đổi breakpoint, zero, reload, lỗi quota giữ nhãn, phân trang với bản ghi thử và Back/Forward. Kiểm tra 390, 640, 768, 1100, 1101 và 1440px: một h1, không overflow, box tối thiểu 44px, font thật loaded và chỉ một bộ control. Báo cáo `.taste/repair-check/filter-report.json`. Dùng Fetch interception, không mở server.
- `node scripts/repair-check.mjs`: bố cục Tổng quan desktop giữ nguyên tọa độ và các cạnh chung; mobile vẫn đặt việc học tiếp theo trước số đếm. Không có assertion hoặc console error.
- Các kiểm tra trình duyệt dùng máy chủ tạm trong tiến trình kiểm tra, được đóng sau khi hoàn thành. Không để máy chủ Preview chạy thường trực.

Đã kiểm tra viewport 1440×900, 1100×900, 768×900 và 390×900: đúng một h1, không tràn ngang, các phần tử tương tác nhìn thấy có box tối thiểu 44×44px. Tổng quan desktop giữ các cạnh và đáy chung theo nhịp 3/3/3/3, 9/3, 6/6; các panel đều xuất hiện trong chiều cao 900px.

Instrument Sans có FontFace loaded; document.fonts.check đạt ở 400/500/600. Độ rộng sáu chữ số 1 và 8 khi dùng tabular-nums cùng bằng 115.203125px ở cỡ kiểm tra 32px; chế độ normal có độ rộng khác nhau.

Đã thực hiện tìm kiếm, lọc, sort, đổi bộ lọc liên tiếp, mở menu và đóng bằng Escape, trả focus, mở dialog lọc, chuyển trạng thái ôn, lưu phân tích, chuyển trang PDF, lưu ghi chú, chọn vùng bằng chuột và tọa độ, xuất ảnh crop, tạo/xóa Problem, tải PDF hợp lệ và từ chối tệp giả PDF, mở PDF Blob đã lưu, tải lại trang giữ IndexedDB. Đã giả lập lỗi quota và lỗi đọc để kiểm tra giữ bản nháp, thông báo lỗi và Thử lại. Đã kiểm tra tài khoản rỗng, giá trị 0, reduced motion và tải lại khi mạng bị ngắt với service worker đã cài.

## Ngoại lệ và giới hạn

Hàng điều hướng hiện hữu có box 44px, nền chọn cao 32px, để các vùng bấm không chồng nhau. Phần lọc mới có nhãn 12px, chữ 14px, radius 6px, nút và select vẽ cao 36px trong box 44px. Dialog radius 8px, hiệu ứng mở và đổi thứ tự hàng 180ms ease-out, reduced motion cập nhật ngay. Font Instrument Sans và màu Manage ưu tiên hơn Geist/màu của sheet. Không thêm biểu đồ hoặc KPI vì yêu cầu là lọc danh sách. Token mới chỉ scope thanh lọc và metadata, không thay hình học view ngoài phạm vi.

Chưa kiểm tra trên thiết bị cảm ứng vật lý, trình đọc màn hình chuyên dụng, Safari/Firefox hoặc việc cài và khởi chạy PWA độc lập ở cấp hệ điều hành. Những việc này cần kiểm tra tiếp trong Preview/Review hoặc trên thiết bị đích. Kiểm tra viewport di động không thay thế kiểm tra thiết bị thật. Không có cấu hình typecheck TypeScript hay lint có sẵn; ứng dụng dùng JavaScript modules và kiểm tra cú pháp cùng quy tắc cục bộ.

Dữ liệu học là mẫu, không phải thành tích thật. Các PDF là bài luyện gốc minh họa, không thuộc trường học hoặc tổ chức được ngụ ý. Giữ nhãn Dữ liệu mẫu trong trang và tài liệu. Tệp và metadata người học chỉ lưu trong trình duyệt hiện tại, không có backend, tài khoản hay đồng bộ. Không xóa dữ liệu trình duyệt nếu chưa sao lưu tài liệu gốc.
# Cập nhật: Vừa trang mặc định

Reader trả lời: “Tôi có thể thấy trọn trang đề đang đọc mà không phải cuộn tìm nửa còn lại không?”. Giữ Accent ladder, shell Open plane, Instrument Sans và thang teal Manage. Gương mặt là PDF nguyên bản; dấu riêng nối trang giấy, trang nguồn và ghi chú. Không thay các view ngoài reader hoặc dữ liệu học.

Mặc định và Đặt lại chọn Vừa trang. Preference phiên bản 2 chuyển lựa chọn cũ một lần sang Vừa trang, bỏ anchor cũ, giữ trang và các tùy chọn ghi chú; lựa chọn width/custom mới vẫn được lưu. Khung đọc lấy chiều cao viewport còn lại sau chrome thực, không còn mức tối thiểu 420/460px. Vừa trang căn giữa, bỏ offset cuộn; custom/width tiếp tục giữ anchor. Notes dài cuộn trong pane. Service worker dùng cache mới để cập nhật reader ngoại tuyến.

Kiểm tra lần này: `npm.cmd run check`, `npm.cmd test` (7 bài), `npm.cmd run build`; Chrome reader 65 mục, browser hồi quy 51 mục, bộ lọc 35 mục đều đạt, không lỗi console hoặc console.assert. Kiểm tra sáu độ rộng 390/640/768/1100/1101/1440px, thêm màn hình 390×440, 844×390, 768×600 và 1440×600, tiêu đề dài, notes, focus, rapid zoom, migration/reload, PDF fixture nhiều kích thước, quota lưu và fullscreen bị từ chối. Đã xem ảnh desktop, mobile và 1101px. Kiểm tra font loaded đủ bốn weight, tabular digits, một h1 và box 44px. Kiểm tra browser dùng phiên tạm và kết thúc sau kiểm tra; không để preview server chạy.

Ngoại lệ có chủ đích: khoảng trống hai bên trang dọc trong khung rộng là kết quả giữ đủ bốn cạnh, không kéo rộng giấy làm mất nửa dưới; chữ trong PDF giữ nguyên, độc lập quy tắc typography của chrome. Font, sidebar 224px và màu giữ theo brand thay giá trị mặc định sheet. Không thêm KPI/chart hoặc mẫu object-detail vì phạm vi là reader.

Chưa kiểm tra thiết bị cảm ứng thật, bàn phím ảo, screen reader, browser zoom giao diện trình duyệt và fullscreen được cấp quyền trên từng trình duyệt. Fixture hiện hữu có trang dọc/ngang/vuông, chưa thêm trường hợp rotation metadata riêng. Những giới hạn này không được suy ra từ screenshot.

Verify before publishing: dữ liệu mẫu, hạn và notes ở `src/data.js`; nhãn dạng bài ở `src/types.js`; PDF minh họa ở `public/assets/documents`. Các giá trị được giữ nguyên và mang notice dữ liệu mẫu, không phải lịch sử học thật.


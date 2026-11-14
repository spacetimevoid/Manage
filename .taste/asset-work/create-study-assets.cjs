const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const root = process.cwd();
const docs = [
 {id:'d1',title:'Ứng dụng đạo hàm',subject:'Toán',pages:[
  ['Đạo hàm và tiếp tuyến','Cho f(x) = x³ − 3x + 2. Tính f′(x) và viết phương trình tiếp tuyến của đồ thị tại x = 2.','Tìm các điểm trên đồ thị mà tiếp tuyến song song với đường thẳng y = 9x + 1.'],
  ['Điều kiện của hàm phân thức','Cho f(x) = (x² − 1)/(x − 1). Xác định tập xác định của f, rút gọn biểu thức và tính đạo hàm trên tập xác định.','Giải phương trình f(x) = 2. Giải thích vì sao phải kiểm tra nghiệm với điều kiện xác định.'],
  ['Dấu của đạo hàm','Cho f(x) = x³ − 3x² + 2. Tìm nghiệm của f′(x) = 0 và xác định dấu của f′ trên từng khoảng.','Lập bảng biến thiên, tìm cực trị và phân biệt cực đại địa phương với giá trị lớn nhất trên đoạn [−1; 3].'],
  ['Giá trị lớn nhất, nhỏ nhất','Cho f(x) = x + 4/x trên đoạn [1; 4]. Tìm giá trị lớn nhất và nhỏ nhất của f.','Một hình chữ nhật có chu vi 20 cm. Dùng đạo hàm tìm kích thước để diện tích lớn nhất. Ghi đơn vị kết quả.']
 ]},
 {id:'d2',title:'Dao động cơ',subject:'Vật lý',pages:[
  ['Chọn pha ban đầu','Một vật dao động điều hòa: x = 4 cos(2πt + φ) cm, với t tính bằng giây. Tại t = 0, vật có li độ 2 cm và đang chuyển động theo chiều âm.','Xác định φ trong khoảng [−π; π], rồi tính vận tốc tại t = 0. Chú ý dấu của vận tốc khi chọn nghiệm.'],
  ['Chu kỳ và tần số','Một vật thực hiện 20 dao động toàn phần trong 10 s. Tính chu kỳ, tần số và tần số góc của dao động.','Biên độ của vật là 5 cm. Tính tốc độ cực đại và đổi kết quả sang m/s.'],
  ['Năng lượng dao động','Con lắc lò xo có độ cứng 100 N/m, khối lượng 0,25 kg và biên độ 4 cm. Tính cơ năng. Bỏ qua ma sát.','Tại li độ 2 cm, tính thế năng và động năng. Kiểm tra tổng hai đại lượng với cơ năng.']
 ]},
 {id:'d3',title:'Cân bằng hóa học',subject:'Hóa học',pages:[
  ['Biểu thức hằng số cân bằng','Xét phản ứng N₂(g) + 3H₂(g) ⇌ 2NH₃(g). Viết biểu thức Kc theo nồng độ cân bằng của các chất.','Nếu [N₂] = 0,20 mol/L, [H₂] = 0,30 mol/L và [NH₃] = 0,10 mol/L, tính giá trị Kc.'],
  ['Đơn vị của hằng số cân bằng','Xét phản ứng H₂(g) + I₂(g) ⇌ 2HI(g). Tại cân bằng: [H₂] = [I₂] = 0,10 mol/L và [HI] = 0,80 mol/L. Tính Kc.','Dùng quy ước biểu thức nồng độ trong bài tập phổ thông, xét đơn vị suy ra của Kc. Phân biệt với hằng số nhiệt động dùng hoạt độ không thứ nguyên.'],
  ['Sự chuyển dịch cân bằng','Xét cân bằng 2NO₂(g) ⇌ N₂O₄(g), chiều thuận tỏa nhiệt. Dự đoán chiều chuyển dịch khi hạ nhiệt độ.','Dự đoán chiều chuyển dịch khi giảm thể tích ở nhiệt độ không đổi. Phân biệt thay đổi Kc và thay đổi thành phần cân bằng.']
 ]},
 {id:'d4',title:'Tích phân cơ bản',subject:'Toán',pages:[
  ['Nguyên hàm đa thức','Tìm họ nguyên hàm của f(x) = 3x² − 4x + 1. Kiểm tra kết quả bằng phép lấy đạo hàm.','Tìm nguyên hàm F thỏa mãn F(0) = 2.'],
  ['Tích phân xác định','Tính tích phân từ 0 đến 2 của (3x² − 2x) dx bằng công thức Newton–Leibniz.','Giải thích sự khác nhau giữa một nguyên hàm và giá trị của tích phân xác định.'],
  ['Đổi biến số','Tính tích phân từ 0 đến 1 của 2x(x² + 1)³ dx bằng cách đặt u = x² + 1.','Ghi rõ cận mới và kiểm tra kết quả bằng khai triển đa thức.'],
  ['Diện tích hình phẳng','Tính diện tích hình phẳng giới hạn bởi y = x² − 1, trục hoành và hai đường thẳng x = −2, x = 2.','Chia khoảng theo dấu của hàm số. Giải thích vì sao không lấy trực tiếp tích phân có dấu làm diện tích.']
 ]},
 {id:'d5',title:'Điện xoay chiều',subject:'Vật lý',pages:[
  ['Tần số của dòng điện','Cho i = 2 cos(100πt) A, t tính bằng giây. Xác định biên độ, tần số góc, tần số và chu kỳ.','Tính cường độ dòng điện tức thời tại t = 0,005 s.'],
  ['Giá trị hiệu dụng','Điện áp giữa hai đầu một điện trở R = 100 Ω có biểu thức u = 220√2 cos(100πt) V. Xác định điện áp hiệu dụng.','Tính cường độ dòng điện hiệu dụng và công suất tỏa nhiệt. Phân biệt biên độ điện áp với giá trị hiệu dụng.'],
  ['Trở kháng và cộng hưởng','Mạch RLC nối tiếp có R = 40 Ω, cảm kháng 80 Ω và dung kháng 50 Ω. Điện áp hiệu dụng toàn mạch là 100 V.','Tính tổng trở, dòng điện hiệu dụng và hệ số công suất. Nêu điều kiện cộng hưởng.']
 ]},
 {id:'d6',title:'Este và chất béo',subject:'Hóa học',pages:[
  ['Bảo toàn khối lượng','Thủy phân hoàn toàn 8,8 g ethyl acetate bằng dung dịch chứa vừa đủ 4,0 g NaOH. Thu được 8,2 g sodium acetate và m g ethanol.','Dùng bảo toàn khối lượng để tính m. Kiểm tra bằng số mol; cho C = 12, H = 1, O = 16, Na = 23.'],
  ['Phản ứng xà phòng hóa','Viết phương trình phản ứng của ethyl acetate với NaOH. Nêu tỉ lệ mol giữa este và NaOH.','Tính khối lượng NaOH cần dùng để thủy phân hoàn toàn 0,20 mol ethyl acetate.'],
  ['Chất béo và glycerol','Một triglyceride phản ứng hoàn toàn với NaOH. Viết sơ đồ phản ứng tổng quát, chỉ rõ hệ số mol của NaOH và glycerol.','Nếu dùng 0,10 mol triglyceride, tính số mol NaOH cần thiết và khối lượng glycerol thu được. Cho M glycerol = 92 g/mol.']
 ]}
];
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
for(const d of docs){
 const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><title>${esc(d.title)}</title><style>
 @page{size:595pt 842pt;margin:0}*{box-sizing:border-box}body{margin:0;color:#1f201d;font:12pt Arial,sans-serif}.page{width:595pt;height:842pt;position:relative;break-after:page;padding:48pt}.page:last-child{break-after:auto}.brand{font-size:11pt;color:#636361}.title{font-size:24pt;font-weight:400;margin:14pt 0 8pt}.meta{font-size:10pt;color:#636361}.question{position:absolute;left:48pt;top:160pt;width:499pt;height:180pt;border-top:1pt solid #d9d9d6;padding:14pt 0}.question h2{font-size:15pt;font-weight:600;margin:0 0 14pt}.question p{font-size:12pt;line-height:1.65;margin:0 0 12pt}.work{position:absolute;top:370pt;left:48pt;right:48pt}.work h2{font-size:12pt;font-weight:400}.line{height:31pt;border-bottom:.5pt solid #eaeaea}.footer{position:absolute;bottom:30pt;left:48pt;right:48pt;display:flex;justify-content:space-between;font-size:9pt;color:#636361}</style><body>`+d.pages.map((q,i)=>`<article class="page"><div class="brand">Manage · Tài liệu minh họa</div><h1 class="title">${esc(d.title)}</h1><div class="meta">${d.subject} · Bài luyện ${i+1} · Dữ liệu mẫu</div><section class="question"><h2>${q[0]}</h2><p>${q[1]}</p><p>${q[2]}</p></section><section class="work"><h2>Bài giải và ghi chú</h2>${'<div class="line"></div>'.repeat(10)}</section><footer class="footer"><span>Dữ liệu mẫu · Nội dung biên soạn cho Manage</span><span>Trang ${i+1}/${d.pages.length}</span></footer></article>`).join('')+'</body></html>';
 const htmlPath=path.join(root,'.taste','asset-work',`study-${d.id}.html`); fs.writeFileSync(htmlPath,html);
 const out=path.join(root,'public','assets','documents',`study-${d.id}.pdf`);
 const r=spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox','--disable-gpu','--no-pdf-header-footer',`--user-data-dir=${path.join(root,'.taste','asset-work','chrome-profile')}`,`--print-to-pdf=${out}`,new URL('file:///'+htmlPath.replaceAll('\\','/')).href],{timeout:45000,encoding:'utf8'});
 if(!fs.existsSync(out))throw new Error(`${d.id}: ${r.error||r.stderr}`); console.log(d.id,fs.statSync(out).size);
}
fs.writeFileSync('.taste/asset-work/study-sources.json',JSON.stringify({license:'Original illustrative educational content authored for Manage; no real institution affiliation.',documents:docs,cropRectPdfPoints:{x:48,y:160,width:499,height:180},problems:[{id:'p1',documentId:'d1',page:2},{id:'p2',documentId:'d1',page:3},{id:'p3',documentId:'d2',page:1},{id:'p4',documentId:'d3',page:2},{id:'p5',documentId:'d5',page:2},{id:'p6',documentId:'d6',page:1}]},null,2));

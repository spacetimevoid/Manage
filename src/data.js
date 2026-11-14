import {migrateTypes} from './types.js';
export const SAMPLE_DATE='2026-11-13';
export const subjects=['Toán','Vật lý','Hóa học'];
export const allSubjects=state=>[...new Set([...subjects,...(state?.documents||[]).map(d=>d.subject).filter(Boolean)])];
export const statusLabels={not_started:'Chưa làm',in_progress:'Đang làm',completed:'Hoàn thành',review:'Cần ôn',mastered:'Đã nắm vững'};
const titles=['Ứng dụng đạo hàm','Dao động cơ','Cân bằng hóa học','Tích phân cơ bản','Điện xoay chiều','Este và chất béo'];
export function makeSampleState(){
 const documents=titles.map((title,i)=>({id:`D${i+1}`,title,subject:subjects[i%3],pageCount:[4,3,3,4,3,3][i],dueDate:`2026-11-${[13,12,15,16,12,11][i]}`,status:['in_progress','not_started','in_progress','not_started','completed','completed'][i],lastPage:i===0?2:1,createdAt:'2026-11-09T08:00:00+07:00',lastOpenedAt:['2026-11-13T08:45:00+07:00',null,'2026-11-12T19:00:00+07:00',null,'2026-11-11T17:00:00+07:00','2026-11-10T16:00:00+07:00'][i],completedAt:i>=4?`2026-11-${i===4?'11':'10'}T16:00:00+07:00`:null,sample:true,pdfUrl:`/assets/documents/study-d${i+1}.pdf`,previewUrl:`/assets/previews/document-preview-d${i+1}.png`}));
 const details=[
 ['Điều kiện của hàm phân thức','D1',2,'Bỏ sót điều kiện mẫu khác không.','Nhận nghiệm làm mẫu bằng không.','Ghi điều kiện xác định trước, rồi loại nghiệm không hợp lệ.'],
 ['Dấu của đạo hàm','D1',3,'Nhầm dấu khi đi qua nghiệm của đạo hàm.','Kết luận cực trị chỉ từ nghiệm đạo hàm.','Xét dấu đạo hàm trên từng khoảng rồi lập bảng biến thiên.'],
 ['Chọn pha ban đầu','D2',1,'Chọn nghiệm pha chỉ theo li độ.','Bỏ qua chiều chuyển động tại thời điểm ban đầu.','Dùng li độ và dấu vận tốc để chọn đúng nghiệm pha.'],
 ['Đơn vị của hằng số cân bằng','D3',2,'Không phân biệt quy ước nồng độ và hoạt độ.','Gán đơn vị cho hằng số nhiệt động.','Viết biểu thức trước, kiểm tra quy ước mà bài tập đang dùng.'],
 ['Giá trị hiệu dụng','D5',2,'Dùng biên độ thay giá trị hiệu dụng.','Tính công suất bằng bình phương biên độ.','Đổi U₀ sang U = U₀/√2 rồi tính công suất.'],
 ['Bảo toàn khối lượng','D6',1,'Bỏ sót khối lượng NaOH tham gia.','Chỉ so sánh este với muối.','Cộng khối lượng các chất phản ứng rồi trừ khối lượng muối.']
 ];
 const problems=details.map(([title,documentId,sourcePage,reason,trap,method],i)=>({id:`P${i+1}`,title,documentId,sourcePage,subject:documents.find(d=>d.id===documentId).subject,reason,trap,method,status:i<4?'review':'mastered',updatedAt:`2026-11-${13-Math.floor(i/2)}T08:00:00+07:00`,sample:true,imageUrl:`/assets/problems/problem-crop-p${i+1}.png`,cropRect:{x:48/595,y:160/842,width:499/595,height:180/842}}));
 const notes=[{documentId:'D1',strategy:'Kiểm tra điều kiện xác định trước khi lập bảng biến thiên',traps:'Không nhận nghiệm làm mẫu bằng không.',method:'Ghi tập xác định, tính đạo hàm, xét dấu và đối chiếu điều kiện.',updatedAt:'2026-11-13T08:40:00+07:00'},{documentId:'D3',strategy:'Đổi về cùng đơn vị nồng độ trước khi thay số',traps:'Phân biệt nồng độ cân bằng và nồng độ ban đầu.',method:'Viết phương trình phản ứng và biểu thức Kc trước khi tính.',updatedAt:'2026-11-12T19:00:00+07:00'}];
 const state={documents,problems,notes,version:1};migrateTypes(state);assertState(state,true);return state;
}
export function localDate(){return new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export const dateFor=d=>d.sample?SAMPLE_DATE:localDate();
export const overdue=d=>d.status!=='completed'&&Boolean(d.dueDate)&&d.dueDate<dateFor(d);
export const dueToday=d=>d.status!=='completed'&&d.dueDate===dateFor(d);
export function stats(state){return {overdue:state.documents.filter(overdue).length,today:state.documents.filter(dueToday).length,doing:state.documents.filter(d=>d.status==='in_progress').length,review:state.problems.filter(p=>p.status==='review').length,completed:state.documents.filter(d=>d.status==='completed').length};}
export const normalized=s=>String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/g,'d').toLowerCase();
export function filterRecords(records,params,{problems=false}={}){
 const q=normalized(params.get('q'));let result=records.filter(r=>(!q||normalized(r.title).includes(q))&&(!params.get('subject')||r.subject===params.get('subject'))&&(!params.get('status')||r.status===params.get('status'))&&(!params.get('type')||(params.get('type')==='unclassified'?!(r.typeIds||[]).length:(r.typeIds||[]).includes(params.get('type')))));
 if(!problems){const deadline=params.get('deadline');result=result.filter(d=>!deadline||(deadline==='overdue'?overdue(d):deadline==='today'?dueToday(d):deadline==='attention'?overdue(d)||dueToday(d):true));}
 const sort=params.get('sort')|| (problems?'recent':'deadline');result.sort((a,b)=>sort==='title'?a.title.localeCompare(b.title,'vi'):sort==='recent'?(b.updatedAt||b.lastOpenedAt||b.createdAt||'').localeCompare(a.updatedAt||a.lastOpenedAt||a.createdAt||''):Number(a.status==='completed')-Number(b.status==='completed')||(a.dueDate||'9999').localeCompare(b.dueDate||'9999')||a.title.localeCompare(b.title,'vi'));
 return result;
}
export function assertState(state,sample=false){
 const ids=new Set(state.documents.map(d=>d.id));
 console.assert([...state.documents,...state.problems].every(r=>new Set(r.typeIds||[]).size===(r.typeIds||[]).length&&(r.typeIds||[]).every(id=>(state.types||[]).some(t=>t.id===id&&t.subject===r.subject))),'Type IDs must be unique and match their subject');
 console.assert(ids.size===state.documents.length,'Document IDs must be unique');
 console.assert(new Set(state.problems.map(p=>p.id)).size===state.problems.length,'Problem IDs must be unique');
 console.assert(state.problems.every(p=>!p.documentId||(ids.has(p.documentId)&&(!p.sourcePage||p.sourcePage<=state.documents.find(d=>d.id===p.documentId).pageCount))),'Problem source must exist');
 console.assert(state.notes.every(n=>ids.has(n.documentId)),'Note source must exist');
 console.assert(state.documents.every(d=>d.pageCount>0&&d.lastPage>=1&&d.lastPage<=d.pageCount),'Page bounds');
 console.assert(state.problems.every(p=>!p.cropRect||(p.cropRect.width>0&&p.cropRect.height>0&&p.cropRect.x>=0&&p.cropRect.y>=0&&p.cropRect.x+p.cropRect.width<=1.001&&p.cropRect.y+p.cropRect.height<=1.001)),'Crop bounds');
 if(sample){const s=stats(state);console.assert(state.documents.length===6&&state.documents.reduce((a,d)=>a+d.pageCount,0)===20,'Sample document totals');console.assert(subjects.every(subject=>state.documents.filter(d=>d.subject===subject).length===2),'Two documents per subject');console.assert(s.overdue===1&&s.today===1&&s.doing===2&&s.completed===2&&s.review===4,'Sample queue totals');console.assert(state.problems.length===6&&state.notes.length===2&&state.problems.filter(p=>p.status==='mastered').length===2,'Sample learning totals');}
}

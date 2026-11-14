// Subject-scoped metadata, added without replacing documents, notes or file blobs.
export const sampleTypes=[['math-domain','Toán','Điều kiện xác định'],['math-derivative','Toán','Xét dấu đạo hàm'],['physics-phase','Vật lý','Pha ban đầu'],['physics-energy','Vật lý','Năng lượng dao động'],['chem-equilibrium','Hóa học','Hằng số cân bằng'],['chem-shift','Hóa học','Chuyển dịch cân bằng'],['math-primitive','Toán','Nguyên hàm'],['math-substitution','Toán','Đổi biến tích phân'],['physics-rms','Vật lý','Giá trị hiệu dụng'],['physics-resonance','Vật lý','Cộng hưởng điện'],['chem-mass','Hóa học','Bảo toàn khối lượng'],['chem-soap','Hóa học','Xà phòng hóa']].map(([id,subject,label])=>({id,subject,label}));
const documentNames=['Ứng dụng đạo hàm','Dao động cơ','Cân bằng hóa học','Tích phân cơ bản','Điện xoay chiều','Este và chất béo'];
const problemNames=['Điều kiện của hàm phân thức','Dấu của đạo hàm','Chọn pha ban đầu','Đơn vị của hằng số cân bằng','Giá trị hiệu dụng','Bảo toàn khối lượng'];
const problemTypes=[0,1,2,4,8,10];
export const cleanLabel=value=>String(value||'').normalize('NFC').trim().replace(/\s+/g,' ');
export const labelKey=value=>cleanLabel(value).toLocaleLowerCase('vi');
export function migrateTypes(state){
 state.types??=[];
 for(const [kind,names] of [['documents',documentNames],['problems',problemNames]])for(const record of state[kind]){
  if(Object.hasOwn(record,'typeIds'))continue;
  const index=names.indexOf(record.title),isDocument=kind==='documents';
  const matched=index>=0&&record.sample===true&&record.id===`${isDocument?'D':'P'}${index+1}`&&(isDocument?record.pdfUrl===`/assets/documents/study-d${index+1}.pdf`&&record.pageCount===[4,3,3,4,3,3][index]:record.documentId===['D1','D1','D2','D3','D5','D6'][index]&&record.sourcePage===[2,3,1,2,2,1][index]&&record.imageUrl===`/assets/problems/problem-crop-p${index+1}.png`);
  const selected=matched?(isDocument?sampleTypes.slice(index*2,index*2+2):[sampleTypes[problemTypes[index]]]).filter(t=>t.subject===record.subject):[];
  record.typeIds=selected.map(t=>t.id);
  for(const type of selected)if(!state.types.some(t=>t.id===type.id))state.types.push({...type});
 }
 state.version=2;return state;
}
export function usedTypes(state,problems,subject=''){
 const used=new Set(state[problems?'problems':'documents'].filter(r=>!subject||r.subject===subject).flatMap(r=>r.typeIds||[]));
 return (state.types||[]).filter(t=>used.has(t.id)&&(!subject||t.subject===subject)).sort((a,b)=>a.label.localeCompare(b.label,'vi'));
}
export const conditionKeys=problems=>problems?['subject','type','status']:['subject','type','status','deadline'];
export const conditionCount=(params,problems=false)=>conditionKeys(problems).filter(k=>params.get(k)).length;

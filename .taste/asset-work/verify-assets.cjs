const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const source = JSON.parse(fs.readFileSync('.taste/asset-work/study-sources.json','utf8'));
const evidence = {createdFor:'Manage illustrative study documents',font:{reference:'https://github.com/google/fonts/tree/main/ofl/instrumentsans',download:'https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentsans/InstrumentSans%5Bwdth,wght%5D.ttf',contentType:'application/octet-stream',licensePath:'public/assets/fonts/OFL-InstrumentSans.txt',magic:'00010000',axes:{wdth:[75,100],wght:[400,700]},usedWeights:[400,500,600],hasTnumFeature:true},files:[],inspection:{pdfEngine:'Windows.Data.Pdf.PdfDocument',pagesRendered:20,pageCounts:[4,3,3,4,3,3],visualReview:'All 20 pages reviewed on a contact sheet; all six crops reviewed together, with P4 and D1 preview inspected at larger size. No overlap, missing glyphs, or clipped question content observed.',authoring:'Chrome headless printed original HTML worksheets, not interface screenshots.',originalContent:true}};
for (const d of source.documents) {
 const pdfPath=`public/assets/documents/study-${d.id}.pdf`;
 const pdf=fs.readFileSync(pdfPath);if(pdf.subarray(0,5).toString()!=='%PDF-')throw Error('Not PDF');
 const descriptor={id:`study-pdf-${d.id}`,documentId:d.id.toUpperCase(),title:d.title,subject:d.subject,pageCount:d.pages.length,mimeType:'application/pdf',pdfUrl:`/assets/documents/study-${d.id}.pdf`,sample:true,notice:'Dữ liệu mẫu',sourceHtml:`.taste/asset-work/study-${d.id}.html`,provenance:'Original illustrative educational content created for Manage in this task. No institution affiliation or external exam source.',sha256:crypto.createHash('sha256').update(pdf).digest('hex'),problemCrops:source.problems.filter(p=>p.documentId===d.id).map(p=>({id:`problem-crop-${p.id}`,sourcePage:p.page,imageUrl:`/assets/problems/problem-crop-${p.id}.png`,cropRect:{x:48/595,y:160/842,width:499/595,height:180/842},renderSize:{width:1785,height:2526},pixelRect:{x:144,y:480,width:1497,height:540}}))};
 fs.writeFileSync(`public/assets/documents/study-${d.id}.json`,JSON.stringify(descriptor,null,2));
}
for(const folder of ['documents','previews','problems','fonts'])for(const name of fs.readdirSync(`public/assets/${folder}`)){
 const dest=`public/assets/${folder}/${name}`, b=fs.readFileSync(dest);const e={path:dest,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};
 if(name.endsWith('.png')){if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG');e.width=b.readUInt32BE(16);e.height=b.readUInt32BE(20);e.pixels=e.width*e.height;if(e.pixels<700000||e.pixels>16000000||Math.min(e.width,e.height)<360||Math.max(e.width,e.height)<960||b.length>32000000)throw Error('Image constraints failed');}
 if(name.endsWith('.json'))JSON.parse(b.toString());
 evidence.files.push(e);
}
const page=JSON.parse(fs.readFileSync('.taste/page.json','utf8'));
evidence.assetConsumers={};for(const s of page.sections)for(const id of s.assetNeeds)evidence.assetConsumers[id]=[...(evidence.assetConsumers[id]||[]),s.id];
evidence.fontConsumers=page.sections.map(s=>s.id);
if(Object.keys(evidence.assetConsumers).length!==18)throw Error('Unexpected asset need count');
fs.writeFileSync('.taste/asset-work/provenance-verification.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify({neededIds:Object.keys(evidence.assetConsumers).length,files:evidence.files.length,pdfCount:source.documents.length,pageCount:source.documents.reduce((s,d)=>s+d.pages.length,0),rasterFiles:evidence.files.filter(f=>f.width).length,fontConsumers:evidence.fontConsumers},null,2));

// PDF points use 72/in; CSS pixels use 96/in. DPR affects only backing pixels.
export const CSS_PER_POINT=96/72;
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
// Only reader display preferences migrate. Learning records and file blobs stay untouched.
export function readerPreferences(value){
 const saved=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const current=saved.version===2;
 return {...saved,version:2,mode:current&&['page','width','custom'].includes(saved.mode)?saved.mode:'page',percent:clamp(Number(saved.percent)||100,25,400),notes:!!saved.notes,focus:!!saved.focus,notesWidth:saved.notesWidth||null,anchors:current&&saved.anchors&&typeof saved.anchors==='object'?saved.anchors:{}};
}
export function pageScale({width,height,availableWidth,availableHeight,mode,percent}){
 const naturalWidth=width*CSS_PER_POINT,naturalHeight=height*CSS_PER_POINT;
 const scale=mode==='custom'?clamp(percent,25,400)/100:mode==='page'?Math.min(availableWidth/naturalWidth,availableHeight/naturalHeight):availableWidth/naturalWidth;
 return {scale:scale*CSS_PER_POINT,percent:scale*100,width:naturalWidth*scale,height:naturalHeight*scale};
}
export function pageNumber(value,total,fallback=1){const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=total?n:clamp(fallback,1,total);}

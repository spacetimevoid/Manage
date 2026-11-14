// Bounded browser regression using intercepted local build files, no HTTP server.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const output='.taste/repair-check';await fs.mkdir(output,{recursive:true});
const profile=path.resolve(output,`chrome-${Date.now()}`);
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const origin='http://127.0.0.1:56789';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json','.json':'application/json','.pdf':'application/pdf'};
let socket;const errors=[],results=[];
try{
 let port;for(let i=0;i<70;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await delay(100);}}
 if(!port)throw Error('Chrome did not launch');
 const target=await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'}).then(r=>r.json());
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let id=0;const pending=new Map();const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
 socket.addEventListener('message',async event=>{const msg=JSON.parse(event.data);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p?.reject(Error(JSON.stringify(msg.error))):p?.resolve(msg.result);return;}
  if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text);
  if(msg.method==='Runtime.consoleAPICalled'&&['error','assert'].includes(msg.params.type))errors.push(msg.params.args.map(x=>x.value||x.description).join(' '));
  if(msg.method==='Fetch.requestPaused'){const request=msg.params;try{const url=new URL(request.request.url);const relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));const file=path.resolve('dist',relative);if(!file.startsWith(path.resolve('dist')+path.sep))throw Error('Path outside build');const body=await fs.readFile(file);await send('Fetch.fulfillRequest',{requestId:request.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:mime[path.extname(file)]||'application/octet-stream'}],body:body.toString('base64')});}catch{await send('Fetch.fulfillRequest',{requestId:request.requestId,responseCode:404,body:''});}}
 });
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 const wait=async expression=>{for(let i=0;i<80;i++){if(await evaluate(expression))return;await delay(100);}throw Error('Timeout: '+expression);};
 await send('Page.enable');await send('Runtime.enable');await send('Fetch.enable',{patterns:[{urlPattern:origin+'/*',requestStage:'Request'}]});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`if('serviceWorker'in navigator)navigator.serviceWorker.register=()=>Promise.reject(new Error('Service worker excluded from intercepted local regression'));`});
 for(const width of [390,1440,640,768,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:width<=640?844:900,deviceScaleFactor:1,mobile:width<=640});
  await send('Page.navigate',{url:origin+'/#/home'});await wait(`window.__manage?.getPhase().phase==='ready'`);await evaluate('document.fonts.ready');await delay(150);
  const result=await evaluate(`(()=>{const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[inert]');return {width:innerWidth,h1:document.querySelectorAll('h1').length,resume:rect('.resume'),counts:rect('.count-grid'),deadlines:rect('.home-deadlines'),problems:rect('.home-problems'),notes:rect('.home-notes'),summaryBeforeCountsInDOM:!!(document.querySelector('.resume').compareDocumentPosition(document.querySelector('.count-grid'))&Node.DOCUMENT_POSITION_FOLLOWING),smallTargets:[...document.querySelectorAll('a,button,input,select,textarea')].filter(visible).map(e=>({label:e.getAttribute('aria-label')||e.textContent,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})).filter(r=>r.width<43.9||r.height<43.9),overflow:document.documentElement.scrollWidth>innerWidth,stats:window.__manage.stats()};})()`);
  results.push(result);if(result.h1!==1||result.overflow||result.smallTargets.length)throw Error('DOM audit failed at '+width);
  if(width<=640&&!(result.resume.bottom<=result.counts.y&&result.summaryBeforeCountsInDOM))throw Error('Resume must precede counts on compact');
  if(width===1440&&!(Math.abs(result.deadlines.y-398.1875)<1&&result.counts.bottom<=result.resume.y&&Math.abs(result.resume.y-result.deadlines.y)<1&&Math.abs(result.resume.bottom-result.deadlines.bottom)<1&&Math.abs(result.problems.bottom-result.notes.bottom)<1&&Math.abs(result.resume.width-263)<1&&Math.abs(result.deadlines.width-821)<1))throw Error('Desktop composition changed');
  const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(`${output}/${width}.png`,Buffer.from(screenshot.data,'base64'));
 }
 await evaluate(`document.querySelector('.resume a').click()`);await wait(`location.hash.startsWith('#/study/D1')`);results.push({resumeAction:'Opens D1 study route'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log(JSON.stringify({status:'passed',widths:[390,1440,640,768],assertionErrors:errors,compactResumeBeforeCounts:true,desktopCompositionPreserved:true},null,2));
}catch(error){process.exitCode=1;errors.push(error.stack);console.error(error.stack);}
finally{await fs.writeFile(`${output}/report.json`,JSON.stringify({results,errors},null,2));socket?.close();chrome.kill();}

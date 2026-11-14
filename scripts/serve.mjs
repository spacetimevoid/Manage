import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
export function createServer({dist=false}={}) {
 return http.createServer(async(req,res)=>{
  try {
   const url=new URL(req.url,'http://localhost'); let requested=decodeURIComponent(url.pathname); if(requested==='/')requested='/index.html';
   const base=dist?path.join(root,'dist'):(requested.startsWith('/src/')||requested==='/index.html'?root:path.join(root,'public'));
   const full=path.resolve(base,'.'+requested);
   if(!full.startsWith(base+path.sep)||requested.includes('/.')){res.writeHead(403);return res.end('Forbidden');}
   const data=await fs.readFile(full);res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Không tìm thấy tệp.');}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const portArg=process.argv.indexOf('--port');const port=Number(portArg>=0?process.argv[portArg+1]:process.env.PORT||5173);
 createServer({dist:process.argv.includes('--dist')}).listen(port,'0.0.0.0',()=>console.log(`Manage: http://localhost:${port}`));
}

import fs from 'node:fs/promises';
await fs.mkdir('dist',{recursive:true});
await fs.copyFile('index.html','dist/index.html');
await fs.cp('src','dist/src',{recursive:true});
await fs.cp('public','dist',{recursive:true});
console.log('Build complete: dist (static, local fonts, PDF.js and assets).');

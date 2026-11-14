import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const files=['src/app.js','src/reader.js','src/reader-geometry.js','src/data.js','src/types.js','src/storage.js','src/supabase.js','src/charts.js','public/sw.js','scripts/serve.mjs','scripts/build.mjs'];
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
for(const file of ['package.json','public/manifest.webmanifest'])JSON.parse(await fs.readFile(file,'utf8'));
const html=await fs.readFile('index.html','utf8');if(html.includes('.taste/'))throw Error('Site depends on working folder');
const css=await fs.readFile('src/styles.css','utf8');const outside=css.replace(/:root\{[^}]*\}/g,'').replace(/@font-face\{[^}]*\}/g,'');if(/#[0-9a-f]{3,8}\b|(?:font-size|border-radius|font-family)\s*:\s*(?!var\()[^;}]+/i.test(outside))throw Error('Literal design value outside tokens');
for(const file of ['src/kit.css','src/charts.js'])if(!(await fs.readFile(file,'utf8')).startsWith('/* tasteskill v2.5'))throw Error('Missing kit license');
const assets=JSON.parse(await fs.readFile('.taste/assets.json','utf8'));for(const asset of assets.assets){if(asset.status!=='ready'&&asset.status!=='existing')throw Error('Unresolved asset '+asset.id);await fs.access(asset.destination);}
console.log('Syntax, JSON, token-only additions, copied kit licenses and all asset destinations: PASS');

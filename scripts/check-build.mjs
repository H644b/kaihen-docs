import {readFile,readdir,stat,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';

const root=path.resolve('dist');
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
const files=await walk(root);
const htmlFiles=files.filter(p=>p.endsWith('.html'));
const pages=new Map();
for(const file of htmlFiles){const text=await readFile(file,'utf8');pages.set(file,{ids:new Set([...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])),links:[...text.matchAll(/\bhref="([^"]+)"/g)].map(m=>m[1])});}
const issues=[];
for(const [file,page]of pages){
 for(const href of page.links){
  if(/^[a-z][a-z0-9+.-]*:|^\/\//i.test(href))continue;
  const url=new URL(href,'https://site.invalid/'+path.relative(root,file));
  let destination=url.pathname==='/'?path.join(root,'index.html'):path.join(root,decodeURIComponent(url.pathname));
  try{if((await stat(destination)).isDirectory())destination=path.join(destination,'index.html');}catch{issues.push({file:path.relative(root,file),href,error:'missing file'});continue;}
  if(url.hash&&pages.has(destination)&&!pages.get(destination).ids.has(decodeURIComponent(url.hash.slice(1))))issues.push({file:path.relative(root,file),href,error:'missing anchor'});
 }
}
const archive=unzipSync(await readFile('dist/downloads/kaihen-docs-2026-11-14.zip'));
assert.equal(Object.keys(archive).filter(name=>name.startsWith('guides/')).length,16);
for(const[name,bytes]of Object.entries(archive)){
 const text=strFromU8(bytes);
 assert.ok(!/\/Users\/[^\s/]+/.test(text),`${name} contains a private filesystem path`);
 assert.ok(!text.includes('library-file:')&&!text.includes('chatgpt.com/space/page_'),`${name} contains a private Page reference`);
}
const report={htmlPages:htmlFiles.length,internalLinkIssues:issues,archiveFiles:Object.keys(archive).length,archiveBytes:(await stat('dist/downloads/kaihen-docs-2026-11-14.zip')).size};
await mkdir('evidence',{recursive:true});
await writeFile('evidence/content-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
assert.equal(issues.length,0,'Internal links must resolve to built files and anchors');

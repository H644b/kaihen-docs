import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { zipSync, strToU8 } from 'fflate';

const source = new URL('../content/research/', import.meta.url);
const destination = new URL('../src/generated/', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
await mkdir(destination, { recursive: true });
await mkdir(new URL('docs/', publicDir), { recursive: true });

const definitions = [
 ['01-platform-and-compatibility.md','overview','Platform overview','Start here','Scope, compatibility and the development stack.'],
 ['03-toolchain-and-builds.md','toolchain','Set up the toolchain','Start here','Install choices, build rules, linking and reproducible builds.'],
 ['04-first-application-and-lifecycle.md','first-application','Build your first app','Start here','A native diagnostic, controller input and a clean return to hbmenu.'],
 ['02-runtime-and-abi.md','runtime','Runtime and ABI','Development','Processes, service ownership, loader behavior and protocol boundaries.'],
 ['05-graphics-and-user-interfaces.md','graphics','Graphics and UI','Development','Vulkan, EGL, OpenGL ES, resolution and presentation.'],
 ['06-input-and-Joy-Con-pointers.md','input','Controllers and pointers','Development','PadState, touch and Joy-Con mouse input.'],
 ['07-files-network-audio-and-video.md','io-and-media','Files, network and media','Development','Storage, sockets, audio and hardware video decoding.'],
 ['08-JIT-emulation-and-languages.md','jit','JIT and language runtimes','Development','Code publication, emulation, memory and cache synchronization.'],
 ['09-plugins-IPC-and-services.md','plugins','Plugins and IPC','Development','Resident NSOs, service discovery and command design.'],
 ['10-porting-frameworks-and-case-studies.md','porting','Port an existing app','Shipping','Dependencies, framework choices and concrete porting examples.'],
 ['11-debugging-performance-and-testing.md','debugging','Debugging and testing','Shipping','Failure diagnosis, profiling and meaningful verification.'],
 ['12-packaging-distribution-and-roadmap.md','distribution','Package and release','Shipping','Metadata, artifacts, dependency licenses and release gates.'],
 ['13-sources-evidence-and-open-questions.md','sources','Sources and evidence','Reference','Pinned source catalog, checked artifacts and open questions.'],
];
const oldToSlug = Object.fromEntries(definitions.map(([filename,slug])=>[filename,slug]));
function slugify(value) { return value.toLowerCase().replace(/<[^>]*>/g,'').replace(/[`*]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/[\s]+/g,'-').replace(/-+/g,'-'); }
function plain(value) { return value.replace(/```[\s\S]*?```/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/\S+/g,' ').replace(/[#*`>|]/g,' ').replace(/\s+/g,' ').trim(); }
function processMarkdown(markdown) {
 return markdown.replace(/\]\(([^)]+\.md)\)/g, (full,target)=>oldToSlug[target]?`](/docs/${oldToSlug[target]}/)`:full)
 .replace(/\/Users\/[^\s)`]+/g,'[local path omitted]')
 .replace(/Saved Page content is read back for structural verification; visual Page layout and Mermaid rendering have not been independently verified\./g,'This publication preserves the original research scope; site behavior is verified separately from console behavior.')
 .replace(/Saved Page content is read back[^\n]+/g,'')
 .replace('A build manifest template is included in the local research pack.','Use the downloadable [build record template](/downloads/application-build-record.json) and [hardware test record](/downloads/hardware-test-record.md) to preserve the exact environment and results.');
}
const docs=[];
for(const [filename,slug,title,group,description] of definitions) {
 let markdown=processMarkdown(await readFile(new URL(filename,source),'utf8'));
 if(slug==='sources')markdown=markdown.replace('## Local validation outcome','Download the [verification record](/downloads/verification.json) for archive digests and the local host-test outcomes. The [documentation archive](/downloads/kaihen-docs-2026-11-14.zip) includes blank build and hardware-test templates.\n\n## Local validation outcome');
 docs.push({slug,title,group,description,markdown,sourceFile:filename,researchDate:'2026-11-13',publishedDate:'2026-11-14'});
}
for(const slug of ['quickstart','api-reference','mcp']) {
 const file=new URL(`../content/${slug}.md`,import.meta.url);
 try {
 const text=await readFile(file,'utf8');
 const meta={quickstart:['Quickstart','Start here','The shortest path from a clean build to your first native NRO.'],'api-reference':['kaiHEN API reference','Reference','Function signatures, ownership rules, protocol values and failure handling.'],mcp:['MCP integration','Reference','Connect a client to the read-only documentation endpoint.']}[slug];
 docs.push({slug,title:meta[0],group:meta[1],description:meta[2],markdown:processMarkdown(text),sourceFile:`content/${slug}.md`,researchDate:'2026-11-13',publishedDate:'2026-11-14'});
 } catch(e) { if(e.code!=='ENOENT')throw e; }
}
for(const doc of docs) {
 const seen=new Map();
 doc.headings=[];doc.sections=[];
 let fence=false,current={heading:doc.title,anchor:'',lines:[]};
 for(const line of doc.markdown.split('\n')) {
  if(line.startsWith('```'))fence=!fence;
  const match=!fence&&line.match(/^(#{2,3})\s+(.+)$/);
  if(match) {
   if(current.lines.length)doc.sections.push({...current,markdown:current.lines.join('\n'),text:plain(current.lines.join('\n'))});
   const base=slugify(match[2]),count=seen.get(base)||0;seen.set(base,count+1);
   const anchor=count?`${base}-${count}`:base;
   doc.headings.push({depth:match[1].length,text:match[2],slug:anchor});
   current={heading:match[2],anchor,lines:[line]};
  } else current.lines.push(line);
 }
 if(current.lines.length)doc.sections.push({...current,markdown:current.lines.join('\n'),text:plain(current.lines.join('\n'))});
 doc.sections=doc.sections.map(({lines,...section})=>section);
 doc.readingMinutes=Math.max(2,Math.ceil(plain(doc.markdown).split(' ').length/210));
 doc.sources=[...new Set([...doc.markdown.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(m=>m[1]).filter(url=>new URL(url).hostname!=='kaihen.timsfun.com'))];
 doc.url=`https://kaihen.timsfun.com/docs/${doc.slug}/`;
 await writeFile(new URL(`docs/${doc.slug}.md`,publicDir),doc.markdown);
}
const checksum=createHash('sha256').update(docs.map(d=>d.markdown).join('\n')).digest('hex');
await writeFile(new URL('docs.json',destination),JSON.stringify({version:'1.0.0',publishedDate:'2026-11-14',researchDate:'2026-11-13',checksum,docs}));
await writeFile(new URL('search-index.json',publicDir),JSON.stringify(docs.map(({slug,title,group,description,sections})=>({slug,title,group,description,sections:sections.map(({heading,anchor,text})=>({heading,anchor,text}))}))));
await writeFile(new URL('llms.txt',publicDir),'# kaiHEN Docs\n\nNative Switch 2 homebrew development with kaiHEN, libounce, OunceVK and ounce-devkit.\n\nResearch snapshot: November 13, 2026. Source claims are not universal hardware verification.\n\nMCP endpoint: https://kaihen.timsfun.com/mcp\nFull reference: https://kaihen.timsfun.com/llms-full.txt\n\n## Guides\n\n'+docs.map(d=>`- [${d.title}](${d.url}): ${d.description} Raw Markdown: https://kaihen.timsfun.com/docs/${d.slug}.md`).join('\n')+'\n');
await writeFile(new URL('llms-full.txt',publicDir),docs.map(d=>`<!-- ${d.url} -->\n\n${d.markdown}`).join('\n\n---\n\n'));
await writeFile(new URL('sitemap.xml',publicDir),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['https://kaihen.timsfun.com/',...docs.map(d=>d.url)].map(url=>`<url><loc>${url}</loc></url>`).join('')+'</urlset>');
await mkdir(new URL('downloads/',publicDir),{recursive:true});
const archive={};
for(const doc of docs)archive[`guides/${doc.slug}.md`]=strToU8(doc.markdown);
for(const name of ['application-build-record.json','hardware-test-record.md']){
 const text=await readFile(new URL(`../content/templates/${name}`,import.meta.url),'utf8');
 await writeFile(new URL(`downloads/${name}`,publicDir),text);
 archive[`templates/${name}`]=strToU8(text);
}
const sourceRegister=JSON.parse(await readFile(new URL('../content/research/source-register.json',import.meta.url),'utf8'));
archive['source-register.json']=strToU8(JSON.stringify(sourceRegister,null,2));
const verificationText=(await readFile(new URL('../content/research/verification.json',import.meta.url),'utf8')).replace(/\/Users\/[^\s"\\]+/g,'<workspace>');
await writeFile(new URL('downloads/verification.json',publicDir),verificationText);
archive['verification.json']=strToU8(verificationText);
archive['publication.json']=strToU8(JSON.stringify({version:'1.0.0',researchDate:'2026-11-13',publishedDate:'2026-11-14',url:'https://kaihen.timsfun.com',checksum,documents:docs.map(({slug,title,url})=>({slug,title,url}))},null,2));
archive['README.txt']=strToU8('kaiHEN developer documentation\n\nPublished at https://kaihen.timsfun.com\nResearch snapshot: November 13, 2026. Publication: November 14, 2026.\n\nGuides preserve their source citations and verification scope. The templates are blank records for future development. No credentials, local device records or upstream binaries are included.\n');
await writeFile(new URL('downloads/kaihen-docs-2026-11-14.zip',publicDir),zipSync(archive,{level:6}));
console.log(`Prepared ${docs.length} documents; content ${checksum.slice(0,12)}`);

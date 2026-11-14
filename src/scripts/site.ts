import {searchDocuments,type SearchDoc,tokens} from '../lib/search';

const dialog=document.querySelector<HTMLDialogElement>('#search-dialog')!;
const searchInput=document.querySelector<HTMLInputElement>('#docs-search')!;
const results=document.querySelector<HTMLElement>('#search-results')!;
let index:SearchDoc[]|null=null;
let pending:Promise<SearchDoc[]>|null=null;
let sequence=0;
const initialResults=results.innerHTML;

async function loadIndex(){
  if(index)return index;
  if(!pending)pending=fetch('/search-index.json').then(async response=>{
    if(!response.ok)throw new Error('Documentation search could not load.');
    index=await response.json();return index!;
  }).catch(error=>{pending=null;throw error;});
  return pending;
}
function message(text:string){const p=document.createElement('p');p.className='search-empty';p.textContent=text;results.replaceChildren(p);}
function highlight(parent:HTMLElement,text:string,query:string){
  const words=tokens(query).sort((a,b)=>b.length-a.length);
  if(!words.length){parent.textContent=text;return;}
  const escaped=words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  const expression=new RegExp(`(${escaped})`,'ig');
  let offset=0;
  for(const match of text.matchAll(expression)){
    parent.append(document.createTextNode(text.slice(offset,match.index)));
    const mark=document.createElement('mark');mark.textContent=match[0];parent.append(mark);
    offset=match.index!+match[0].length;
  }
  parent.append(document.createTextNode(text.slice(offset)));
}
async function runSearch(){
  const run=++sequence;
  const query=searchInput.value.trim();
  if(!query){results.innerHTML=initialResults;return;}
  if(!index)message('Loading the documentation index…');
  try {
    const docs=await loadIndex();
    if(run!==sequence)return;
    const matches=searchDocuments(docs,query,8);
    if(!matches.length){message(`No results for “${query}”. Try a subsystem such as graphics, input, JIT, or plugins.`);return;}
    const fragment=document.createDocumentFragment();
    for(const item of matches){
      const link=document.createElement('a');link.href=item.url;link.className='search-result';
      const label=document.createElement('small');label.textContent=item.title;
      const heading=document.createElement('strong');highlight(heading,item.section,query);
      const excerpt=document.createElement('p');highlight(excerpt,item.snippet,query);
      link.append(label,heading,excerpt);fragment.append(link);
    }
    results.replaceChildren(fragment);
  } catch {if(run===sequence)message('Search could not load. Close this panel and use the chapter index, or try again.');}
}
function openSearch(){if(!dialog.open)dialog.showModal();searchInput.focus();void loadIndex().catch(()=>{});}
function activateSearchResult(link:HTMLAnchorElement){
  const destination=new URL(link.href);
  dialog.close();
  if(destination.origin===location.origin&&destination.pathname===location.pathname&&destination.search===location.search&&destination.hash){
    const heading=document.getElementById(decodeURIComponent(destination.hash.slice(1)));
    if(heading){
      location.hash=destination.hash;
      heading.tabIndex=-1;
      heading.focus({preventScroll:true});
      heading.scrollIntoView({block:'start'});
      return;
    }
  }
  location.assign(destination.href);
}
document.querySelector('.search-trigger')?.addEventListener('click',openSearch);
document.querySelector('.close-search')?.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();const e=event as MouseEvent;if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
results.addEventListener('click',event=>{
  const link=(event.target as HTMLElement).closest<HTMLAnchorElement>('.search-result');
  if(link){
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0){dialog.close();return;}
    event.preventDefault();activateSearchResult(link);return;
  }
  const target=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-query]');
  if(target){searchInput.value=target.dataset.query!;void runSearch();searchInput.focus();}
});
searchInput.addEventListener('input',()=>void runSearch());
searchInput.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();results.querySelector<HTMLAnchorElement>('.search-result')?.focus();}if(event.key==='Enter'){const first=results.querySelector<HTMLAnchorElement>('.search-result');if(first){event.preventDefault();first.click();}}});
results.addEventListener('keydown',event=>{
  if(event.key!=='ArrowDown'&&event.key!=='ArrowUp')return;
  const links=[...results.querySelectorAll<HTMLAnchorElement>('.search-result')];
  const current=links.indexOf(document.activeElement as HTMLAnchorElement);
  event.preventDefault();
  const next=current+(event.key==='ArrowDown'?1:-1);
  if(next<0)searchInput.focus();else links[Math.min(next,links.length-1)]?.focus();
});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch();}});

const themeToggle=document.querySelector<HTMLButtonElement>('#theme-toggle')!;
function updateThemeLabel(){themeToggle.setAttribute('aria-label',`Switch to ${document.documentElement.dataset.theme==='dark'?'light':'dark'} theme`);}
updateThemeLabel();
themeToggle.addEventListener('click',()=>{
  const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=theme;
  try{localStorage.setItem('kaihen-docs-theme',theme);}catch{}
  updateThemeLabel();
});
const status=document.querySelector<HTMLElement>('.copy-status')!;
async function copy(text:string,button:HTMLButtonElement){
  const span=button.querySelector('span');const initial=span?.textContent;
  try{await navigator.clipboard.writeText(text);if(span)span.textContent='Copied';status.textContent='Copied to clipboard.';setTimeout(()=>{if(span)span.textContent=initial||'Copy';},1800);}
  catch{status.textContent='Copy was unavailable. Select and copy the text manually.';if(span)span.textContent='Select to copy';}
}
document.querySelectorAll<HTMLButtonElement>('.copy-code').forEach(button=>button.addEventListener('click',()=>void copy(button.closest('.code-block')?.querySelector('pre code')?.textContent||'',button)));
document.querySelectorAll<HTMLButtonElement>('.copy-endpoint').forEach(button=>button.addEventListener('click',()=>void copy('https://kaihen.timsfun.com/mcp',button)));
document.querySelectorAll<HTMLButtonElement>('.copy-page').forEach(button=>button.addEventListener('click',async()=>{
  button.disabled=true;
  try{const response=await fetch(button.dataset.markdown!);if(!response.ok)throw new Error();await copy(await response.text(),button);}catch{status.textContent='The Markdown page could not be loaded. Use the View Markdown link.';}finally{button.disabled=false;}
}));

const tocLinks=[...document.querySelectorAll<HTMLAnchorElement>('[data-toc]')];
if(tocLinks.length){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){tocLinks.forEach(link=>{const active=link.dataset.toc===entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
  },{rootMargin:'-90px 0px -65% 0px'});
  tocLinks.forEach(link=>{const target=document.getElementById(link.dataset.toc!);if(target)observer.observe(target);});
}

const checkButton=document.querySelector<HTMLButtonElement>('#check-mcp');
const checkResult=document.querySelector<HTMLElement>('#mcp-check-result');
async function rpc(method:string,params:unknown,id:number){
  const response=await fetch('/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id,method,params})});
  if(!response.ok)throw new Error(`Endpoint returned HTTP ${response.status}.`);
  const text=await response.text();
  const body=text.trim().startsWith('{')?JSON.parse(text):JSON.parse(text.split('\n').find(line=>line.startsWith('data:'))?.slice(5)||'{}');
  if(body.error)throw new Error(body.error.message);
  return body.result;
}
checkButton?.addEventListener('click',async()=>{
  checkButton.disabled=true;checkButton.textContent='Checking…';
  try{
    const init=await rpc('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'kaihen-docs-browser',version:'1.0.0'}},1);
    const tools=await rpc('tools/list',{},2);
    checkResult!.dataset.error='false';
    checkResult!.textContent=`Connected to ${init.serverInfo.name}. ${tools.tools.length} read-only tools available; protocol ${init.protocolVersion}.`;
  }catch(error){checkResult!.dataset.error='true';checkResult!.textContent=`Connection check failed. ${(error as Error).message} Try again or use the raw Markdown links below.`;}
  finally{checkButton.disabled=false;checkButton.textContent='Test connection';}
});

if(document.querySelector('.mermaid')){
  void import('mermaid').then(async({default:mermaid})=>{
    mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:document.documentElement.dataset.theme==='dark'?'dark':'neutral',fontFamily:'-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',flowchart:{useMaxWidth:true,htmlLabels:false,curve:'linear'}});
    await mermaid.run({querySelector:'.mermaid'});
  }).catch(()=>{document.querySelectorAll('.diagram figcaption').forEach(node=>node.textContent='Diagram source is shown because the renderer could not load.');});
}

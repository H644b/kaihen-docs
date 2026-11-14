import { Marked } from 'marked';
import { createHighlighter } from 'shiki';
import { slugify } from './content';

const highlighter=await createHighlighter({
  themes:['github-light','github-dark'],
  langs:['c','cpp','shellscript','makefile','json','typescript','javascript','diff','toml'],
});
const aliases:Record<string,string>={sh:'shellscript',shell:'shellscript',bash:'shellscript',make:'makefile',js:'javascript',ts:'typescript','c++':'cpp'};
function escapeHtml(value:string){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

export async function renderMarkdown(source:string){
  const headings=new Map<string,number>();
  const markdown=new Marked({
    async:true,
    gfm:true,
    walkTokens:async(token:any)=>{
      if(token.type!=='code')return;
      const requested=(token.lang||'text').split(' ')[0];
      if(requested==='mermaid'){
        token.rendered=`<figure class="diagram"><pre class="mermaid">${escapeHtml(token.text)}</pre><figcaption>Runtime relationships. Follow the guide for ownership and lifetime details.</figcaption></figure>`;
        return;
      }
      const lang=aliases[requested]||requested;
      const supported=highlighter.getLoadedLanguages().includes(lang);
      const code=highlighter.codeToHtml(token.text,{lang:supported?lang:'text',themes:{light:'github-light',dark:'github-dark'}});
      token.rendered=`<div class="code-block"><div class="code-header"><span>${escapeHtml(requested==='text'?'Plain text':requested)}</span><button type="button" class="copy-code" aria-label="Copy ${escapeHtml(requested)} code"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h2"/></svg><span>Copy</span></button></div>${code}</div>`;
    },
    renderer:{
      code(token:any){return token.rendered||`<pre><code>${escapeHtml(token.text)}</code></pre>`;},
      heading({tokens,depth,text}){
        const base=slugify(text),count=headings.get(base)||0;
        headings.set(base,count+1);
        const id=count?`${base}-${count}`:base;
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}<a class="heading-link" href="#${id}" aria-label="Link to ${escapeHtml(text.replace(/`/g,''))}">#</a></h${depth}>`;
      },
      table(token){
        const cell=(c:any,tag:string)=>`<${tag}${c.align?` style="text-align:${c.align}"`:''}>${this.parser.parseInline(c.tokens)}</${tag}>`;
        return `<div class="table-scroll" role="region" aria-label="Reference table" tabindex="0"><table><thead><tr>${token.header.map(c=>cell(c,'th')).join('')}</tr></thead><tbody>${token.rows.map(row=>`<tr>${row.map(c=>cell(c,'td')).join('')}</tr>`).join('')}</tbody></table></div>`;
      },
    },
  });
  const body=source.replace(/^# [^\n]+\n/,'').trim();
  return await markdown.parse(body);
}

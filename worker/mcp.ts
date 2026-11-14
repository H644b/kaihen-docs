import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import corpus from '../src/generated/docs.json' with { type: 'json' };
import { searchDocuments, resolveDocumentId } from '../src/lib/search.ts';

const ORIGIN = 'https://kaihen.timsfun.com';
const readOnly = {readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false};

export function getDocument(id: string) {
  const resolved=resolveDocumentId(id);
  if(!resolved)return null;
  const doc=corpus.docs.find(d=>d.slug===resolved.slug);
  if(!doc)return null;
  const section=resolved.anchor?doc.sections.find(s=>s.anchor===resolved.anchor):null;
  if(resolved.anchor&&!section)return null;
  return {id:resolved.slug+(resolved.anchor?'#'+resolved.anchor:''),title:doc.title+(section?' — '+section.heading:''),url:doc.url+(resolved.anchor?'#'+resolved.anchor:''),text:section?.markdown||doc.markdown,researchDate:doc.researchDate,publishedDate:doc.publishedDate,sourceUrls:doc.sources};
}

function textResult(value: unknown) {
  return {content:[{type:'text' as const,text:JSON.stringify(value)}]};
}

export function createServer() {
  const server=new McpServer({name:'kaihen-docs',version:'1.0.0'}, {
    instructions:'Read-only native Switch 2 homebrew documentation. Search first, then fetch the relevant document or section. Preserve source citations and distinguish the November 13 research snapshot from new hardware evidence. This server cannot operate a console or modify files.'
  });
  server.registerTool('search', {
    title:'Search kaiHEN documentation',description:'Search guides, API names and code-related topics. Returns stable document and section IDs, URLs and excerpts.',
    inputSchema:z.object({query:z.string().min(1).max(200),limit:z.number().int().min(1).max(20).default(8)}),annotations:readOnly
  },async({query,limit})=>textResult({results:searchDocuments(corpus.docs,query,limit).map(r=>({...r,url:ORIGIN+r.url}))}));
  server.registerTool('fetch', {
    title:'Read a documentation page or section',description:'Retrieve Markdown by an ID returned by search, such as jit#sparse-publication, or a canonical kaihen.timsfun.com documentation URL.',
    inputSchema:z.object({id:z.string().min(1).max(300)}),annotations:readOnly
  },async({id})=>{const doc=getDocument(id);return doc?textResult(doc):{content:[{type:'text' as const,text:'Document or section not found. Use search or list_docs to obtain a valid ID.'}],isError:true};});
  server.registerTool('list_docs', {
    title:'Browse the documentation index',description:'List documentation titles, stable IDs, categories and descriptions.',
    inputSchema:z.object({group:z.enum(['Start here','Development','Shipping','Reference']).optional()}),annotations:readOnly
  },async({group})=>textResult({researchDate:corpus.researchDate,documents:corpus.docs.filter(d=>!group||d.group===group).map(d=>({id:d.slug,title:d.title,group:d.group,description:d.description,url:d.url}))}));
  server.registerTool('get_sources', {
    title:'Read source references for a topic',description:'Return pinned source URLs and evidence dates for a documentation page.',
    inputSchema:z.object({id:z.string().min(1).max(300)}),annotations:readOnly
  },async({id})=>{const doc=getDocument(id);return doc?textResult({id:doc.id,researchDate:doc.researchDate,sources:doc.sourceUrls}):{content:[{type:'text' as const,text:'Document not found.'}],isError:true};});
  for(const doc of corpus.docs) {
    server.registerResource(doc.slug,doc.url,{title:doc.title,description:doc.description,mimeType:'text/markdown'},async()=>({contents:[{uri:doc.url,mimeType:'text/markdown',text:doc.markdown}]}));
  }
  return server;
}

export const mcpHandler=createMcpHandler(createServer,{
  route:'/mcp',responseMode:'json',legacy:'stateless',
  allowedHostnames:['kaihen.timsfun.com','kaihen-docs.timur-radjabov1.workers.dev','localhost','127.0.0.1'],
  allowedOriginHostnames:['kaihen.timsfun.com','kaihen-docs.timur-radjabov1.workers.dev','localhost','127.0.0.1'],
});

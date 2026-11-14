import corpus from '../src/generated/docs.json' with { type: 'json' };
import { mcpHandler, getDocument } from './mcp.ts';
import { searchDocuments } from '../src/lib/search.ts';

type Env={ASSETS:{fetch:(request:Request)=>Promise<Response>}};

function json(value:unknown,status=200) {
 return Response.json(value,{status,headers:{'Cache-Control':'public, max-age=60','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'}});
}

export default {
 async fetch(request:Request,env:Env,ctx:ExecutionContext) {
  const url=new URL(request.url);
  if(url.pathname==='/mcp') {
   if(Number(request.headers.get('content-length'))>65536)return json({error:'Request body is too large'},413);
   return mcpHandler(request,env,ctx);
  }
  if(url.pathname==='/health')return json({status:'ok',service:'kaihen-docs',version:corpus.version,documents:corpus.docs.length,researchDate:corpus.researchDate,content:corpus.checksum});
  if(url.pathname.startsWith('/api/')) {
   if(request.method!=='GET'&&request.method!=='HEAD')return json({error:'Method not allowed'},405);
   if(url.pathname==='/api/search') {
    const q=url.searchParams.get('q')||'';
    if(q.length>200)return json({error:'Query must be at most 200 characters'},400);
    const parsed=Number(url.searchParams.get('limit')||8);
    const limit=Number.isFinite(parsed)?parsed:8;
    return json({query:q,results:searchDocuments(corpus.docs,q,limit)});
   }
   if(url.pathname==='/api/docs')return json({researchDate:corpus.researchDate,documents:corpus.docs.map(({slug,title,description,group,url})=>({id:slug,title,description,group,url}))});
   if(url.pathname.startsWith('/api/docs/')) {
    let id:string;try{id=decodeURIComponent(url.pathname.slice('/api/docs/'.length));}catch{return json({error:'Invalid document ID'},400);}
    const section=url.searchParams.get('section');
    const doc=getDocument(id+(section?'#'+section:''));
    return doc?json(doc):json({error:'Document or section not found'},404);
   }
   return json({error:'Not found'},404);
  }
  const response=await env.ASSETS.fetch(request);
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }
};

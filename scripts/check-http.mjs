import assert from 'node:assert/strict';
const origin=process.argv[2]||'http://127.0.0.1:8788';
const report={origin,checks:[]};
async function rpcPayload(response){const text=await response.text();if(text.trim().startsWith('{'))return JSON.parse(text);const data=text.split('\n').find(line=>line.startsWith('data:'));if(!data)throw new Error('Missing MCP response');return JSON.parse(data.slice(5));}
async function check(name,run){await run();report.checks.push(name);}
await check('health and content identity',async()=>{const r=await fetch(origin+'/health');assert.equal(r.status,200);assert.equal((await r.json()).documents,16);});
await check('search gives a stable deep link',async()=>{const r=await fetch(origin+'/api/search?q=sparse%20publication');assert.equal(r.status,200);assert.equal((await r.json()).results[0].id,'jit#sparse-publication');});
await check('unknown document returns 404',async()=>{assert.equal((await fetch(origin+'/api/docs/not-real')).status,404);});
await check('oversized search query is rejected',async()=>{assert.equal((await fetch(origin+'/api/search?q='+ 'a'.repeat(201))).status,400);});
await check('legacy MCP initialization',async()=>{const r=await fetch(origin+'/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'http-check',version:'1.0'}}})});assert.equal(r.status,200);assert.equal((await rpcPayload(r)).result.serverInfo.name,'kaihen-docs');});
await check('modern MCP discovery',async()=>{const r=await fetch(origin+'/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2026-07-28','Mcp-Method':'server/discover'},body:JSON.stringify({jsonrpc:'2.0',id:2,method:'server/discover',params:{_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}}})});assert.equal(r.status,200);assert.ok((await rpcPayload(r)).result.supportedVersions.includes('2026-07-28'));});
await check('unknown browser origin is rejected',async()=>{const r=await fetch(origin+'/mcp',{method:'POST',headers:{Origin:'https://unrelated.invalid','Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:3,method:'tools/list'})});assert.equal(r.status,403);});
console.log(JSON.stringify(report,null,2));

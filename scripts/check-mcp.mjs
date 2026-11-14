import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
const endpoint=process.argv[2]||'http://127.0.0.1:8788/mcp';
const client=new Client({name:'kaihen-docs-verification',version:'1.0.0'},{capabilities:{}});
try {
 await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
 const listing=await client.listTools();
 const search=await client.callTool({name:'search',arguments:{query:'sparse JIT publication',limit:3}});
 const parsed=JSON.parse(search.content.find(c=>c.type==='text').text);
 if(!parsed.results.length)throw new Error('Search returned no results');
 const result=await client.callTool({name:'fetch',arguments:{id:'jit#sparse-publication'}});
 const doc=JSON.parse(result.content.find(c=>c.type==='text').text);
 if(!doc.text.includes('kaihenJitPublishRanges'))throw new Error('Fetched wrong section');
 const invalid=await client.callTool({name:'fetch',arguments:{id:'../../etc/passwd'}});
 if(!invalid.isError)throw new Error('Invalid ID was not rejected');
 const sources=await client.callTool({name:'get_sources',arguments:{id:'mcp'}});
 const sourceData=JSON.parse(sources.content.find(c=>c.type==='text').text);
 if(!sourceData.sources.some(url=>url.includes('developers.cloudflare.com')))throw new Error('MCP source references missing');
 const resources=await client.listResources();
 const resource=await client.readResource({uri:'https://kaihen.timsfun.com/docs/toolchain/'});
 if(!resource.contents[0].text.includes('switch2_rules'))throw new Error('Resource read failed');
 console.log(JSON.stringify({endpoint,tools:listing.tools.map(t=>t.name),resources:resources.resources.length,searchIds:parsed.results.map(r=>r.id),fetched:doc.id,invalidIdRejected:invalid.isError,resourceRead:true,sourceLookup:true,protocol:client.getServerVersion?.()},null,2));
} finally {await client.close();}

async (page) => {
 const base='.';
 const output=base+'/.impeccable/review/';
 const origin='http://127.0.0.1:8788';
 const report={checks:[],overflow:[],consoleErrors:[]};
 page.on('pageerror',error=>report.consoleErrors.push(error.message));
 const check=(name,value)=>{if(!value)throw new Error(name);report.checks.push(name);};
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(origin);
 await page.screenshot({path:output+'desktop.png',fullPage:true});
 await page.screenshot({path:output+'desktop-first.png'});
 await page.getByRole('button',{name:'Search documentation',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search documentation'}).fill('sparse publication');
 await page.locator('.search-result').first().waitFor();
 check('search returns a specific section',(await page.locator('.search-result').first().getAttribute('href'))==='/docs/jit/#sparse-publication');
 await page.screenshot({path:output+'search.png'});
 await page.locator('.search-result').first().click();
 await page.waitForURL('**/docs/jit/#sparse-publication');
 check('search result navigates to its anchor',new URL(page.url()).hash==='#sparse-publication');
 await page.goto(origin+'/docs/runtime/');
 await page.locator('.mermaid svg').waitFor({state:'visible',timeout:20000});
 check('runtime diagram renders',await page.locator('.mermaid svg').count()===1);
 await page.screenshot({path:output+'runtime-desktop.png',fullPage:true});
 await page.goto(origin+'/docs/first-application/');
 await page.locator('.copy-code').first().click();
 check('code copy gives confirmation',(await page.locator('.copy-code').first().innerText()).includes('Copied'));
 await page.goto(origin+'/docs/mcp/');
 await page.getByRole('button',{name:'Test connection',exact:true}).click();
 await page.locator('#mcp-check-result').filter({hasText:'4 read-only tools available'}).waitFor();
 check('MCP browser test negotiates and lists tools',(await page.locator('#mcp-check-result').innerText()).includes('Connected to kaihen-docs'));
 await page.screenshot({path:output+'mcp-desktop.png'});
 await page.goto(origin+'/docs/api-reference/');
 await page.getByRole('button',{name:'Switch to dark theme',exact:true}).click();
 check('dark theme is applied',await page.locator('html').getAttribute('data-theme')==='dark');
 await page.screenshot({path:output+'dark-desktop.png'});
 await page.getByRole('button',{name:'Switch to light theme',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 await page.goto(origin);
 await page.screenshot({path:output+'mobile.png',fullPage:true});
 await page.screenshot({path:output+'mobile-first.png'});
 await page.locator('.mobile-navigation summary').click();
 check('mobile chapter navigation opens',await page.locator('.mobile-navigation .chapter-nav').isVisible());
 await page.locator('.mobile-navigation').getByRole('link',{name:'Plugins and IPC',exact:true}).click();
 check('mobile chapter navigation works',new URL(page.url()).pathname==='/docs/plugins/');
 await page.screenshot({path:output+'plugins-mobile.png'});
 const slugs=['quickstart','overview','toolchain','first-application','runtime','graphics','input','io-and-media','jit','plugins','porting','debugging','distribution','api-reference','mcp','sources'];
 for(const width of [320,1440]){
  await page.setViewportSize({width,height:900});
  for(const slug of slugs){
   await page.goto(origin+'/docs/'+slug+'/');
   const dimensions=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth}));
   if(dimensions.body>dimensions.viewport)report.overflow.push({slug,width,...dimensions});
  }
 }
 check('all documentation pages fit 320px and desktop viewports',report.overflow.length===0);
 console.log(JSON.stringify(report));
}

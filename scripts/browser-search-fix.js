async(page)=>{
 const origin='http://127.0.0.1:8788';
 const output='.impeccable/review/';
 const checks=[];
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===1440?1000:844});
  for(const activation of ['pointer','focused-link-enter','input-enter']){
   await page.goto(origin+'/docs/jit/');
   await page.getByRole('button',{name:'Search documentation',exact:true}).click();
   const input=page.getByRole('searchbox',{name:'Search documentation'});
   await input.fill('sparse publication');
   const first=page.locator('.search-result').first();
   await first.waitFor();
   if(await first.getAttribute('href')!=='/docs/jit/#sparse-publication')throw new Error('Wrong same-page search result');
   if(activation==='pointer')await first.click();
   else if(activation==='focused-link-enter'){await input.press('ArrowDown');await page.keyboard.press('Enter');}
   else await input.press('Enter');
   await page.waitForFunction(()=>!document.querySelector('#search-dialog').open&&location.hash==='#sparse-publication'&&document.activeElement?.id==='sparse-publication');
   await page.waitForFunction(()=>{const rect=document.getElementById('sparse-publication').getBoundingClientRect();return rect.top>=60&&rect.top<innerHeight;});
   const state=await page.evaluate(()=>({dialogOpen:document.querySelector('#search-dialog').open,hash:location.hash,focused:document.activeElement?.id,headingTop:document.getElementById('sparse-publication').getBoundingClientRect().top,bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
   if(state.bodyWidth>width)throw new Error('Destination overflows viewport');
   checks.push({width,activation,...state});
   if(activation==='input-enter')await page.screenshot({path:output+(width===1440?'search-same-page-desktop.png':'search-same-page-mobile.png')});
  }
 }
 return{fix:'Close same-page search and focus destination',checks};
}

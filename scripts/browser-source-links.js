async(page)=>{
 const origin='http://127.0.0.1:8788';
 const repository='https://github.com/H644b/kaihen-docs';
 const checks=[];
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:width===1440?1000:900});
  await page.goto(origin);
  if(await page.locator('.source-link').getAttribute('href')!==repository)throw new Error('Header points to the wrong repository');
  const footer=page.getByRole('link',{name:'Source on GitHub',exact:true});
  if(await footer.getAttribute('href')!==repository)throw new Error('Footer points to the wrong repository');
  await footer.scrollIntoViewIfNeeded();
  await page.screenshot({path:`.impeccable/review/source-footer-${width}.png`});
  const state=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));
  if(state.width>state.viewport)throw new Error('Source links introduced overflow');
  checks.push({page:'/',...state,footerSourceVisible:await footer.isVisible()});
  await page.goto(origin+'/docs/mcp/');
  if(await page.getByRole('link',{name:'Source on GitHub',exact:true}).getAttribute('href')!==repository)throw new Error('Guide footer points to the wrong repository');
 }
 return{repository,checks,guideFooter:true};
}

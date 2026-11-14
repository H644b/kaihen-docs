import corpus from '../generated/docs.json';

export const groups=['Start here','Development','Shipping','Reference'];
const order=['quickstart','overview','toolchain','first-application','runtime','graphics','input','io-and-media','jit','plugins','porting','debugging','distribution','api-reference','mcp','sources'];
export const docs=[...corpus.docs].sort((a,b)=>order.indexOf(a.slug)-order.indexOf(b.slug));
export const researchDate=corpus.researchDate;
export const publishedDate=corpus.publishedDate;
export const contentHash=corpus.checksum;
export const repositoryUrl='https://github.com/H644b/kaihen-docs';
export function bySlug(slug:string){return docs.find(d=>d.slug===slug);}

export function slugify(value:string){
  return value.toLowerCase().replace(/<[^>]*>/g,'').replace(/[`*]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
}

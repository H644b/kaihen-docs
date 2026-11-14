export type SearchSection = { heading: string; anchor: string; text: string; markdown?: string };
export type SearchDoc = { slug: string; title: string; group: string; description: string; sections: SearchSection[] };
export type SearchResult = { id: string; title: string; section: string; url: string; snippet: string; score: number };

const STOP_WORDS = new Set(['a','an','and','are','as','at','be','by','can','do','does','for','from','how','i','in','is','it','of','on','or','the','to','use','with']);
export function tokens(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[a-z0-9_:+.-]+/g) || [])].filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

export function searchDocuments(docs: SearchDoc[], query: string, limit = 10): SearchResult[] {
  const words = tokens(query.slice(0,200));
  if (!words.length) return [];
  const result: SearchResult[] = [];
  const phrase = query.trim().toLowerCase();
  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const description = doc.description.toLowerCase();
    for (const section of doc.sections) {
      const heading = section.heading.toLowerCase();
      const text = section.text.toLowerCase();
      let score = 0;
      let matched = 0;
      for (const word of words) {
        const inTitle = title.includes(word);
        const inHeading = heading.includes(word);
        const inDescription = description.includes(word);
        const inText = text.includes(word);
        if (inTitle || inHeading || inDescription || inText) matched++;
        score += (inTitle ? 9 : 0) + (inHeading ? 14 : 0) + (inDescription ? 3 : 0) + (inText ? 2 : 0);
        if (inText) score += Math.min(3, text.split(word).length - 2) * .25;
      }
      if (!matched || matched < Math.ceil(words.length * .6)) continue;
      if (phrase.length > 2 && heading.includes(phrase)) score += 12;
      if (phrase.length > 2 && title.includes(phrase)) score += 8;
      score *= matched / words.length;
      if (doc.slug === 'sources') score *= .55;
      const positions = words.map(word=>text.indexOf(word)).filter(p=>p>=0);
      const first = positions.length ? Math.min(...positions) : 0;
      const start = Math.max(0, first - 65);
      const raw = section.text.slice(start, start + 220);
      const snippet = (start ? '…' : '') + raw + (start + 220 < section.text.length ? '…' : '');
      const id = doc.slug + (section.anchor ? '#' + section.anchor : '');
      result.push({id, title: doc.title, section: section.heading, url: `/docs/${doc.slug}/${section.anchor?'#'+section.anchor:''}`, snippet, score});
    }
  }
  return result.sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id)).slice(0,Math.max(1,Math.min(20,limit)));
}

export function resolveDocumentId(input: string): { slug: string; anchor: string } | null {
  let value=input.trim();
  if (/^https?:\/\//i.test(value)) {
    try {
      const url=new URL(value);
      if(url.hostname!=='kaihen.timsfun.com')return null;
      value=url.pathname+url.hash;
    } catch {return null;}
  }
  const [path,anchor='']=value.split('#',2);
  const slug=path.replace(/^\/docs\//,'').replace(/\.md$/,'').replace(/^\/+|\/+$/g,'');
  if(!/^[a-z0-9-]{1,80}$/.test(slug)||!/^[a-z0-9-]*$/.test(anchor))return null;
  return {slug,anchor};
}

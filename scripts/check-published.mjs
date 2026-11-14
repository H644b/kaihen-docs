import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const origin = process.argv[2] || 'https://kaihen.timsfun.com';
const corpus = JSON.parse(await readFile(new URL('../src/generated/docs.json', import.meta.url)));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const report = { origin, checkedAt: new Date().toISOString(), content: corpus.checksum, pages: [], files: [], assets: [] };

async function published(path, status = 200) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, status, `${path}: unexpected HTTP status`);
  return response;
}

const health = await (await published('/health')).json();
assert.equal(health.content, corpus.checksum, 'Published corpus differs from local build');
assert.equal(health.documents, corpus.docs.length);

const home = await (await published('/')).text();
assert.ok(home.includes('kaiHEN Docs'));
report.pages.push('/');
await Promise.all(corpus.docs.map(async doc => {
  const path = `/docs/${doc.slug}/`;
  const html = await (await published(path)).text();
  assert.ok(html.includes('<h1'), `${path}: missing article heading`);
  assert.ok(html.includes('View Markdown'), `${path}: missing raw document link`);
  report.pages.push(path);
}));
const missing = await (await published('/publication-check-unknown-page', 404)).text();
assert.ok(missing.includes('Page not found'));
report.custom404 = true;

const files = [
  ...corpus.docs.map(doc => `/docs/${doc.slug}.md`),
  '/llms.txt', '/llms-full.txt', '/sitemap.xml',
  '/downloads/kaihen-docs-2026-11-14.zip',
  '/downloads/application-build-record.json',
  '/downloads/hardware-test-record.md',
  '/downloads/verification.json'
];
await Promise.all(files.map(async path => {
  const [remote, local] = await Promise.all([
    published(path).then(response => response.arrayBuffer()).then(buffer => Buffer.from(buffer)),
    readFile(new URL(`../dist${path}`, import.meta.url))
  ]);
  assert.equal(digest(remote), digest(local), `${path}: published bytes differ from local build`);
  report.files.push({ path, bytes: remote.length, sha256: digest(remote) });
}));

const assetPaths = [...new Set([...home.matchAll(/(?:src|href)="([^"?#]*\/_astro\/[^"?#]+)"/g)].map(match => match[1]))];
await Promise.all(assetPaths.map(async path => {
  const remote = Buffer.from(await (await published(path)).arrayBuffer());
  const local = await readFile(new URL(`../dist${new URL(path, origin).pathname}`, import.meta.url));
  assert.equal(digest(remote), digest(local), `${path}: published asset differs from local build`);
  report.assets.push(path);
}));
report.pages.sort();
report.files.sort((a, b) => a.path.localeCompare(b.path));
report.assets.sort();
console.log(JSON.stringify(report, null, 2));

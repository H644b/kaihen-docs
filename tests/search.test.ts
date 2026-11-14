import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchDocuments,resolveDocumentId } from '../src/lib/search.ts';
import corpus from '../src/generated/docs.json' with {type:'json'};

test('specific JIT queries return the relevant topic and anchor',()=>{
 const results=searchDocuments(corpus.docs,'sparse publication');
 assert.ok(results.length);
 assert.equal(results[0].id,'jit#sparse-publication');
});
test('function names are searchable',()=>{
 const result=searchDocuments(corpus.docs,'henGetStatus');
 assert.ok(result.some(r=>r.id.startsWith('api-reference')||r.id.startsWith('first-application')));
});
test('empty, punctuation and unknown queries are handled',()=>{
 assert.deepEqual(searchDocuments(corpus.docs,'   '),[]);
 assert.deepEqual(searchDocuments(corpus.docs,'???'),[]);
 assert.deepEqual(searchDocuments(corpus.docs,'zzzznonexistenttoken'),[]);
 assert.equal(searchDocuments(corpus.docs,'runtime',2).length,2);
});
test('document IDs accept canonical URLs and reject unrelated paths',()=>{
 assert.deepEqual(resolveDocumentId('https://kaihen.timsfun.com/docs/jit/#sparse-publication'),{slug:'jit',anchor:'sparse-publication'});
 assert.deepEqual(resolveDocumentId('/docs/toolchain.md'),{slug:'toolchain',anchor:''});
 assert.equal(resolveDocumentId('https://example.com/docs/jit/'),null);
 assert.equal(resolveDocumentId('../../etc/passwd'),null);
 assert.equal(resolveDocumentId('file:///etc/passwd'),null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
function fakeIndexedDB(){
 const entries=new Map();
 const database={
  close(){},
  objectStoreNames:{contains(name){return name==='auth';}},
  transaction(){
   const tx={
    objectStore(){
      return {
        get(name){
          const req={};
          queueMicrotask(()=>{req.result=entries.get(name);req.onsuccess?.();});
          return req;
        },
        put(value,name){
          queueMicrotask(()=>{entries.set(name,value);tx.oncomplete?.();});
        },
        delete(name){
          queueMicrotask(()=>{entries.delete(name);tx.oncomplete?.();});
        }
      };
    }
   };
   return tx;
  }
 };
 return {entries,indexedDB:{open(){
   const req={};
   queueMicrotask(()=>{req.result=database;req.onsuccess?.();});
   return req;
 }}};
}
test('GitHub token is encrypted on device and automatically restored on the next app opening',async()=>{
 const f=fakeIndexedDB();
 const html=readFileSync('index.html','utf8');
 const code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('RAMBLA_GITHUB_CLOUD_V1'));
 assert.ok(code);
 function app(){
  const sandbox={window:{crypto:webcrypto,indexedDB:f.indexedDB},crypto:webcrypto,indexedDB:f.indexedDB,TextEncoder,TextDecoder,Uint8Array,URL,btoa};
  vm.runInNewContext(code,sandbox);
  return sandbox.window.RamblaGithubCloud;
 }
 const token='github_pat_example_only_test_token_1234';
 await app().rememberToken(token);
 assert.notEqual(JSON.stringify(f.entries.get('credential')).includes(token),true);
 assert.equal(f.entries.get('key').extractable,false);
 assert.equal(await app().recallToken(),token);
 await app().forgetToken();
 assert.equal(await app().recallToken(),'');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function loadCloud(fetch) {
 const html=readFileSync('index.html','utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 const cloud=scripts.find(x=>x.includes('RAMBLA_GITHUB_CLOUD_V1'));
 assert.ok(cloud,'Cloud client must be bundled with iPhone app');
 const sandbox={window:{},fetch,TextEncoder,URL,btoa};
 vm.runInNewContext(cloud,sandbox,{timeout:2000});
 return sandbox.window.RamblaGithubCloud;
}
function fakeFetch(onCall) {
 let calls=[];
 const fn=async(url,options={})=>{
  calls.push({url,options});
  return onCall(url,options,calls.length);
 };
 fn.calls=calls;
 return fn;
}
test('Stop opens a non-destructive local/cloud choice, export can reopen it',()=>{
 const html=readFileSync('index.html','utf8');
 assert.match(html,/<dialog id="cloudUploadDialog"/);
 assert.match(html,/<button[^>]*id="cloudKeepLocal"/);
 assert.match(html,/<button[^>]*id="cloudUploadButton"/);
 assert.match(html,/function endSession\(\)[\s\S]*?openCloudUpload\(/);
 assert.match(html, /id="exportCloudButton"/);
});
test('No upload without explicit acknowledgement of PUBLIC repo',async()=>{
 const fetch=fakeFetch(()=>{throw Error('Should not hit network')});
 const cloud=loadCloud(fetch);
 await assert.rejects(()=>cloud.uploadFiles({token:'ghp_example',session:{id:'abc',title:'Foo'},edl:'EDL',publicConfirmed:false}),/pubblic/i);
 assert.equal(fetch.calls.length,0);
});
test('Create EDL with UTF-8 and restricted file path under sessions/',async()=>{
 const fetch=fakeFetch((url,options)=>{
  if(options.method==='GET')return {status:404,ok:false,json:async()=>({message:'Not Found'})};
  assert.equal(options.method,'PUT');
  assert.equal(options.headers.Authorization,'Bearer github_pat_fake');
  assert.match(url,/\/contents\/sessions\/RAMBLA-[a-zA-Z0-9_-]+\.edl$/);
  const body=JSON.parse(options.body);
  assert.equal(body.branch,'main');
  assert.equal(Buffer.from(body.content,'base64').toString('utf8'),'TITLE: Città è bella');
  assert.ok(!JSON.stringify(body).includes('github_pat_fake'));
  return {status:201,ok:true,json:async()=>({commit:{sha:'commit1'},content:{html_url:'https://github.com/example'}})};
 });
 const cloud=loadCloud(fetch);
 const r=await cloud.uploadFiles({token:'github_pat_fake',session:{id:'abc-123',title:'Sensible Project'},edl:'TITLE: Città è bella',publicConfirmed:true});
 assert.equal(r.uploaded.length,1);
 assert.equal(fetch.calls.length,2);
});
test('Overwriting same session uses SHA, no duplicate filename',async()=>{
 let paths=[];
 const fetch=fakeFetch((url,options)=>{
  paths.push(new URL(url).pathname);
  if(options.method==='GET')return {status:200,ok:true,json:async()=>({sha:'previoushash'})};
  const body=JSON.parse(options.body);
  assert.equal(body.sha,'previoushash');
  return {status:200,ok:true,json:async()=>({commit:{sha:'commit2'}})};
 });
 const cloud=loadCloud(fetch);
 await cloud.uploadFiles({token:'token',session:{id:'same-session',title:'Foo'},edl:'a',publicConfirmed:true});
 assert.equal(paths.length,2);
 assert.equal(paths[0],paths[1]);
});
test('Optional full backup is separate from the EDL',async()=>{
 const seen=[];
 const fetch=fakeFetch((url,options)=>{
  if(options.method==='GET')return {status:404,ok:false};
  seen.push(new URL(url).pathname);
  return {status:201,ok:true,json:async()=>({commit:{sha:'xx'}})};
 });
 const cloud=loadCloud(fetch);
 await cloud.uploadFiles({token:'token',session:{id:'abcd',title:'Test'},edl:'A',backup:'{"segments":[1]}',publicConfirmed:true});
 assert.equal(seen.length,2);
 assert.match(seen[0],/\.edl$/);
 assert.match(seen[1],/\.json$/);
});
test('Permission errors are actionable and session can remain local',async()=>{
 const fetch=fakeFetch(()=>({status:403,ok:false,json:async()=>({message:'Resource not accessible by personal access token'})}));
 const cloud=loadCloud(fetch);
 await assert.rejects(()=>cloud.uploadFiles({token:'bad',session:{id:'abc'},edl:'x',publicConfirmed:true}),/permess|token|403/i);
});

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../github-save.js'),'utf8');
const slice=(start,end)=>{
 const a=source.indexOf(start),b=source.indexOf(end,a);
 assert(a>=0&&b>a,'Expected collaboration source section '+start);
 return source.slice(a,b)
};
const helpers=slice(' function projectPayload(',' function encodeBase64(');
const methods=slice(' async function refreshFromCloud(',' async function normalSave(');
const mockCode=[
 "const auth=new Map(),bases=new Map();let accessToken='test-github-pat',connectedUser='collaboratrice',toolbarSync=null;",
 "const crypto={subtle:{digest:async(_,bytes)=>Uint8Array.from(bytes).buffer}};",
 "class TextEncoder{encode(v){return Uint8Array.from(Array.from(v).map(c=>c.charCodeAt(0)%256))}}",
 "const authGet=async k=>auth.get(k)||null,authPut=async(k,v)=>{auth.set(k,v)};",
 "const setBase=(id,sha)=>bases.set(id,sha),getBase=id=>bases.get(id)||null;",
 "const bridge=()=>m.bridge,cloudLink=id=>'https://kura.test/?cloud='+id;",
 "const readCloudVersion=async id=>({data:JSON.parse(JSON.stringify(m.remote)),sha:m.sha});",
 "const api=async(url,opt={})=>{if(opt.method==='PUT'){m.saveCount++;const body=JSON.parse(opt.body);if(m.remote&&body.sha!==m.sha)throw Error('Stale SHA');m.remote=JSON.parse(body.content);m.sha='sha'+(m.saveCount+2);return{commit:{sha:'commit'+m.saveCount},content:{sha:m.sha}}}return m.remote?{sha:m.sha}:null};",
 "const filePath=id=>'projects/saved/'+id+'.json',BRANCH='main',encodeBase64=x=>x;",
 "const document={getElementById:()=>null},changedSummary=()=> 'body1';",
 "const status=msg=>{m.status=msg},toast=msg=>{m.toast=msg},updateLink=id=>{m.link=id},confirm=()=>true;",
 "const gid=id=>/^[a-zA-Z0-9_-]{3,100}$/.test(id||'');",
 helpers,methods,
 "return{rememberBaseline,digest,saveToGitHub,refreshFromCloud,loadRemote,baselineFor,isDirty};"
].join('\n');
async function main(){
 const m={id:'kura-test',remote:null,sha:null,saveCount:0,backupCount:0};
 let local={projectId:'kura-test',projectName:'Test KURA',pages:[{fields:{body1:'originale',head1:'titolo'}}],meta:{},customAssets:{}};
 m.bridge={
  current:()=>({id:m.id}),
  saveLocal:async()=>structuredClone(local),
  snapshot:async()=>structuredClone(local),
  localCopy:async()=>structuredClone(local),
  preserveDraft:async()=>{m.backup=structuredClone(local);m.backupCount++;return{name:'Backup'}},
  replaceFromCloud:async data=>{local=structuredClone(data);m.id=data.projectId},
  openCloud:async data=>({source:'local',id:data.projectId})
 };
 const tested=new Function('m',mockCode)(m);
 m.remote=structuredClone(local);m.sha='sha1';
 await tested.rememberBaseline(m.id,'sha1',local);
 local.pages[0].fields.body1='bozza non pubblicata';
 m.remote.pages[0].fields.body1='versione collaboratrice';m.sha='sha2';
 await assert.rejects(tested.saveToGitHub(),/collaboratore|collaboratrice/i);
 assert.equal(local.pages[0].fields.body1,'bozza non pubblicata','Local draft was overwritten');
 const auto=await tested.refreshFromCloud(m.id,false);
 assert.equal(auto.dirty,true,'Automatic update discarded local draft');
 const manual=await tested.refreshFromCloud(m.id,true);
 assert.equal(manual.updated,true);
 assert.equal(m.backupCount,1);
 assert.equal(m.backup.pages[0].fields.body1,'bozza non pubblicata','Recovery content invalid');
 assert.equal(local.pages[0].fields.body1,'versione collaboratrice');
 local.pages[0].fields.head1='aggiornamento mio';
 const saved=await tested.saveToGitHub();
 assert.equal(saved.commit,'commit1');
 assert.equal(m.remote.pages[0].fields.head1,'aggiornamento mio');
 const repeated=await tested.saveToGitHub();
 assert.equal(repeated.alreadySaved,true);
 assert.equal(m.saveCount,1,'Redundant GitHub commit');
 console.log('KURA collaboration safety: 7 regression scenarios passed');
}
main().catch(error=>{console.error(error);process.exitCode=1});

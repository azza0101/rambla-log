import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('index.html','utf8');
function mainScript(){
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const src=scripts.find(s=>s.includes('function startSession(resume=false)')&&s.includes('function endSession()'));
 assert.ok(src);return src;
}
function functionText(name){
 const src=mainScript();
 const start=src.indexOf('  function '+name+'(');
 assert.ok(start>=0,'Missing '+name);
 const end=src.indexOf('\n  function ',start+3);
 assert.ok(end>start,'No function separator after '+name);
 return src.slice(start,end);
}
test('Ended session reopens with the original time origin and markers intact',()=>{
 const source=functionText('resumeFinishedSession');
 const session={id:'session',title:'S',startedAt:1_000_000,endedAt:1_004_000,duration:4,markers:[{id:'m1',start:2}],segments:[{id:'s1',start:1}],captureState:'ended',pausedAt:null};
 let resumed=0,saved=0;
 const env={current:()=>session,active:false,pendingFlush:false,voiceClosing:null,voiceNote:null,scanner:null,recovery:false,document:{hidden:false},Date:{now:()=>1_900_000},elapsed:()=>900,store:{activeId:'session'},persist:()=>{saved++;return true;},render(){},startSession:(continueSession)=>{assert.equal(continueSession,true);resumed++;},notify(){}};
 vm.runInNewContext(source+';resumeFinishedSession();',env);
 assert.equal(session.startedAt,1_000_000);
 assert.equal(session.endedAt,null);
 assert.equal(session.markers[0].start,2);
 assert.equal(session.captureState,'paused');
 assert.equal(session.duration,900);
 assert.equal(resumed,1);assert.ok(saved>=1);
});
test('Ended sessions display a resume action',()=>{
 const render=functionText('render');
 assert.match(render,/resumeButton[\s\S]*?endedAt/);
 assert.match(mainScript(),/resumeFinishedSession\(\)/);
});
test('Success toast is short and away from bottom controls',()=>{
 const notify=functionText('notify');
 assert.match(notify,/undo\s*\?\s*[34]\d{3}\s*:\s*1\d{3}/);
 assert.match(html,/\.toast[^{]*\{[^}]*top:/);
 assert.match(html,/\.manual-note\s*\{[^}]*background:\s*#[A-Fa-f0-9]+/);
 assert.match(html,/\.voice-note\s*\{[^}]*background:\s*#[A-Fa-f0-9]+/);
});
test('Marker list uses category accent on entire note card',()=>{
 assert.match(html, /class="marker-row" style="--note-accent:/);
 assert.match(html, /\.marker-row\s*\{[^}]*var\(--note-accent(?:,|\))/);
});
test('GitHub pairing persists locally without a token in public HTML',()=>{
 assert.match(html,/rememberToken/);
 assert.match(html,/recallToken/);
 assert.match(html,/cloudSetup/);
 assert.match(html,/cloudConnected/);
 assert.doesNotMatch(html,/github_pat_[A-Za-z0-9_]{25,}/);
});
test('All inline scripts parse',()=>{
 for(const [i,m] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries())assert.doesNotThrow(()=>new vm.Script(m[1]),'Script '+i);
});

test('Failed local save never alters a previously ended session',()=>{
 const source=functionText('resumeFinishedSession');
 const session={id:'old',startedAt:1_000_000,endedAt:1_004_000,duration:4,markers:[{id:'m1',start:2}],captureState:'ended',pauseReason:null,pausedAt:null,isDemo:false};
 let resumed=0;
 const env={current:()=>session,active:false,pendingFlush:false,voiceClosing:null,voiceNote:null,scanner:null,recovery:false,document:{hidden:false},Date:{now:()=>1_900_000},persist:()=>false,render(){},startSession:()=>resumed++,notify(){}};
 vm.runInNewContext(source+';resumeFinishedSession();',env);
 assert.equal(session.endedAt,1_004_000);
 assert.equal(session.duration,4);
 assert.equal(session.captureState,'ended');
 assert.equal(session.pauseReason,null);
 assert.equal(session.pausedAt,null);
 assert.equal(resumed,0);
});

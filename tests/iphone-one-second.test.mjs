import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('index.html','utf8');
test('one second is new session default',()=>{
 assert.match(html,/lookback:1,/);
});
test('one second is first selected marker interval',()=>{
 assert.match(html,/data-lookback="1" class="active">1s<\/button>/);
});
test('legacy session intervals migrate once instead of reverting every visit',()=>{
 assert.match(html,/lookbackOneSecond/);
 assert.match(html,/lookbackOneSecond:true/);
});
test('each previously available interval remains optional',()=>{
 for(const sec of [5,10,20]) assert.ok(html.includes('data-lookback="'+sec+'"'));
});
test('published scripts parse',()=>{
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});

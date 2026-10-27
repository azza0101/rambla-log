import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const release=JSON.parse(readFileSync('version.json','utf8'));
test('Published build is accepted by installed iPhone updaters',()=>{assert.match(release.build,/^[a-f0-9]{12}$/);assert.match(release.version,/^\d+\.\d+\.\d+$/);});
for(const name of ['index.html','RAMBLA-Log.html'])test(name+' advertises the published release',()=>{const html=readFileSync(name,'utf8');assert.ok(html.includes('window.RAMBLA_BUILD={version:"'+release.version+'",build:"'+release.build+'"};'));});
test('Offline cache belongs to the published build',()=>{assert.ok(readFileSync('sw.js','utf8').includes("const CACHE='rambla-log-"+release.build+"';"));});

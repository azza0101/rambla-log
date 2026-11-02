/* KURA Editor v2.0 — DOM text editing, rich selection, procedural paper, saved projects, MCP contract.
   Expects the v1 editor's globals in index.html. No external runtime or API keys. */
'use strict';
(function(){
const V2_VERSION='2.5.0';
const NOTE_LABELS={label_base:'Base',label_duration:'Durata',label_highlight:'Da non perdere',label_tips:'Da sapere'};
const STANDARD=['eyebrow','head1','body1','head2','body2','label_base','base','label_duration','duration','label_highlight','highlight','label_tips','tips'];
const PAPER=[{"id":"basic_1","name":"Basic 1 · Avorio","season":"basic","colors":["#f7f0e4","#f2e8d9"],"fibers":"#b4a692","direction":0,"tags":["basic","basic 1 · avorio"]},{"id":"basic_2","name":"Basic 2 · Salvia","season":"basic","colors":["#e9eee4","#f5f3e9"],"fibers":"#a0a995","direction":1,"tags":["basic","basic 2 · salvia"]},{"id":"basic_3","name":"Basic 3 · Sabbia","season":"basic","colors":["#f3e7dc","#f9f2e9"],"fibers":"#bc9b89","direction":2,"tags":["basic","basic 3 · sabbia"]},{"id":"basic_4","name":"Basic 4 · Perla","season":"basic","colors":["#f1f1eb","#e6ece5"],"fibers":"#aeb7ae","direction":3,"tags":["basic","basic 4 · perla"]},{"id":"spring_1","name":"Primavera 1 · Boccioli","season":"spring","colors":["#f5efe4","#dce7d7"],"fibers":"#98b689","direction":0,"tags":["spring","primavera 1 · boccioli"]},{"id":"spring_2","name":"Primavera 2 · Botanica","season":"spring","colors":["#edf2e3","#d5e2c7"],"fibers":"#9bb88d","direction":1,"tags":["spring","primavera 2 · botanica"]},{"id":"spring_3","name":"Primavera 3 · Luce","season":"spring","colors":["#f8f2df","#e9eedb"],"fibers":"#aabf9e","direction":2,"tags":["spring","primavera 3 · luce"]},{"id":"summer_1","name":"Estate 1 · Mediterranea","season":"summer","colors":["#f9efd9","#dfe9eb"],"fibers":"#91b0b4","direction":3,"tags":["summer","estate 1 · mediterranea"]},{"id":"summer_2","name":"Estate 2 · Sabbia","season":"summer","colors":["#f4ead6","#efd7b4"],"fibers":"#cfaa78","direction":0,"tags":["summer","estate 2 · sabbia"]},{"id":"summer_3","name":"Estate 3 · Agrumi","season":"summer","colors":["#fff1d9","#f2d59c"],"fibers":"#d29c5d","direction":1,"tags":["summer","estate 3 · agrumi"]},{"id":"autumn_1","name":"Autunno 1 · Terracotta","season":"autumn","colors":["#f3e3d7","#d8b59c"],"fibers":"#bd835d","direction":2,"tags":["autumn","autunno 1 · terracotta"]},{"id":"autumn_2","name":"Autunno 2 · Olivato","season":"autumn","colors":["#ece7d5","#c4c59e"],"fibers":"#8d9b68","direction":3,"tags":["autumn","autunno 2 · olivato"]},{"id":"autumn_3","name":"Autunno 3 · Vendemmia","season":"autumn","colors":["#f2e8dc","#c8a88b"],"fibers":"#9a7c66","direction":0,"tags":["autumn","autunno 3 · vendemmia"]},{"id":"winter_1","name":"Inverno 1 · Nebbia","season":"winter","colors":["#eff0ee","#d9dedd"],"fibers":"#9eafac","direction":1,"tags":["winter","inverno 1 · nebbia"]},{"id":"winter_2","name":"Inverno 2 · Bosco","season":"winter","colors":["#e7ece8","#cbd7cf"],"fibers":"#849e90","direction":2,"tags":["winter","inverno 2 · bosco"]},{"id":"winter_3","name":"Inverno 3 · Ghiaccio","season":"winter","colors":["#f1f3f2","#dde5ea"],"fibers":"#a9bfcc","direction":3,"tags":["winter","inverno 3 · ghiaccio"]}];
const BACKGROUND_PRESETS=PAPER;
const NEW_STICKERS=[["spring_blossom_branch","Ramo di ciliegio"],["spring_blossom_cluster","Fiori di ciliegio"],["spring_tulips","Tulipani"],["spring_pink_petals","Petali rosa"],["summer_lemon_branch","Limoni mediterranei"],["summer_orange_slices","Agrumi sezionati"],["summer_paper_shell","Conchiglia di carta"],["summer_swallow","Rondine"],["autumn_maple_leaf","Foglia d'acero"],["autumn_purple_grapes","Grappolo d'uva"],["autumn_olive_branch","Ramo d'ulivo"],["autumn_wheat","Spighe"],["winter_paper_snowflake","Fiocco di neve"],["winter_snowy_pine","Ramo innevato"],["winter_pine_cones","Pigne"],["winter_holly_branch","Agrifoglio"]];
const LEGACY_STICKERS=['blossom','lavender','citrus','shell','autumn_leaf','grapes','snowflake','pine','ticket'];
for(const old of LEGACY_STICKERS)ASSETS['sticker_'+old]='./assets/sticker_'+old+'.svg';
for(const p of BACKGROUND_PRESETS){if(p.season!=='basic')ASSETS['sfondo_'+p.id]='./assets/sfondo_'+p.id+'.svg'}
for(const [key,label] of NEW_STICKERS){ASSETS['sticker_'+key]='./assets/'+key+'.webp?v=2.5.0';if(!stickerDefs.some(x=>x[0]===key))stickerDefs.push([key,label])}

const KURA_SEASONS=[['basic','Basic'],['spring','Primavera'],['summer','Estate'],['autumn','Autunno'],['winter','Inverno']];

let overlay=null, toolbar=null, ctxMenu=null, nodeMap=new Map(), activeKey=null, shownPage=null;
let pIndex=[], currentProjectId=null, managerReady=false, savingNow=false, saveAgain=false;
let fontReadyFromHost=false;
const metrics=new Map();
function safeNumber(n,lo,hi,def){n=Number(n);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):def}
function ensurePage(p){if(!p)return p;p.fields=p.fields||{};p.offsets=p.offsets||{};p.textStyles=p.textStyles||{};p.freeTexts=Array.isArray(p.freeTexts)?p.freeTexts:[];for(const k of Object.keys(NOTE_LABELS))if(typeof p.fields[k]!=='string')p.fields[k]=NOTE_LABELS[k];return p}
function freeItem(p,key){return key.startsWith('free:')?p.freeTexts.find(x=>x.id===key.slice(5)):null}
function rawFor(p,key){const item=freeItem(p,key);return item?String(item.text||''):String(p.fields[key]||'')}
function offsetFor(p,key){const f=freeItem(p,key);return f||p.offsets[key]||{}}
function defaultStyle(p,key){
 const s=p.noteScale||1,b=p.bodyScale||1;
 if(key==='eyebrow')return{fontSize:32,family:'Montserrat',bold:true,color:GREEN,lineHeight:1.12};
 if(key==='head1'||key==='head2')return{fontSize:47,family:'KURA Brush2',bold:false,color:ORANGE,lineHeight:1.10};
 if(key==='body1'||key==='body2')return{fontSize:30*b,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.26};
 if(key.startsWith('label_'))return{fontSize:20*s,family:'Montserrat',bold:true,color:GREEN,lineHeight:1.12};
 if(['base','duration'].includes(key))return{fontSize:19*s,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.18};
 if(key.startsWith('free:'))return{fontSize:40,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.2};
 return{fontSize:16*s,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.18};
}
function styleFor(p,key){
 const st=p.textStyles&&p.textStyles[key]||{},df=defaultStyle(p,key);
 return{fontSize:safeNumber(st.fontSize,10,160,df.fontSize),family:(st.family==='Feeling Passionate'?'KURA Brush2':(['Montserrat','KURA Brush2','Caveat'].includes(st.family)?st.family:df.family)),bold:typeof st.bold==='boolean'?st.bold:df.bold,color:/^#[0-9a-fA-F]{6}$/.test(st.color||'')?st.color:df.color,lineHeight:safeNumber(st.lineHeight,.8,2.5,df.lineHeight)};
}
function effectiveFamily(st){return st.family==='KURA Brush2'&&!faceLoaded?'Caveat':st.family}
function textRect(p,key){
 ensurePage(p);const f=freeItem(p,key);
 if(f)return{x:safeNumber(f.x,-1000,2100,150),y:safeNumber(f.y,-1000,2000,200),w:safeNumber(f.w,30,1600,450)*(f.scale||1),h:safeNumber(f.h,24,1600,100)*(f.scale||1)};
 const l=LAYOUTS[p.layout]||LAYOUTS[0];
 if(l[key]){
  const z=box(l[key],p,key);
  return(key==='head1'||key==='head2')?{x:z.x+70,y:z.y,w:Math.max(60,z.w-72),h:z.h}:z;
 }
 const nk=key.startsWith('label_')?key.slice(6):key;
 if(['base','duration','highlight','tips'].includes(nk)){
  const n=p.visuals.note;const block=noteBlocks(n,p).find(v=>v.key===nk);
  if(!block)return null;
  const isLabel=key.startsWith('label_'),o=p.offsets[key]||{};
  const b={x:block.x,y:block.top+(isLabel?0:27),w:block.w,h:isLabel?27:block.height};
  return{x:b.x+(o.dx||0),y:b.y+(o.dy||0),w:b.w*(o.scale||1),h:b.h*(o.scale||1)};
 }
 return null;
}
function textKeys(p){ensurePage(p);const list=p.visuals.note.visible?STANDARD:STANDARD.filter(k=>!['label_base','base','label_duration','duration','label_highlight','highlight','label_tips','tips'].includes(k));return list.concat(p.freeTexts.map(x=>'free:'+x.id))}
function paperRandom(seed){let n=hashSeed(seed||'paper');return function(){n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296}}
const paperCache=new Map();
function drawSeasonMark(c,id,kind){
 const r=paperRandom(id+'-mark');
 c.save();
 const stroke=(color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round'};
 function leaf(x,y,size,color,rot){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=color;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(size*.55,-size*.62,0,-size*1.35);c.quadraticCurveTo(-size*.45,-size*.66,0,0);c.fill();c.restore()}
 if(kind==='basic'){stroke('rgba(120,104,81,.16)',2);c.strokeRect(56,103,120,32);c.fillStyle='rgba(215,134,70,.17)';c.fillRect(66,120,110,11)}
 if(kind==='spring'){for(let i=0;i<7;i++)leaf(76+r()*170,103+r()*125,20+r()*13,['#9dbb94','#c3d5a2','#e6c9bb'][i%3],-.6+r()*1.4)}
 if(kind==='summer'){for(let i=0;i<4;i++){c.fillStyle=['#edc989','#e5b36b','#d3dfe0'][i%3];c.globalAlpha=.48;c.beginPath();c.arc(925+r()*90,103+r()*100,16+r()*15,0,Math.PI*2);c.fill()}stroke('rgba(103,145,155,.26)',3);for(let i=0;i<3;i++){c.beginPath();for(let x=0;x<200;x+=12)c.lineTo(73+x,1195+i*16+Math.sin((x+i*12)/30)*5);c.stroke()}}
 if(kind==='autumn'){for(let i=0;i<8;i++)leaf(80+r()*180,105+r()*145,17+r()*19,['#bd835d','#ac966b','#84916f'][i%3],-.6+r()*1.7)}
 if(kind==='winter'){stroke('rgba(155,181,185,.37)',2);for(let i=0;i<7;i++){const x=875+r()*135,y=112+r()*135;c.beginPath();c.moveTo(x-10,y);c.lineTo(x+10,y);c.moveTo(x,y-10);c.lineTo(x,y+10);c.moveTo(x-7,y-7);c.lineTo(x+7,y+7);c.moveTo(x-7,y+7);c.lineTo(x+7,y-7);c.stroke()}}
 c.restore();
}
function drawKuraBackground(c,index,mini=false){
 if(index>=4){const asset=assetImage('sfondo_'+BACKGROUND_PRESETS[index].id);if(asset?.complete&&asset.naturalWidth){c.drawImage(asset,0,0,W,H);return}}
 if(index>=4&&!mini){if(!paperCache.has(index)){const image=document.createElement('canvas');image.width=W;image.height=H;drawKuraBackground(image.getContext('2d'),index,true);paperCache.set(index,image)}c.drawImage(paperCache.get(index),0,0,W,H);return}
 if(index<4){const im=assetImage('sfondo_'+(index+1));if(im&&im.complete&&im.naturalWidth)c.drawImage(im,0,0,W,H);else{c.fillStyle='#f7f0e5';c.fillRect(0,0,W,H)}return}
 const art=assetImage('sfondo_'+BACKGROUND_PRESETS[index].id);if(art?.complete&&art.naturalWidth){c.drawImage(art,0,0,W,H);return}
 const a=PAPER[index],gr=c.createLinearGradient(a.direction%2?0:W,0,a.direction%2?W:0,H);
 gr.addColorStop(0,a.colors[0]);gr.addColorStop(1,a.colors[1]);c.fillStyle=gr;c.fillRect(0,0,W,H);
 const rand=paperRandom('kura-bg-v3-'+a.id);
 c.save();c.globalAlpha=.06;c.fillStyle=a.fibers;
 for(let i=0;i<(mini?1400:700);i++){const x=rand()*W,y=rand()*H;c.fillRect(x,y,1+rand()*9,rand()<.9?1:2)}
 c.restore();
 // Pre-rendered torn-paper layer. Kept in the background bitmap, not in editable foreground.
 c.save();c.shadowColor='rgba(74,66,55,.13)';c.shadowBlur=12;c.shadowOffsetY=7;
 c.fillStyle='rgba(255,253,246,.26)';c.beginPath();c.moveTo(0,0);
 for(let x=0;x<=W;x+=18)c.lineTo(x,76+(rand()-.5)*19);
 c.lineTo(W,0);c.closePath();c.fill();c.restore();
 c.save();c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(0,H);
 for(let x=0;x<=W;x+=20)c.lineTo(x,H-82+(rand()-.5)*17);
 c.lineTo(W,H);c.closePath();c.fill();c.restore();
 drawSeasonMark(c,a.id,a.season);
}
function paintEditable(c,p,key,raw,unusedRect,opt){
 ensurePage(p);
 const r=textRect(p,key);if(!r)return;
 const st=styleFor(p,key),o=offsetFor(p,key);
 if(c===ctx && p===page() && activeKey===key)return;
 c.save();c.globalAlpha=safeNumber(o.opacity,0,1,1);c.translate(r.x+r.w/2,r.y+r.h/2);c.rotate(safeNumber(o.rot,-360,360,0)*Math.PI/180);
 const fontSize=st.fontSize,df=defaultStyle(p,key);
 const res=drawText(c,raw,{x:-r.w/2,y:-r.h/2,w:r.w,h:r.h},{fontSize:fontSize,minFont:p.textStyles[key]?.fontSize?fontSize:fontSize*.77,script:false,family:effectiveFamily(st),bold:st.bold,color:st.color,lineHeight:st.lineHeight,track:true,label:key});
 c.restore();if(c===ctx && p===page())metrics.set(key,res.fontSize);
 hitboxes.push({id:'text:'+key,x:r.x,y:r.y,w:r.w,h:r.h});
}
function paintFreeTexts(c,p){ensurePage(p);for(const f of p.freeTexts){paintEditable(c,p,'free:'+f.id,f.text,null,{})}}
function htmlEscape(x){return String(x||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function markdownHTML(s){
 const source=String(s||'').replace(/\r/g,'');return source.split(/(\*\*[^*]+\*\*)/g).map(function(t){return t.startsWith('**')&&t.endsWith('**')?'<strong>'+htmlEscape(t.slice(2,-2))+'</strong>':htmlEscape(t)}).join('').replace(/\n/g,'<br>');
}
function readMarkdown(el){
 const runs=[];
 function add(t,b){if(!t)return;if(runs.length&&runs[runs.length-1].bold===b)runs[runs.length-1].text+=t;else runs.push({text:t,bold:b})}
 function walk(node,b){
  if(node.nodeType===3){add(node.nodeValue,b);return}
  if(node.nodeType!==1)return;
  const tag=node.tagName;if(tag==='BR'){add('\n',false);return}
  const bold=b||tag==='STRONG'||tag==='B'||(/bold|[6-9]00/.test(node.style?.fontWeight||''));
  if((tag==='DIV'||tag==='P')&&node.previousSibling&&runs.length&& !runs[runs.length-1].text.endsWith('\n'))add('\n',false);
  node.childNodes.forEach(function(ch){walk(ch,bold)})
 }
 el.childNodes.forEach(function(ch){walk(ch,false)});
 return runs.map(function(v){return v.bold&&v.text.trim()?'**'+v.text+'**':v.text}).join('').replace(/\n+$/,'');
}
function getNode(key){return nodeMap.get(key)}
function updateModel(key,raw){const p=ensurePage(page()),f=freeItem(p,key);if(f)f.text=raw;else p.fields[key]=raw;if(key==='base'){p.name=(p.fields.base||'Nuova destinazione');$('#stageName').textContent=formatName(p)}scheduleSave();queueRender()}
function hideContext(){if(ctxMenu){ctxMenu.remove();ctxMenu=null}}
function attachFrame(key){
 const frame=document.createElement('div');frame.className='kura-text-frame';frame.dataset.key=key;
 const edit=document.createElement('div');edit.className='kura-text-edit';edit.contentEditable='true';edit.spellcheck=false;edit.dataset.key=key;edit.setAttribute('role','textbox');edit.setAttribute('aria-label','Modifica '+key);edit.setAttribute('aria-multiline','true');
 frame.appendChild(edit);
 const move=document.createElement('button');move.className='kura-manip-handle kura-move-handle';move.type='button';move.textContent='⠿';move.title='Trascina per spostare';frame.appendChild(move);
 const rotate=document.createElement('button');rotate.className='kura-manip-handle kura-rotate-handle';rotate.type='button';rotate.textContent='↻';rotate.title='Trascina per ruotare';frame.appendChild(rotate);
 const resize=document.createElement('button');resize.className='kura-manip-handle kura-resize-handle';resize.type='button';resize.textContent='↘';resize.title='Trascina per ridimensionare';frame.appendChild(resize);
 frame.addEventListener('pointerdown',function(e){if(e.target===edit){selected='text:'+key;refreshInspector();showToolbar(key)}});
 edit.addEventListener('focus',function(){activeKey=key;selected='text:'+key;frame.classList.add('is-editing');edit.classList.add('editing');refreshInspector();showToolbar(key);queueRender()});
 edit.addEventListener('input',function(){updateModel(key,readMarkdown(edit));updateToolbar()});
 edit.addEventListener('blur',function(){updateModel(key,readMarkdown(edit));if(activeKey===key)activeKey=null;frame.classList.remove('is-editing');edit.classList.remove('editing');queueRender()});
 edit.addEventListener('paste',function(e){e.preventDefault();const data=(e.clipboardData||window.clipboardData).getData('text/plain');document.execCommand('insertText',false,data)});
 edit.addEventListener('contextmenu',function(e){e.preventDefault();selected='text:'+key;refreshInspector();showContextMenu(e,key)});
 move.addEventListener('pointerdown',function(e){startGesture(e,key,'move')});
 rotate.addEventListener('pointerdown',function(e){startGesture(e,key,'rotate')});
 resize.addEventListener('pointerdown',function(e){startGesture(e,key,'resize')});
 overlay.appendChild(frame);nodeMap.set(key,{frame,edit});return nodeMap.get(key);
}
function stageScale(){const b=canvas.getBoundingClientRect();return Math.max(.1,b.width/W)}
function startGesture(e,key,action){
 e.preventDefault();e.stopPropagation();hideContext();
 const start=xyFromPointer(e),p=ensurePage(page()),f=freeItem(p,key),o=f||(p.offsets[key]??={dx:0,dy:0,scale:1,rot:0,opacity:1}),base=deepClone(o),r=textRect(p,key),center={x:r.x+r.w/2,y:r.y+r.h/2};
 const before=JSON.stringify({pages,current});selected='text:'+key;refreshInspector();
 const pointerEl=e.currentTarget;pointerEl.setPointerCapture(e.pointerId);
 function moving(ev){
  const at=xyFromPointer(ev),dx=at.x-start.x,dy=at.y-start.y;
  if(action==='move'){if(f){o.x=(base.x||0)+dx;o.y=(base.y||0)+dy}else{o.dx=(base.dx||0)+dx;o.dy=(base.dy||0)+dy}}
  if(action==='rotate'){const a0=Math.atan2(start.y-center.y,start.x-center.x),a1=Math.atan2(at.y-center.y,at.x-center.x);o.rot=Math.round((base.rot||0)+(a1-a0)*180/Math.PI)}
  if(action==='resize'){o.scale=safeNumber((base.scale||1)+Math.max(dx/Math.max(80,r.w),dy/Math.max(50,r.h)),.45,2.5,1)}
  queueRender();refreshInspector();
 }
 function finish(){pointerEl.removeEventListener('pointermove',moving);pointerEl.removeEventListener('pointerup',finish);pointerEl.removeEventListener('pointercancel',finish);history.push(before);if(history.length>45)history.shift();future=[];updateHistory();scheduleSave()}
 pointerEl.addEventListener('pointermove',moving);pointerEl.addEventListener('pointerup',finish);pointerEl.addEventListener('pointercancel',finish);
}
function selectWordBold(key){
 const nd=getNode(key);if(!nd)return;
 const sel=window.getSelection(),inText=sel&&sel.rangeCount&&nd.edit.contains(sel.anchorNode)&&nd.edit.contains(sel.focusNode);
 if(inText){nd.edit.focus();document.execCommand('bold',false,null);updateModel(key,readMarkdown(nd.edit))}
 else{const p=ensurePage(page());p.textStyles[key]??={};const st=styleFor(p,key);p.textStyles[key].bold=!st.bold;scheduleSave();queueRender()}
 updateToolbar();
}
function changeStyle(key,changes){
 const p=ensurePage(page());p.textStyles[key]??={};Object.assign(p.textStyles[key],changes);scheduleSave();queueRender();updateToolbar()
}
function updateToolbar(){
 if(!toolbar||toolbar.classList.contains('hidden'))return;
 const key=toolbar.dataset.key;if(!key||!page())return;
 const st=styleFor(page(),key),o=offsetFor(page(),key);
 toolbar.querySelector('[data-font]').value=st.family;
 toolbar.querySelector('[data-size]').value=Math.round(st.fontSize);
 toolbar.querySelector('[data-rotation]').textContent=Math.round(o.rot||0)+'°';
 toolbar.querySelector('[data-bold]').classList.toggle('is-on',st.bold);
}
function makeToolbar(){
 toolbar=document.createElement('div');toolbar.className='kura-selection-toolbar hidden';toolbar.setAttribute('role','toolbar');toolbar.innerHTML='<span class="kura-bar-grip">⋮⋮</span><select data-font title="Font"><option>Montserrat</option><option>Feeling Passionate</option><option>Caveat</option></select><button type="button" data-minus title="Riduci dimensione">−</button><input data-size type="number" min="10" max="160" step="1" aria-label="Dimensione del testo"/><button type="button" data-plus title="Aumenta dimensione">＋</button><button type="button" data-bold title="Grassetto (anche sulla selezione)">B</button><span class="kura-control-label" data-rotation>0°</span><button type="button" data-reset title="Reimposta posizione">↺</button><button type="button" data-close title="Chiudi">×</button>';
 document.querySelector('.stage-inner').appendChild(toolbar);
 for(const n of toolbar.querySelectorAll('button'))n.addEventListener('pointerdown',function(e){e.preventDefault()});
 toolbar.querySelector('[data-minus]').onclick=function(){const key=toolbar.dataset.key;changeStyle(key,{fontSize:safeNumber(styleFor(page(),key).fontSize-2,10,160,30)})};
 toolbar.querySelector('[data-plus]').onclick=function(){const key=toolbar.dataset.key;changeStyle(key,{fontSize:safeNumber(styleFor(page(),key).fontSize+2,10,160,30)})};
 toolbar.querySelector('[data-font]').onchange=function(e){changeStyle(toolbar.dataset.key,{family:e.target.value})};
 toolbar.querySelector('[data-size]').onchange=function(e){changeStyle(toolbar.dataset.key,{fontSize:safeNumber(e.target.value,10,160,30)})};
 toolbar.querySelector('[data-bold]').onclick=function(){selectWordBold(toolbar.dataset.key)};
 toolbar.querySelector('[data-reset]').onclick=function(){const k=toolbar.dataset.key, p=page(),f=freeItem(p,k);snapshot();if(f){f.rot=0;f.scale=1}else{p.offsets[k]={dx:0,dy:0,scale:1,rot:0,opacity:1}}refreshAll()};
 toolbar.querySelector('[data-close]').onclick=function(){selected=null;toolbar.classList.add('hidden');activeKey=null;document.activeElement?.blur();queueRender()};
}
function showToolbar(key){if(!toolbar)makeToolbar();toolbar.dataset.key=key;toolbar.classList.remove('hidden');updateToolbar();positionToolbar()}
function positionToolbar(){
 if(!toolbar||toolbar.classList.contains('hidden'))return;
 const p=page(),key=toolbar.dataset.key,r=textRect(p,key);if(!r)return;
 const scale=stageScale(),stageWidth=canvas.getBoundingClientRect().width;
 const barWidth=toolbar.offsetWidth||350,barHeight=toolbar.offsetHeight||45;
 const x=Math.max(3,Math.min(stageWidth-barWidth-3,r.x*scale));
 let y=r.y*scale-barHeight-10;if(y<4)y=(r.y+r.h)*scale+10;if(y>H*scale-barHeight)y=Math.max(4,H*scale-barHeight-4);
 toolbar.style.left=x+'px';toolbar.style.top=y+'px';
}
function showContextMenu(e,key){
 hideContext();const menu=document.createElement('div');menu.className='kura-context-menu';menu.innerHTML='<button data-act="bold">B  Grassetto selezione</button><button data-act="plus">A+  Aumenta font</button><button data-act="minus">A−  Riduci font</button><button data-act="reset">↺  Azzera rotazione</button>';
 document.body.appendChild(menu);ctxMenu=menu;const x=Math.min(innerWidth-205,e.clientX),y=Math.min(innerHeight-180,e.clientY);menu.style.left=Math.max(0,x)+'px';menu.style.top=Math.max(0,y)+'px';
 for(const btn of menu.querySelectorAll('button')){btn.addEventListener('pointerdown',function(ev){ev.preventDefault()});btn.onclick=function(){
  const action=btn.dataset.act;
  if(action==='bold')selectWordBold(key);
  if(action==='plus')changeStyle(key,{fontSize:styleFor(page(),key).fontSize+2});
  if(action==='minus')changeStyle(key,{fontSize:styleFor(page(),key).fontSize-2});
  if(action==='reset'){const o=offsetFor(page(),key);o.rot=0;queueRender();scheduleSave()}
  hideContext();
 }}
}
document.addEventListener('pointerdown',function(e){if(ctxMenu&&!ctxMenu.contains(e.target))hideContext()});
function updateOverlays(){
 const p=page();if(!p||!overlay)return;ensurePage(p);
 const width=canvas.getBoundingClientRect().width;overlay.style.transform='scale('+(width/W)+')';
 if(shownPage!==p.id){overlay.querySelectorAll('.kura-text-frame').forEach(function(el){el.remove()});nodeMap.clear();shownPage=p.id;activeKey=null;toolbar?.classList.add('hidden')}
 const keys=textKeys(p),valid=new Set(keys);
 for(const [key,obj] of nodeMap){if(!valid.has(key)){obj.frame.remove();nodeMap.delete(key)}}
 for(const key of keys){
  const rect=textRect(p,key);if(!rect)continue;
  const o=offsetFor(p,key),st=styleFor(p,key),nd=nodeMap.get(key)||attachFrame(key);
  nd.frame.style.left=rect.x+'px';nd.frame.style.top=rect.y+'px';nd.frame.style.width=rect.w+'px';nd.frame.style.height=rect.h+'px';nd.frame.style.transform='rotate('+(o.rot||0)+'deg)';
  nd.frame.classList.toggle('is-selected',selected==='text:'+key);
  const scale=width/W,inv=1/scale;
  for(const button of nd.frame.querySelectorAll('.kura-manip-handle'))button.style.transform='scale('+inv+')';
  for(const button of nd.frame.querySelectorAll('.kura-move-handle,.kura-rotate-handle'))button.style.top=(rect.y*scale<50?5:-41*inv)+'px';
  nd.edit.style.setProperty('--kura-ink',st.color);
  nd.edit.style.fontSize=(metrics.get(key)||st.fontSize)+'px';
  nd.edit.style.lineHeight=String(st.lineHeight);
  nd.edit.style.fontFamily='"'+effectiveFamily(st)+'",sans-serif';
  nd.edit.style.fontWeight=st.bold?'800':'500';
  nd.edit.style.opacity=String(safeNumber(o.opacity,0,1,1));
  if(activeKey!==key){const raw=rawFor(p,key);if(nd.edit.dataset.lastRaw!==raw){nd.edit.innerHTML=markdownHTML(raw);nd.edit.dataset.lastRaw=raw}}
  nd.edit.classList.toggle('editing',activeKey===key);
 }
 if(selected&&selected.startsWith('text:')&&valid.has(selected.slice(5))){showToolbar(selected.slice(5))}
 else if(toolbar)toolbar.classList.add('hidden');
 positionToolbar();
}
function initOverlay(){
 const stage=document.querySelector('.stage-inner');if(!stage)return;
 overlay=document.createElement('div');overlay.className='kura-overlays';overlay.id='kuraTextOverlays';stage.appendChild(overlay);makeToolbar();
 new ResizeObserver(function(){updateOverlays()}).observe(canvas);
}
function resetSelection(){activeKey=null;selected=null;shownPage=null;queueRender()}
function addFreeText(){
 snapshot();const p=ensurePage(page()),id=uuid(),f={id:id,text:'Nuovo testo',x:170,y:545,w:470,h:92,rot:0,scale:1,opacity:1};
 p.freeTexts.push(f);selected='text:free:'+id;refreshAll();emitToast('Nuova casella di testo: clicca per scrivere')
}
const originalElementById=elementById;
elementById=function(id){if(id?.startsWith('text:free:')){const f=freeItem(page(),id.slice(5));return f?{id:id,type:'text',model:f,label:'Testo libero'}:null}return originalElementById(id)};
const originalDelete=deleteSelected;
deleteSelected=function(){if(selected?.startsWith('text:free:')){snapshot();const id=selected.slice(10),p=page();p.freeTexts=p.freeTexts.filter(function(x){return x.id!==id});delete p.textStyles['free:'+id];selected=null;refreshAll();return}originalDelete()};
const originalQueue=queueRender;
queueRender=function(){originalQueue();requestAnimationFrame(updateOverlays)};
const originalRefresh=refreshAll;
refreshAll=function(){if(page())ensurePage(page());originalRefresh();requestAnimationFrame(updateOverlays)};
const originalAddPage=addPage;
addPage=function(layout){originalAddPage(layout);ensurePage(page());const used=new Set(pages.slice(Math.max(0,current-3),current).map(x=>x.background));const options=Array.from({length:16},(_,i)=>i).filter(i=>!used.has(i));page().background=options[hashSeed(page().seed)%options.length];page().backgroundId=BACKGROUND_PRESETS[page().background].id;page().seasonHint=BACKGROUND_PRESETS[page().background].season;refreshGalleries();queueRender();scheduleSave()};
const originalApplySeed=applySeed;
applySeed=function(seed,random){originalApplySeed(seed,random);selectSeasonBackground(page(),page().seasonHint||'auto');let bg=page().background;if(pages.length>1){const neighbor=pages[current===0?1:current-1];if(bg===neighbor.background)selectSeasonBackground(page(),page().seasonHint||'auto')}refreshGalleries();queueRender();scheduleSave()};
const originalStickerGrid=refreshStickerGrid;
refreshStickerGrid=function(){
 const root=$('#stickerGrid');if(!root)return;root.innerHTML='';
 const originals=stickerDefs.filter(x=>!NEW_STICKERS.some(n=>n[0]===x[0]));
 const seasonal=(kind)=>NEW_STICKERS.filter(x=>x[0].startsWith(kind+'_'));
 const sets=[['basic','ORIGINALI KURA',originals],['spring','PRIMAVERA',seasonal('spring')],['summer','ESTATE',seasonal('summer')],['autumn','AUTUNNO',seasonal('autumn')],['winter','INVERNO',seasonal('winter')]];
 for(const[season,heading,items]of sets){
  const title=document.createElement('div');title.className='kura-sticker-group';title.textContent=heading;title.style.gridColumn='1 / -1';title.style.fontSize='11px';title.style.fontWeight='850';title.style.marginTop='8px';title.style.color='#173d2e';root.appendChild(title);
  for(const[key,name]of items){
   const b=document.createElement('button');b.className='sticker-btn';b.type='button';b.title='Aggiungi '+name;b.dataset.stickerId=key;b.dataset.season=season;
   const im=document.createElement('img');im.alt=name;im.loading='lazy';im.decoding='async';im.src=ASSETS['sticker_'+key];b.appendChild(im);b.onclick=()=>addSticker(key);root.appendChild(b);
  }
 }
};
const originalRegenerateDecorations=regenerateDecorations;
regenerateDecorations=function(addNew){
 originalRegenerateDecorations(addNew);if(!addNew)return;
 const p=page(),s=inferKuraSeason(p);
 const seasonal={spring:['spring_blossom_branch','spring_pink_petals'],summer:['summer_lemon_branch','summer_swallow'],autumn:['autumn_maple_leaf','autumn_purple_grapes'],winter:['winter_snowy_pine','winter_paper_snowflake'],basic:['olive','map']};
 const picks=seasonal[s]||seasonal.basic;
 p.stickers.forEach((st,i)=>{if(i<2)st.key='sticker_'+picks[i]});
};
const originalRefreshGalleries=refreshGalleries;
refreshGalleries=function(){
 originalRefreshGalleries();
 const root=$('#bgGallery');if(!root)return;root.innerHTML='';
 for(const [season,heading] of KURA_SEASONS){
  const group=document.createElement('div');group.style.cssText='width:100%;flex:0 0 100%;font-size:11px;font-weight:900;letter-spacing:.06em;color:#173d2e;margin-top:7px';group.textContent=heading.toUpperCase();root.appendChild(group);
  BACKGROUND_PRESETS.forEach((p,i)=>{
   if(p.season!==season)return;
   const b=document.createElement('button');b.className='thumb '+(page().background===i?'active':'');b.title=p.name;b.dataset.backgroundId=p.id;
   const sample=document.createElement('img');sample.className='kura-bg-procedural';sample.alt=p.name;sample.loading='lazy';sample.src=i<4?ASSETS['sfondo_'+(i+1)]:ASSETS['sfondo_'+p.id];b.appendChild(sample);const label=document.createElement('small');label.textContent=p.name;b.appendChild(label);
   b.onclick=()=>{snapshot();page().background=i;page().backgroundId=p.id;page().seasonHint=p.season;refreshGalleries();queueRender();scheduleSave()};root.appendChild(b);
  })
 }
 root.style.flexWrap='wrap';
};
function inferKuraSeason(p){
 if(p.seasonHint&&p.seasonHint!=='auto')return p.seasonHint;
 const text=[p.name,...Object.values(p.fields||{})].join(' ').toLowerCase();
 if(/dicembre|gennaio|febbraio|neve|inverno|winter|snow/.test(text))return'winter';
 if(/marzo|aprile|maggio|primavera|spring|fiori/.test(text))return'spring';
 if(/giugno|luglio|agosto|estate|summer|mare|spiaggia/.test(text))return'summer';
 if(/settembre|ottobre|novembre|autunno|autumn|vendemmia|foliage/.test(text))return'autumn';
 return'basic';
}
function selectSeasonBackground(p,season='auto'){
 const target=season==='auto'?inferKuraSeason(p):season;
 const variants=BACKGROUND_PRESETS.map((preset,index)=>({...preset,index})).filter(x=>x.season===target);
 const adjacent=pages.filter(other=>other!==p).slice(-3).map(other=>other.background);
 const available=variants.filter(x=>!adjacent.includes(x.index));
 const list=available.length?available:variants;const chosen=list[hashSeed(p.seed+p.id)%list.length]||BACKGROUND_PRESETS[0];
 p.background=chosen.index??0;p.backgroundId=chosen.id;p.seasonHint=target;return chosen.id
}
function projectLabel(x){return x.name+' · '+new Date(x.updatedAt||Date.now()).toLocaleDateString('it-IT')}
function showProjectOptions(){
 const sel=$('#kuraProjectSelect');if(!sel)return;sel.innerHTML='';
 for(const item of pIndex){const op=document.createElement('option');op.value=item.id;op.textContent=projectLabel(item);sel.appendChild(op)}
 sel.value=currentProjectId||'';
}
async function persistNow(){
 if(!managerReady)return;
 if(savingNow){saveAgain=true;return}
 savingNow=true;let saved=false;
 try{
  const pkg=exportProject();pkg.projectId=currentProjectId;pkg.projectName=pIndex.find(x=>x.id===currentProjectId)?.name||'Carosello KURA';pkg.savedAt=new Date().toISOString();
  saved=await dbPut('project',pkg);if(currentProjectId)saved=(await dbPut('kura:v2:project:'+currentProjectId,pkg))&&saved;
  const rec=pIndex.find(x=>x.id===currentProjectId);if(rec)rec.updatedAt=Date.now();
  await dbPut('kura:v2:index',pIndex);await dbPut('kura:v2:active',currentProjectId);
  try{if(!saved)localStorage.setItem('kura:v2:recovery',JSON.stringify(pkg))}catch(_){}
  const el=$('#kuraSaveStatus');if(el)el.textContent=saved?'✓ Salvato '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'⚠ Esporta JSON';
 }catch(err){console.warn('KURA save failed',err);const el=$('#kuraSaveStatus');if(el)el.textContent='⚠ Esporta JSON'}
 finally{savingNow=false;if(saveAgain){saveAgain=false;scheduleSave()}}
}
scheduleSave=function(){
 if(!managerReady)return;clearTimeout(saveTimer);const el=$('#kuraSaveStatus');if(el)el.textContent='● Da salvare';saveTimer=setTimeout(persistNow,650)
};
async function switchProject(id){
 if(!pIndex.some(x=>x.id===id))return;
 clearTimeout(saveTimer);await persistNow();
 let pkg=await dbGet('kura:v2:project:'+id);
 if(!pkg?.pages?.length){emitToast('Progetto non disponibile nel browser');return}
 currentProjectId=id;
 pages=pkg.pages.map(normalizePage).map(ensurePage);current=0;selected=null;activeKey=null;history=[];future=[];updateHistory();
 for(const [k,v]of Object.entries(pkg.customAssets||{}))if(k.startsWith('custom_')&&typeof v==='string'&&v.startsWith('data:image/')){ASSETS[k]=v;imageCache.delete(k);assetImage(k)}
 shownPage=null;refreshAll();showProjectOptions();await dbPut('kura:v2:active',id);emitToast('Progetto aperto');
}
async function newProject(){
 clearTimeout(saveTimer);await persistNow();const id=uuid();
 pIndex.push({id:id,name:'Nuovo carosello',updatedAt:Date.now()});currentProjectId=id;pages=[ensurePage(makePage(0))];current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
 page().background=4+(hashSeed(id)%8);refreshAll();showProjectOptions();await persistNow();emitToast('Nuovo progetto creato')
}
function projectPanel(){
 const tab=$('#tab-pages'),reference=$('#pageList');if(!tab||!reference)return;
 const panel=document.createElement('div');panel.className='kura-project-panel';panel.innerHTML='<div class="section-title">Progetti nel browser</div><div class="kura-project-row"><select id="kuraProjectSelect" aria-label="Scegli progetto"></select><button class="btn flat small" id="kuraProjectNew">＋ Nuovo</button></div><div class="kura-project-row"><button class="btn flat small" id="kuraProjectRename">Rinomina</button><button class="btn flat small" id="kuraProjectDuplicate">Duplica</button><button class="btn flat small danger" id="kuraProjectDelete">Elimina</button><button class="btn flat small" id="kuraProjectExport">↓ Esporta progetto</button></div><p class="hint">Salvataggio automatico locale. Per passare a un altro dispositivo esporta il progetto JSON e riaprilo lì.</p>';
 tab.insertBefore(panel,reference.previousElementSibling);
 $('#kuraProjectSelect').onchange=function(e){switchProject(e.target.value)};
 $('#kuraProjectNew').onclick=newProject;
 $('#kuraProjectRename').onclick=async function(){const item=pIndex.find(x=>x.id===currentProjectId);if(!item)return;const next=prompt('Nome progetto',item.name);if(!next?.trim())return;item.name=next.trim().slice(0,80);showProjectOptions();scheduleSave()};
 $('#kuraProjectDuplicate').onclick=async function(){await persistNow();const source=exportProject(),item=pIndex.find(x=>x.id===currentProjectId);const id=uuid();currentProjectId=id;pIndex.push({id:id,name:(item?.name||'Carosello')+' · copia',updatedAt:Date.now()});pages=source.pages.map(normalizePage).map(ensurePage);for(const p of pages)p.id=uuid();current=0;selected=null;shownPage=null;history=[];future=[];updateHistory();refreshAll();showProjectOptions();await persistNow();emitToast('Copia creata')};
 $('#kuraProjectDelete').onclick=async function(){if(pIndex.length===1){emitToast('Mantieni almeno un progetto');return}const item=pIndex.find(x=>x.id===currentProjectId);if(!confirm('Eliminare il progetto "'+item.name+'"?'))return;await dbDelete('kura:v2:project:'+currentProjectId);pIndex=pIndex.filter(x=>x.id!==currentProjectId);currentProjectId=pIndex[0].id;const target=await dbGet('kura:v2:project:'+currentProjectId);pages=target?.pages?.map(normalizePage).map(ensurePage)||[newDemo()];current=0;selected=null;shownPage=null;history=[];future=[];updateHistory();refreshAll();showProjectOptions();await persistNow()};
 $('#kuraProjectExport').onclick=function(){download(jsonFile(),'KURA_PROGETTO_'+fileSafe(pIndex.find(x=>x.id===currentProjectId)?.name||'carosello')+'.json')};
}
async function initManager(){
 const status=document.createElement('span');status.id='kuraSaveStatus';status.className='kura-saved-label';status.textContent='Caricamento…';document.querySelector('.top-actions')?.appendChild(status);
 projectPanel();
 for(let n=0;n<50&&!db;n++)await new Promise(function(r){setTimeout(r,75)});
 let index=await dbGet('kura:v2:index');let active=await dbGet('kura:v2:active');
 if(Array.isArray(index)&&index.length){
  pIndex=index;currentProjectId=index.some(x=>x.id===active)?active:index[0].id;
  const pkg=await dbGet('kura:v2:project:'+currentProjectId);
  if(pkg?.pages?.length){pages=pkg.pages.map(normalizePage).map(ensurePage);current=0;for(const[k,v]of Object.entries(pkg.customAssets||{}))if(k.startsWith('custom_')&&typeof v==='string'&&v.startsWith('data:image/')){ASSETS[k]=v;imageCache.delete(k);assetImage(k)}}
 }else{
  let legacy=await dbGet('project');if(!legacy?.pages?.length){try{legacy=JSON.parse(localStorage.getItem('kura:v2:recovery'))}catch(_){}}
  if(legacy?.pages?.length){pages=legacy.pages.map(normalizePage).map(ensurePage);for(const[k,v]of Object.entries(legacy.customAssets||{}))ASSETS[k]=v}
  const id=uuid();pIndex=[{id:id,name:legacy?.projectName||'Il mio primo carosello',updatedAt:Date.now()}];currentProjectId=id
 }
 managerReady=true;shownPage=null;refreshAll();showProjectOptions();await persistNow();
}
const originalNormalize=normalizePage;
normalizePage=function(p){const out=originalNormalize(p);out.background=safeNumber(p.background,0,15,out.background);out.backgroundId=BACKGROUND_PRESETS.find(x=>x.id===p.backgroundId)?.id||BACKGROUND_PRESETS[out.background].id;out.seasonHint=p.seasonHint||BACKGROUND_PRESETS[out.background].season;out.textStyles=p.textStyles&&typeof p.textStyles==='object'?deepClone(p.textStyles):{};out.freeTexts=Array.isArray(p.freeTexts)?deepClone(p.freeTexts):[];return ensurePage(out)};
const originalImportFast=importFast;
importFast=function(obj){originalImportFast(obj);pages.forEach(ensurePage);shownPage=null;refreshAll();scheduleSave()};
const originalExportProject=exportProject;
exportProject=function(){const o=originalExportProject();o.format='KURA_EDITOR_V2';o.version=2;o.schemaVersion=2;o.projectId=currentProjectId;o.projectName=pIndex.find(x=>x.id===currentProjectId)?.name||'Carosello KURA';return o};
const originalUndo=undo,originalRedo=redo;
undo=function(){originalUndo();shownPage=null;queueRender()};
redo=function(){originalRedo();shownPage=null;queueRender()};
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&managerReady){clearTimeout(saveTimer);persistNow()}});
function addV2Controls(){
 const textTab=$('#tab-texts');if(textTab){const b=document.createElement('button');b.className='btn flat';b.style.width='100%';b.textContent='＋ Aggiungi casella di testo';b.onclick=addFreeText;textTab.insertBefore(b,textTab.firstElementChild.nextElementSibling)}
 const fontBox=$('#fontStatus');if(fontBox){const info=document.createElement('div');info.className='kura-font-alert';info.innerHTML='Il font Feeling Passionate viene distribuito a tutti solo se è installato sul sito con licenza web/app e file autorizzato. Altrimenti il titolo usa temporaneamente Caveat, senza cambiare il nome del font nel progetto.';fontBox.after(info)}
}
async function checkHostedFont(){try{const r=await fetch('./assets/Kura_Brush2.woff2?v=2.5.0',{cache:'force-cache'});if(r.ok){fontReadyFromHost=await installFont(await r.arrayBuffer(),true);if(fontReadyFromHost){const box=$('#fontStatus');box.innerHTML='<b>KURA Brush2 <span class="pill ok">Integrato ✓</span></b><p>Font completo caricato automaticamente dal sito e usato anche nell’esportazione PNG.</p>'}}}catch(_){}}
function assertPage(op){const p=op.pageId?pages.find(x=>x.id===op.pageId):pages[Number.isInteger(op.pageIndex)?op.pageIndex:current];if(!p)throw Error('Pagina non trovata');return ensurePage(p)}
function safeStylePatch(style){const out={};if(!style||typeof style!=='object')return out;if(style.fontSize!==undefined)out.fontSize=safeNumber(style.fontSize,10,160,30);if(['Montserrat','KURA Brush2','Feeling Passionate','Caveat'].includes(style.family))out.family=style.family==='Feeling Passionate'?'KURA Brush2':style.family;if(typeof style.bold==='boolean')out.bold=style.bold;if(/^#[0-9a-fA-F]{6}$/.test(style.color||''))out.color=style.color;if(style.lineHeight!==undefined)out.lineHeight=safeNumber(style.lineHeight,.8,2.5,1.2);return out}
window.KURA_MCP=Object.freeze({
 apiVersion:'2.5',contract:'./mcp-contract.json',
 getProject:function(){return deepClone(exportProject())},
 inspect:function(){return{apiVersion:'2.5',pageIds:pages.map(x=>x.id),editableTextKeys:STANDARD,backgroundCount:16,backgroundPresets:BACKGROUND_PRESETS.map(x=>({id:x.id,name:x.name,season:x.season,tags:x.tags})),backgroundNames:BACKGROUND_PRESETS.map(x=>x.name),layoutIds:LAYOUTS.map(x=>x.id),decorations:stickerDefs.map(x=>({id:x[0],name:x[1]})),actions:['setText','setBackground','setBackgroundId','setSeason','addSticker','addText','moveElement','setPageName','addPage']}},
 applyPatch:function(operations){
  if(!Array.isArray(operations)||operations.length>200)throw Error('Sono necessarie 1-200 operazioni');
  const before=JSON.stringify({pages,current});let count=0;
  for(const op of operations){if(!op||typeof op!=='object')throw Error('Operazione non valida');
   if(op.op==='addPage'){const layout=LAYOUTS.findIndex(x=>x.id===op.layout);const p=ensurePage(makePage(layout<0?0:layout));if(typeof op.name==='string')p.name=op.name;pages.push(p);count++;continue}
   const p=assertPage(op);
   if(op.op==='setText'){const key=String(op.key||'');if(!STANDARD.includes(key)&&!freeItem(p,key))throw Error('Chiave testo non ammessa: '+key);if(typeof op.text==='string'){const f=freeItem(p,key);if(f)f.text=op.text;else p.fields[key]=op.text}if(op.style)p.textStyles[key]=Object.assign({},p.textStyles[key],safeStylePatch(op.style));count++;continue}
   if(op.op==='setBackground'){p.background=safeNumber(op.background,0,15,0);p.backgroundId=BACKGROUND_PRESETS[p.background].id;p.seasonHint=BACKGROUND_PRESETS[p.background].season;count++;continue}
   if(op.op==='setBackgroundId'){const ix=BACKGROUND_PRESETS.findIndex(x=>x.id===op.backgroundId);if(ix<0)throw Error('Sfondo non disponibile: '+op.backgroundId);p.background=ix;p.backgroundId=BACKGROUND_PRESETS[ix].id;p.seasonHint=BACKGROUND_PRESETS[ix].season;count++;continue}
   if(op.op==='setSeason'){selectSeasonBackground(p,op.season||'auto');count++;continue}
   if(op.op==='addSticker'){
     const key=String(op.key||'');if(!stickerDefs.some(x=>x[0]===key))throw Error('Decorazione non disponibile: '+key);
     p.stickers.push({id:uuid(),key:'sticker_'+key,x:safeNumber(op.x,-200,W,870),y:safeNumber(op.y,-200,H,1120),w:safeNumber(op.w,20,900,140),h:0,rot:safeNumber(op.rot,-180,180,0),scale:safeNumber(op.scale,.2,3,1),opacity:1});
     count++;continue
   }
   if(op.op==='setPageName'){p.name=String(op.name||'Pagina').slice(0,130);count++;continue}
   if(op.op==='addText'){const id=uuid();const f={id:id,text:String(op.text||'Nuovo testo'),x:safeNumber(op.x,-200,1080,160),y:safeNumber(op.y,-200,1350,560),w:safeNumber(op.w,50,1080,450),h:safeNumber(op.h,25,1350,90),rot:safeNumber(op.rot,-360,360,0),scale:1,opacity:1};p.freeTexts.push(f);p.textStyles['free:'+id]=safeStylePatch(op.style);count++;continue}
   if(op.op==='moveElement'){
     const id=String(op.id||'');let model=null;
     if(id.startsWith('text:')){const key=id.slice(5);if(!STANDARD.includes(key)&&!freeItem(p,key))throw Error('Testo non trovato');model=freeItem(p,key)||(p.offsets[key]??={dx:0,dy:0,rot:0,scale:1,opacity:1})}
     else if(['scene','postcard','note'].includes(id))model=p.visuals[id];
     else if(id.startsWith('sticker:'))model=p.stickers.find(x=>x.id===id.slice(8));
     if(!model)throw Error('Elemento non trovato: '+id);
     for(const k of ['x','y','dx','dy','rot','scale','opacity','w','h'])if(op[k]!==undefined){if(k==='scale')model[k]=safeNumber(op[k],.2,3,1);else if(k==='opacity')model[k]=safeNumber(op[k],0,1,1);else model[k]=safeNumber(op[k],-2000,3000,0)}
     count++;continue
   }
   throw Error('Operazione non supportata: '+op.op)
  }
  history.push(before);if(history.length>45)history.shift();future=[];selected=null;shownPage=null;refreshAll();return{ok:true,changed:count,projectId:currentProjectId,pageIds:pages.map(x=>x.id)}
 },
 importProject:function(data){importFast(deepClone(data));return{ok:true,projectId:currentProjectId,pages:pages.length}},
 save:function(){return persistNow()},
 exportJSON:function(){return JSON.stringify(exportProject(),null,2)}
});
window.KURA_V2={version:'2.5.0',drawKuraBackground:drawKuraBackground,paintEditable:paintEditable,paintFreeTexts:paintFreeTexts};
addV2Controls();initOverlay();
(function(){
 const top=document.querySelector('.top-actions');
 if(top&&!document.getElementById('kuraCoverLaunch')){
  const link=document.createElement('a');link.id='kuraCoverLaunch';link.href='./covers.html';link.className='btn ghost';link.textContent='✂ Copertine';
  link.setAttribute('aria-label','Apri editor copertine KURA');top.insertBefore(link,top.querySelector('#topJson')||null);
 }
})();
window.addEventListener('load',function(){initManager();checkHostedFont();});
})();
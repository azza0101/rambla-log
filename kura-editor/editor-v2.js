/* KURA Editor v2.0 — DOM text editing, rich selection, procedural paper, saved projects, MCP contract.
   Expects the v1 editor's globals in index.html. No external runtime or API keys. */
'use strict';
(function(){
const V2_VERSION='4.4.0';
const NOTE_LABELS={label_base:'Base',label_duration:'Durata',label_highlight:'Da non perdere',label_tips:'Da sapere'};
const STANDARD=['note_title','eyebrow','head1','body1','head2','body2','label_base','base','label_duration','duration','label_highlight','highlight','label_tips','tips'];
const PAPER=[{"id":"basic_1","name":"Basic 1 · Avorio","season":"basic","colors":["#f7f0e4","#f2e8d9"],"fibers":"#b4a692","direction":0,"tags":["basic","basic 1 · avorio"]},{"id":"basic_2","name":"Basic 2 · Salvia","season":"basic","colors":["#e9eee4","#f5f3e9"],"fibers":"#a0a995","direction":1,"tags":["basic","basic 2 · salvia"]},{"id":"basic_3","name":"Basic 3 · Sabbia","season":"basic","colors":["#f3e7dc","#f9f2e9"],"fibers":"#bc9b89","direction":2,"tags":["basic","basic 3 · sabbia"]},{"id":"basic_4","name":"Basic 4 · Perla","season":"basic","colors":["#f1f1eb","#e6ece5"],"fibers":"#aeb7ae","direction":3,"tags":["basic","basic 4 · perla"]},{"id":"spring_1","name":"Primavera 1 · Boccioli","season":"spring","colors":["#f5efe4","#dce7d7"],"fibers":"#98b689","direction":0,"tags":["spring","primavera 1 · boccioli"]},{"id":"spring_2","name":"Primavera 2 · Botanica","season":"spring","colors":["#edf2e3","#d5e2c7"],"fibers":"#9bb88d","direction":1,"tags":["spring","primavera 2 · botanica"]},{"id":"spring_3","name":"Primavera 3 · Luce","season":"spring","colors":["#f8f2df","#e9eedb"],"fibers":"#aabf9e","direction":2,"tags":["spring","primavera 3 · luce"]},{"id":"summer_1","name":"Estate 1 · Mediterranea","season":"summer","colors":["#f9efd9","#dfe9eb"],"fibers":"#91b0b4","direction":3,"tags":["summer","estate 1 · mediterranea"]},{"id":"summer_2","name":"Estate 2 · Sabbia","season":"summer","colors":["#f4ead6","#efd7b4"],"fibers":"#cfaa78","direction":0,"tags":["summer","estate 2 · sabbia"]},{"id":"summer_3","name":"Estate 3 · Agrumi","season":"summer","colors":["#fff1d9","#f2d59c"],"fibers":"#d29c5d","direction":1,"tags":["summer","estate 3 · agrumi"]},{"id":"autumn_1","name":"Autunno 1 · Terracotta","season":"autumn","colors":["#f3e3d7","#d8b59c"],"fibers":"#bd835d","direction":2,"tags":["autumn","autunno 1 · terracotta"]},{"id":"autumn_2","name":"Autunno 2 · Olivato","season":"autumn","colors":["#ece7d5","#c4c59e"],"fibers":"#8d9b68","direction":3,"tags":["autumn","autunno 2 · olivato"]},{"id":"autumn_3","name":"Autunno 3 · Vendemmia","season":"autumn","colors":["#f2e8dc","#c8a88b"],"fibers":"#9a7c66","direction":0,"tags":["autumn","autunno 3 · vendemmia"]},{"id":"winter_1","name":"Inverno 1 · Nebbia","season":"winter","colors":["#eff0ee","#d9dedd"],"fibers":"#9eafac","direction":1,"tags":["winter","inverno 1 · nebbia"]},{"id":"winter_2","name":"Inverno 2 · Bosco","season":"winter","colors":["#e7ece8","#cbd7cf"],"fibers":"#849e90","direction":2,"tags":["winter","inverno 2 · bosco"]},{"id":"winter_3","name":"Inverno 3 · Ghiaccio","season":"winter","colors":["#f1f3f2","#dde5ea"],"fibers":"#a9bfcc","direction":3,"tags":["winter","inverno 3 · ghiaccio"]}];
const BACKGROUND_PRESETS=PAPER;
const NEW_STICKERS=[["spring_blossom_branch","Ramo di ciliegio"],["spring_blossom_cluster","Fiori di ciliegio"],["spring_tulips","Tulipani"],["spring_pink_petals","Petali rosa"],["summer_lemon_branch","Limoni mediterranei"],["summer_orange_slices","Agrumi sezionati"],["summer_paper_shell","Conchiglia di carta"],["summer_swallow","Rondine"],["autumn_maple_leaf","Foglia d'acero"],["autumn_purple_grapes","Grappolo d'uva"],["autumn_olive_branch","Ramo d'ulivo"],["autumn_wheat","Spighe"],["winter_paper_snowflake","Fiocco di neve"],["winter_snowy_pine","Ramo innevato"],["winter_pine_cones","Pigne"],["winter_holly_branch","Agrifoglio"]];
const LEGACY_STICKERS=['blossom','lavender','citrus','shell','autumn_leaf','grapes','snowflake','pine','ticket'];
const LEGACY_TO_REAL={blossom:'spring_blossom_branch',lavender:'spring_blossom_cluster',citrus:'summer_lemon_branch',shell:'summer_paper_shell',autumn_leaf:'autumn_maple_leaf',grapes:'autumn_purple_grapes',snowflake:'winter_paper_snowflake',pine:'winter_snowy_pine',ticket:'original_stamp'};
for(const p of BACKGROUND_PRESETS){if(p.season!=='basic')ASSETS['sfondo_'+p.id]='./assets/sfondo_'+p.id+'_paper_v3.svg?v=2.7.2'}
for(const [key,label] of NEW_STICKERS){ASSETS['sticker_'+key]='./assets/'+key+'.webp?v=2.5.0';if(!stickerDefs.some(x=>x[0]===key))stickerDefs.push([key,label])}
for(const [old,replacement]of Object.entries(LEGACY_TO_REAL))ASSETS['sticker_'+old]=replacement==='original_stamp'?ASSETS.sticker_stamp:ASSETS['sticker_'+replacement];

const KURA_BACKGROUND_COMPOSITIONS={"spring_1":{"base":1,"art":[["spring_blossom_branch",-55,-85,395,400,-8],["spring_pink_petals",840,1080,270,275,14]]},"spring_2":{"base":2,"art":[["spring_blossom_cluster",795,-48,320,330,14],["spring_tulips",-38,1090,278,280,-12]]},"spring_3":{"base":3,"art":[["spring_blossom_branch",-65,-45,370,390,17],["spring_tulips",858,1080,260,270,10]]},"summer_1":{"base":1,"art":[["summer_lemon_branch",806,-62,343,355,13],["summer_swallow",-40,1092,312,280,-10]]},"summer_2":{"base":2,"art":[["summer_orange_slices",-74,-28,325,305,-18],["summer_paper_shell",824,1088,294,292,12]]},"summer_3":{"base":3,"art":[["summer_lemon_branch",-50,-60,352,352,-12],["summer_orange_slices",820,1070,308,312,16]]},"autumn_1":{"base":4,"art":[["autumn_maple_leaf",-55,-70,335,350,-10],["autumn_purple_grapes",827,1075,290,305,8]]},"autumn_2":{"base":2,"art":[["autumn_olive_branch",796,-60,365,365,12],["autumn_wheat",-60,1100,320,310,-15]]},"autumn_3":{"base":3,"art":[["autumn_purple_grapes",-70,-90,340,355,-18],["autumn_maple_leaf",800,1065,315,335,16]]},"winter_1":{"base":4,"art":[["winter_snowy_pine",-65,-45,405,400,-12],["winter_paper_snowflake",838,1085,260,270,11]]},"winter_2":{"base":1,"art":[["winter_holly_branch",830,-85,315,350,16],["winter_pine_cones",-62,1075,345,352,-12]]},"winter_3":{"base":3,"art":[["winter_paper_snowflake",831,-25,250,250,15],["winter_snowy_pine",-65,1093,343,355,-14]]}};
const KURA_NOV26_ASSETS={giulia_vipacco_nov26:'./assets/novembre2026/giulia_vipacco.png',giulia_maiorca_nov26:'./assets/novembre2026/giulia_maiorca.png',giulia_kruger_nov26:'./assets/novembre2026/giulia_kruger.png',paesaggio_vipacco_nov26:'./assets/novembre2026/paesaggio_vipacco.webp',paesaggio_maiorca_nov26:'./assets/novembre2026/paesaggio_maiorca.webp',paesaggio_kruger_nov26:'./assets/novembre2026/paesaggio_kruger.webp',
 giulia_vipacco_border_nov26:'./assets/novembre2026/giulia_vipacco_border.png',
 giulia_maiorca_border_nov26:'./assets/novembre2026/giulia_maiorca_border.png',
 giulia_kruger_border_nov26:'./assets/novembre2026/giulia_kruger_border.png'};
for(const[k,url]of Object.entries(KURA_NOV26_ASSETS))ASSETS[k]=url;
const KURA_SEASONS=[['basic','Basic'],['spring','Primavera'],['summer','Estate'],['autumn','Autunno'],['winter','Inverno']];

let overlay=null, toolbar=null, ctxMenu=null, nodeMap=new Map(), activeKey=null, shownPage=null;
let pIndex=[], currentProjectId=null, currentProjectMeta={}, managerReady=false, savingNow=false, saveAgain=false;
let fontReadyFromHost=false;
const metrics=new Map();
function safeNumber(n,lo,hi,def){n=Number(n);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):def}
function ensurePage(p){if(!p)return p;p.fields=p.fields||{};p.offsets=p.offsets||{};p.textStyles=p.textStyles||{};p.groups=Array.isArray(p.groups)?p.groups:[];p.freeTexts=Array.isArray(p.freeTexts)?p.freeTexts:[];for(const k of Object.keys(NOTE_LABELS))if(typeof p.fields[k]!=='string')p.fields[k]=NOTE_LABELS[k];if(typeof p.fields.note_title!=='string')p.fields.note_title='INFO DI VIAGGIO';return p}
function freeItem(p,key){return key.startsWith('free:')?p.freeTexts.find(x=>x.id===key.slice(5)):null}
function rawFor(p,key){const item=freeItem(p,key);return item?String(item.text||''):String(p.fields[key]||'')}
function offsetFor(p,key){const f=freeItem(p,key);return f||p.offsets[key]||{}}
function defaultStyle(p,key){
 const s=p.noteScale||1,b=p.bodyScale||1;
 if(key==='note_title')return{fontSize:52,family:'KURA Brush2',fontWeight:400,bold:false,color:GREEN,lineHeight:1.06};
 if(key==='eyebrow')return{fontSize:32,family:'Montserrat',bold:true,color:GREEN,lineHeight:1.12};
 if(key==='head1'||key==='head2')return{fontSize:40,family:'Caveat Brush',bold:false,color:ORANGE,lineHeight:1.10};
 if(key==='body1'||key==='body2')return{fontSize:27*b,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.26};
 if(key.startsWith('label_'))return{fontSize:23*s,family:'Montserrat',bold:true,color:GREEN,lineHeight:1.12};
 if(['base','duration'].includes(key))return{fontSize:23*s,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.18};
 if(key.startsWith('free:'))return{fontSize:40,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.2};
 return{fontSize:22*s,family:'Montserrat',bold:false,color:GREEN,lineHeight:1.18};
}
function styleFor(p,key){
 const st=p.textStyles&&p.textStyles[key]||{},df=defaultStyle(p,key);
 if(key==='body1'||key==='body2')df.fontSize=commonBodyFontSize(p);
 if((key==='head1'||key==='head2')&&!st.family)st.family='Caveat Brush';
 return{fontSize:(key==='body1'||key==='body2'?df.fontSize:(KURA_NOTE_KEYS.has(key)&&Number.isFinite(st.fontSize)?safeNumber(st.fontSize*(p.noteScale||1),10,200,df.fontSize):safeNumber(st.fontSize,10,200,df.fontSize))),family:(st.family==='Feeling Passionate'?'KURA Brush2':(['Montserrat','KURA Brush2','KURA Brush Alt 1','KURA Brush Alt 2','KURA Custom Brush','Kaushan Script','Caveat Brush','Caveat'].includes(st.family)?st.family:df.family)),fontWeight:([400,700,800].includes(Number(st.fontWeight))?Number(st.fontWeight):(st.bold?700:400)),bold:typeof st.bold==='boolean'?st.bold:df.bold,color:/^#[0-9a-fA-F]{6}$/.test(st.color||'')?st.color:df.color,lineHeight:safeNumber(st.lineHeight,.8,2.5,df.lineHeight)};
}
// Both descriptive paragraphs always share one fitted font size.
// The original renderer shrank them independently, causing inconsistent typography.
function commonBodyFontSize(p){
 const scale=safeNumber(p.bodyScale,0.7,2,1);
 const a=Number(p.textStyles?.body1?.fontSize)||27;
 const b=Number(p.textStyles?.body2?.fontSize)||27;
 const max=Math.min(72,Math.max(16,Math.min(a,b)*scale));
 for(let fs=max;fs>=16;fs-=0.5){
  let fits=true;
  for(const key of ['body1','body2']){
   const rect=textRect(p,key);
   const lineH=safeNumber(p.textStyles?.[key]?.lineHeight,1,1.8,1.26);
   if(!rect||measureLines(ctx,rawFor(p,key),rect.w,fs,lineH,false,99,'Montserrat').length*fs*lineH>rect.h-3){fits=false;break;}
  }
  if(fits)return Math.round(fs*2)/2;
 }
 return 16;
}
function effectiveFamily(st){return st.family==='Kaushan Script'&&!document.fonts.check('39px "Kaushan Script"')?'Caveat Brush':st.family}
function textRect(p,key){
 ensurePage(p);const f=freeItem(p,key);
 if(key==='note_title'){
  const note=p.visuals.note,L=noteAutoLayout(note,p),o=p.offsets?.note_title||{};
  return{x:note.x+(L.w-360)/2+(o.dx||0),y:note.y+28+(o.dy||0),w:safeNumber(o.w,140,700,360),h:safeNumber(o.h,38,200,96)};
 }
 if(f)return{x:safeNumber(f.x,-1000,2100,150),y:safeNumber(f.y,-1000,2000,200),
  w:safeNumber(f.w,30,1600,450)*(f.scale||1),h:safeNumber(f.h,24,1600,100)*(f.scale||1)};
 const l=LAYOUTS[p.layout]||LAYOUTS[0],o=p.offsets[key]||{};
 let rect;
 if(l[key]){
  const z=box(l[key],p,key);
  rect=(key==='head1'||key==='head2')?{x:z.x+70,y:z.y,w:Math.max(60,z.w-72),h:z.h}:z;
 }else{
  const nk=key.startsWith('label_')?key.slice(6):key;
  if(!['base','duration','highlight','tips'].includes(nk))return null;
  const block=noteBlocks(p.visuals.note,p).find(v=>v.key===nk);
  if(!block)return null;
  const isLabel=key.startsWith('label_');
  rect={x:block.x,y:block.top+(isLabel?0:block.valueOffset),w:block.w,h:isLabel?block.labelHeight:block.height};
  rect.x+=o.dx||0;rect.y+=o.dy||0;
 }
 if(Number.isFinite(o.w))rect.w=safeNumber(o.w,32,1600,rect.w);
 if(Number.isFinite(o.h))rect.h=safeNumber(o.h,20,1600,rect.h);
 return rect;
}
function textKeys(p){ensurePage(p);const list=p.visuals.note.visible?STANDARD:STANDARD.filter(k=>!['label_base','base','label_duration','duration','label_highlight','highlight','label_tips','tips'].includes(k));return list.filter(k=>k!=='note_title'||p.noteTitleMode==='text').concat(p.freeTexts.map(x=>'free:'+x.id))}
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
function drawComposedPaper(c,index){
 const preset=BACKGROUND_PRESETS[index],com=KURA_BACKGROUND_COMPOSITIONS[preset?.id];if(!com)return false;
 const base=assetImage('sfondo_'+com.base);
 if(!base?.complete||!base.naturalWidth){c.fillStyle='#f8f0e5';c.fillRect(0,0,W,H);return true}
 c.drawImage(base,0,0,W,H);
 for(const[k,x,y,w,h,rot]of com.art){const im=assetImage('sticker_'+k);if(!im?.complete||!im.naturalWidth)continue;drawImageFit(c,im,x,y,w,h,rot,1)}
 return true;
}
function drawKuraBackground(c,index,mini=false){
 if(index<4){const im=assetImage('sfondo_'+(index+1));if(im?.complete&&im.naturalWidth)c.drawImage(im,0,0,W,H);else{c.fillStyle='#f7f0e5';c.fillRect(0,0,W,H)}return}
 if(drawComposedPaper(c,index))return;
 const fallback=assetImage('sfondo_'+BACKGROUND_PRESETS[index].id);
 if(fallback?.complete&&fallback.naturalWidth){c.drawImage(fallback,0,0,W,H);return}
 c.fillStyle='#f7f0e5';c.fillRect(0,0,W,H);
}
const KURA_NOTE_KEYS=new Set(['note_title','label_base','label_duration','label_highlight','label_tips','base','duration','highlight','tips']);
function noteVisualCenter(p){const n=p.visuals.note,L=noteAutoLayout(n,p);return{x:n.x+L.w/2,y:n.y+L.totalH/2,rotation:n.rot||0}}
function rotateAroundPoint(x,y,cx,cy,deg){const a=deg*Math.PI/180,dx=x-cx,dy=y-cy;return{x:cx+dx*Math.cos(a)-dy*Math.sin(a),y:cy+dx*Math.sin(a)+dy*Math.cos(a)}}
function paintEditable(c,p,key,raw,unusedRect,opt){
 ensurePage(p);const r=textRect(p,key);if(!r)return;
 const st=styleFor(p,key),o=offsetFor(p,key),isNoteText=KURA_NOTE_KEYS.has(key);
 if(c===ctx && p===page() && activeKey===key)return;
 c.save();
 let rotation=0,hitCenter={x:r.x+r.w/2,y:r.y+r.h/2};
 if(isNoteText){
  const note=noteVisualCenter(p);rotation=note.rotation;
  c.translate(note.x,note.y);c.rotate(rotation*Math.PI/180);c.translate(-note.x,-note.y);
  hitCenter=rotateAroundPoint(hitCenter.x,hitCenter.y,note.x,note.y,rotation);
 }
 c.globalAlpha=safeNumber(o.opacity,0,1,1);
 c.translate(r.x+r.w/2,r.y+r.h/2);c.rotate(safeNumber(o.rot,-360,360,0)*Math.PI/180);c.scale(o.flipX?-1:1,o.flipY?-1:1);
 if(key==='head1'||key==='head2')c.transform(1,0,-.13,1,0,0);
 const res=drawText(c,raw,{x:-r.w/2,y:-r.h/2,w:r.w,h:r.h},{
  fontSize:st.fontSize,minFont:(key==='body1'||key==='body2'||p.textStyles[key]?.fontSize)?st.fontSize:st.fontSize*.80,
  script:false,family:effectiveFamily(st),bold:st.bold,color:st.color,lineHeight:st.lineHeight,
  strokeWidth:st.family.startsWith('KURA Brush')?(st.fontWeight===800?Math.max(.9,st.fontSize*.039):st.fontWeight===700?Math.max(.5,st.fontSize*.019):0):(key==='head1'||key==='head2')?.23:(st.family==='Kaushan Script'?.20:0),brushFamily:st.family.startsWith('KURA Brush'),align:key==='note_title'?'center':'left',track:true,label:key
 });
 c.restore();if(c===ctx && p===page())metrics.set(key,res.fontSize);
 hitboxes.push({id:'text:'+key,x:hitCenter.x-r.w/2,y:hitCenter.y-r.h/2,w:r.w,h:r.h});
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
 const resize=document.createElement('button');resize.className='kura-manip-handle kura-resize-handle';resize.type='button';resize.textContent='⤡';resize.title='Modifica larghezza e altezza indipendentemente';frame.appendChild(resize);
 const wide=document.createElement('button');wide.className='kura-manip-handle kura-width-handle';wide.type='button';wide.textContent='↔';wide.title='Allarga solo in orizzontale';frame.appendChild(wide);
 const tall=document.createElement('button');tall.className='kura-manip-handle kura-height-handle';tall.type='button';tall.textContent='↕';tall.title='Allarga solo in verticale';frame.appendChild(tall);
 const flipH=document.createElement('button');flipH.className='kura-manip-handle kura-fliph-handle';flipH.type='button';flipH.textContent='⇋';flipH.title='Ribalta orizzontalmente';frame.appendChild(flipH);
 const flipV=document.createElement('button');flipV.className='kura-manip-handle kura-flipv-handle';flipV.type='button';flipV.textContent='⇅';flipV.title='Ribalta verticalmente';frame.appendChild(flipV);
 frame.addEventListener('pointerdown',function(e){if(e.target===frame){startGesture(e,key,'move')}else if(e.target===edit){selected='text:'+key;refreshInspector();showToolbar(key)}});
 edit.addEventListener('focus',function(){kuraMulti.clear();kuraUpdateGroupBox();activeKey=key;selected='text:'+key;frame.classList.add('is-editing');edit.classList.add('editing');refreshInspector();showToolbar(key);queueRender()});
 edit.addEventListener('input',function(){updateModel(key,readMarkdown(edit));updateToolbar()});
 edit.addEventListener('blur',function(){updateModel(key,readMarkdown(edit));if(activeKey===key)activeKey=null;frame.classList.remove('is-editing');edit.classList.remove('editing');queueRender()});
 edit.addEventListener('paste',function(e){e.preventDefault();const data=(e.clipboardData||window.clipboardData).getData('text/plain');document.execCommand('insertText',false,data)});
 edit.addEventListener('contextmenu',function(e){e.preventDefault();selected='text:'+key;refreshInspector();showContextMenu(e,key)});
 move.addEventListener('pointerdown',function(e){startGesture(e,key,'move')});
 rotate.addEventListener('pointerdown',function(e){startGesture(e,key,'rotate')});
 resize.addEventListener('pointerdown',function(e){startGesture(e,key,'resize')});wide.addEventListener('pointerdown',function(e){startGesture(e,key,'width')});tall.addEventListener('pointerdown',function(e){startGesture(e,key,'height')});flipH.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();const o=offsetFor(page(),key);snapshot();o.flipX=!o.flipX;queueRender();scheduleSave()});flipV.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();const o=offsetFor(page(),key);snapshot();o.flipY=!o.flipY;queueRender();scheduleSave()});
 overlay.appendChild(frame);nodeMap.set(key,{frame,edit});return nodeMap.get(key);
}
function stageScale(){const b=canvas.getBoundingClientRect();return Math.max(.1,b.width/W)}
function startGesture(e,key,action){
 e.preventDefault();e.stopPropagation();hideContext();
 const p=ensurePage(page()),f=freeItem(p,key),
 o=f||(p.offsets[key]??={dx:0,dy:0,scale:1,rot:0,opacity:1});
 const before=JSON.stringify({pages,current}),base=deepClone(o),start=xyFromPointer(e);
 const r=textRect(p,key),note=KURA_NOTE_KEYS.has(key)?noteVisualCenter(p):null;
 const center=note?rotateAroundPoint(r.x+r.w/2,r.y+r.h/2,note.x,note.y,note.rotation):{x:r.x+r.w/2,y:r.y+r.h/2};
 const ownRotation=(base.rot||0)+(note?.rotation||0);
 selected='text:'+key;refreshInspector();
 const h=e.currentTarget;h.setPointerCapture(e.pointerId);
 function moving(ev){
  const at=xyFromPointer(ev),dx=at.x-start.x,dy=at.y-start.y;
  const a=ownRotation*Math.PI/180,localX=dx*Math.cos(a)+dy*Math.sin(a),localY=-dx*Math.sin(a)+dy*Math.cos(a);
  if(action==='move'){
   const n=note?.rotation||0,ca=Math.cos(n*Math.PI/180),sa=Math.sin(n*Math.PI/180);
   const mdx=dx*ca+dy*sa,mdy=-dx*sa+dy*ca;
   if(f){o.x=(base.x||0)+dx;o.y=(base.y||0)+dy}
   else{o.dx=(base.dx||0)+mdx;o.dy=(base.dy||0)+mdy}
  }else if(action==='rotate'){
   const a0=Math.atan2(start.y-center.y,start.x-center.x),a1=Math.atan2(at.y-center.y,at.x-center.x);
   o.rot=Math.round((base.rot||0)+(a1-a0)*180/Math.PI);
  }else{
   const w=safeNumber(r.w+(action==='height'?0:localX),32,1600,r.w);
   const ht=safeNumber(r.h+(action==='width'?0:localY),20,1600,r.h);
   if(f){o.w=w/(f.scale||1);o.h=ht/(f.scale||1)}
   else{o.w=w;o.h=ht}
  }
  queueRender();refreshInspector();
 }
 function finish(){
  h.removeEventListener('pointermove',moving);h.removeEventListener('pointerup',finish);h.removeEventListener('pointercancel',finish);
  if(JSON.stringify(o)!==JSON.stringify(base)){history.push(before);if(history.length>45)history.shift();future=[];updateHistory();scheduleSave()}
 }
 h.addEventListener('pointermove',moving);h.addEventListener('pointerup',finish);h.addEventListener('pointercancel',finish);
}
function selectWordBold(key){
 const nd=getNode(key);if(!nd)return;
 const sel=window.getSelection(),inText=sel&&sel.rangeCount&&nd.edit.contains(sel.anchorNode)&&nd.edit.contains(sel.focusNode);
 if(inText){nd.edit.focus();document.execCommand('bold',false,null);updateModel(key,readMarkdown(nd.edit))}
 else{const p=ensurePage(page());p.textStyles[key]??={};const st=styleFor(p,key);p.textStyles[key].bold=!st.bold;p.textStyles[key].fontWeight=st.bold?400:700;scheduleSave();queueRender()}
 updateToolbar();
}
function changeStyle(key,changes){
 const p=ensurePage(page());p.textStyles[key]??={};Object.assign(p.textStyles[key],changes);if(key==='note_title')p.noteTitleMode='text';scheduleSave();queueRender();updateToolbar()
}
function updateToolbar(){
 if(!toolbar||toolbar.classList.contains('hidden'))return;
 const key=toolbar.dataset.key;if(!key||!page())return;
 const st=styleFor(page(),key),o=offsetFor(page(),key);
 const isKura=st.family==='KURA Brush2'||st.family==='KURA Brush Alt 1'||st.family==='KURA Brush Alt 2';
  toolbar.querySelector('[data-font]').value=isKura?'KURA Brush2':st.family;
  toolbar.querySelector('[data-glyph]').value=st.family==='KURA Brush Alt 1'?'1':st.family==='KURA Brush Alt 2'?'2':'0';
  toolbar.querySelector('[data-glyph]').style.display=isKura?'':'none';
  toolbar.querySelector('[data-weight]').value=String(st.fontWeight||400);
 toolbar.querySelector('[data-size]').value=Math.round(st.fontSize);
 toolbar.querySelector('[data-rotation]').textContent=Math.round(o.rot||0)+'°';
 toolbar.querySelector('[data-bold]').classList.toggle('is-on',st.bold);
}
function makeToolbar(){
 toolbar=document.createElement('div');toolbar.className='kura-selection-toolbar hidden';toolbar.setAttribute('role','toolbar');toolbar.innerHTML='<span class="kura-bar-grip">⋮⋮</span><select data-font title="Font"><option>Montserrat</option><option value="KURA Brush2">KURA Brush originale</option><option value="KURA Custom Brush">Font personale</option><option>Kaushan Script</option><option>Caveat Brush</option><option>Caveat</option></select><select data-glyph title="Glifi KURA"><option value="0">Glifi base</option><option value="1">Glifi alternativi 01</option><option value="2">Glifi alternativi 02</option></select><select data-weight title="Spessore"><option value="400">Regular</option><option value="700">Bold</option><option value="800">ExtraBold</option></select><button type="button" data-minus title="Riduci dimensione">−</button><input data-size type="number" min="10" max="200" step="1" aria-label="Dimensione del testo"/><button type="button" data-plus title="Aumenta dimensione">＋</button><button type="button" data-bold title="Grassetto (anche sulla selezione)">B</button><span class="kura-control-label" data-rotation>0°</span><button type="button" data-reset title="Reimposta posizione">↺</button><button type="button" data-close title="Chiudi">×</button>';
 const stage=document.querySelector('.stage-inner');
 const canvasWrap=stage?.closest('.canvas-wrap');
 let dock=document.getElementById('kuraTextToolbarDock');
 if(!dock && canvasWrap){
  dock=document.createElement('div');dock.id='kuraTextToolbarDock';dock.className='kura-toolbar-dock';
  const stageBg=canvasWrap.querySelector('.stage-bg');
  canvasWrap.insertBefore(dock,stageBg||null);
 }
 (dock||canvasWrap||stage).appendChild(toolbar);
 for(const n of toolbar.querySelectorAll('button'))n.addEventListener('pointerdown',function(e){e.preventDefault()});
 toolbar.querySelector('[data-minus]').onclick=function(){const key=toolbar.dataset.key;changeStyle(key,{fontSize:safeNumber(styleFor(page(),key).fontSize-2,10,200,30)})};
 toolbar.querySelector('[data-plus]').onclick=function(){const key=toolbar.dataset.key;changeStyle(key,{fontSize:safeNumber(styleFor(page(),key).fontSize+2,10,200,30)})};
 toolbar.querySelector('[data-font]').onchange=function(e){changeStyle(toolbar.dataset.key,{family:e.target.value})};
  toolbar.querySelector('[data-glyph]').onchange=function(e){changeStyle(toolbar.dataset.key,{family:e.target.value==='1'?'KURA Brush Alt 1':e.target.value==='2'?'KURA Brush Alt 2':'KURA Brush2'})};
  toolbar.querySelector('[data-weight]').onchange=function(e){const weight=Number(e.target.value);changeStyle(toolbar.dataset.key,{fontWeight:weight,bold:weight!==400})};
 toolbar.querySelector('[data-size]').onchange=function(e){changeStyle(toolbar.dataset.key,{fontSize:safeNumber(e.target.value,10,200,30)})};
 toolbar.querySelector('[data-bold]').onclick=function(){selectWordBold(toolbar.dataset.key)};
 toolbar.querySelector('[data-reset]').onclick=function(){const k=toolbar.dataset.key, p=page(),f=freeItem(p,k);snapshot();if(f){f.rot=0;f.scale=1}else{p.offsets[k]={dx:0,dy:0,scale:1,rot:0,opacity:1}}refreshAll()};
 toolbar.querySelector('[data-close]').onclick=function(){selected=null;toolbar.classList.add('hidden');activeKey=null;document.activeElement?.blur();queueRender()};
}
function showToolbar(key){if(!toolbar)makeToolbar();toolbar.dataset.key=key;toolbar.classList.remove('hidden');updateToolbar();positionToolbar();document.dispatchEvent(new CustomEvent('kura:text-toolbar',{detail:{key,color:styleFor(page(),key).color}}))}
function positionToolbar(){
 // Text formatting lives in a dedicated dock above the stage, never on top
 // of the move, rotate or resize handles. Works on narrow iPhone layouts too.
 if(!toolbar)return;
 const dock=document.getElementById('kuraTextToolbarDock');
 if(dock)dock.classList.toggle('active',!toolbar.classList.contains('hidden'));
 toolbar.style.left='';toolbar.style.top='';toolbar.style.position='relative';
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
  let posX=rect.x,posY=rect.y,rot=o.rot||0;
  if(KURA_NOTE_KEYS.has(key)){
   const n=noteVisualCenter(p),mapped=rotateAroundPoint(rect.x+rect.w/2,rect.y+rect.h/2,n.x,n.y,n.rotation);
   posX=mapped.x-rect.w/2;posY=mapped.y-rect.h/2;rot+=n.rotation;
  }
  nd.frame.style.left=posX+'px';nd.frame.style.top=posY+'px';nd.frame.style.width=rect.w+'px';nd.frame.style.height=rect.h+'px';nd.frame.style.transform='rotate('+rot+'deg) scale('+(o.flipX?-1:1)+','+(o.flipY?-1:1)+')';
  nd.frame.classList.toggle('is-selected',selected==='text:'+key||kuraMulti.has('text:'+key));
  const scale=width/W,inv=1/scale;
  for(const button of nd.frame.querySelectorAll('.kura-manip-handle'))button.style.transform='scale('+inv+')';
  for(const button of nd.frame.querySelectorAll('.kura-move-handle,.kura-rotate-handle,.kura-fliph-handle,.kura-flipv-handle'))button.style.top=(posY*scale<38?5:-34*inv)+'px';
  const flips=nd.frame.querySelectorAll('.kura-fliph-handle,.kura-flipv-handle');
  if(flips[0])flips[0].style.left='calc(50% - '+(33*inv)+'px)';
  if(flips[1])flips[1].style.left='calc(50% + '+(7*inv)+'px)';
  nd.edit.style.setProperty('--kura-ink',st.color);
  nd.edit.style.fontSize=(metrics.get(key)||st.fontSize)+'px';
  nd.edit.style.lineHeight=String(st.lineHeight);
  nd.edit.style.fontFamily='"'+effectiveFamily(st)+'",sans-serif';
  nd.edit.style.fontWeight=st.family.startsWith('KURA Brush')?'400':(p.textStyles[key]?.fontWeight?String(st.fontWeight):st.bold?'800':'500');nd.edit.style.fontSynthesis=st.family.startsWith('KURA Brush')?'none':'weight';nd.edit.style.webkitTextStroke=st.family.startsWith('KURA Brush')?(st.fontWeight===800?'1.5px currentColor':st.fontWeight===700?'.75px currentColor':'0'):st.family==='Kaushan Script'?'0.18px currentColor':'0';nd.edit.style.textAlign=key==='note_title'?'center':'left';
  nd.edit.style.opacity=String(safeNumber(o.opacity,0,1,1));
  if(activeKey!==key){const raw=rawFor(p,key);if(nd.edit.dataset.lastRaw!==raw){nd.edit.innerHTML=markdownHTML(raw);nd.edit.dataset.lastRaw=raw}}
  nd.edit.classList.toggle('editing',activeKey===key);
 }
 if(selected&&selected.startsWith('text:')&&valid.has(selected.slice(5))){showToolbar(selected.slice(5))}
 else if(toolbar)toolbar.classList.add('hidden');
 positionToolbar();
 updateVisualSelection();
}
function initOverlay(){
 const stage=document.querySelector('.stage-inner');if(!stage)return;
 overlay=document.createElement('div');overlay.className='kura-overlays';overlay.id='kuraTextOverlays';stage.appendChild(overlay);makeToolbar();
 new ResizeObserver(function(){updateOverlays()}).observe(canvas);
}
// Non-text selection handles use the same model coordinates as PNG export and MCP.
let visualOverlay=null,visualBox=null;
function visualGeometry(id){
 const e=elementById(id);if(!e||e.type==='text')return null;
 const m=e.model;let w,h;
 if(e.type==='note'){const n=noteAutoLayout(m,page());w=n.w;h=n.totalH}
 else if(e.type==='sticker'){
  const im=assetImage(m.key);
  w=m.w*(m.scale||1)*(m.scaleX||1);
  h=(m.h||m.w*(im?.naturalHeight||1)/(im?.naturalWidth||1))*(m.scale||1)*(m.scaleY||1);
 }else{w=m.w*(m.scale||1)*(m.scaleX||1);h=m.h*(m.scale||1)*(m.scaleY||1)}
 return{x:m.x,y:m.y,w:Math.max(10,w),h:Math.max(10,h),rot:m.rot||0,e};
}
function updateVisualSelection(){
 if(!visualOverlay||!visualBox)return;
 const size=canvas.getBoundingClientRect().width/W;
 visualOverlay.style.transform='scale('+size+')';
 const geo=selected&&!selected.startsWith('text:')?visualGeometry(selected):null;
 visualBox.style.display=geo?'block':'none';if(!geo)return;
 visualBox.dataset.id=selected;
 visualBox.style.left=geo.x+'px';visualBox.style.top=geo.y+'px';
 visualBox.style.width=geo.w+'px';visualBox.style.height=geo.h+'px';
 visualBox.style.transform='rotate('+geo.rot+'deg)';
 const inv=1/Math.max(.1,size);
 for(const item of visualBox.querySelectorAll('.kura-visual-handle')){
  item.style.transform='scale('+inv+')';
  item.style.setProperty('--handle-scale',inv);
  const a=item.dataset.action;
  if(['move','rotate','flipX','flipY'].includes(a))item.style.top=(geo.y*size<38?5:-34*inv)+'px';
  if(a==='flipX')item.style.left='calc(50% - '+(33*inv)+'px)';
  if(a==='flipY')item.style.left='calc(50% + '+(7*inv)+'px)';
 }
}
function startVisualGesture(e,action){
 e.preventDefault();e.stopPropagation();
 const id=visualBox?.dataset.id,geo=visualGeometry(id);if(!geo)return;
 const m=geo.e.model,start=xyFromPointer(e),orig=deepClone(m),pre=JSON.stringify({pages,current});
 const center={x:geo.x+geo.w/2,y:geo.y+geo.h/2};
 const h=e.currentTarget;h.setPointerCapture(e.pointerId);
 function moving(ev){
  const at=xyFromPointer(ev),dx=at.x-start.x,dy=at.y-start.y;
  const a=(orig.rot||0)*Math.PI/180,localX=dx*Math.cos(a)+dy*Math.sin(a),localY=-dx*Math.sin(a)+dy*Math.cos(a);
  if(action==='move'){m.x=orig.x+dx;m.y=orig.y+dy}
  else if(action==='rotate'){
   const theta=Math.atan2(at.y-center.y,at.x-center.x)-Math.atan2(start.y-center.y,start.x-center.x);
   m.rot=Math.round((orig.rot||0)+theta*180/Math.PI);
  }else{
   if(action==='width'||action==='resize'){
    const nextW=Math.max(35,geo.w+localX);
    const baseW=Math.max(12,orig.w*(orig.scale||1));
    m.scaleX=Math.min(4,Math.max(.25,nextW/baseW));
   }
   if(action==='height'||action==='resize'){
    const nextH=Math.max(32,geo.h+localY);
    const baseH=Math.max(12,orig.h*(orig.scale||1));
    if(geo.e.type==='note'){
     const originalNoteBaseH=baseH*(orig.scaleY||1);
     const desiredH=originalNoteBaseH+localY;
     m.scaleY=Math.min(4,Math.max(.25,desiredH/baseH));
    }else m.scaleY=Math.min(4,Math.max(.25,nextH/baseH))
   }
  }
  queueRender();refreshInspector();
 }
 function end(){
  h.removeEventListener('pointermove',moving);h.removeEventListener('pointerup',end);h.removeEventListener('pointercancel',end);
  if(JSON.stringify(m)!==JSON.stringify(orig)){history.push(pre);if(history.length>45)history.shift();future=[];updateHistory();scheduleSave()}
 }
 h.addEventListener('pointermove',moving);h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
}
function initVisualTransform(){
 const root=document.querySelector('.stage-inner');if(!root||visualOverlay)return;
 visualOverlay=document.createElement('div');visualOverlay.className='kura-visual-overlay';
 visualBox=document.createElement('div');visualBox.className='kura-visual-box';
 const buttons=[['move','⠿','Sposta elemento'],['rotate','↻','Ruota elemento'],
 ['width','↔','Allarga in orizzontale'],['height','↕','Allarga in verticale'],
 ['resize','⤡','Dimensioni libere X/Y'],['flipX','⇋','Ribalta orizzontalmente'],
 ['flipY','⇅','Ribalta verticalmente']];
 for(const [action,label,tip] of buttons){
  const b=document.createElement('button');b.type='button';
  b.className='kura-visual-handle kura-visual-'+action;b.dataset.action=action;
  b.textContent=label;b.title=tip;b.setAttribute('aria-label',tip);
  if(action==='flipX'||action==='flipY'){
   b.onclick=ev=>{ev.preventDefault();ev.stopPropagation();const g=visualGeometry(visualBox.dataset.id);if(!g)return;snapshot();g.e.model[action]=!g.e.model[action];queueRender();scheduleSave();refreshInspector()}
  }else b.addEventListener('pointerdown',ev=>startVisualGesture(ev,action));
  visualBox.appendChild(b)
 }
 visualOverlay.appendChild(visualBox);root.appendChild(visualOverlay);
 updateVisualSelection();
}
// KURA multi-selection and non-destructive groups.
// Group membership lives in page.groups so it survives GitHub and JSON saves.
let kuraMulti=new Set(),kuraGroupBox=null,kuraGroupLayer=null,kuraGroupMenu=null,kuraGroupPage=null;
function kuraGroupFor(id,p=page()){return (p?.groups||[]).find(g=>g.members?.includes(id))||null}
function kuraMemberGeometry(id,p=page()){
 if(!p)return null;
 if(id.startsWith('text:')){
  const k=id.slice(5),r=textRect(p,k);if(!r)return null;
  return{x:r.x,y:r.y,w:r.w,h:r.h,rot:offsetFor(p,k).rot||0,id,type:'text'}
 }
 const e=elementById(id);if(!e)return null;
 const m=e.model;if(!m?.visible&&['scene','postcard','note'].includes(id))return null;
 if(id==='note'){const n=noteAutoLayout(m,p);return{x:m.x,y:m.y,w:n.w,h:n.totalH,rot:m.rot||0,id,type:'note'}}
 if(id.startsWith('sticker:')){
  const im=assetImage(m.key),w=m.w*(m.scale||1)*(m.scaleX||1);
  const h=(m.h||m.w*(im?.naturalHeight||1)/(im?.naturalWidth||1))*(m.scale||1)*(m.scaleY||1);
  return{x:m.x,y:m.y,w,h,rot:m.rot||0,id,type:'sticker'}
 }
 return{x:m.x,y:m.y,w:m.w*(m.scale||1)*(m.scaleX||1),h:m.h*(m.scale||1)*(m.scaleY||1),rot:m.rot||0,id,type:id}
}
function kuraBounds(ids,p=page()){
 const rects=[...ids].map(id=>kuraMemberGeometry(id,p)).filter(Boolean);
 if(!rects.length)return null;
 const corners=rects.flatMap(r=>{
  const cx=r.x+r.w/2,cy=r.y+r.h/2,a=r.rot*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
  return [[-r.w/2,-r.h/2],[r.w/2,-r.h/2],[-r.w/2,r.h/2],[r.w/2,r.h/2]].map(([dx,dy])=>({x:cx+dx*ca-dy*sa,y:cy+dx*sa+dy*ca}))
 });
 const x=Math.min(...corners.map(c=>c.x)),y=Math.min(...corners.map(c=>c.y));
 return{x,y,w:Math.max(30,Math.max(...corners.map(c=>c.x))-x),h:Math.max(30,Math.max(...corners.map(c=>c.y))-y)}
}
function kuraResolveSelection(id,append=false){
 if(!id)return;
 const group=kuraGroupFor(id);
 if(append&&kuraMulti.size===0&&selected&&selected!==id)kuraMulti.add(selected);
 if(!append){kuraMulti.clear();if(group)for(const k of group.members)kuraMulti.add(k);else kuraMulti.add(id)}
 else{
  const items=group?group.members:[id];
  if(items.every(k=>kuraMulti.has(k)))items.forEach(k=>kuraMulti.delete(k));
  else items.forEach(k=>kuraMulti.add(k))
 }
 selected=kuraMulti.size===1?[...kuraMulti][0]:null;
 activeKey=null;refreshInspector();queueRender();requestAnimationFrame(kuraUpdateGroupBox)
}
function kuraSelectedIds(){return [...kuraMulti].filter(k=>!!kuraMemberGeometry(k))}
function kuraGroupSelection(){
 let ids=kuraSelectedIds();
 // The note title and labels are children of the paper: avoid double transforms when the complete note is selected.
 if(ids.includes('note'))ids=ids.filter(id=>id==='note'||!['text:note_title','text:label_base','text:base','text:label_duration','text:duration','text:label_highlight','text:highlight','text:label_tips','text:tips'].includes(id));
 if(ids.length<2){emitToast('Seleziona almeno due elementi indipendenti tenendo premuto Shift');return}
 snapshot();const p=ensurePage(page());
 const moved=new Set(ids);
 p.groups=p.groups.map(g=>({...g,members:g.members.filter(id=>!moved.has(id))})).filter(g=>g.members.length>1);
 const group={id:uuid(),members:ids};
 p.groups.push(group);kuraMulti=new Set(ids);selected=null;queueRender();scheduleSave();kuraUpdateGroupBox();emitToast('Gruppo creato · usa i controlli intorno alla selezione')
}
function kuraUngroupSelection(){
 const ids=kuraSelectedIds(),p=page();
 const groups=(p?.groups||[]).filter(g=>g.members.some(id=>ids.includes(id)));
 if(!groups.length){emitToast('Seleziona prima un gruppo');return}
 snapshot();p.groups=p.groups.filter(g=>!groups.includes(g));kuraMulti=new Set(ids);selected=ids[0]||null;
 queueRender();scheduleSave();kuraUpdateGroupBox();emitToast('Gruppo separato: gli elementi restano modificabili')
}
function kuraMembersTransform(before,ids,bounds,dx,dy,sx,sy,angle){
 const center={x:bounds.x+bounds.w/2,y:bounds.y+bounds.h/2};
 const radians=angle*Math.PI/180,ca=Math.cos(radians),sa=Math.sin(radians);
 for(const id of ids){
  const m=before[id];if(!m)continue;
  const r=m.rect,origCenter={x:r.x+r.w/2,y:r.y+r.h/2};
  const u=(origCenter.x-center.x)*sx,v=(origCenter.y-center.y)*sy;
  const target={x:center.x+dx+u*ca-v*sa,y:center.y+dy+u*sa+v*ca};
  const p=page();
  if(id.startsWith('text:')){
   const k=id.slice(5),free=freeItem(p,k),obj=free||(p.offsets[k]??={});
   if(free){
    free.w=Math.max(30,(m.model.w||r.w)*sx);free.h=Math.max(18,(m.model.h||r.h)*sy);
    free.x=target.x-r.w*sx/2;free.y=target.y-r.h*sy/2;
   }else{
    const newW=Math.max(30,r.w*sx),newH=Math.max(20,r.h*sy);
    obj.dx=(m.model.dx||0)+(target.x-origCenter.x)-(newW-r.w)/2;
    obj.dy=(m.model.dy||0)+(target.y-origCenter.y)-(newH-r.h)/2;
    obj.w=newW;obj.h=newH
   }
   obj.rot=(m.model.rot||0)+angle;
   // Scale live typography, not only the invisible text box.
   if(sx===sy&&Math.abs(sx-1)>.005){
    p.textStyles[k]??={};
    const baseline=Number(m.style?.fontSize)||styleFor(p,k).fontSize;
    p.textStyles[k].fontSize=Math.max(10,Math.min(200,baseline*sx));
   }
  }else{
   const model=elementById(id)?.model;if(!model)continue;
   model.scaleX=(m.model.scaleX||1)*sx;model.scaleY=(m.model.scaleY||1)*sy;
   model.x=target.x-r.w*sx/2;model.y=target.y-r.h*sy/2;
   model.rot=(m.model.rot||0)+angle
  }
 }
 queueRender();kuraUpdateGroupBox()
}
function kuraUpdateGroupBox(){
 if(!kuraGroupBox)return;
 const ids=kuraSelectedIds();
 const grouped=ids.length>1||ids.length===1&&!!kuraGroupFor(ids[0]);
 const bounds=grouped?kuraBounds(ids):null;
 kuraGroupBox.style.display=bounds?'block':'none';
 if(kuraGroupLayer)kuraGroupLayer.style.transform='scale('+(canvas.getBoundingClientRect().width/W||1)+')';
 if(!bounds)return;
 const scale=canvas.getBoundingClientRect().width/W||1;
 kuraGroupBox.style.left=bounds.x+'px';kuraGroupBox.style.top=bounds.y+'px';
 kuraGroupBox.style.width=bounds.w+'px';kuraGroupBox.style.height=bounds.h+'px';
 kuraGroupBox.style.transform='none';
 kuraGroupBox.querySelectorAll('button').forEach(el=>el.style.transform='scale('+1/scale+')');
 const label=kuraGroupBox.querySelector('.kura-group-count');if(label)label.textContent=ids.length+' elementi';
}
function kuraGroupGesture(e,action){
 if(!kuraMulti.size)return;e.preventDefault();e.stopPropagation();
 const ids=kuraSelectedIds(),bounds=kuraBounds(ids);if(!bounds)return;
 const before={};for(const id of ids){const model=id.startsWith('text:')?deepClone(offsetFor(page(),id.slice(5))):deepClone(elementById(id)?.model);
  before[id]={model,rect:kuraMemberGeometry(id),style:id.startsWith('text:')?deepClone(page().textStyles?.[id.slice(5)]||{}):null}}
 const start=xyFromPointer(e),prior=JSON.stringify({pages,current});
 let changed=false;const button=e.currentTarget;button.setPointerCapture(e.pointerId);
 const move=ev=>{
  const at=xyFromPointer(ev),dx=at.x-start.x,dy=at.y-start.y;
  let sx=1,sy=1,angle=0,tx=0,ty=0;
  if(action==='move'){tx=dx;ty=dy}
  if(action==='rotate'){
   const cx=bounds.x+bounds.w/2,cy=bounds.y+bounds.h/2;
   angle=(Math.atan2(at.y-cy,at.x-cx)-Math.atan2(start.y-cy,start.x-cx))*180/Math.PI
  }
  if(action==='resize'){
   const f=Math.max(.25,Math.min(4,1+Math.max(dx/Math.max(40,bounds.w),dy/Math.max(40,bounds.h))));
   sx=f;sy=f
  }
  if(action==='width')sx=Math.max(.25,Math.min(4,1+dx/Math.max(40,bounds.w)));
  if(action==='height')sy=Math.max(.25,Math.min(4,1+dy/Math.max(40,bounds.h)));
  changed=true;kuraMembersTransform(before,ids,bounds,tx,ty,sx,sy,angle);
 };
 const end=()=>{
  button.removeEventListener('pointermove',move);button.removeEventListener('pointerup',end);button.removeEventListener('pointercancel',end);
  if(changed){history.push(prior);if(history.length>45)history.shift();future=[];updateHistory();scheduleSave()}
 };
 button.addEventListener('pointermove',move);button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end)
}
function kuraInitGroups(){
 const stage=document.querySelector('.stage-inner');if(!stage)return;
 kuraGroupBox=document.createElement('div');kuraGroupBox.className='kura-group-box';kuraGroupBox.style.display='none';
 kuraGroupBox.innerHTML='<span class="kura-group-count">Gruppo</span><button type="button" data-action="move" title="Sposta gruppo">⠿</button><button type="button" data-action="rotate" title="Ruota gruppo">↻</button><button type="button" data-action="resize" title="Scala gruppo">⤡</button><button type="button" data-action="width" title="Larghezza gruppo">↔</button><button type="button" data-action="height" title="Altezza gruppo">↕</button>';
 kuraGroupLayer=document.createElement('div');kuraGroupLayer.className='kura-group-layer';
 kuraGroupLayer.appendChild(kuraGroupBox);stage.appendChild(kuraGroupLayer);
 for(const button of kuraGroupBox.querySelectorAll('button'))button.addEventListener('pointerdown',e=>kuraGroupGesture(e,button.dataset.action));
 const bar=document.querySelector('.stage-head .compact-actions');
 if(bar){
  const group=document.createElement('button');group.className='btn small flat';group.textContent='Raggruppa';group.title='Raggruppa selezione multipla';group.onclick=kuraGroupSelection;
  const ungroup=document.createElement('button');ungroup.className='btn small flat';ungroup.textContent='Separa';ungroup.title='Separa gruppo';ungroup.onclick=kuraUngroupSelection;
  bar.append(group,ungroup)
 }
 stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('.kura-group-box'))return;
  const frame=e.target.closest('.kura-text-frame');
  if(!e.shiftKey&&frame){
   const id='text:'+frame.dataset.key;
   if(kuraGroupFor(id)){kuraResolveSelection(id,false);e.preventDefault();e.stopImmediatePropagation()}
   return
  }
  if(!(e.shiftKey||e.target===canvas))return;
  const pt=xyFromPointer(e);
  if(e.target===canvas&&page()?.visuals?.note?.visible){
   const n=page().visuals.note,L=noteAutoLayout(n,page()),cx=n.x+L.w/2,cy=n.y+L.totalH/2;
   const a=-(n.rot||0)*Math.PI/180,u=pt.x-cx,v=pt.y-cy;
   const lx=u*Math.cos(a)-v*Math.sin(a)+L.w/2,ly=u*Math.sin(a)+v*Math.cos(a)+L.totalH/2;
   if(lx>18&&lx<L.w-16&&ly>16&&ly<136){
    if(page().noteTitleMode!=='text'){snapshot();page().noteTitleMode='text';scheduleSave()}
    kuraResolveSelection('text:note_title',e.shiftKey);refreshAll();
    requestAnimationFrame(()=>{const edit=getNode('note_title')?.edit;if(!e.shiftKey){edit?.focus();showToolbar('note_title')}});
    e.preventDefault();e.stopImmediatePropagation();return
   }
  }
  if(!e.shiftKey&&e.target===canvas){
   const hit=[...hitboxes].reverse().find(b=>pt.x>=b.x&&pt.x<=b.x+b.w&&pt.y>=b.y&&pt.y<=b.y+b.h);
   if(hit&&kuraGroupFor(hit.id)){
    kuraResolveSelection(hit.id,false);e.preventDefault();e.stopImmediatePropagation();return
   }
   kuraMulti.clear();kuraUpdateGroupBox();return
  }
  if(!e.shiftKey)return;
  let key=null;
  const textFrame=e.target.closest('.kura-text-frame');
  if(textFrame)key='text:'+textFrame.dataset.key;
  else{
   const hit=[...hitboxes].reverse().find(b=>pt.x>=b.x&&pt.x<=b.x+b.w&&pt.y>=b.y&&pt.y<=b.y+b.h);
   if(hit)key=hit.id
  }
  if(key){kuraResolveSelection(key,true);e.preventDefault();e.stopImmediatePropagation()}
 },true);
 stage.addEventListener('contextmenu',e=>{
  const pt=xyFromPointer(e);
  const hit=[...hitboxes].reverse().find(b=>pt.x>=b.x&&pt.x<=b.x+b.w&&pt.y>=b.y&&pt.y<=b.y+b.h);
  if(!kuraMulti.size&&hit)kuraResolveSelection(hit.id,false);
  const ids=kuraSelectedIds();
  if(!ids.length)return;e.preventDefault();e.stopImmediatePropagation();
  kuraGroupMenu?.remove();kuraGroupMenu=document.createElement('div');kuraGroupMenu.className='kura-group-context';
  const group=kuraGroupFor(ids[0]);
  kuraGroupMenu.innerHTML='<button type="button" data-group>Raggruppa elementi ('+ids.length+')</button><button type="button" data-ungroup>Separa gruppo</button>';
  const join=kuraGroupMenu.querySelector('[data-group]'),split=kuraGroupMenu.querySelector('[data-ungroup]');
  join.disabled=ids.length<2;split.disabled=!group;
  join.onclick=()=>{kuraGroupSelection();kuraGroupMenu?.remove()};
  split.onclick=()=>{kuraUngroupSelection();kuraGroupMenu?.remove()};
  kuraGroupMenu.style.left=Math.min(innerWidth-210,e.clientX)+'px';kuraGroupMenu.style.top=Math.min(innerHeight-95,e.clientY)+'px';
  document.body.appendChild(kuraGroupMenu)
 },true);
 document.addEventListener('pointerdown',e=>{if(kuraGroupMenu&&!kuraGroupMenu.contains(e.target)){kuraGroupMenu.remove();kuraGroupMenu=null}},true);
 const formerRefresh=refreshAll;
 refreshAll=function(){if(kuraGroupPage!==currentProjectId+':'+page()?.id){kuraMulti.clear();kuraGroupPage=currentProjectId+':'+page()?.id}formerRefresh();requestAnimationFrame(kuraUpdateGroupBox)};
 const formerQueue=queueRender;
 queueRender=function(){formerQueue();requestAnimationFrame(kuraUpdateGroupBox)};
}
requestAnimationFrame(kuraInitGroups);

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
   const im=document.createElement('img');im.alt=name;im.loading='lazy';im.decoding='async';im.src=ASSETS['sticker_'+key];b.appendChild(im);const caption=document.createElement('small');caption.className='kura-sticker-name';caption.textContent=name;b.appendChild(caption);
   b.draggable=true;im.draggable=false;
   b.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('application/x-kura-sticker',key);e.dataTransfer.setData('text/plain','kura-sticker:'+key)});
   let touch=null,ghost=null,suppressClick=false;
   b.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;touch={x:e.clientX,y:e.clientY,moved:false};b.setPointerCapture?.(e.pointerId)});
   b.addEventListener('pointermove',e=>{if(!touch)return;
    if(Math.hypot(e.clientX-touch.x,e.clientY-touch.y)>12)touch.moved=true;
    if(!touch.moved)return;
    if(!ghost){ghost=document.createElement('img');ghost.src=im.src;ghost.className='kura-drag-ghost';document.body.appendChild(ghost)}
    ghost.style.left=(e.clientX-52)+'px';ghost.style.top=(e.clientY-52)+'px';
   });
   b.addEventListener('pointerup',e=>{if(!touch)return;const moved=touch.moved;touch=null;ghost?.remove();ghost=null;
    if(moved){suppressClick=true;setTimeout(()=>{suppressClick=false},350);const box=canvas.getBoundingClientRect();
     if(e.clientX>=box.left-40&&e.clientX<=box.right+40&&e.clientY>=box.top-40&&e.clientY<=box.bottom+40)placeStickerAt(key,e.clientX,e.clientY);
     else{addSticker(key);emitToast('Elemento inserito: spostalo sulla tavola')}
     e.preventDefault();
    }
   });
   b.addEventListener('pointercancel',()=>{touch=null;ghost?.remove();ghost=null});
   b.onclick=()=>{if(suppressClick){suppressClick=false;return}addSticker(key)};
   root.appendChild(b);
  }
 }
};
function placeStickerAt(key,clientX,clientY){
 addSticker(key);
 const el=elementById(selected);if(!el||!el.model)return;
 const r=canvas.getBoundingClientRect(),pt={x:(clientX-r.left)/r.width*W,y:(clientY-r.top)/r.height*H};
 const im=assetImage(el.model.key),w=el.model.w*(el.model.scale||1),h=el.model.h||w*(im?.naturalHeight||1)/(im?.naturalWidth||1);
 el.model.x=pt.x-w/2;el.model.y=pt.y-h/2;refreshInspector();queueRender();scheduleSave();
}
document.querySelector('.stage-inner').addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('application/x-kura-sticker')||e.dataTransfer?.types?.includes('text/plain')){e.preventDefault();e.dataTransfer.dropEffect='copy'}});
document.querySelector('.stage-inner').addEventListener('drop',e=>{const key=e.dataTransfer?.getData('application/x-kura-sticker')||e.dataTransfer?.getData('text/plain')?.replace(/^kura-sticker:/,'');if(stickerDefs.some(x=>x[0]===key)){e.preventDefault();placeStickerAt(key,e.clientX,e.clientY)}});
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
   const sample=document.createElement('img');sample.className='kura-bg-procedural';sample.alt=p.name;sample.loading='lazy';sample.src=i<4?ASSETS['sfondo_'+(i+1)]:ASSETS['sfondo_'+p.id];sample.onerror=()=>{const preview=document.createElement('canvas');preview.width=108;preview.height=135;preview.className='kura-bg-procedural';const cc=preview.getContext('2d');cc.save();cc.scale(.1,.1);drawKuraBackground(cc,i,true);cc.restore();sample.replaceWith(preview)};b.appendChild(sample);const label=document.createElement('small');label.textContent=p.name;b.appendChild(label);
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
 currentProjectId=id;currentProjectMeta=deepClone(pkg.meta||{});
 pages=pkg.pages.map(normalizePage).map(ensurePage);current=0;selected=null;activeKey=null;history=[];future=[];updateHistory();
 for(const [k,v]of Object.entries(pkg.customAssets||{}))if(k.startsWith('custom_')&&typeof v==='string'&&v.startsWith('data:image/')){ASSETS[k]=v;imageCache.delete(k);assetImage(k)}
 shownPage=null;refreshAll();showProjectOptions();await dbPut('kura:v2:active',id);emitToast('Progetto aperto');
}
async function newProject(){
 clearTimeout(saveTimer);await persistNow();const id=uuid();
 pIndex.push({id:id,name:'Nuovo carosello',updatedAt:Date.now()});currentProjectId=id;currentProjectMeta={};pages=[ensurePage(makePage(0))];current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
 page().background=4+(hashSeed(id)%8);refreshAll();showProjectOptions();await persistNow();emitToast('Nuovo progetto creato')
}
function projectPanel(){
 const tab=$('#tab-pages'),reference=$('#pageList');if(!tab||!reference)return;
 const panel=document.createElement('div');panel.className='kura-project-panel';panel.innerHTML='<div class="section-title">Progetti nel browser</div><div class="kura-project-row"><select id="kuraProjectSelect" aria-label="Scegli progetto"></select><button class="btn flat small" id="kuraProjectNew">＋ Nuovo</button></div><div class="kura-project-row"><button class="btn flat small" id="kuraProjectRename">Rinomina</button><button class="btn flat small" id="kuraProjectDuplicate">Duplica</button><button class="btn flat small danger" id="kuraProjectDelete">Elimina</button><button class="btn flat small" id="kuraProjectExport">↓ Esporta progetto</button></div><p class="hint">Salvataggio automatico locale. Per passare a un altro dispositivo esporta il progetto JSON e riaprilo lì.</p>';
 reference.after(panel);
 $('#kuraProjectSelect').onchange=function(e){switchProject(e.target.value)};
 $('#kuraProjectNew').onclick=newProject;
 $('#kuraProjectRename').onclick=async function(){const item=pIndex.find(x=>x.id===currentProjectId);if(!item)return;const next=prompt('Nome progetto',item.name);if(!next?.trim())return;item.name=next.trim().slice(0,80);showProjectOptions();scheduleSave()};
 $('#kuraProjectDuplicate').onclick=async function(){await persistNow();const source=exportProject(),item=pIndex.find(x=>x.id===currentProjectId);const id=uuid();currentProjectId=id;currentProjectMeta=deepClone(source.meta||{});pIndex.push({id:id,name:(item?.name||'Carosello')+' · copia',updatedAt:Date.now()});pages=source.pages.map(normalizePage).map(ensurePage);for(const p of pages)p.id=uuid();current=0;selected=null;shownPage=null;history=[];future=[];updateHistory();refreshAll();showProjectOptions();await persistNow();emitToast('Copia creata')};
 $('#kuraProjectDelete').onclick=async function(){if(pIndex.length===1){emitToast('Mantieni almeno un progetto');return}const item=pIndex.find(x=>x.id===currentProjectId);if(!confirm('Eliminare il progetto "'+item.name+'"?'))return;await dbDelete('kura:v2:project:'+currentProjectId);pIndex=pIndex.filter(x=>x.id!==currentProjectId);currentProjectId=pIndex[0].id;const target=await dbGet('kura:v2:project:'+currentProjectId);pages=target?.pages?.map(normalizePage).map(ensurePage)||[newDemo()];current=0;selected=null;shownPage=null;history=[];future=[];updateHistory();refreshAll();showProjectOptions();await persistNow()};
 $('#kuraProjectExport').onclick=function(){download(jsonFile(),'KURA_PROGETTO_'+fileSafe(pIndex.find(x=>x.id===currentProjectId)?.name||'carosello')+'.json')};
}
async function loadPublishedKuraTemplate(name='novembre-2026'){
 const templates={
  'novembre-2026':{id:'kura-nov26-travel-pages-v7',file:'KURA_Progetto_Novembre_2026.json'},
  'novembre-2026-mcp-test':{id:'kura-nov26-mcp-v3-test-20261102',file:'KURA_Progetto_Novembre_2026_MCP_TEST.json'}
 };
 const template=templates[name];if(!template)throw Error('Template non disponibile: '+name);
 const projectId=template.id;
 if(pIndex.some(x=>x.id===projectId)){await switchProject(projectId);return{ok:true,mode:'existing',projectId,pages:pages.length}}
 const res=await fetch('./projects/'+template.file+'?v=3.7.0',{cache:'no-store'});
 if(!res.ok)throw Error('Errore caricamento progetto '+res.status);
 const pkg=await res.json();
 if(!Array.isArray(pkg.pages)||pkg.pages.length!==3)throw Error('Progetto non valido');
 for(const p of pkg.pages)if(!p.fields||!KURA_NOV26_ASSETS[p.imageKeys?.scene]||(p.imageKeys?.postcard&&!KURA_NOV26_ASSETS[p.imageKeys.postcard]))throw Error('Illustrazione KURA non valida');
 await persistNow();
 pIndex.push({id:projectId,name:pkg.projectName||'KURA Novembre 2026',updatedAt:Date.now()});
 currentProjectId=projectId;currentProjectMeta=deepClone(pkg.meta||{});pages=pkg.pages.map(normalizePage).map(ensurePage);
 current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
 for(const[k,url]of Object.entries(KURA_NOV26_ASSETS)){ASSETS[k]=url;imageCache.delete(k);assetImage(k)}
 refreshAll();showProjectOptions();await persistNow();emitToast('Tre tavole Novembre 2026 importate ✓');
 return{ok:true,mode:'created',projectId,pages:pages.length,pageIds:pages.map(p=>p.id)};
}
async function autoOpenKuraTemplate(){
 const params=new URLSearchParams(location.search);if(params.has('cloud'))return;const t=params.get('template');if(!t)return;
 try{await loadPublishedKuraTemplate(t)}catch(e){console.error('KURA template:',e);emitToast('Template: '+e.message)}
}
async function initManager(){
 const status=document.createElement('span');status.id='kuraSaveStatus';status.className='kura-saved-label';status.textContent='Caricamento…';document.querySelector('.top-actions')?.appendChild(status);
 projectPanel();
 for(let n=0;n<50&&!db;n++)await new Promise(function(r){setTimeout(r,75)});
 let index=await dbGet('kura:v2:index');let active=await dbGet('kura:v2:active');
 if(Array.isArray(index)&&index.length){
  pIndex=index;currentProjectId=index.some(x=>x.id===active)?active:index[0].id;
  const pkg=await dbGet('kura:v2:project:'+currentProjectId);
  if(pkg?.pages?.length){currentProjectMeta=deepClone(pkg.meta||{});pages=pkg.pages.map(normalizePage).map(ensurePage);current=0;for(const[k,v]of Object.entries(pkg.customAssets||{}))if(k.startsWith('custom_')&&typeof v==='string'&&v.startsWith('data:image/')){ASSETS[k]=v;imageCache.delete(k);assetImage(k)}}
 }else{
  let legacy=await dbGet('project');if(!legacy?.pages?.length){try{legacy=JSON.parse(localStorage.getItem('kura:v2:recovery'))}catch(_){}}
  if(legacy?.pages?.length){currentProjectMeta=deepClone(legacy.meta||{});pages=legacy.pages.map(normalizePage).map(ensurePage);for(const[k,v]of Object.entries(legacy.customAssets||{}))ASSETS[k]=v}
  const id=uuid();pIndex=[{id:id,name:legacy?.projectName||'Il mio primo carosello',updatedAt:Date.now()}];currentProjectId=id
 }
 managerReady=true;shownPage=null;refreshAll();showProjectOptions();await persistNow();await autoOpenKuraTemplate();if(window.KURA_GITHUB?.openFromQuery)await window.KURA_GITHUB.openFromQuery();
}
const originalNormalize=normalizePage;
normalizePage=function(p){const out=originalNormalize(p);out.background=safeNumber(p.background,0,15,out.background);out.backgroundId=BACKGROUND_PRESETS.find(x=>x.id===p.backgroundId)?.id||BACKGROUND_PRESETS[out.background].id;out.seasonHint=p.seasonHint||BACKGROUND_PRESETS[out.background].season;out.textStyles=p.textStyles&&typeof p.textStyles==='object'?deepClone(p.textStyles):{};out.freeTexts=Array.isArray(p.freeTexts)?deepClone(p.freeTexts):[];return ensurePage(out)};
const originalImportFast=importFast;
importFast=function(obj){originalImportFast(obj);pages.forEach(ensurePage);shownPage=null;refreshAll();scheduleSave()};
const originalExportProject=exportProject;
exportProject=function(){const o=originalExportProject();o.format='KURA_EDITOR_V2';o.version=2;o.schemaVersion=2;o.projectId=currentProjectId;o.projectName=pIndex.find(x=>x.id===currentProjectId)?.name||'Carosello KURA';o.meta=deepClone(currentProjectMeta||{});return o};
const originalUndo=undo,originalRedo=redo;
undo=function(){originalUndo();shownPage=null;queueRender()};
redo=function(){originalRedo();shownPage=null;queueRender()};
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&managerReady){clearTimeout(saveTimer);persistNow()}});

function syncBackgroundControls(){
 const p=page();if(!p)return;
 const bt=p.bgTransform||{zoom:1,dx:0,dy:0};
 for(const[id,val]of [['bgZoom',Math.round((bt.zoom||1)*100)],['bgShiftX',bt.dx||0],['bgShiftY',bt.dy||0]]){const el=$('#'+id);if(el&&document.activeElement!==el)el.value=val}
 const f=$('#bgZoomValue'),x=$('#bgShiftXValue'),y=$('#bgShiftYValue');if(f)f.textContent=Math.round((bt.zoom||1)*100)+'%';if(x)x.textContent=Math.round(bt.dx||0);if(y)y.textContent=Math.round(bt.dy||0);
}
function bindBackgroundControls(){
 const fields=[['bgZoom','zoom',v=>v/100],['bgShiftX','dx',Number],['bgShiftY','dy',Number]];
 for(const[id,k,transform]of fields){const e=$('#'+id);if(!e)continue;e.addEventListener('input',()=>{const p=page();p.bgTransform??={zoom:1,dx:0,dy:0};p.bgTransform[k]=transform(e.value);syncBackgroundControls();queueRender();scheduleSave()})}
 const reset=$('#bgReset');if(reset)reset.onclick=()=>{snapshot();page().bgTransform={zoom:1,dx:0,dy:0};syncBackgroundControls();queueRender();scheduleSave()};
 const old=refreshGalleries;refreshGalleries=function(){old();syncBackgroundControls()};
 syncBackgroundControls();
}
async function importSavedKuraProject(file){
 if(!file)return;
 const data=JSON.parse(await file.text());
 if(!Array.isArray(data.pages)||!data.pages.length)throw Error('Seleziona un progetto JSON KURA valido, con almeno una pagina');
 await persistNow();
 const id=uuid(),label=String(data.projectName||file.name.replace(/\.json$/i,'')||'Progetto importato').slice(0,100);
 pIndex.push({id,name:label,updatedAt:Date.now()});currentProjectId=id;currentProjectMeta=deepClone(data.meta||{});
 pages=data.pages.map(normalizePage).map(ensurePage);
 for(const[key,val]of Object.entries(data.customAssets||{}))if(key.startsWith('custom_')&&typeof val==='string'&&val.startsWith('data:image/')){ASSETS[key]=val;imageCache.delete(key);assetImage(key)}
 current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
 refreshAll();showProjectOptions();await persistNow();emitToast('Progetto aperto: '+pages.length+' pagine');
}
function bindProjectActions(){
 const save=$('#topSaveProject'),open=$('#topOpenProject'),file=$('#topOpenProjectFile');
 if(save)save.onclick=async()=>{await persistNow();download(jsonFile(),'KURA_Progetto_'+(pIndex.find(x=>x.id===currentProjectId)?.name||'editor').replace(/[^\wÀ-ÿ-]+/g,'_')+'.json');emitToast('Progetto salvato nel browser + copia JSON')};
 if(open&&file){open.onclick=()=>file.click();file.onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{await importSavedKuraProject(f)}catch(err){emitToast('Errore apertura: '+err.message)}finally{file.value=''}}}
 const projects=$('#topJson');if(projects)projects.onclick=()=>{setTab('pages');document.querySelector('#kuraProjectSelect')?.scrollIntoView({behavior:'smooth',block:'nearest'})};
}
function addV2Controls(){
 const textTab=$('#tab-texts');if(textTab){const b=document.createElement('button');b.className='btn flat';b.style.width='100%';b.textContent='＋ Aggiungi casella di testo';b.onclick=addFreeText;textTab.insertBefore(b,textTab.firstElementChild.nextElementSibling)}
 const fontBox=$('#fontStatus');if(fontBox){const info=document.createElement('div');info.className='kura-font-alert';info.innerHTML='Font KURA originale (Feeling Passionate): seleziona un testo nella tavola, poi imposta glifi base/alternativi e spessore Regular, Bold o ExtraBold.';fontBox.after(info)}
}
async function checkHostedFont(){
 const box=$('#fontStatus');
 try{
  const families=['KURA Brush2','KURA Brush Alt 1','KURA Brush Alt 2'];
  await Promise.all(families.map(f=>document.fonts.load('42px "'+f+'"')));
  const missing=families.filter(f=>!document.fonts.check('42px "'+f+'"'));
  if(missing.length)throw Error('Varianti non caricate: '+missing.join(', '));
  if(box&&!document.fonts.check('39px "KURA Custom Brush"'))box.innerHTML='<b>KURA Brush originale <span class="pill ok">3 varianti ✓</span></b><p>Feeling Passionate: glifi base, ss01, ss02. Regular nativo; Bold ed ExtraBold simulati ispessendo il tratto, anche nel PNG esportato.</p>';
  queueRender();
 }catch(err){
  if(box)box.textContent='KURA Brush: errore di caricamento. '+String(err.message||err);
  console.warn('KURA font',err)
 }
}
function assertPage(op){const p=op.pageId?pages.find(x=>x.id===op.pageId):pages[Number.isInteger(op.pageIndex)?op.pageIndex:current];if(!p)throw Error('Pagina non trovata');return ensurePage(p)}
function safeStylePatch(style){const out={};if(!style||typeof style!=='object')return out;if(style.fontSize!==undefined)out.fontSize=safeNumber(style.fontSize,10,200,30);if(['Montserrat','Kaushan Script','Caveat Brush','KURA Brush2','KURA Brush Alt 1','KURA Brush Alt 2','Feeling Passionate','Caveat'].includes(style.family))out.family=style.family==='Feeling Passionate'?'KURA Brush2':style.family;if(typeof style.bold==='boolean')out.bold=style.bold;if([400,700,800].includes(Number(style.fontWeight)))out.fontWeight=Number(style.fontWeight);if(/^#[0-9a-fA-F]{6}$/.test(style.color||''))out.color=style.color;if(style.lineHeight!==undefined)out.lineHeight=safeNumber(style.lineHeight,.8,2.5,1.2);return out}
window.KURA_MCP=Object.freeze({
 apiVersion:'3.0',contract:'./mcp-contract.json',
 getProject:function(){return deepClone(exportProject())},
 loadTemplate:async function(name){return loadPublishedKuraTemplate(name)},
 inspect:function(){return{apiVersion:'3.0',pageIds:pages.map(x=>x.id),editableTextKeys:STANDARD,backgroundCount:16,backgroundPresets:BACKGROUND_PRESETS.map(x=>({id:x.id,name:x.name,season:x.season,tags:x.tags})),backgroundNames:BACKGROUND_PRESETS.map(x=>x.name),layoutIds:LAYOUTS.map(x=>x.id),decorations:stickerDefs.map(x=>({id:x[0],name:x[1]})),actions:['loadTemplate','setText','setBackground','setBackgroundId','setSeason','addSticker','addText','moveElement','setPageName','addPage']}},
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
     for(const k of ['x','y','dx','dy','rot','scale','scaleX','scaleY','opacity','w','h','flipX','flipY'])if(op[k]!==undefined){if(k==='flipX'||k==='flipY')model[k]=Boolean(op[k]);else if(k==='scale'||k==='scaleX'||k==='scaleY')model[k]=safeNumber(op[k],.2,3,1);else if(k==='opacity')model[k]=safeNumber(op[k],0,1,1);else model[k]=safeNumber(op[k],-2000,3000,0)}
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
// Offline brief generation: clones artwork/layout; never overwrites the source project.
function kuraNormalizeWord(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it-IT').replace(/[^a-z0-9]+/g,' ').trim()}
function kuraPageMatchesVisual(source,dest){
 const name=kuraNormalizeWord([source.name,source.fields?.eyebrow,source.imageKeys?.scene].join(' ')),country=kuraNormalizeWord(dest.country),place=kuraNormalizeWord(dest.place);
 if(!country||!name.includes(country))return false;
 return place.split(' ').filter(w=>w.length>=5&&!['valle','parco','della','delle','degli','isola','citta'].includes(w)).some(w=>name.includes(w))
}
async function createKuraProjectFromBrief(spec,options={}){
 if(!managerReady)throw Error('L’editor non è ancora pronto');
 if(!spec||spec.ok!==true||!Array.isArray(spec.pages)||!spec.pages.length)throw Error('Analizza un brief valido');
 if(spec.pages.length>50)throw Error('Massimo 50 pagine');
 const useGraphics=options.useCurrentGraphics!==false,sourceProjectId=currentProjectId;
 const originals=pages.map(p=>deepClone(p));if(useGraphics&&!originals.length)throw Error('Progetto di riferimento vuoto');
 await persistNow();
 const warnings=[];
 const generated=spec.pages.map((item,i)=>{
  const original=useGraphics?deepClone(originals[i%originals.length]):makePage(i%LAYOUTS.length);
  const p=ensurePage(normalizePage(original));
  p.id=uuid();p.name=item.name;
  Object.assign(p.fields,{
   eyebrow:String(i+1).padStart(2,'0')+' / '+String(item.country||'DESTINAZIONE').toLocaleUpperCase('it-IT'),
   head1:item.fields.head1,body1:item.fields.body1,head2:item.fields.head2,body2:item.fields.body2,
   base:item.fields.base,duration:item.fields.duration,highlight:item.fields.highlight,
   tips:item.fields.tips,label_highlight:item.fields.label_highlight||'Da non perdere'
  });
  p.meta={...(p.meta||{}),referenceSubtitle:item.meta?.referenceSubtitle||'',
   imageBrief:item.meta?.immagine||'',layoutBrief:item.meta?.layout||'',
   backgroundBrief:item.meta?.sfondo||'',importedFromBrief:true};
  if(!useGraphics||!kuraPageMatchesVisual(original,item)){
   p.visuals.scene.visible=false;p.visuals.postcard.visible=false;
   if(useGraphics)warnings.push('Pagina '+(i+1)+': scena precedente nascosta perché la destinazione è diversa. Le istruzioni IMMAGINE sono salvate.');
  }
  return p;
 });
 if(options.applyToCurrent===true){
  pages=generated;
  currentProjectMeta={...currentProjectMeta,brief:deepClone(spec.meta||{}),lastBriefAppliedAt:new Date().toISOString()};
  current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
  refreshAll();showProjectOptions();await persistNow();
  emitToast('Testi applicati al progetto corrente ✓');
  return{ok:true,projectId:currentProjectId,projectName:pIndex.find(v=>v.id===currentProjectId)?.name,pages:pages.length,warnings,sourceProjectId,pageIds:pages.map(p=>p.id)};
 }
 const id='kura-brief-'+Date.now().toString(36)+'-'+uuid().slice(1);
 const label=String(spec.meta?.title||'Carosello KURA').slice(0,84)+' · importato';
 pIndex.push({id,name:label,updatedAt:Date.now()});currentProjectId=id;
 currentProjectMeta={...deepClone(spec.meta||{}),sourceProjectId,importedAt:new Date().toISOString(),parserVersion:'1.0.0'};
 pages=generated;current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
 refreshAll();showProjectOptions();await persistNow();emitToast('Nuovo progetto: '+pages.length+' pagine create ✓');
 return{ok:true,projectId:id,projectName:label,pages:pages.length,warnings,sourceProjectId,pageIds:pages.map(p=>p.id)}
}
// KURA element clipboard: survives project switches and page reloads in this browser.
// Assets uploaded by the user are included; never mutates the source project on copy.
const KURA_CLIPBOARD_STORAGE='kura:element-clipboard:v1';
function kuraElementPayload(){
 const p=page();if(!p||!selected)throw Error('Seleziona prima un elemento sulla tavola');
 const id=selected,clip={format:'KURA_ELEMENT_V1',from:p.name,createdAt:Date.now(),kind:'',payload:null};
 if(id.startsWith('sticker:')){
  const obj=p.stickers.find(x=>x.id===id.slice(8));
  if(!obj)throw Error('Decorazione non trovata');
  clip.kind='sticker';clip.payload=deepClone(obj);
 }else if(id.startsWith('text:')){
  const key=id.slice(5),free=freeItem(p,key);
  if(!free&&!Object.prototype.hasOwnProperty.call(p.fields,key))throw Error('Testo non disponibile');
  const r=textRect(p,key),o=offsetFor(p,key);
  clip.kind='text';
  clip.payload={text:free?free.text:p.fields[key],style:deepClone(styleFor(p,key)),
   rect:deepClone(r||{x:170,y:430,w:430,h:110}),rot:(o.rot||0)+(KURA_NOTE_KEYS.has(key)?(p.visuals.note?.rot||0):0),opacity:o.opacity??1};
 }else if(['scene','postcard'].includes(id)){
  clip.kind=id;clip.payload={visual:deepClone(p.visuals[id]),assetKey:p.imageKeys?.[id]||null};
 }else if(id==='note'){
  clip.kind='note';
  const keys=['note_title','label_base','label_duration','label_highlight','label_tips','base','duration','highlight','tips'];
  clip.payload={visual:deepClone(p.visuals.note),fields:{},offsets:{},styles:{},
   noteScale:p.noteScale,noteTextShift:p.noteTextShift,noteTitleMode:p.noteTitleMode};
  for(const key of keys){
   clip.payload.fields[key]=p.fields[key];
   if(p.offsets?.[key])clip.payload.offsets[key]=deepClone(p.offsets[key]);
   if(p.textStyles?.[key])clip.payload.styles[key]=deepClone(p.textStyles[key]);
  }
 }else throw Error('Questo elemento non è copiabile');
 const key=clip.kind==='sticker'?clip.payload.key:clip.kind==='scene'||clip.kind==='postcard'?clip.payload.assetKey:null;
 if(key&&ASSETS[key]&&String(ASSETS[key]).startsWith('data:image/'))clip.customAsset={key,data:ASSETS[key]};
 return clip
}
async function kuraCopyElement(){
 const clip=kuraElementPayload();
 const ok=await dbPut(KURA_CLIPBOARD_STORAGE,clip);
 try{localStorage.setItem(KURA_CLIPBOARD_STORAGE,JSON.stringify(clip))}catch(_){}
 try{await navigator.clipboard?.writeText?.(JSON.stringify(clip))}catch(_){}
 emitToast('Elemento copiato: apri un altro progetto e premi Incolla ✓');
 return{ok:true,kind:clip.kind,saved:ok}
}
async function kuraPasteElement(){
 let clip=null;
 try{
  const raw=await navigator.clipboard?.readText?.();
  if(raw){const obj=JSON.parse(raw);if(obj?.format==='KURA_ELEMENT_V1')clip=obj}
 }catch(_){}
 if(!clip)clip=await dbGet(KURA_CLIPBOARD_STORAGE);
 if(!clip){try{clip=JSON.parse(localStorage.getItem(KURA_CLIPBOARD_STORAGE))}catch(_){}}
 if(!clip||clip.format!=='KURA_ELEMENT_V1'||!['text','sticker','scene','postcard','note'].includes(clip.kind))throw Error('Nessun elemento KURA copiato');
 const p=page();if(!p)throw Error('Apri prima un progetto');
 if(clip.customAsset){
  const {key,data}=clip.customAsset;
  if(/^custom_[a-zA-Z0-9_-]+$/.test(key)&&typeof data==='string'&&data.startsWith('data:image/')&&data.length<15000000){
   ASSETS[key]=data;imageCache.delete(key);assetImage(key)
  }
 }
 snapshot();let pasteId='';
 const obj=deepClone(clip.payload||{});
 if(clip.kind==='sticker'){
  obj.id=uuid();obj.x=(Number(obj.x)||200)+24;obj.y=(Number(obj.y)||300)+24;
  p.stickers.push(obj);pasteId='sticker:'+obj.id;
 }else if(clip.kind==='text'){
  const id=uuid(),r=obj.rect||{},f={id,text:String(obj.text||''),x:(Number(r.x)||130)+20,y:(Number(r.y)||240)+20,
   w:Math.max(80,Number(r.w)||440),h:Math.max(35,Number(r.h)||110),
   rot:Number(obj.rot)||0,opacity:obj.opacity??1,scale:1};
  ensurePage(p).freeTexts.push(f);p.textStyles['free:'+id]=deepClone(obj.style||{});
  pasteId='text:free:'+id;
 }else if(clip.kind==='scene'||clip.kind==='postcard'){
  p.visuals[clip.kind]={...p.visuals[clip.kind],...obj.visual,visible:true};
  p.imageKeys??={};p.imageKeys[clip.kind]=obj.assetKey;
  pasteId=clip.kind;
 }else{
  p.visuals.note={...p.visuals.note,...obj.visual,visible:true};
  p.noteScale=obj.noteScale??p.noteScale;p.noteTextShift=obj.noteTextShift??p.noteTextShift;
  p.noteTitleMode=obj.noteTitleMode||'image';
  Object.assign(p.fields,obj.fields||{});Object.assign(p.offsets,obj.offsets||{});
  Object.assign(p.textStyles,obj.styles||{});pasteId='note'
 }
 selected=pasteId;activeKey=null;shownPage=null;refreshAll();scheduleSave();
 emitToast('Elemento incollato nel progetto ✓');
 return{ok:true,kind:clip.kind,selected:pasteId}
}
// Local-project bridge for optional GitHub cloud save. Never exposes auth credentials.
window.KURA_PROJECTS=Object.freeze({
 copyElement:kuraCopyElement,
 pasteElement:kuraPasteElement,
 createFromBrief:createKuraProjectFromBrief,
 current(){return{id:currentProjectId,name:pIndex.find(v=>v.id===currentProjectId)?.name||'Carosello KURA'}},
 async saveLocal(){await persistNow();return exportProject()},
 async saveAs(name){
  if(!managerReady)throw Error('Progetti non ancora caricati');
  const label=String(name||'').trim().slice(0,100);
  if(!label)throw Error('Inserisci un nome');
  await persistNow();
  const old=exportProject(),newId=uuid();
  pIndex.push({id:newId,name:label,updatedAt:Date.now()});
  currentProjectId=newId;
  pages=old.pages.map(normalizePage).map(ensurePage);
  for(const p of pages)p.id=uuid();
  current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
  refreshAll();showProjectOptions();await persistNow();
  return exportProject();
 },
 async replaceFromCloud(data){
  if(!managerReady||!data||!Array.isArray(data.pages)||!data.pages.length||data.pages.length>50)throw Error('Progetto remoto non valido');
  const id=String(data.projectId||'');
  if(!/^[a-zA-Z0-9_-]{3,100}$/.test(id))throw Error('ID progetto non valido');
  clearTimeout(saveTimer);
  const label=String(data.projectName||'Carosello KURA').slice(0,100);
  const record=pIndex.find(x=>x.id===id);
  if(record)record.name=label;
  else pIndex.push({id,name:label,updatedAt:Date.now()});
  currentProjectId=id;currentProjectMeta=deepClone(data.meta||{});
  pages=data.pages.map(normalizePage).map(ensurePage);
  for(const[k,v]of Object.entries(data.customAssets||{})){
   if(k.startsWith('custom_')&&typeof v==='string'&&v.startsWith('data:image/')){ASSETS[k]=v;imageCache.delete(k);assetImage(k)}
  }
  current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
  refreshAll();showProjectOptions();await persistNow();
  return{source:'cloud',id,pages:pages.length};
 },
 async openCloud(data){
  if(!managerReady)throw Error('Progetti non pronti');
  if(!data||!Array.isArray(data.pages)||!data.pages.length||data.pages.length>50)throw Error('Progetto GitHub non valido');
  const id=String(data.projectId||'').trim();
  if(!/^[a-zA-Z0-9_-]{3,100}$/.test(id))throw Error('Identificativo progetto non valido');
  if(pIndex.some(x=>x.id===id)){await switchProject(id);return{source:'local',id}}
  await persistNow();
  const label=String(data.projectName||'Progetto GitHub').slice(0,100);
  pIndex.push({id,name:label,updatedAt:Date.now()});currentProjectId=id;currentProjectMeta=deepClone(data.meta||{});
  pages=data.pages.map(normalizePage).map(ensurePage);
  for(const[k,v]of Object.entries(data.customAssets||{})){
   if(k.startsWith('custom_')&&typeof v==='string'&&v.startsWith('data:image/')){
    ASSETS[k]=v;imageCache.delete(k);assetImage(k)
   }
  }
  current=0;selected=null;activeKey=null;shownPage=null;history=[];future=[];updateHistory();
  refreshAll();showProjectOptions();await persistNow();
  return{source:'github',id}
 }
});
// UI extension API: color changes share the exact existing textStyles/renderer/export path.
window.KURA_TEXT_COLOR=Object.freeze({
 selectedKey(){
  const key=toolbar?.dataset?.key;
  return key&&toolbar&&!toolbar.classList.contains('hidden')?key:null
 },
 colorFor(key){return key&&page()?styleFor(page(),key).color:null},
 applyColor(color){
  const key=this.selectedKey();
  if(!key||!/^#[0-9a-fA-F]{6}$/.test(String(color||'')))return false;
  const normalized=color.toUpperCase();
  if(styleFor(page(),key).color.toUpperCase()===normalized)return true;
  snapshot();changeStyle(key,{color:normalized});
  document.dispatchEvent(new CustomEvent('kura:text-color-changed',{detail:{key,color:normalized}}));
  return true;
 }
});
window.KURA_V2={version:'4.4.0',drawKuraBackground:drawKuraBackground,paintEditable:paintEditable,paintFreeTexts:paintFreeTexts,commonBodyFontSize:commonBodyFontSize};
addV2Controls();initOverlay();initVisualTransform();bindBackgroundControls();bindProjectActions();
(function(){
 const top=document.querySelector('.top-actions');
 if(top&&!document.getElementById('kuraCoverLaunch')){
  const link=document.createElement('a');link.id='kuraCoverLaunch';link.href='./covers.html';link.className='btn ghost';link.textContent='✂ Copertine';
  link.setAttribute('aria-label','Apri editor copertine KURA');top.insertBefore(link,top.querySelector('#topJson')||null);
 }
})();
window.addEventListener('load',function(){initManager();checkHostedFont();});
})();
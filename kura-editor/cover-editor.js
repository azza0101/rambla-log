/* KURA Cover Workshop v1 — independent cover authoring, MCP ready */
(function(){
'use strict';
const CW=1080,CH=1350,LS='kura-cover-projects-v1';
const monthNames=['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO','LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'];
const season=(m)=>m<=1||m===11?'winter':m<=4?'spring':m<=7?'summer':'autumn';
const seasons={winter:{coat:'#b76b42',scarf:'#667c50'},spring:{coat:'#b88a66',scarf:'#8caa7c'},summer:{coat:'#ce8a55',scarf:'#e1b65c'},autumn:{coat:'#bc6948',scarf:'#526c44'}};
const fallbackIslands=['./assets/sfondo_spring_2.svg','./assets/sfondo_summer_1.svg','./assets/sfondo_autumn_2.svg'];
let doc=null, canvas,ctx,wrap,ui,selected='month',drag=null,lastProject=null;
const $=id=>document.getElementById(id);
const clone=x=>JSON.parse(JSON.stringify(x));
const id=()=>Math.random().toString(36).slice(2,10);
const assets=new Map();
function coverDefaults(){return {id:id(),name:'Copertina',month:10,year:2026,destinations:['Valle del Vipacco','Maiorca','Kruger'],giuliaSide:'right',seasonHint:'auto',assets:{logo:null,giulia:null,islands:[null,null,null]},geometry:{
 island1:{x:26,y:83,w:515,h:400,angle:-3},island2:{x:558,y:85,w:493,h:395,angle:4},island3:{x:35,y:937,w:626,h:346,angle:-2},
 giulia:{x:772,y:913,w:281,h:400,angle:0},
 fixedTitle:{x:229,y:502,w:622,h:224,angle:-2},
 month:{x:168,y:714,w:744,h:130,angle:0},
 strap:{x:278,y:837,w:530,h:68,angle:-1},
 year:{x:451,y:917,w:190,h:66,angle:-3},
 logo:{x:410,y:20,w:260,h:105,angle:0}},type:{monthSize:110,yearSize:43},created:new Date().toISOString()}}
function load(){try{doc=JSON.parse(localStorage.getItem(LS))||coverDefaults()}catch{doc=coverDefaults()};if(!doc?.geometry)doc=coverDefaults();} 
function save(){try{localStorage.setItem(LS,JSON.stringify(doc));$('coverStatus').textContent='Salvato'}catch{$('coverStatus').textContent='Memoria piena: esporta JSON'}}
function later(){const s=$('coverStatus');if(s)s.textContent='Modifiche…';clearTimeout(lastProject);lastProject=setTimeout(save,550)}
function roundRect(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
function noise(c){let seed=3121;for(let i=0;i<1200;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const x=(seed>>>0)%CW;seed=(Math.imul(seed,1664525)+1013904223)|0;const y=(seed>>>0)%CH;c.fillStyle=i%4?'rgba(255,255,255,.018)':'rgba(175,196,151,.019)';c.fillRect(x,y,2,2)}}
function rag(c,x,y,w,h,fill,seed=0){
 let r=(n)=>Math.sin(n*63.14+seed*17.2)*7;
 c.beginPath();c.moveTo(x+5,y+6);
 for(let p=0;p<=w;p+=16)c.lineTo(x+p,y+5+r(p));
 for(let p=0;p<=h;p+=15)c.lineTo(x+w+3+r(p+44),y+p);
 for(let p=w;p>=0;p-=16)c.lineTo(x+p,y+h+r(p+77));
 for(let p=h;p>=0;p-=15)c.lineTo(x+r(p+88),y+p);
 c.closePath();c.fillStyle=fill;c.fill();
}
function fitImg(c,im,g){if(!im?.complete||!im.naturalWidth)return false;const r=Math.min(g.w/im.naturalWidth,g.h/im.naturalHeight);c.drawImage(im,(g.w-im.naturalWidth*r)/2,(g.h-im.naturalHeight*r)/2,im.naturalWidth*r,im.naturalHeight*r);return true}
function image(src){if(!src)return null;if(assets.has(src))return assets.get(src);const im=new Image();im.onload=()=>render();im.onerror=()=>{};im.src=src;assets.set(src,im);return im}
function centerText(c,txt,x,y,size,color,hand=false){c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font=hand?`italic 700 ${size}px cursive`:`900 ${size}px Montserrat,Arial,sans-serif`;c.fillText(txt,x,y)}
function island(c,key,i){const g=doc.geometry[key];c.save();c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);const x=-g.w/2,y=-g.h/2;
 c.save();c.beginPath();const k=g.w/17;for(let t=0;t<=17;t++){const px=x+t*k,py=y+17*Math.sin(t*2.7+i);if(t===0)c.moveTo(px,py);else c.lineTo(px,py)}for(let t=17;t>=0;t--){const px=x+t*k,py=y+g.h+12*Math.sin(t*1.8+i+1);c.lineTo(px,py)}c.closePath();c.clip();
 c.fillStyle=['#c2d5c0','#9cc5d9','#d6c9a0'][i];c.fillRect(x,y,g.w,g.h);
 const src=doc.assets.islands[i]||fallbackIslands[i];const im=image(src);if(im?.naturalWidth){const ratio=Math.max(g.w/im.naturalWidth,g.h/im.naturalHeight);c.drawImage(im,x+(g.w-im.naturalWidth*ratio)/2,y+(g.h-im.naturalHeight*ratio)/2,im.naturalWidth*ratio,im.naturalHeight*ratio)}
 else{c.fillStyle='#688b78';c.beginPath();c.moveTo(x,y+g.h*.85);c.lineTo(x+g.w*.4,y+g.h*.22);c.lineTo(x+g.w*.8,y+g.h*.79);c.fill()}
 c.restore();c.restore();
}
function drawGiulia(c){const g=doc.geometry.giulia;c.save();c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);const x=-g.w/2,y=-g.h/2;
 if(doc.assets.giulia&&fitImg(c,image(doc.assets.giulia),{w:g.w,h:g.h})){c.restore();return}
 // Indicative placeholder only: not canonical Giulia artwork
 const cloth=seasons[season(doc.month)];
 c.fillStyle='#39251e';for(let i=0;i<13;i++){c.beginPath();c.ellipse(x+g.w*.48+Math.cos(i)*g.w*.18,y+g.h*.29+Math.sin(i*1.7)*g.h*.13,g.w*.22,g.h*.19,i/8,0,Math.PI*2);c.fill()}
 c.fillStyle='#ca8a62';c.beginPath();c.ellipse(x+g.w*.49,y+g.h*.26,g.w*.23,g.h*.21,-.08,0,Math.PI*2);c.fill();
 c.strokeStyle='#ecdcb9';c.lineWidth=4;for(let j of [-1,1]){c.beginPath();c.moveTo(x+g.w*(.49+j*.04),y+g.h*.23);for(let i=0;i<8;i++){const a=i*Math.PI/4;c.lineTo(x+g.w*(.49+j*.04)+Math.cos(a)*g.w*.1,y+g.h*.23+Math.sin(a)*g.h*.08)}c.closePath();c.stroke()}
 c.fillStyle=cloth.coat;roundRect(c,x+g.w*.17,y+g.h*.53,g.w*.65,g.h*.47,42,cloth.coat);
 roundRect(c,x+g.w*.24,y+g.h*.52,g.w*.55,25,12,cloth.scarf);c.restore();
}
function drawTitle(c){
 const g=doc.geometry.fixedTitle;c.save();c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);
 const x=-g.w/2,y=-g.h/2;rag(c,x+5,y+4,g.w-10,g.h*.56,'#f6e9d9',10);
 rag(c,x+g.w*.17,y+g.h*.51,g.w*.64,g.h*.49,'#eab039',13);
 centerText(c,'3 VIAGGI',0,y+g.h*.31,93,'#103a2a');
 centerText(c,'da fare a',0,y+g.h*.76,78,'#103a2a',true);
 c.restore();
}
function drawMove(c,key,fn){const g=doc.geometry[key];c.save();c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);fn(g);c.restore()}
function coverRender(c=ctx,selection=true){
 c.clearRect(0,0,CW,CH);c.fillStyle='#08251a';c.fillRect(0,0,CW,CH);noise(c);
 for(let i=0;i<2;i++)island(c,'island'+(i+1),i);
 // brand: original logo required; placeholder text shown until uploaded
 drawMove(c,'logo',g=>{if(doc.assets.logo){fitImg(c,image(doc.assets.logo),g)}else{centerText(c,'KURA',0,-20,74,'#fff1e0');centerText(c,'V I A G G I',0,30,27,'#fff1e0')}});
 drawTitle(c);
 drawMove(c,'month',g=>centerText(c,monthNames[doc.month],0,0,doc.type.monthSize,'#fff0df'));
 drawMove(c,'strap',g=>{rag(c,-g.w/2,-g.h/2,g.w,g.h,'#a93b28',36);centerText(c,'(SENZA OVERTOURISM)',0,0,42,'#fdf0e5',true)});
 drawMove(c,'year',g=>{centerText(c,String(doc.year),0,-12,doc.type.yearSize,'#fff0df',true);c.strokeStyle='#efbb44';c.lineWidth=8;c.beginPath();c.moveTo(-55,19);c.quadraticCurveTo(0,11,67,15);c.stroke()});
 island(c,'island3',2);drawGiulia(c);
 if(selection){const g=doc.geometry[selected];if(g){c.save();c.strokeStyle='#e4b15d';c.lineWidth=3;c.setLineDash([8,6]);c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);c.strokeRect(-g.w/2,-g.h/2,g.w,g.h);c.restore()}}
}
function render(){if(!ctx)return;coverRender();$('coverMonth').value=String(doc.month);$('coverYear').value=doc.year;$('coverSeason').textContent=season(doc.month);$('coverDest1').value=doc.destinations[0]||'';$('coverDest2').value=doc.destinations[1]||'';$('coverDest3').value=doc.destinations[2]||'';$('coverSide').value=doc.giuliaSide;updateSelectedControls()}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*CW/r.width,y:(e.clientY-r.top)*CH/r.height}}
function hit(p){for(const key of ['giulia','island3','month','strap','fixedTitle','year','logo','island2','island1']){const g=doc.geometry[key];if(p.x>=g.x&&p.x<=g.x+g.w&&p.y>=g.y&&p.y<=g.y+g.h)return key}return null}
function updateSelectedControls(){const g=doc.geometry[selected];if(!g)return;$('coverSelected').textContent=selected;$('coverSize').value=Math.round(g.w);$('coverRotate').value=g.angle}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function exportPNG(){const off=document.createElement('canvas');off.width=CW;off.height=CH;coverRender(off.getContext('2d'),false);off.toBlob(b=>download(b,'KURA_COVER_'+monthNames[doc.month]+'_'+doc.year+'.png'))}
function setImage(file,key,index){if(!file)return;if(!file.type.startsWith('image/')){alert('Serve un file immagine');return}const r=new FileReader();r.onload=()=>{if(key==='islands')doc.assets.islands[index]=r.result;else doc.assets[key]=r.result;save();render()};r.readAsDataURL(file)}
function uiHTML(){return `<section class="panel" id="kuraCoverPanel" style="padding:18px;margin-top:12px"><div class="eyebrow">Serie ufficiale 3 viaggi</div><h2>Copertine KURA</h2><p class="hint">Master 4:5: tre isole, logo, blocchi centrali fissi e Giulia indipendente. Trascina gli elementi sull'anteprima e modifica i valori qui.</p>
 <div class="dual"><div class="field"><label>Mese</label><select id="coverMonth">${monthNames.map((m,i)=>'<option value="'+i+'">'+m+'</option>').join('')}</select></div><div class="field"><label>Anno</label><input id="coverYear" type="number" min="2025" max="2100"/></div></div>
 <div class="field"><label>Stagione dedotta</label><b id="coverSeason">autumn</b></div>
 <div class="field"><label>Destinazione 1</label><input id="coverDest1" type="text"/></div>
 <div class="field"><label>Destinazione 2</label><input id="coverDest2" type="text"/></div>
 <div class="field"><label>Destinazione 3</label><input id="coverDest3" type="text"/></div>
 <div class="field"><label>Posizione Giulia</label><select id="coverSide"><option value="right">A destra</option><option value="left">A sinistra</option></select></div>
 <div class="section-title">Immagini modificabili</div>
 <p class="hint">Per rispettare la Bible carica le tre illustrazioni papercut e Giulia canonica come PNG trasparenti. Le anteprime segnaposto non sono asset KURA definitivi.</p>
 <div class="field"><label>Logo KURA originale</label><input id="coverLogoFile" type="file" accept="image/png,image/webp,image/svg+xml"/></div>
 <div class="field"><label>Giulia canonica</label><input id="coverGiuliaFile" type="file" accept="image/png,image/webp"/></div>
 ${[1,2,3].map(i=>'<div class="field"><label>Isola '+i+'</label><input id="coverIsland'+i+'" type="file" accept="image/png,image/webp,image/svg+xml"/></div>').join('')}
 <div class="section-title">Livello selezionato: <span id="coverSelected">month</span></div>
 <div class="field"><label>Larghezza</label><input id="coverSize" type="range" min="60" max="1050" step="5"/></div>
 <div class="field"><label>Rotazione</label><input id="coverRotate" type="range" min="-35" max="35" step="1"/></div>
 <div class="compact-actions"><button id="coverExport" class="btn primary">Esporta PNG</button><button id="coverExportJSON" class="btn flat">Esporta progetto</button><label class="btn file-label">Importa JSON<input id="coverImportJSON" type="file" accept=".json,application/json"/></label></div>
 <p class="hint"><span id="coverStatus">Salvato</span> · Il progetto copertina viene salvato nel browser separatamente dalle pagine interne.</p></section>`}
function setup(){
 const tabs=document.querySelector('.tabs'),workspace=document.querySelector('.shell');if(!tabs||!workspace)return;
 const tab=document.createElement('button');tab.className='tab';tab.textContent='Copertine';tab.dataset.tab='covers';tabs.appendChild(tab);
 const panel=document.createElement('div');panel.className='tabpane';panel.id='tab-covers';panel.innerHTML=uiHTML();document.querySelector('.editor-panel').appendChild(panel);
 const stage=document.createElement('div');stage.id='coverStage';stage.style.cssText='display:none;width:min(100%,560px);aspect-ratio:4/5;position:relative;background:#0b261c';
 canvas=document.createElement('canvas');canvas.width=CW;canvas.height=CH;canvas.style.cssText='width:100%;height:100%;touch-action:none;display:block';stage.appendChild(canvas);ctx=canvas.getContext('2d');
 document.querySelector('.stage-bg').appendChild(stage);wrap=stage;
 const baseStage=document.querySelector('.stage-inner'),baseInspect=document.querySelector('.inspector'),hint=document.querySelector('.stage-footer');
 function activate(){baseStage.style.display='none';stage.style.display='block';if(baseInspect)baseInspect.style.display='none';if(hint)hint.style.display='none';document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===tab));document.querySelectorAll('.tabpane').forEach(x=>x.classList.toggle('active',x===panel));render()}
 function deactivate(){stage.style.display='none';baseStage.style.display='block';if(baseInspect)baseInspect.style.display='';if(hint)hint.style.display=''}
 tab.onclick=activate;document.querySelectorAll('.tab:not([data-tab="covers"])').forEach(x=>x.addEventListener('click',deactivate));
 canvas.addEventListener('pointerdown',e=>{let p=point(e),key=hit(p);if(!key)return;selected=key;drag={p,original:clone(doc.geometry[key]),pointer:e.pointerId};canvas.setPointerCapture(e.pointerId);render()});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const p=point(e),g=doc.geometry[selected];g.x=drag.original.x+p.x-drag.p.x;g.y=drag.original.y+p.y-drag.p.y;render()});
 canvas.addEventListener('pointerup',()=>{if(drag){drag=null;later()}});canvas.addEventListener('pointercancel',()=>{drag=null});
 $('coverMonth').onchange=e=>{doc.month=+e.target.value;later();render()};
 $('coverYear').onchange=e=>{doc.year=+e.target.value;later();render()};
 for(let i=0;i<3;i++){$('coverDest'+(i+1)).onchange=e=>{doc.destinations[i]=e.target.value;later()};$('coverIsland'+(i+1)).onchange=e=>setImage(e.target.files[0],'islands',i)}
 $('coverSide').onchange=e=>{const side=e.target.value;if(doc.giuliaSide!==side){const g=doc.geometry.giulia;g.x=CW-g.x-g.w;doc.giuliaSide=side;later();render()}};
 $('coverLogoFile').onchange=e=>setImage(e.target.files[0],'logo');
 $('coverGiuliaFile').onchange=e=>setImage(e.target.files[0],'giulia');
 $('coverSize').oninput=e=>{doc.geometry[selected].w=+e.target.value;later();render()};
 $('coverRotate').oninput=e=>{doc.geometry[selected].angle=+e.target.value;later();render()};
 $('coverExport').onclick=exportPNG;
 $('coverExportJSON').onclick=()=>download(new Blob([JSON.stringify({format:'KURA_COVER_V1',cover:doc},null,2)],{type:'application/json'}),'KURA_cover_project.json');
 $('coverImportJSON').onchange=async e=>{try{const obj=JSON.parse(await e.target.files[0].text());doc=clone(obj.cover||obj);if(!doc.geometry)throw Error('Missing geometry');save();render()}catch(err){alert('Progetto non valido: '+err.message)}};
 load();render();
}
window.KURA_COVER_MCP={schemaVersion:1,get:()=>clone(doc),set:(patch)=>{if(!doc)load();for(const key of ['month','year','destinations','giuliaSide','seasonHint'])if(Object.prototype.hasOwnProperty.call(patch,key))doc[key]=clone(patch[key]);if(patch.geometry)for(const[k,g]of Object.entries(patch.geometry))if(doc.geometry[k])Object.assign(doc.geometry[k],g);later();render();return clone(doc)},setImage:(key,dataURL,index)=>{if(key==='islands')doc.assets.islands[index]=dataURL;else doc.assets[key]=dataURL;later();render()},exportJSON:()=>JSON.stringify({format:'KURA_COVER_V1',cover:doc})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();

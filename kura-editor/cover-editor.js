/* KURA Cover Workshop v1 — independent cover authoring, MCP ready */
(function(){
'use strict';
const CW=1080,CH=1350,LS='kura-cover-projects-v1';
const monthNames=['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO','LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'];
const season=(m)=>m<=1||m===11?'winter':m<=4?'spring':m<=7?'summer':'autumn';
const seasons={winter:{coat:'#b76b42',scarf:'#667c50'},spring:{coat:'#b88a66',scarf:'#8caa7c'},summer:{coat:'#ce8a55',scarf:'#e1b65c'},autumn:{coat:'#bc6948',scarf:'#526c44'}};
const REQUIRED_COVER_ASSETS=['logo','fixedTitle','strap','giulia'];
const FIXED_KEYS=new Set(['logo','fixedTitle','month','strap','year']);
let doc=null, canvas,ctx,wrap,ui,selected='month',drag=null,lastProject=null;
const $=id=>document.getElementById(id);
const clone=x=>JSON.parse(JSON.stringify(x));
const id=()=>Math.random().toString(36).slice(2,10);
const assets=new Map();
function coverDefaults(){return {id:id(),name:'Copertina',month:10,year:2026,destinations:['','',''],giuliaSide:'right',seasonHint:'auto',assets:{logo:null,giulia:null,fixedTitle:null,strap:null,islands:[null,null,null]},geometry:{
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
function missingAsset(c,g,label){
 c.save();c.fillStyle='rgba(252,247,233,.09)';c.strokeStyle='rgba(239,191,108,.58)';c.lineWidth=3;c.setLineDash([14,8]);c.strokeRect(g.x+5,g.y+5,g.w-10,g.h-10);
 c.font='700 23px Montserrat,Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#efd9b2';
 c.fillText(label,g.x+g.w/2,g.y+g.h/2,Math.max(140,g.w-40));c.restore();
}
function island(c,key,i){
 const geom=doc.geometry[key],asset=doc.assets.islands[i];
 if(!asset){if(c===ctx)missingAsset(c,geom,'ISOLA '+(i+1)+' · PNG KURA');return}
 const im=image(asset);if(!im?.complete||!im?.naturalWidth)return;
 c.save();c.translate(geom.x+geom.w/2,geom.y+geom.h/2);c.rotate(geom.angle*Math.PI/180);
 const width=geom.w,height=geom.h;
 // The paper-cut silhouette comes from the transparent source artwork, never a generic mask.
 const k=Math.min(width/im.naturalWidth,height/im.naturalHeight);
 c.drawImage(im,-im.naturalWidth*k/2,-im.naturalHeight*k/2,im.naturalWidth*k,im.naturalHeight*k);
 c.restore();
}
function drawGiulia(c){
 const g=doc.geometry.giulia;
 if(!doc.assets.giulia){if(c===ctx)missingAsset(c,g,'GIULIA · ASSET CANONICO');return}
 const im=image(doc.assets.giulia);if(!im?.complete||!im.naturalWidth)return;
 c.save();c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);
 const ratio=Math.min(g.w/im.naturalWidth,g.h/im.naturalHeight);
 c.drawImage(im,-im.naturalWidth*ratio/2,-im.naturalHeight*ratio/2,im.naturalWidth*ratio,im.naturalHeight*ratio);
 c.restore();
}
function drawTitle(c){
 const g=doc.geometry.fixedTitle,asset=doc.assets.fixedTitle;
 if(!asset){if(c===ctx)missingAsset(c,g,'TITOLO MASTER · PNG');return}
 const im=image(asset);if(!im?.complete||!im.naturalWidth)return;
 c.save();c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);
 const scale=Math.min(g.w/im.naturalWidth,g.h/im.naturalHeight);
 c.drawImage(im,-im.naturalWidth*scale/2,-im.naturalHeight*scale/2,im.naturalWidth*scale,im.naturalHeight*scale);
 c.restore();
}
function drawMove(c,key,fn){const g=doc.geometry[key];c.save();c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);fn(g);c.restore()}
function coverRender(c=ctx,selection=true){
 c.clearRect(0,0,CW,CH);c.fillStyle='#07251a';c.fillRect(0,0,CW,CH);noise(c);
 for(let i=0;i<2;i++)island(c,'island'+(i+1),i);
 const logo=doc.geometry.logo;
 if(doc.assets.logo){drawMove(c,'logo',g=>{c.save();c.translate(-g.w/2,-g.h/2);fitImg(c,image(doc.assets.logo),g);c.restore()})}
 else if(c===ctx)missingAsset(c,logo,'LOGO KURA ORIGINALE');
 drawTitle(c);
 drawMove(c,'month',g=>centerText(c,monthNames[doc.month],0,0,doc.type.monthSize,'#fff0df'));
 if(doc.assets.strap){drawMove(c,'strap',g=>{c.save();c.translate(-g.w/2,-g.h/2);fitImg(c,image(doc.assets.strap),g);c.restore()})}
 else if(c===ctx)missingAsset(c,doc.geometry.strap,'CARTIGLIO MASTER');
 drawMove(c,'year',g=>{c.save();c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f6ecdc';c.font='700 '+doc.type.yearSize+'px Caveat,cursive';c.fillText(String(doc.year),0,-9);c.strokeStyle='#e9b445';c.lineWidth=7;c.beginPath();c.moveTo(-50,20);c.quadraticCurveTo(0,10,62,15);c.stroke();c.restore()});
 island(c,'island3',2);drawGiulia(c);
 if(selection&&!FIXED_KEYS.has(selected)){const g=doc.geometry[selected];if(g){c.save();c.strokeStyle='#e7b76d';c.lineWidth=2;c.setLineDash([12,6]);c.translate(g.x+g.w/2,g.y+g.h/2);c.rotate(g.angle*Math.PI/180);c.strokeRect(-g.w/2,-g.h/2,g.w,g.h);c.restore()}}
}
function render(){if(!ctx)return;coverRender();const missing=validateCover();const el=$('coverValidation');if(el)el.textContent=missing.length?'Mancano: '+missing.join(' · '):'Asset presenti. Controlla la coerenza visiva prima di esportare.';const exportBtn=$('coverExport');if(exportBtn){exportBtn.disabled=missing.length>0;exportBtn.title=missing.length?missing.join(' · '):'Esporta PNG'}$('coverMonth').value=String(doc.month);$('coverYear').value=doc.year;$('coverSeason').textContent=season(doc.month);$('coverDest1').value=doc.destinations[0]||'';$('coverDest2').value=doc.destinations[1]||'';$('coverDest3').value=doc.destinations[2]||'';$('coverSide').value=doc.giuliaSide;updateSelectedControls()}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*CW/r.width,y:(e.clientY-r.top)*CH/r.height}}
function hit(p){for(const key of ['giulia','island3','island2','island1']){const g=doc.geometry[key];if(p.x>=g.x&&p.x<=g.x+g.w&&p.y>=g.y&&p.y<=g.y+g.h)return key}return null}
function updateSelectedControls(){const g=doc.geometry[selected];if(!g)return;$('coverSelected').textContent=selected;$('coverSize').value=Math.round(g.w);$('coverRotate').value=g.angle}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function validateCover(){const errs=[];for(const k of REQUIRED_COVER_ASSETS)if(!doc.assets[k])errs.push(k);for(let i=0;i<3;i++){if(!doc.assets.islands[i])errs.push('isola '+(i+1));if(!doc.destinations[i]?.trim())errs.push('destinazione '+(i+1))}if(!(doc.month>=0&&doc.month<=11))errs.push('mese');if(!(doc.year>=2025&&doc.year<=2100))errs.push('anno');return errs}
function exportPNG(){const errs=validateCover();if(errs.length){alert('Per una copertina KURA servono: '+errs.join(', '));return}const off=document.createElement('canvas');off.width=CW;off.height=CH;coverRender(off.getContext('2d'),false);off.toBlob(b=>download(b,'KURA_COVER_'+monthNames[doc.month]+'_'+doc.year+'.png'))}
function setImage(file,key,index){if(!file)return;if(!file.type.startsWith('image/')){alert('Serve un file immagine');return}const r=new FileReader();r.onload=()=>{if(key==='islands')doc.assets.islands[index]=r.result;else doc.assets[key]=r.result;save();render()};r.readAsDataURL(file)}
function uiHTML(){return `<section class="panel" id="kuraCoverPanel" style="padding:18px;margin-top:12px"><div class="eyebrow">Serie ufficiale 3 viaggi</div><h2>Copertine KURA</h2><p class="hint">Master 4:5: tre isole, logo, blocchi centrali fissi e Giulia indipendente. Trascina gli elementi sull'anteprima e modifica i valori qui.</p>
 <div class="dual"><div class="field"><label>Mese</label><select id="coverMonth">${monthNames.map((m,i)=>'<option value="'+i+'">'+m+'</option>').join('')}</select></div><div class="field"><label>Anno</label><input id="coverYear" type="number" min="2025" max="2100"/></div></div>
 <div class="field"><label>Stagione dedotta</label><b id="coverSeason">autumn</b></div>
 <div class="field"><label>Destinazione 1</label><input id="coverDest1" type="text"/></div>
 <div class="field"><label>Destinazione 2</label><input id="coverDest2" type="text"/></div>
 <div class="field"><label>Destinazione 3</label><input id="coverDest3" type="text"/></div>
 <div class="field"><label>Posizione Giulia</label><select id="coverSide"><option value="right">A destra</option><option value="left">A sinistra</option></select></div>
 <div class="section-title">Immagini modificabili</div>
 <p class="hint"><strong>Modalità GOLD MASTER:</strong> senza gli asset canonici il sistema mostra solo segnaposto editoriali e non esporta una cover finta. Carica le tre isole KURA, logo originale, titolo fisso, cartiglio e Giulia.</p>
 <div class="field"><label>Logo KURA originale</label><input id="coverLogoFile" type="file" accept="image/png,image/webp,image/svg+xml"/></div>
 <div class="field"><label>Giulia canonica</label><input id="coverGiuliaFile" type="file" accept="image/png,image/webp"/></div><div class="field"><label>Cartiglio originale (SENZA OVERTOURISM) · PNG trasparente</label><input id="coverStrapFile" type="file" accept="image/png,image/webp"/></div><div class="field"><label>Titolo fisso PNG trasparente (3 VIAGGI / da fare a)</label><input id="coverFixedFile" type="file" accept="image/png,image/webp"/></div>
 ${[1,2,3].map(i=>'<div class="field"><label>Isola '+i+'</label><input id="coverIsland'+i+'" type="file" accept="image/png,image/webp,image/svg+xml"/></div>').join('')}
 <div class="section-title">Livello selezionato: <span id="coverSelected">month</span></div>
 <div class="field"><label>Larghezza</label><input id="coverSize" type="range" min="60" max="1050" step="5"/></div>
 <div class="field"><label>Rotazione</label><input id="coverRotate" type="range" min="-35" max="35" step="1"/></div>
 <div class="softbox orange" role="status" id="coverValidation" style="font-size:11px;line-height:1.6">Verifica asset master</div><div class="compact-actions"><button id="coverExport" class="btn primary">Esporta PNG</button><button id="coverExportJSON" class="btn flat">Esporta progetto</button><label class="btn file-label">Importa JSON<input id="coverImportJSON" type="file" accept=".json,application/json"/></label></div>
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
 $('coverStrapFile').onchange=e=>setImage(e.target.files[0],'strap');
 $('coverFixedFile').onchange=e=>setImage(e.target.files[0],'fixedTitle');
 $('coverSize').oninput=e=>{doc.geometry[selected].w=+e.target.value;later();render()};
 $('coverRotate').oninput=e=>{doc.geometry[selected].angle=+e.target.value;later();render()};
 $('coverExport').onclick=exportPNG;
 $('coverExportJSON').onclick=()=>download(new Blob([JSON.stringify({format:'KURA_COVER_V1',cover:doc},null,2)],{type:'application/json'}),'KURA_cover_project.json');
 $('coverImportJSON').onchange=async e=>{try{const obj=JSON.parse(await e.target.files[0].text());doc=clone(obj.cover||obj);if(!doc.geometry)throw Error('Missing geometry');save();render()}catch(err){alert('Progetto non valido: '+err.message)}};
 load();render();
}
window.KURA_COVER_MCP={schemaVersion:2,get:()=>clone(doc),validate:()=>{if(!doc)load();return{valid:validateCover().length===0,missing:validateCover()}},set:(patch)=>{if(!doc)load();for(const key of ['month','year','destinations','giuliaSide','seasonHint'])if(Object.prototype.hasOwnProperty.call(patch,key))doc[key]=clone(patch[key]);if(patch.geometry)for(const[k,g]of Object.entries(patch.geometry)){if(FIXED_KEYS.has(k))throw Error('Il livello master '+k+' è bloccato');if(doc.geometry[k]&&['island1','island2','island3','giulia'].includes(k))Object.assign(doc.geometry[k],g)};later();render();return clone(doc)},setImage:(key,dataURL,index)=>{if(key==='islands')doc.assets.islands[index]=dataURL;else doc.assets[key]=dataURL;later();render()},exportJSON:()=>JSON.stringify({format:'KURA_COVER_V1',cover:doc})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();

/* KURA Editor 4.3 — 32 canonical swatches, free color picker and browser favorites. */
(function(){
 'use strict';
 const EDITOR=()=>window.KURA_TEXT_COLOR;
 const KEY='kura:favorite-colors:v1';
 const COLORS=[
  '#153D2D','#1B4D38','#28644A','#39805C','#5F9471','#86AD8F','#B8CFAD','#E3EBDD',
  '#7B382D','#A34D31','#C46B37','#D07834','#DE9150','#E8AC69','#F0C78A','#F7DEAC',
  '#102A23','#263A32','#455B4F','#66796B','#89988A','#B6BAAC','#DFDED2','#FFFFFF',
  '#111827','#34577A','#678CA5','#9EBAC6','#7B527D','#AB7890','#D2A9A7','#F7F1E6'
 ];
 const safe=s=>/^#[0-9a-f]{6}$/i.test(String(s||''))?String(s).toUpperCase():null;
 let favorites=[];
 try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(value))favorites=[...new Set(value.map(safe).filter(Boolean))].slice(0,20)}catch(_){}
 let trigger=null,panel=null,open=false;
 const current=()=>safe(EDITOR()?.colorFor(EDITOR()?.selectedKey()))||'#153D2D';
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(favorites))}catch(_){}}
 function apply(color){
  const hex=safe(color);if(!hex)return;
  if(!EDITOR()?.applyColor(hex))return;
  updateTrigger();updatePanel();
 }
 function updateTrigger(){
  if(!trigger)return;
  const hex=current();
  trigger.querySelector('.kura-color-dot').style.background=hex;
  trigger.querySelector('.kura-color-hex').textContent=hex;
  trigger.title='Colore testo: '+hex;
 }
 function close(){open=false;if(panel){panel.hidden=true;panel.setAttribute('aria-hidden','true')}trigger?.setAttribute('aria-expanded','false')}
 function place(){
  if(!panel||!trigger)return;
  const rect=trigger.getBoundingClientRect();
  const width=Math.min(345,window.innerWidth-24);
  panel.style.width=width+'px';
  panel.style.left=Math.max(12,Math.min(window.innerWidth-width-12,rect.left))+'px';
  const below=window.innerHeight-rect.bottom;
  const height=panel.offsetHeight||420;
  panel.style.top=(below>Math.min(height,440)+12?rect.bottom+9:Math.max(10,rect.top-height-10))+'px';
 }
 function makeSwatch(color,isFavorite){
  const b=document.createElement('button');
  b.type='button';b.className='kura-color-swatch';b.style.setProperty('--swatch',color);
  b.setAttribute('aria-label','Seleziona '+color);
  b.title=color;
  if(color===current())b.classList.add('selected');
  if(isFavorite)b.classList.add('favorite');
  b.onclick=()=>apply(color);
  return b;
 }
 function updatePanel(){
  if(!panel)return;
  const hex=current();
  const standard=panel.querySelector('[data-palette]');
  standard.replaceChildren(...COLORS.map(c=>makeSwatch(c,false)));
  const favs=panel.querySelector('[data-favorites]');
  favs.replaceChildren(...favorites.map(c=>makeSwatch(c,true)));
  panel.querySelector('[data-empty]').hidden=favorites.length>0;
  panel.querySelector('[data-hex]').value=hex;
  panel.querySelector('[data-picker]').value=hex;
  panel.querySelector('[data-favorite-toggle]').textContent=favorites.includes(hex)?'★ Nei preferiti':'☆ Salva preferito';
  panel.querySelector('[data-favorite-toggle]').setAttribute('aria-pressed',String(favorites.includes(hex)));
  if(open)requestAnimationFrame(place);
 }
 function create(){
  panel=document.createElement('div');
  panel.id='kuraColorPalette';
  panel.className='kura-color-popover';
  panel.hidden=true;
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Selezione colore testo');
  panel.setAttribute('aria-hidden','true');
  panel.innerHTML=[
   '<div class="kura-color-head"><b>Colore testo</b><button type="button" data-close aria-label="Chiudi la palette">×</button></div>',
   '<div class="kura-color-section"><strong>32 colori KURA</strong><div class="kura-color-grid" data-palette></div></div>',
   '<div class="kura-color-section"><div class="kura-color-section-head"><strong>Preferiti</strong><button data-favorite-toggle type="button" aria-pressed="false">☆ Salva preferito</button></div><div class="kura-color-grid" data-favorites></div><small data-empty>Non hai ancora colori preferiti.</small></div>',
   '<div class="kura-color-custom"><label>Colore libero<input type="color" data-picker aria-label="Selettore libero colore" value="#153d2d"/></label><label>HEX<input type="text" data-hex spellcheck="false" maxlength="7" placeholder="#153D2D" aria-label="Valore colore esadecimale"/></label><button type="button" data-apply class="btn flat small">Applica</button></div>',
   '<small class="kura-color-help">Il colore viene salvato nel progetto. I preferiti restano disponibili anche nei prossimi progetti di questo browser.</small>'
  ].join('');
  document.body.appendChild(panel);
  panel.querySelector('[data-close]').onclick=close;
  panel.querySelector('[data-favorite-toggle]').onclick=()=>{
   const color=current();
   if(favorites.includes(color))favorites=favorites.filter(x=>x!==color);
   else favorites=[color,...favorites].slice(0,20);
   persist();updatePanel()
  };
  panel.querySelector('[data-picker]').addEventListener('input',e=>{
   const hex=safe(e.target.value);if(!hex)return;
   panel.querySelector('[data-hex]').value=hex;
   apply(hex);
  });
  const commit=()=>{
   const entry=panel.querySelector('[data-hex]');
   const color=safe(entry.value);
   if(color){apply(color);entry.setCustomValidity('')}
   else{entry.setCustomValidity('Inserisci un colore HEX valido (#RRGGBB)');entry.reportValidity()}
  };
  panel.querySelector('[data-apply]').onclick=commit;
  panel.querySelector('[data-hex]').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit()}};
  document.addEventListener('pointerdown',e=>{if(open&&!panel.contains(e.target)&&!trigger?.contains(e.target))close()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)close()});
  window.addEventListener('resize',()=>{if(open)place()});
  document.addEventListener('scroll',()=>{if(open)place()},true);
 }
 function mount(){
  const toolbar=document.querySelector('.kura-selection-toolbar');
  if(!toolbar||!EDITOR())return;
  if(trigger?.isConnected){updateTrigger();return}
  trigger=document.createElement('button');
  trigger.type='button';trigger.className='kura-color-trigger';
  trigger.setAttribute('aria-label','Scegli il colore del testo');
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML='<span class="kura-color-dot"></span><span class="kura-color-hex">#153D2D</span><span class="kura-color-chevron">⌄</span>';
  const closeButton=toolbar.querySelector('[data-close]');
  if(closeButton)toolbar.insertBefore(trigger,closeButton);else toolbar.appendChild(trigger);
  trigger.addEventListener('pointerdown',e=>e.preventDefault());
  trigger.onclick=()=>{
   if(!panel)create();
   if(open){close();return}
   open=true;panel.hidden=false;panel.setAttribute('aria-hidden','false');
   trigger.setAttribute('aria-expanded','true');
   updatePanel();requestAnimationFrame(place);
  };
  updateTrigger();
 }
 document.addEventListener('kura:text-toolbar',()=>{mount();updateTrigger();if(open)updatePanel()});
 document.addEventListener('kura:text-color-changed',()=>{updateTrigger();if(open)updatePanel()});
 window.KURA_COLOR_PALETTE=Object.freeze({colors:COLORS.slice(),favorites:()=>favorites.slice(),apply});
})();

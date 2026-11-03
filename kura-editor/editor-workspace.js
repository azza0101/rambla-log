/* KURA Editor 4.2 — always-visible pages rail, cross-project clipboard, dark KURA theme. */
(function(){
 'use strict';
 const shell=document.querySelector('.shell'),pages=document.getElementById('tab-pages');
 if(!shell||!pages)return;
 const editor=shell.querySelector('.editor-panel');
 const rail=document.createElement('aside');
 rail.id='kuraPagesSidebar';rail.className='kura-pages-sidebar panel';
 rail.setAttribute('aria-label','Navigazione pagine e progetti');
 rail.innerHTML='<div class="kura-pages-rail-head"><strong>▤ Pagine</strong><div class="kura-pages-rail-actions"><button type="button" id="kuraRailAdd" title="Nuova pagina" aria-label="Nuova pagina">＋</button><button type="button" id="kuraPagesExpand" title="Gestione progetti e pagine" aria-expanded="false" aria-label="Gestione progetti">☷</button></div></div>';
 const tabButton=document.querySelector('.tab[data-tab="pages"]');
 if(tabButton)tabButton.remove();
 pages.classList.remove('tabpane','active');pages.classList.add('kura-pages-content');
 rail.appendChild(pages);shell.insertBefore(rail,editor);
 const alert=message=>{
  const el=document.getElementById('toast');
  if(el){el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
 };
 const expand=rail.querySelector('#kuraPagesExpand');
 expand.onclick=()=>{
  const active=rail.classList.toggle('expanded');
  expand.setAttribute('aria-expanded',String(active));
  expand.textContent=active?'✕':'☷'
 };
 rail.querySelector('#kuraRailAdd').onclick=()=>document.getElementById('addPage')?.click();
 const projects=document.getElementById('topJson');
 if(projects)projects.onclick=()=>{
  rail.classList.add('expanded');expand.setAttribute('aria-expanded','true');expand.textContent='✕';
  rail.querySelector('#kuraProjectSelect')?.scrollIntoView({behavior:'smooth',block:'nearest'})
 };
 const duplicate=document.getElementById('topDuplicateProject');
 if(duplicate)duplicate.onclick=()=>{
  rail.classList.add('expanded');expand.setAttribute('aria-expanded','true');expand.textContent='✕';
  const button=document.getElementById('kuraProjectDuplicate');
  if(button)button.click();else alert('Gestione progetti in caricamento')
 };
 // Dedicated element clipboard actions remain available even after switching projects.
 const controls=document.querySelector('#inspectControls');
 const copyRow=document.createElement('div');
 copyRow.className='kura-element-clipboard';
 copyRow.innerHTML='<button type="button" id="kuraCopyElement" class="btn flat small" title="Copia selezione nel buffer KURA">⧉ Copia elemento</button><button type="button" id="kuraPasteElement" class="btn flat small" title="Incolla nel progetto corrente">↳ Incolla elemento</button>';
 if(controls)controls.appendChild(copyRow);
 else document.querySelector('.inspector')?.prepend(copyRow);
 const app=()=>window.KURA_PROJECTS;
 const copy=async()=>{
  try{await app()?.copyElement?.()}catch(e){alert(e.message||'Seleziona un elemento')}
 };
 const paste=async()=>{
  try{await app()?.pasteElement?.()}catch(e){alert(e.message||'Nessun elemento copiato')}
 };
 copyRow.querySelector('#kuraCopyElement').onclick=copy;
 copyRow.querySelector('#kuraPasteElement').onclick=paste;
 // Paste is always visible even if nothing has been selected in the destination project.
 const toolbar=document.querySelector('.stage-head .compact-actions');
 const pasteTop=document.createElement('button');pasteTop.className='btn small flat';
 pasteTop.id='kuraPasteTop';pasteTop.type='button';pasteTop.textContent='↳ Incolla';
 pasteTop.title='Incolla un elemento copiato da un altro progetto';
 if(toolbar)toolbar.prepend(pasteTop);pasteTop.onclick=paste;
 document.addEventListener('keydown',e=>{
  if(!(e.ctrlKey||e.metaKey)||e.altKey)return;
  const tag=document.activeElement?.tagName;
  if(['INPUT','TEXTAREA','SELECT'].includes(tag)||document.activeElement?.isContentEditable)return;
  if(e.key.toLowerCase()==='c'){
   const selected=document.getElementById('inspectEmpty');
   if(selected?.classList.contains('hidden')){e.preventDefault();copy()}
  }else if(e.key.toLowerCase()==='v'){e.preventDefault();paste()}
 });
 // Dark theme changes the editor UI, never the 1080x1350 artwork or export.
 const themeKey='kura:appearance:theme';
 const themeButton=document.createElement('button');
 themeButton.id='kuraThemeToggle';themeButton.type='button';themeButton.className='btn ghost';
 themeButton.title='Passa dalla modalità chiara a quella scura verde KURA';
 themeButton.setAttribute('aria-label','Attiva o disattiva dark mode');
 const top=document.querySelector('.top-actions');
 if(top)top.appendChild(themeButton);
 let saved='light';
 try{saved=localStorage.getItem(themeKey)==='dark'?'dark':'light'}catch(_){}
 function applyTheme(mode){
  const dark=mode==='dark';
  document.documentElement.dataset.kuraTheme=dark?'dark':'light';
  themeButton.textContent=dark?'☀ Modalità chiara':'☾ Dark mode';
  themeButton.setAttribute('aria-pressed',String(dark));
 }
 applyTheme(saved);
 themeButton.onclick=()=>{
  const next=document.documentElement.dataset.kuraTheme==='dark'?'light':'dark';
  applyTheme(next);try{localStorage.setItem(themeKey,next)}catch(_){}
 };
})();

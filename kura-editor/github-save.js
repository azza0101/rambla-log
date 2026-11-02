/* KURA Editor 3.5 — private-in-tab GitHub authentication; public project JSON only.
   No GitHub token is embedded, persisted, logged or sent anywhere except api.github.com. */
'use strict';
(function(){
 const OWNER='azza0101',REPO='rambla-log',BRANCH='main';
 const FOLDER='kura-editor/projects/saved';
 const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
 let accessToken='',connectedUser='',busy=false;
 const bridge=()=>window.KURA_PROJECTS;
 const gid=id=>/^[a-zA-Z0-9_-]{3,100}$/.test(String(id||''));
 const escaped=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function toast(message){const el=document.querySelector('#toast');if(el){el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3200)}}
 function encodeBase64(text){
  const bytes=new TextEncoder().encode(text);
  let binary='';
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(binary)
 }
 function decodeBase64(text){
  const raw=atob(String(text||'').replace(/\s/g,''));
  return new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));
 }
 async function api(url,options={}){
  const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...options.headers};
  if(accessToken)headers.Authorization='Bearer '+accessToken;
  const result=await fetch(url.startsWith('http')?url:API+url,{cache:'no-store',...options,headers});
  if(result.status===404&&options.allowMissing)return null;
  let response=null;try{response=await result.json()}catch(_){}
  if(!result.ok){
   const base=(response?.message||result.statusText||'Errore API GitHub');
   if(result.status===401)throw Error('Token non valido: ricollega GitHub.');
   if(result.status===403)throw Error('Permessi insufficienti o limite API GitHub: '+base);
   if(result.status===409||result.status===422)throw Error('Conflitto di versione GitHub. Ricarica i progetti prima di riprovare.');
   throw Error(base+' ('+result.status+')')
  }
  return response
 }
 function status(message){const el=document.getElementById('kuraCloudStatus');if(el)el.textContent=message}
 function cloudLink(id){
  const u=new URL('./',location.href);
  u.search='';u.searchParams.set('cloud',id);
  return u.toString()
 }
 function updateLink(id){
  const a=document.getElementById('kuraCloudLink');
  if(!a)return;
  if(id&&gid(id)){a.href=cloudLink(id);a.textContent='Apri / condividi questa versione GitHub';a.hidden=false}
  else a.hidden=true
 }
 function filePath(id){if(!gid(id))throw Error('ID del progetto non valido');return FOLDER+'/'+id+'.json'}
 async function readCloud(id){
  const response=await api('/contents/'+filePath(id)+'?ref='+BRANCH,{allowMissing:true});
  if(!response)throw Error('Questo progetto non è ancora salvato su GitHub');
  if(response.encoding!=='base64'||!response.content)throw Error('Il progetto GitHub non è leggibile');
  return JSON.parse(decodeBase64(response.content))
 }
 async function loadRemote(id){
  if(!bridge())throw Error('Gestione progetti non disponibile');
  const data=await readCloud(id);
  const result=await bridge().openCloud(data);
  updateLink(data.projectId);
  toast(result.source==='local'?'Aperta la versione locale, con le tue modifiche':'Progetto GitHub importato nel browser');
  return result
 }
 async function saveToGitHub(){
  if(!accessToken)throw Error('Prima collega GitHub dal pulsante ☁ GitHub');
  const pkg=await bridge().saveLocal();
  const id=pkg.projectId;
  const path=filePath(id);
  const serialized=JSON.stringify({...pkg,githubSavedAt:new Date().toISOString()},null,2);
  if(new TextEncoder().encode(serialized).length>4_000_000)throw Error('Il progetto contiene immagini troppo grandi: esporta prima una copia JSON.');
  const current=await api('/contents/'+path+'?ref='+BRANCH,{allowMissing:true});
  const body={message:'KURA: salva '+String(pkg.projectName||id).slice(0,72),content:encodeBase64(serialized),branch:BRANCH};
  if(current?.sha)body.sha=current.sha;
  const saved=await api('/contents/'+path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!saved?.commit?.sha)throw Error('GitHub non ha confermato il salvataggio');
  status('✓ Salvato su GitHub · '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}));
  updateLink(id);
  return{projectId:id,commit:saved.commit.sha,link:cloudLink(id)}
 }
 async function normalSave(){
  if(busy)return;
  busy=true;const btn=document.getElementById('topSaveProject');if(btn)btn.disabled=true;
  try{
   await bridge().saveLocal();
   if(accessToken){const result=await saveToGitHub();toast('Salvato nel browser e su GitHub ✓');status('✓ Salvato anche su GitHub')}
   else{toast('Salvato nel browser ✓ Per il cloud: ☁ GitHub');status('✓ Salvato in questo browser (GitHub non collegato)')}
  }catch(error){toast('Salvataggio GitHub non riuscito: '+error.message);status(error.message)}
  finally{busy=false;if(btn)btn.disabled=false}
 }
 async function saveAs(){
  if(busy)return;
  const old=bridge().current();
  const name=prompt('Nome per la NUOVA versione (il progetto originale resterà invariato):',(old.name||'KURA')+' · versione 2');
  if(name===null)return;
  if(!String(name).trim()){toast('Inserisci un nome per la nuova versione');return}
  busy=true;try{
   const pkg=await bridge().saveAs(name);
   if(accessToken){await saveToGitHub();toast('Nuova versione creata e salvata su GitHub ✓')}
   else{toast('Nuova versione salvata nel browser ✓ Collega GitHub per pubblicarla')}
  }catch(error){toast('Salva con nome: '+error.message);status(error.message)}
  finally{busy=false}
 }
 function makeDialog(){
  const dlg=document.createElement('dialog');dlg.id='kuraGithubDialog';
  dlg.style.cssText='border:1px solid #d4c9ab;border-radius:18px;padding:22px;max-width:min(92vw,520px);width:100%;font:14px Montserrat,sans-serif;color:#173d2e;background:#fffaf0;box-shadow:0 18px 65px #0004';
  dlg.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong style="font-size:19px">☁ Progetti su GitHub</strong><button id="kuraCloudClose" class="btn small" type="button">Chiudi</button></div>'+
  '<p style="line-height:1.6;font-size:12px">Per salvare direttamente nel repository <strong>azza0101/rambla-log</strong>, inserisci un <strong>Fine-grained Personal Access Token</strong> con accesso <em>Contents: Read and write</em> a questo repository. Il token resta solo in memoria nella scheda e non viene salvato.</p>'+
  '<p style="font-size:12px"><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Crea il token su GitHub</a></p>'+
  '<div style="display:flex;gap:7px;flex-wrap:wrap"><input id="kuraGithubToken" aria-label="Token GitHub" type="password" autocomplete="off" placeholder="github_pat_…" style="flex:1;min-width:180px;border:1px solid #beb9a6;border-radius:8px;padding:10px"><button id="kuraGithubConnect" class="btn primary" type="button">Collega</button><button id="kuraGithubDisconnect" class="btn flat" type="button">Scollega</button></div>'+
  '<p id="kuraCloudStatus" role="status" style="min-height:22px;font-size:12px"></p>'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0"><button id="kuraCloudSave" type="button" class="btn primary">☁ Salva su GitHub</button><button id="kuraCloudRefresh" type="button" class="btn flat">↻ Mostra progetti GitHub</button></div>'+
  '<a id="kuraCloudLink" target="_blank" rel="noopener noreferrer" hidden style="font-size:12px;overflow-wrap:anywhere"></a>'+
  '<div id="kuraCloudProjects" style="margin-top:12px;max-height:220px;overflow:auto"></div>'+
  '<p style="font-size:11px;line-height:1.5;color:#755d46">Attenzione: il repository è pubblico. Anche i progetti caricati su GitHub saranno pubblici. Le modifiche locali non vengono pubblicate finché non premi Salva dopo aver collegato GitHub.</p>';
  document.body.appendChild(dlg);
  dlg.querySelector('#kuraCloudClose').onclick=()=>dlg.close();
  dlg.querySelector('#kuraGithubConnect').onclick=async()=>{
   const input=dlg.querySelector('#kuraGithubToken');const candidate=input.value.trim();
   if(!candidate){status('Inserisci un token GitHub');return}
   if(!/^(github_pat_|ghp_)/.test(candidate)){status('Usa un token personale GitHub valido');return}
   accessToken=candidate;input.value='';
   try{
    const me=await api('https://api.github.com/user');
    connectedUser=me.login||'account GitHub';
    status('✓ Collegato come '+connectedUser+' (valido solo in questa scheda)');
    await showCloudProjects();
   }catch(error){accessToken='';connectedUser='';status(error.message)}
  };
  dlg.querySelector('#kuraGithubDisconnect').onclick=()=>{accessToken='';connectedUser='';status('GitHub scollegato: il token non è stato conservato')};
  dlg.querySelector('#kuraCloudSave').onclick=async()=>{if(busy)return;busy=true;try{await saveToGitHub();toast('Progetto salvato su GitHub ✓');await showCloudProjects()}catch(error){status(error.message);toast(error.message)}finally{busy=false}};
  dlg.querySelector('#kuraCloudRefresh').onclick=()=>showCloudProjects().catch(error=>status(error.message));
  return dlg
 }
 async function showCloudProjects(){
  const root=document.querySelector('#kuraCloudProjects');if(!root)return;
  root.textContent='Caricamento…';
  let rows=await api('/contents/'+FOLDER+'?ref='+BRANCH,{allowMissing:true});
  if(!Array.isArray(rows)){root.textContent='Nessun progetto GitHub ancora salvato';return}
  root.textContent='';
  for(const item of rows.filter(x=>x.type==='file'&&/^[A-Za-z0-9_-]+\.json$/.test(x.name)).slice(0,100)){
   const id=item.name.slice(0,-5);
   const row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px;border-bottom:1px solid #ddd8cb';
   const title=document.createElement('span');title.textContent=id;title.style.cssText='font-size:11px;word-break:break-word';
   const open=document.createElement('button');open.className='btn small flat';open.textContent='Apri';
   open.onclick=async()=>{try{await loadRemote(id);status('Progetto '+id+' aperto')}catch(error){status(error.message)}};
   row.append(title,open);root.appendChild(row);
  }
 }
 async function openFromQuery(){
  const id=new URL(location.href).searchParams.get('cloud');
  if(!id)return;
  if(!gid(id)){toast('ID progetto GitHub non valido');return}
  try{await loadRemote(id)}catch(error){toast('Progetto GitHub: '+error.message)}
 }
 window.KURA_GITHUB=Object.freeze({openFromQuery,saveToGitHub,isConnected:()=>!!accessToken});
 const modal=makeDialog();
 const save=document.getElementById('topSaveProject');
 const saveAsButton=document.getElementById('topSaveAs');
 const cloudButton=document.getElementById('topGitHub');
 if(save){save.textContent='💾 Salva';save.title='Salva localmente, e su GitHub se collegato';save.onclick=normalSave}
 if(saveAsButton)saveAsButton.onclick=saveAs;
 if(cloudButton)cloudButton.onclick=()=>{if(typeof modal.showModal==='function')modal.showModal();else modal.setAttribute('open','');showCloudProjects().catch(e=>status(e.message))};
})();

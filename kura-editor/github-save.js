/* KURA Editor 3.5 — private-in-tab GitHub authentication; public project JSON only.
   No GitHub token is embedded, persisted, logged or sent anywhere except api.github.com. */
'use strict';
(function(){
 const OWNER='azza0101',REPO='rambla-log',BRANCH='main';
 const FOLDER='kura-editor/projects/saved';
 const API='https://api.github.com/repos/'+OWNER+'/'+REPO;
 let accessToken='',connectedUser='',busy=false;
 const cloudBases=new Map();let authDB=null,authReady=false;
 const bridge=()=>window.KURA_PROJECTS;
 const gid=id=>/^[a-zA-Z0-9_-]{3,100}$/.test(String(id||''));
 const escaped=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function toast(message){const el=document.querySelector('#toast');if(el){el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3200)}}
 // Persistent credentials encrypted with a non-exportable WebCrypto key in browser IndexedDB.
 // This protects stored token bytes, but not against malicious scripts on this origin.
 function authDatabase(){
  if(authDB)return Promise.resolve(authDB);
  return new Promise((resolve,reject)=>{
   const r=indexedDB.open('KURA_GITHUB_CREDENTIALS',1);
   r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv')};
   r.onerror=()=>reject(r.error);r.onsuccess=()=>{authDB=r.result;resolve(authDB)}
  })
 }
 async function authGet(key){
  const db=await authDatabase();return new Promise((resolve,reject)=>{
   const r=db.transaction('kv','readonly').objectStore('kv').get(key);
   r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)
  })
 }
 async function authPut(key,value){
  const db=await authDatabase();return new Promise((resolve,reject)=>{
   const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(value,key);
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)
  })
 }
 async function authClear(){
  const db=await authDatabase();return new Promise((resolve,reject)=>{
   const tx=db.transaction('kv','readwrite');tx.objectStore('kv').clear();
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)
  })
 }
 async function storeCredential(token){
  if(!crypto?.subtle)throw Error('Crittografia del browser non disponibile');
  const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=new TextEncoder().encode(token);
  const sealed=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data);
  await authPut('credential',{key,iv:Array.from(iv),cipher:Array.from(new Uint8Array(sealed)),username:connectedUser});
 }
 async function restoreCredential(){
  try{
   const obj=await authGet('credential');if(!obj)return;
   const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:Uint8Array.from(obj.iv)},obj.key,Uint8Array.from(obj.cipher));
   accessToken=new TextDecoder().decode(clear);
   const me=await api('https://api.github.com/user');
   connectedUser=me.login||obj.username||'GitHub';
   status('✓ GitHub collegato come '+connectedUser+' · accesso ricordato');
   updateCloudButton();
  }catch(err){accessToken='';connectedUser='';status('Ricollega GitHub: credenziali precedenti non disponibili');updateCloudButton()}
 }
 function updateCloudButton(){
  const btn=document.getElementById('topGitHub');
  if(btn)btn.textContent=accessToken?'☁ GitHub ✓':'☁ GitHub';
 }
 function baseKey(id){return 'kura:github:base:'+id}
 function getBase(id){
  if(cloudBases.has(id))return cloudBases.get(id);
  try{return sessionStorage.getItem(baseKey(id))||null}catch(_){return null}
 }
 function setBase(id,sha){cloudBases.set(id,sha);try{sessionStorage.setItem(baseKey(id),sha)}catch(_){}}
 // A remembered SHA alone is not enough: compare the exact local working state.
 // Baseline data survives a reload, but never contains the GitHub token.
 function projectPayload(pkg){
  return{pages:pkg?.pages||[],customAssets:pkg?.customAssets||{},meta:pkg?.meta||{},projectName:pkg?.projectName||''}
 }
 async function digest(pkg){
  const bytes=new TextEncoder().encode(JSON.stringify(projectPayload(pkg)));
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('')
 }
 async function baselineFor(id){
  try{return await authGet('shared-base:'+id)}catch(_){return null}
 }
 async function rememberBaseline(id,sha,project){
  setBase(id,sha);
  try{await authPut('shared-base:'+id,{sha,digest:await digest(project),updatedAt:Date.now()})}
  catch(error){console.warn('KURA baseline unavailable:',error.message)}
 }
 async function workingCopy(id){
  const current=bridge()?.current();
  if(current?.id===id)return await bridge().snapshot();
  return await bridge()?.localCopy(id)
 }
 async function isDirty(id){
  const base=await baselineFor(id);
  if(!base?.digest)return true;
  const local=await workingCopy(id);
  return !local||await digest(local)!==base.digest
 }
 function syncStatus(message,kind='info'){
  status(message);
  const el=document.getElementById('kuraSharedSyncStatus');
  if(el){el.textContent=message;el.dataset.kind=kind}
 }
 function ensureSyncStatus(){
  if(document.getElementById('kuraSharedSyncStatus'))return;
  const el=document.createElement('span');
  el.id='kuraSharedSyncStatus';el.className='kura-shared-sync-status';
  el.setAttribute('role','status');el.textContent='Cloud: non ancora sincronizzato';
  document.querySelector('.stage-head')?.appendChild(el)
 }
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
 async function readCloudVersion(id){
  const response=await api('/contents/'+filePath(id)+'?ref='+BRANCH,{allowMissing:true});
  if(!response)throw Error('Questo progetto non è ancora salvato su GitHub');
  if(response.encoding!=='base64'||!response.content)throw Error('Il progetto GitHub non è leggibile');
  return{data:JSON.parse(decodeBase64(response.content)),sha:response.sha}
 }
 async function readCloud(id){return(await readCloudVersion(id)).data}
 async function refreshFromCloud(id=bridge()?.current()?.id,interactive=true){
  if(!gid(id))throw Error('Seleziona un progetto condiviso valido');
  const cloud=await readCloudVersion(id);
  const baseline=await baselineFor(id);
  const local=await workingCopy(id);
  const localHash=local?await digest(local):null;
  const remoteHash=await digest(cloud.data);
  if(localHash===remoteHash){
   await rememberBaseline(id,cloud.sha,local);syncStatus('✓ Il progetto è già aggiornato','ok');
   return{updated:false,upToDate:true}
  }
  const dirty=!!local&&(!baseline?.digest||baseline.digest!==localHash);
  if(dirty){
   if(!interactive){
    syncStatus('● Aggiornamenti remoti disponibili, ma hai modifiche locali da salvare','warning');
    return{updated:false,dirty:true}
   }
   if(!confirm('La versione GitHub è diversa dalla tua. Prima di sostituirla KURA creerà un BACKUP locale del tuo lavoro. Continuare?'))return{updated:false,cancelled:true};
   const backup=await bridge().preserveDraft('Backup prima di aggiornare dal cloud');
   toast('Backup delle tue modifiche conservato in Progetti: '+backup.name);
  }else if(interactive&&!confirm('Caricare le ultime modifiche condivise da GitHub?'))return{updated:false,cancelled:true}
  await bridge().replaceFromCloud(cloud.data);
  await rememberBaseline(id,cloud.sha,await bridge().snapshot());
  if(toolbarSync)toolbarSync.style.outline='';
  updateLink(id);
  syncStatus('✓ Aggiornato dal cloud · '+new Date().toLocaleTimeString('it-IT'),'ok');
  if(interactive)toast('Modifiche del collaboratore caricate ✓');
  return{updated:true}
 }
 async function loadRemote(id){
  if(!bridge())throw Error('Gestione progetti non disponibile');
  const cloud=await readCloudVersion(id);
  const result=await bridge().openCloud(cloud.data);
  updateLink(cloud.data.projectId);
  if(result.source!=='local'){
   await rememberBaseline(id,cloud.sha,await bridge().snapshot());
   syncStatus('✓ Progetto condiviso aggiornato da GitHub','ok');
   toast('Progetto condiviso aperto ✓');
   return result
  }
  const local=await bridge().snapshot(),localHash=await digest(local);
  const remoteHash=await digest(cloud.data);
  const baseline=await baselineFor(id);
  if(localHash===remoteHash){
   await rememberBaseline(id,cloud.sha,local);
   syncStatus('✓ Versione locale e GitHub corrispondono','ok');
  }else if(baseline?.digest===localHash){
   // Local copy has not been changed. A newer collaborator revision may replace it safely.
   await bridge().replaceFromCloud(cloud.data);
   await rememberBaseline(id,cloud.sha,await bridge().snapshot());
   syncStatus('✓ Ultima versione condivisa caricata','ok');
  }else{
   // A reload must NEVER discard an un-published local draft.
   syncStatus('⚠ Modifiche locali conservate: confronta con Aggiorna dal cloud','warning');
   toast('Ho conservato la tua bozza locale. GitHub ha una versione diversa.');
  }
  return result
 }
 async function saveToGitHub(options={}){
  if(!accessToken)throw Error('GitHub non collegato. Collega il tuo account per pubblicare le modifiche.');
  const pkg=await bridge().saveLocal();
  const id=pkg.projectId,path=filePath(id);
  const current=await api('/contents/'+path+'?ref='+BRANCH,{allowMissing:true});
  const baseline=await baselineFor(id);
  const localHash=await digest(pkg);
  if(current){
   if(!baseline){
    const remote=await readCloudVersion(id);
    if(await digest(remote.data)===localHash){
     await rememberBaseline(id,remote.sha,pkg);
     syncStatus('✓ Già salvato su GitHub','ok');
     return{projectId:id,alreadySaved:true,link:cloudLink(id)}
    }
    syncStatus('⚠ Impossibile pubblicare: la versione locale non è ancora collegata alla revisione GitHub','warning');
    throw Error('Questa copia non ha una versione di partenza verificata. Ho conservato le modifiche locali. Usa «Aggiorna dal cloud» (con backup) oppure «Salva con nome».')
   }
   if(baseline.sha!==current.sha){
    syncStatus('⚠ Conflitto: un collaboratore ha salvato nuove modifiche. La tua bozza è al sicuro nel browser.','warning');
    throw Error('Un collaboratore ha salvato prima di te. NON ho sostituito le tue modifiche. Usa «Aggiorna dal cloud» oppure «Salva con nome».')
   }
   if(baseline.digest===localHash){
    syncStatus('✓ Nessuna modifica da pubblicare','ok');
    return{projectId:id,alreadySaved:true,link:cloudLink(id)}
   }
  }
  const serialized=JSON.stringify({...pkg,githubSavedAt:new Date().toISOString(),githubSavedBy:connectedUser||'Collaboratore'},null,2);
  if(new TextEncoder().encode(serialized).length>4_000_000)throw Error('Progetto troppo grande per il salvataggio diretto GitHub: esporta il JSON.');
  const data={message:'KURA: aggiorna '+String(pkg.projectName||id).slice(0,65),content:encodeBase64(serialized),branch:BRANCH};
  if(current?.sha)data.sha=current.sha;
  const saved=await api('/contents/'+path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  if(!saved?.commit?.sha||!saved.content?.sha)throw Error('GitHub non ha confermato la nuova revisione');
  await rememberBaseline(id,saved.content.sha,pkg);
  syncStatus('✓ Modifiche condivise · '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}),'ok');
  updateLink(id);
  if(!options.quiet)toast('Salvato su GitHub: l’altra persona può ora aggiornare ✓');
  return{projectId:id,commit:saved.commit.sha,link:cloudLink(id)}
 }
 async function normalSave(){
  if(busy)return;
  busy=true;
  const btn=document.getElementById('topSaveProject');if(btn)btn.disabled=true;
  try{
   await credentialReady;
   if(accessToken){
    const result=await saveToGitHub();
    if(result.alreadySaved)toast('Progetto già sincronizzato con GitHub ✓');
   }else{
    await bridge().saveLocal();
    syncStatus('⚠ Salvato soltanto sul tuo dispositivo. Collega GitHub per condividerlo.','warning');
    toast('Salvato LOCALMENTE: su GitHub non è stato pubblicato nulla.');
   }
  }catch(error){
   console.warn('KURA cloud save:',error.message);
   syncStatus('⚠ Salvataggio GitHub non completato. Le modifiche restano nel browser.','warning');
   toast('NON pubblicato su GitHub: '+error.message);
  }finally{busy=false;if(btn)btn.disabled=false}
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
  '<p style="line-height:1.6;font-size:12px">Per salvare direttamente nel repository <strong>azza0101/rambla-log</strong>, inserisci un <strong>Fine-grained Personal Access Token</strong> con accesso <em>Contents: Read and write</em> a questo repository. Il token viene cifrato e conservato esclusivamente nel browser di questo dispositivo (IndexedDB). Puoi scollegarlo e cancellarlo quando vuoi.</p>'+
  '<p style="font-size:12px"><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Crea il token su GitHub</a></p>'+
  '<div style="display:flex;gap:7px;flex-wrap:wrap"><input id="kuraGithubToken" aria-label="Token GitHub" type="password" autocomplete="off" placeholder="github_pat_…" style="flex:1;min-width:180px;border:1px solid #beb9a6;border-radius:8px;padding:10px"><button id="kuraGithubConnect" class="btn primary" type="button">Collega</button><button id="kuraGithubDisconnect" class="btn flat" type="button">Scollega</button></div>'+
  '<p id="kuraCloudStatus" role="status" style="min-height:22px;font-size:12px"></p>'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0"><button id="kuraCloudSave" type="button" class="btn primary">☁ Salva su GitHub</button><button id="kuraCloudSync" type="button" class="btn flat">↻ Aggiorna dal cloud</button><button id="kuraCloudRefresh" type="button" class="btn flat">Mostra progetti</button></div>'+
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
    await storeCredential(candidate);
    status('✓ Collegato come '+connectedUser+' (accesso memorizzato su questo dispositivo)');updateCloudButton();
    await showCloudProjects();
   }catch(error){accessToken='';connectedUser='';status(error.message)}
  };
  dlg.querySelector('#kuraGithubDisconnect').onclick=async()=>{accessToken='';connectedUser='';await authClear();updateCloudButton();status('GitHub scollegato: credenziali eliminate dal browser')};
  dlg.querySelector('#kuraCloudSave').onclick=async()=>{if(busy)return;busy=true;try{await saveToGitHub();toast('Progetto salvato su GitHub ✓');await showCloudProjects()}catch(error){status(error.message);toast(error.message)}finally{busy=false}};
  dlg.querySelector('#kuraCloudSync').onclick=()=>refreshFromCloud().catch(error=>status(error.message));
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
 window.KURA_GITHUB=Object.freeze({openFromQuery,saveToGitHub,refreshFromCloud,isConnected:()=>!!accessToken});
 const modal=makeDialog();
 ensureSyncStatus();
 const credentialReady=restoreCredential();
 const toolbarSync=document.getElementById('topCloudSync');
 if(toolbarSync)toolbarSync.onclick=async()=>{
   if(busy)return;
   busy=true;toolbarSync.disabled=true;
   try{await refreshFromCloud()}catch(err){toast('Aggiornamento cloud: '+err.message);status(err.message)}
   finally{busy=false;toolbarSync.disabled=false}
 };
 // Shared editing over GitHub: publish completed local edits after a brief idle
 // interval; check for remote versions. This is near-live, NOT per-keystroke realtime.
 let lastNotified='',autoPublishTimer=null,pollBusy=false;
 async function automaticPublish(id){
  if(busy||!accessToken||document.visibilityState==='hidden'||bridge()?.current()?.id!==id)return;
  const baseline=await baselineFor(id);
  if(!baseline?.sha||!await isDirty(id))return;
  busy=true;
  try{await saveToGitHub({quiet:true});syncStatus('✓ Modifiche pubblicate automaticamente su GitHub','ok')}
  catch(error){
   syncStatus('⚠ '+error.message,'warning');
   toast('Modifiche NON pubblicate: '+error.message)
  }finally{busy=false}
 }
 document.addEventListener('kura:local-saved',event=>{
  const id=event.detail?.projectId;
  if(!gid(id)||!accessToken)return;
  clearTimeout(autoPublishTimer);
  autoPublishTimer=setTimeout(()=>automaticPublish(id).catch(error=>console.warn('KURA auto save:',error.message)),9000)
 });
 function changedSummary(local,remote){
  const messages=[];
  for(let i=0;i<Math.max(local?.pages?.length||0,remote?.pages?.length||0);i++){
   const older=local?.pages?.[i],newer=remote?.pages?.[i];
   if(!newer){messages.push('Pagina eliminata');continue}
   if(!older){messages.push('Nuova pagina: '+(newer.name||i+1));continue}
   for(const [key,label] of [['head1','Titolo 1'],['body1','Testo 1'],['head2','Titolo 2'],['body2','Testo 2'],['base','Base'],['duration','Durata'],['highlight','Da non perdere'],['tips','Da sapere'],['note_title','Titolo post-it']]){
    if(older.fields?.[key]!==newer.fields?.[key])messages.push((newer.name||'Pagina '+(i+1))+' · '+label)
   }
   if(JSON.stringify(older.visuals)!==JSON.stringify(newer.visuals))messages.push((newer.name||'Pagina '+(i+1))+' · layout/immagini');
   if(JSON.stringify(older.textStyles)!==JSON.stringify(newer.textStyles))messages.push((newer.name||'Pagina '+(i+1))+' · stile testo');
  }
  return messages.slice(0,4).join('; ')+(messages.length>4?' e altre '+(messages.length-4):'')
 }
 async function pollSharedProject(){
  if(pollBusy||busy||document.visibilityState!=='visible'||!navigator.onLine)return;
  const id=bridge()?.current()?.id;
  if(!gid(id))return;
  const baseline=await baselineFor(id);
  if(!baseline?.sha)return;
  pollBusy=true;
  try{
   const metadata=await api('/contents/'+filePath(id)+'?ref='+BRANCH,{allowMissing:true});
   if(!metadata?.sha)return;
   if(metadata.sha===baseline.sha){
    lastNotified='';
    if(toolbarSync)toolbarSync.style.outline='';
    return
   }
   if(!await isDirty(id)){
    await refreshFromCloud(id,false);
    syncStatus('✓ Nuove modifiche del collaboratore caricate','ok');
    return
   }
   if(metadata.sha!==lastNotified){
    lastNotified=metadata.sha;
    const cloud=await readCloudVersion(id),local=await bridge().snapshot();
    const detail=changedSummary(local,cloud.data);
    syncStatus('● '+(cloud.data.githubSavedBy||'Collaboratore')+' ha aggiornato: '+(detail||'il progetto')+'. La tua bozza è conservata.','warning');
    toast('Novità sul progetto: '+(detail||'modifiche disponibili'));
    if(toolbarSync)toolbarSync.style.outline='2px solid #cf7931';
   }
  }catch(error){console.warn('KURA collaboration check:',error.message)}
  finally{pollBusy=false}
 }
 setInterval(()=>{pollSharedProject()},10000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pollSharedProject()});

 const save=document.getElementById('topSaveProject');
 const saveAsButton=document.getElementById('topSaveAs');
 const cloudButton=document.getElementById('topGitHub');
 if(save){save.textContent='💾 Salva';save.title='Salva localmente, e su GitHub se collegato';save.onclick=normalSave}
 if(saveAsButton)saveAsButton.onclick=saveAs;
 if(cloudButton)cloudButton.onclick=()=>{if(typeof modal.showModal==='function')modal.showModal();else modal.setAttribute('open','');showCloudProjects().catch(e=>status(e.message))};
})();

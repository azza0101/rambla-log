(function(){
'use strict';
const button=document.getElementById('topShareProject');
if(!button)return;
function notice(msg){const el=document.getElementById('toast');if(el){el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500)}}
button.onclick=async function(){
const id=window.KURA_PROJECTS?.current?.()?.id;
if(!/^[a-zA-Z0-9_-]{3,100}$/.test(id||'')){notice('Seleziona prima un progetto');return}
button.disabled=true;
try{
const endpoint='https://api.github.com/repos/azza0101/rambla-log/contents/kura-editor/projects/saved/'+encodeURIComponent(id)+'.json?ref=main';
const response=await fetch(endpoint,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
if(response.status===404){notice('Progetto non ancora salvato su GitHub. Premi Salva per pubblicarlo.');return}
if(!response.ok)throw Error('Verifica GitHub non disponibile ('+response.status+')');
const file=await response.json();
if(file.type!=='file'||!file.sha)throw Error('Progetto GitHub non valido');
const url=new URL('./',location.href);url.search='';url.hash='';url.searchParams.set('cloud',id);
try{await navigator.clipboard.writeText(url.href);notice('Link del progetto copiato ✓')}
catch(_){window.prompt('Copia il link del progetto:',url.href)}
}catch(error){notice('Condivisione: '+error.message)}
finally{button.disabled=false}
};
})();
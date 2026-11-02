/* KURA 3.7 — fast offline brief importer UI. No MCP/network calls during parsing. */
(function(){
 'use strict';
 const parser=window.KURA_BRIEF_PARSER,store=window.KURA_PROJECTS;
 const tab=document.querySelector('#tab-texts');
 if(!tab||!parser||!store?.createFromBrief)return;
 const section=document.createElement('section');
 section.className='kura-brief-import';
 section.setAttribute('aria-label','Motore MCP locale');
 section.innerHTML=[
  '<div class="kura-brief-head"><strong>⚡ Motore MCP locale</strong><span>senza chiamate AI</span></div>',
  '<p class="hint">Incolla qui il brief completo: ogni <b>DESTINAZIONE</b> diventa una pagina editabile. Montserrat, Caveat Brush, post-it e impaginazione provengono dal progetto corrente.</p>',
  '<label for="kuraBriefRaw" class="kura-brief-label">Brief completo</label>',
  '<textarea id="kuraBriefRaw" rows="9" placeholder="CAROSELLO KURA — NOVEMBRE 2026&#10;DESTINAZIONE 1 — SLOVENIA · VALLE DEL VIPACCO&#10;TITOLETTO 1: ...&#10;BODY1: ...&#10;TITOLETTO 2: ...&#10;BODY2: ...&#10;POST-IT:&#10;Base: ...&#10;Durata: ...&#10;Da non perdere: ...&#10;Da sapere: ..."></textarea>',
  '<label class="kura-brief-preserve"><input id="kuraBriefPreserve" type="checkbox" checked/><span><b>Copia la grafica del progetto corrente</b><small>Non modifica mai l’originale. Mantiene Giulia e il paesaggio soltanto nelle destinazioni corrispondenti.</small></span></label>',
  '<label class="kura-brief-preserve"><input id="kuraBriefCurrent" type="checkbox"/><span><b>Applica al progetto corrente</b><small>Altrimenti crea un progetto nuovo. Puoi duplicare prima dal pannello Progetti.</small></span></label>',
  '<div class="kura-brief-actions"><button class="btn flat" id="kuraBriefAnalyze" type="button">Analizza testo</button><button class="btn primary" id="kuraBriefGenerate" type="button" disabled>＋ Genera nuovo progetto</button></div>',
  '<button class="kura-brief-example" id="kuraBriefLoadExample" type="button">Carica l’esempio di novembre (3 pagine)</button>',
  '<div id="kuraBriefPreview" class="kura-brief-preview" role="status" aria-live="polite">Nessuna API esterna. Analisi locale istantanea, senza generazione di nuove immagini.</div>'
 ].join('');
 const hint=tab.querySelector('.hint');
 if(hint)hint.after(section);else tab.prepend(section);
 const raw=section.querySelector('#kuraBriefRaw'),
  result=section.querySelector('#kuraBriefPreview'),
  generate=section.querySelector('#kuraBriefGenerate'),
  analyze=section.querySelector('#kuraBriefAnalyze'),
  example=section.querySelector('#kuraBriefLoadExample'),
  preserve=section.querySelector('#kuraBriefPreserve'),applyCurrent=section.querySelector('#kuraBriefCurrent');
 let lastParsed=null,lastText='';
 const message=(text,isError=false)=>{result.textContent=text;result.classList.toggle('has-error',isError)};
 function evaluate(){
  let spec;try{spec=parser.parse(raw.value)}catch(error){
   lastParsed=null;generate.disabled=true;message(error.message,true);return null
  }
  lastParsed=spec;lastText=raw.value;generate.disabled=!spec.ok;
  result.textContent='';
  const title=document.createElement('strong');
  title.textContent=spec.ok?'✓ '+spec.count+' destinazioni riconosciute':'Controllo del brief: '+spec.errors.length+' problemi';
  result.appendChild(title);
  const listing=document.createElement('ol');
  for(const page of spec.pages){
   const li=document.createElement('li');li.textContent=page.name+' — '+page.fields.head1+' / '+page.fields.head2;
   listing.appendChild(li);
  }
  result.appendChild(listing);
  const lines=[...spec.errors,...spec.warnings];
  if(lines.length){
   const panel=document.createElement('p');panel.textContent=lines.join(' · ');result.appendChild(panel)
  }
  const footer=document.createElement('small');
  footer.textContent='I grassetti **...**, i post-it e le direttive [IMMAGINE]/[LAYOUT] sono riconosciuti. Le immagini non vengono generate automaticamente.';
  result.appendChild(footer);
  result.classList.toggle('has-error',!spec.ok);
  return spec;
 }
 analyze.onclick=evaluate;
 raw.addEventListener('input',()=>{lastParsed=null;generate.disabled=true;message('Brief modificato: premi «Analizza testo» per aggiornare l’anteprima.')});
 generate.onclick=async()=>{
  if(!lastParsed||raw.value!==lastText){if(!evaluate())return}
  if(!lastParsed?.ok)return;
  generate.disabled=true;
  const label=generate.textContent;generate.textContent='Creo il progetto…';
  try{
   const report=await store.createFromBrief(lastParsed,{useCurrentGraphics:preserve.checked,applyToCurrent:applyCurrent.checked});
   message((applyCurrent.checked?'✓ Progetto corrente aggiornato: ':'✓ Nuovo progetto creato: ')+report.pages+' pagine · '+report.projectName+
     (report.warnings.length?'\n'+report.warnings.join('\n'):'')+
     '\nSalvato automaticamente nel browser: lo trovi in Progetti. Per pubblicarlo usa «☁ GitHub».');
  }catch(error){message('Errore generazione: '+error.message,true)}
  finally{generate.textContent=label;generate.disabled=false}
 };
 example.onclick=async()=>{
  example.disabled=true;try{
   const res=await fetch('./tests/brief-novembre-v3.txt?v=3.7.0',{cache:'no-store'});
   if(!res.ok)throw Error('Esempio non disponibile ('+res.status+')');
   raw.value=await res.text();evaluate();
  }catch(error){message(error.message,true)}
  finally{example.disabled=false}
 };
 window.KURA_BRIEF_IMPORT=Object.freeze({analyze:()=>parser.parse(raw.value),setText(text){raw.value=String(text||'');return evaluate()}});
})();

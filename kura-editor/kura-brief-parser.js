/* KURA local editorial brief parser — no network, no MCP calls. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.KURA_BRIEF_PARSER=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const FIELD_RE=/^\s*(?:#{1,6}\s*)?(TITOLETTO\s*[12]|BODY\s*[12]|POST[\s-]*IT|TESTO|BASE|DURATA|DA\s+NON\s+PERDERE|DA\s+VIVERE|DA\s+PROVARE|DA\s+SAPERE|SOTTOTITOLO\s+INTERNO\s+DI\s+RIFERIMENTO(?:\s*\([^)]*\))?)\s*:\s*(.*)$/i;
  const HEADING_RE=/^\s*(?:#{1,6}\s*)?(?:\*\*)?\s*DESTINAZIONE\s+(\d{1,2})\s*[-—–:]\s*(.+?)(?:\*\*)?\s*$/gmi;
  const DIRECTIVE_RE=/\[\s*(IMMAGINE|LAYOUT|SFONDO)\s*:\s*([\s\S]*?)\s*\]/gi;
  function clean(s){return String(s||'').replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ').replace(/\\([*_[\]])/g,'$1').trim();}
  function plain(s){return clean(s).replace(/^\s*(?:#{1,6}\s*)?/,'').replace(/^\*{1,3}\s*|\s*\*{1,3}$/g,'').trim();}
  function keyOf(s){return clean(s).toLocaleUpperCase('it-IT').replace(/\s+/g,'').replace(/-/g,'');}
  function parseDestination(block,number,rawName){
    const metadata={};
    const directives={};let content=block.replace(DIRECTIVE_RE,(_,type,value)=>{directives[type.toLowerCase()]=clean(value);return '\n'});
    const lines=content.split('\n');
    let active=null;const fields={};
    let inPostit=false;
    for(const original of lines){
      const line=original.replace(/^\s*(?:[-•]\s+|\d+\.\s+)(?=(?:Base|Durata|Da\s))/i,'').trimEnd();
      const match=line.match(FIELD_RE);
      if(match){
        const label=keyOf(match[1]);
        if(label==='POSTIT'){inPostit=true;active=null;continue}
        if(label==='TESTO'){inPostit=false;active=null;continue}
        if(label==='SOTTOTITOLOINTERNO DIRIFERIMENTO'.replace(/\s/g,'')){metadata.referenceSubtitle=plain(match[2]);active=null;continue}
        const m={
          TITOLETTO1:'head1',TITOLETTO2:'head2',BODY1:'body1',BODY2:'body2',
          BASE:'base',DURATA:'duration',DANONPERDERE:'highlight',DAVIVERE:'highlight',
          DAPROVARE:'highlight',DASAPERE:'tips'
        };
        const key=m[label];
        if(key){
          if(key==='highlight')fields.label_highlight=label==='DAVIVERE'?'Da vivere':label==='DAPROVARE'?'Da provare':'Da non perdere';
          fields[key]=clean(match[2]);active=key;
          continue;
        }
      }
      if(active && line.trim() && !/^\s*(?:---+|- - -|POST-IT|DESTINAZIONE)\s*$/i.test(line)){
        fields[active]+='\n'+clean(line);
      }else if(active && !line.trim() && !inPostit && ['body1','body2'].includes(active)&&!fields[active].endsWith('\n\n')){
        fields[active]+='\n\n';
      }
    }
    for(const k of ['body1','body2','head1','head2','base','duration','highlight','tips']){
      if(fields[k])fields[k]=clean(fields[k]).replace(/\n{3,}/g,'\n\n');
    }
    const name=plain(rawName).replace(/\s+\|.*$/,'').replace(/\s*[—–]\s*$/,'');
    const tokens=name.split(/\s*[·,]\s*/).map(v=>v.trim()).filter(Boolean);
    let country='',place='';
    if(tokens.length>1){
      const countries=/^(SLOVENIA|SPAGNA|SUDAFRICA|ITALIA|CROAZIA|FRANCIA|PORTOGALLO|GIAPPONE|ALBANIA|ROMANIA|KENYA|ZAMBIA|AZERBAIGIAN|GRECIA|NORVEGIA|MONGOLIA|GERMANIA|PAESI BASSI|OLANDA)$/i;
      if(countries.test(tokens[0])){country=tokens[0];place=tokens.slice(1).join(' · ')}
      else if(countries.test(tokens[tokens.length-1])){country=tokens[tokens.length-1];place=tokens.slice(0,-1).join(' · ')}
      else {country=tokens[0];place=tokens.slice(1).join(' · ')}
    }else{place=name;country=name}
    return{number,name,country,place,fields,meta:{...metadata,...directives},brief:directives};
  }
  function parse(raw){
    if(typeof raw!=='string'||!raw.trim())throw Error('Incolla prima il brief completo.');
    if(raw.length>150000)throw Error('Brief troppo lungo (massimo 150.000 caratteri).');
    const txt=clean(raw);const matches=[...txt.matchAll(HEADING_RE)];
    if(!matches.length)throw Error('Nessuna DESTINAZIONE riconosciuta: usa «DESTINAZIONE 1 — LUOGO».');
    if(matches.length>50)throw Error('Massimo 50 destinazioni per carosello.');
    const intro=txt.slice(0,matches[0].index);
    const meta={};
    const head=intro.match(/(?:^|\n)\s*(?:#{1,6}\s*)?CAROSELLO\s+KURA\s*[-—–]\s*([^\n]+)/i);
    meta.title=head?'CAROSELLO KURA — '+plain(head[1]):'Carosello KURA';
    for(const [label,key] of [['TIPO','type'],['STILE','style'],['EDIZIONE TESTI','textEdition'],['VERSIONE','sourceVersion']]){
      const match=intro.match(new RegExp('(?:^|\\n)\\s*'+label+'\\s*:\\s*([^\\n]+)','i'));
      if(match)meta[key]=plain(match[1]);
    }
    const pre=intro.match(/PRESET\s+GRAFICO\s+CANONICO[^\n]*\n([\s\S]*)/i);
    if(pre)meta.canonicalPreset=clean(pre[1]);
    const pages=matches.map((m,i)=>{
      const start=m.index+m[0].length;const end=i+1<matches.length?matches[i+1].index:txt.length;
      return parseDestination(txt.slice(start,end),i+1,m[2]);
    });
    const errors=[];
    const required=['head1','body1','head2','body2','base','duration','highlight','tips'];
    pages.forEach((p,i)=>{
      for(const key of required)if(!p.fields[key])errors.push('Destinazione '+(i+1)+' ('+p.name+'): manca '+key);
    });
    const declared=intro.match(/PAGINE\s+INFORMATIVE\s*\(\s*(\d+)\s*\)/i);
    const warnings=[];
    if(declared&&+declared[1]!==pages.length)warnings.push('Il brief dichiara '+declared[1]+' pagine ma contiene '+pages.length+' destinazioni: userò quelle trovate.');
    if(pages.some(p=>!p.meta.immagine))warnings.push('Alcune destinazioni non hanno direttiva IMMAGINE: puoi aggiungerla in seguito.');
    return{ok:errors.length===0,meta,pages,errors,warnings,count:pages.length};
  }
  return Object.freeze({parse,version:'1.0.0'});
});

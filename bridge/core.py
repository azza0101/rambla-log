"""RAMBLA Log Bridge — parse RAMBLA EDL/JSON and map to Resolve frame offsets."""
import hashlib, json, re
from dataclasses import dataclass
from pathlib import Path
COLORS={c.lower():c for c in ('Green','Yellow','Purple','Pink','Red','Blue','Cyan','Orange','White')}
NOMINAL={'23.976':24,'24':24,'25':25,'29.97':30,'30':30,'50':50,'59.94':60,'60':60}
TC=re.compile(r'^([0-2]\d):([0-5]\d):([0-5]\d)([:;])([0-5]\d)$')
ENTRY=re.compile(r'^\s*\d{3,4}\s+\S+\s+[VA]\s+\S+\s+(\d\d:\d\d:\d\d[:;]\d\d)\s+(\d\d:\d\d:\d\d[:;]\d\d)\s+(\d\d:\d\d:\d\d[:;]\d\d)\s+(\d\d:\d\d:\d\d[:;]\d\d)\s*$')
META=re.compile(r'\|C:ResolveColor([A-Za-z]+)\s+\|M:(.*?)\s+\|D:(\d+)')
@dataclass(frozen=True)
class Marker:
    tc:str
    name:str
    note:str
    color:str
    duration:int
    uid:str
@dataclass
class Session:
    title:str
    markers:list
    fps:str
    source:str
def rate(x):
    s=str(x).strip()
    if s in NOMINAL:return s
    for k in NOMINAL:
        try:
            if abs(float(k)-float(s))<.015:return k
        except (ValueError,TypeError):pass
    raise ValueError('FPS non supportati: '+s)
def frames(tc,fps):
    m=TC.fullmatch(tc.strip())
    if not m:raise ValueError('Timecode invalido: '+tc)
    h,mi,s,sep,f=m.groups();h,mi,s,f=map(int,(h,mi,s,f))
    n=NOMINAL[rate(fps)]
    if h>23 or f>=n:raise ValueError('Timecode fuori range')
    if sep==';' and rate(fps) not in ('29.97','59.94'):raise ValueError('Drop frame non valido')
    drop=n//15 if sep==';' else 0
    if drop and mi%10 and s==0 and f<drop:raise ValueError('Label drop-frame inesistente')
    count=((h*3600+mi*60+s)*n+f)
    if drop:count-=drop*((h*60+mi)-(h*60+mi)//10)
    return count
def marker_id(*fields):
    return hashlib.sha256('\0'.join(map(str,fields)).encode()).hexdigest()[:20]
def parse_edl(text,name):
    if len(text)>6_000_000:raise ValueError('EDL troppo grande')
    title=next((l[6:].strip() for l in text.splitlines() if l.upper().startswith('TITLE:')),Path(name).stem)
    drop='FCM: DROP FRAME' in text.upper()
    rows=[];current=None;notes=[]
    def flush():
        if current is None:return
        tc=current[2]
        if drop:tc=tc[:8]+';'+tc[9:]
        annotation='\n'.join(notes);match=META.search(annotation)
        color=COLORS.get(match[1].lower(),'Blue') if match else 'Blue'
        label=(match[2].strip() or 'Marker') if match else 'Marker'
        duration=max(1,int(match[3])) if match else 1
        note=META.sub('',annotation).strip()
        note=re.sub(r'^\[[^]]+\]\s*','',note).strip()
        if note.startswith('Nota: '):note=note[6:]
        rows.append(Marker(tc,label,note,color,duration,marker_id(name,tc,label,note)))
    for line in text.splitlines():
        hit=ENTRY.fullmatch(line)
        if hit:
            flush();current=hit.groups();notes=[]
        elif current and line.strip():notes.append(line.strip())
    flush()
    if not rows:raise ValueError('Nessun marker nel file EDL')
    return Session(title,rows,'',name)
def parse_json(text,name):
    if len(text)>6_000_000:raise ValueError('JSON troppo grande')
    data=json.loads(text)
    items=data.get('sessions') if isinstance(data,dict) else None
    if items is None and isinstance(data,dict) and 'markers' in data:items=[data]
    if not isinstance(items,list) or len(items)>300:raise ValueError('Backup non valido')
    sessions=[]
    for it in items:
        fps=rate(it.get('fps','25'));base=it.get('startTC','01:00:00:00')
        start=frames(base,fps);anchors=[]
        for a in it.get('tcAnchors') or []:
            if not isinstance(a,dict):continue
            v=a.get('timecode')
            if v is not None:anchors.append((float(a.get('at',0)),frames(v,fps)))
            elif a.get('frames') is not None:anchors.append((float(a.get('at',0)),int(a['frames'])))
        anchors.sort()
        rows=[]
        for m in it.get('markers',[])[:5000]:
            second=float(m.get('start',0))
            if second<0:continue
            target=start+round(second*float(fps))
            for at,fr in anchors:
                if at<=second:target=fr+round((second-at)*float(fps))
                else:break
            nominal=NOMINAL[fps];target%=86400*nominal
            hour,rem=divmod(target,nominal*3600)
            minute,rem=divmod(rem,nominal*60)
            sec,fr=divmod(rem,nominal)
            tc=f'{hour:02}:{minute:02}:{sec:02}:{fr:02}'
            label=str(m.get('name','Marker'))[:200];note=str(m.get('note',''))[:12000]
            rows.append(Marker(tc,label,note,COLORS.get(str(m.get('color','Blue')).lower(),'Blue'),max(1,round((float(m.get('end',second))-second)*float(fps))),str(m.get('id') or marker_id(name,tc,label,note))))
        sessions.append(Session(str(it.get('title',Path(name).stem)),rows,fps,name))
    return sessions
def parse(text,name):
    return [parse_edl(text,name)] if name.lower().endswith('.edl') else parse_json(text,name)
def plan(session,timeline):
    fps=rate(timeline.GetSetting('timelineFrameRate'))
    if session.fps and rate(session.fps)!=fps:raise ValueError(f'FPS differenti: sessione {session.fps}, timeline {fps}')
    origin=frames(timeline.GetStartTimecode(),fps)
    taken={int(round(float(k))) for k in (timeline.GetMarkers() or {})}
    chosen=[];warnings=[]
    for m in session.markers:
        pos=frames(m.tc,fps)-origin
        if pos<0:warnings.append(m.tc+' prima della timeline');continue
        if pos in taken:warnings.append(m.tc+' già presente');continue
        taken.add(pos);chosen.append((pos,m))
    return chosen,warnings
def apply(timeline,chosen):
    added=0;errors=[]
    for pos,m in chosen:
        if pos in {int(round(float(k))) for k in (timeline.GetMarkers() or {})}:
            errors.append(m.tc+' già presente');continue
        try:
            if timeline.AddMarker(pos,m.color,m.name,m.note,max(1,round(float(rate(timeline.GetSetting('timelineFrameRate'))))),'rambla:'+m.uid):added+=1
            else:errors.append(m.tc+' rifiutato da Resolve')
        except Exception as e:errors.append(m.tc+': '+str(e))
    return added,errors

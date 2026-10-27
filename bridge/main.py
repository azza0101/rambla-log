"""RAMBLA Log Bridge: Windows GUI and DaVinci Resolve Studio marker import."""
import json,os,shutil,subprocess,sys,threading,tkinter as tk,urllib.request,webbrowser
from pathlib import Path
from tkinter import ttk,filedialog,messagebox
from core import parse,plan,apply
from updater import fetch_release,is_newer,download_update,activate_and_launch,current_executable,write_pointer,INSTALL_DIR,VERSIONS
VERSION='0.2.1'
REPO='azza0101/rambla-log'
API='https://api.github.com/repos/'+REPO
BG='#0a0a0a';PANEL='#161616';FG='#f7f7f7';MUTED='#b0b0b0';TEAL='#2dd4bf'
def get_json(url):
    req=urllib.request.Request(url,headers={'User-Agent':'RAMBLA-Log-Bridge/'+VERSION})
    with urllib.request.urlopen(req,timeout=12) as r:return json.loads(r.read(1000000))
def get_text(url):
    req=urllib.request.Request(url,headers={'User-Agent':'RAMBLA-Log-Bridge/'+VERSION})
    with urllib.request.urlopen(req,timeout=15) as r:
        text=r.read(6000001)
    if len(text)>6000000:raise ValueError('File troppo grande')
    return text.decode('utf-8-sig')
def remote():
    files=get_json(API+'/contents/sessions?ref=main')
    return [(x['name'],x['download_url'],'remote') for x in files if x['type']=='file' and x['name'].lower().endswith(('.edl','.json')) and x.get('size',0)<6000000]
def read_source(item):
    name,location,kind=item
    content=get_text(location) if kind=='remote' else Path(location).read_text(encoding='utf-8-sig')
    return parse(content,name)
def connect():
    folder=Path(os.environ.get('PROGRAMDATA','C:/ProgramData'))/'Blackmagic Design'/'DaVinci Resolve'/'Support'/'Developer'/'Scripting'/'Modules'
    if folder.exists() and str(folder) not in sys.path:sys.path.insert(0,str(folder))
    try:import DaVinciResolveScript as dvr
    except ImportError as e:raise RuntimeError('Modulo Resolve non trovato: Help → Documentation → Developer → Scripting') from e
    r=dvr.scriptapp('Resolve')
    if not r:raise RuntimeError('Connessione esterna non disponibile. Richiede Resolve Studio, External scripting: Local.')
    p=r.GetProjectManager().GetCurrentProject()
    if not p:raise RuntimeError('Apri un progetto Resolve')
    t=p.GetCurrentTimeline()
    if not t:raise RuntimeError('Apri una timeline Resolve')
    return p,t
def install_menu():
    if not getattr(sys,'frozen',False):
        raise RuntimeError('Per installare, usa il file .exe della Release.')
    local=INSTALL_DIR
    local.mkdir(parents=True,exist_ok=True)
    VERSIONS.mkdir(parents=True,exist_ok=True)
    exe=VERSIONS/('RAMBLA-Log-Bridge-'+VERSION+'.exe')
    if Path(sys.executable).resolve()!=exe.resolve():
        shutil.copy2(sys.executable,exe)
    write_pointer(exe.name)
    root=Path(os.environ.get('PROGRAMDATA','C:/ProgramData'))/'Blackmagic Design'/'DaVinci Resolve'/'Support'/'Workflow Integration Plugins'
    root.mkdir(parents=True,exist_ok=True)
    launcher=root/'rambla_log_bridge.py'
    # Stable launcher follows current.txt; future updates only change the user-owned pointer.
    launcher.write_text("""import os,re,subprocess
from pathlib import Path
base=Path(os.environ.get('LOCALAPPDATA',str(Path.home())))/'RAMBLA Log Bridge'
exe=None
try:
    name=(base/'current.txt').read_text(encoding='utf-8').strip()
    if re.fullmatch(r'RAMBLA-Log-Bridge-\\d+\\.\\d+\\.\\d+\\.exe',name):
        candidate=base/'versions'/name
        if candidate.is_file():exe=candidate
except (FileNotFoundError,OSError):
    pass
if exe is None:exe=base/'RAMBLA Log Bridge.exe'
if exe.is_file():subprocess.Popen([str(exe)],close_fds=True)
""",encoding='utf-8')
    return launcher
class Bridge:
 def __init__(self,root):
    self.root=root;root.title('RAMBLA LOG · Resolve Bridge');root.geometry('940x660');root.minsize(740,520);root.configure(bg=BG)
    self.source=tk.StringVar(value='GitHub');self.status=tk.StringVar(value='');self.name=tk.StringVar(value='Seleziona sessione')
    self.items=[];self.session=None;self.timeline=None;self.folder=str(Path.home()/'Downloads')
    self.ui();self.refresh()
 def label(self,parent,text,size=10,color=FG,bold=False):
    return tk.Label(parent,text=text,bg=parent['bg'],fg=color,font=('Segoe UI',size,'bold' if bold else 'normal'))
 def button(self,parent,text,action,color=PANEL,fg=FG):
    b=tk.Button(parent,text=text,command=action,bg=color,fg=fg,activebackground=TEAL,activeforeground=BG,relief='flat',borderwidth=0,padx=14,pady=10,font=('Segoe UI',10,'bold'))
    b.pack(side='left',padx=(0,8));return b
 def ui(self):
    top=tk.Frame(self.root,bg=BG,padx=22,pady=15);top.pack(fill='x')
    self.label(top,'RAMBLA',20,TEAL,True).pack(side='left');self.label(top,'  LOG BRIDGE',14,FG,True).pack(side='left')
    self.label(top,'  v'+VERSION,9,MUTED).pack(side='left')
    self.update_button=self.button(top,'↻ Aggiorna',self.update,'#292929')
    self.update_button.pack_configure(side='right')
    bar=tk.Frame(self.root,bg=PANEL,padx=20,pady=14);bar.pack(fill='x')
    for mode in ('GitHub','Cartella'):
       tk.Radiobutton(bar,text=mode,value=mode,variable=self.source,command=self.refresh,bg=PANEL,fg=FG,selectcolor='#353535',activebackground=PANEL,font=('Segoe UI',10)).pack(side='left',padx=(0,10))
    self.button(bar,'Scegli cartella',self.choose_folder)
    self.button(bar,'↻ Rileggi',self.refresh,TEAL,BG)
    self.label(bar,'GitHub: '+REPO+'/sessions',9,MUTED).pack(side='right')
    panes=tk.PanedWindow(self.root,orient='horizontal',bg=BG,sashwidth=6,bd=0);panes.pack(fill='both',expand=True,padx=16,pady=(14,0))
    left=tk.Frame(panes,bg=PANEL,padx=12,pady=12);panes.add(left,width=310)
    self.label(left,'SESSIONI',11,FG,True).pack(anchor='w',pady=(0,12))
    self.files=tk.Listbox(left,bg='#222222',fg=FG,selectbackground='#21675A',exportselection=False,relief='flat',bd=0,font=('Segoe UI',11))
    self.files.pack(fill='both',expand=True);self.files.bind('<<ListboxSelect>>',self.on_selection)
    right=tk.Frame(panes,bg=PANEL,padx=12,pady=12);panes.add(right)
    self.label(right,'ANTEPRIMA MARKER',10,TEAL,True).pack(anchor='w')
    tk.Label(right,textvariable=self.name,bg=PANEL,fg=FG,font=('Segoe UI',14,'bold'),anchor='w').pack(fill='x',pady=(6,12))
    style=ttk.Style();style.theme_use('clam')
    style.configure('R.Treeview',background='#222222',foreground=FG,fieldbackground='#222222',rowheight=30,font=('Segoe UI',10))
    style.configure('R.Treeview.Heading',background='#303030',foreground=FG,relief='flat',font=('Segoe UI',10,'bold'))
    style.map('R.Treeview',background=[('selected','#21675A')])
    self.table=ttk.Treeview(right,columns=('tc','type','note'),show='headings',style='R.Treeview')
    for col,title,width in [('tc','TIMECODE',120),('type','TIPO',110),('note','NOTA',320)]:
      self.table.heading(col,text=title);self.table.column(col,width=width,stretch=col=='note')
    self.table.pack(fill='both',expand=True)
    bottom=tk.Frame(self.root,bg=BG,padx=20,pady=14);bottom.pack(fill='x')
    commands=tk.Frame(bottom,bg=BG);commands.pack(fill='x')
    self.button(commands,'Connetti Resolve',self.connect_resolve,'#303030')
    self.button(commands,'APPLICA ALLA TIMELINE',self.import_markers,TEAL,BG)
    self.button(commands,'Installa in Workflow Integrations',self.install,'#303030')
    progress=tk.Frame(bottom,bg=BG)
    progress.pack(fill='x',pady=(12,0))
    self.progress_label=tk.StringVar(value='')
    tk.Label(progress,textvariable=self.progress_label,bg=BG,fg=TEAL,anchor='w',font=('Segoe UI',10,'bold')).pack(fill='x')
    self.progress=tk.DoubleVar(value=0)
    style.configure('R.Horizontal.TProgressbar',troughcolor='#282828',background=TEAL,borderwidth=0,thickness=9)
    self.progressbar=ttk.Progressbar(progress,orient='horizontal',mode='determinate',maximum=100,variable=self.progress,style='R.Horizontal.TProgressbar')
    self.progressbar.pack(fill='x',pady=(5,0))
    self.progressbar['value']=0
    tk.Label(bottom,textvariable=self.status,bg=BG,fg=MUTED,anchor='w',font=('Segoe UI',10)).pack(fill='x',pady=(9,0))
 def worker(self,fn,cb):
    self.status.set('Operazione in corso…')
    def run():
      try:value=(True,fn())
      except Exception as e:value=(False,str(e))
      self.root.after(0,lambda:cb(*value))
    threading.Thread(target=run,daemon=True).start()
 def refresh(self):
    self.items=[];self.session=None;self.files.delete(0,'end');self.table.delete(*self.table.get_children());self.name.set('Seleziona sessione')
    kind=self.source.get();folder=self.folder
    self.worker(lambda:remote() if kind=='GitHub' else [(p.name,str(p),'local') for p in Path(folder).glob('*') if p.suffix.lower() in ('.edl','.json') and p.stat().st_size<6000000],self.refreshed)
 def refreshed(self,ok,result):
    if not ok:self.status.set('Errore sorgente: '+result);return
    self.items=result
    for it in result:self.files.insert('end',it[0])
    self.status.set(f'{len(result)} file disponibili')
    if result:self.files.selection_set(0);self.on_selection()
 def choose_folder(self):
    folder=filedialog.askdirectory(initialdir=self.folder)
    if folder:self.folder=folder;self.source.set('Cartella');self.refresh()
 def on_selection(self,event=None):
    items=self.files.curselection()
    if items:self.worker(lambda:read_source(self.items[items[0]]),self.loaded)
 def loaded(self,ok,result):
    if not ok:self.status.set('Errore file: '+result);return
    self.session=next((s for s in result if s.markers),None)
    if not self.session:self.status.set('Backup senza marker');return
    self.name.set(self.session.title);self.table.delete(*self.table.get_children())
    for m in self.session.markers:self.table.insert('','end',values=(m.tc,m.name,m.note.replace('\n',' ')[:180]))
    self.status.set(f'{len(self.session.markers)} marker pronti; Resolve non è stato modificato.')
 def connect_resolve(self):self.worker(connect,self.connected)
 def connected(self,ok,result):
    if not ok:self.timeline=None;self.status.set('Resolve: '+result);return
    project,self.timeline=result;self.status.set('Connesso: '+project.GetName()+' / '+self.timeline.GetName())
 def import_markers(self):
    if not self.timeline or not self.session:messagebox.showinfo('RAMBLA','Prima scegli una sessione e connetti Resolve');return
    try:chosen,warnings=plan(self.session,self.timeline)
    except Exception as e:messagebox.showerror('Timecode / FPS',str(e));return
    if not chosen:messagebox.showinfo('RAMBLA','Nessun marker nuovo da importare');return
    if not messagebox.askyesno('Conferma',f'Timeline: {self.timeline.GetName()}\nSessione: {self.session.title}\nMarker nuovi: {len(chosen)}\nSaltati: {len(warnings)}\n\nProcedo?'):return
    total,errs=apply(self.timeline,chosen)
    self.status.set(f'Inseriti {total} marker. Avvisi: {len(warnings)+len(errs)}')
    messagebox.showinfo('RAMBLA',f'Inseriti {total} marker. Avvisi: {len(warnings)+len(errs)}')
 def install(self):
    if not messagebox.askyesno('Workflow Integration','Creo un collegamento in Workspace → Workflow Integrations. Potrebbero servire i permessi amministratore. Continuare?'):return
    try:path=install_menu();messagebox.showinfo('Installazione','Installato in '+str(path)+'\nRiavvia Resolve.')
    except Exception as e:messagebox.showerror('Installazione',str(e))
 def set_update_progress(self,step,percent=None):
    self.progress_label.set(step)
    if percent is not None:self.progress.set(max(0,min(100,percent)))
    self.status.set(step)
 def update(self):
    if getattr(self,'updating',False):return
    self.updating=True;self.update_button.config(state='disabled')
    self.set_update_progress('1/4 · Controllo la versione su GitHub…',3)
    self.worker(fetch_release,self.checked_update)
 def checked_update(self,ok,result):
    if not ok:
        self.set_update_progress('Errore di connessione: '+result,0)
        self.updating=False;self.update_button.config(state='normal');return
    self.release=result
    if not is_newer(result,VERSION):
        self.set_update_progress('Hai già l’ultima versione: v'+VERSION,100)
        self.updating=False;self.update_button.config(state='normal');return
    self.set_update_progress('Nuova versione '+result['version']+' disponibile',5)
    if not messagebox.askyesno('Aggiorna RAMBLA Log Bridge','Aggiornamento da v'+VERSION+' a v'+result['version']+'\n\nScarico da GitHub, verifico SHA-256 e riavvio automaticamente. Continuare?'):
        self.set_update_progress('Aggiornamento annullato.',0)
        self.updating=False;self.update_button.config(state='normal');return
    self.set_update_progress('2/4 · Preparo il download…',7)
    def do_download():
        return download_update(result,lambda step,percent:self.root.after(0,lambda step=step,percent=percent:self.set_update_progress('2/4 · '+step,percent)))
    self.worker(do_download,self.download_completed)
 def download_completed(self,ok,result):
    if not ok:
        self.set_update_progress('Download non riuscito: '+result,0)
        self.updating=False;self.update_button.config(state='normal');return
    self.set_update_progress('3/4 · Verifica completata · preparo il riavvio…',96)
    if not getattr(sys,'frozen',False):
        self.set_update_progress('Versione verificata. Installa un EXE per completare il riavvio.',96)
        self.updating=False;self.update_button.config(state='normal');return
    try:
        activate_and_launch(result)
        self.set_update_progress('4/4 · Nuova versione avviata. Chiudo quella precedente.',100)
        self.root.after(350,self.root.destroy)
    except Exception as error:
        self.set_update_progress('Riavvio non riuscito: '+str(error),95)
        self.updating=False;self.update_button.config(state='normal')
if __name__=='__main__':
    root=tk.Tk();Bridge(root);root.mainloop()

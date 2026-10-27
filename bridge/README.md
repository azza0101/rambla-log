# RAMBLA Log Bridge — Windows

## Bridge v0.2.0 — Aggiornamento integrato
Il pulsante **↻ Aggiorna** ora mostra una barra di avanzamento con le fasi **controllo versione, download con percentuale, verifica SHA-256, riavvio**. Scarica soltanto i file delle GitHub Releases di `azza0101/rambla-log`, confronta la checksum prima di consentire l'installazione e mette il nuovo EXE in una cartella versionata sotto `%LOCALAPPDATA%\RAMBLA Log Bridge\versions`. Poi avvia il nuovo programma e chiude il precedente. Il file precedente resta intatto in caso di download errato o errore di lancio.

**Passaggio iniziale dalla v0.1.0:** il vecchio pulsante Aggiorna era soltanto un collegamento alla Release, quindi scarica **una sola volta** `bridge-v0.2.0` e avvia il suo EXE. Nella nuova app premi **Installa in Workflow Integrations**, quindi riavvia Resolve, per aggiornare il launcher del menu. Dal prossimo rilascio la v0.2.0 scaricherà e aprirà autonomamente le nuove versioni, senza reinstallare manualmente. L'installazione del launcher in ProgramData può richiedere privilegi amministrativi.

La build non è firmata con un certificato di code signing commerciale: Windows SmartScreen potrebbe chiedere conferma. Controlla la provenienza e non ignorare avvisi inattesi. Il nuovo sistema verifica SHA-256 per proteggere da download incompleti/manomessi, ma non sostituisce una firma digitale dell'editore.


**EXE:** https://github.com/azza0101/rambla-log/releases/tag/bridge-v0.1.0

GUI separata in dark mode, apribile dal desktop o dal menu di Resolve Studio con il launcher installato.

## Prima prova
1. Scarica l'EXE dalla Release ed eseguilo su Windows. Può comparire un avviso SmartScreen perché il prototipo non è firmato.
2. In Resolve **Studio**, apri una timeline **25 FPS** con timecode iniziale **01:00:00:00**.
3. Nel Bridge scegli **GitHub**: vedrai `sessions/DEMO-RAMBLA.edl`, con tre marker fittizi.
4. Premi **Connetti Resolve**, poi **APPLICA ALLA TIMELINE** e conferma.
5. Il programma evita di sovrascrivere marker già presenti allo stesso fotogramma.

## Workflow Integrations
Premi **Installa in Workflow Integrations** nel Bridge. Il programma crea un launcher in `%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins\rambla_log_bridge.py` e copia l'EXE in `%LOCALAPPDATA%\RAMBLA Log Bridge\`. Su alcuni PC sono richiesti diritti amministrativi. Riavvia Resolve per far apparire il comando nel menu `Workspace → Workflow Integrations`.

**Nota:** per connessione a Resolve da una finestra Windows esterna, usa **DaVinci Resolve Studio** e imposta `Preferences → System → General → External scripting using: Local` dove disponibile. Non è stato collaudato sul tuo PC.

## Cartelle fonte
- **GitHub**: legge file pubblici `.edl`/`.json` sotto `https://github.com/azza0101/rambla-log/tree/main/sessions`. Non richiede token.
- **Cartella**: legge i file esportati dall'iPhone già salvati sul PC (per esempio tramite iCloud Drive).

La web app iPhone è statica: **non carica automaticamente i dati su GitHub**. Per provarla con le tue sessioni, esporta il file `.edl` oppure il backup `.json` da RAMBLA Log, quindi usa GitHub `Add file → Upload files` dentro `sessions/`. **Il repository è pubblico**: non caricare nomi o appunti di riprese riservate. Per produzioni reali usa Cartella o passa in seguito a uno scambio autenticato e privato.

## Aggiornamenti
Dalla v0.2.0 il pulsante **↻ Aggiorna** scarica, verifica e riavvia automaticamente l'EXE. Il passaggio dalla precedente v0.1.0 richiede un aggiornamento manuale una volta sola. I build successivi sono generati da `.github/workflows/bridge-windows.yml` su Windows, con un SHA256 pubblicato.

## Limiti
I marker vengono posizionati sul timecode della timeline attiva, non automaticamente sui singoli file video. Verifica che sorgente e timeline condividano FPS e riferimento timecode. Il Bridge usa i metodi `GetStartTimecode()`, `GetMarkers()` e `AddMarker()` dell'API di Resolve. Le note e i colori sono riportati nei marker.

Il test eseguito su GitHub Actions compila l'EXE e passa i test del parser. Non equivale al test dell'eseguibile collegato alla tua installazione di Resolve.

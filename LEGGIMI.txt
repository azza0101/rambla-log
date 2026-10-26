# RAMBLA Log

Web app in italiano per iPhone: registro di ripresa, lettura ottica del timecode, trascrizione e marker per DaVinci Resolve. Il codice dell’app è MIT e non richiede API a pagamento.

**Apri l’app:** https://azza0101.github.io/rambla-log/

## Versione 1.1

Interfaccia RAMBLA in dark mode, fondo #0a0a0a e accenti teal/viola, con Space Grotesk e Unbounded Bold incorporati. La scelta **Ora iPhone / Timecode** è nella schermata principale. I sei pulsanti hanno colori pieni e almeno 84 px di altezza su mobile. **Da tenere** usa il verde acqua e **SCARTA** il rosso; SCARTA sostituisce Svolta, mantenendo inalterate le note e i colori dei marker storici. Sono disponibili pausa, ripresa e salvataggio immediato delle modifiche.

## Uso su iPhone

Apri la versione HTTPS in Safari. Condividi → Aggiungi alla schermata Home → attiva Apri come app web, se presente → Aggiungi. Il file HTML in File è una copia portatile: l’anteprima di iOS non è un browser completo e non installa una PWA.

1. Crea una sessione, imposta FPS e lingua. Scegli **Ora iPhone** per ore, minuti e secondi del telefono, oppure **Timecode** per il riferimento della camera con i frame. Le nuove sessioni partono da Ora iPhone; quelle precedenti conservano il loro riferimento.
2. Se usi Timecode, premi **Leggi TC dalla camera** e consenti la fotocamera. Inquadra il display e regola il riquadro sul solo HH:MM:SS:FF. Il timecode deve avanzare. Puoi anche inserire il valore manualmente nelle impostazioni.
3. Dopo tre letture coerenti il clock ottico viene allineato. La fotocamera si chiude; puoi spostare il telefono e iniziare. L’app compensa il tempo trascorso dall’acquisizione del fotogramma OCR all’aggancio. Con Ora iPhone il riferimento viene acquisito quando premi Inizia.
4. Scegli **Voce · browser**, **Whisper · locale** o **Solo marker**. Premi **Inizia sessione**. I permessi sono richiesti quando servono.
5. I pulsanti segnano gli ultimi 5/10/20 secondi. Selezionando le frasi, i pulsanti segnano l’intervallo selezionato. Puoi aggiungere o correggere una nota e i suoi tempi.
6. Usa **Pausa** e **Riprendi** per sospendere e continuare nella stessa sessione. Il riferimento orario avanza anche durante la pausa, così i marker successivi mantengono il loro allineamento.
7. Premi **Termina** e attendi gli ultimi risultati. Esporta EDL, SRT e un backup JSON.

### Pausa, cambio app e salvataggio

Ogni marker, frase confermata, modifica e cambio di stato viene salvato nel browser. Il salvataggio non riscrive l’archivio a ogni tick dell’orologio. Quando la pagina diventa nascosta o viene lasciata, l’app salva subito lo stato e mette in pausa la cattura. Al ritorno, anche dopo un ricaricamento, **Riprendi** mantiene la stessa sessione.

La pausa non comprime il tempo: una pausa di due minuti lascia un intervallo di due minuti prima dei nuovi marker e dei nuovi sottotitoli. Questo è necessario per mantenere il riferimento a una ripresa continua o a un orologio FREE RUN. Il primo marker dopo la ripresa parte al più presto dall’istante di ripresa, evitando di includere il tratto in pausa.

Safari/iOS può interrompere o sospendere l’ascolto in background. L’app conserva i dati già acquisiti e ricostruisce l’orario trascorso; non può garantire la trascrizione mentre usi un’altra app o lo schermo è bloccato. Per una trascrizione continua, resta nell’app con lo schermo acceso.

Ora iPhone usa l’orologio locale del telefono e mostra HH:MM:SS. Gli esportatori mantengono il timecode con frame agli FPS selezionati. Questo non sincronizza automaticamente l’orologio della camera: verifica il riferimento della timeline o correggilo nella finestra di esportazione.

### Precisione del sync

Il filtro OCR richiede almeno 3 letture coerenti con il frame rate e l’avanzamento dell’orologio, con confidenza minima 60/100. Non dimostra precisione al frame: restano il ritardo del display, il buffering della camera, eventuali letture errate e la deriva del telefono. Non è LTC/genlock. Fai un ciak di controllo per il primo uso con la tua camera.

Per un’unica sessione lunga usa un timecode FREE RUN. Con REC RUN, che si ferma tra le registrazioni, sincronizza ogni take e usa sessioni distinte. Una nuova sincronizzazione in una sessione esistente corregge l’origine di TUTTI i marker relativi a quella sessione: non unisce discontinuità REC RUN.

Il sync automatico chiude la fotocamera dopo l’aggancio. Disattivando l’opzione puoi guardare le letture live e premere Allinea e chiudi quando sono stabili. Una lettura non più recente o un ritaglio modificato vengono invalidati.

## Esportazioni

| File | Contenuto e utilizzo |
| --- | --- |
| EDL | Marker timeline con nome, nota, colore e durata in frame. In Resolve: Media Pool → clic destro sulla timeline → Timelines → Import → Timeline Markers from EDL. |
| SRT | Trascrizione completa con tempi RELATIVI alla sessione. Importala come sottotitoli e posizionala al punto in cui è iniziata la registrazione. |
| CSV | Foglio completo con marker e segmenti trascritti. UTF-8, escape di celle e prefissi per evitare formule involontarie. |
| TXT | Registro leggibile di frasi e marker. |
| JSON | Backup riapribile con Importa, sullo stesso o su un altro dispositivo. |

L’EDL inserisce annotazioni: non identifica né monta automaticamente i file originali della camera. Il girato deve già essere posizionato sulla timeline. Gli FPS devono corrispondere. Nell’export puoi indicare il timecode della timeline che corrisponde all’inizio della sessione e aggiungere un offset in secondi.

L’export segnala marker coincidenti (Resolve può conservarne uno solo per frame) e rifiuta intervalli prima di 00:00:00:00 o oltre la giornata timecode. Se la ripresa attraversa mezzanotte, rimappa l’origine dell’export, ad esempio a 01:00:00:00, su una timeline continua.

## Trascrizione e dati

- **Browser:** usa SpeechRecognition/webkitSpeechRecognition, quando realmente disponibile. Supporto e comportamento variano tra versioni iOS, Safari e Home Screen. Può usare il servizio vocale del sistema e internet. Le frasi hanno timestamp stimati, non un allineamento parola per parola.
- **Whisper locale:** Transformers.js 3.8.1, Whisper tiny multilingue q8 (circa 41 MB di pesi, oltre al runtime), eseguito in un worker WASM. Il modello viene scaricato al primo utilizzo. Elabora blocchi di circa 8 secondi; memoria, velocità e cache dipendono dal dispositivo. Se resta indietro, interrompe il microfono, conserva la coda già catturata e mostra il riavvio. Modalità sperimentale su iPhone.
- **OCR:** Tesseract.js 6.0.1, core 6.0.0 e modello inglese 1.0.0. Legge numeri dal solo riquadro sul dispositivo. Le immagini non vengono caricate a un nostro server.
- **Speaker:** assegnazione manuale dal selettore; non diarizzazione automatica.
- **Audio:** non viene conservata una registrazione audio. Il microfono serve alla trascrizione.
- **Salvataggio:** immediato sulle modifiche e sugli eventi di uscita, nel browser corrente, senza backend o sincronizzazione. La cache PWA permette il logger manuale offline dopo il primo caricamento riuscito, inclusi i font. OCR/Whisper hanno risorse aggiuntive da scaricare e non sono garantiti offline. iOS può cancellare dati di siti: esporta il JSON regolarmente. Gli archivi Safari/Home Screen possono essere distinti.
- **Ripresa:** pausa esplicita o automatica quando l’app viene nascosta, con ripresa nella stessa sessione. L’app richiede Wake Lock se disponibile mentre è attiva. Il riferimento orario continua durante la pausa; l’audio non viene registrato in background.

## File e sviluppo

`dist/index.html` contiene CSS, font e JavaScript incorporati. `dist/RAMBLA-Log.html` è la copia portatile senza registrazione service worker. Il pacchetto PWA contiene anche manifest, icone, service worker, guida e licenze: ospita tutto nella stessa cartella su HTTPS. La pubblicazione GitHub Pages usa il branch `main`, cartella `/ (root)`; i percorsi sono relativi e compatibili con `/rambla-log/`.

Il runtime dell’app non richiede npm o build. Per modificare i sorgenti:

```sh
node --test --test-isolation=none
node build.mjs
```

Il modulo core gestisce 23.976, 24, 25, 29.97 NDF/DF, 30, 50, 59.94 NDF/DF e 60 fps. Il drop-frame salta etichette di timecode, non fotogrammi video.

## Collaudo e limiti

La suite automatica copre formati, frame rate, drop-frame, import malformati, recupero delle risorse, PCM/resampling, finalizzazione, marker con trascrizione tardiva e regressioni dell’interfaccia. Un test nel browser con il motore Tesseract reale ha riconosciuto tre timecode sintetici consecutivi senza differenza di frame e ha rilasciato il worker. Anche il worker Whisper è stato provato nel browser con un WAV pubblico di 11 secondi: trascrizione reale corretta, 4,41 secondi di inferenza nel browser di test. Non è una misura di prestazioni su iPhone. Queste prove non equivalgono a un collaudo sulla tua camera.

Non sono stati eseguiti test su iPhone fisico né un’importazione dentro DaVinci Resolve. Occorre provare una breve sessione prima di usare l’app in una ripresa importante. Il formato EDL segue l’esempio Blackmagic; Unicode, collisioni e dettagli del parser vanno verificati nella versione Resolve effettiva.

## Fonti tecniche

- Blackmagic, EDL marker syntax: https://forum.blackmagicdesign.com/viewtopic.php?f=21&t=134578
- Frame.io, import marker EDL: https://help.frame.io/en/articles/4128691-import-comments-into-resolve-with-edl
- Apple, aggiunta app alla Home: https://support.apple.com/it-it/guide/iphone/iphea86e5236/ios
- Tesseract API: https://github.com/naptha/tesseract.js/blob/master/docs/api.md
- Transformers.js 3.8.1: https://huggingface.co/docs/transformers.js/v3.8.1/en/installation
- Whisper tiny: https://huggingface.co/Xenova/whisper-tiny
- WebKit, sospensione del riconoscimento quando la pagina diventa invisibile: https://bugs.webkit.org/show_bug.cgi?id=220073
- MDN, salvataggio al cambio di visibilità: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
- Riferimento visivo e font RAMBLA: https://www.ramblastudio.com/

RAMBLA Log è indipendente e non affiliato a Earwig o Blackmagic Design. Le librerie e i modelli esterni mantengono le proprie licenze. Nessun logo o asset proprietario Earwig è incluso.

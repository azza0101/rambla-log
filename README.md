# RAMBLA Log

Web app in italiano per iPhone: registro di ripresa, lettura ottica del timecode, trascrizione e marker per DaVinci Resolve. Il codice dell’app è MIT e non richiede API a pagamento.

**Apri l’app:** [RAMBLA Log](https://azza0101.github.io/rambla-log/)

## Versione 1.2

Interfaccia compatta per iPhone, con sei pulsanti colorati in una griglia 3×2 e altezza minima di 70 px sugli schermi più piccoli. Il **Registro** parte chiuso: mostra il numero di marker e note e si apre quando serve consultare i contenuti. **Nota vocale** permette di dettare un commento riferito al momento scelto. **Aggiorna timecode** applica il nuovo riferimento ai momenti successivi, conservando i marker precedenti.

Restano la scelta **Ora iPhone / Timecode**, pausa e ripresa, salvataggio immediato e i colori RAMBLA: verde acqua per **Da tenere**, giallo per **Highlight**, viola per **Divertente**, rosa per **Emozione**, rosso per **SCARTA**, blu per **Da rivedere**. Fondo #0a0a0a, Space Grotesk e Unbounded Bold incorporati. I marker storici conservano nomi, note e colori originali.

## Uso su iPhone

Apri la versione HTTPS in Safari. Condividi → Aggiungi alla schermata Home → attiva Apri come app web, se presente → Aggiungi. Il file HTML in File è una copia portatile: l’anteprima di iOS non è un browser completo e non installa una PWA.

1. Crea una sessione, imposta FPS e lingua. Scegli **Ora iPhone** per ore, minuti e secondi del telefono, oppure **Timecode** per il riferimento della camera con i frame. Le nuove sessioni partono da Ora iPhone; quelle precedenti conservano il loro riferimento.
2. Se usi Timecode, premi **Leggi timecode** e consenti la fotocamera. Porta tutti i numeri HH:MM:SS:FF nel rettangolo fisso; avvicina o allontana il telefono per inquadrarli. L’unico cursore regola l’**Esposizione**. Il timecode deve avanzare. Prima di iniziare puoi anche inserire il valore manualmente nelle impostazioni.
3. Il riconoscimento attende 3, 4 o 5 letture coerenti, secondo confidenza e separatori riconosciuti. Con l’allineamento automatico la fotocamera si chiude dopo la conferma. L’app compensa il tempo trascorso dall’acquisizione del fotogramma OCR all’aggancio. Con Ora iPhone il riferimento viene acquisito quando premi Inizia.
4. Scegli **Voce · browser**, **Whisper · locale** o **Solo marker**. Sugli schermi più bassi, la modalità e la voce assegnata si trovano in **Impostazioni**, accessibili dall’icona in alto. Premi **Inizia sessione**. I permessi sono richiesti quando servono.
5. I pulsanti segnano gli ultimi 5/10/20 secondi. Apri il **Registro** per selezionare frasi e segnare quell’intervallo. **Nota** aggiunge un appunto scritto; **Nota vocale** fissa l’intervallo al tocco, poi avvia la dettatura. Puoi correggere testo, categoria e tempi delle note.
6. Usa **Pausa** e **Riprendi** per sospendere e continuare nella stessa sessione. Il riferimento orario avanza anche durante la pausa, così i marker successivi mantengono il loro allineamento.
7. Premi **Termina** e attendi gli ultimi risultati. Esporta EDL, SRT e un backup JSON.

### Note vocali

Il tocco su **Nota vocale** riserva subito il marker: usa l’intervallo delle frasi selezionate oppure gli ultimi 5/10/20 secondi scelti. La durata della dettatura non sposta quel momento. La trascrizione continua termina la cattura corrente e attende gli ultimi risultati prima di cedere il microfono alla nota; le parole dettate restano separate dal testo della ripresa.

Ferma la dettatura, correggi il testo o la categoria e premi **Salva marker**. Il commento entra nella nota del marker e nell’EDL. La trascrizione continua riprende alla chiusura della nota se la sessione è ancora attiva. Non viene creato un file audio. La dettatura usa Whisper se è selezionata la modalità locale; negli altri casi usa il riconoscimento vocale del browser, quando disponibile. Puoi comunque scrivere la nota.

### Pausa, cambio app e salvataggio

Ogni marker, frase confermata, modifica e cambio di stato viene salvato nel browser. Il salvataggio non riscrive l’archivio a ogni tick dell’orologio. Quando la pagina diventa nascosta o viene lasciata, l’app salva subito lo stato e mette in pausa la cattura. Al ritorno, anche dopo un ricaricamento, **Riprendi** mantiene la stessa sessione.

La pausa non comprime il tempo: una pausa di due minuti lascia un intervallo di due minuti prima dei nuovi marker e dei nuovi sottotitoli. Questo è necessario per mantenere il riferimento a una ripresa continua o a un orologio FREE RUN. Il primo marker dopo la ripresa parte al più presto dall’istante di ripresa, evitando di includere il tratto in pausa.

Safari/iOS può interrompere o sospendere l’ascolto in background. L’app conserva i dati già acquisiti e ricostruisce l’orario trascorso; non può garantire la trascrizione mentre usi un’altra app o lo schermo è bloccato. Per una trascrizione continua, resta nell’app con lo schermo acceso.

Ora iPhone usa l’orologio locale del telefono e mostra HH:MM:SS. L’EDL mantiene il timecode con frame agli FPS selezionati; SRT, CSV e TXT usano tempi relativi. Questo non sincronizza automaticamente l’orologio della camera: verifica il riferimento della timeline o correggilo nella finestra di esportazione.

### Precisione del sync

Il rettangolo di lettura è fisso, con rapporto 5,5:1, e corrisponde al ritaglio effettivamente elaborato. Non ci sono cursori per posizione o dimensioni. **Esposizione** usa il controllo della fotocamera solo quando il browser lo espone e l’impostazione applicata viene verificata; altrimenti modifica la luminosità dell’anteprima e dei pixel elaborati dall’OCR. La correzione digitale non recupera i bianchi già bruciati.

Il riconoscimento normalizza contrasto e polarità del display; quando serve, prova una soglia adattiva sugli stessi pixel. Ogni acquisizione produce al massimo due passaggi OCR e conta come una sola osservazione. Sono accettate esattamente otto cifre che formano un timecode valido agli FPS scelti. Separazioni mancanti o degradate sono tollerate, ma lettere e cifre mancanti non vengono inventate.

| Lettura OCR | Conferme minime coerenti |
| --- | --- |
| Confidenza almeno 60/100 | 3 |
| Confidenza da 50 a meno di 60 | 4 |
| Confidenza da 40 a meno di 50 | 5 |
| Otto cifre senza separatori, con confidenza almeno 40 | 5 |

La serie deve avanzare in modo coerente con il tempo di acquisizione e gli FPS; il requisito più prudente incontrato nella serie resta valido. Un timecode fermo non viene confermato. Cambiare esposizione o geometria della sorgente invalida i risultati già in elaborazione; una lettura scaduta non può essere applicata. Disattivando l’allineamento automatico puoi confermare una lettura stabile con **Allinea e chiudi**.

Questi controlli non dimostrano precisione al frame: restano il ritardo del display, il buffering della camera, eventuali letture errate e la deriva del telefono. È un riferimento ottico, non LTC/genlock. Fai un ciak di controllo con la tua camera.

### Aggiornare il timecode durante la sessione

**Aggiorna timecode** aggiunge un riferimento valido dall’istante dell’aggiornamento in avanti. L’origine `startTC` e i timecode dei marker precedenti restano invariati; i riferimenti successivi sono conservati nel backup come `tcAnchors`. Dopo il primo aggiornamento, FPS e origine iniziale restano bloccati anche a sessione terminata, per conservare la coerenza dei riferimenti.

L’EDL sceglie il riferimento valido all’inizio di ogni marker e lo usa anche per calcolarne la durata: un intervallo che attraversa un aggiornamento conserva la durata originale. SRT, CSV e TXT mantengono i tempi relativi alla sessione e non vengono spostati dalla risincronizzazione. Le opzioni di allineamento nella finestra di esportazione restano una correzione globale del solo EDL.

Per una ripresa continua è pratico un timecode FREE RUN. Con REC RUN, che si ferma tra le registrazioni, aggiorna il riferimento quando la camera riparte: l’app non rileva automaticamente le pause della camera.

## Esportazioni

| File | Contenuto e utilizzo |
| --- | --- |
| EDL | Marker timeline con nome, nota scritta o dettata, colore e durata in frame. Usa il riferimento valido all’inizio del marker. In Resolve: Media Pool → clic destro sulla timeline → Timelines → Import → Timeline Markers from EDL. |
| SRT | Trascrizione completa con tempi RELATIVI alla sessione. Importala come sottotitoli e posizionala al punto in cui è iniziata la registrazione. |
| CSV | Marker e segmenti trascritti con tempi relativi. UTF-8, escape di celle e prefissi per evitare formule involontarie. |
| TXT | Registro leggibile di frasi, marker e note, con tempi relativi. |
| JSON | Backup riapribile con Importa, incluse note e successive correzioni del timecode. |

L’EDL inserisce annotazioni: non identifica né monta automaticamente i file originali della camera. Il girato deve già essere posizionato sulla timeline. Gli FPS devono corrispondere. Nell’export puoi indicare il timecode della timeline che corrisponde all’inizio della sessione e aggiungere un offset in secondi.

L’export segnala marker coincidenti (Resolve può conservarne uno solo per frame) e rifiuta intervalli prima di 00:00:00:00 o oltre la giornata timecode. Se la ripresa attraversa mezzanotte, rimappa l’origine dell’export, ad esempio a 01:00:00:00, su una timeline continua.

## Trascrizione e dati

- **Browser:** usa SpeechRecognition/webkitSpeechRecognition, quando realmente disponibile. Supporto e comportamento variano tra versioni iOS, Safari e Home Screen. Può usare il servizio vocale del sistema e internet. Le frasi hanno timestamp stimati, non un allineamento parola per parola.
- **Whisper locale:** Transformers.js 3.8.1, Whisper tiny multilingue q8 (circa 41 MB di pesi, oltre al runtime), eseguito in un worker WASM. Il modello viene scaricato al primo utilizzo. Elabora blocchi di circa 8 secondi; memoria, velocità e cache dipendono dal dispositivo. Se resta indietro, interrompe il microfono, conserva la coda già catturata e mostra il riavvio. Modalità sperimentale su iPhone.
- **OCR:** Tesseract.js 6.0.1, core 6.0.0 e modello inglese 1.0.0. Legge numeri dal solo riquadro sul dispositivo. Le immagini non vengono caricate a un nostro server.
- **Speaker:** assegnazione manuale dal selettore; non diarizzazione automatica.
- **Audio:** non viene conservata una registrazione audio. Il microfono serve alla trascrizione continua o alla dettatura separata delle note.
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

La suite automatica copre formati, frame rate, drop-frame, import malformati, recupero delle risorse, PCM/resampling, finalizzazione, trascrizione tardiva, note vocali e aggiornamenti progressivi del timecode. Include il passaggio del microfono fra trascrizione e nota, i callback tardivi, l’esposizione e le condizioni di stabilità dell’OCR. Stato delle verifiche e prove storiche: [docs/verification.md](docs/verification.md).

Il benchmark 1.2 usa Tesseract reale nel browser su dieci immagini sintetiche: **8/10** letture esatte senza preprocessing e **9/10** con la pipeline corrente, senza timecode errati accettati nei dieci casi. Il caso limite a sette segmenti viene rifiutato. I risultati sono in `output/ocr-benchmark-results.json`. Il confronto usa lo stesso parser e misura il trattamento delle immagini; non è un confronto completo tra release né una prova di sincronizzazione su video fisico.

Nelle verifiche precedenti, il worker Whisper ha trascritto un WAV pubblico di 11 secondi in 4,41 secondi nel browser di test. Questa misura non descrive le prestazioni di un iPhone.

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

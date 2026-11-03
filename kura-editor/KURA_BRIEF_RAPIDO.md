# KURA — Brief rapido per generare pagine editoriali (MCP v3.3.0)
Questo file descrive un unico input ripetibile che ChatGPT trasforma in pagine KURA 4:5 totalmente modificabili. **Non è necessario compilare alcun modulo**: è sufficiente incollare i contenuti in prosa come al solito.

## Modalità consigliata: minimo indispensabile

Scrivi:
- mese e anno (una volta per il carosello);
- una destinazione per sezione;
- due paragrafi descrittivi (o un unico testo);
- un post-it con Base / Durata / Da non perdere / Da sapere.

Il resto si decide con i preset KURA: identità grafica invariabile, Montserrat + Caveat Brush, sfondi stagionali papercut, spazio negativo, layout alternati, Giulia canonica in pose differenti, post-it leggibile.

### Esempio copia/incolla

```text
CAROSELLO KURA — NOVEMBRE 2026
TIPO: PAGINE INFORMATIVE (3)
STILE: master KURA approvato

DESTINAZIONE 1 — VALLE DEL VIPACCO, SLOVENIA
TESTO: A pochi chilometri dal confine... / Novembre è...
POST-IT:
Base: Vipava o Ajdovščina
Durata: 3–4 giorni
Da non perdere: cantine, borghi e cucina locale
Da sapere: bora e prenotazioni

[IMMAGINE: Giulia a sinistra che degusta orange wine; vigneti e borghi autunnali. Illustrazione papercut orizzontale con bordo superiore frastagliato e trasparenza; occupa tutta la fascia bassa.]

DESTINAZIONE 2 — MAIORCA, SPAGNA
TESTO: ...
POST-IT: ...
[IMMAGINE: Giulia a destra che fotografa; ulivi, muretti a secco e Valldemossa.]

DESTINAZIONE 3 — PARCO KRUGER, SUDAFRICA
TESTO: ...
POST-IT: ...
[IMMAGINE: Giulia a destra con binocolo; acacia, elefante, savana che rinverdisce.]
```

## Direttive visive facoltative
Usa un blocco **[IMMAGINE: ...]** solo se vuoi imporre azione, posizione o elementi precisi. Altrimenti il sistema deduce una scena coerente dal testo, diversifica Giulia e alterna le composizioni. Puoi aggiungere **[LAYOUT: testo a sinistra / post-it a destra]** o **[SFONDO: inverno_2]**, ma non è richiesto.

## Regole automatiche (vincolanti)
1. Ogni destinazione = una pagina informativa 1080×1350; non creare griglie né pagine accorpate.
2. L'illustrazione inferiore è un **PNG trasparente full-width**, preferibilmente 1080 px o più. Il personaggio e il paesaggio appartengono allo stesso asset. Non ritagliare Giulia dalle bozze con testi o sfondi.
3. Layout, background, note e gerarchie differenziati tra pagine; però logo assente nelle pagine informative.
4. Titoletti brush in **minuscolo/sentence case** e maiuscolo solo quando esplicitamente richiesto. Font di riferimento **Caveat Brush** (font open-source Google Fonts, self-hosted); Kaushan Script resta alternativa selezionabile.
5. Esiste un solo post-it KURA canonico, basato sull'originale `assets/postit_1.png`: gli otto asset PNG reali (carta materica, ombra, scotch, titolo brush e quattro icone originali) sono in `assets/postit-canon/`. Solo la carta viene ridimensionata con 9-slice; il resto mantiene proporzioni fisse.
6. `body1` e `body2` usano lo stesso font Montserrat e sempre la stessa dimensione calcolata per pagina; il progetto Novembre 2026 v6 imposta target 31px e aumenta le caselle testo per evitare font troppo piccoli. I grassetti `**...**` rimangono editabili.
7. Pubblicazione con un commit GitHub che include i PNG e il JSON canonico; non creare un secondo HTML indipendente.
8. Un nuovo carosello riceve un projectId univoco, senza sostituire progetti preesistenti. Link diretto `?template=<slug>`.

## Risparmio di tempo per un batch
- A testo completo non chiedere ulteriori conferme: normalizza i campi, comprimi i paragrafi **solo quando** necessario alla leggibilità conservandone il significato.
- Genera le tre illustrazioni direttamente nel formato finale del bordo inferiore, già trasparenti. Evita storyboard/mockup e ritagli successivi di figure già integrate con scritte.
- Precarica font, carte e post-it condivisi dall'app, non duplicarli dentro ogni JSON.
- Calcola automaticamente altezze, safe margins e contrasto dello sfondo; controlla errori di sovrapposizione prima di pubblicare.
- Riutilizza le decorazioni approvate; genera solo ciò che cambia (Giulia + paesaggio).
- Pubblica tutti gli asset in un solo aggiornamento e verifica la versione live.

## API e compatibilità
Nel browser `window.KURA_MCP.inspect()`, `window.KURA_MCP.applyPatch([...])`, `window.KURA_MCP.getProject()` e `window.KURA_MCP.loadTemplate('novembre-2026')` permettono di vedere e modificare i dati; il sito GitHub Pages è statico e **non genera autonomamente immagini**. Per generare nuovi PNG serve un agente con capacità immagini, poi il file entra nella libreria asset e nel progetto JSON.

## Asset PNG del post-it unico
Dentro il browser, `window.KURA_NOTE_PNGS.names` restituisce `paper`, `tape`, `title`, `pin`, `calendar`, `star`, `info`. `window.KURA_NOTE_PNGS.getPNG('title')` (o qualsiasi altro nome) restituisce un PNG trasparente in formato data URL. Il titolo usa Caveat Brush e viene ricostruito dopo il caricamento dei font. La composizione finale, inclusi tutti i layer, viene esportata nel PNG della tavola.

## Copia immediata della pagina PNG
Il pulsante **⧉ Copia PNG** nella barra superiore copia direttamente l'attuale pagina 1080×1350 negli appunti (Clipboard API), senza download. Funziona in contesto HTTPS con autorizzazione agli appunti (es. Chrome o Edge). Se il browser non lo supporta, l'app non salva un file di nascosto ma mostra un messaggio. **↓ PNG** resta disponibile per il download e **ZIP tutte** per l'intero carosello.

## Controlli rapidi dimensioni testo (Editor 3.6)
Nella scheda **Testi → Dimensione testi in blocco** trovi due slider indipendenti: **Testo normale** (entrambi i paragrafi, stessa misura per pagina, grassetti conservati) e **Testo post-it** (etichette e valori, senza modificare le dimensioni di carta, scotch, titolo e icone). I pulsanti −/＋ cambiano la scala di 5 punti percentuali; il pulsante reset riporta i valori al 100%. Di default la modifica riguarda solo la pagina aperta. La spunta **Applica a tutte le pagine** estende ciascuna modifica a tutte le pagine del carosello, senza alterare posizioni, foto, illustrazioni o titoli. Le percentuali vengono salvate insieme al progetto in IndexedDB e nel JSON GitHub. I paragrafi normali mantengono il fitting condiviso: se le caselle sono troppo piccole, l'editor indica la misura realmente utilizzata e invita ad ampliare il contenitore.

## Font KURA originale e titolo modificabile (Editor 4.1.1)
L'editor carica automaticamente il font originale *Feeling Passionate*, registrato come **KURA Brush originale**, con le due vere sostituzioni OpenType **ss01** e **ss02** (24 glifi sostituiti per set). Per usare le alternative, seleziona la casella testo nella tavola e imposta **Glifi base / Alternativi 01 / Alternativi 02** nella toolbar. Le variazioni si applicano alla casella selezionata. **Regular** è l'unico peso nativo incluso nel font; **Bold** ed **ExtraBold** vengono simulati tramite ispessimento del contorno in canvas e anteprima HTML, per mantenere il tratto artigianale anche nell'esportazione PNG.

Il titolo del post-it **INFO DI VIAGGIO** è modificabile da **Testi → Post-it → Scritta del post-it**. Il PNG approvato resta il default per compatibilità con le pagine esistenti. Attiva **Usa il titolo modificabile al posto del PNG** oppure cambia la scritta/font per passare al testo editabile. Trovi nello stesso pannello i controlli **Font, Glifi, Spessore, Dimensione**. La scritta ruota e si sposta insieme al post-it; il testo modificato resta nel JSON del progetto ed è esportato nei PNG finali. Puoi ripristinare il PNG originale disattivando la spunta.

I font caricati manualmente hanno la famiglia separata **KURA Custom Brush**, quindi non sostituiscono più il font originale integrato. Il pulsante Ripristina elimina il font personalizzato salvato nel browser. Nessun nuovo peso nativo è stato inventato.

## Workspace 4.2.1 — pagine, copia elementi, dark mode

- **Barra Pagine:** su desktop è una colonna separata e sempre visibile a sinistra, prima di Testi/Varianti/Elementi. Su telefono resta una striscia scorrevole orizzontalmente in alto; il controllo ☷ espande la gestione progetti e i comandi avanzati.
- **Copia e incolla tra progetti:** seleziona un elemento nella tavola. Nell'ispettore usa **⧉ Copia elemento**, poi apri un progetto diverso e premi **↳ Incolla** sopra la tavola. In alternativa premi **Ctrl/Cmd+C** con l'elemento selezionato e **Ctrl/Cmd+V** nel progetto di destinazione, quando non stai scrivendo in un campo. Vengono conservate dimensioni, rotazione, font/stili e, per illustrazioni personalizzate, la relativa immagine. Il post-it può essere copiato con tutti i suoi testi e le impostazioni. Il testo copiato viene incollato come nuova casella indipendente. Il buffer è salvato nel browser (IndexedDB), quindi resta disponibile anche passando da un progetto all'altro.
- **Dark mode KURA:** premi **☾ Dark mode** nella barra superiore per passare all'interfaccia verde bosco scuro. La preferenza viene ricordata nel browser. Le tavole 1080×1350 e i PNG esportati restano con lo sfondo e la palette originale KURA; viene modificata solo l'interfaccia di lavoro.

Queste funzioni non cambiano i JSON dei progetti esistenti finché non incolli o modifichi un elemento. Per condividere modifiche con un collaboratore rimane necessario salvare su GitHub.

## KURA Editor 4.3 — interfaccia moderna e palette testi

L'interfaccia è stata alleggerita con spaziature uniformi, bordi sottili, pulsanti meno ingombranti, accenti terracotta e dark mode verde foresta attenuata. Non vengono modificate le tavole o i PNG esportati.

**Colore testo:** seleziona una casella di testo nella tavola; nella toolbar appare un pulsante con il colore attuale e il codice HEX. Offre 32 campioni predefiniti, selettore colore libero del browser, inserimento HEX (#RRGGBB) e pulsante **☆ Salva preferito**. I preferiti sono salvati nel browser e disponibili anche cambiando progetto. Il colore della casella viene salvato nel JSON del progetto e incluso nel PNG.

**Scritta INFO DI VIAGGIO:** vai in **Testi → Post-it** e premi **✎ Modifica “INFO DI VIAGGIO”**. Il pulsante attiva il testo modificabile e mette il cursore sul campo; scegli font, glifi, dimensione e spessore nel medesimo pannello, oppure seleziona il testo nella tavola per cambiare anche colore. Disattivando **Usa il titolo modificabile al posto del PNG** ripristini il titolo raster originale, senza cancellare il testo personalizzato. I vecchi progetti restano in modalità PNG finché non abiliti l'editing.

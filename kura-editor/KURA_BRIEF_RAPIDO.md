# KURA — Brief rapido per generare pagine editoriali (MCP v3.2.2)
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
5. Esiste un solo post-it canonico per tutte le pagine: carta (ridimensionabile con 9-slice), scotch, titolo INFO DI VIAGGIO e quattro icone sono sette immagini PNG trasparenti generate separatamente dall'editor; solo la carta cambia dimensione. Le scritte e le icone non si deformano.
6. Entrambi i paragrafi descrittivi hanno sempre lo stesso font Montserrat e la stessa dimensione per pagina, calcolata per rientrare negli spazi con conservazione del grassetto. Ogni testo, post-it, sticker, immagine e sfondo resta modificabile da editor/MCP. Salvataggio in IndexedDB, **Salva progetto** / **Apri progetto**, esportazione JSON/PNG.
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

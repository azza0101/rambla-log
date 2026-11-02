# KURA Editor — Carousel v2.2

Web app per caroselli KURA formato 4:5, pubblicata a https://azza0101.github.io/rambla-log/kura-editor/ . Il codice è autonomo dal resto del repository RAMBLA.

## Uso dell'editor
- Clicca direttamente qualsiasi testo effettivamente disegnato sulla tavola per scrivere.
- Seleziona una parola e usa **B** nella barra flottante o il menu con il tasto destro. I segmenti in grassetto sono memorizzati come `**testo**`, quindi restano leggibili anche da MCP.
- Trascina **⠿** per spostare, **↻** per ruotare, **↘** per ridimensionare una casella. La toolbar cambia font, dimensione e grassetto.
- Fino a **16 sfondi**: 4 originali e 12 illustrazioni papercut stagionali (3 primavera, 3 estate, 3 autunno, 3 inverno). La scelta è salvata per pagina, anche con i seed.
- I 4 layout, i post-it originali, gli sticker, Giulia, il PNG 1080×1350 e lo ZIP delle pagine sono conservati.
- Da **Pagine**: crea, rinomina, duplica, elimina e riapri progetti. Autosalvataggio locale (IndexedDB, debounce 650ms). **Esporta progetto** come JSON e **Apri JSON** per trasferirlo.
- Su iPhone: Safari → Condividi → Aggiungi a Home (PWA); autosalvataggio nel browser del dispositivo, non condiviso tra persone.

## Font
I minititoli sono configurati in `Feeling Passionate`. Se il font non è disponibile si usa temporaneamente **Caveat**; non è corretto dichiarare l'originale incorporato.
Il font Feeling Passionate di Din Studio è proprietario: per renderlo disponibile a tutti serve un file webfont con licenza valida per la pubblicazione dell'app/sito. Quando è disponibile, depositare il file autorizzato in `assets/FeelingPassionate.woff2`: la v2 lo carica e lo usa automaticamente nei PNG. È ancora possibile usare la funzione di caricamento locale per font acquistati (salvato soltanto sul browser corrente). **Non pubblicare il file senza la necessaria autorizzazione di embedding/distribuzione**.

## Interfaccia MCP/automazioni
- Dati canonici: JSON versionato `KURA_EDITOR_V2`. Il precedente `KURA_EDITOR_V1` rimane importabile.
- Schema operativo: [mcp-contract.json](./mcp-contract.json), esempi di patch e chiavi.
- In una sessione di browser automation: `window.KURA_MCP.inspect()`, `getProject()`, `applyPatch(operations)`, `save()`, `exportJSON()` e `importProject(json)`.
- Identificatori stabili per pagina e casella libera; contenuti (`fields`), stile (`textStyles`) e geometria (`offsets`, `freeTexts`) sono separati.
- **Non è un server MCP pubblico** e non espone endpoint remoto: un client esterno opera tramite automazione browser, file JSON o un ponte MCP autorizzato. Lo static hosting GitHub Pages non permette da solo autosalvataggi condivisi tra account.

## Manutenzione
- `index.html`: renderer canvas originario, agganci text/multi-page.
- `editor-v2.js`: livelli testo, pannello strumenti, background, gestione progetti e API per MCP.
- `editor-v2.css`: elementi sovrapposti, selezione e controlli.
- `version.json` e `sw.js`: aggiornamento PWA e cache offline; incrementare build/cache per ogni nuova release.
- Le modifiche v1.1 sono recuperabili dal branch `kura-editor-v1.1-backup-2026-11-01`.

**Limiti**: non è una soluzione realtime multiutente; non viene sincronizzata automaticamente su cloud o GitHub. Un post-it con testo stampato direttamente nell'immagine non diventa modificabile senza un asset di carta pulita.

## Release 2.2.0 — Asset stagionali
- 12 sfondi illustrati SVG su GitHub: sfondo_spring_1..3.svg, sfondo_summer_1..3.svg, sfondo_autumn_1..3.svg, sfondo_winter_1..3.svg; i 4 originali rimangono invariati.
- 9 nuovi sticker papercut SVG: blossom, lavender, citrus, shell, autumn_leaf, grapes, snowflake, pine, ticket (17 totali).
- La gallery espone 5 gruppi: Basic, Primavera, Estate, Autunno, Inverno.
- MCP: utilizzare setBackgroundId e setSeason; addSticker accetta gli ID delle decorazioni e li aggiunge come livelli editabili.
- Build 20261101d4e0 e cache PWA dedicata; i progetti esistenti sono conservati in IndexedDB.

## 2.4.0 — Identità grafica KURA
- Rimpiazzati i nove sticker stagionali precedenti con nuovi SVG a più livelli, texture carta, contorni leggermente irregolari e ombre di contatto. Le otto decorazioni originali non sono state toccate.
- Galleria divisa in Originali, Primavera, Estate, Autunno, Inverno, Editoriali; ogni asset rimane un livello spostabile.
- Cover editor: rimossi i disegni segnaposto fuori stile, il logo ridisegnato e le false illustrazioni. Master bloccato; i sette asset canonici sono obbligatori per esportare.
- Il titolo originale deve essere fornito come PNG realmente trasparente e il font proprietario Feeling Passionate non è compreso senza licenza di incorporamento.

## Release 2.5.0 — Asset fotografici KURA e font originale
- 16 WebP con trasparenza ricavati dai quattro sprite sheet KURA approvati: Primavera (4), Estate (4), Autunno (4), Inverno (4). Gli SVG semplificati sono rimossi dalla selezione, ma rimangono leggibili nei vecchi progetti.
- I nuovi sticker mantengono texture di carta, ombre tra i livelli, ritagli e trasparenza e non vengono ridisegnati da canvas.
- Il font completo caricato dall’utente, convertito integralmente in WOFF2, è servito come `assets/Kura_Brush2.woff2` a tutti gli utenti; i minititoli e l’anno della copertina usano KURA Brush2. Non è una versione subset.
- Compatibilità MCP `KURA_MCP` v2.5: ID immutabili per ognuna delle 24 decorazioni.

# KURA Editor — Carousel v2.0

Web app per caroselli KURA formato 4:5, pubblicata a https://azza0101.github.io/rambla-log/kura-editor/ . Il codice è autonomo dal resto del repository RAMBLA.

## Uso dell'editor
- Clicca direttamente qualsiasi testo effettivamente disegnato sulla tavola per scrivere.
- Seleziona una parola e usa **B** nella barra flottante o il menu con il tasto destro. I segmenti in grassetto sono memorizzati come `**testo**`, quindi restano leggibili anche da MCP.
- Trascina **⠿** per spostare, **↻** per ruotare, **↘** per ridimensionare una casella. La toolbar cambia font, dimensione e grassetto.
- Fino a **12 sfondi**: 4 sfondi originali e 8 varianti di carta procedurale. La scelta è salvata per pagina, anche con i seed.
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

# KURA Editor — web app PWA

Editor verticale 4:5 KURA Viaggi, pubblicato nello stesso repository di RAMBLA Log ma in directory autonoma.

- App: https://azza0101.github.io/rambla-log/kura-editor/
- Versione: 1.1.0 (`01e114c8ef33`)
- 4 layout, 4 sfondi, 4 post-it, decorazioni e pennellate PNG.
- Seed riproducibile, campi testo modificabili, importazione PNG Giulia, file progetto JSON, PNG/ZIP 1080×1350.
- Font Montserrat caricato da Google Fonts quando online; Feeling Passionate è **facoltativo** e si carica localmente dal proprio file font, mai incluso nel repository pubblico.
- Il pulsante **⟳ Aggiorna app** controlla `version.json` su GitHub Pages, salva i dati locali e ricarica quando il build cambia.
- I dati personali e le immagini importate vengono salvati nel browser dell'utente, non su GitHub.
- PWA iPhone: apri in Safari → Condividi → Aggiungi alla schermata Home.

## Note tecniche

Tutto statico, nessun backend. `sw.js` ha scope soltanto `./` e non interferisce con RAMBLA Log. Aggiornare contemporaneamente `index.html`, `version.json`, il cache name di `sw.js` e gli asset per un rilascio.

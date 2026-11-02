# KURA Editor 3.7 — Motore MCP locale (senza MCP)

La scheda **Testi** contiene **Motore MCP locale**: incolla un intero brief editoriale e premi **Analizza testo**, quindi **Genera nuovo progetto**.

- Ogni intestazione `DESTINAZIONE N — NOME` produce **una pagina 1080×1350**, senza griglie.
- Riconosce `TITOLETTO 1`, `BODY1`, `TITOLETTO 2`, `BODY2`, `POST-IT`, `Base`, `Durata`, `Da non perdere`, `Da vivere`, `Da provare`, `Da sapere`.
- Mantiene i marcatori **grassetto** `**...**` nei campi editabili, anche se incollati con caratteri di escape.
- Archivia `SOTTOTITOLO INTERNO DI RIFERIMENTO`, `[IMMAGINE: ...]`, `[LAYOUT: ...]` e `[SFONDO: ...]` nei metadati **senza stamparli nelle tavole**.
- Archivia anche anno, titolo del carosello, tipo, stile, edizione testi e preset generale nel JSON del progetto.
- **Copia la grafica del progetto corrente** è attivo per impostazione predefinita: conserva posizioni, sfondi, decorazioni, note, caratteri, dimensioni e, per mete corrispondenti, il paesaggio integrato con Giulia. Se una meta è diversa, nasconde la scena precedente invece di mostrare un luogo sbagliato. Il brief immagini resta disponibile per la successiva generazione mediante un agente esterno.
- È possibile creare **1–50 pagine**, usando in ciclo le grafiche del progetto di partenza quando necessario.
- L'importazione crea **sempre un nuovo projectId**, lasciando l'originale invariato. Le nuove pagine sono salvate automaticamente in IndexedDB. Le puoi poi pubblicare tramite **☁ GitHub**.
- L'analisi e la creazione sono **locali**, senza chiamate a MCP, modelli o servizi API.

## Prova pronta

Il file `tests/brief-novembre-v3.txt` contiene il brief di novembre (Valle del Vipacco, Maiorca, Kruger). Il nuovo progetto JSON con i medesimi panorami del master e i testi aggiornati si trova in `projects/KURA_Progetto_Novembre_2026_MCP_TEST.json`.

Aprilo con `?template=novembre-2026-mcp-test`; il precedente `?template=novembre-2026` resta invariato.

## Test

`node kura-editor/tests/test-kura-brief-parser.cjs`

Il test verifica le 3 pagine campione, una quarta destinazione aggiuntiva, i grassetti, la gestione degli errori, i metadati e il riuso delle tre scene approvate. Una GitHub Action esegue gli stessi controlli alle modifiche del parser.

La grafica di un progetto salvato esclusivamente nel browser **non è accessibile da GitHub**: per derivare esattamente da quella versione, apri quel progetto nell'editor e genera il nuovo progetto da lì.

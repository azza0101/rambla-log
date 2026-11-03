# KURA Editor — salva e condividi i progetti (3.5.0)

## Conservare le modifiche che hai appena fatto
Apri la stessa applicazione e **lo stesso profilo browser** in cui hai lavorato. Non cancellare i dati del sito. Il link `?template=novembre-2026` usa l'ID `kura-nov26-travel-pages-v7` e recupera prima il progetto locale modificato, senza ricaricare la versione di esempio.

- **💾 Salva**: salva l'ultima versione in IndexedDB e, *solo se GitHub è collegato*, la pubblica anche nel repository.
- **💾 Salva con nome**: chiede un nome, crea un nuovo ID e una copia modificabile indipendente. Se GitHub è collegato pubblica la nuova copia senza sovrascrivere l'originale.
- **☁ GitHub**: collega il tuo account tramite un *fine-grained personal access token* con permesso `Contents: Read and write` sul solo repository `azza0101/rambla-log`; mostra anche i progetti già pubblicati.

### Sicurezza
Il sito è un'app statica. L'autorizzazione del connettore GitHub di ChatGPT non passa automaticamente al sito. L'app chiede esplicitamente un token **solo se vuoi il salvataggio GitHub**. Il token vive esclusivamente nella memoria della scheda aperta e non viene inserito nel JSON, nel repository, nel localStorage o nell'IndexedDB. Se chiudi/ricarichi la scheda devi riconnetterti. **Non inserire segreti nel testo dei caroselli:** il repository è pubblico e i file JSON pubblicati saranno leggibili da chiunque.

### Dove finiscono i file
Ogni progetto pubblicato diventa:
`kura-editor/projects/saved/<projectId>.json`

Salva sullo **stesso percorso** per aggiornare un progetto esistente. La cronologia GitHub permette di recuperare le revisioni precedenti. **Salva con nome** crea un nuovo progetto con ID e percorso diversi.

### Link condivisibile
Il pannello GitHub mostra il link `?cloud=<projectId>`. In un nuovo dispositivo il link importa il JSON dal repository; nel browser originale, se esiste una copia locale con lo stesso ID, viene aperta la versione locale per non perdere le modifiche non ancora pubblicate.

### Se il salvataggio GitHub fallisce
L'editor conserva comunque il progetto locale. Riprova dopo aver verificato i permessi del token; in alternativa usa **Progetti → Esporta progetto** per scaricare un backup JSON.

## Collaborazione condivisa (KURA 3.8)

Due persone aprono lo stesso link `?cloud=<projectId>`. Entrambe devono avere un proprio token GitHub autorizzato a scrivere nel repository; **non condividere il medesimo token**. La connessione viene memorizzata soltanto nel proprio browser mediante WebCrypto AES-GCM con chiave non esportabile e IndexedDB, e si ripristina ai successivi accessi. **Non è una protezione contro JavaScript dannoso o estensioni che possano eseguire codice sulla stessa origine**: limitare il token al solo repository e ai permessi Contents necessari, con scadenza breve. Il pulsante **Scollega** elimina le credenziali salvate dal browser.

Dopo una modifica, cliccare **💾 Salva**. Il salvataggio cloud aggiorna lo stesso JSON e controlla il suo blob SHA contro la versione aperta: se un'altra persona ha già salvato un aggiornamento, il secondo salvataggio viene bloccato, senza sovrascrivere il suo lavoro. Usare **↻ Aggiorna dal cloud** per caricare la nuova versione (previa conferma), o **Salva con nome** per creare un progetto diverso. Il controllo non è ancora un merge delle modifiche: chi aggiorna il cloud sostituisce le pagine locali, quindi è bene salvare una copia prima se ci sono modifiche non pubblicate.

Il browser controlla gli aggiornamenti condivisi ogni 45 secondi, mostra un avviso non distruttivo e **non sostituisce mai automaticamente le pagine**. Il tasto **⟳ Aggiorna app** aggiorna invece il software e non va confuso con l'aggiornamento del progetto.

Il repository è pubblico: anche i JSON condivisi sono pubblici. Il collegamento `?cloud=<projectId>` funziona su dispositivi diversi; quando il progetto è già presente localmente, serve premere **Aggiorna dal cloud** per acquisire la versione remota. Le credenziali non vengono salvate sul server, sui file JSON o nel codice dell'app.

## Correzione collaborazione e recupero dati — Editor 4.5.2

**Se una collaboratrice ha modifiche ancora visibili nella scheda vecchia, esportare PRIMA un backup JSON e soltanto dopo aggiornare l'app.** Non chiudere né ricaricare la scheda finché il backup non esiste: la precedente versione 4.4.0 poteva leggere una risposta GitHub vecchia e ripristinare una copia locale.

L'editor 4.5.2 introduce:

- **Salvataggi locali serializzati:** un salvataggio IndexedDB in corso non può nascondere l'ultimo stato del progetto.
- **Stato GitHub persistente per progetto:** confronta SHA del contenuto remoto e hash della bozza locale; non permette overwrite se qualcun altro ha pubblicato una nuova revisione.
- **Aprire un link condiviso non sostituisce una bozza divergente:** il progetto remoto viene caricato automaticamente soltanto quando la copia locale coincide con la base nota. In caso contrario l'utente vede un avviso.
- **Backup prima del refresh distruttivo:** se si richiede manualmente la versione GitHub e la copia locale contiene modifiche, viene creata una copia indipendente in Progetti (prefisso «Backup prima di aggiornare dal cloud»). Il backup è accessibile anche dopo aver ricaricato la pagina.
- **Pubblicazione quasi live:** dopo 9 secondi di inattività da una modifica locale il progetto condiviso viene pubblicato su GitHub, quando la connessione è autorizzata e non ci sono conflitti. L'altro browser controlla ogni 10 secondi. Non è collaborazione CRDT lettera-per-lettera e non unisce automaticamente modifiche simultanee sullo stesso blocco.
- **Riepilogo variazioni:** sopra la tavola una barra mostra lo stato del cloud e gli ultimi campi modificati da un collaboratore. Gli aggiornamenti remoti vengono applicati automaticamente *solo se non ci sono modifiche locali non pubblicate*.
- **Backup manuale sempre visibile:** il pulsante «⤓ Backup JSON» accanto a Salva permette di scaricare una copia del progetto in qualsiasi momento, anche senza autorizzazione GitHub.
- **Nessun ritorno alla prima pagina dopo un refresh remoto:** rimane selezionata la tavola corrente, quando presente nella nuova versione.
- **Un vecchio risultato GitHub non può ripristinare una versione precedente:** il progetto remoto viene riletto dopo un eventuale salvataggio precedente al cambio progetto.

**Cosa fare nei conflitti:** NON aggiornare ripetutamente la pagina. Usa «⤓ Backup JSON», poi scegli «↻ Aggiorna dal cloud» per vedere la nuova versione; KURA conserva comunque una bozza recuperabile. Se vuoi mantenere due versioni separate usa «Salva con nome».

**Privacy:** il repository è pubblico e i JSON pubblicati lo sono altrettanto. I token restano nel browser, cifrati con WebCrypto e IndexedDB. Collaboratori diversi devono utilizzare credenziali individuali.

Test di regressione: `node kura-editor/tests/test-collaboration-safety.cjs` (protezione conflitti, copie di recupero, refresh, salvataggio e doppio commit). Il test è eseguito in CI assieme a quello dell'importatore brief.

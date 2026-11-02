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

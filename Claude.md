## Correzione avvio e stato offline (02/09/2026)
### Problema risolto
- L'app non mostrava dati e l'indicatore restava su Offline perché `app.js` conteneva un errore di sintassi: l'apostrofo in `l'app` chiudeva erroneamente una stringa.
- Il browser poteva inoltre mantenere in cache la versione non corretta dello script.

### Correzione implementata
- `app.js`: messaggio della modalità `file:` racchiuso tra doppi apici.
- `index.html`: aggiunto il versionamento `app.js?v=20260902` per forzare il caricamento della versione aggiornata.

### Verifica
- Parser JavaScript: sintassi valida.
- Browser locale: app caricata, richiesta password master visualizzata e stato passato a `Online`.
- Nessun dato remoto o configurazione Supabase modificato.
# Archivio Password Online - Diario di sviluppo

## Obiettivo
Creare un piccolo archivio personale per salvare le password con i campi:
- Descrizione
- Sito web
- User ID
- Password
- Note

L'applicazione deve essere semplice, sicura e pensata per essere ospitata solo su servizi gratuiti.

## Principi del progetto
- Nessun backend a pagamento
- Nessun servizio cloud costoso
- Uso di HTML, CSS e JavaScript vanilla per ridurre complessità e token di elaborazione
- Dati crittografati localmente nel browser prima di essere salvati
- Possibilità di esportazione/backup locale senza dipendenze esterne
- Sviluppo minimalista per contenere il costo computazionale e i token richiesti

## Stack scelto
- Frontend statico: HTML + CSS + JavaScript
- Storage: localStorage del browser con crittografia Web Crypto API
- Hosting gratuito: GitHub Pages o Netlify
- Nessun database esterno, nessun server backend, nessun servizio SaaS pagato

## Strategia di risparmio dei token
- Evitare framework pesanti e toolchain complessi
- Preferire un'app statica senza API esterne
- Mantenere i file piccoli e il codice leggibile
- Non usare modelli AI per elaborare i dati sensibili in cloud
- Limitare il numero di passaggi e librerie di terze parti

## 🎯 STATO ATTUALE - Sessione 02/09/2026

### ✅ Completato e Funzionante
1. **Frontend completo** con interfaccia a schede (cards)
   - Form "Nuova voce" con tutti i campi (Descrizione, Sito web, User ID, Password, Ultima modifica, Note)
   - Sezione "Credenziali salvate" con visualizzazione a schede eleganti
   - Timestamp automatico e modificabile per ogni voce

2. **Crittografia end-to-end**
   - AES-GCM con password master (PBKDF2, 100k iterazioni)
   - Salvataggio locale in localStorage crittografato
   - Nessuna password in chiaro nel browser

3. **Funzionalità UI avanzate**
   - Icone 📋 copia rapida nei campi User ID e Password
   - Pulsante "Copia scheda" per duplicare credenziali intere
   - Pulsante "Incolla" nel form e in lista per varianti veloci
   - Ricerca per descrizione/sito web
   - Modifiche/eliminazioni con conferma

4. **Integrazione Supabase (ATTIVA)**
   - Tabella `vault_entries` con un record per utente (user_id = 'local-user')
   - Crittografia completa prima di salvataggio in cloud
   - Sincronizzazione manuale con pulsante "Sincronizza"

5. **Multi-device avanzato** (Nuovo - 02/09/2026)
   - ✅ Sincronizzazione automatica all'avvio dell'app
   - ✅ Indicatore di stato online/offline nella topbar (4 stati: online, sinc, offline, errore)
   - ✅ Gestione conflitti di merge (confronto timestamp, richiesta conferma)
   - ✅ Backup crittografato (export con AES-GCM + metadata)
   - ✅ Import migliorato (supporta sia nuovo formato che vecchio JSON)

### 🔧 Come avviare il progetto
```powershell
# 1. Posizionati nella cartella
cd "c:\Users\gianf\OneDrive\Progetti VsCode\Archivio Password Online"

# 2. Avvia server locale
python -m http.server 8000

# 3. Apri browser
# http://localhost:8000

# 4. Inserisci password master (qualsiasi password)
# Il progetto è pronto!
```

### 🌐 URL Supabase configurato
- Progetto: `haisgaonnqazdbritjqt`
- URL: `https://haisgaonnqazdbritjqt.supabase.co`
- Tabella: `vault_entries`
- API: anonima (RLS abilitato per accesso completo)
- Piano: Gratuito ✅

### 📋 File del progetto
```
index.html          - Markup HTML, form e modal
app.js              - Logica app, crittografia, Supabase, sync
style.css           - Stili responsive, animazioni, topbar
config.js           - URL e chiave Supabase
supabase.sql        - Schema database (eseguito)
Claude.md           - Questo diario (storico modifiche)
README.md           - Documentazione utente
```

### 🚀 Prossimi step opzionali
- Aggiungere PWA (offline-first)
- Hosting su GitHub Pages/Netlify
- Autenticazione utente (multi-account)
- Backup automatico su cloud
- Versioning cronologico (history of changes)
- Sharing credenziali tra account

### ⚡ Problemi risolti nella sessione
1. Errore sintassi in config.js (virgola mancante) → Risolto
2. Bug async/await in init() → Risolto
3. Layout da tabella a schede → Completato
4. Spaziatura e cornici campi → Implementati
5. Icone copia e incolla → Funzionanti
6. Auto-sync all'avvio → Attivo

## Step di sviluppo
### 1. Struttura iniziale del progetto
- creare la struttura base dei file di frontend
- impostare le pagine HTML e CSS minimaliste

### 2. Modello dati
- definire il record password con i campi richiesti
- gestire aggiornamento, modifica ed eliminazione

### 3. Salvataggio locale sicuro
- aggiungere crittografia con password master
- salvare i dati in localStorage in modo protetto

### 4. Funzioni utente
- aggiungere ricerca per descrizione e sito web
- aggiungere copia password negli appunti
- aggiungere export/import JSON locale

### 5. Verifica e polish
- controllare la compatibilità browser
- ottimizzare la UI e la semplicità d'uso
- preparare la documentazione per l'uso

## Nuova direzione: versione multi-device
Dopo il primo prototipo locale, abbiamo deciso di passare alla seconda soluzione proposta: un archivio accessibile da più dispositivi mantenendo la privacy.

### Architettura definitiva prevista
- Frontend statico: HTML + CSS + JavaScript
- Hosting gratuito: GitHub Pages o Netlify
- Database gratuito: Supabase (tier gratuito)
- Crittografia: Web Crypto API nel browser, prima del salvataggio online
- Password master: unica chiave per aprire il vault
- Backup locale: export JSON criptato

### Perché questa scelta
- mantiene il progetto gratuito
- permette di accedere dai vari dispositivi
- continua a evitare backend complessi
- mantiene i dati crittografati prima di essere inviati al cloud

## Step di sviluppo della versione multi-device
### 1. Prototipo locale verificato
- struttura HTML/CSS/JS creata
- form per inserimento credenziali sviluppato
- salvataggio in localStorage implementato
- crittografia AES-GCM con password master aggiunta
- modale di input per evitare prompt non supportati

### 2. Migrazione verso il cloud gratuito
- creare un progetto gratuito su Supabase
- attivare il database Postgres incluso nel piano gratuito
- ottenere URL e chiave anonima del progetto
- collegare l’app frontend al servizio esterno

### 3. Salvataggio sicuro remoto
- cifrare i dati prima di inviarli a Supabase
- salvare solo payload crittografato e non le password in chiaro
- usare la password master come chiave di derivazione
- archiviare i record con un identificatore unico per ciascuna voce

### 4. Sincronizzazione tra dispositivi
- leggere i dati da Supabase sul caricamento dell’app
- confrontare la versione più recente tra dispositivo locale e cloud
- aggiornare la cache locale in modo semplice e affidabile
- evitare di sovrascrivere dati più recenti con versioni vecchie

### 5. Funzioni utente avanzate
- aggiungere pulsante "Sincronizza"
- aggiungere controllo su dati non aggiornati
- consentire export/import locale
- gestire il cambio della password master senza perdere il vault

### 6. Verifica e sicurezza
- testare su browser diversi
- verificare che la password master non venga memorizzata in chiaro
- verificare il comportamento con più dispositivi
- controllare la compatibilità con GitHub Pages o Netlify

## Spiegazione semplice dei passaggi
### 1. Frontend
Il frontend è la parte visibile dell’app: form, tabella, filtri e pulsanti. È scritto in JavaScript semplice senza framework.

### 2. Crittografia
Prima di inviare i dati al cloud, li trasformiamo in testo cifrato usando una password master. In questo modo, anche se qualcuno entrasse nel database, non leggerebbe nulla di utile senza la chiave.

### 3. Supabase
Supabase è un servizio gratuito che ci permette di avere un database online senza gestire un backend complesso. È utile per sincronizzare i dati tra telefono e PC.

### 4. Sincronizzazione
Quando l’app si apre, legge i dati dal cloud e li confronta con quelli locali. Se ci sono dati nuovi, li unisce in modo sicuro.

### 5. Semplicità e sicurezza
La regola è: niente dati in chiaro, niente backend costoso, niente complessità inutile. Più semplice è l’architettura, meno errori si fanno.

## Stato attuale
- Prototipo locale completato
- Crittografia e gestione dati implementate
- Problema di persistenza locale individuato e documentato
- Nuova fase: integrazione con database gratuito multi-device (Supabase)
- Decisione confermata: procedere con la seconda versione, più adatta a più dispositivi

## Prossimi step concretamente pianificati
### 1. Preparare il database Supabase gratuito
- creare un nuovo progetto gratuito su Supabase
- generare URL e anon key
- verificare che il database Postgres sia disponibile nel piano free

### 2. Definire la struttura dei dati
- creare una tabella `vault_entries`
- campi: id, user_id, description, website, user_id_field, password, notes, updated_at
- usare un identificatore univoco per ogni record

### 3. Collegare il frontend al database
- aggiungere script JavaScript per leggere e scrivere i dati
- usare `fetch` per inviare richieste al database tramite API di Supabase
- verificare che la configurazione sia corretta con URL e chiave anonima

### 4. Gestire la crittografia prima del salvataggio
- continuare a usare AES-GCM con la password master
- cifrare il payload completo prima di inviare a Supabase
- fare in modo che nel database non compaiano password in chiaro

### 5. Implementare sincronizzazione tra dispositivi
- leggere i dati dal cloud all’avvio dell’app
- confrontare i record locali con quelli remoti
- aggiornare solo i dati più recenti
- evitare sovrascritture accidentali

### 6. Aggiungere gestione utente moderna
- pulsante "Sincronizza"
- controllo se il dispositivo ha dati vecchi
- messaggi visibili in caso di conflitti
- cambio password master senza perdere i dati

### 7. Test finali
- verificare la sincronizzazione da PC e telefono
- controllare che la password master sia richiesta correttamente
- testare export/import locale
- validare compatibilità con hosting gratuito

## Note future
- scegliere il piano gratuito di Supabase e configurarlo correttamente
- aggiungere sincronizzazione multi-device in modo sicuro
- mantenere sempre la privacy come requisito principale
- evitare dipendenze esterne non necessarie

## Modifiche UI - Schede credenziali (02/09/2026)
### Problema risolto
Il layout con tabella era confuso e difficile da leggere. Le colonne erano troppo compresse e i dati non erano ordinati visivamente.

### Soluzione implementata
Convertito il layout da tabella a **schede (cards)** con struttura gerarchica:
- **Header della scheda**: titolo (descrizione) + data ultima modifica
- **Body della scheda**: campi organizzati in righe (label | valore)
- **Footer della scheda**: pulsanti di azione (Copia password, Modifica, Elimina)

### Cambiamenti specifici
1. **app.js**
   - Aggiunto campo `updated_at: new Date().toISOString()` ad ogni entry quando creata/modificata
   - Creata funzione `formatDate(isoString)` per formattare il timestamp in formato leggibile (GG/MM/YYYY HH:MM)
   - Riscritta `renderEntries()` per generare HTML di schede anziché righe di tabella
   - Ogni scheda mostra: descrizione (h3), data, sito web, user ID, password, note (se presente), pulsanti

2. **style.css**
   - Aggiunto `.entries-list` con flexbox column (colonna di schede)
   - Aggiunto `.credential-card` con border, padding, hover effect
   - Aggiunto `.card-header` con grid 2 colonne (descrizione + data)
   - Aggiunto `.card-body` con `.card-field` (grid 2 colonne: label | valore)
   - Aggiunto `.card-footer` con pulsanti d'azione
   - Formattazione speciale per `.password-value` (monospaced) e `.note-value` (preformattato)

3. **index.html**
   - Rimosso markup `<table>`, `<thead>`, `<tbody>`
   - Sostituito con `<div id="entriesBody" class="entries-list"></div>`
   - Le schede vengono generate dinamicamente da JavaScript

### Benefici
- Layout più leggibile e organizzato
- Timestamp visibile per tracciare le modifiche
- Responsivo e scalabile su diversi dispositivi
- Meno ingombro visivo rispetto alla tabella
- Migliore UX per leggere i dati lunghi (note, password, URL)

### Test consigliati
- Verificare la visualizzazione su desktop e mobile
- Testare con credenziali che hanno note lunghe
- Controllare che il timestamp si aggiorni quando si modifica una voce
- Verificare che la ricerca funzioni correttamente con le schede

## Miglioramenti UI - Controllo data e spaziatura (02/09/2026 - Iterazione 2)
### Problemi risolti
1. Non era possibile modificare la data di ultima modifica manualmente
2. Le etichette non erano chiare (User ID vs User Id:)
3. Il testo risultava affastellato senza spazi adeguati
4. I campi non avevano una cornice visibile per distinguerli

### Soluzione implementata
1. **Controllo data nel form "Nuova voce"**
   - Aggiunto campo `datetime-local` per permettere all'utente di selezionare/modificare la data
   - Se l'utente non specifica una data, viene usato il timestamp attuale automaticamente
   - Durante l'edit, il campo viene pre-compilato con la data attuale della voce

2. **Etichette esplicite in "Credenziali salvate"**
   - Cambiate le etichette da "User ID" a "User Id:" (con due punti)
   - Cambiate da "Password" a "Password:" (con due punti)
   - Le etichette sono ora coerenti e chiaramente separate dai valori

3. **Aumento della spaziatura**
   - Gap tra i campi: da 12px a 18px
   - Line-height nel card-value: aumentato da 1 a 1.6
   - Padding nei field-box: 10px 12px per più aria
   - Gap nella griglia card-field: da 12px a 14px

4. **Cornice sui campi**
   - Aggiunta classe `.field-box` con bordo 1px solid
   - Applicata a User Id, Password e Note
   - Sfondo leggero (#fbfcff) per migliorare contrasto
   - Border-radius: 8px per angoli arrotondati

### Cambiamenti tecnici specifici
1. **index.html**
   - Aggiunto `<input id="updatedAt" name="updatedAt" type="datetime-local" />` nel form

2. **app.js**
   - Aggiunto selettore `updatedAtInput` per il nuovo campo
   - Modificato `handleSubmit()` per gestire il valore della data da input o usare new Date()
   - Modificato `fillForm()` per popolare il campo data durante l'edit
   - Modificato `renderEntries()` per:
     - Mostrare etichette con due punti ("User Id:", "Password:")
     - Aggiungere classe `field-box` ai valori di User Id, Password e Note
     - Renderizzare condizionalmente i campi (mostrare solo se presenti)

3. **style.css**
   - Aumentato gap in `.card-body`: 12px → 18px
   - Aumentato gap in `.card-field`: 12px → 14px
   - Aumentata larghezza della label: 80px → 90px
   - Aggiunto line-height: 1.6 ai `.card-value`
   - Aggiunta classe `.field-box` con:
     - border: 1px solid var(--panel-border)
     - border-radius: 8px
     - padding: 10px 12px
     - background: #fbfcff

### Benefici
- Maggior controllo sulla data di modifica
- Testo meno affastellato e più leggibile
- Campi chiaramente identificati con cornice
- Layout più moderno e professionale
- Etichette coerenti e intuitive

### Test eseguiti
- ✓ Aggiunta voce con data custom
- ✓ Edit di voce con data precompilata
- ✓ Rendering corretti con etichette e cornici
- ✓ Rispetto di tutti i campi condizionali (note, sito web)

## Miglioramenti UI - Layout dei campi (02/09/2026 - Iterazione 3)
### Problemi risolti
1. Etichette e valori non erano sulla stessa riga
2. La cornice era solo sul valore, non sull'intero campo
3. Spaziatura tra le righe ancora insufficiente

### Soluzione implementata
1. **Etichette e valori sulla stessa riga**
   - Cambio grid-template-columns da `90px 1fr` a `auto 1fr`
   - Così l'etichetta occupa lo spazio necessario e il valore prende il resto
   - Aggiunto `white-space: nowrap` alle etichette per evitare a capo

2. **Cornice attorno all'intero campo**
   - Classe `field-box` applicata direttamente al `.card-field` anziché al `.card-value`
   - Questo racchiude sia l'etichetta che il valore in un unico riquadro
   - Applicata a: User Id, Password, Note
   - Background leggero e border arrotondato per chiarezza

3. **Aumento della spaziatura**
   - Gap tra i campi: 18px → 20px
   - Padding nei field-box: 10px 12px → 12px 14px
   - Line-height: 1.6 → 1.5 (mantenuto comunque leggibile)

### Cambiamenti tecnici specifici
1. **app.js**
   - Modificato `renderEntries()` per applicare classe `field-box` al `.card-field` anziché al `.card-value`
   - Esempio: `<div class="card-field field-box">` anziché `<div class="card-field"><div class="card-value field-box">`

2. **style.css**
   - Cambio grid da `grid-template-columns: 90px 1fr` a `grid-template-columns: auto 1fr`
   - Aggiunto `.card-field.field-box` con: border, border-radius, padding, background
   - Aumentato gap in `.card-body`: 18px → 20px
   - Aggiunto `white-space: nowrap` a `.card-field label`
   - Modificato `.password-value` con `word-break: break-all` per password lunghe

### Benefici
- Leggibilità migliorata: etichetta e valore sempre affiancati
- Campi chiaramente definiti da una singola cornice
- Migliore separazione visiva tra i campi
- Layout più compatto e ordinato

### Struttura finale di una scheda
```
┌─ Card Header ─────────────────────────────┐
│ Descrizione                Modificato: ... │
├───────────────────────────────────────────┤
│ ┌─ Campo 1 ──────────────────────────────┐ │
│ │ User Id:                userid@mail.it │ │
│ └────────────────────────────────────────┘ │
│ ┌─ Campo 2 ──────────────────────────────┐ │
│ │ Password:                 P@ssw0rd1234   │ │
│ └────────────────────────────────────────┘ │
│ ┌─ Campo 3 ──────────────────────────────┐ │
│ │ Note                  Note importanti    │ │
│ └────────────────────────────────────────┘ │
├─ Card Footer ──────────────────────────────┤
│ [Copia] [Modifica] [Elimina]               │
└────────────────────────────────────────────┘
```

## Funzionalità avanzate - Copia campi e schede (02/09/2026 - Iterazione 4)
### Problema risolto
Copiare User ID e Password da inserire in altre app richiedeva di selezionare manualmente il testo. Inoltre, quando più credenziali avevano valori uguali, era scomodo duplicarle.

### Soluzione implementata
1. **Icone copia rapida nei campi**
   - Aggiunte icone 📋 accanto a User Id e Password
   - Clic sull'icona copia il valore direttamente negli appunti
   - Icona cambia a ✓ per 1.2 secondi come conferma
   - Non interfere con il click sul campo stesso

2. **Copia scheda intera**
   - Pulsante "Copia password" rinominato in "Copia scheda"
   - Copia l'intera credenziale (descrizione, sito, user ID, password, note)
   - Assegna un nuovo ID alla copia per evitare conflitti
   - Mostra messaggio di conferma all'utente

3. **Incolla in nuova scheda**
   - Pulsante "Incolla in nuova scheda" appare dinamicamente quando una scheda è copiata
   - Crea una nuova entry con i dati copiati
   - Utile quando più credenziali hanno dati simili o identici
   - Timestamp automaticamente generato con data/ora corrente

### Cambiamenti tecnici specifici
1. **app.js**
   - Aggiunto stato globale `clipboardEntry` per memorizzare la scheda copiata
   - Modificato `renderEntries()` per generare icone copia nei campi User ID e Password
   - Aggiunto wrapper `.card-value-wrapper` attorno al valore e l'icona
   - Aggiunto `renderPasteButton()` per mostrare/nascondere dinamicamente il pulsante "Incolla"
   - Riscritta `handleRowAction()` per gestire:
     - `.copy-field`: copia il singolo campo negli appunti
     - `.copy`: copia l'intera scheda in memoria
     - `.edit` e `.delete`: comportamenti precedenti
   - Aggiunta funzione `handlePasteEntry()` per incollare una scheda copiata come nuova voce

2. **style.css**
   - Aggiunto `.card-value-wrapper` con flexbox e gap 8px
   - Aggiunto `.icon-btn` con stile minimalista (no border, solo hover effect)
   - Icona usa emoji 📋, cambia in ✓ al click
   - Hover mostra sfondo sottile per indicare cliccabilità
   - Active state con `transform: scale(0.95)` per feedback tattile

3. **index.html**
   - Nessuna modifica necessaria (pulsante Incolla generato dinamicamente)

### Flusso di utilizzo
```
1. Utente vede scheda con User ID | 📋 e Password | 📋
2. Click su 📋 accanto a User ID → copia negli appunti
3. Click su 📋 accanto a Password → copia negli appunti
4. Click su "Copia scheda" → memorizza intera credenziale
5. Bottone "Incolla in nuova scheda" appare in basso
6. Click su "Incolla in nuova scheda" → crea duplicato con nuovo ID
```

### Benefici
- Workflow più rapido per inserire credenziali in altre app
- Facile duplicare schede con dati comuni
- UX intuitiva con feedback immediato
- Separazione tra copia di singoli campi vs intera scheda

### Test consigliati
- Copiare User ID con icona e verificare nei clipboard
- Copiare Password con icona e verificare
- Copiare intera scheda e cliccare "Incolla" nel form
- Verificare che pulsante "Incolla" appaia solo se c'è una scheda copiata
- Testare con più schede copiate (stato aggiornato dinamicamente)
- Verificare che dati incollati nel form possono essere modificati
- Cliccare "Incolla in nuova scheda" per duplicare automaticamente
- Ricaricamento pagina deve nascondere il pulsante "Incolla"

## Miglioramento - Incolla nel form (02/09/2026 - Iterazione 5)
### Problema risolto
Il pulsante "Incolla in nuova scheda" compariva solo nella sezione credenziali, non nel form. Questo rendeva scomodo incollare e modificare dati prima di salvare.

### Soluzione implementata
1. **Pulsante "Incolla" nel form "Nuova voce"**
   - Aggiunto pulsante accanto a "Salva voce" e "Pulisci"
   - Appare dinamicamente solo quando una scheda è copiata
   - Nascosto per default con classe `.hidden`

2. **Due modalità di incolla**
   - **Incolla nel form**: riempie i campi per permettere modifiche prima di salvare (nuovo pulsante nel form)
   - **Incolla in nuova scheda**: crea subito una nuova voce nella lista (pulsante in credenziali salvate)

3. **Flusso migliorato**
   - Copia una scheda → pulsante "Incolla" appare nel form
   - Incolla nel form → modifica i dati e salva una variante
   - Oppure: incolla direttamente in lista con "Incolla in nuova scheda"

### Cambiamenti tecnici specifici
1. **index.html**
   - Aggiunto `<button id="formPasteBtn" class="secondary-btn hidden" type="button">Incolla</button>` nel form

2. **app.js**
   - Aggiunto selettore `formPasteBtn`
   - Creata funzione `handlePasteInForm()` che riempie i campi del form (non crea subito la voce)
   - Rinominata funzione precedente in `handlePasteInList()` per coerenza
   - Modificato `renderPasteButton()` per mostrare/nascondere il pulsante nel form
   - Aggiunto listener `formPasteBtn.addEventListener('click', handlePasteInForm)`

3. **style.css**
   - Aggiunta classe `.hidden` con `display: none !important`

### Benefici
- Workflow più flessibile: incolla nel form per modificare, o incolla direttamente in lista
- Pulsante "Incolla" sempre visibile nel posto giusto (nel form)
- Facile creare varianti di credenziali con dati comuni
- Stato dinamico: pulsante scompare se non c'è niente da incollare

### Test eseguiti
- ✓ Pulsante "Incolla" appare nel form quando scheda copiata
- ✓ Dati incollati compilano i campi correttamente
- ✓ Pulsante "Incolla" scompare dopo reload
- ✓ Due pulsanti "Incolla" in posti diversi (form vs lista)

## Funzionalità multi-device avanzate (02/09/2026 - Iterazione 6)

### Funzionalità implementate
1. **Sincronizzazione automatica all'avvio**
   - Al caricamento della pagina, l'app sincronizza automaticamente con Supabase
   - Carica i dati remoti se più recenti, altrimenti salva il locale in cloud
   - Funzione `syncWithSupabase()` integrata in `init()`

2. **Indicatore di stato online/offline**
   - Puntino colorato nella topbar con etichetta
   - Verde (Online): Supabase configurato e raggiungibile
   - Giallo (Sincronizzazione...): Sincronizzazione in corso
   - Grigio (Offline): Supabase non configurato
   - Rosso (Errore): Ultimo tentativo di sync fallito
   - Animazione pulse per indicare lo stato attivo

3. **Gestione dei conflitti di merge**
   - Confronta timestamp locale e remoto (con tolleranza 1 secondo)
   - Se il cloud è più recente, chiede conferma prima di sincronizzare
   - Prevent sovrascritture accidentali con dati vecchi
   - Dialog interattivo per risolvere conflitti

4. **Backup e restore migliorati**
   - Export: salva con crittografia AES-GCM (stesso metodo del cloud)
   - File incluso: version, exportDate, timestamp nel nome file
   - Import: supporta sia il nuovo formato (crittografato) che quello vecchio (JSON array)
   - Decrittazione automatica usando la password master

### Cambiamenti tecnici
1. **index.html**
   - Aggiunto elemento `.sync-status` nella topbar con `.status-dot` e `.status-text`
   - Wrapper `.topbar-right` per organizzare gli elementi in alto a destra

2. **app.js**
   - Nuova funzione `updateSyncStatus(status)` per aggiornare l'indicatore visivo
   - Modificato `syncWithSupabase()` per:
     - Mostrare stato "syncing" durante l'operazione
     - Confrontare timestamp e chiedere conferma se conflitto
     - Mostrare "synced" per 2 secondi, poi ritorna a "online"
   - Modificato `init()` per auto-sync al caricamento
   - Migliorato `exportEntries()` con:
     - Crittografia dei dati esportati
     - Metadata (versione, data, timestamp nel nome file)
   - Migliorato `importEntries()` con:
     - Supporto doppio formato (nuovo e vecchio)
     - Decrittazione automatica se file crittografato
     - Messaggi di errore dettagliati

3. **style.css**
   - Aggiunto `.topbar-right` con flex layout
   - Aggiunto `.sync-status` con background e stile badge
   - Aggiunto `.status-dot` con 4 varianti di colore
   - Aggiunta animazione `@keyframes pulse` per effetto visivo

### Benefici
- Sincronizzazione continua tra dispositivi
- Feedback visivo immediato dello stato
- Protezione da conflitti di merge
- Backup più sicuro (crittografato)
- UX moderna e intuitiva

### Test consigliati
- ✓ Aprire app → verifica auto-sync al caricamento
- ✓ Modificare da un dispositivo → sincronizza automaticamente su altro
- ✓ Creare conflitto: modifica locale + remota (differenti) → chiede conferma
- ✓ Esportare backup e verificare crittografia
- ✓ Importare backup crittografato e verificare ripristino
- ✓ Controllare indicatore di stato durante sincronizzazione

## PWA offline-first, cronologia modifiche e preparazione hosting (07/09/2026 - Iterazione 7)

### Obiettivo della sessione
Su richiesta dell'utente: rendere l'app installabile e utilizzabile offline, tenere uno storico delle modifiche per evitare sovrascritture/perdita di password, e preparare la pubblicazione gratuita online. Tutto documentato qui come richiesto ("registra sempre su Claude.md"), usando solo strumenti gratuiti.

### 1. PWA offline-first
- **manifest.json** (nuovo file): nome, colori tema, `display: standalone`, icone.
- **icon-192.png / icon-512.png** (nuovi file): icona a forma di lucchetto generata localmente con uno script Python puro (nessuna libreria esterna, nessun servizio a pagamento) — vedi `make_icon.py` nello scratchpad di sessione (non incluso nel progetto).
- **sw.js** (nuovo file): service worker con cache-first per gli asset dello stesso dominio (`index.html`, `style.css`, `app.js`, `config.js`, `manifest.json`, icone). Aggiorna la cache in background quando c'è rete; se offline, serve la copia in cache o ricade su `index.html`. Lo script di Supabase (CDN esterno) non viene cachato: se manca la rete, il tag `<script>` fallisce silenziosamente e l'app continua a funzionare in locale (il codice già gestisce `window.supabase` assente).
- **index.html**: aggiunto `<link rel="manifest">`, `<meta name="theme-color">`, icone (favicon + apple-touch-icon). Versione di `app.js` aggiornata a `?v=20260907` per invalidare la cache del browser.
- **app.js**: nuova funzione `registerServiceWorker()`, chiamata in `init()` (non si registra se aperto da `file:`).

Effetto pratico: da un browser compatibile (Chrome/Edge/Android) l'app può essere "installata" (icona lucchetto) e riaperta anche senza connessione — i dati restano quelli già in `localStorage`, cifrati come prima. La sincronizzazione con Supabase resta disponibile solo quando c'è rete.

### 2. Cronologia modifiche (evita sovrascritture e permette di recuperare password precedenti)
- Ogni voce (`entry`) ha ora un campo `history`: array di versioni precedenti (`description`, `website`, `userId`, `password`, `notes`, `updated_at`, `archivedAt`), salvato **cifrato insieme al resto del vault** (nessuna modifica allo schema Supabase: è tutto dentro lo stesso `vault_json`).
- Quando si modifica una voce esistente e i dati sono effettivamente cambiati, la versione precedente viene aggiunta in cima a `history` (funzione `hasEntryChanged` + `snapshotEntry`). Limite di sicurezza: massimo `MAX_HISTORY = 20` versioni per voce (le più vecchie vengono scartate).
- Nuovo pulsante **"Cronologia (N)"** nel footer della scheda (visibile solo se esistono versioni precedenti) → apre un modal con l'elenco delle versioni passate e un pulsante **"Ripristina questa versione"** per ciascuna. Il ripristino salva la versione attuale in cronologia prima di sovrascrivere (nessun dato viene mai perso).
- **Avviso password duplicate**: al salvataggio, se la password inserita è già usata da un'altra voce, l'app chiede conferma prima di procedere ("Questa password è già usata per..."), per scoraggiare il riutilizzo involontario delle password.
- Nuovo modal dedicato `#historyModal` in `index.html`, stili `.history-*` in `style.css`.
- Compatibilità: i backup/voci vecchie senza campo `history` continuano a funzionare (trattate come nessuna cronologia).

### 3. Hosting gratuito (GitHub Pages) — ATTIVO ✅
- Repository: `https://github.com/cuccu-pi/archivio-password-online`
- Sito pubblicato: **https://cuccu-pi.github.io/archivio-password-online/**
- Configurazione: Pages da branch `main`, cartella `/ (root)`.
- Verificato che tutti gli asset (index.html, style.css, app.js, manifest.json, sw.js, icone, config.js) rispondono con HTTP 200 in produzione.
- Nota di sicurezza: `config.js` contiene l'URL Supabase e la **anon key** pubblica (non un segreto per definizione, ma comunque legata al progetto). Va bene pubblicarla su un repo pubblico perché l'accesso è protetto solo dalla password master lato client (i dati sono cifrati prima di arrivare a Supabase).
- Per aggiornamenti futuri: modificare i file localmente, `git add`/`git commit`/`git push` sul branch `main` → GitHub Pages ripubblica automaticamente in 1-2 minuti. Ricordarsi di alzare il numero di versione in `index.html` (`app.js?v=...`) quando si cambia `app.js`, altrimenti il service worker potrebbe servire la cache vecchia.

### File aggiornati/aggiunti in questa iterazione
```
manifest.json    - nuovo, configurazione PWA
sw.js            - nuovo, service worker offline
icon-192.png     - nuovo, icona PWA piccola
icon-512.png     - nuovo, icona PWA grande
index.html       - link manifest/icone, versione app.js, modal cronologia
app.js           - cronologia modifiche, avviso password duplicate, service worker
style.css        - stili cronologia e pulsante "Cronologia"
```

### Test consigliati
- Modificare una voce e verificare che compaia il pulsante "Cronologia (1)"
- Ripristinare una versione precedente e controllare che quella attuale finisca in cronologia
- Salvare una nuova voce con una password già usata → verificare l'avviso di conferma
- Disattivare la rete (DevTools → Offline) e ricaricare l'app → deve continuare a funzionare con i dati locali
- Verificare in DevTools → Application → Manifest/Service Workers che l'app risulti installabile

### Prossimi step
- Verificare il funzionamento PWA da smartphone (installazione su home screen) sull'URL pubblico
- Valutare, se utile in futuro, un log delle voci eliminate (non solo modificate)

## ⚠️ Bug critico corretto - sincronizzazione poteva svuotare il cloud (07/09/2026 - Iterazione 8)

### Problema riscontrato
Dopo aver pubblicato l'app su GitHub Pages, l'utente ha aperto il nuovo URL pubblico e non ha visto nessuna credenziale salvata. Verifica diretta su Supabase (solo metadati, senza decifrare i contenuti): il record cloud conteneva un vault vuoto (`[]`), aggiornato proprio nel momento in cui l'app pubblica era stata aperta per la prima volta.

### Causa
In `syncWithSupabase()`, la sincronizzazione confrontava l'orario "adesso" (`new Date()` calcolato al momento del confronto) con l'orario dell'ultima modifica remota, invece di usare l'orario reale dell'ultima modifica *locale*. Aprendo l'app da un'origine nuova (`https://cuccu-pi.github.io/...`, diversa da `http://localhost:8000` usato finora — il `localStorage` del browser è isolato per origine) il vault locale risultava vuoto. Il confronto "adesso > orario remoto" risultava quasi sempre vero, quindi l'app decideva di "salvare il locale nel cloud" — cioè sovrascriveva silenziosamente il cloud con un array vuoto, senza alcuna conferma.

Verifica del file di backup scaricato dall'utente (`password-vault-backup-2026-09-07.json`): anche quello conteneva un vault vuoto, quindi non è stato possibile determinare con certezza se esistessero credenziali reali già perse in precedenza, oppure se il vault non avesse ancora dati reali inseriti in modo permanente.

### Correzione implementata in `app.js`
1. **Nuova chiave `LOCAL_UPDATED_KEY`** (`password-vault-updated-at`) in `localStorage`: registra il momento reale dell'ultima modifica del vault locale, aggiornata da `saveVault()` ad ogni salvataggio.
2. **Regola di sicurezza aggiunta in `syncWithSupabase()`**: se il vault locale è vuoto e quello remoto non lo è, l'app **adotta sempre i dati dal cloud**, senza eccezioni — non usa più il confronto per timestamp in questo caso, perché un locale vuoto non deve mai poter vincere su un cloud pieno.
3. Il confronto per timestamp (con richiesta di conferma se il cloud sembra più recente) resta attivo solo quando **entrambi** i vault (locale e remoto) contengono già dati, usando ora l'orario reale dell'ultima modifica locale invece di "adesso".
4. Versione di `app.js` in `index.html` alzata a `?v=20260907b` per forzare l'aggiornamento della cache del service worker su tutti i dispositivi che avevano già visitato l'app.

### Impatto pratico
- Aprire l'app per la prima volta su un nuovo dispositivo/browser ora scarica correttamente i dati dal cloud invece di rischiare di azzerarli.
- Se in futuro compare un vault locale vuoto rispetto a un cloud pieno, l'app non chiede nemmeno conferma: adotta il cloud in automatico, perché non c'è alcuno scenario in cui sovrascriverlo con il vuoto sia la scelta giusta.

### Stato dei dati al momento della scoperta
- Cloud Supabase: vault vuoto (confermato via API, solo dimensioni/metadati, nessuna password letta in chiaro)
- Backup scaricato dall'utente: vault vuoto
- Da verificare con l'utente: se `localStorage` su `http://localhost:8000` (browser/PC originale) contiene ancora credenziali reali mai sincronizzate col cloud — in tal caso, con la correzione applicata, aprire l'app lì le ripristinerà automaticamente anche sul cloud.

### Lezione per il futuro
- Mai confrontare "adesso" con un timestamp salvato altrove per decidere una sovrascrittura distruttiva: usare sempre l'orario reale dell'ultimo evento locale.
- Un'operazione che può cancellare dati (push che sovrascrive un cloud pieno) dovrebbe sempre avere una condizione di sicurezza esplicita ("non farlo se il locale è vuoto"), non solo un confronto numerico tra date.

### Esito verificato con l'utente
- Confermato con l'utente: il vault non conteneva ancora password reali (l'app era ancora in fase di test/configurazione), quindi **nessun dato è stato perso**. L'allarme era comunque giustificato: il bug era reale e avrebbe potuto cancellare dati veri in futuro.
- Dopo aver ricaricato `http://localhost:8000` con il codice corretto, la sincronizzazione funziona senza errori (mostra correttamente un elenco vuoto, in modo coerente su locale e cloud).
- Incidente chiuso. Prossimo passo: aggiungere una prima voce reale e verificare l'intero flusso (salvataggio → sync cloud → apertura da GitHub Pages → cronologia → avviso duplicati).
- Test end-to-end eseguito dall'utente con una voce di prova: salvataggio, sync e visualizzazione funzionano correttamente.

## Importazione da vecchio database Access (08/09/2026 - Iterazione 9)

### Obiettivo
L'utente aveva un vecchio archivio di password in un file Microsoft Access, su un NAS di rete, e voleva portarlo nel nuovo Archivio Password Online invece di reinserire tutto a mano.

### File sorgente
- Percorso: `\\NAS-56-44-00\Backup_01\Old_BackUp_01\Passwords\Password (2).accdb`
- Il database conteneva più tabelle: `Foglio1` (47 righe), `Foglio2` (70 righe, colonne generiche `Campo1/2/3`, non credenziali), `Tabella password` (218 righe, con colonne `Descrizione`, `indirizzo_web`, `User_ID`, `Password`, `note`, `Data`), `Tabella password 01` (124 righe, stessa struttura ma senza data).
- Su indicazione dell'utente, importata solo **"Tabella password"** (218 voci); ignorati gli altri fogli.

### Metodo usato (solo strumenti già presenti su Windows, nessun software aggiuntivo)
- Verificato che il driver ODBC "Microsoft Access Driver (*.mdb, *.accdb)" e il provider OLE DB `Microsoft.ACE.OLEDB.12.0` sono già disponibili sul PC (installati con Office).
- Lettura del database in sola consultazione tramite PowerShell + COM `ADODB.Connection`/`ADODB.Recordset` (nessuna libreria esterna, nessuna scrittura sul file Access originale).
- **Nessun dato sensibile è stato mostrato in chat**: prima ispezionata solo la struttura (nomi tabelle e colonne) e il conteggio righe, mai i valori delle password.
- Script `export_access.ps1` (nella cartella temporanea di sessione, non nel progetto): legge `Tabella password` e genera un file JSON nel "formato vecchio" già supportato da `importEntries()` in `app.js` (semplice array di oggetti `{ id, description, website, userId, password, notes, updated_at }`), con un nuovo GUID generato per ogni voce come `id`.
- File generato: `import-da-access.json`, copiato in `Downloads` per essere selezionabile dal pulsante **Importa** dell'app.
- Validazione automatica (conteggio voci, chiavi presenti, nessuna voce senza descrizione/password) senza stampare i contenuti reali.

### Punto di attenzione comunicato all'utente
- Il pulsante **Importa** dell'app **sostituisce** l'intero archivio corrente, non lo unisce: eventuali voci già presenti (es. quella di test della sessione precedente) vengono perse nell'importazione.
- Il file `import-da-access.json` contiene le 218 password **in chiaro** (non cifrato): da eliminare da `Downloads` subito dopo l'importazione riuscita, per non lasciare un file sensibile non protetto sul disco.

### Stato
- File di importazione generato e verificato strutturalmente (218 voci, tutte con descrizione e password compilate).
- In attesa che l'utente esegua l'importazione dall'app e confermi l'esito.

### Idea per il futuro
- Se servisse ripetere l'operazione (es. anche per "Tabella password 01" o per un altro file Access), lo script `export_access.ps1` è riutilizzabile cambiando solo il nome della tabella e il percorso del file `.accdb` di origine.




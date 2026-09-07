# Archivio Password Online

Un piccolo archivio personale per memorizzare password, credenziali e note in modo semplice e sicuro.

🌐 **App online**: https://cuccu-pi.github.io/archivio-password-online/

## Funzioni principali
- Descrizione
- Sito web
- User ID
- Password
- Note
- Ricerca rapida
- Copia password negli appunti
- Export locale dei dati

## Requisiti
- un browser moderno
- nessuna installazione da parte dell'utente

## Esecuzione locale
Per una persistenza affidabile, apri l’app tramite un server locale e non direttamente dal file `index.html`:

```bash
python -m http.server 8000
```

Poi apri:

```text
http://localhost:8000
```

> Aprire il file `index.html` direttamente può causare problemi di persistenza del browser con `localStorage` e far perdere i dati salvati.

## Sicurezza
I dati sono salvati nel browser tramite `localStorage` dopo essere stati crittografati con una password master. Questo mantiene i dati fuori da backend e servizi cloud esterni.

## Multi-device e offline
L'app è accessibile da più dispositivi usando Supabase come database gratuito:
- l'app rimane statica
- i dati vengono crittografati nel browser
- il cloud viene usato solo come contenitore sicuro per i record criptati
- la password master resta il punto di accesso principale

È anche installabile come PWA (icona lucchetto nella barra degli indirizzi o menu "Installa app") e funziona offline grazie a un service worker: i dati locali restano disponibili anche senza connessione, la sincronizzazione riprende automaticamente quando torna la rete.

## Cronologia modifiche
Ogni volta che una voce viene modificata, la versione precedente viene conservata (fino a 20 versioni per voce) e può essere consultata o ripristinata dal pulsante "Cronologia" sulla scheda. Se si prova a salvare una password già usata per un'altra voce, l'app avvisa prima di procedere.

## Hosting gratuito
Il sito può essere pubblicato gratuitamente su:
- GitHub Pages
- Netlify

## Database gratuito consigliato
Per una versione multi-device, la scelta più semplice è:
- Supabase (gratis per uso personale)

## Nota sul risparmio dei token
Il progetto è stato pensato come app statica e locale per evitare runtime costosi, servizi esterni e processi inutili. In questo modo si riduce il consumo di risorse e si semplifica l'uso. La versione multi-device manterrà lo stesso principio: pochi componenti, nessun backend pesante e crittografia locale.

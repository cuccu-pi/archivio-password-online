# Archivio Password Online

Un piccolo archivio personale per memorizzare password, credenziali e note in modo semplice e sicuro.

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

## Nuova versione: multi-device
La prossima evoluzione sarà un archivio accessibile da più dispositivi usando un database gratuito come Supabase. In questo modello:
- l’app rimane statica
- i dati vengono crittografati nel browser
- il cloud viene usato solo come contenitore sicuro per i record criptati
- la password master resta il punto di accesso principale

## Hosting gratuito
Il sito può essere pubblicato gratuitamente su:
- GitHub Pages
- Netlify

## Database gratuito consigliato
Per una versione multi-device, la scelta più semplice è:
- Supabase (gratis per uso personale)

## Nota sul risparmio dei token
Il progetto è stato pensato come app statica e locale per evitare runtime costosi, servizi esterni e processi inutili. In questo modo si riduce il consumo di risorse e si semplifica l'uso. La versione multi-device manterrà lo stesso principio: pochi componenti, nessun backend pesante e crittografia locale.

const STORAGE_KEY = 'password-vault-encrypted';
const MASTER_KEY = 'password-vault-master';
const MAX_HISTORY = 20;

let entries = [];
let editingId = null;
let masterPassword = '';
let supabaseClient = null;
let clipboardEntry = null;

const SUPABASE_TABLE = 'vault_entries';
const vaultConfig = window.PASSWORD_VAULT_CONFIG || {};

function initSupabaseClient() {
  if (!vaultConfig.supabaseUrl || !vaultConfig.supabaseAnonKey || !window.supabase) {
    return null;
  }

  try {
    supabaseClient = window.supabase.createClient(vaultConfig.supabaseUrl, vaultConfig.supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.warn('Supabase config error:', error);
    return null;
  }
}

async function pushVaultToSupabase() {
  if (!supabaseClient) {
    return;
  }

  const encryptedVault = await encryptValue(JSON.stringify(entries), masterPassword);
  const payload = JSON.stringify(encryptedVault);
  const userId = 'local-user';

  const { error } = await supabaseClient
    .from(SUPABASE_TABLE)
    .upsert({
      user_id: userId,
      vault_json: payload,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    throw error;
  }
}

async function syncWithSupabase() {
  if (!supabaseClient) {
    await showAlert('Sincronizzazione', 'Supabase non è configurato. Aggiorna config.js con URL e anon key del tuo progetto gratuito.');
    return;
  }

  try {
    updateSyncStatus('syncing');
    
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLE)
      .select('user_id, vault_json, updated_at')
      .eq('user_id', 'local-user')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    const latestRemote = Array.isArray(data) && data.length > 0 ? data[0] : null;
    const localTimestamp = new Date().toISOString();

    // Gestione conflitti: confronta timestamp
    if (latestRemote && latestRemote.vault_json) {
      const remoteEncrypted = JSON.parse(latestRemote.vault_json);
      const remotePayload = await decryptValue(remoteEncrypted, masterPassword);
      const remoteEntries = JSON.parse(remotePayload);

      const localTime = Number(new Date(localTimestamp));
      const remoteTime = Number(new Date(latestRemote.updated_at || 0));

      // Se il remoto è più recente di più di 1 secondo, chiedi conferma
      if (remoteTime > localTime + 1000) {
        const result = await showConfirm('Sincronizzazione', 'Il cloud ha dati più recenti. Vuoi sincronizzare i dati dal cloud?');
        if (result && result.action === 'confirm') {
          entries = remoteEntries;
          await saveVault();
          renderEntries();
          updateSyncStatus('synced');
          await showAlert('Sincronizzazione', 'Dati sincronizzati dal cloud.');
          return;
        }
      }
    }

    // Salva i dati locali nel cloud
    await pushVaultToSupabase();
    await saveVault();
    renderEntries();
    updateSyncStatus('synced');
    await showAlert('Sincronizzazione', 'Dati sincronizzati correttamente con Supabase.');
  } catch (error) {
    console.error(error);
    updateSyncStatus('error');
    await showAlert('Errore', 'Sincronizzazione fallita. Controlla la configurazione di Supabase.');
  }
}

function updateSyncStatus(status) {
  if (status === 'syncing') {
    statusDot.className = 'status-dot syncing';
    statusText.textContent = 'Sincronizzazione...';
  } else if (status === 'synced') {
    statusDot.className = 'status-dot online';
    statusText.textContent = 'Sincronizzato';
    setTimeout(() => {
      if (supabaseClient) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'Online';
      }
    }, 2000);
  } else if (status === 'error') {
    statusDot.className = 'status-dot error';
    statusText.textContent = 'Errore';
  } else if (status === 'online') {
    statusDot.className = 'status-dot online';
    statusText.textContent = 'Online';
  } else {
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Offline';
  }
}

const entryForm = document.querySelector('#entryForm');
const entriesBody = document.querySelector('#entriesBody');
const searchInput = document.querySelector('#searchInput');
const descriptionInput = document.querySelector('#description');
const websiteInput = document.querySelector('#website');
const userIdInput = document.querySelector('#userId');
const passwordInput = document.querySelector('#password');
const updatedAtInput = document.querySelector('#updatedAt');
const notesInput = document.querySelector('#notes');
const submitBtn = document.querySelector('#submitBtn');
const resetBtn = document.querySelector('#resetBtn');
const changeMasterBtn = document.querySelector('#changeMasterBtn');
const exportBtn = document.querySelector('#exportBtn');
const syncBtn = document.querySelector('#syncBtn');
const importInput = document.querySelector('#importInput');
const formPasteBtn = document.querySelector('#formPasteBtn');
const modal = document.querySelector('#appModal');
const historyModal = document.querySelector('#historyModal');
const historyList = document.querySelector('#historyList');
const historyCloseBtn = document.querySelector('#historyCloseBtn');
const syncStatus = document.querySelector('#syncStatus');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const modalTitle = document.querySelector('#modalTitle');
const modalMessage = document.querySelector('#modalMessage');
const modalFieldWrap = document.querySelector('#modalFieldWrap');
const modalFieldLabel = document.querySelector('#modalFieldLabel');
const modalInput = document.querySelector('#modalInput');
const modalCancelBtn = document.querySelector('#modalCancelBtn');
const modalConfirmBtn = document.querySelector('#modalConfirmBtn');

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptValue(value, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(value);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  return {
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encrypted)
  };
}

async function decryptValue(encryptedPayload, password) {
  const key = await deriveKey(password, base64ToArrayBuffer(encryptedPayload.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(encryptedPayload.iv));
  const data = base64ToArrayBuffer(encryptedPayload.data);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

function showModal({ title, message, inputLabel = '', inputType = 'text', defaultValue = '', confirmText = 'OK', showCancel = true }) {
  return new Promise((resolve) => {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalInput.type = inputType;
    modalInput.value = defaultValue;

    if (inputLabel) {
      modalFieldWrap.classList.remove('hidden');
      modalFieldLabel.textContent = inputLabel;
    } else {
      modalFieldWrap.classList.add('hidden');
    }

    modalConfirmBtn.textContent = confirmText;
    modalCancelBtn.style.display = showCancel ? 'inline-flex' : 'none';
    modal.classList.remove('hidden');
    modalInput.focus();
    modalInput.select();

    const close = (value) => {
      modal.classList.add('hidden');
      modalCancelBtn.onclick = null;
      modalConfirmBtn.onclick = null;
      modalInput.onkeydown = null;
      resolve(value);
    };

    modalCancelBtn.onclick = () => close({ action: 'cancel', value: '' });
    modalConfirmBtn.onclick = () => close({ action: 'confirm', value: modalInput.value });
    modalInput.onkeydown = (event) => {
      if (event.key === 'Enter') {
        close({ action: 'confirm', value: modalInput.value });
      }
      if (event.key === 'Escape') {
        close({ action: 'cancel', value: '' });
      }
    };
  });
}

function showAlert(title, message) {
  return showModal({ title, message, inputLabel: '', showCancel: false, confirmText: 'Chiudi' });
}

function showConfirm(title, message) {
  return showModal({ title, message, inputLabel: '', showCancel: true, confirmText: 'Conferma' });
}

async function ensureMasterPassword() {
  const existing = sessionStorage.getItem(MASTER_KEY);
  if (existing) {
    masterPassword = existing;
    return true;
  }

  const result = await showModal({
    title: 'Password master',
    message: 'Inserisci la password master per aprire l’archivio. Se è la prima volta, crea una nuova password.',
    inputLabel: 'Password master',
    inputType: 'password',
    showCancel: false,
    confirmText: 'Apri archivio'
  });

  if (!result || result.action !== 'confirm' || !result.value || result.value.trim() === '') {
    await showAlert('Errore', 'La password master è obbligatoria.');
    return false;
  }

  masterPassword = result.value.trim();
  sessionStorage.setItem(MASTER_KEY, masterPassword);
  return true;
}

async function saveVault() {
  if (!masterPassword) {
    return;
  }

  const payload = await encryptValue(JSON.stringify(entries), masterPassword);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function loadVault() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    entries = [];
    renderEntries();
    return;
  }

  const encryptedPayload = JSON.parse(raw);
  try {
    const decrypted = await decryptValue(encryptedPayload, masterPassword);
    entries = JSON.parse(decrypted);
  } catch (error) {
    await showAlert('Errore', 'Password master errata. Riprova.');
    sessionStorage.removeItem(MASTER_KEY);
    masterPassword = '';
    window.location.reload();
  }

  renderEntries();
}

function getFilteredEntries() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (!searchTerm) {
    return entries;
  }

  return entries.filter((entry) => {
    const text = [entry.description, entry.website, entry.userId, entry.notes].join(' ').toLowerCase();
    return text.includes(searchTerm);
  });
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function snapshotEntry(entry) {
  return {
    description: entry.description,
    website: entry.website,
    userId: entry.userId,
    password: entry.password,
    notes: entry.notes,
    updated_at: entry.updated_at,
    archivedAt: new Date().toISOString()
  };
}

function hasEntryChanged(previousEntry, candidate) {
  return previousEntry.description !== candidate.description
    || previousEntry.website !== candidate.website
    || previousEntry.userId !== candidate.userId
    || previousEntry.password !== candidate.password
    || previousEntry.notes !== candidate.notes;
}

function showHistory(entry) {
  const versions = [...(entry.history || [])].reverse();
  historyList.innerHTML = '';

  if (versions.length === 0) {
    historyList.innerHTML = '<p class="empty-state">Nessuna versione precedente salvata.</p>';
  } else {
    versions.forEach((version, index) => {
      const originalIndex = entry.history.length - 1 - index;
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-item-header">
          <strong>Versione del ${formatDate(version.archivedAt)}</strong>
        </div>
        <div class="history-item-body">
          ${version.website ? `<div class="history-field"><label>Sito web</label><span>${escapeHtml(version.website)}</span></div>` : ''}
          ${version.userId ? `<div class="history-field"><label>User Id</label><span>${escapeHtml(version.userId)}</span></div>` : ''}
          <div class="history-field"><label>Password</label><span class="password-value">${escapeHtml(version.password || '—')}</span></div>
          ${version.notes ? `<div class="history-field"><label>Note</label><span>${escapeHtml(version.notes)}</span></div>` : ''}
        </div>
        <div class="history-item-actions">
          <button class="action-btn restore-version" type="button" data-index="${originalIndex}">Ripristina questa versione</button>
        </div>
      `;
      historyList.appendChild(item);
    });
  }

  historyModal.dataset.entryId = entry.id;
  historyModal.classList.remove('hidden');
}

async function handleRestoreVersion(event) {
  const button = event.target.closest('.restore-version');
  if (!button) {
    return;
  }

  const entryId = historyModal.dataset.entryId;
  const entry = entries.find((item) => item.id === entryId);
  if (!entry) {
    return;
  }

  const historyIndex = Number(button.dataset.index);
  const versionToRestore = entry.history ? entry.history[historyIndex] : null;
  if (!versionToRestore) {
    return;
  }

  const confirmRestore = await showConfirm('Ripristina versione', `Ripristinare i dati alla versione del ${formatDate(versionToRestore.archivedAt)}? La versione attuale verrà salvata in cronologia.`);
  if (!confirmRestore || confirmRestore.action !== 'confirm') {
    return;
  }

  const newHistory = [...(entry.history || []), snapshotEntry(entry)].slice(-MAX_HISTORY);
  const restoredEntry = {
    ...entry,
    description: versionToRestore.description,
    website: versionToRestore.website,
    userId: versionToRestore.userId,
    password: versionToRestore.password,
    notes: versionToRestore.notes,
    updated_at: new Date().toISOString(),
    history: newHistory
  };

  entries = entries.map((item) => (item.id === entry.id ? restoredEntry : item));
  await saveVault();
  renderEntries();
  historyModal.classList.add('hidden');
  await showAlert('Completato', 'Versione ripristinata correttamente.');
}

function renderEntries() {
  const filteredEntries = getFilteredEntries();
  entriesBody.innerHTML = '';

  if (filteredEntries.length === 0) {
    entriesBody.innerHTML = '<div class="empty-state">Nessuna voce trovata.</div>';
    return;
  }

  filteredEntries.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'credential-card';
    card.innerHTML = `
      <div class="card-header">
        <h3>${escapeHtml(entry.description)}</h3>
        <div class="card-date">Modificato: ${formatDate(entry.updated_at)}</div>
      </div>
      <div class="card-body">
        ${entry.website ? `
        <div class="card-field">
          <label>Sito web</label>
          <div class="card-value"><a href="${escapeHtml(entry.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.website)}</a></div>
        </div>
        ` : ''}
        ${entry.userId ? `
        <div class="card-field field-box">
          <label>User Id:</label>
          <div class="card-value-wrapper">
            <div class="card-value">${escapeHtml(entry.userId)}</div>
            <button class="icon-btn copy-field" type="button" data-id="${entry.id}" data-field="userId" title="Copia negli appunti">📋</button>
          </div>
        </div>
        ` : ''}
        <div class="card-field field-box">
          <label>Password:</label>
          <div class="card-value-wrapper">
            <div class="card-value password-value">${escapeHtml(entry.password || '—')}</div>
            <button class="icon-btn copy-field" type="button" data-id="${entry.id}" data-field="password" title="Copia negli appunti">📋</button>
          </div>
        </div>
        ${entry.notes ? `
        <div class="card-field field-box">
          <label>Note</label>
          <div class="card-value note-value">${escapeHtml(entry.notes)}</div>
        </div>
        ` : ''}
      </div>
      <div class="card-footer">
        <button class="action-btn copy" type="button" data-id="${entry.id}">Copia scheda</button>
        <button class="action-btn edit" type="button" data-id="${entry.id}">Modifica</button>
        ${entry.history && entry.history.length > 0 ? `<button class="action-btn history" type="button" data-id="${entry.id}">Cronologia (${entry.history.length})</button>` : ''}
        <button class="action-btn delete" type="button" data-id="${entry.id}">Elimina</button>
      </div>
    `;
    entriesBody.appendChild(card);
  });

  renderPasteButton();
}

function renderPasteButton() {
  const existingPasteBtn = document.querySelector('#pasteBtn');
  if (existingPasteBtn) {
    existingPasteBtn.remove();
  }

  if (clipboardEntry) {
    // Mostra pulsante nel form
    formPasteBtn.classList.remove('hidden');
    
    // Crea pulsante in list-actions
    const listActions = document.querySelector('.list-actions');
    const pasteBtn = document.createElement('button');
    pasteBtn.id = 'pasteBtn';
    pasteBtn.className = 'secondary-btn';
    pasteBtn.type = 'button';
    pasteBtn.textContent = 'Incolla in nuova scheda';
    pasteBtn.addEventListener('click', handlePasteInList);
    listActions.appendChild(pasteBtn);
  } else {
    // Nasconde pulsante nel form
    formPasteBtn.classList.add('hidden');
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resetForm() {
  entryForm.reset();
  editingId = null;
  submitBtn.textContent = 'Salva voce';
}

function fillForm(entry) {
  descriptionInput.value = entry.description;
  websiteInput.value = entry.website;
  userIdInput.value = entry.userId;
  passwordInput.value = entry.password;
  if (entry.updated_at) {
    const date = new Date(entry.updated_at);
    updatedAtInput.value = date.toISOString().slice(0, 16);
  } else {
    updatedAtInput.value = '';
  }
  notesInput.value = entry.notes;
  editingId = entry.id;
  submitBtn.textContent = 'Aggiorna voce';
  descriptionInput.focus();
}

async function handleSubmit(event) {
  event.preventDefault();

  let updatedAtValue = updatedAtInput.value;
  if (updatedAtValue) {
    updatedAtValue = new Date(updatedAtValue).toISOString();
  } else {
    updatedAtValue = new Date().toISOString();
  }

  const candidate = {
    description: descriptionInput.value.trim(),
    website: websiteInput.value.trim(),
    userId: userIdInput.value.trim(),
    password: passwordInput.value.trim(),
    notes: notesInput.value.trim()
  };

  if (!candidate.description || !candidate.password) {
    await showAlert('Errore', 'Descrizione e password sono obbligatorie.');
    return;
  }

  const duplicate = entries.find((item) => item.id !== editingId && item.password === candidate.password);
  if (duplicate) {
    const proceed = await showConfirm('Password già in uso', `Questa password è già usata per "${duplicate.description}". Vuoi salvarla comunque?`);
    if (!proceed || proceed.action !== 'confirm') {
      return;
    }
  }

  let history = [];
  if (editingId) {
    const previousEntry = entries.find((item) => item.id === editingId);
    if (previousEntry) {
      history = hasEntryChanged(previousEntry, candidate)
        ? [...(previousEntry.history || []), snapshotEntry(previousEntry)].slice(-MAX_HISTORY)
        : (previousEntry.history || []);
    }
  }

  const newEntry = {
    id: editingId || crypto.randomUUID(),
    ...candidate,
    updated_at: updatedAtValue,
    history
  };

  if (editingId) {
    entries = entries.map((entry) => (entry.id === editingId ? newEntry : entry));
  } else {
    entries.unshift(newEntry);
  }

  await saveVault();
  renderEntries();
  resetForm();
}

async function handleRowAction(event) {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const { id } = button.dataset;
  const entry = entries.find((item) => item.id === id);
  if (!entry) {
    return;
  }

  // Copia campo singolo (User ID o Password)
  if (button.classList.contains('copy-field')) {
    const fieldName = button.dataset.field;
    const value = entry[fieldName];
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        button.textContent = '✓';
        setTimeout(() => {
          button.textContent = '📋';
        }, 1200);
      }).catch(async () => {
        await showAlert('Errore', 'Impossibile copiare il campo.');
      });
    }
    return;
  }

  // Copia scheda intera
  if (button.classList.contains('copy')) {
    clipboardEntry = { ...entry, id: crypto.randomUUID() };
    await showAlert('Completato', `Scheda "${entry.description}" copiata negli appunti.\nUsa "Incolla in nuova scheda" per creare una voce duplicata.`);
    renderPasteButton();
    return;
  }

  if (button.classList.contains('edit')) {
    fillForm(entry);
    return;
  }

  if (button.classList.contains('history')) {
    showHistory(entry);
    return;
  }

  if (button.classList.contains('delete')) {
    const confirmDelete = await showConfirm('Conferma', `Eliminare la voce "${entry.description}"?`);
    if (!confirmDelete || confirmDelete.action !== 'confirm') {
      return;
    }

    entries = entries.filter((item) => item.id !== id);
    await saveVault();
    renderEntries();
    if (editingId === id) {
      resetForm();
    }
  }
}

async function handlePasteInForm() {
  if (!clipboardEntry) {
    await showAlert('Errore', 'Nessuna voce copiata.');
    return;
  }

  descriptionInput.value = clipboardEntry.description;
  websiteInput.value = clipboardEntry.website;
  userIdInput.value = clipboardEntry.userId;
  passwordInput.value = clipboardEntry.password;
  notesInput.value = clipboardEntry.notes;
  
  if (clipboardEntry.updated_at) {
    const date = new Date(clipboardEntry.updated_at);
    updatedAtInput.value = date.toISOString().slice(0, 16);
  }

  editingId = null;
  submitBtn.textContent = 'Salva voce';
  descriptionInput.focus();
  await showAlert('Completato', 'Dati incollati nel form. Puoi modificarli e salvare una nuova voce.');
}

async function handlePasteInList() {
  if (!clipboardEntry) {
    await showAlert('Errore', 'Nessuna voce copiata.');
    return;
  }

  const newEntry = {
    id: crypto.randomUUID(),
    description: clipboardEntry.description,
    website: clipboardEntry.website,
    userId: clipboardEntry.userId,
    password: clipboardEntry.password,
    notes: clipboardEntry.notes,
    updated_at: new Date().toISOString()
  };

  entries.unshift(newEntry);
  await saveVault();
  renderEntries();
  await showAlert('Completato', `Voce "${newEntry.description}" creata dalla scheda copiata.`);
}

async function exportEntries() {
  const timestamp = new Date().toISOString().split('T')[0];
  const encryptedVault = await encryptValue(JSON.stringify(entries), masterPassword);
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    encrypted: true,
    data: encryptedVault
  };
  
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `password-vault-backup-${timestamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  await showAlert('Completato', 'Backup esportato con successo. Il file è crittografato con la tua password master.');
}

async function importEntries(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const text = await file.text();
  try {
    const backup = JSON.parse(text);
    
    // Supporta sia il nuovo formato (con versione) che quello vecchio
    let parsed;
    if (backup.version && backup.encrypted && backup.data) {
      const decrypted = await decryptValue(backup.data, masterPassword);
      parsed = JSON.parse(decrypted);
    } else if (Array.isArray(backup)) {
      parsed = backup;
    } else {
      throw new Error('Formato file non riconosciuto');
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Formato file non valido.');
    }

    entries = parsed;
    await saveVault();
    renderEntries();
    await showAlert('Completato', 'Importazione completata. I dati sono stati ripristinati dal backup.');
  } catch (error) {
    await showAlert('Errore', `Il file non è valido o corrotto: ${error.message}`);
  } finally {
    event.target.value = '';
  }
}

async function changeMasterPassword() {
  const current = await showModal({
    title: 'Password attuale',
    message: 'Inserisci la password master attuale:',
    inputLabel: 'Password master attuale',
    inputType: 'password',
    showCancel: true,
    confirmText: 'Continua'
  });

  if (!current || current.action !== 'confirm' || !current.value) {
    return;
  }

  if (current.value !== masterPassword) {
    await showAlert('Errore', 'Password master attuale non corretta.');
    return;
  }

  const next = await showModal({
    title: 'Nuova password master',
    message: 'Inserisci la nuova password master:',
    inputLabel: 'Nuova password master',
    inputType: 'password',
    showCancel: true,
    confirmText: 'Salva'
  });

  if (!next || next.action !== 'confirm' || !next.value || next.value.trim() === '') {
    await showAlert('Errore', 'La nuova password master non può essere vuota.');
    return;
  }

  masterPassword = next.value.trim();
  sessionStorage.setItem(MASTER_KEY, masterPassword);
  await saveVault();
  await showAlert('Completato', 'Password master aggiornata.');
}

entryForm.addEventListener('submit', handleSubmit);
resetBtn.addEventListener('click', resetForm);
formPasteBtn.addEventListener('click', handlePasteInForm);
entriesBody.addEventListener('click', handleRowAction);
searchInput.addEventListener('input', renderEntries);
exportBtn.addEventListener('click', exportEntries);
syncBtn.addEventListener('click', syncWithSupabase);
importInput.addEventListener('change', importEntries);
changeMasterBtn.addEventListener('click', changeMasterPassword);
historyCloseBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
historyList.addEventListener('click', handleRestoreVersion);

function registerServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((error) => {
      console.warn('Registrazione service worker fallita:', error);
    });
  }
}

async function init() {
  registerServiceWorker();
  initSupabaseClient();

  if (supabaseClient) {
    updateSyncStatus('online');
  } else {
    updateSyncStatus('offline');
  }

  if (location.protocol === 'file:') {
    await showAlert(
      'Persistenza richiesta',
      "Per salvare i dati in modo affidabile, apri l'app tramite un server locale, ad esempio http://localhost:8000. Aprire il file direttamente può far perdere o non memorizzare correttamente i dati nel browser."
    );
    return;
  }

  if (!(await ensureMasterPassword())) {
    return;
  }

  await loadVault();
  
  // Auto-sync al caricamento
  if (supabaseClient) {
    try {
      await syncWithSupabase();
    } catch (error) {
      console.warn('Auto-sync fallito:', error);
      updateSyncStatus('error');
    }
  }
}

init();

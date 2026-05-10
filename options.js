// Options page functionality
document.addEventListener('DOMContentLoaded', () => {
    const ALL_FOLDER_ID = 'all';
    const MAX_FOLDER_NAME_LENGTH = 30;
    const DEFAULT_ALL_FOLDER = {
        id: ALL_FOLDER_ID,
        name: 'Alle gemte ord',
        color: '#97A97C',
        system: true
    };

    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');
    const color1HexInput = document.getElementById('color1-hex');
    const color2HexInput = document.getElementById('color2-hex');
    const gradientAngleSelect = document.getElementById('gradient-angle');
    const themeSelect = document.getElementById('theme-select');
    const previewElement = document.getElementById('preview');
    const saveButton = document.getElementById('save-btn');
    const resetButton = document.getElementById('reset-btn');
    const statusMessage = document.getElementById('status');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const clearSavedButton = document.getElementById('clear-saved-btn');
    const addFolderButton = document.getElementById('add-folder-btn');
    const newFolderNameInput = document.getElementById('new-folder-name');
    const newFolderColorInput = document.getElementById('new-folder-color');
    const folderListElement = document.getElementById('folder-list');
    const folderFilterSelect = document.getElementById('folder-filter-select');

    // Default colors
    const defaultColors = {
        color1: '#b5c99a',
        color2: '#97A97C',
        angle: '135deg',
        theme: 'system'
    };

    let currentSavedWords = [];
    let currentFolders = [DEFAULT_ALL_FOLDER];
    let activeFolderId = ALL_FOLDER_ID;

    // Load saved settings
    loadSettings();
    loadSavedWords();

    // Event listeners
    color1Input.addEventListener('input', onColor1Change);
    color2Input.addEventListener('input', onColor2Change);
    color1HexInput.addEventListener('input', onColor1HexChange);
    color2HexInput.addEventListener('input', onColor2HexChange);
    gradientAngleSelect.addEventListener('change', updatePreview);
    themeSelect.addEventListener('change', onThemeChange);
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
    clearSavedButton.addEventListener('click', clearAllSavedWords);
    addFolderButton.addEventListener('click', createFolder);
    folderFilterSelect.addEventListener('change', onFolderFilterChange);
    newFolderNameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            createFolder();
        }
    });

    // Theme button listeners
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn));
    });

    function onColor1Change() {
        color1HexInput.value = color1Input.value.toUpperCase();
        updatePreview();
    }

    function onColor2Change() {
        color2HexInput.value = color2Input.value.toUpperCase();
        updatePreview();
    }

    function onColor1HexChange() {
        if (isValidHexColor(color1HexInput.value)) {
            color1Input.value = color1HexInput.value;
            updatePreview();
        }
    }

    function onColor2HexChange() {
        if (isValidHexColor(color2HexInput.value)) {
            color2Input.value = color2HexInput.value;
            updatePreview();
        }
    }

    function isValidHexColor(hex) {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }

    function onThemeChange() {
        const theme = themeSelect.value;
        applyThemeMode(theme);
        updatePreview();
    }

    function applyThemeMode(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.removeAttribute('data-theme');
        } else if (theme === 'system') {
            // Use system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        }
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (themeSelect.value === 'system') {
                applyThemeMode('system');
                updatePreview();
            }
        });
    }

    function updatePreview() {
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const angle = gradientAngleSelect.value;

        const gradient = `linear-gradient(${angle}, ${color1} 0%, ${color2} 100%)`;

        // Update preview popup
        const header = previewElement.querySelector('.preview-header');
        const phraseElement = previewElement.querySelector('.preview-content h4');
        const definitionElement = previewElement.querySelector('.preview-content p');
        const primaryButton = previewElement.querySelector('.btn-primary');
        const secondaryButton = previewElement.querySelector('.btn-secondary');

        header.style.background = gradient;
        phraseElement.style.background = gradient;
        phraseElement.style.webkitBackgroundClip = 'text';
        phraseElement.style.webkitTextFillColor = 'transparent';
        phraseElement.style.backgroundClip = 'text';
        definitionElement.style.borderLeftColor = color1;
        primaryButton.style.background = gradient;
        secondaryButton.style.color = color1;
        secondaryButton.style.borderColor = color1;

        // Update page header
        const pageHeader = document.querySelector('header');
        pageHeader.style.background = gradient;
    }

    function applyTheme(button) {
        const color1 = button.dataset.color1;
        const color2 = button.dataset.color2;

        color1Input.value = color1;
        color2Input.value = color2;
        color1HexInput.value = color1.toUpperCase();
        color2HexInput.value = color2.toUpperCase();

        // Update active theme button
        themeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        updatePreview();
    }

    function saveSettings() {
        const settings = {
            color1: color1Input.value,
            color2: color2Input.value,
            angle: gradientAngleSelect.value,
            theme: themeSelect.value
        };

        chrome.storage.sync.set({ colorSettings: settings }, () => {
            showStatus('Indstillinger gemt!', 'success');

            // Send message to popup to update colors and theme
            chrome.runtime.sendMessage({
                type: 'colorSettingsUpdated',
                settings: settings
            });
        });
    }

    function loadSettings() {
        chrome.storage.sync.get(['colorSettings'], (result) => {
            const settings = result.colorSettings || defaultColors;

            color1Input.value = settings.color1;
            color2Input.value = settings.color2;
            color1HexInput.value = settings.color1.toUpperCase();
            color2HexInput.value = settings.color2.toUpperCase();
            gradientAngleSelect.value = settings.angle;
            themeSelect.value = settings.theme || 'system';

            applyThemeMode(settings.theme || 'system');
            updatePreview();
            updateActiveTheme(settings);
        });
    }

    function updateActiveTheme(settings) {
        themeButtons.forEach(btn => {
            if (btn.dataset.color1 === settings.color1 && btn.dataset.color2 === settings.color2) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function resetSettings() {
        color1Input.value = defaultColors.color1;
        color2Input.value = defaultColors.color2;
        color1HexInput.value = defaultColors.color1.toUpperCase();
        color2HexInput.value = defaultColors.color2.toUpperCase();
        gradientAngleSelect.value = defaultColors.angle;
        themeSelect.value = defaultColors.theme;

        applyThemeMode(defaultColors.theme);
        updatePreview();
        updateActiveTheme(defaultColors);
        showStatus('Indstillinger nulstillet til standard', 'success');
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message show ${type}`;

        setTimeout(() => {
            statusMessage.classList.remove('show');
        }, 3000);
    }

    function normalizeFolder(folder) {
        if (!folder || typeof folder !== 'object' || !folder.id || !folder.name) {
            return null;
        }
        return {
            id: String(folder.id),
            name: String(folder.name).trim().slice(0, MAX_FOLDER_NAME_LENGTH) || 'Mappe',
            color: isValidHexColor(folder.color) ? folder.color : '#97A97C',
            system: folder.id === ALL_FOLDER_ID || Boolean(folder.system)
        };
    }

    function ensureAllFolder(folders) {
        const normalized = Array.isArray(folders)
            ? folders.map(normalizeFolder).filter(Boolean)
            : [];

        const byId = new Map(normalized.map((folder) => [folder.id, folder]));
        byId.set(ALL_FOLDER_ID, {
            ...DEFAULT_ALL_FOLDER,
            ...(byId.get(ALL_FOLDER_ID) || {}),
            id: ALL_FOLDER_ID,
            name: 'Alle gemte ord',
            system: true
        });

        return Array.from(byId.values());
    }

    function normalizeSavedWord(word) {
        if (!word || typeof word !== 'object' || !word.phrase) {
            return null;
        }

        const normalizedFolders = Array.isArray(word.folders)
            ? word.folders.filter((folderId) => typeof folderId === 'string' && folderId.trim())
            : [];

        return {
            phrase: String(word.phrase),
            definition: String(word.definition || ''),
            explanation: String(word.explanation || ''),
            url: String(word.url || ''),
            savedAt: word.savedAt || new Date().toISOString(),
            folders: Array.from(new Set([...normalizedFolders, ALL_FOLDER_ID]))
        };
    }

    function normalizeSavedWords(savedWords) {
        const normalized = Array.isArray(savedWords)
            ? savedWords.map(normalizeSavedWord).filter(Boolean)
            : [];

        const byPhrase = new Map();
        normalized.forEach((word) => {
            const existing = byPhrase.get(word.phrase);
            if (!existing) {
                byPhrase.set(word.phrase, word);
                return;
            }
            const mergedFolders = Array.from(new Set([...(existing.folders || []), ...(word.folders || [])]));
            byPhrase.set(word.phrase, {
                ...existing,
                ...word,
                savedAt: existing.savedAt || word.savedAt,
                folders: Array.from(new Set([...mergedFolders, ALL_FOLDER_ID]))
            });
        });

        return Array.from(byPhrase.values());
    }

    function persistSavedWordState(savedWords, folders, callback) {
        chrome.storage.local.set({
            savedWords: normalizeSavedWords(savedWords),
            wordFolders: ensureAllFolder(folders),
            savedWordsMigrated: true
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error persisting saved word state:', chrome.runtime.lastError);
                if (typeof callback === 'function') callback(chrome.runtime.lastError);
                return;
            }
            if (typeof callback === 'function') callback(null);
        });
    }

    function loadSavedWords() {
        chrome.storage.local.get(['savedWords', 'wordFolders', 'savedWordsMigrated'], (localResult) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading saved words:', chrome.runtime.lastError);
                refreshSavedWords([], [DEFAULT_ALL_FOLDER]);
                return;
            }

            const localWords = normalizeSavedWords(localResult.savedWords || []);
            const localFolders = ensureAllFolder(localResult.wordFolders || []);

            if (localResult.savedWordsMigrated) {
                persistSavedWordState(localWords, localFolders, (error) => {
                    if (error) return;
                    refreshSavedWords(localWords, localFolders);
                });
                return;
            }

            chrome.storage.sync.get(['savedWords'], (syncResult) => {
                if (chrome.runtime.lastError) {
                    console.error('Error reading sync savedWords:', chrome.runtime.lastError);
                    persistSavedWordState(localWords, localFolders, (error) => {
                        if (error) return;
                        refreshSavedWords(localWords, localFolders);
                    });
                    return;
                }

                const syncWords = Array.isArray(syncResult.savedWords) ? syncResult.savedWords : localWords;
                const migratedWords = normalizeSavedWords(syncWords);
                persistSavedWordState(migratedWords, localFolders, (error) => {
                    if (error) return;
                    if (syncResult.savedWords && syncResult.savedWords.length > 0) {
                        chrome.storage.sync.remove('savedWords');
                    }
                    refreshSavedWords(migratedWords, localFolders);
                });
            });
        });
    }

    function refreshSavedWords(savedWords, folders) {
        currentSavedWords = normalizeSavedWords(savedWords);
        currentFolders = ensureAllFolder(folders);

        if (!currentFolders.some(folder => folder.id === activeFolderId)) {
            activeFolderId = ALL_FOLDER_ID;
        }

        renderFolderControls();
        renderSavedWords(currentSavedWords);
    }

    function renderFolderControls() {
        folderListElement.innerHTML = currentFolders.map((folder) => {
            const deleteButton = folder.id === ALL_FOLDER_ID
                ? ''
                : `<button type="button" class="folder-pill-delete" data-folder-id="${escapeAttribute(folder.id)}" title="Slet mappe">×</button>`;

            return `
                <div class="folder-pill" title="${escapeAttribute(folder.name)}">
                    <span class="folder-pill-color" style="background:${escapeHtml(folder.color)}"></span>
                    <span>${escapeHtml(folder.name)}</span>
                    ${deleteButton}
                </div>
            `;
        }).join('');

        folderFilterSelect.innerHTML = currentFolders.map((folder) => {
            const selected = folder.id === activeFolderId ? ' selected' : '';
            return `<option value="${escapeAttribute(folder.id)}"${selected}>${escapeHtml(folder.name)}</option>`;
        }).join('');

        folderListElement.querySelectorAll('.folder-pill-delete').forEach((button) => {
            button.addEventListener('click', () => {
                deleteFolder(button.dataset.folderId);
            });
        });
    }

    function onFolderFilterChange() {
        activeFolderId = folderFilterSelect.value || ALL_FOLDER_ID;
        renderSavedWords(currentSavedWords);
    }

    function createFolder() {
        const rawName = newFolderNameInput.value.trim();
        const color = newFolderColorInput.value;

        if (!rawName) {
            showStatus('Mappe skal have et navn', 'error');
            return;
        }

        const duplicate = currentFolders.some(folder => folder.name.toLowerCase() === rawName.toLowerCase());
        if (duplicate) {
            showStatus('Der findes allerede en mappe med dette navn', 'error');
            return;
        }

        if (!isValidHexColor(color)) {
            showStatus('Ugyldig mappefarve', 'error');
            return;
        }

        const newFolder = {
            id: createUniqueFolderId(),
            name: rawName.slice(0, MAX_FOLDER_NAME_LENGTH),
            color,
            system: false
        };

        const nextFolders = [...currentFolders, newFolder];
        persistSavedWordState(currentSavedWords, nextFolders, (error) => {
            if (error) {
                showStatus('Kunne ikke oprette mappe', 'error');
                return;
            }
            newFolderNameInput.value = '';
            refreshSavedWords(currentSavedWords, nextFolders);
            showStatus('Mappe oprettet', 'success');
        });
    }

    function deleteFolder(folderId) {
        if (!folderId || folderId === ALL_FOLDER_ID) {
            return;
        }

        const folder = currentFolders.find((item) => item.id === folderId);
        if (!folder) {
            return;
        }

        if (!window.confirm(`Slet mappen "${folder.name}"?`)) {
            return;
        }

        const nextFolders = currentFolders.filter((item) => item.id !== folderId);
        const nextWords = currentSavedWords.map((word) => ({
            ...word,
            folders: (word.folders || []).filter((id) => id !== folderId)
        }));

        if (activeFolderId === folderId) {
            activeFolderId = ALL_FOLDER_ID;
        }

        persistSavedWordState(nextWords, nextFolders, (error) => {
            if (error) {
                showStatus('Kunne ikke slette mappe', 'error');
                return;
            }
            refreshSavedWords(nextWords, nextFolders);
            showStatus('Mappe slettet', 'success');
        });
    }

    // Load and display saved words
    function renderSavedWords(savedWords) {
        const list = document.getElementById('saved-words-list');
        const actionsDiv = document.getElementById('saved-words-actions');
        const customFolders = currentFolders.filter(folder => folder.id !== ALL_FOLDER_ID);

        const visibleWords = activeFolderId === ALL_FOLDER_ID
            ? savedWords
            : savedWords.filter((word) => (word.folders || []).includes(activeFolderId));

        if (savedWords.length === 0) {
            list.innerHTML = '<p class="no-saved-words">Du har ikke gemt nogen ord endnu.</p>';
            actionsDiv.style.display = 'none';
            return;
        }

        if (visibleWords.length === 0) {
            list.innerHTML = '<p class="no-saved-words">Ingen ord i denne mappe endnu.</p>';
            actionsDiv.style.display = 'block';
            return;
        }

        actionsDiv.style.display = 'block';
        list.innerHTML = visibleWords.map((word) => {
            const folderAssignment = customFolders.length > 0
                ? `<div class="saved-word-folder-assignment">${customFolders.map((folder) => {
                    const isChecked = (word.folders || []).includes(folder.id) ? ' checked' : '';
                    return `<label class="saved-word-folder-option">
                        <input class="saved-word-folder-checkbox" type="checkbox" data-folder-id="${escapeAttribute(folder.id)}"${isChecked}>
                        <span class="saved-word-folder-color" style="background:${escapeHtml(folder.color)}"></span>
                        ${escapeHtml(folder.name)}
                    </label>`;
                }).join('')}</div>`
                : '<div class="saved-word-folder-empty">Opret mapper for at sortere ord.</div>';

            return `
                <div class="saved-word-item">
                    <div class="saved-word-main">
                        <div class="saved-word-info">
                            <span class="saved-word-phrase">${escapeHtml(word.phrase)}</span>
                            <span class="saved-word-definition">${escapeHtml(word.definition)}</span>
                        </div>
                        <div class="saved-word-meta">
                            <a class="saved-word-link" title="Slå op" rel="noopener noreferrer">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </a>
                            <button class="delete-saved-btn" title="Slet">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                    <path d="M10 11v6"></path>
                                    <path d="M14 11v6"></path>
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    ${folderAssignment}
                </div>
            `;
        }).join('');

        const items = list.querySelectorAll('.saved-word-item');
        items.forEach((item, index) => {
            const word = visibleWords[index];
            const link = item.querySelector('.saved-word-link');
            if (isSafeUrl(word.url)) {
                link.setAttribute('href', word.url);
                link.setAttribute('target', '_blank');
            } else {
                link.removeAttribute('href');
                link.removeAttribute('target');
                link.setAttribute('aria-disabled', 'true');
                link.tabIndex = -1;
            }

            item.querySelector('.delete-saved-btn').addEventListener('click', () => {
                deleteSavedWord(word.phrase);
            });

            item.querySelectorAll('.saved-word-folder-checkbox').forEach((checkbox) => {
                checkbox.addEventListener('change', () => {
                    setWordFolderMembership(word.phrase, checkbox.dataset.folderId, checkbox.checked);
                });
            });
        });
    }

    function setWordFolderMembership(phrase, folderId, shouldInclude) {
        if (!phrase || !folderId || folderId === ALL_FOLDER_ID) {
            return;
        }

        const folderExists = currentFolders.some(folder => folder.id === folderId);
        if (!folderExists) {
            return;
        }

        const nextWords = currentSavedWords.map((word) => {
            if (word.phrase !== phrase) {
                return word;
            }

            const folderSet = new Set(word.folders || []);
            folderSet.add(ALL_FOLDER_ID);

            if (shouldInclude) {
                folderSet.add(folderId);
            } else {
                folderSet.delete(folderId);
            }

            return {
                ...word,
                folders: Array.from(folderSet)
            };
        });

        persistSavedWordState(nextWords, currentFolders, (error) => {
            if (error) {
                showStatus('Kunne ikke opdatere mappe', 'error');
                return;
            }
            refreshSavedWords(nextWords, currentFolders);
        });
    }

    function deleteSavedWord(phrase) {
        const savedWords = currentSavedWords.filter(w => w.phrase !== phrase);
        persistSavedWordState(savedWords, currentFolders, (error) => {
            if (error) {
                console.error('Error deleting word:', error);
                showStatus('Kunne ikke slette ord', 'error');
            } else {
                refreshSavedWords(savedWords, currentFolders);
            }
        });
    }

    function clearAllSavedWords() {
        if (!window.confirm('Er du sikker på, at du vil slette alle gemte ord?')) return;
        persistSavedWordState([], currentFolders, (error) => {
            if (error) {
                console.error('Error clearing words:', error);
                showStatus('Kunne ikke slette ord', 'error');
            } else {
                refreshSavedWords([], currentFolders);
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttribute(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function createUniqueFolderId() {
        const generateId = () => {
            if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
                return `folder-${globalThis.crypto.randomUUID()}`;
            }
            return `folder-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        };

        let nextId = generateId();
        while (currentFolders.some(folder => folder.id === nextId)) {
            nextId = generateId();
        }
        return nextId;
    }

    function isSafeUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch (_) {
            return false;
        }
    }

    // Initialize preview
    updatePreview();
});

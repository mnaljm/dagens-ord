// Options page functionality
document.addEventListener('DOMContentLoaded', () => {
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

    const bookmarkColorInput = document.getElementById('bookmark-color');
    const bookmarkColorHexInput = document.getElementById('bookmark-color-hex');

    // Default colors
    const defaultColors = {
        color1: '#b5c99a',
        color2: '#97A97C',
        bookmarkColor: '#e74c3c',
        angle: '135deg',
        theme: 'system'
    };

    // Load saved settings
    loadSettings();
    loadSavedWords();

    // Event listeners
    color1Input.addEventListener('input', onColor1Change);
    color2Input.addEventListener('input', onColor2Change);
    bookmarkColorInput.addEventListener('input', onBookmarkColorChange);
    color1HexInput.addEventListener('input', onColor1HexChange);
    color2HexInput.addEventListener('input', onColor2HexChange);
    bookmarkColorHexInput.addEventListener('input', onBookmarkColorHexChange);
    gradientAngleSelect.addEventListener('change', updatePreview);
    themeSelect.addEventListener('change', onThemeChange);
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
    clearSavedButton.addEventListener('click', clearAllSavedWords);

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

    function onBookmarkColorChange() {
        bookmarkColorHexInput.value = bookmarkColorInput.value.toUpperCase();
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

    function onBookmarkColorHexChange() {
        if (isValidHexColor(bookmarkColorHexInput.value)) {
            bookmarkColorInput.value = bookmarkColorHexInput.value;
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
            bookmarkColor: bookmarkColorInput.value,
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
            bookmarkColorInput.value = settings.bookmarkColor || defaultColors.bookmarkColor;
            color1HexInput.value = settings.color1.toUpperCase();
            color2HexInput.value = settings.color2.toUpperCase();
            bookmarkColorHexInput.value = (settings.bookmarkColor || defaultColors.bookmarkColor).toUpperCase();
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
        bookmarkColorInput.value = defaultColors.bookmarkColor;
        color1HexInput.value = defaultColors.color1.toUpperCase();
        color2HexInput.value = defaultColors.color2.toUpperCase();
        bookmarkColorHexInput.value = defaultColors.bookmarkColor.toUpperCase();
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

    // Load and display saved words
    function loadSavedWords() {
        chrome.storage.local.get(['savedWords', 'savedWordsMigrated'], (localResult) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading savedWords:', chrome.runtime.lastError);
                return;
            }
            if (localResult.savedWordsMigrated) {
                renderSavedWords(localResult.savedWords || []);
                return;
            }
            chrome.storage.sync.get(['savedWords'], (syncResult) => {
                if (chrome.runtime.lastError) {
                    console.error('Error reading sync savedWords:', chrome.runtime.lastError);
                    renderSavedWords([]);
                    return;
                }
                const words = syncResult.savedWords || localResult.savedWords || [];
                chrome.storage.local.set({ savedWords: words, savedWordsMigrated: true }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error migrating savedWords:', chrome.runtime.lastError);
                    } else if (syncResult.savedWords && syncResult.savedWords.length > 0) {
                        chrome.storage.sync.remove('savedWords');
                    }
                    renderSavedWords(words);
                });
            });
        });
    }

    function renderSavedWords(savedWords) {
        const list = document.getElementById('saved-words-list');
        const actionsDiv = document.getElementById('saved-words-actions');

        if (savedWords.length === 0) {
            list.innerHTML = '<p class="no-saved-words">Du har ikke gemt nogen ord endnu.</p>';
            actionsDiv.style.display = 'none';
            return;
        }

        actionsDiv.style.display = 'block';
        list.innerHTML = savedWords.map((word) => `
            <div class="saved-word-item">
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
        `).join('');

        const items = list.querySelectorAll('.saved-word-item');
        items.forEach((item, index) => {
            const word = savedWords[index];
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
        });
    }

    function deleteSavedWord(phrase) {
        chrome.storage.local.get(['savedWords'], (result) => {
            const savedWords = (result.savedWords || []).filter(w => w.phrase !== phrase);
            chrome.storage.local.set({ savedWords }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error deleting word:', chrome.runtime.lastError);
                } else {
                    renderSavedWords(savedWords);
                }
            });
        });
    }

    function clearAllSavedWords() {
        if (!window.confirm('Er du sikker på, at du vil slette alle gemte ord?')) return;
        chrome.storage.local.set({ savedWords: [] }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error clearing words:', chrome.runtime.lastError);
            } else {
                renderSavedWords([]);
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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

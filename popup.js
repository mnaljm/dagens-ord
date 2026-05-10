// DOM elements
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const contentElement = document.getElementById('content');
const phraseText = document.getElementById('phrase-text');
const definitionText = document.getElementById('definition-text');
const explanationElement = document.getElementById('explanation');
const explanationText = document.getElementById('explanation-text');
const toggleButton = document.getElementById('toggle-explanation');
const lookupLink = document.getElementById('lookup-link');
const retryButton = document.getElementById('retry-btn');
const settingsButton = document.getElementById('settings-btn');
const saveButton = document.getElementById('save-btn');

// State
let explanationVisible = false;
let currentWord = null;
let isSavingWord = false;
const ALL_FOLDER_ID = 'all';
const DEFAULT_ALL_FOLDER = {
    id: ALL_FOLDER_ID,
    name: 'Alle gemte ord',
    color: '#97A97C',
    system: true
};

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
    loadColorSettings();
    migrateSavedWords();
    fetchDagensOrd();
    
    // Event listeners
    toggleButton.addEventListener('click', toggleExplanation);
    retryButton.addEventListener('click', fetchDagensOrd);
    settingsButton.addEventListener('click', openSettings);
    saveButton.addEventListener('click', toggleSaveWord);
    const savedWordsBookmark = document.getElementById('saved-words-bookmark');
    if (savedWordsBookmark) {
        savedWordsBookmark.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }
});

// Fetch dagens ord from ordnet.dk
async function fetchDagensOrd() {
    showLoading();
    
    try {
        const response = await fetch('https://ny.ordnet.dk/api/kvikfeed/dagens-ord', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'api-key': '2d3921ea-c5cc-4d08-8be5-4c71c23c29f1'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.body, 'text/html');
        
        // Extract phrase
        let phrase = data.lemma;
        if (!phrase) {
            const holem = doc.querySelector('Holem');
            phrase = holem ? holem.textContent.trim() : 'Ikke fundet';
        }
        
        // Extract definition and part of speech
        let lemklas = data.pos;
        if (!lemklas) {
            const lemklasEl = doc.querySelector('Lemklas');
            if (lemklasEl) lemklas = lemklasEl.textContent.trim();
        }
        
        const betydning = doc.querySelector('Betydning');
        let definition = betydning ? betydning.textContent.trim() : 'Definition ikke tilgængelig';
        if (lemklas && definition !== 'Definition ikke tilgængelig') {
            definition = `${lemklas} — ${definition}`;
        }
        
        // Extract explanation
        const explanation = data.secondary_body || '';
        
        // Extract lookup link
        const aEl = doc.querySelector('a');
        let lookupUrl = `https://ny.ordnet.dk/ddo/ordbog?query=${encodeURIComponent(phrase)}`;
        if (aEl) {
            const query = aEl.getAttribute('query');
            const href = aEl.getAttribute('href');
            if (query) {
                lookupUrl = `https://ny.ordnet.dk/ddo/ordbog/${encodeURIComponent(query)}`;
            } else if (href) {
                lookupUrl = href.startsWith('http') ? href : `https://ny.ordnet.dk${href}`;
            }
        }
        
        // Display the content
        displayContent(phrase, definition, explanation, lookupUrl);
        
    } catch (error) {
        console.error('Error fetching dagens ord:', error);
        showError();
    }
}

// Display the fetched content
function displayContent(phrase, definition, explanation, lookupUrl) {
    phraseText.textContent = phrase;
    definitionText.textContent = definition;
    
    if (explanation) {
        explanationText.textContent = explanation;
        toggleButton.style.display = 'block';
    } else {
        toggleButton.style.display = 'none';
    }
    
    lookupLink.href = lookupUrl;
    
    currentWord = { phrase, definition, explanation, url: lookupUrl };
    updateSaveButtonState();
    
    hideLoading();
    hideError();
    contentElement.style.display = 'block';
}

// Toggle explanation visibility
function toggleExplanation() {
    explanationVisible = !explanationVisible;
    
    if (explanationVisible) {
        explanationElement.style.display = 'block';
        toggleButton.textContent = 'Skjul forklaring';
    } else {
        explanationElement.style.display = 'none';
        toggleButton.textContent = 'Se forklaring';
    }
}

// Show loading state
function showLoading() {
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    contentElement.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingElement.style.display = 'none';
}

// Show error state
function showError() {
    hideLoading();
    contentElement.style.display = 'none';
    errorElement.style.display = 'block';
}

// Hide error state
function hideError() {
    errorElement.style.display = 'none';
}

// Load and apply color settings
function loadColorSettings() {
    chrome.storage.sync.get(['colorSettings'], (result) => {
        applyColorSettings(result.colorSettings || {
            color1: '#b5c99a',
            color2: '#97A97C',
            bookmarkColor: '#e74c3c',
            angle: '135deg',
            theme: 'system'
        });
    });
}

// Apply color settings to the popup
function applyColorSettings(settings) {
    // Update CSS custom properties
    document.documentElement.style.setProperty('--primary-color-1', settings.color1);
    document.documentElement.style.setProperty('--primary-color-2', settings.color2);
    document.documentElement.style.setProperty('--bookmark-color', settings.bookmarkColor || '#e74c3c');
    document.documentElement.style.setProperty('--gradient-angle', settings.angle);
    document.documentElement.style.setProperty('--gradient', 
        `linear-gradient(${settings.angle}, ${settings.color1} 0%, ${settings.color2} 100%)`
    );
    
    // Apply theme
    applyThemeMode(settings.theme || 'system');
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
        // Re-check if current setting is system and apply accordingly
        chrome.storage.sync.get(['colorSettings'], (result) => {
            if (!result.colorSettings || result.colorSettings.theme === 'system') {
                applyThemeMode('system');
            }
        });
    });
}

// Listen for color setting updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'colorSettingsUpdated') {
        applyColorSettings(message.settings);
    }
});

// Open settings page
function openSettings() {
    chrome.runtime.openOptionsPage();
}

// Migrate savedWords from sync to local storage on first run
function migrateSavedWords() {
    chrome.storage.local.get(['savedWordsMigrated', 'savedWords', 'wordFolders'], (localResult) => {
        if (chrome.runtime.lastError) {
            console.error('Error checking migration status:', chrome.runtime.lastError);
            return;
        }
        const localWords = normalizeSavedWords(localResult.savedWords || []);
        const localFolders = ensureAllFolder(localResult.wordFolders || []);
        
        if (!localResult.savedWordsMigrated) {
            chrome.storage.sync.get(['savedWords'], (syncResult) => {
                if (chrome.runtime.lastError) {
                    console.error('Error reading sync savedWords:', chrome.runtime.lastError);
                    return;
                }
                const syncWords = Array.isArray(syncResult.savedWords) ? syncResult.savedWords : localWords;
                const words = normalizeSavedWords(syncWords);
                chrome.storage.local.set({ savedWords: words, wordFolders: localFolders, savedWordsMigrated: true }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error migrating savedWords:', chrome.runtime.lastError);
                        return;
                    }
                    if (words.length > 0) {
                        chrome.storage.sync.remove('savedWords');
                    }
                });
            });
        } else {
            chrome.storage.local.set({ savedWords: localWords, wordFolders: localFolders }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error normalizing savedWords data:', chrome.runtime.lastError);
                }
            });
        }
    });
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

function normalizeSavedWords(words) {
    const normalized = Array.isArray(words) ? words.map(normalizeSavedWord).filter(Boolean) : [];
    const byPhrase = new Map();
    normalized.forEach((word) => {
        const existing = byPhrase.get(word.phrase);
        if (!existing) {
            byPhrase.set(word.phrase, word);
            return;
        }
        byPhrase.set(word.phrase, {
            ...existing,
            ...word,
            savedAt: existing.savedAt || word.savedAt,
            folders: Array.from(new Set([...(existing.folders || []), ...(word.folders || []), ALL_FOLDER_ID]))
        });
    });
    return Array.from(byPhrase.values());
}

function ensureAllFolder(folders) {
    const normalized = Array.isArray(folders) ? folders.filter(Boolean) : [];
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

// Toggle save state for the current word
function toggleSaveWord() {
    if (!currentWord || isSavingWord) return;
    const wordToToggle = { ...currentWord };
    isSavingWord = true;
    
    chrome.storage.local.get(['savedWords'], (result) => {
        const savedWords = normalizeSavedWords(result.savedWords || []);
        const index = savedWords.findIndex(w => w.phrase === wordToToggle.phrase);
        
        if (index === -1) {
            savedWords.push({ ...wordToToggle, savedAt: new Date().toISOString(), folders: [ALL_FOLDER_ID] });
            chrome.storage.local.get(['wordFolders'], (folderResult) => {
                const wordFolders = ensureAllFolder(folderResult.wordFolders || []);
                chrome.storage.local.set({ savedWords: normalizeSavedWords(savedWords), wordFolders }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error saving word:', chrome.runtime.lastError);
                    } else if (currentWord?.phrase === wordToToggle.phrase) {
                        setSaveButtonSaved(true);
                    }
                    isSavingWord = false;
                });
            });
        } else {
            savedWords.splice(index, 1);
            chrome.storage.local.set({ savedWords: normalizeSavedWords(savedWords) }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error removing word:', chrome.runtime.lastError);
                } else if (currentWord?.phrase === wordToToggle.phrase) {
                    setSaveButtonSaved(false);
                }
                isSavingWord = false;
            });
        }
    });
}

// Update the save button to reflect whether the current word is saved
function updateSaveButtonState(isSaved) {
    if (isSaved !== undefined) {
        setSaveButtonSaved(isSaved);
        return;
    }
    if (!currentWord) return;
    const phrase = currentWord.phrase;
    chrome.storage.local.get(['savedWords'], (result) => {
        const savedWords = normalizeSavedWords(result.savedWords || []);
        const saved = savedWords.some(w => w.phrase === phrase);
        if (currentWord?.phrase === phrase) {
            setSaveButtonSaved(saved);
        }
    });
}

function setSaveButtonSaved(saved) {
    if (saved) {
        saveButton.classList.add('saved');
        saveButton.title = 'Fjern fra gemte ord';
        saveButton.setAttribute('aria-label', 'Fjern fra gemte ord');
    } else {
        saveButton.classList.remove('saved');
        saveButton.title = 'Gem ord';
        saveButton.setAttribute('aria-label', 'Gem ord');
    }
}

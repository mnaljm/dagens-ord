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

// State
let explanationVisible = false;

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
    fetchDagensOrd();
    
    // Event listeners
    toggleButton.addEventListener('click', toggleExplanation);
    retryButton.addEventListener('click', fetchDagensOrd);
});

// Fetch dagens ord from ordnet.dk
async function fetchDagensOrd() {
    showLoading();
    
    try {
        const response = await fetch('https://ordnet.dk/ddo', {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find the dagens ord section
        const dagensOrdElement = doc.querySelector('.dagensord');
        
        if (!dagensOrdElement) {
            throw new Error('Kunne ikke finde dagens ord på siden');
        }
        
        // Extract phrase
        const phraseElement = dagensOrdElement.querySelector('.match');
        const phrase = phraseElement ? phraseElement.textContent.trim() : 'Ikke fundet';
        
        // Extract definition
        const definitionElement = dagensOrdElement.querySelector('.definition');
        const definition = definitionElement ? definitionElement.textContent.trim() : 'Definition ikke tilgængelig';
        
        // Extract explanation
        const explanationDiv = dagensOrdElement.querySelector('#explanation');
        const explanation = explanationDiv ? explanationDiv.textContent.trim() : '';
        
        // Extract lookup link
        const readMoreLink = dagensOrdElement.querySelector('.read-more a');
        const lookupUrl = readMoreLink ? readMoreLink.href : `https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(phrase)}`;
        
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

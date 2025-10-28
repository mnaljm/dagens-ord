// Options page functionality
document.addEventListener('DOMContentLoaded', () => {
    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');
    const color1HexInput = document.getElementById('color1-hex');
    const color2HexInput = document.getElementById('color2-hex');
    const gradientAngleSelect = document.getElementById('gradient-angle');
    const previewElement = document.getElementById('preview');
    const saveButton = document.getElementById('save-btn');
    const resetButton = document.getElementById('reset-btn');
    const statusMessage = document.getElementById('status');
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Default colors
    const defaultColors = {
        color1: '#48bb78',
        color2: '#38a169',
        angle: '135deg'
    };

    // Load saved settings
    loadSettings();

    // Event listeners
    color1Input.addEventListener('input', onColor1Change);
    color2Input.addEventListener('input', onColor2Change);
    color1HexInput.addEventListener('input', onColor1HexChange);
    color2HexInput.addEventListener('input', onColor2HexChange);
    gradientAngleSelect.addEventListener('change', updatePreview);
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);

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
            angle: gradientAngleSelect.value
        };

        chrome.storage.sync.set({ colorSettings: settings }, () => {
            showStatus('Indstillinger gemt!', 'success');
            
            // Send message to popup to update colors
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

    // Initialize preview
    updatePreview();
});

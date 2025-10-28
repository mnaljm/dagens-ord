# Development Guide - Dagens Ord Chrome Extension

## Quick Start

1. **Generate Icons First:**
   - Open `generate-icons.html` in your browser
   - Click "Generate All Icons" 
   - Download all 4 PNG files (16x16, 32x32, 48x48, 128x128)
   - Replace the placeholder files in the `icons/` folder

2. **Load the Extension:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select this folder (`dagens-udtryk`)

3. **Test the Extension:**
   - Click the extension icon in the Chrome toolbar
   - You should see dagens ord from ordnet.dk

## How It Works

### Data Fetching
The extension fetches the homepage of ordnet.dk and parses the HTML to extract:
- The phrase (from `.match` element)
- The definition (from `.definition` element)  
- The explanation (from `#explanation` element)
- The lookup link (from `.read-more a` element)

### CORS Handling
Chrome extensions have special permissions to make cross-origin requests, which is why we can fetch data from ordnet.dk directly.

### Parsing Strategy
We use the DOMParser API to parse the HTML response and extract the specific elements containing "dagens ord" information.

## File Structure

```
dagens-udtryk/
├── manifest.json          # Extension configuration
├── popup.html             # Main UI (shown when clicking extension icon)
├── popup.css              # Styling for the popup
├── popup.js               # JavaScript functionality
├── generate-icons.html    # Utility to create PNG icons from SVG
├── README.md              # User documentation
├── DEVELOPMENT.md         # This file
└── icons/
    ├── icon.svg           # Source SVG icon
    ├── icon16.png         # 16x16 PNG icon
    ├── icon32.png         # 32x32 PNG icon
    ├── icon48.png         # 48x48 PNG icon
    └── icon128.png        # 128x128 PNG icon
```

## Key Features

### Responsive Design
- Clean, modern interface
- Gradient backgrounds
- Smooth animations
- Mobile-friendly (though primarily for desktop Chrome)

### Error Handling
- Loading states with spinner
- Error messages with retry functionality
- Graceful fallbacks if elements are missing

### Accessibility
- Proper semantic HTML
- Keyboard navigation support
- Clear visual hierarchy
- High contrast colors

## Troubleshooting

### Common Issues

**Extension won't load:**
- Check that all required files exist
- Ensure manifest.json is valid JSON
- Make sure PNG icons exist (not just placeholders)

**Can't fetch data:**
- Check browser console for CORS errors
- Verify ordnet.dk is accessible
- Check network connection

**Popup doesn't show correctly:**
- Inspect the popup (right-click extension icon → "Inspect popup")
- Check for JavaScript errors in console
- Verify CSS is loading correctly

### Debugging
To debug the extension:
1. Right-click the extension icon
2. Select "Inspect popup"
3. Use Chrome DevTools to debug HTML, CSS, and JavaScript

## Future Improvements

### Possible Enhancements:
- **Caching:** Store recent phrases to work offline
- **History:** Keep track of previously viewed phrases
- **Notifications:** Daily notifications with new phrases
- **Favorites:** Save favorite phrases for later
- **Search:** Search through historical phrases
- **Dark Mode:** Toggle between light/dark themes
- **Multiple Sources:** Support other Danish dictionaries
- **Pronunciation:** Add audio pronunciation if available

### Technical Improvements:
- **Background Script:** Use service worker for better performance
- **Options Page:** Settings for user preferences
- **Context Menus:** Right-click integration
- **Keyboard Shortcuts:** Quick access shortcuts
- **Analytics:** Usage tracking (with user consent)

## Contributing

When making changes:
1. Test thoroughly in Chrome
2. Check console for errors
3. Verify extension works after reloading
4. Test error scenarios (network offline, site unavailable)
5. Ensure responsive design works at different popup sizes

## Publishing to Chrome Web Store

To publish this extension:
1. Create a Chrome Web Store developer account
2. Prepare store listing (screenshots, description, etc.)
3. Upload the extension package (zip file)
4. Submit for review

Requirements:
- High-quality icons (the generated PNGs should work)
- Clear description and screenshots
- Privacy policy (if collecting any data)
- Compliance with Chrome Web Store policies

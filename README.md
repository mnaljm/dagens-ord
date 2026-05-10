# Dagens Ord - Chrome Extension

En Chrome extension der viser "dagens ord" fra ny.ordnet.dk direkte i din browser.

## Features

- 📚 Viser dagens ord fra ny.ordnet.dk
- 🔍 Link til at slå udtrykket op
- 📖 Vis/skjul detaljeret forklaring
- 🌈 8 forudindstillede farvetemaer
- 🎨 Tilpasselige farvegradienter med HEX-koder og farvevælger
- 🗂️ Mapper til gemte ord med individuelle farver via farvevælger
- 📁 Fast "Alle gemte ord"-mappe, så hvert gemt ord altid findes ét sted
- ⚡ Hurtig og let at bruge

## Installation

### Fra kildekode:

1. Download eller klon dette repository
2. Åbn Chrome og gå til `chrome://extensions/`
3. Aktivér "Developer mode" (øverst til højre)
4. Klik "Load unpacked" og vælg mappen med extension filerne
5. Extensionen skulle nu være installeret og synlig i din toolbar

### Krav til ikoner

For at lave de rigtige PNG ikoner, kan du bruge følgende metoder:

#### Metode 1: Online SVG til PNG converter
1. Gå til en online converter som https://cloudconvert.com/svg-to-png
2. Upload `icons/icon.svg`
3. Lav versioner i følgende størrelser:
   - 16x16 px → `icons/icon16.png`
   - 32x32 px → `icons/icon32.png`
   - 48x48 px → `icons/icon48.png`
   - 128x128 px → `icons/icon128.png`

#### Metode 2: Med Inkscape (gratis)
1. Download Inkscape fra https://inkscape.org/
2. Åbn `icons/icon.svg`
3. Gå til File → Export PNG Image
4. Eksportér i de nødvendige størrelser

#### Metode 3: Med online tool
Du kan bruge denne simple HTML fil til at konvertere SVG til PNG:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SVG to PNG Converter</title>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script>
        const sizes = [16, 32, 48, 128];
        const svgString = `[SVG content here]`;
        
        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, size, size);
                const link = document.createElement('a');
                link.download = `icon${size}.png`;
                link.href = canvas.toDataURL();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        });
    </script>
</body>
</html>
```

## Brug

1. Klik på extension ikonet i Chrome toolbar
2. Se dagens ord med definition
3. Klik "Se forklaring" for at læse den detaljerede baggrund
4. Klik "Slå op" for at åbne ny.ordnet.dk siden

### Tilpasning af farver

1. Højreklik på extension ikonet og vælg "Options" (eller gå til chrome://extensions/ og klik "Details" → "Extension options")
2. Brug farvevælgeren eller indtast HEX-koder direkte (#ff0000)
3. Vælg gradient retning (diagonal, vandret, lodret)
4. Prøv de 8 forudindstillede temaer
5. Klik "Gem indstillinger" for at anvende ændringerne

### Gemte ord i mapper

1. Gem ord fra popup-knappen
2. Gå til "Options" for at oprette mapper med navn og farve
3. Tildel hvert ord til én eller flere mapper (fx både "Sjov" og "Interessant")
4. Brug filteret til at vise ord fra en bestemt mappe
5. Mappen "Alle gemte ord" findes altid og indeholder alle gemte ord

## Teknisk information

### Filer:

- `manifest.json` - Extension konfiguration
- `popup.html` - Hovedinterfacet
- `popup.css` - Styling
- `popup.js` - Funktionalitet
- `icons/` - Extension ikoner

### Permissions:

- `storage` - For at gemme brugerens farveindstillinger
- `https://ny.ordnet.dk/*` og `https://ordnet.dk/*` - For at kunne hente data fra ny.ordnet.dk

## Problemløsning

**Problem**: Extension kan ikke hente data fra ny.ordnet.dk
**Løsning**: Dette kan skyldes CORS restriktioner. Chrome extensions har normalt adgang til cross-origin requests, men hvis der opstår problemer, kan du prøve at:

1. Genindlæse extension i `chrome://extensions/`
2. Tjekke console logs for fejl (højreklik på extension → "Inspect popup")

**Problem**: Ikoner vises ikke korrekt
**Løsning**: Sørg for at PNG ikoner er oprettet i de rigtige størrelser (se installation guide ovenfor)

## Bidrag

Pull requests er velkomne! For større ændringer, åbn venligst først et issue for at diskutere hvad du gerne vil ændre.

## Licens

[MIT](https://choosealicense.com/licenses/mit/)

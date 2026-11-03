const fs = require('fs');

const bundlePath = 'reel-olla-presion/salida/.bundle/bundle.js';
if (fs.existsSync(bundlePath)) {
    const content = fs.readFileSync(bundlePath, 'utf8');
    console.log('Bundle length:', content.length);
    const searchTerms = ['"frases":', 'OllaAbiertaEscape', 'guion_elevenlabs', 'posesRaw', 'entorno'];
    searchTerms.forEach(term => {
        const idx = content.indexOf(term);
        console.log(`Term "${term}" found at index:`, idx);
        if (idx !== -1) {
            console.log(`Snippet around "${term}":`, content.slice(Math.max(0, idx - 80), idx + 200));
        }
    });
} else {
    console.log('bundle.js not found');
}

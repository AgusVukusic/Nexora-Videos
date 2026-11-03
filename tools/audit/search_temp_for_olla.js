const fs = require('fs');
const path = require('path');
const os = require('os');

const tempDir = os.tmpdir();
const items = fs.readdirSync(tempDir);

console.log('Scanning Temp directories...');
for (const item of items) {
    if (item.toLowerCase().includes('nexora') || item.toLowerCase().includes('remotion') || item.toLowerCase().includes('olla')) {
        const full = path.join(tempDir, item);
        try {
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                // check files inside
                const sub = fs.readdirSync(full);
                const hasOlla = sub.some(s => s.toLowerCase().includes('olla'));
                if (hasOlla) {
                    console.log('Found directory with olla in name/sub:', full, sub);
                }
                // Check if bundle or index contains olla
                if (sub.includes('bundle.js')) {
                    const content = fs.readFileSync(path.join(full, 'bundle.js'), 'utf8', { flag: 'r' });
                    if (content.includes('OllaAbiertaEscape') || content.includes('olla-presion')) {
                        console.log('Found bundle.js with Olla in:', full);
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    }
}
console.log('Temp scan finished.');

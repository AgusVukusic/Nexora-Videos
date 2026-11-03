const fs = require('fs');

const bundle = fs.readFileSync('reel-olla-presion/salida/.bundle/bundle.js', 'utf8');

const targets = ['tiempos_namespaceObject', 'poses_namespaceObject', 'plan_namespaceObject'];
targets.forEach(t => {
  const idx = bundle.indexOf(t);
  console.log(`Target ${t} index:`, idx);
  if (idx !== -1) {
    console.log(bundle.slice(Math.max(0, idx - 80), idx + 120));
  }
});

// Buscar todos los JSON.parse en bundle.js
const regex = /JSON\.parse\('((?:[^'\\]|\\.)*)'\)/g;
let match;
let count = 0;
while ((match = regex.exec(bundle)) !== null) {
  count++;
  const raw = match[1];
  try {
    const unescaped = raw.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
    const parsed = JSON.parse(unescaped);
    const keys = Object.keys(parsed);
    console.log(`\nJSON block #${count} (length: ${raw.length}):`);
    console.log(`  Keys:`, keys);
    if (parsed.frases && parsed.duracion) {
      console.log(`  Identified as: plan.json (duracion: ${parsed.duracion}, frases: ${parsed.frases.length})`);
    } else if (parsed.frases && parsed.frases[0] && parsed.frases[0].palabras) {
      console.log(`  Identified as: tiempos.json (frases: ${parsed.frases.length})`);
    } else if (parsed._referencia || parsed.normal) {
      console.log(`  Identified as: poses.json (keys: ${keys.join(', ')})`);
    }
  } catch (e) {
    console.log(`JSON block #${count} parse error:`, e.message);
  }
}
console.log(`Total JSON blocks found: ${count}`);

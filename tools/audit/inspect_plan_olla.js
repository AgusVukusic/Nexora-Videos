const fs = require('fs');

const bundle = fs.readFileSync('reel-olla-presion/salida/.bundle/bundle.js', 'utf8');
const match = bundle.match(/JSON\.parse\('(\{"titulo":"Física, Química e Ingeniería de la Olla a Presión"[^']+)'\)/);

if (match) {
  const raw = match[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  const plan = JSON.parse(raw);
  console.log("Plan Title:", plan.titulo);
  console.log("Plan Estilo:", plan.estilo);
  console.log("Plan Portada:", plan.portada);
  console.log("Total Frases:", plan.frases.length);
  plan.frases.forEach((f, i) => {
    const esc = f.escena || {};
    console.log(`Frase ${i+1}: tipo=${esc.tipo}, imagen=${esc.imagen || 'none'}, imagenes=${esc.imagenes ? esc.imagenes.join(',') : 'none'}, icono=${esc.icono || 'none'}`);
  });
} else {
  console.log("Plan not matched");
}

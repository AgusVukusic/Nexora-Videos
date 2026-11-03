const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log("================================================================================");
console.log("AUDITORÍA FORENSE DE RECUPERACIÓN INDIVIDUAL — ETAPA 41B.3");
console.log("================================================================================\n");

// 1. Verificación de bundle.js.map
const mapPath = 'reel-olla-presion/salida/.bundle/bundle.js.map';
console.log("--- 1. Inspección de bundle.js.map ---");
if (!fs.existsSync(mapPath)) {
  console.error("ERROR: bundle.js.map no encontrado en", mapPath);
  process.exit(1);
}

const mapRaw = fs.readFileSync(mapPath, 'utf8');
const mapData = JSON.parse(mapRaw);

console.log("Version de Source Map:", mapData.version);
console.log("Archivo destino (file):", mapData.file);
console.log("Total sources en mapa:", mapData.sources.length);
console.log("Total sourcesContent en mapa:", mapData.sourcesContent ? mapData.sourcesContent.length : 0);

// Filtrar archivos pertenecientes a src/ de la composición
const srcEntries = [];
const seenPaths = new Set();
let duplicates = 0;
let emptyEntries = 0;

mapData.sources.forEach((src, idx) => {
  if (src.startsWith('./src/') || src.startsWith('src/')) {
    const content = mapData.sourcesContent ? mapData.sourcesContent[idx] : null;
    if (seenPaths.has(src)) {
      duplicates++;
    }
    seenPaths.add(src);

    if (!content || content.trim().length === 0) {
      emptyEntries++;
    }

    const cleanPath = src.replace(/^\.\//, '');
    const charLen = content ? content.length : 0;
    const byteLen = content ? Buffer.byteLength(content, 'utf8') : 0;
    const hash = content ? crypto.createHash('sha256').update(content, 'utf8').digest('hex') : 'N/A';

    srcEntries.push({
      idx,
      rawPath: src,
      cleanPath,
      charLen,
      byteLen,
      hash,
      hasContent: Boolean(content),
      isOwnScene: src.includes('propias/'),
      firstLine: content ? content.split('\n')[0].slice(0, 60) : ''
    });
  }
});

console.log("Archivos identificados en src/:", srcEntries.length);
console.log("Duplicados encontrados:", duplicates);
console.log("Entradas vacías o nulas:", emptyEntries);

const propias = srcEntries.filter(e => e.isOwnScene);
console.log("\nEscenas propias de olla a presión encontradas:", propias.length);
propias.forEach(p => {
  console.log(`  - ${p.cleanPath} (${p.charLen} caracteres, ${p.byteLen} bytes, sha256: ${p.hash.slice(0, 16)}...)`);
});

// Guardar inventario detallado para el reporte
fs.writeFileSync('tools/audit/src_files_inventory.json', JSON.stringify(srcEntries, null, 2));

// 2. Verificación de datos JSON en bundle.js
console.log("\n--- 2. Inspección de datos JSON en bundle.js ---");
const bundlePath = 'reel-olla-presion/salida/.bundle/bundle.js';
const bundleContent = fs.readFileSync(bundlePath, 'utf8');

// Búsqueda de plan.json
const planMatch = bundleContent.match(/JSON\.parse\('(\{"voz":null,"motor":"sin-voz"[^']+)'\)/);
let planJson = null;
let planHash = null;
let planBytes = 0;
if (planMatch) {
  try {
    const rawStr = planMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
    planJson = JSON.parse(rawStr);
    planBytes = Buffer.byteLength(rawStr, 'utf8');
    planHash = crypto.createHash('sha256').update(rawStr, 'utf8').digest('hex');
    console.log("plan.json localizado con éxito en bundle.js:");
    console.log(`  - Título: ${planJson.titulo || 'Sin título'}`);
    console.log(`  - Frases: ${planJson.frases ? planJson.frases.length : 0}`);
    console.log(`  - Duración: ${planJson.duracion} s`);
    console.log(`  - Tamaño crudo: ${planBytes} bytes`);
    console.log(`  - SHA-256 extraído: ${planHash}`);
  } catch (e) {
    console.error("Error parseando plan.json de bundle:", e.message);
  }
} else {
  console.log("plan.json NO encontrado con regex directa");
}

// Búsqueda de poses.json en bundle.js
const posesIdx = bundleContent.indexOf('poses_namespaceObject');
console.log("poses_namespaceObject índice:", posesIdx);
let posesJson = null;
let posesHash = null;
let posesBytes = 0;
// Buscar JSON.parse con poses
const posesMatch = bundleContent.match(/JSON\.parse\('(\{"_referencia"[^']+)'\)/);
if (posesMatch) {
  try {
    const rawPoses = posesMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
    posesJson = JSON.parse(rawPoses);
    posesBytes = Buffer.byteLength(rawPoses, 'utf8');
    posesHash = crypto.createHash('sha256').update(rawPoses, 'utf8').digest('hex');
    console.log("poses.json localizado con éxito en bundle.js:");
    console.log(`  - Claves de poses:`, Object.keys(posesJson));
    console.log(`  - Tamaño crudo: ${posesBytes} bytes`);
    console.log(`  - SHA-256 extraído: ${posesHash}`);
  } catch (e) {
    console.error("Error parseando poses.json de bundle:", e.message);
  }
} else {
  // Buscar si está definido como objeto literal
  console.log("poses.json: buscando patrones alternativos...");
}

// 3. Verificación de public/ en .bundle
console.log("\n--- 3. Inspección de activos en salida/.bundle/public/ ---");
const publicDir = 'reel-olla-presion/salida/.bundle/public';
function scanPublic(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(item => {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      res = res.concat(scanPublic(full));
    } else {
      const rel = path.relative(publicDir, full).replace(/\\/g, '/');
      const buf = fs.readFileSync(full);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      let tipo = 'otro';
      if (rel.startsWith('fuentes/')) tipo = 'fuente';
      else if (rel.startsWith('sonidos/')) tipo = 'sonido';
      else if (rel.startsWith('texturas/')) tipo = 'textura';
      res.push({
        path: rel,
        fullPath: full,
        size: stat.size,
        hash,
        tipo
      });
    }
  });
  return res;
}

const publicAssets = scanPublic(publicDir);
console.log("Total activos públicos en .bundle/public:", publicAssets.length);
const fuentes = publicAssets.filter(a => a.tipo === 'fuente');
const sonidos = publicAssets.filter(a => a.tipo === 'sonido');
const texturas = publicAssets.filter(a => a.tipo === 'textura');
console.log(`  - Fuentes: ${fuentes.length} (esperadas 25)`);
console.log(`  - Sonidos: ${sonidos.length} (esperados 17)`);
console.log(`  - Texturas: ${texturas.length} (esperadas 2)`);
fs.writeFileSync('tools/audit/public_assets_inventory.json', JSON.stringify(publicAssets, null, 2));

// 4. Verificación de package-lock.json en node_modules
console.log("\n--- 4. Inspección de reel-olla-presion/node_modules/.package-lock.json ---");
const lockPath = 'reel-olla-presion/node_modules/.package-lock.json';
if (fs.existsSync(lockPath)) {
  const lockBuf = fs.readFileSync(lockPath);
  const lockHash = crypto.createHash('sha256').update(lockBuf).digest('hex');
  const lockData = JSON.parse(lockBuf.toString('utf8'));
  console.log("Archivo .package-lock.json presente:");
  console.log(`  - Tamaño: ${lockBuf.length} bytes`);
  console.log(`  - SHA-256: ${lockHash}`);
  console.log(`  - Nombre proyecto: ${lockData.name}`);
  console.log(`  - Versión: ${lockData.version}`);
  console.log(`  - LockfileVersion: ${lockData.lockfileVersion}`);
  console.log(`  - Total paquetes registrados:`, Object.keys(lockData.packages || {}).length);
} else {
  console.error("ERROR: .package-lock.json no encontrado en node_modules");
}

// 5. Verificación de package.json y tsconfig.json desde transcript
console.log("\n--- 5. Verificación de package.json y tsconfig.json en transcripción ---");
const tPath = 'C:/Users/Agustín/.gemini/antigravity/brain/189a4d02-dca3-44f3-b181-e8a6367c8902/.system_generated/logs/transcript_full.jsonl';
const readline = require('readline');
const stream = fs.createReadStream(tPath, { encoding: 'utf8' });
const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

let lineNo = 0;
let pkgTranscriptContent = null;
let tsconfigTranscriptContent = null;

rl.on('line', (line) => {
  lineNo++;
  if (lineNo === 2348) {
    const obj = JSON.parse(line);
    tsconfigTranscriptContent = obj.content;
  }
  if (lineNo === 2358) {
    const obj = JSON.parse(line);
    pkgTranscriptContent = obj.content;
  }
});

rl.on('close', () => {
  console.log("Paso 2348 (tsconfig.json):");
  if (tsconfigTranscriptContent) {
    // extraer json de la salida
    const m = tsconfigTranscriptContent.match(/olla tsconfig:\s*(\{[\s\S]*?\n\})/);
    if (m) {
      const tsText = m[1];
      const tsJson = JSON.parse(tsText);
      const tsHash = crypto.createHash('sha256').update(tsText, 'utf8').digest('hex');
      console.log(`  - Válido JSON: SI, tamaño: ${Buffer.byteLength(tsText, 'utf8')} bytes`);
      console.log(`  - SHA-256: ${tsHash}`);
      console.log(`  - compilerOptions.target: ${tsJson.compilerOptions.target}`);
    } else {
      console.log("  - No se pudo extraer bloque JSON de paso 2348");
    }
  }

  console.log("Paso 2358 (package.json):");
  if (pkgTranscriptContent) {
    const m = pkgTranscriptContent.match(/Command output:\s*(\{[\s\S]*?\n\})/);
    if (m) {
      const pkgText = m[1];
      const pkgJson = JSON.parse(pkgText);
      const pkgHash = crypto.createHash('sha256').update(pkgText, 'utf8').digest('hex');
      console.log(`  - Válido JSON: SI, tamaño: ${Buffer.byteLength(pkgText, 'utf8')} bytes`);
      console.log(`  - SHA-256: ${pkgHash}`);
      console.log(`  - Nombre: ${pkgJson.name}, versión: ${pkgJson.version}`);
      console.log(`  - Scripts:`, Object.keys(pkgJson.scripts || {}));
      console.log(`  - Dependencias:`, Object.keys(pkgJson.dependencies || {}));
    } else {
      console.log("  - No se pudo extraer bloque JSON de paso 2358");
    }
  }
  console.log("\nAuditoría forense de solo lectura finalizada.");
});

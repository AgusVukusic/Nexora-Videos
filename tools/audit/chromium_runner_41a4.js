const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = path.resolve(__dirname, "results");

const originCamara = [540, 768];
const LIENZO = { x: 60, y: 210, w: 960, h: 860 };
const lx = 540;
const ly = 640;

function calcScreenPoint(pt, tLienzo, cam) {
  const x1 = lx + tLienzo.s * (pt[0] - lx) + tLienzo.dx;
  const y1 = ly + tLienzo.s * (pt[1] - ly) + tLienzo.dy;

  const rad = (cam.rot * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);

  const v0 = x1 - originCamara[0];
  const v1 = y1 - originCamara[1];

  const vRot0 = v0 * cosR - v1 * sinR;
  const vRot1 = v0 * sinR + v1 * cosR;

  const vTrans0 = vRot0 + cam.tx;
  const vTrans1 = vRot1 + cam.ty;

  const x2 = originCamara[0] + vTrans0 * cam.s;
  const y2 = originCamara[1] + vTrans1 * cam.s;

  return [x2, y2];
}

// Las 4 configuraciones
const CONFIGS = {
  linea_con_personaje: {
    nombre: "Línea con Personaje",
    subModo: "linea",
    conPersonaje: true,
    subTop: 1123.5,
    personajeTop: 1262,
    zona: { x: 60, y: 210, w: 960, h: 860 },
    tLienzo: { s: 1.0, dx: 0, dy: 0 },
    lienzoTransform: "none"
  },
  linea_sin_personaje: {
    nombre: "Línea sin Personaje",
    subModo: "linea",
    conPersonaje: false,
    subTop: 1283.5,
    personajeTop: null,
    zona: { x: 60, y: 250, w: 960, h: 960 },
    tLienzo: { s: 1.0, dx: 0, dy: 90 },
    lienzoTransform: "translate(0px, 90px) scale(1)"
  },
  bloque_con_personaje: {
    nombre: "Bloque con Personaje",
    subModo: "bloque",
    conPersonaje: true,
    subTop: 210,
    subBottom: 465,
    personajeTop: 1262,
    zona: { x: 60, y: 500, w: 960, h: 740 },
    tLienzo: { s: 740 / 860, dx: 0, dy: 230 },
    lienzoTransform: "translate(0px, 230px) scale(0.860465116)"
  },
  bloque_sin_personaje: {
    nombre: "Bloque sin Personaje",
    subModo: "bloque",
    conPersonaje: false,
    subTop: 210,
    subBottom: 465,
    personajeTop: null,
    zona: { x: 60, y: 500, w: 960, h: 1000 },
    tLienzo: { s: 1.0, dx: 0, dy: 360 },
    lienzoTransform: "translate(0px, 360px) scale(1)"
  }
};

// 14 Escenarios Críticos
const TEST_SCENARIOS = [
  // CFG 1: Línea con Personaje
  {
    id: "CFG1_TC1_estatica",
    cfgKey: "linea_con_personaje",
    cam: { s: 1.0, tx: 0, ty: 0, rot: 0 },
    camCss: "none",
    desc: "Línea c/personaje en Estática (f=0)",
    localTop: 210, localBottom: 1040
  },
  {
    id: "CFG1_TC2_travel_in_f90",
    cfgKey: "linea_con_personaje",
    cam: { s: 1.12, tx: 0, ty: 0, rot: 0 },
    camCss: "scale(1.12)",
    desc: "Línea c/personaje en Travel-In (f=90: max escala 1.12, tx=0, ty=0)",
    localTop: 210, localBottom: 1040
  },
  {
    id: "CFG1_TC3_zoom_in_f90",
    cfgKey: "linea_con_personaje",
    cam: { s: 1.15, tx: 0, ty: -20, rot: 0 },
    camCss: "scale(1.15) translate(0px, -20px)",
    desc: "Línea c/personaje en Zoom-In (f=90: max zoom 1.15, ty=-20)",
    localTop: 210, localBottom: 1040
  },
  {
    id: "CFG1_TC4_orbital_f0",
    cfgKey: "linea_con_personaje",
    cam: { s: 1.02, tx: 0, ty: 0, rot: -1.2 },
    camCss: "scale(1.02) rotate(-1.2deg)",
    desc: "Línea c/personaje en Orbital (f=0: rot=-1.2°, inclina sector izq)",
    localTop: 210, localBottom: 1040
  },
  {
    id: "CFG1_TC5_paneo_f0",
    cfgKey: "linea_con_personaje",
    cam: { s: 1.0, tx: -30, ty: 0, rot: 0 },
    camCss: "translate(-30px, 0px)",
    desc: "Línea c/personaje en Paneo (f=0: max desp horizontal tx=-30)",
    localTop: 210, localBottom: 1040
  },

  // CFG 2: Línea sin Personaje
  {
    id: "CFG2_TC1_estatica",
    cfgKey: "linea_sin_personaje",
    cam: { s: 1.0, tx: 0, ty: 0, rot: 0 },
    camCss: "none",
    desc: "Línea s/personaje en Estática (f=0, dy=+90px)",
    localTop: 210, localBottom: 1040
  },
  {
    id: "CFG2_TC2_travel_in_f90",
    cfgKey: "linea_sin_personaje",
    cam: { s: 1.12, tx: 0, ty: 0, rot: 0 },
    camCss: "scale(1.12)",
    desc: "Línea s/personaje en Travel-In (f=90: max escala 1.12, dy=+90px)",
    localTop: 210, localBottom: 1040
  },
  {
    id: "CFG2_TC3_zoom_in_f90",
    cfgKey: "linea_sin_personaje",
    cam: { s: 1.15, tx: 0, ty: -20, rot: 0 },
    camCss: "scale(1.15) translate(0px, -20px)",
    desc: "Línea s/personaje en Zoom-In (f=90: escala 1.15, ty=-20, dy=+90px)",
    localTop: 210, localBottom: 1040
  },

  // CFG 3: Bloque con Personaje
  {
    id: "CFG3_TC1_estatica",
    cfgKey: "bloque_con_personaje",
    cam: { s: 1.0, tx: 0, ty: 0, rot: 0 },
    camCss: "none",
    desc: "Bloque c/personaje en Estática (f=0: s=0.8605, dy=+230px)",
    localTop: 250, localBottom: 1040
  },
  {
    id: "CFG3_TC2_zoom_in_f90",
    cfgKey: "bloque_con_personaje",
    cam: { s: 1.15, tx: 0, ty: -20, rot: 0 },
    camCss: "scale(1.15) translate(0px, -20px)",
    desc: "Bloque c/personaje en Zoom-In (f=90: peor separación superior y=250 vs subtítulos)",
    localTop: 250, localBottom: 1040
  },
  {
    id: "CFG3_TC3_travel_in_f90",
    cfgKey: "bloque_con_personaje",
    cam: { s: 1.12, tx: 0, ty: 0, rot: 0 },
    camCss: "scale(1.12)",
    desc: "Bloque c/personaje en Travel-In (f=90: escala 1.12, tx=0, ty=0)",
    localTop: 250, localBottom: 1040
  },
  {
    id: "CFG3_TC4_orbital_f0",
    cfgKey: "bloque_con_personaje",
    cam: { s: 1.02, tx: 0, ty: 0, rot: -1.2 },
    camCss: "scale(1.02) rotate(-1.2deg)",
    desc: "Bloque c/personaje en Orbital (f=0: rot=-1.2°, inclina sector izq)",
    localTop: 250, localBottom: 1040
  },

  // CFG 4: Bloque sin Personaje
  {
    id: "CFG4_TC1_estatica",
    cfgKey: "bloque_sin_personaje",
    cam: { s: 1.0, tx: 0, ty: 0, rot: 0 },
    camCss: "none",
    desc: "Bloque s/personaje en Estática (f=0, dy=+360px)",
    localTop: 250, localBottom: 1040
  },
  {
    id: "CFG4_TC2_zoom_in_f90",
    cfgKey: "bloque_sin_personaje",
    cam: { s: 1.15, tx: 0, ty: -20, rot: 0 },
    camCss: "scale(1.15) translate(0px, -20px)",
    desc: "Bloque s/personaje en Zoom-In (f=90: escala 1.15, ty=-20, dy=+360px)",
    localTop: 250, localBottom: 1040
  }
];

// Generamos analíticamente las expectativas exactas
const enrichedScenarios = TEST_SCENARIOS.map(sc => {
  const cfg = CONFIGS[sc.cfgKey];
  const supIzq = calcScreenPoint([60, sc.localTop], cfg.tLienzo, sc.cam);
  const infDer = calcScreenPoint([1020, sc.localBottom], cfg.tLienzo, sc.cam);
  const supDer = calcScreenPoint([1020, sc.localTop], cfg.tLienzo, sc.cam);
  const infIzq = calcScreenPoint([60, sc.localBottom], cfg.tLienzo, sc.cam);

  let leftBottom = null;
  if (cfg.subModo === "bloque") {
    // Sector izquierdo con regla y=960
    const pLeftInfIzq = calcScreenPoint([60, 960], cfg.tLienzo, sc.cam);
    const pLeftInfDer = calcScreenPoint([520, 960], cfg.tLienzo, sc.cam);
    const pLeftInfCenter = calcScreenPoint([300, 960], cfg.tLienzo, sc.cam);
    leftBottom = Math.max(pLeftInfIzq[1], pLeftInfDer[1], pLeftInfCenter[1]);
  }

  return {
    ...sc,
    cfgNombre: cfg.nombre,
    subModo: cfg.subModo,
    conPersonaje: cfg.conPersonaje,
    subTop: cfg.subTop,
    subBottom: cfg.subBottom,
    personajeTop: cfg.personajeTop,
    lienzoTransform: cfg.lienzoTransform,
    analitico: {
      supIzq,
      supDer,
      infIzq,
      infDer,
      leftBottom
    }
  };
});

// Escribir HTML de test
const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1080px; height: 1920px; background: #000; overflow: hidden; position: relative; }
  #root-container { width: 1080px; height: 1920px; position: absolute; top: 0; left: 0; background: #0d1117; overflow: hidden; }
  .absolute-fill { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  #capa-ui { z-index: 20; }
  #scene-content-full { position: absolute; border: 0; margin: 0; padding: 0; }
  #scene-content-left { position: absolute; border: 0; margin: 0; padding: 0; }
  .dot { position: absolute; width: 0; height: 0; }
</style>
</head>
<body>
<div id="root-container">
  <div id="capa-ui" class="absolute-fill">
    <div id="lienzo" class="absolute-fill">
      <div id="scene-content-full"></div>
      <div id="scene-content-left"></div>
      <div id="p-sup-izq" class="dot"></div>
      <div id="p-inf-der" class="dot"></div>
    </div>
  </div>
</div>
<div id="results-json" style="display:none;"></div>
<script>
  const scenarios = ${JSON.stringify(enrichedScenarios)};
  const results = [];

  const capaUi = document.getElementById("capa-ui");
  const lienzo = document.getElementById("lienzo");
  const contentFull = document.getElementById("scene-content-full");
  const contentLeft = document.getElementById("scene-content-left");

  const pSupIzq = document.getElementById("p-sup-izq");
  const pInfDer = document.getElementById("p-inf-der");

  const rRoot = document.getElementById("root-container").getBoundingClientRect();

  scenarios.forEach(sc => {
    capaUi.style.transformOrigin = "540px 768px";
    capaUi.style.transform = sc.camCss;

    lienzo.style.transformOrigin = "540px 640px";
    lienzo.style.transform = sc.lienzoTransform;

    contentFull.style.left = "60px";
    contentFull.style.top = sc.localTop + "px";
    contentFull.style.width = "960px";
    contentFull.style.height = (sc.localBottom - sc.localTop) + "px";

    if (sc.subModo === "bloque") {
      contentLeft.style.display = "block";
      contentLeft.style.left = "60px";
      contentLeft.style.top = sc.localTop + "px";
      contentLeft.style.width = "460px";
      contentLeft.style.height = (960 - sc.localTop) + "px";
    } else {
      contentLeft.style.display = "none";
    }

    pSupIzq.style.left = "60px";
    pSupIzq.style.top = sc.localTop + "px";

    pInfDer.style.left = "1020px";
    pInfDer.style.top = sc.localBottom + "px";

    const rContent = contentFull.getBoundingClientRect();
    const rContentLeft = contentLeft.getBoundingClientRect();
    const rSupIzq = pSupIzq.getBoundingClientRect();
    const rInfDer = pInfDer.getBoundingClientRect();

    results.push({
      id: sc.id,
      desc: sc.desc,
      domData: {
        supIzq: [rSupIzq.left - rRoot.left, rSupIzq.top - rRoot.top],
        infDer: [rInfDer.left - rRoot.left, rInfDer.top - rRoot.top],
        leftBottom: sc.subModo === "bloque" ? rContentLeft.bottom - rRoot.top : null
      },
      analitico: sc.analitico
    });
  });

  const resEl = document.getElementById("results-json");
  resEl.textContent = JSON.stringify(results);
  resEl.style.display = "block";
</script>
</body>
</html>`;

const TEST_FILE = path.resolve(__dirname, "test_harness_clean.html");
fs.writeFileSync(TEST_FILE, htmlContent);

const chromeCmd = `"${CHROME_PATH}" --headless=new --dump-dom "file://${TEST_FILE}"`;
const output = execSync(chromeCmd, { maxBuffer: 10 * 1024 * 1024 }).toString();
const match = output.match(/<div id="results-json"[^>]*>([\s\S]*?)<\/div>/);
const results = JSON.parse(match[1]);

fs.writeFileSync(path.resolve(OUT_DIR, "chromium_cross_validation_41a4.json"), JSON.stringify(results, null, 2));

console.log("================================================================================");
console.log("VALIDACIÓN CRUZADA FORMAL: CHROMIUM BLINK DOM VS MODELO ANALÍTICO DE CÁMARA");
console.log("================================================================================\n");

console.log("| ID Escenario | Vértice Medido | Coordenada Analítica | Coordenada Chromium DOM | Discrepancia Absoluta Δ |");
console.log("|---|---|:---:|:---:|---:|");

let maxDelta = 0;

results.forEach(r => {
  const d = r.domData;
  const a = r.analitico;

  const deltaSupIzqX = Math.abs(d.supIzq[0] - a.supIzq[0]);
  const deltaSupIzqY = Math.abs(d.supIzq[1] - a.supIzq[1]);
  const deltaSupIzq = Math.max(deltaSupIzqX, deltaSupIzqY);

  const deltaInfDerX = Math.abs(d.infDer[0] - a.infDer[0]);
  const deltaInfDerY = Math.abs(d.infDer[1] - a.infDer[1]);
  const deltaInfDer = Math.max(deltaInfDerX, deltaInfDerY);

  if (deltaSupIzq > maxDelta) maxDelta = deltaSupIzq;
  if (deltaInfDer > maxDelta) maxDelta = deltaInfDer;

  console.log(`| ${r.id} | Sup-Izq (60, yTop) | (${a.supIzq[0].toFixed(2)}, ${a.supIzq[1].toFixed(2)}) | (${d.supIzq[0].toFixed(2)}, ${d.supIzq[1].toFixed(2)}) | ${deltaSupIzq.toFixed(4)} px |`);
  console.log(`| ${r.id} | Inf-Der (1020, yBot) | (${a.infDer[0].toFixed(2)}, ${a.infDer[1].toFixed(2)}) | (${d.infDer[0].toFixed(2)}, ${d.infDer[1].toFixed(2)}) | ${deltaInfDer.toFixed(4)} px |`);

  if (a.leftBottom !== null && d.leftBottom !== null) {
    const deltaLeft = Math.abs(d.leftBottom - a.leftBottom);
    if (deltaLeft > maxDelta) maxDelta = deltaLeft;
    console.log(`| ${r.id} | Sector Izq y=960 MaxY | ${a.leftBottom.toFixed(2)} px | ${d.leftBottom.toFixed(2)} px | ${deltaLeft.toFixed(4)} px |`);
  }
});

console.log(`\nDiscrepancia Máxima Global (Δmax): ${maxDelta.toFixed(6)} px`);
if (maxDelta < 0.05) {
  console.log("DICTAMEN CHROMIUM: CONCORDANCIA MATEMÁTICA PERFECTA (Δ < 0.05 px across all 14 scenarios).");
}

/**
 * ============================================================================
 * AUDITORÍA DE COBERTURA MATEMÁTICA COMPLETA Y RESOLUCIÓN DE LOS 720 ESTADOS
 * Etapa 41B.3 — Nexora Motion Reels (AgusVukusic/Nexora-Videos)
 * Archivo: tools/audit/audit_41b3_cobertura_completa.js
 * ============================================================================
 */

const fs = require('fs');

const W = 1080;
const H = 1920;
const originCamara = [W * 0.5, H * 0.4]; // [540, 768] px
const LIENZO = { x: 60, y: 210, w: 960, h: 860 };
const lx = LIENZO.x + LIENZO.w / 2; // 540
const ly = LIENZO.y + LIENZO.h / 2; // 640

const EASINGS = {
  lineal: (t) => t,
  suave: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2)
};

const MOVIMIENTOS_NATIVOS = [
  { id: "estatica", nombre: "Estática", escala: [1.0, 1.0], pos: [[0, 0], [0, 0]], rot: [0, 0], curva: "suave" },
  { id: "empuje", nombre: "Empuje", escala: [1.0, 1.05], pos: [[0, 0], [0, 0]], rot: [0, 0], curva: "suave" },
  { id: "paneo", nombre: "Paneo", escala: [1.0, 1.0], pos: [[-30, 0], [30, 0]], rot: [0, 0], curva: "suave" },
  { id: "orbital", nombre: "Orbital", escala: [1.02, 1.02], pos: [[0, 0], [0, 0]], rot: [-1.2, 1.2], curva: "suave" },
  { id: "zoom-in", nombre: "Zoom-In", escala: [1.0, 1.15], pos: [[0, 0], [0, -20]], rot: [0, 0], curva: "outCubic" },
  { id: "zoom-out", nombre: "Zoom-Out", escala: [1.15, 1.0], pos: [[0, -20], [0, 0]], rot: [0, 0], curva: "inOutCubic" },
  { id: "travel-in", nombre: "Travel-In", escala: [1.0, 1.12], pos: [[-40, 20], [0, 0]], rot: [0, 0], curva: "suave" },
  { id: "travel-out", nombre: "Travel-Out", escala: [1.12, 1.0], pos: [[0, 0], [40, -20]], rot: [0, 0], curva: "suave" }
];

const CONFIGURACIONES_ENTORNO = [
  {
    id: "linea_con_personaje",
    nombre: "Línea con Personaje",
    subModo: "linea",
    conPersonaje: true,
    zona: { x: 60, y: 210, w: 960, h: 860 },
    subTop: 1123.5,
    subBottom: 1208.5,
    personajeTop: 1262,
    personajeTopRespiracion: 1259,
    personajeX: [80, 520],
  },
  {
    id: "linea_sin_personaje",
    nombre: "Línea sin Personaje",
    subModo: "linea",
    conPersonaje: false,
    zona: { x: 60, y: 250, w: 960, h: 960 },
    subTop: 1283.5,
    subBottom: 1368.5,
    personajeTop: null,
    personajeTopRespiracion: null,
    personajeX: null,
  },
  {
    id: "bloque_con_personaje",
    nombre: "Bloque con Personaje",
    subModo: "bloque",
    conPersonaje: true,
    zona: { x: 60, y: 500, w: 960, h: 740 },
    subTop: 210,
    subBottom: 465,
    subX: [130, 1000],
    personajeTop: 1262,
    personajeTopRespiracion: 1259,
    personajeX: [80, 520],
  },
  {
    id: "bloque_sin_personaje",
    nombre: "Bloque sin Personaje",
    subModo: "bloque",
    conPersonaje: false,
    zona: { x: 60, y: 500, w: 960, h: 1000 },
    subTop: 210,
    subBottom: 465,
    subX: [130, 1000],
    personajeTop: null,
    personajeTopRespiracion: null,
    personajeX: null,
  }
];

const ESCENAS_LOTE1 = [
  { id: "titular", nombre: "Titular", bboxLocal: { xMin: 80, xMax: 1000, yMin: 230, yMax: 890 } },
  { id: "contador", nombre: "Contador", bboxLocal: { xMin: 100, xMax: 980, yMin: 370, yMax: 890 } },
  { id: "tachado", nombre: "Tachado", bboxLocal: { xMin: 100, xMax: 980, yMin: 310, yMax: 950 } },
  { id: "objecion", nombre: "Objeción", bboxLocal: { xMin: 100, xMax: 980, yMin: 250, yMax: 835 } },
  { id: "cta", nombre: "CTA", bboxLocal: { xMin: 80, xMax: 1000, yMin: 290, yMax: 971.5 } }
];

function getLienzoTransform(zona) {
  const s = Math.min(zona.w / LIENZO.w, zona.h / LIENZO.h);
  const cx = zona.x + zona.w / 2;
  const cy = zona.y + zona.h / 2;
  return { s, dx: cx - lx, dy: cy - ly };
}

function getCameraParamsAtFrame(mov, frame, durTotal = 90) {
  const progreso = Math.min(1, Math.max(0, frame / durTotal));
  const easingFn = EASINGS[mov.curva];
  const t = easingFn(progreso);

  const s = mov.escala[0] + (mov.escala[1] - mov.escala[0]) * t;
  const tx = mov.pos[0][0] + (mov.pos[1][0] - mov.pos[0][0]) * t;
  const ty = mov.pos[0][1] + (mov.pos[1][1] - mov.pos[0][1]) * t;
  const rot = mov.rot[0] + (mov.rot[1] - mov.rot[0]) * t;

  return { s, tx, ty, rot, progreso, t };
}

function projectPoint(pt, tLienzo, cam) {
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

function projectBBox(bbox, tLienzo, cam) {
  const corners = [
    [bbox.xMin, bbox.yMin],
    [bbox.xMax, bbox.yMin],
    [bbox.xMin, bbox.yMax],
    [bbox.xMax, bbox.yMax]
  ];
  const proj = corners.map(pt => projectPoint(pt, tLienzo, cam));
  return {
    xMin: Math.min(...proj.map(p => p[0])),
    xMax: Math.max(...proj.map(p => p[0])),
    yMin: Math.min(...proj.map(p => p[1])),
    yMax: Math.max(...proj.map(p => p[1]))
  };
}

console.log("================================================================================");
console.log("AUDITORÍA DE COBERTURA MATEMÁTICA Y TRAZABILIDAD FRAME A FRAME");
console.log("================================================================================\n");

// Comprobación de corrida a paso 2 (7,360 estados) vs paso 1 (14,560 estados)
console.log("--- Comparación de Densidad de Muestreo Temporal ---");

const runSimulation = (step) => {
  let evaluations = 0;
  const trajectories = [];

  ESCENAS_LOTE1.forEach(esc => {
    CONFIGURACIONES_ENTORNO.forEach(cfg => {
      const tLienzo = getLienzoTransform(cfg.zona);

      MOVIMIENTOS_NATIVOS.forEach(mov => {
        let minMargin = 9999;
        let worstFrame = -1;
        let worstBBox = null;
        let limitante = "";

        for (let f = 0; f <= 90; f += step) {
          evaluations++;
          const cam = getCameraParamsAtFrame(mov, f, 90);
          const bProj = projectBBox(esc.bboxLocal, tLienzo, cam);

          let mSub = 9999;
          if (cfg.subModo === "linea") {
            mSub = cfg.subTop - bProj.yMax;
          } else if (cfg.subModo === "bloque") {
            mSub = bProj.yMin - cfg.subBottom;
          }

          let mPers = 9999;
          if (cfg.conPersonaje && bProj.xMin <= cfg.personajeX[1]) {
            mPers = cfg.personajeTopRespiracion - bProj.yMax;
          }

          const current = Math.min(mSub, mPers);
          if (current < minMargin) {
            minMargin = current;
            worstFrame = f;
            worstBBox = bProj;
            limitante = mSub < mPers ? "Subtítulos" : "Personaje";
          }
        }

        trajectories.push({
          escena: esc.id,
          config: cfg.id,
          mov: mov.id,
          minMargin,
          worstFrame,
          worstBBox,
          limitante
        });
      });
    });
  });

  return { evaluations, trajectories };
};

const resStep2 = runSimulation(2); // Script audit_41b2
const resStep1 = runSimulation(1); // Muestreo exhaustivo frame a frame

console.log(`Evaluaciones a paso 2 (f=0,2..90): ${resStep2.evaluations} estados`);
console.log(`Evaluaciones a paso 1 (f=0,1..90): ${resStep1.evaluations} estados`);
console.log(`Total trayectorias evaluadas en ambos: ${resStep1.trajectories.length} (5 x 4 x 8 = 160)`);

// Comprobar si hay alguna discrepancia en el margen mínimo o peor frame entre paso 2 y paso 1
let diffCount = 0;
for (let i = 0; i < resStep1.trajectories.length; i++) {
  const t1 = resStep1.trajectories[i];
  const t2 = resStep2.trajectories[i];
  const marginDiff = Math.abs(t1.minMargin - t2.minMargin);
  if (marginDiff > 0.01) {
    diffCount++;
    console.log(`Diferencia detectada en ${t1.escena}-${t1.config}-${t1.mov}: paso1=${t1.minMargin.toFixed(2)} (f=${t1.worstFrame}) vs paso2=${t2.minMargin.toFixed(2)} (f=${t2.worstFrame})`);
  }
}

console.log(`Diferencias de margen > 0.01 px entre paso 1 y paso 2: ${diffCount}`);
if (diffCount === 0) {
  console.log("-> Conclusión: El muestreo a paso 2 (46 frames) captura con 100% de precisión matemática los mismos puntos extremos que el muestreo a paso 1 (91 frames), debido a la monotonía y curvatura de las funciones de Remotion.");
}

// Guardar la matriz completa de las 160 trayectorias
fs.writeFileSync('tools/audit/matrix_160_trajectories.json', JSON.stringify(resStep1.trajectories, null, 2));
console.log("Matriz de 160 trayectorias guardada en tools/audit/matrix_160_trajectories.json");

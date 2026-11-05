import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "../../../..");
const PROJECT_DIR = path.resolve(WORKSPACE, "reel-microondas");

// Import Remotion bundler and renderer from installed node_modules
const bundlerPath = pathToFileURL(path.resolve(PROJECT_DIR, "node_modules/@remotion/bundler/dist/index.js")).href;
const rendererPath = pathToFileURL(path.resolve(PROJECT_DIR, "node_modules/@remotion/renderer/dist/index.js")).href;

const { bundle } = await import(bundlerPath);
const { renderMedia, selectComposition } = await import(rendererPath);

const SALIDA_DIR = path.resolve(__dirname, "salida");
const FRAMES_DIR = path.resolve(SALIDA_DIR, "frames");

fs.mkdirSync(SALIDA_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

// Read browser path
const entornoPath = path.resolve(PROJECT_DIR, "entorno.json");
const entorno = fs.existsSync(entornoPath) ? JSON.parse(fs.readFileSync(entornoPath, "utf8")) : {};
const navegador = entorno.navegador || "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

console.log("=== INICIO DE RENDER REAL — ETAPA 5.4 (NEXORA-REELS) ===");
console.log(`Chromium: ${navegador}`);
console.log(`Public Dir: ${path.resolve(PROJECT_DIR, "public")}`);
console.log(`Salida: ${SALIDA_DIR}`);

// 1. Empaquetar composicion principal de nexora-reels
console.log("\n[1/5] Empaquetando assets/plantilla/src/index.ts con @remotion/bundler...");
const tInicioBundle = Date.now();
const bundleLocation = await bundle({
  entryPoint: path.resolve(__dirname, "../assets/plantilla/src/index.ts"),
  publicDir: path.resolve(PROJECT_DIR, "public"),
  webpackOverride: (currentConfig) => {
    return {
      ...currentConfig,
      resolve: {
        ...currentConfig.resolve,
        modules: [
          path.resolve(PROJECT_DIR, "node_modules"),
          ...(currentConfig.resolve?.modules || ["node_modules"]),
        ],
      },
    };
  },
});
console.log(`Bundle completado en ${((Date.now() - tInicioBundle) / 1000).toFixed(2)}s`);

// 2. Preparar props de prueba para integracion completa
// Incluye: 3 escenas consecutivas (titular, imagen, cta), 3 transiciones (corte, suave, deslizar-arriba),
// subtitulos foneticos Whisper, SFX (pop, tecla, exito), personaje activo con cambio de pose (normal -> habla -> normal),
// estilo 'nexora' y escena de imagen con efectos de agua y causticas.
const testPlan = {
  titulo: "Demostracion Nexora Reels",
  estilo: "nexora",
  subtitulos: "linea",
  personaje: true,
  frases: [
    {
      texto: "Bienvenidos a *Nexora Motion Reels.*",
      emocion: "[excited]",
      escena: {
        tipo: "titular",
        etiqueta: "NEXORA",
        texto: "Bienvenidos a / *Nexora Motion Reels*",
        icono: "sparkles",
        en: ["Reels"]
      },
      sonidos: [["inicio", "pop", 0.5]],
      poses: [["inicio", "normal"]]
    },
    {
      texto: "Un motor cinematografico *con fisicas reales.*",
      emocion: "[confident]",
      escena: {
        tipo: "imagen",
        imagen: "texturas/causticas.png",
        formato: "horizontal",
        efectos: ["agua", "causticas", "flotar"],
        en: ["cinematografico", "reales"]
      },
      sonidos: [["inicio", "whoosh", 0.4]],
      poses: [["inicio", "habla"]]
    },
    {
      texto: "Crea contenido vertical *a maxima velocidad.*",
      emocion: "[excited]",
      escena: {
        tipo: "cta",
        palabra: "NEXORA",
        texto: "siguenos para / mas contenido",
        en: ["vertical", "velocidad"]
      },
      sonidos: [["inicio", "exito", 0.5]],
      poses: [["inicio", "normal"]]
    }
  ],
  portada: {
    etiqueta: "NEXORA",
    lineas: ["MOTOR", "VISUAL", "*NEXORA*"],
    icono: "clapperboard"
  }
};

const testEscenas = [
  {
    i: 0,
    ini: 0,
    fin: 60,
    dur: 60,
    entrada: "corte",
    salida: "corte",
    p: testPlan.frases[0].escena,
    b: [15],
    palabras: [
      { w: "Bienvenidos", f: 3, clave: false, g: -1 },
      { w: "a", f: 12, clave: false, g: -1 },
      { w: "Nexora", f: 18, clave: true, g: 1 },
      { w: "Motion", f: 30, clave: true, g: 1 },
      { w: "Reels", f: 42, clave: true, g: 1 }
    ]
  },
  {
    i: 1,
    ini: 60,
    fin: 135,
    dur: 75,
    entrada: "suave",
    salida: "corte",
    p: testPlan.frases[1].escena,
    b: [10, 35],
    palabras: [
      { w: "Un", f: 3, clave: false, g: -1 },
      { w: "motor", f: 9, clave: false, g: -1 },
      { w: "cinematografico", f: 21, clave: false, g: -1 },
      { w: "con", f: 36, clave: false, g: -1 },
      { w: "fisicas", f: 45, clave: true, g: 2 },
      { w: "reales", f: 57, clave: true, g: 2 }
    ]
  },
  {
    i: 2,
    ini: 135,
    fin: 210,
    dur: 75,
    entrada: "deslizar-arriba",
    salida: "corte",
    p: testPlan.frases[2].escena,
    b: [10, 30, 50],
    palabras: [
      { w: "Crea", f: 3, clave: false, g: -1 },
      { w: "contenido", f: 12, clave: false, g: -1 },
      { w: "vertical", f: 24, clave: true, g: 3 },
      { w: "a", f: 39, clave: false, g: -1 },
      { w: "maxima", f: 45, clave: true, g: 4 },
      { w: "velocidad", f: 54, clave: true, g: 4 }
    ]
  }
];

const testFrasesT = [
  {
    inicio: 0.0,
    fin: 2.0,
    texto: "Bienvenidos a Nexora Motion Reels.",
    palabras: [
      { w: "Bienvenidos", t: 0.1, clave: false, g: -1 },
      { w: "a", t: 0.4, clave: false, g: -1 },
      { w: "Nexora", t: 0.6, clave: true, g: 1 },
      { w: "Motion", t: 1.0, clave: true, g: 1 },
      { w: "Reels.", t: 1.4, clave: true, g: 1 }
    ]
  },
  {
    inicio: 2.0,
    fin: 4.5,
    texto: "Un motor cinematografico con fisicas reales.",
    palabras: [
      { w: "Un", t: 2.1, clave: false, g: -1 },
      { w: "motor", t: 2.3, clave: false, g: -1 },
      { w: "cinematografico", t: 2.7, clave: false, g: -1 },
      { w: "con", t: 3.2, clave: false, g: -1 },
      { w: "fisicas", t: 3.5, clave: true, g: 2 },
      { w: "reales.", t: 3.9, clave: true, g: 2 }
    ]
  },
  {
    inicio: 4.5,
    fin: 7.0,
    texto: "Crea contenido vertical a maxima velocidad.",
    palabras: [
      { w: "Crea", t: 4.6, clave: false, g: -1 },
      { w: "contenido", t: 4.9, clave: false, g: -1 },
      { w: "vertical", t: 5.3, clave: true, g: 3 },
      { w: "a", t: 5.8, clave: false, g: -1 },
      { w: "maxima", t: 6.0, clave: true, g: 4 },
      { w: "velocidad.", t: 6.3, clave: true, g: 4 }
    ]
  }
];

const testPoses = {
  _referencia: "normal",
  normal: {
    src: "texturas/grano.png",
    ancho: 400,
    alto: 600,
    cabeza: 0.5,
    anchoCabeza: 200,
    peloArriba: 30
  },
  habla: {
    src: "texturas/causticas.png",
    ancho: 400,
    alto: 600,
    cabeza: 0.5,
    anchoCabeza: 200,
    peloArriba: 30
  }
};

const testCambiosPose = [
  { desde: 0, pose: "normal" },
  { desde: 60, pose: "habla" },
  { desde: 135, pose: "normal" }
];

const testEfectos = [
  { en: 5, s: "pop", vol: 0.5 },
  { en: 65, s: "tecla", vol: 0.4 },
  { en: 140, s: "exito", vol: 0.5 }
];

// Estilo Nexora
const testEstilo = {
  nombre: "nexora",
  familia: "suave",
  colores: {
    fondo: "#0a0c10",
    fondo2: "#141820",
    borde: "#2a324b",
    texto: "#f0f4fc",
    manchas: ["#0055ff", "#7928ca", "#00d4ff"],
    acento: "#00f0ff",
    acentoTexto: "#0a0c10",
    oscuro: "#06080c",
    mutado: "#6b7c96",
    acento2: "#ff007a"
  },
  grano: 0.05
};

const inputProps = {
  plan: testPlan,
  escenas: testEscenas,
  frasesT: testFrasesT,
  sinSubtitulos: [],
  subtitulos: "linea",
  conPersonaje: true,
  poses: testPoses,
  cambiosPose: testCambiosPose,
  efectos: testEfectos,
  estilo: testEstilo,
  hayVoz: true,
  vozSrc: "voz.wav"
};

// 3. Seleccionar composicion Reel
console.log("\n[2/5] Seleccionando composicion 'Reel' con metadatos dinamicos...");
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "Reel",
  inputProps,
  browserExecutable: navegador,
});

console.log("Composicion 'Reel' resuelta exitosamente:");
console.log(`- Duracion: ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(2)}s)`);
console.log(`- Resolucion: ${composition.width}x${composition.height}`);
console.log(`- FPS: ${composition.fps}`);

// 4. Renderizar a MP4
const outputVideo = path.resolve(SALIDA_DIR, "reel_integracion_5_4.mp4");
console.log(`\n[3/5] Renderizando video a ${outputVideo}...`);
const tInicioRender = Date.now();

let ultLog = 0;
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: outputVideo,
  inputProps,
  chromiumOptions: {
    executablePath: navegador,
  },
  concurrency: 2,
  onProgress: ({ renderedFrames, encodedFrames }) => {
    const ahora = Date.now();
    if (ahora - ultLog > 2000 || renderedFrames === composition.durationInFrames) {
      ultLog = ahora;
      const pct = ((renderedFrames / composition.durationInFrames) * 100).toFixed(1);
      console.log(`Progreso: ${renderedFrames}/${composition.durationInFrames} frames (${pct}%)`);
    }
  },
});
const durRender = ((Date.now() - tInicioRender) / 1000).toFixed(2);
console.log(`Render completado exitosamente en ${durRender}s`);

// 5. Verificar archivo de video resultante
console.log("\n[4/5] Verificando video MP4 con FFprobe...");
const stats = fs.statSync(outputVideo);
const hash = crypto.createHash("sha256").update(fs.readFileSync(outputVideo)).digest("hex");
console.log(`Tamano del archivo: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);
console.log(`SHA-256: ${hash}`);

const probeResult = spawnSync("ffprobe", [
  "-v", "error",
  "-show_entries", "format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate,duration",
  "-of", "json",
  outputVideo
], { encoding: "utf8" });

console.log("Metadatos FFprobe:");
console.log(probeResult.stdout);

// 6. Extraer fotogramas clave con FFmpeg
console.log("\n[5/5] Extrayendo fotogramas clave para auditoria forense...");
const framesToExtract = [
  { frame: 10, label: "01_titular_intro" },
  { frame: 35, label: "02_titular_enfasis_nexora" },
  { frame: 60, label: "03_transicion_suave_a_imagen" },
  { frame: 95, label: "04_imagen_causticas_habla" },
  { frame: 135, label: "05_transicion_cta_slideup" },
  { frame: 175, label: "06_cta_final_subtitulos" },
];

for (const { frame, label } of framesToExtract) {
  const framePath = path.resolve(FRAMES_DIR, `frame_${label}_f${frame}.png`);
  // FFmpeg extraction using select filter
  execFileSync("ffmpeg", [
    "-y",
    "-i", outputVideo,
    "-vf", `select=eq(n\\,${frame})`,
    "-vframes", "1",
    framePath
  ]);
  const frameStats = fs.statSync(framePath);
  console.log(`- Frame ${frame} (${label}): ${frameStats.size} bytes -> ${path.basename(framePath)}`);
}

console.log("\n=== PRUEBA DE RENDER REAL ETAPA 5.4 FINALIZADA CON EXITO ===");

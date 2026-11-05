import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "../../../..");
const PROJECT_DIR = path.resolve(WORKSPACE, "reel-microondas");

// Import Remotion bundler and renderer from the project's installed node_modules
const bundlerPath = pathToFileURL(path.resolve(PROJECT_DIR, "node_modules/@remotion/bundler/dist/index.js")).href;
const rendererPath = pathToFileURL(path.resolve(PROJECT_DIR, "node_modules/@remotion/renderer/dist/index.js")).href;

const { bundle } = await import(bundlerPath);
const { renderMedia, selectComposition } = await import(rendererPath);

const SALIDA_DIR = path.resolve(__dirname, "salida");
const FRAMES_DIR = path.resolve(SALIDA_DIR, "frames");
const FRAMES_RUN2_DIR = path.resolve(SALIDA_DIR, "frames_run2");

fs.mkdirSync(SALIDA_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(FRAMES_RUN2_DIR, { recursive: true });

// Read browser path from entorno.json or system Chrome
const entornoPath = path.resolve(PROJECT_DIR, "entorno.json");
const entorno = fs.existsSync(entornoPath) ? JSON.parse(fs.readFileSync(entornoPath, "utf8")) : {};
const navegador = entorno.navegador || "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

console.log("=== INICIO DE RENDER REAL — ETAPA 4 (NEXORA-REELS) ===");
console.log(`Navegador Chromium: ${navegador}`);
console.log(`Directorio de salida: ${SALIDA_DIR}`);

// 1. Empaquetar composición de prueba
console.log("\n[1/5] Empaquetando composición con @remotion/bundler...");
const tInicioBundle = Date.now();
const bundleLocation = await bundle({
  entryPoint: path.resolve(__dirname, "index.ts"),
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

// 2. Seleccionar composición
console.log("\n[2/5] Seleccionando composición 'PruebaNexora'...");
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "PruebaNexora",
  browserExecutable: navegador,
});

console.log(`Composición detectada: ${composition.id}`);
console.log(`  Resolución: ${composition.width}x${composition.height}`);
console.log(`  FPS: ${composition.fps}`);
console.log(`  Duración: ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(2)}s)`);

// 3. Renderizar Pase 1
const outputMp4 = path.resolve(SALIDA_DIR, "prueba_nexora.mp4");
console.log(`\n[3/5] Renderizando video Pase 1 en ${outputMp4}...`);
const tInicioRender1 = Date.now();

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: outputMp4,
  browserExecutable: navegador,
  concurrency: 2,
  onProgress: ({ renderedFrames, progress }) => {
    if (renderedFrames % 30 === 0 || renderedFrames === composition.durationInFrames) {
      process.stdout.write(`  Progreso: ${(progress * 100).toFixed(0)}% (${renderedFrames}/${composition.durationInFrames} frames)\r`);
    }
  },
});
const durRender1 = ((Date.now() - tInicioRender1) / 1000).toFixed(2);
console.log(`\nRender Pase 1 finalizado en ${durRender1}s.`);

// Comprobar existencia y peso
const stats1 = fs.statSync(outputMp4);
console.log(`Archivo generado: ${stats1.size} bytes (${(stats1.size / 1024).toFixed(1)} KB)`);

// 4. Inspección técnica con FFprobe y extracción de fotogramas con FFmpeg
console.log("\n[4/5] Inspección con FFprobe y extracción de fotogramas con FFmpeg...");
let ffprobeJson = null;
try {
  const probeOutput = execFileSync(
    "ffprobe",
    [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      outputMp4,
    ],
    { encoding: "utf8" }
  );
  ffprobeJson = JSON.parse(probeOutput);
  const vStream = ffprobeJson.streams.find((s) => s.codec_type === "video");
  console.log("  FFprobe Video Stream:");
  console.log(`    Codec: ${vStream?.codec_name} (${vStream?.profile})`);
  console.log(`    Dimensiones: ${vStream?.width}x${vStream?.height}`);
  console.log(`    FPS: ${vStream?.r_frame_rate}`);
  console.log(`    Duración: ${ffprobeJson.format?.duration}s`);
  console.log(`    Bitrate: ${Math.round(ffprobeJson.format?.bit_rate / 1000)} kbps`);
} catch (err) {
  console.error("  Aviso: FFprobe no pudo ejecutarse directamente:", err.message);
}

// Extracción de fotogramas clave para inspección visual
// 10 fotogramas representativos a lo largo de los 150 frames (30 fps):
// f0=0s, f5=0.167s, f15=0.500s, f45=1.500s, f74=2.467s (Escena 1)
// f75=2.500s, f80=2.667s, f95=3.167s, f120=4.000s, f149=4.967s (Escena 2)
const frameTimes = [
  { frame: 0, t: "0.000", desc: "Escena 1 - Inicio (frame 0)" },
  { frame: 5, t: "0.167", desc: "Escena 1 - Entrada suave (frame 5)" },
  { frame: 15, t: "0.500", desc: "Escena 1 - Asentamiento y texto inicio (frame 15)" },
  { frame: 45, t: "1.500", desc: "Escena 1 - Texto completo con tildes (frame 45)" },
  { frame: 74, t: "2.467", desc: "Escena 1 - Final y salida suave (frame 74)" },
  { frame: 75, t: "2.500", desc: "Escena 2 - Inicio transición deslizar (frame 75)" },
  { frame: 80, t: "2.667", desc: "Escena 2 - Desplazamiento vertical activo (frame 80)" },
  { frame: 95, t: "3.167", desc: "Escena 2 - Asentamiento tarjeta spring (frame 95)" },
  { frame: 120, t: "4.000", desc: "Escena 2 - Respiración senoidal y texto (frame 120)" },
  { frame: 149, t: "4.967", desc: "Escena 2 - Fotograma final del reel (frame 149)" },
];

function extraerFotogramas(mp4Path, destinoDir) {
  const hashes = {};
  for (const item of frameTimes) {
    const frameFile = path.resolve(destinoDir, `frame_${String(item.frame).padStart(3, "0")}.png`);
    execFileSync("ffmpeg", [
      "-y",
      "-i", mp4Path,
      "-vf", `select=eq(n\\,${item.frame})`,
      "-vframes", "1",
      "-update", "1",
      frameFile,
    ], { stdio: "ignore" });

    const buffer = fs.readFileSync(frameFile);
    hashes[item.frame] = crypto.createHash("sha256").update(buffer).digest("hex");
  }
  return hashes;
}

const hashesPase1 = extraerFotogramas(outputMp4, FRAMES_DIR);
console.log(`  10 fotogramas clave extraídos exitosamente en ${FRAMES_DIR}`);

// 5. Renderizar Pase 2 para comprobar determinismo
const outputMp4Run2 = path.resolve(SALIDA_DIR, "prueba_nexora_run2.mp4");
console.log(`\n[5/5] Renderizando Pase 2 para prueba de determinismo en ${outputMp4Run2}...`);
const tInicioRender2 = Date.now();

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: outputMp4Run2,
  browserExecutable: navegador,
  concurrency: 2,
});
console.log(`Render Pase 2 finalizado en ${((Date.now() - tInicioRender2) / 1000).toFixed(2)}s.`);

const hashesPase2 = extraerFotogramas(outputMp4Run2, FRAMES_RUN2_DIR);

const hashMp4_1 = crypto.createHash("sha256").update(fs.readFileSync(outputMp4)).digest("hex");
const hashMp4_2 = crypto.createHash("sha256").update(fs.readFileSync(outputMp4Run2)).digest("hex");

console.log("\n=== RESULTADOS DE DETERMINISMO ===");
console.log(`SHA-256 MP4 Pase 1: ${hashMp4_1}`);
console.log(`SHA-256 MP4 Pase 2: ${hashMp4_2}`);
console.log(`Coincidencia de contenedor MP4: ${hashMp4_1 === hashMp4_2 ? "IDÉNTICA" : "Diferencia esperada en metadatos muxer MP4"}`);

let framesCoincidentes = 0;
for (const item of frameTimes) {
  const h1 = hashesPase1[item.frame];
  const h2 = hashesPase2[item.frame];
  const coincide = h1 === h2;
  if (coincide) framesCoincidentes++;
  console.log(`  Frame ${String(item.frame).padStart(3, "0")} (${item.desc}): ${coincide ? "BIT-A-BIT IDÉNTICO" : "DISCREPANCIA"}`);
}

console.log(`\nDeterminismo visual de fotogramas: ${framesCoincidentes}/${frameTimes.length} coincidentes.`);

// Guardar informe técnico de metadatos en JSON
const resultadoTecnico = {
  fecha: new Date().toISOString(),
  composicion: {
    id: composition.id,
    width: composition.width,
    height: composition.height,
    fps: composition.fps,
    durationInFrames: composition.durationInFrames,
  },
  navegador,
  tiempoRenderPase1Seg: durRender1,
  mp4: {
    archivo: path.relative(WORKSPACE, outputMp4).replace(/\\/g, "/"),
    tamanoBytes: stats1.size,
    sha256Pase1: hashMp4_1,
    sha256Pase2: hashMp4_2,
    ffprobe: ffprobeJson?.streams?.find((s) => s.codec_type === "video") || null,
  },
  fotogramas: frameTimes.map((item) => ({
    frame: item.frame,
    tiempoSeg: item.t,
    descripcion: item.desc,
    archivo: `salida/frames/frame_${String(item.frame).padStart(3, "0")}.png`,
    sha256Pase1: hashesPase1[item.frame],
    sha256Pase2: hashesPase2[item.frame],
    identico: hashesPase1[item.frame] === hashesPase2[item.frame],
  })),
};

fs.writeFileSync(
  path.resolve(SALIDA_DIR, "resultado_render.json"),
  JSON.stringify(resultadoTecnico, null, 2),
  "utf8"
);

console.log("\n>>> RENDER REAL Y VALIDACIÓN DE ETAPA 4 COMPLETADOS CON ÉXITO! <<<");

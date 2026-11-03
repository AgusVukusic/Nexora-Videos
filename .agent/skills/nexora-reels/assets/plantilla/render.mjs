// render.mjs — renderizado local ultrarrápido y robusto de Remotion
//
// Comandos disponibles:
//   node render.mjs              -> resumen del plan
//   node render.mjs resumen      -> duración, escenas, momentos de corte y problemas
//   node render.mjs fotos        -> hoja de contacto (salida/hoja.png) con un fotograma por escena
//   node render.mjs fotos 0.5    -> hoja de contacto cada medio segundo
//   node render.mjs foto 12.5    -> fotograma suelto en salida/foto_12.50.png
//   node render.mjs video        -> render por trozos en salida/reel.mp4 (1080x1920 a 30 fps)
//   node render.mjs video --borrador -> rápido a mitad de resolución (540x960, crf 26)
//   node render.mjs portada      -> salida/portada.png y comprobación del recorte 3:4

import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// En Windows Remotion a veces escupe avisos de memoria en stderr aunque el render vaya perfecto.
// Los silenciamos para no alarmar al usuario si el proceso termina bien.
const RUIDO = /Memory reported by|inadvertently set the --max-old-space-size/i;

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.join(RAIZ, "salida");
const TROZOS = path.join(SALIDA, "trozos");

const args = process.argv.slice(2);
const cmd = args[0] ?? "resumen";
const opt = (n, def) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const flag = (n) => args.includes(`--${n}`);

const t0 = Date.now();
const seg = () => ((Date.now() - t0) / 1000).toFixed(1);

// Límite de tiempo por ejecución: si se supera se para limpiamente y se puede reanudar
const MAX_SEG = Number(opt("max-segundos", 270));
// Límite de tamaño del MP4 final (en MB): si lo supera se recomprime para que quepa
const LIMITE_MB = Number(opt("limite-mb", 28));

// ------------------------------------------------------------ entorno (navegador)
const entorno = fs.existsSync(path.join(RAIZ, "entorno.json")) ? JSON.parse(fs.readFileSync(path.join(RAIZ, "entorno.json"), "utf8")) : {};
let navegador = process.env.BROWSER_EXECUTABLE || entorno.navegador || undefined;
const modoChrome = entorno.modo || (navegador && /headless[-_]?shell/i.test(navegador) ? "chrome-headless-shell" : "chrome");
const opcNav = { browserExecutable: navegador, chromeMode: modoChrome };

// Versiones de caché independientes para bundle, vídeo y audio
const CACHE_BUNDLE_VERSION = "bundle-v1";
const CACHE_VIDEO_VERSION = "video-v2";
const CACHE_AUDIO_VERSION = "audio-v3";

// ------------------------------------------------------------ ffmpeg
let _ffmpegBin = null;
const ffmpeg = () => {
  if (_ffmpegBin) return _ffmpegBin;
  if (entorno.ffmpeg && fs.existsSync(entorno.ffmpeg)) {
    return (_ffmpegBin = entorno.ffmpeg);
  }
  for (const n of ["ffmpeg", "ffmpeg.exe"]) {
    try {
      execFileSync(n, ["-version"], { stdio: "ignore" });
      return (_ffmpegBin = n);
    } catch {}
  }
  const remotionDir = path.join(RAIZ, "node_modules", "@remotion");
  if (fs.existsSync(remotionDir)) {
    try {
      for (const d of fs.readdirSync(remotionDir)) {
        if (d.startsWith("compositor-")) {
          for (const bin of ["ffmpeg.exe", "ffmpeg"]) {
            const p = path.join(remotionDir, d, bin);
            if (fs.existsSync(p)) return (_ffmpegBin = p);
          }
        }
      }
    } catch {}
  }
  return (_ffmpegBin = "ffmpeg");
};

let _ffprobeBin = null;
const ffprobe = () => {
  if (_ffprobeBin) return _ffprobeBin;
  if (entorno.ffprobe && fs.existsSync(entorno.ffprobe)) {
    return (_ffprobeBin = entorno.ffprobe);
  }
  const binFfmpeg = ffmpeg();
  const candidato = binFfmpeg.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");
  if (candidato !== binFfmpeg && fs.existsSync(candidato)) {
    return (_ffprobeBin = candidato);
  }
  for (const n of ["ffprobe", "ffprobe.exe"]) {
    try {
      execFileSync(n, ["-version"], { stdio: "ignore" });
      return (_ffprobeBin = n);
    } catch {}
  }
  const remotionDir = path.join(RAIZ, "node_modules", "@remotion");
  if (fs.existsSync(remotionDir)) {
    try {
      for (const d of fs.readdirSync(remotionDir)) {
        if (d.startsWith("compositor-")) {
          for (const bin of ["ffprobe.exe", "ffprobe"]) {
            const p = path.join(remotionDir, d, bin);
            if (fs.existsSync(p)) return (_ffprobeBin = p);
          }
        }
      }
    } catch {}
  }
  return (_ffprobeBin = "ffprobe");
};

const ff = (argumentos) => {
  const res = spawnSync(ffmpeg(), argumentos, { encoding: "utf8" });
  if (res.status !== 0) {
    const err = (res.stderr || res.stdout || "").trim();
    throw new Error(`ffmpeg falló (${res.status}): ${err.slice(-400)}`);
  }
  return res.stdout;
};

// Comprueba que un trozo .mp4 existe, tiene tamaño razonable y ffprobe lo lee entero
const validarTrozo = (archivo) => {
  if (!fs.existsSync(archivo)) return false;
  if (fs.statSync(archivo).size < 1000) return false;
  const probe = spawnSync(ffprobe(), ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", archivo], { encoding: "utf8" });
  return probe.status === 0 && Number(probe.stdout.trim()) > 0;
};

// ------------------------------------------------------------ audio (mezcla ffmpeg)
// Mezcla la voz y los efectos en un solo archivo WAV estéreo a 48 kHz.
// Usar ffmpeg fuera de Remotion evita bugs de audio desincronizado al renderizar por trozos.
const mezclarAudio = (a, fps, destino) => {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const voz = a.voz ? path.join(RAIZ, "public", a.voz) : null;
  const efectos = a.efectos || [];
  // Duración de audio calibrada para cubrir exactamente la totalidad de fotogramas sin truncar el stream final
  const totalSeg = ((a.fotogramas + 0.05) / fps).toFixed(4);

  // Si no hay voz ni efectos, generamos silencio de la duración exacta
  if (!voz && !efectos.length) {
    ff(["-f", "lavfi", "-i", `anullsrc=r=48000:cl=stereo`, "-t", totalSeg, "-y", destino]);
    return;
  }

  const inputs = [];
  const filtros = [];
  let idx = 0;

  if (voz && fs.existsSync(voz)) {
    inputs.push("-i", voz);
    filtros.push(`[${idx}:a]atrim=0:${totalSeg},asetpts=PTS-STARTPTS,aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo[a_voz]`);
    idx++;
  } else {
    inputs.push("-f", "lavfi", "-i", `anullsrc=r=48000:cl=stereo`);
    filtros.push(`[${idx}:a]atrim=0:${totalSeg},asetpts=PTS-STARTPTS[a_voz]`);
    idx++;
  }

  const etiquetasEfectos = [];
  for (const [i, e] of efectos.entries()) {
    const arch = path.join(RAIZ, "public", "sonidos", `${e.s}.wav`);
    if (!fs.existsSync(arch)) continue;
    const delayMs = Math.max(0, Math.round((e.en / fps) * 1000));
    const vol = typeof e.vol === "number" ? e.vol : 1;
    inputs.push("-i", arch);
    const tag = `a_fx${i}`;
    filtros.push(`[${idx}:a]volume=${vol.toFixed(2)},adelay=${delayMs}|${delayMs},aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo[${tag}]`);
    etiquetasEfectos.push(`[${tag}]`);
    idx++;
  }

  if (etiquetasEfectos.length) {
    const todos = `[a_voz]${etiquetasEfectos.join("")}`;
    filtros.push(`${todos}amix=inputs=${etiquetasEfectos.length + 1}:duration=first:dropout_transition=0,volume=${etiquetasEfectos.length + 1},apad[a_final]`);
  } else {
    filtros.push(`[a_voz]aresample=48000,apad[a_final]`);
  }

  ff([...inputs, "-filter_complex", filtros.join(";"), "-map", "[a_final]", "-c:a", "pcm_s16le", "-t", totalSeg, "-y", destino]);
};

// ------------------------------------------------------------ empaquetado y huellas de caché
// Huella general para el empaquetado de Webpack (se invalida si cambia cualquier archivo de código o recurso).
const huella = () => {
  const h = crypto.createHash("sha256");
  h.update(CACHE_BUNDLE_VERSION);
  const recorrer = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) recorrer(p);
      else {
        const rel = path.relative(RAIZ, p).replace(/\\/g, "/");
        h.update(rel);
        h.update(fs.readFileSync(p));
      }
    }
  };
  recorrer(path.join(RAIZ, "src"));
  recorrer(path.join(RAIZ, "public"));
  return h.digest("hex").slice(0, 24);
};

// Huella de render visual (para trozos de vídeo):
// Recorre src/ (código, escenas, datos) excluyendo el campo .portada de plan.json.
// Recorre public/ (fuentes, texturas, personaje, fotos) EXCLUYENDO expresamente recursos exclusivamente sonoros
// (public/sonidos/ y public/voz.*), ya que los trozos de Remotion se renderizan mudos (muted: true)
// y el audio se mezcla externamente mediante FFmpeg.
const huellaVideo = () => {
  const h = crypto.createHash("sha256");
  h.update(CACHE_VIDEO_VERSION);
  h.update("codec:h264:yuv420p:veryfast:jpeg:92");
  const plan = path.join(RAIZ, "src", "datos", "plan.json");

  const recorrerSrc = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) recorrerSrc(p);
      else if (p === plan) {
        try {
          const j = JSON.parse(fs.readFileSync(p, "utf8"));
          delete j.portada;
          delete j.sonidos;
          delete j.audio;
          if (Array.isArray(j.frases)) {
            j.frases = j.frases.map((f) => {
              if (!f || typeof f !== "object") return f;
              const fCopy = { ...f };
              delete fCopy.sonidos;
              return fCopy;
            });
          }
          h.update(`plan:${JSON.stringify(j)}`);
        } catch {
          h.update(fs.readFileSync(p));
        }
      } else {
        const rel = path.relative(path.join(RAIZ, "src"), p).replace(/\\/g, "/");
        h.update(rel);
        h.update(fs.readFileSync(p));
      }
    }
  };

  const recorrerPublic = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      const rel = path.relative(path.join(RAIZ, "public"), p).replace(/\\/g, "/");
      const esAudio =
        rel === "sonidos" ||
        rel.startsWith("sonidos/") ||
        /^voz(\..+)?$/i.test(rel) ||
        /\.(wav|mp3|m4a|ogg|aac|flac)(\.(tmp|bak))?$/i.test(rel);
      if (esAudio) {
        continue;
      }
      if (e.isDirectory()) recorrerPublic(p);
      else {
        h.update(rel);
        h.update(fs.readFileSync(p));
      }
    }
  };

  recorrerSrc(path.join(RAIZ, "src"));
  recorrerPublic(path.join(RAIZ, "public"));
  return h.digest("hex").slice(0, 24);
};

// Huella de mezcla de audio:
// Incluye voz.wav, los archivos WAV de efectos utilizados en la composición,
// los eventos de audio (nombre, tiempo en frames, volumen), duración total y FPS.
const huellaAudio = (audioConfig, fps) => {
  const h = crypto.createHash("sha256");
  h.update(CACHE_AUDIO_VERSION);
  const voz = audioConfig.voz ? path.join(RAIZ, "public", audioConfig.voz) : null;
  if (voz && fs.existsSync(voz)) {
    h.update(`voz:${audioConfig.voz}`);
    h.update(fs.readFileSync(voz));
  } else {
    h.update("voz:null");
  }

  const efectos = audioConfig.efectos || [];
  const sonidosUsados = Array.from(new Set(efectos.map((e) => e.s))).sort();
  for (const s of sonidosUsados) {
    const arch = path.join(RAIZ, "public", "sonidos", `${s}.wav`);
    if (fs.existsSync(arch)) {
      h.update(`sfx:${s}`);
      h.update(fs.readFileSync(arch));
    } else {
      h.update(`sfx:${s}:missing`);
    }
  }

  h.update(`fps:${fps}`);
  h.update(`fotogramas:${audioConfig.fotogramas}`);
  for (const e of efectos) {
    h.update(`efecto:${e.s}:${e.en}:${e.vol}`);
  }
  h.update("mix:48000:stereo:pcm_s16le:atrim:adelay:aresample:amix");
  return h.digest("hex").slice(0, 24);
};

const empaquetar = async () => {
  const c = path.join(SALIDA, ".bundle");
  const m = path.join(c, "manifest.json");
  const h = huella();
  if (fs.existsSync(m)) {
    try {
      const { huella: hVieja } = JSON.parse(fs.readFileSync(m, "utf8"));
      if (hVieja === h && fs.existsSync(path.join(c, "index.html"))) return c;
    } catch {}
  }
  fs.mkdirSync(c, { recursive: true });
  await bundle({
    entryPoint: path.join(RAIZ, "src", "index.ts"),
    outDir: c,
    publicDir: path.join(RAIZ, "public"),
    onProgress: (p) => {
      if (p === 100) console.log(`código empaquetado · ${seg()} s`);
    },
  });
  fs.writeFileSync(m, JSON.stringify({ huella: h }), "utf8");
  return c;
};

// ------------------------------------------------------------ navegador e inspección
const abrirNavegador = () => openBrowser("chrome", { browserExecutable: navegador, chromeMode: modoChrome });

const elegir = async (serveUrl, id, browser, inputProps = {}) => selectComposition({ serveUrl, id, inputProps, puppeteerInstance: browser, ...opcNav, logLevel: "error" });

// ------------------------------------------------------------ resumen
const enseñarResumen = (r) => {
  const tagArte = r.modoArteActivo ? ` · arte: ${r.mundoVisualActivo || "activo"}` : "";
  console.log(`\nDuración ${r.duracion} s · estilo ${r.estilo}${tagArte} · ${r.escenas.length} escenas · ${r.efectos} efectos de sonido · ${r.poses} cambios de pose\n`);
  for (const e of r.escenas) {
    console.log(`  ${String(e.frase).padStart(2)}. ${String(e.tipo).padEnd(12)} ${e.desde.toFixed(2)}–${e.hasta.toFixed(2)} s  (${e.entrada})  momentos: ${e.momentos.join(", ")}`);
  }
  if (r.problemas.length) {
    console.log(`\nPROBLEMAS (${r.problemas.length}):`);
    for (const p of r.problemas) console.log(`  - ${p}`);
  } else {
    console.log("\nSin problemas en el plan.");
  }
  if (r.avisos?.length) {
    console.log(`\nAVISOS (${r.avisos.length}; no impiden renderizar, pero se notan en el vídeo):`);
    for (const a of r.avisos) console.log(`  - ${a}`);
  }
};

// ------------------------------------------------------------ validación temprana de arte
const MUNDOS_VALIDOS = new Set([
  "cinematic-dark",
  "editorial-print",
  "technical-blueprint",
  "kinetic-swiss",
  "neobrutalist-pop",
  "organic-botanical",
  "data-cyber",
  "mixed-collage",
]);
const FONDOS_MODO_VALIDOS = new Set(["clasico", "malla_armonizada", "transparente"]);

const validarPreRenderArte = () => {
  const problemas = [];
  const avisos = [];

  // 1. Revisión de arte.json
  const rutasArte = [
    path.join(RAIZ, "src", "datos", "arte.json"),
    path.join(RAIZ, "arte.json"),
  ];
  let arteObj = null;
  for (const r of rutasArte) {
    if (fs.existsSync(r)) {
      const txt = fs.readFileSync(r, "utf8");
      if (txt.trim() === "") {
        problemas.push("El archivo arte.json existe pero está vacío.");
      } else {
        try {
          arteObj = JSON.parse(txt);
        } catch (e) {
          problemas.push(`El archivo arte.json contiene JSON corrupto: ${e.message}`);
        }
      }
      break;
    }
  }

  // 2. Revisión de plan.json
  const rutaPlan = path.join(RAIZ, "src", "datos", "plan.json");
  let planObj = null;
  if (fs.existsSync(rutaPlan)) {
    try {
      planObj = JSON.parse(fs.readFileSync(rutaPlan, "utf8"));
    } catch (e) {
      problemas.push(`El archivo plan.json contiene JSON corrupto: ${e.message}`);
    }
  }

  const validarContrato = (obj, origen) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
    if ("mundo_visual" in obj && obj.mundo_visual !== undefined && obj.mundo_visual !== null) {
      if (typeof obj.mundo_visual !== "string" || obj.mundo_visual.trim() === "") {
        problemas.push(`${origen}: «mundo_visual» debe ser un ID de texto válido o null.`);
      } else if (!MUNDOS_VALIDOS.has(obj.mundo_visual)) {
        problemas.push(`${origen}: Mundo visual desconocido «${obj.mundo_visual}».`);
      }
    }
    if ("materialidad" in obj && obj.materialidad !== undefined && obj.materialidad !== null) {
      if (typeof obj.materialidad !== "object" || Array.isArray(obj.materialidad)) {
        problemas.push(`${origen}: «materialidad» debe ser un objeto {…}`);
      } else {
        const fm = obj.materialidad.fondo_modo;
        if (fm !== undefined && fm !== null) {
          if (typeof fm !== "string" || !FONDOS_MODO_VALIDOS.has(fm)) {
            problemas.push(`${origen}: «materialidad.fondo_modo» inválido («${fm}»).`);
          }
        }
      }
    }
    if ("grano_intensidad" in obj && obj.grano_intensidad !== undefined && obj.grano_intensidad !== null) {
      if (typeof obj.grano_intensidad !== "number" || isNaN(obj.grano_intensidad)) {
        problemas.push(`${origen}: «grano_intensidad» debe ser un número.`);
      }
    }
    if ("vineta_intensidad" in obj && obj.vineta_intensidad !== undefined && obj.vineta_intensidad !== null) {
      if (typeof obj.vineta_intensidad !== "number" || isNaN(obj.vineta_intensidad)) {
        problemas.push(`${origen}: «vineta_intensidad» debe ser un número.`);
      }
    }
    if ("colores" in obj && obj.colores !== undefined && obj.colores !== null) {
      if (typeof obj.colores !== "object" || Array.isArray(obj.colores)) {
        problemas.push(`${origen}: «colores» debe ser un objeto {…}`);
      }
    }
  };

  if (arteObj) validarContrato(arteObj, "arte.json");
  if (planObj) {
    if ("mundo_visual" in planObj && planObj.mundo_visual !== undefined && planObj.mundo_visual !== null) {
      if (typeof planObj.mundo_visual !== "string" || planObj.mundo_visual.trim() === "") {
        problemas.push("plan.mundo_visual: debe ser un ID de texto válido o null.");
      } else if (!MUNDOS_VALIDOS.has(planObj.mundo_visual)) {
        problemas.push(`plan.mundo_visual: Mundo visual desconocido «${planObj.mundo_visual}».`);
      }
    }
    if (planObj.arte) validarContrato(planObj.arte, "plan.arte");
    if (Array.isArray(planObj.frases)) {
      planObj.frases.forEach((f, idx) => {
        if (!f || typeof f !== "object") return;
        if ("mundo_visual" in f && f.mundo_visual !== undefined) {
          avisos.push(`Frase ${idx + 1}: "mundo_visual" es global y no es configurable por frase.`);
        }
        if ("grano_intensidad" in f && f.grano_intensidad !== undefined && f.grano_intensidad !== null) {
          if (typeof f.grano_intensidad !== "number" || isNaN(f.grano_intensidad)) {
            problemas.push(`Frase ${idx + 1}: «grano_intensidad» debe ser un número.`);
          }
        }
        if ("vineta_intensidad" in f && f.vineta_intensidad !== undefined && f.vineta_intensidad !== null) {
          if (typeof f.vineta_intensidad !== "number" || isNaN(f.vineta_intensidad)) {
            problemas.push(`Frase ${idx + 1}: «vineta_intensidad» debe ser un número.`);
          }
        }
      });
    }
  }

  return { problemas, avisos };
};

// ------------------------------------------------------------ comandos
const main = async () => {
  if (cmd === "video") {
    const v = validarPreRenderArte();
    if (v.problemas.length && !flag("forzar")) {
      for (const p of v.problemas) {
        process.stderr.write(`ERROR (contrato de arte): ${p}\n`);
      }
      process.exitCode = 1;
      return;
    }
  }

  const serveUrl = await empaquetar();
  const browser = await abrirNavegador();
  try {
    if (cmd === "resumen") {
      const comp = await elegir(serveUrl, "Reel", browser);
      enseñarResumen(comp.props.resumen);
      process.exitCode = comp.props.resumen.problemas.length ? 1 : 0;
      return;
    }

    if (cmd === "fotos") {
      const comp = await elegir(serveUrl, "Reel", browser);
      const r = comp.props.resumen;
      const cada = args[1] && !args[1].startsWith("--") ? Number(args[1]) : 0;
      let marcas = [];
      if (cada > 0) {
        for (let t = 0.3; t < r.duracion; t += cada) marcas.push(t);
      } else {
        // por escena: la mitad, cada momento y cómo queda justo antes de cambiar (así se ve el titular entero)
        for (const e of r.escenas) marcas.push((e.desde + e.hasta) / 2, ...e.momentos.map((m) => m + 0.25), e.hasta - 0.3);
      }
      marcas = [...new Set(marcas.map((t) => Math.min(comp.durationInFrames - 1, Math.max(0, Math.round(t * comp.fps)))))].sort((a, b) => a - b);
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hoja-"));
      const teselas = [];
      const escenaDe = (t) => r.escenas.filter((e) => t >= e.desde - 1e-6).pop();
      for (const f of marcas) {
        const out = path.join(tmp, `f${f}.jpeg`);
        await renderStill({ serveUrl, composition: comp, frame: f, output: out, imageFormat: "jpeg", jpegQuality: 80, scale: 300 / 1080, puppeteerInstance: browser, ...opcNav, logLevel: "error" });
        const e = escenaDe(f / comp.fps);
        teselas.push({ src: `data:image/jpeg;base64,${fs.readFileSync(out).toString("base64")}`, etiqueta: `${(f / comp.fps).toFixed(2)} s · ${e ? `${e.frase}. ${e.tipo}` : ""}` });
      }
      const mosaico = await elegir(serveUrl, "Mosaico", browser, { teselas });
      await renderStill({ serveUrl, composition: mosaico, output: path.join(SALIDA, "hoja.png"), inputProps: { teselas }, puppeteerInstance: browser, ...opcNav, logLevel: "error" });
      fs.rmSync(tmp, { recursive: true, force: true });
      console.log(`hoja de contacto con ${marcas.length} fotogramas en salida/hoja.png (${seg()} s). Ábrela y mírala entera.`);
      return;
    }

    if (cmd === "foto") {
      // fotogramas sueltos a tamaño completo, para mirar un momento de cerca
      const comp = await elegir(serveUrl, "Reel", browser);
      const tiempos = args.slice(1).filter((a) => !a.startsWith("--")).map(Number).filter((n) => Number.isFinite(n));
      if (!tiempos.length) throw new Error("Dime en qué segundo: node render.mjs foto 12.5 [20 …]");
      for (const t of tiempos) {
        const f = Math.min(comp.durationInFrames - 1, Math.max(0, Math.round(t * comp.fps)));
        const out = path.join(SALIDA, `foto_${(f / comp.fps).toFixed(2)}.png`);
        await renderStill({ serveUrl, composition: comp, frame: f, output: out, puppeteerInstance: browser, ...opcNav, logLevel: "error" });
        console.log(`salida/${path.basename(out)}`);
      }
      return;
    }

    if (cmd === "portada") {
      const comp = await elegir(serveUrl, "Portada", browser);
      await renderStill({ serveUrl, composition: comp, output: path.join(SALIDA, "portada.png"), puppeteerInstance: browser, ...opcNav });
      const chk = await elegir(serveUrl, "PortadaCheck", browser);
      await renderStill({ serveUrl, composition: chk, output: path.join(SALIDA, "portada_check.png"), puppeteerInstance: browser, ...opcNav });
      console.log(`portada en salida/portada.png y comprobación del recorte 3:4 en salida/portada_check.png (${seg()} s)`);
      return;
    }

    if (cmd === "video") {
      const comp = await elegir(serveUrl, "Reel", browser);
      const r = comp.props.resumen;
      if (r.problemas.length && !flag("forzar")) {
        enseñarResumen(r);
        console.log("\nArregla los problemas (o usa --forzar) antes de renderizar.");
        process.exitCode = 1;
        return;
      }
      const borrador = flag("borrador");
      const escala = borrador ? 0.5 : 1;
      const crf = Number(opt("crf", borrador ? 26 : 20));
      const TROZO = 240; // 8 s por trozo: cada trozo tarda poco y se puede seguir si se corta
      const total = comp.durationInFrames;
      const claveVideo = `${huellaVideo()}-${escala}-${crf}`;
      const dirT = path.join(TROZOS, claveVideo);
      fs.mkdirSync(dirT, { recursive: true });
      const claveAudio = huellaAudio(r.audio, comp.fps);
      console.log(`huella video: ${claveVideo} · huella audio: ${claveAudio}`);
      const n = Math.ceil(total / TROZO);
      const conc = Math.max(1, Number(opt("hilos", Math.min(os.cpus().length, 4))));
      for (let k = 0; k < n; k++) {
        const archivo = path.join(dirT, `${String(k).padStart(3, "0")}.mp4`);
        if (validarTrozo(archivo)) continue;
        if ((Date.now() - t0) / 1000 > MAX_SEG) {
          console.log(`PARCIAL: hechos ${k} de ${n} trozos. Vuelve a lanzar el mismo comando y seguirá desde aquí.`);
          process.exitCode = 3;
          return;
        }
        const a = k * TROZO,
          b = Math.min(total - 1, (k + 1) * TROZO - 1);
        await renderMedia({ serveUrl, composition: comp, codec: "h264", muted: true, frameRange: [a, b], outputLocation: archivo + ".tmp.mp4", crf, x264Preset: "veryfast", scale: escala, concurrency: conc, imageFormat: "jpeg", jpegQuality: 92, puppeteerInstance: browser, ...opcNav, logLevel: "error", pixelFormat: "yuv420p" });
        fs.renameSync(archivo + ".tmp.mp4", archivo);
        console.log(`trozo ${k + 1}/${n} (fotogramas ${a}…${b}) listo · ${seg()} s`);
      }
      const dirAudio = path.join(TROZOS, "audio");
      fs.mkdirSync(dirAudio, { recursive: true });
      const audio = path.join(dirAudio, `${claveAudio}.wav`);
      if (!fs.existsSync(audio)) mezclarAudio(r.audio, comp.fps, audio);
      const lista = path.join(dirT, "lista.txt");
      fs.writeFileSync(lista, Array.from({ length: n }, (_, k) => {
        const chunkPath = path.join(dirT, `${String(k).padStart(3, "0")}.mp4`).replace(/\\/g, "/");
        return `file '${chunkPath}'`;
      }).join("\n"), "utf8");
      const final = path.join(SALIDA, borrador ? "borrador.mp4" : "reel.mp4");
      ff(["-y", "-f", "concat", "-safe", "0", "-i", lista, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", final]);
      let mb = fs.statSync(final).size / 1e6;
      if (mb > LIMITE_MB) {
        // la app de Claude no deja descargar archivos de más de 30 MB: se recomprime a la tasa justa
        const kbps = Math.floor(((LIMITE_MB * 8e6) / (total / comp.fps) - 200e3) / 1000);
        ff(["-y", "-i", final, "-c:v", "libx264", "-preset", "veryfast", "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.3)}k`, "-bufsize", `${kbps * 2}k`, "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", final + ".tmp.mp4"]);
        fs.renameSync(final + ".tmp.mp4", final);
        mb = fs.statSync(final).size / 1e6;
      }
      console.log(`LISTO: ${path.relative(RAIZ, final)} · ${(total / comp.fps).toFixed(1)} s · ${mb.toFixed(1)} MB · ${seg()} s`);
      return;
    }
    console.log("Comandos: resumen | fotos [cada] | foto <segundos…> | video [--borrador] | portada");
  } finally {
    await browser.close({ silent: true });
  }
};

main().catch((e) => {
  console.error(`ERROR: ${e.message ?? e}`);
  process.exit(2);
});

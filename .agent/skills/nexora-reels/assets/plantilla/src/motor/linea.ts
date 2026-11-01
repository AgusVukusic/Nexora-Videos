// Línea de tiempo del reel para Nexora Motion Reels.
// A partir de plan.json y de los tiempos de la voz (tiempos.json), calcula cuándo empieza
// y acaba cada escena, los momentos b[] de cada elemento, los cambios de pose, los efectos de sonido
// y el resumen completo para render.mjs y calculateMetadata.
import tiempos0 from "../datos/tiempos.json";
import type { DefEscena, Entrada, Momento, PalabraEscena, Tiempos } from "../tipos";
import { C, CON_PERSONAJE, ESTILO, PLAN, POSE_BASE, POSES, THEME } from "./actual";
import { ADELANTO, FPS, SEMI, SOLAPE, s2f } from "./constantes";

export { ADELANTO, CON_PERSONAJE, ESTILO, FPS, PLAN, POSES, SEMI, SOLAPE, THEME, s2f };

export const T: Tiempos = (tiempos0 as unknown as Tiempos) ?? { duracion: 0, frases: [] };

export const SONIDOS = [
  "pop",
  "ding",
  "exito",
  "campana",
  "tecla",
  "tic",
  "clic",
  "whoosh",
  "swoosh",
  "papel",
  "burbuja",
  "golpe",
  "negacion",
  "puff",
  "cristal",
  "proyector",
  "subida",
];

export const PROBLEMAS: string[] = [];
const problema = (s: string) => PROBLEMAS.push(s);

/** Avisos de mejora que no impiden renderizar. */
export const AVISOS: string[] = [];
const aviso = (s: string) => AVISOS.push(s);

const N = Math.min(PLAN.frases.length, T.frases.length);
if (PLAN.frases.length !== T.frases.length) {
  problema(
    `El plan tiene ${PLAN.frases.length} frases y tiempos.json tiene ${T.frases.length}. Vuelve a alinear la voz con el guion del plan (scripts/alinear.py).`
  );
}

export const TOTAL = Math.max(1, Math.ceil(T.duracion * FPS));

/** Hay voz si alinear.py la preparó y el plan no la desactiva con "voz": false. */
export const HAY_VOZ = !!T.voz && PLAN.voz !== false;
if (T.voz && PLAN.voz === false) {
  aviso(`El plan dice "voz": false pero hay una voz alineada (${T.voz}): el vídeo saldrá sin voz.`);
}

// ---------------------------------------------------------------- Validación de contraste
const lum = (hex: string) => {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const contraste = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

for (const [fondo, texto, nombre] of [
  ["acento", "acentoTexto", "el texto sobre el color de acento (cajas de subtítulos, botones)"],
  ["fondo", "texto", "el texto sobre el fondo"],
  ["tarjeta", "tarjetaTexto", "el texto de las tarjetas"],
  ["oscuro", "oscuroTexto", "el texto de los paneles oscuros"],
] as const) {
  if (C[fondo] && C[texto]) {
    const r = contraste(C[fondo], C[texto]);
    if (r < 3) {
      aviso(
        `Estilo: ${nombre} contrasta poco (${r.toFixed(1)}:1, ${C[texto]} sobre ${C[fondo]}).`
      );
    }
  }
}

// Comprobación de portada
if (PLAN.portada?.lineas?.length) {
  const larga = PLAN.portada.lineas
    .map((l) => l.replace(/\*/g, ""))
    .reduce((a, l) => (l.length > a.length ? l : a), "");
  if (larga.length > 12) {
    aviso(
      `Portada: la línea «${larga}» tiene ${larga.length} letras y el título saldrá pequeño en la miniatura. Usa líneas de 12 letras o menos.`
    );
  }
}

const norm = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

// Comprobación de integridad texto guion vs audio alineado
const soloTexto = (t: string) => norm(t.replace(/\[[^\]]*\]/g, " ").replace(/\*/g, ""));
const cambiadas = PLAN.frases
  .slice(0, N)
  .map((fr, i) => (soloTexto(fr.texto ?? "") !== soloTexto(T.frases[i]?.texto ?? "") ? i + 1 : 0))
  .filter((k) => k > 0);

if (cambiadas.length) {
  problema(
    `El texto de ${cambiadas.length === 1 ? "la frase" : "las frases"} ${cambiadas.join(", ")} ha cambiado desde que se alineó la voz. Vuelve a ejecutar alinear.py.`
  );
}

// ---------------------------------------------------------------- Cortes y Transiciones

/** Corte de escena: 1 fotograma antes de que se oiga la primera palabra de la frase. */
export const corte = (i: number): number =>
  i === 0 ? 0 : Math.max(0, s2f(T.frases[i]?.inicio ?? 0) - 1);

export const finFrase = (i: number): number => s2f(T.frases[i]?.fin ?? 0);

const aparicion = (i: number, k: number): number => {
  const t = T.frases[i]?.palabras[k]?.t ?? 0;
  return Math.max(corte(i), s2f(t) - ADELANTO);
};

/** Resuelve la transición de entrada de la escena i. */
export const entrada = (i: number): Entrada => {
  if (i === 0) return "corte";
  const e = PLAN.frases[i]?.entrada ?? PLAN.transicion ?? (ESTILO.familia === "suave" ? "suave" : "corte");
  return e;
};

/** Determina si una transición requiere solape temporal entre secuencias contiguas. */
export const esTransicionSolapada = (e: Entrada): boolean =>
  e === "suave" || e === "disolver";

/** Primer fotograma en el que la secuencia de la escena i debe comenzar a renderizarse. */
export const ini = (i: number): number => {
  if (i === 0) return 0;
  const e = entrada(i);
  return esTransicionSolapada(e) ? corte(i) - Math.floor(SOLAPE / 2) : corte(i);
};

/** Fotograma en el que la secuencia de la escena i deja de verse. */
export const fin = (i: number): number => {
  if (i + 1 < N) {
    const eSig = entrada(i + 1);
    return esTransicionSolapada(eSig) ? corte(i + 1) + Math.ceil(SOLAPE / 2) : corte(i + 1);
  }
  return TOTAL;
};

/** Fotograma absoluto de un momento de la frase i (o null si no existe). */
export const momento = (i: number, m: Momento, quien = ""): number | null => {
  if (typeof m === "number") return ini(i) + m;
  const r = /^(.+?)(?:#(\d+))?([+-]\d+)?$/.exec(String(m).trim());
  if (!r) {
    problema(`Frase ${i + 1}${quien}: no entiendo el momento «${m}»`);
    return null;
  }
  const [, base, nTxt, offTxt] = r;
  const off = offTxt ? parseInt(offTxt, 10) : 0;
  if (base === "inicio") return corte(i) + off;
  if (base === "fin") return fin(i) - 1 + off;

  const objetivo = norm(base);
  const n = nTxt ? parseInt(nTxt, 10) : 1;
  const pal = T.frases[i]?.palabras ?? [];

  // Búsqueda por coincidencia exacta primero, luego por prefijo
  const exactas = pal.map((p, k) => (norm(p.w) === objetivo ? k : -1)).filter((k) => k >= 0);
  const empiezan = pal.map((p, k) => (objetivo && norm(p.w).startsWith(objetivo) ? k : -1)).filter((k) => k >= 0);
  const lista = exactas.length >= n ? exactas : empiezan;

  if (lista.length >= n) return aparicion(i, lista[n - 1]) + off;

  problema(
    `Frase ${i + 1}${quien}: no encuentro «${base}»${n > 1 ? ` (vez ${n})` : ""}. Palabras: ${pal.map((p) => p.w).join(" ")}`
  );
  return null;
};

// Funciones auxiliares para interpretar props de escenas en la planificación de metadatos
const txt = (p: Record<string, unknown>, k: string, def = ""): string =>
  typeof p[k] === "string" ? (p[k] as string) : typeof p[k] === "number" ? String(p[k]) : def;
const bool = (p: Record<string, unknown>, k: string, def = false): boolean =>
  typeof p[k] === "boolean" ? (p[k] as boolean) : def;
const arr = <T = unknown>(p: Record<string, unknown>, k: string): T[] =>
  Array.isArray(p[k]) ? (p[k] as T[]) : [];
const obj = (p: Record<string, unknown>, k: string): Record<string, unknown> =>
  p[k] && typeof p[k] === "object" && !Array.isArray(p[k]) ? (p[k] as Record<string, unknown>) : {};

// ---------------------------------------------------------------- Registro de Escenas

/** Metadatos estándar de las 17 escenas nativas (momentos y sonidos por defecto idénticos a becario-reels). */
export const METADATA_ESCENAS_ESTANDAR: Record<string, DefEscena> = {
  titular: {
    momentos: 1,
    sonidos: (p) => (arr(p, "imagenes").length ? [[0, "whoosh", 0.3]] : txt(p, "icono") ? [[0, "pop", 0.35]] : []),
  },
  chat: {
    momentos: 5,
    sonidos: (p) => [
      ...(txt(p, "mensaje") ? ([[0, "tecla", 0.3], [1, "pop", 0.32]] as [number, string, number][]) : []),
      ...(txt(obj(p, "movil"), "titulo") ? ([[3, "pop", 0.35]] as [number, string, number][]) : []),
      ...(txt(p, "pildora") ? ([[4, "ding", 0.26]] as [number, string, number][]) : []),
    ],
  },
  editor: {
    momentos: 4,
    sonidos: (p) => [
      [0, "whoosh", 0.3],
      [1, "exito", 0.26],
      ...(arr(p, "sonidos").length ? ([[3, "pop", 0.35]] as [number, string, number][]) : []),
    ],
  },
  movil: {
    momentos: 3,
    sonidos: (p) => [[0, "whoosh", 0.28], ...(txt(p, "pegatina") ? ([[2, "pop", 0.38]] as [number, string, number][]) : [])],
  },
  contador: {
    momentos: 2,
    sonidos: (p) => [[1, bool(p, "llama") ? "puff" : "golpe", bool(p, "llama") ? 0.4 : 0.45]],
  },
  cifras: {
    momentos: (p) => Math.max(1, Math.min(3, arr(p, "filas").length)),
    sonidos: (p) =>
      arr<Record<string, unknown>>(p, "filas")
        .slice(0, 3)
        .map((fila, k) => [k, bool(fila, "destacar") ? "golpe" : "tic", bool(fila, "destacar") ? 0.45 : 0.3] as [number, string, number]),
  },
  ficha: {
    alInicio: () => true,
    momentos: (p) => Math.max(1, Math.min(4, arr(p, "filas").length)),
    sonidos: (p) => arr(p, "filas").slice(0, 4).map((_, k) => [k, "pop", 0.25] as [number, string, number]),
  },
  lista: {
    alInicio: (p) => !!txt(p, "titulo"),
    momentos: (p) => Math.max(1, Math.min(5, arr(p, "items").length)),
    sonidos: (p) =>
      arr(p, "items")
        .slice(0, 5)
        .map((_, k, a) => [k, k === a.length - 1 ? "ding" : "tic", k === a.length - 1 ? 0.26 : 0.3] as [number, string, number]),
  },
  pasos: {
    momentos: (p) => Math.max(1, Math.min(4, arr(p, "pasos").length)),
    sonidos: (p) => arr(p, "pasos").slice(0, 4).map((_, k) => [k, "pop", 0.3] as [number, string, number]),
  },
  comparacion: {
    momentos: 3,
    sonidos: () => [
      [0, "pop", 0.3],
      [1, "pop", 0.3],
      [2, "exito", 0.26],
    ],
  },
  tachado: {
    alInicio: () => true,
    momentos: 2,
    sonidos: () => [[0, "negacion", 0.22], [1, "swoosh", 0.3]],
  },
  objecion: {
    alInicio: (p) => !!txt(p, "numero"),
    momentos: 2,
    sonidos: (p) => [[0, "pop", 0.32], ...(txt(p, "respuesta") ? ([[1, "ding", 0.26]] as [number, string, number][]) : [])],
  },
  pregunta: {
    momentos: 3,
    sonidos: () => [[1, "pop", 0.3], [2, "exito", 0.28]],
  },
  barras: {
    alInicio: (p) => !!txt(p, "titulo"),
    momentos: (p) => Math.max(1, Math.min(5, arr(p, "barras").length)),
    sonidos: (p) => arr(p, "barras").slice(0, 5).map((_, k) => [k, "tic", 0.3] as [number, string, number]),
  },
  imagen: {
    momentos: 2,
    sonidos: (p) => {
      const ef = new Set(arr<string>(p, "efectos"));
      if (ef.has("cine")) return [[0, "proyector", 0.32]];
      return [[0, "whoosh", 0.35]];
    },
  },
  galeria: {
    momentos: 2,
    sonidos: (p) => [[txt(p, "modo") === "rejilla" ? 0 : 1, txt(p, "modo") === "orbita" ? "ding" : "whoosh", 0.3]],
  },
  cta: {
    momentos: 3,
    sonidos: () => [[0, "tecla", 0.3], [1, "exito", 0.3]],
  },
};

export let BIBLIOTECA: Record<string, DefEscena> = { ...METADATA_ESCENAS_ESTANDAR };

/** Permite registrar o actualizar la biblioteca de escenas visuales completas. */
export const registrarEscenas = (nuevas: Record<string, DefEscena>): void => {
  BIBLIOTECA = { ...BIBLIOTECA, ...nuevas };
};

export const PROPIAS: Record<string, DefEscena> = {};

/** Permite registrar escenas personalizadas del usuario. */
export const registrarPropia = (nombre: string, def: DefEscena): void => {
  PROPIAS[nombre] = def;
};

export const definicion = (i: number): DefEscena | null => {
  const e = PLAN.frases[i]?.escena;
  if (!e || !e.tipo) {
    problema(`Frase ${i + 1}: falta la escena`);
    return null;
  }
  if (e.tipo === "propia") {
    const d = PROPIAS[String(e.nombre)];
    if (!d) {
      problema(`Frase ${i + 1}: no existe la escena propia «${e.nombre}».`);
    }
    return d ?? null;
  }
  const d = BIBLIOTECA[e.tipo];
  if (!d) {
    problema(`Frase ${i + 1}: no existe el tipo de escena «${e.tipo}». Tipos conocidos: ${Object.keys(BIBLIOTECA).join(", ")}`);
    return null;
  }
  return d;
};

export type EscenaLinea = {
  i: number;
  ini: number;
  fin: number;
  dur: number;
  entrada: Entrada;
  salida: Entrada | null;
  def: DefEscena | null;
  p: Record<string, unknown>;
  b: number[];
  palabras: PalabraEscena[];
};

/** Completa los momentos que falten repartiéndolos armónicamente por la escena. */
export const repartir = (dados: number[], n: number, dur: number): number[] => {
  const b = [...dados];
  if (b.length >= n) return b;
  if (b.length === 0) {
    const hasta = Math.max(8, dur * 0.7);
    for (let k = 0; k < n; k++) {
      b.push(Math.round(2 + (hasta - 2) * (n === 1 ? 0 : k / (n - 1))));
    }
    return b;
  }
  const desde = b[b.length - 1];
  const hasta = Math.max(desde + 6, dur - 12);
  const faltan = n - b.length;
  for (let k = 1; k <= faltan; k++) {
    b.push(Math.round(desde + ((hasta - desde) * k) / (faltan + 1)));
  }
  return b;
};

export const ESCENAS: EscenaLinea[] = Array.from({ length: N }).map((_, i) => {
  const def = definicion(i);
  const e = PLAN.frases[i]?.escena ?? { tipo: "?" };
  const { en, ...resto } = e;
  const p: Record<string, unknown> = { ...resto };
  delete p.tipo;
  delete p.nombre;

  const a = ini(i);
  const dur = fin(i) - a;
  const dados = (en ?? [])
    .map((m) => momento(i, m, ` (escena ${e.tipo})`))
    .filter((x): x is number => x !== null)
    .map((x) => x - a);

  const n = def ? (typeof def.momentos === "function" ? def.momentos(p) : def.momentos) : dados.length;
  if (dados.length > n && n > 0) {
    aviso(`Frase ${i + 1} (${e.tipo}): "en" tiene ${dados.length} momentos pero esta escena usa ${n}; los adicionales no tendrán efecto.`);
  }

  const b = repartir(dados.slice(0, n), n, dur);
  if (def?.validar) def.validar(p).forEach((s) => problema(`Frase ${i + 1} (${e.tipo}): ${s}`));
  if (def?.avisar) def.avisar(p).forEach((s) => aviso(`Frase ${i + 1} (${e.tipo}): ${s}`));

  const ultimo = b.length ? b[b.length - 1] : 0;
  if (def && i + 1 < N && b.length && dur - ultimo < 15) {
    aviso(
      `Frase ${i + 1} (${e.tipo}): el último elemento entra ${((dur - ultimo) / FPS).toFixed(1)} s antes de que cambie la escena y apenas se ve.`
    );
  }

  const vacio = b.length ? b[0] + a - corte(i) : 0;
  if (def && !["titular", "chat", "editor"].includes(e.tipo) && !def.alInicio?.(p) && vacio > 24) {
    aviso(
      `Frase ${i + 1} (${e.tipo}): durante ${(vacio / FPS).toFixed(1)} s no se ve nada de la escena. Adelanta el primer momento.`
    );
  }

  const palabras = (T.frases[i]?.palabras ?? []).map((w, k) => ({
    w: w.w,
    f: aparicion(i, k) - a,
    clave: !!w.clave,
    g: w.g ?? -1,
  }));

  const salidaCalculada = PLAN.frases[i]?.salida ?? (i + 1 < N ? entrada(i + 1) : null);

  return {
    i,
    ini: a,
    fin: fin(i),
    dur,
    entrada: entrada(i),
    salida: salidaCalculada,
    def,
    p,
    b,
    palabras,
  };
});

// ---------------------------------------------------------------- Poses y Efectos

export const CAMBIOS_POSE: { desde: number; pose: string }[] = [];
if (CON_PERSONAJE) {
  PLAN.frases.slice(0, N).forEach((fr, i) =>
    (fr.poses ?? []).forEach(([m, pose]) => {
      const t = momento(i, m, " (poses)");
      if (!POSES[pose]) {
        problema(`Frase ${i + 1}: no existe la pose «${pose}». Poses: ${Object.keys(POSES).join(", ")}`);
      } else if (t !== null) {
        CAMBIOS_POSE.push({ desde: t, pose });
      }
    })
  );
  CAMBIOS_POSE.sort((x, y) => x.desde - y.desde);
  if (CAMBIOS_POSE.length === 0 && Object.keys(POSES).length) {
    CAMBIOS_POSE.push({ desde: 0, pose: POSE_BASE });
  } else if (CAMBIOS_POSE.length && CAMBIOS_POSE[0].desde > 0) {
    CAMBIOS_POSE.unshift({ desde: 0, pose: CAMBIOS_POSE[0].pose });
  }
}

export type Efecto = { en: number; s: string; vol: number };
export const EFECTOS: Efecto[] = [];
ESCENAS.forEach((esc) => {
  if (esc.def?.sonidos) {
    esc.def.sonidos(esc.p, esc.b).forEach(([k, s, vol]) => {
      const t = esc.b[k];
      if (t !== undefined) EFECTOS.push({ en: esc.ini + t, s, vol });
    });
  }
  (PLAN.frases[esc.i]?.sonidos ?? []).forEach(([m, s, vol]) => {
    const t = momento(esc.i, m, " (sonidos)");
    if (!SONIDOS.includes(s)) {
      problema(`Frase ${esc.i + 1}: el sonido «${s}» no está en la biblioteca (${SONIDOS.join(", ")})`);
    } else if (t !== null) {
      EFECTOS.push({ en: t, s, vol: vol ?? 0.3 });
    }
  });
});
EFECTOS.sort((x, y) => x.en - y.en);

/** Resumen técnico de planificación para calculateMetadata y render.mjs. */
export const resumen = () => ({
  duracion: +(TOTAL / FPS).toFixed(2),
  estilo: ESTILO.nombre,
  escenas: ESCENAS.map((e) => ({
    frase: e.i + 1,
    tipo: PLAN.frases[e.i]?.escena?.tipo === "propia" ? `propia:${PLAN.frases[e.i]?.escena.nombre}` : PLAN.frases[e.i]?.escena?.tipo,
    desde: +(e.ini / FPS).toFixed(2),
    hasta: +(e.fin / FPS).toFixed(2),
    entrada: e.entrada,
    momentos: e.b.map((x) => +((e.ini + x) / FPS).toFixed(2)),
  })),
  efectos: EFECTOS.length,
  poses: CAMBIOS_POSE.length,
  problemas: PROBLEMAS,
  avisos: AVISOS,
  audio: {
    fotogramas: TOTAL,
    voz: HAY_VOZ ? "voz.wav" : null,
    efectos: EFECTOS.map((e) => ({ en: e.en, s: e.s, vol: e.vol })),
  },
});

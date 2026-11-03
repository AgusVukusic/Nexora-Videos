// Configuración activa para Nexora Motion Reels.
// Conecta los datos de plan.json y poses.json con THEME y la geometría de pantalla.
import plan0 from "../datos/plan.json";
import poses0 from "../datos/poses.json";
import {
  MUNDOS_VISUALES,
  type FondoModo,
  type FrasePlan,
  type MundoVisualId,
  type Plan,
  type TokensCromaticos,
} from "../tipos";
import { resolverEstilo, type Estilo } from "./estilos";
import { THEME } from "./theme";

export { THEME };

export const PLAN: Plan = (plan0 as unknown as Plan) ?? { titulo: "Sin título", frases: [] };
export const ESTILO = resolverEstilo(PLAN.estilo);

export type MedidasPose = {
  src: string;
  ancho: number;
  alto: number;
  cabeza: number;
  anchoCabeza: number;
  peloArriba: number;
};

/** Poses del personaje medidas por scripts/poses.py. */
export const POSES: Record<string, MedidasPose> = {};
const posesRaw = (poses0 as Record<string, unknown>) ?? {};
for (const [k, v] of Object.entries(posesRaw)) {
  if (!k.startsWith("_") && typeof v === "object" && v !== null) {
    POSES[k] = v as MedidasPose;
  }
}

export const CON_PERSONAJE = (PLAN.personaje ?? true) && Object.keys(POSES).length > 0;

/** Pose por defecto: referencia de poses.py ("normal" si existe) o la primera disponible. */
const ref = posesRaw["_referencia"];
export const POSE_BASE: string =
  typeof ref === "string" && POSES[ref] ? ref : POSES.normal ? "normal" : Object.keys(POSES)[0] ?? "normal";

export const SUBTITULOS = PLAN.subtitulos ?? "linea";

/** Zona de diseño de las escenas: coordenadas base de pantalla dentro de este rectángulo (960x860 px). */
export const LIENZO = { x: 60, y: 210, w: 960, h: 860 };

/** Dónde cabe la escena según la presencia de subtítulos y personaje (Lienzo se escala y centra aquí). */
export const ZONA =
  SUBTITULOS === "bloque"
    ? CON_PERSONAJE
      ? { x: 60, y: 500, w: 960, h: 740 }
      : { x: 60, y: 500, w: 960, h: 1000 }
    : CON_PERSONAJE
      ? { x: 60, y: 210, w: 960, h: 860 }
      : { x: 60, y: 250, w: 960, h: 960 };

/** Centro vertical de la línea de subtítulos (modo "linea"). */
export const SUB_Y = CON_PERSONAJE ? 1170 : THEME.maquetacion.subtitulosY;

// ---------------------------------------------------------------- Funciones auxiliares de contraste WCAG

/**
 * Calcula luminancia relativa sRGB según WCAG 2.1.
 */
export function calcularLuminancia(hex: string): number {
  const limpio = hex.replace("#", "").trim();
  const n = parseInt(
    limpio.length === 3 ? limpio.split("").map((c) => c + c).join("") : limpio.slice(0, 6),
    16
  );
  if (isNaN(n)) return 0;
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Calcula el ratio de contraste WCAG entre dos colores (1:1 a 21:1).
 */
export function calcularContraste(c1: string, c2: string): number {
  const l1 = calcularLuminancia(c1);
  const l2 = calcularLuminancia(c2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------- Gramáticas de Mundos Visuales

export const GRAMATICA_MUNDOS_VISUALES: Record<
  MundoVisualId,
  {
    materialidad: { fondo_modo: FondoModo };
    grano_intensidad: number;
    vineta_intensidad: number;
    colores: TokensCromaticos;
  }
> = {
  "cinematic-dark": {
    materialidad: { fondo_modo: "malla_armonizada" },
    grano_intensidad: 0.18,
    vineta_intensidad: 0.45,
    colores: {
      fondo: "#0d0f14",
      fondoSub: "#161922",
      tarjeta: "#1a1e29",
      tarjetaBorde: "#2b3245",
      texto: "#f1f3f7",
      textoMuted: "#9ba3b5",
      acento: "#e5a93c",
      acentoSecundario: "#38bdf8",
      acentoTexto: "#0d0f14",
      destaque: "#f59e0b",
      alerta: "#ef4444",
      borde: "#2b3245",
      linea: "#1e2538",
      manchas: ["#1e2538", "#2a1a38"],
      datos: ["#e5a93c", "#38bdf8", "#34d399", "#a78bfa"],
    },
  },
  "editorial-print": {
    materialidad: { fondo_modo: "transparente" },
    grano_intensidad: 0.22,
    vineta_intensidad: 0.1,
    colores: {
      fondo: "#f5f0e6",
      fondoSub: "#ebe3d5",
      tarjeta: "#ffffff",
      tarjetaBorde: "#d5cbba",
      texto: "#141413",
      textoMuted: "#595652",
      acento: "#b83220",
      acentoSecundario: "#2c4a6f",
      acentoTexto: "#ffffff",
      destaque: "#b83220",
      alerta: "#c02626",
      borde: "#141413",
      linea: "#d5cbba",
      manchas: ["#ede4d4", "#e2d6c3"],
      datos: ["#b83220", "#2c4a6f", "#3f6b4b", "#d97706"],
    },
  },
  "technical-blueprint": {
    materialidad: { fondo_modo: "transparente" },
    grano_intensidad: 0.08,
    vineta_intensidad: 0.25,
    colores: {
      fondo: "#0a192f",
      fondoSub: "#0f2442",
      tarjeta: "#132d54",
      tarjetaBorde: "#1e4880",
      texto: "#e6f1ff",
      textoMuted: "#8892b0",
      acento: "#00d2ff",
      acentoSecundario: "#64ffda",
      acentoTexto: "#0a192f",
      destaque: "#00d2ff",
      alerta: "#ff5370",
      borde: "#1e4880",
      linea: "#112a4d",
      manchas: ["#112a4d", "#0d3b66"],
      datos: ["#00d2ff", "#64ffda", "#ccd6f6", "#ffb86c"],
    },
  },
  "kinetic-swiss": {
    materialidad: { fondo_modo: "transparente" },
    grano_intensidad: 0.05,
    vineta_intensidad: 0.0,
    colores: {
      fondo: "#ffffff",
      fondoSub: "#f4f4f4",
      tarjeta: "#ebebeb",
      tarjetaBorde: "#000000",
      texto: "#000000",
      textoMuted: "#555555",
      acento: "#e60000",
      acentoSecundario: "#0055ff",
      acentoTexto: "#ffffff",
      destaque: "#e60000",
      alerta: "#cc0000",
      borde: "#000000",
      linea: "#cccccc",
      manchas: ["#f0f0f0", "#e5e5e5"],
      datos: ["#e60000", "#000000", "#555555", "#0055ff"],
    },
  },
  "neobrutalist-pop": {
    materialidad: { fondo_modo: "transparente" },
    grano_intensidad: 0.12,
    vineta_intensidad: 0.0,
    colores: {
      fondo: "#fff8db",
      fondoSub: "#ffe600",
      tarjeta: "#ffffff",
      tarjetaBorde: "#000000",
      texto: "#000000",
      textoMuted: "#444444",
      acento: "#ff0055",
      acentoSecundario: "#00e5ff",
      acentoTexto: "#000000",
      destaque: "#ffe600",
      alerta: "#ff0033",
      borde: "#000000",
      linea: "#000000",
      manchas: ["#ffe600", "#ffc2d1"],
      datos: ["#ff0055", "#00e5ff", "#ffe600", "#7928ca"],
    },
  },
  "organic-botanical": {
    materialidad: { fondo_modo: "malla_armonizada" },
    grano_intensidad: 0.15,
    vineta_intensidad: 0.2,
    colores: {
      fondo: "#152018",
      fondoSub: "#1d2c22",
      tarjeta: "#24372b",
      tarjetaBorde: "#365340",
      texto: "#edf5ef",
      textoMuted: "#9db8a4",
      acento: "#7ecb90",
      acentoSecundario: "#d4a373",
      acentoTexto: "#0e1810",
      destaque: "#7ecb90",
      alerta: "#e06d53",
      borde: "#365340",
      linea: "#1e3325",
      manchas: ["#1e3325", "#2a4734"],
      datos: ["#7ecb90", "#d4a373", "#a3b18a", "#ccd5ae"],
    },
  },
  "data-cyber": {
    materialidad: { fondo_modo: "malla_armonizada" },
    grano_intensidad: 0.14,
    vineta_intensidad: 0.35,
    colores: {
      fondo: "#06080e",
      fondoSub: "#0c111c",
      tarjeta: "#111827",
      tarjetaBorde: "#1f2d45",
      texto: "#00ffcc",
      textoMuted: "#5eead4",
      acento: "#ff007f",
      acentoSecundario: "#7928ca",
      acentoTexto: "#000000",
      destaque: "#00ffcc",
      alerta: "#ff0055",
      borde: "#1f2d45",
      linea: "#121d30",
      manchas: ["#121d30", "#250f38"],
      datos: ["#00ffcc", "#ff007f", "#00bfff", "#ffe600"],
    },
  },
  "mixed-collage": {
    materialidad: { fondo_modo: "transparente" },
    grano_intensidad: 0.25,
    vineta_intensidad: 0.15,
    colores: {
      fondo: "#25201c",
      fondoSub: "#302a25",
      tarjeta: "#3c342e",
      tarjetaBorde: "#564b42",
      texto: "#f7f4ee",
      textoMuted: "#beb3a5",
      acento: "#e07a5f",
      acentoSecundario: "#81b29a",
      acentoTexto: "#1f1b18",
      destaque: "#f2cc8f",
      alerta: "#e63946",
      borde: "#564b42",
      linea: "#383029",
      manchas: ["#383029", "#2c2722"],
      datos: ["#e07a5f", "#81b29a", "#f2cc8f", "#3d405b"],
    },
  },
};

export type TokensCromaticosCompatibles = TokensCromaticos & {
  fondo2: string;
  suave: string;
  tarjetaTexto: string;
  oscuro: string;
  oscuroTexto: string;
  exito: string;
  error: string;
};

export type InfoArteJson = {
  existe: boolean;
  corrupto: boolean;
  vacio: boolean;
  contenido: unknown;
  datos?: unknown;
  error?: string;
};

/**
 * Lee arte.json de forma segura tanto en entorno Node.js como en Webpack/Remotion.
 */
export function leerArteJson(): InfoArteJson {
  if (typeof process !== "undefined" && typeof require === "function") {
    try {
      const fs = require("fs");
      const path = require("path");
      const rutas = [];
      if (typeof __dirname !== "undefined") {
        rutas.push(path.resolve(__dirname, "../datos/arte.json"));
      }
      rutas.push(path.resolve(process.cwd(), "src/datos/arte.json"));
      rutas.push(path.resolve(process.cwd(), "arte.json"));

      for (const ruta of rutas) {
        if (fs.existsSync(ruta)) {
          const texto = fs.readFileSync(ruta, "utf8");
          if (texto.trim() === "") {
            return {
              existe: true,
              corrupto: false,
              vacio: true,
              contenido: null,
              datos: null,
              error: "El archivo arte.json existe pero está vacío.",
            };
          }
          try {
            const parsed = JSON.parse(texto);
            return { existe: true, corrupto: false, vacio: false, contenido: parsed, datos: parsed };
          } catch (e: any) {
            return {
              existe: true,
              corrupto: true,
              vacio: false,
              contenido: null,
              datos: null,
              error: `El archivo arte.json está corrupto o malformado: ${e?.message ?? e}`,
            };
          }
        }
      }
    } catch {
      // Ignorar fallo de fs en navegadores
    }
  }

  try {
    // @ts-ignore
    const ctx = typeof require !== "undefined" ? require.context("../datos", false, /^\.\/arte\.json$/) : null;
    if (ctx && typeof ctx.keys === "function" && ctx.keys().length > 0) {
      try {
        const data = ctx("./arte.json");
        return { existe: true, corrupto: false, vacio: false, contenido: data, datos: data };
      } catch (e: any) {
        return {
          existe: true,
          corrupto: true,
          vacio: false,
          contenido: null,
          datos: null,
          error: `Error cargando arte.json en bundle: ${e?.message ?? e}`,
        };
      }
    }
  } catch {
    // Ignorar si require.context no está disponible
  }

  return { existe: false, corrupto: false, vacio: false, contenido: undefined, datos: undefined };
}

export type ResultadoValidacionArte = {
  problemas: string[];
  avisos: string[];
};

const FONDOS_MODO_VALIDOS = ["clasico", "malla_armonizada", "transparente"] as const;

/**
 * Valida deterministamente declaraciones de contrato de arte (ya sea un Plan completo, plan.arte, o arte.json).
 * Diferencia estrictamente AVISOS de PROBLEMAS bloqueantes.
 */
export const validarContratoArte = (datos: unknown): ResultadoValidacionArte => {
  const problemas: string[] = [];
  const avisos: string[] = [];

  if (datos === undefined || datos === null) {
    return { problemas, avisos };
  }

  if (typeof datos !== "object" || Array.isArray(datos)) {
    problemas.push("El contrato de arte debe ser un objeto JSON {…}");
    return { problemas, avisos };
  }

  const d = datos as Record<string, unknown>;

  // Soporte para objeto combinado { plan, arteJsonInfo }
  if ("plan" in d) {
    const vP = validarContratoArte(d.plan);
    problemas.push(...vP.problemas);
    avisos.push(...vP.avisos);

    if ("arteJsonInfo" in d && d.arteJsonInfo && typeof d.arteJsonInfo === "object") {
      const info = d.arteJsonInfo as Record<string, unknown>;
      if (info.existe) {
        if (info.vacio) {
          problemas.push((info.error as string) ?? "El archivo arte.json existe pero está vacío.");
        } else if (info.corrupto) {
          const detalle = info.error ? `: ${info.error}` : "";
          problemas.push(`El archivo arte.json está corrupto o malformado${detalle}`);
        } else {
          const c = info.contenido ?? info.datos;
          if (c !== undefined) {
            const vA = validarContratoArte(c);
            problemas.push(...vA.problemas);
            avisos.push(...vA.avisos);
          }
        }
      }
    }
    return { problemas, avisos };
  }

  const validarBloqueArte = (arteObj: unknown, origen: string) => {
    if (arteObj === undefined || arteObj === null) return;
    if (typeof arteObj !== "object" || Array.isArray(arteObj)) {
      problemas.push(`${origen} debe ser un objeto {…}`);
      return;
    }
    const b = arteObj as Record<string, unknown>;

    // 1. mundo_visual
    if ("mundo_visual" in b && b.mundo_visual !== undefined && b.mundo_visual !== null) {
      if (typeof b.mundo_visual !== "string") {
        problemas.push(`${origen}: «mundo_visual» debe ser un ID de texto o null.`);
      } else if (b.mundo_visual.trim() === "") {
        problemas.push(`${origen}: «mundo_visual» no puede ser una cadena vacía.`);
      } else if (!MUNDOS_VISUALES.includes(b.mundo_visual as MundoVisualId)) {
        problemas.push(
          `${origen}: Mundo visual desconocido «${b.mundo_visual}». Opciones válidas: ${MUNDOS_VISUALES.join(", ")}`
        );
      }
    }

    // 2. materialidad
    if ("materialidad" in b && b.materialidad !== undefined && b.materialidad !== null) {
      if (typeof b.materialidad !== "object" || Array.isArray(b.materialidad)) {
        problemas.push(`${origen}: «materialidad» debe ser un objeto {…}`);
      } else {
        const mat = b.materialidad as Record<string, unknown>;
        if ("fondo_modo" in mat && mat.fondo_modo !== undefined && mat.fondo_modo !== null) {
          if (typeof mat.fondo_modo !== "string") {
            problemas.push(`${origen}: «materialidad.fondo_modo» debe ser un texto.`);
          } else if (mat.fondo_modo.trim() === "") {
            problemas.push(`${origen}: «materialidad.fondo_modo» no puede ser una cadena vacía.`);
          } else if (!FONDOS_MODO_VALIDOS.includes(mat.fondo_modo as any)) {
            problemas.push(
              `${origen}: «materialidad.fondo_modo» desconocido «${mat.fondo_modo}». Opciones válidas: ${FONDOS_MODO_VALIDOS.join(", ")}`
            );
          }
        }
      }
    }

    // 3. grano_intensidad
    if ("grano_intensidad" in b && b.grano_intensidad !== undefined && b.grano_intensidad !== null) {
      if (typeof b.grano_intensidad !== "number" || isNaN(b.grano_intensidad)) {
        problemas.push(`${origen}: «grano_intensidad» debe ser un número entre 0 y 1.`);
      } else if (b.grano_intensidad < 0) {
        avisos.push(`${origen}: «grano_intensidad» (${b.grano_intensidad}) es menor que 0; se limitará a 0 (clampeado).`);
      } else if (b.grano_intensidad > 1) {
        avisos.push(`${origen}: «grano_intensidad» (${b.grano_intensidad}) es mayor que 1; se limitará a 1 (clampeado).`);
      }
    }

    // 4. vineta_intensidad
    if ("vineta_intensidad" in b && b.vineta_intensidad !== undefined && b.vineta_intensidad !== null) {
      if (typeof b.vineta_intensidad !== "number" || isNaN(b.vineta_intensidad)) {
        problemas.push(`${origen}: «vineta_intensidad» debe ser un número entre 0 y 1.`);
      } else if (b.vineta_intensidad < 0) {
        avisos.push(`${origen}: «vineta_intensidad» (${b.vineta_intensidad}) es menor que 0; se limitará a 0 (clampeado).`);
      } else if (b.vineta_intensidad > 1) {
        avisos.push(`${origen}: «vineta_intensidad» (${b.vineta_intensidad}) es mayor que 1; se limitará a 1 (clampeado).`);
      }
    }

    // 5. colores
    if ("colores" in b && b.colores !== undefined && b.colores !== null) {
      if (typeof b.colores !== "object" || Array.isArray(b.colores)) {
        problemas.push(`${origen}: «colores» debe ser un objeto {…}`);
      } else {
        const col = b.colores as Record<string, unknown>;
        const camposTexto = [
          "fondo",
          "fondoSub",
          "tarjeta",
          "tarjetaBorde",
          "texto",
          "textoMuted",
          "acento",
          "acentoSecundario",
          "acentoTexto",
          "destaque",
          "alerta",
          "borde",
          "linea",
        ];
        for (const k of camposTexto) {
          if (k in col && col[k] !== undefined && col[k] !== null) {
            if (typeof col[k] !== "string" || (col[k] as string).trim() === "") {
              problemas.push(`${origen}: «colores.${k}» debe ser un texto de color válido.`);
            }
          }
        }
        if ("manchas" in col && col.manchas !== undefined && col.manchas !== null) {
          if (
            !Array.isArray(col.manchas) ||
            col.manchas.length < 2 ||
            typeof col.manchas[0] !== "string" ||
            typeof col.manchas[1] !== "string"
          ) {
            problemas.push(`${origen}: «colores.manchas» debe ser un arreglo de al menos 2 colores [string, string].`);
          }
        }
        if ("datos" in col && col.datos !== undefined && col.datos !== null) {
          if (!Array.isArray(col.datos) || col.datos.some((x) => typeof x !== "string")) {
            problemas.push(`${origen}: «colores.datos» debe ser un arreglo de textos de color.`);
          }
        }
      }

      // 5. camara
      if ("camara" in b && b.camara !== undefined && b.camara !== null) {
        if (typeof b.camara !== "object" || Array.isArray(b.camara)) {
          problemas.push(`${origen}: «camara» debe ser un objeto {…}.`);
        }
      }
    }
  };

  // Si es un Plan completo (o tiene frases/titulo/mundo_visual/arte):
  if ("arte" in d || "frases" in d || ("mundo_visual" in d && !("materialidad" in d))) {
    if ("arte" in d) {
      validarBloqueArte(d.arte, "plan.arte");
    }

    if ("camara" in d && d.camara !== undefined && d.camara !== null) {
      if (typeof d.camara !== "object" || Array.isArray(d.camara)) {
        problemas.push("plan.camara: debe ser un objeto {…}.");
      }
    }

    if ("mundo_visual" in d && d.mundo_visual !== undefined && d.mundo_visual !== null) {
      if (typeof d.mundo_visual !== "string") {
        problemas.push("plan.mundo_visual: debe ser un ID de texto o null.");
      } else if (d.mundo_visual.trim() === "") {
        problemas.push("plan.mundo_visual: no puede ser una cadena vacía.");
      } else if (!MUNDOS_VISUALES.includes(d.mundo_visual as MundoVisualId)) {
        problemas.push(
          `plan.mundo_visual: Mundo visual desconocido «${d.mundo_visual}». Opciones válidas: ${MUNDOS_VISUALES.join(", ")}`
        );
      }
    }

    if (Array.isArray(d.frases)) {
      d.frases.forEach((f, idx) => {
        if (!f || typeof f !== "object") return;
        const fraseObj = f as Record<string, unknown>;

        if ("mundo_visual" in fraseObj && fraseObj.mundo_visual !== undefined) {
          avisos.push(`Frase ${idx + 1}: "mundo_visual" es una propiedad global y no se puede configurar por frase. Se ignorará.`);
        }
        if (fraseObj.escena && typeof fraseObj.escena === "object" && "mundo_visual" in (fraseObj.escena as Record<string, unknown>)) {
          avisos.push(`Frase ${idx + 1}: "mundo_visual" es una propiedad global y no se puede configurar por frase. Se ignorará.`);
        }
        if ("fondo_modo" in fraseObj && fraseObj.fondo_modo !== undefined) {
          avisos.push(`Frase ${idx + 1}: "fondo_modo" es global y no es configurable por frase. Se ignorará.`);
        }
        if ("materialidad" in fraseObj && fraseObj.materialidad !== undefined) {
          avisos.push(`Frase ${idx + 1}: "materialidad" es global y no es configurable por frase. Se ignorará.`);
        }

        if ("grano_intensidad" in fraseObj && fraseObj.grano_intensidad !== undefined && fraseObj.grano_intensidad !== null) {
          if (typeof fraseObj.grano_intensidad !== "number" || isNaN(fraseObj.grano_intensidad as number)) {
            problemas.push(`Frase ${idx + 1}: «grano_intensidad» debe ser un número entre 0 y 1.`);
          } else if ((fraseObj.grano_intensidad as number) < 0) {
            avisos.push(`Frase ${idx + 1}: «grano_intensidad» (${fraseObj.grano_intensidad}) es menor que 0; se limitará a 0.`);
          } else if ((fraseObj.grano_intensidad as number) > 1) {
            avisos.push(`Frase ${idx + 1}: «grano_intensidad» (${fraseObj.grano_intensidad}) es mayor que 1; se limitará a 1.`);
          }
        }

        if ("vineta_intensidad" in fraseObj && fraseObj.vineta_intensidad !== undefined && fraseObj.vineta_intensidad !== null) {
          if (typeof fraseObj.vineta_intensidad !== "number" || isNaN(fraseObj.vineta_intensidad as number)) {
            problemas.push(`Frase ${idx + 1}: «vineta_intensidad» debe ser un número entre 0 y 1.`);
          } else if ((fraseObj.vineta_intensidad as number) < 0) {
            avisos.push(`Frase ${idx + 1}: «vineta_intensidad» (${fraseObj.vineta_intensidad}) es menor que 0; se limitará a 0.`);
          } else if ((fraseObj.vineta_intensidad as number) > 1) {
            avisos.push(`Frase ${idx + 1}: «vineta_intensidad» (${fraseObj.vineta_intensidad}) es mayor que 1; se limitará a 1.`);
          }
        }

        if ("camara" in fraseObj && fraseObj.camara !== undefined && fraseObj.camara !== null) {
          if (typeof fraseObj.camara !== "object" || Array.isArray(fraseObj.camara)) {
            problemas.push(`Frase ${idx + 1}: «camara» debe ser un objeto {…}.`);
          }
        }

        if ("colores" in fraseObj && fraseObj.colores !== undefined && fraseObj.colores !== null) {
          avisos.push(`Frase ${idx + 1}: "colores" es una propiedad global y no se puede configurar por frase. Se ignorará.`);
        }
      });
    }
  } else {
    // Si se pasa directamente un objeto de contrato de arte (por ejemplo desde arte.json o prueba aislada)
    validarBloqueArte(d, "arte");
  }

  return { problemas, avisos };
};

export type ResolucionArte = {
  modoArteActivo: boolean;
  mundoVisualActivo: MundoVisualId | null;
  materialidad: { fondo_modo: FondoModo };
  grano_intensidad: number;
  vineta_intensidad: number;
  colores: TokensCromaticosCompatibles;
  avisos: string[];
  problemas: string[];
  resolverArteFrase: (iOrFrase: number | Partial<FrasePlan>) => {
    grano_intensidad: number;
    vineta_intensidad: number;
    fondo_modo: FondoModo;
    modoArteActivo: boolean;
    mundoVisualActivo: MundoVisualId | null;
    colores: TokensCromaticosCompatibles;
  };
};

/**
 * Resuelve deterministamente la dirección de arte con precedencia estricta:
 *
 * 1. Propiedades locales autorizadas por frase (grano_intensidad, vineta_intensidad):
 *    - Frase activa
 *    - plan.arte
 *    - arte.json
 *    - Gramática del mundo visual activo
 *    - Valores predeterminados (0)
 *
 * 2. Propiedades globales del reel (mundo_visual, fondo_modo, tokens cromáticos):
 *    - plan.arte
 *    - plan.mundo_visual (acceso directo global)
 *    - arte.json
 *    - Gramática del mundo visual activo
 *    - Valores predeterminados del estilo clásico
 */
export function resolverDireccionArte(
  planParam?: Plan,
  infoArteParam?: InfoArteJson,
  estiloIdFallback?: string
): ResolucionArte {
  const plan = planParam ?? PLAN;
  const infoArte = infoArteParam ?? leerArteJson();

  const problemas: string[] = [];
  const avisos: string[] = [];

  // 1. Validar plan
  const vPlan = validarContratoArte(plan);
  problemas.push(...vPlan.problemas);
  avisos.push(...vPlan.avisos);

  // 2. Validar infoArte si existe
  if (infoArte.existe) {
    if (infoArte.vacio) {
      problemas.push(infoArte.error ?? "El archivo arte.json existe pero está vacío.");
    } else if (infoArte.corrupto) {
      problemas.push(infoArte.error ?? "El archivo arte.json contiene JSON corrupto o inválido.");
    } else {
      const c = infoArte.contenido ?? infoArte.datos;
      if (c !== undefined && c !== null) {
        const vArte = validarContratoArte(c);
        problemas.push(...vArte.problemas);
        avisos.push(...vArte.avisos);
      }
    }
  }

  // 3. Determinar modoArteActivo
  const tienePlanArte = plan.arte !== undefined;
  const tienePlanMundoVisual = plan.mundo_visual !== undefined;
  const modoArteActivo = tienePlanArte || tienePlanMundoVisual || infoArte.existe;

  const estiloFallback = estiloIdFallback ? resolverEstilo(estiloIdFallback) : ESTILO;
  const tokensClasicosCompatibles: TokensCromaticosCompatibles = {
    fondo: estiloFallback.colores.fondo,
    fondoSub: estiloFallback.colores.fondo2,
    tarjeta: estiloFallback.colores.tarjeta,
    tarjetaBorde: estiloFallback.colores.borde,
    texto: estiloFallback.colores.texto,
    textoMuted: estiloFallback.colores.suave,
    acento: estiloFallback.colores.acento,
    acentoSecundario: estiloFallback.colores.acento,
    acentoTexto: estiloFallback.colores.acentoTexto,
    destaque: estiloFallback.colores.exito,
    alerta: estiloFallback.colores.error,
    borde: estiloFallback.colores.borde,
    linea: estiloFallback.colores.linea,
    manchas: [
      estiloFallback.colores.manchas[0] ?? estiloFallback.colores.fondo,
      estiloFallback.colores.manchas[1] ?? estiloFallback.colores.fondo,
    ],
    datos: [estiloFallback.colores.acento, estiloFallback.colores.texto, estiloFallback.colores.suave],
    fondo2: estiloFallback.colores.fondo2,
    suave: estiloFallback.colores.suave,
    tarjetaTexto: estiloFallback.colores.tarjetaTexto,
    oscuro: estiloFallback.colores.oscuro,
    oscuroTexto: estiloFallback.colores.oscuroTexto,
    exito: estiloFallback.colores.exito,
    error: estiloFallback.colores.error,
  };

  if (!modoArteActivo) {
    return {
      modoArteActivo: false,
      mundoVisualActivo: null,
      materialidad: { fondo_modo: "clasico" },
      grano_intensidad: 0,
      vineta_intensidad: 0,
      colores: tokensClasicosCompatibles,
      avisos,
      problemas,
      resolverArteFrase: () => ({
        grano_intensidad: 0,
        vineta_intensidad: 0,
        fondo_modo: "clasico",
        modoArteActivo: false,
        mundoVisualActivo: null,
        colores: tokensClasicosCompatibles,
      }),
    };
  }

  // 4. Precedencia de mundo_visual
  let mundoVisualActivo: MundoVisualId | null = null;
  let mundoResuelto = false;

  // Fuente 1: plan.arte.mundo_visual
  if (plan.arte && "mundo_visual" in plan.arte) {
    const v = plan.arte.mundo_visual;
    if (v === null) {
      mundoVisualActivo = null;
      mundoResuelto = true;
    } else if (v !== undefined) {
      if (typeof v === "string" && MUNDOS_VISUALES.includes(v as MundoVisualId)) {
        mundoVisualActivo = v as MundoVisualId;
        mundoResuelto = true;
      } else {
        mundoVisualActivo = null;
        mundoResuelto = true;
      }
    }
  }

  // Fuente 2: plan.mundo_visual
  if (!mundoResuelto && "mundo_visual" in plan) {
    const v = plan.mundo_visual;
    if (v === null) {
      mundoVisualActivo = null;
      mundoResuelto = true;
    } else if (v !== undefined) {
      if (typeof v === "string" && MUNDOS_VISUALES.includes(v as MundoVisualId)) {
        mundoVisualActivo = v as MundoVisualId;
        mundoResuelto = true;
      } else {
        mundoVisualActivo = null;
        mundoResuelto = true;
      }
    }
  }

  // Fuente 3: arte.json.mundo_visual
  const arteJsonObj =
    infoArte.existe &&
    !infoArte.corrupto &&
    !infoArte.vacio &&
    typeof (infoArte.contenido ?? infoArte.datos) === "object" &&
    (infoArte.contenido ?? infoArte.datos) !== null
      ? ((infoArte.contenido ?? infoArte.datos) as Record<string, unknown>)
      : undefined;

  if (!mundoResuelto && arteJsonObj && "mundo_visual" in arteJsonObj) {
    const v = arteJsonObj.mundo_visual;
    if (v === null) {
      mundoVisualActivo = null;
      mundoResuelto = true;
    } else if (v !== undefined) {
      if (typeof v === "string" && MUNDOS_VISUALES.includes(v as MundoVisualId)) {
        mundoVisualActivo = v as MundoVisualId;
        mundoResuelto = true;
      } else {
        mundoVisualActivo = null;
        mundoResuelto = true;
      }
    }
  }

  // 5. Gramática del mundo visual activo
  const gramaticaMundo = mundoVisualActivo ? GRAMATICA_MUNDOS_VISUALES[mundoVisualActivo] : undefined;

  // 6. Precedencia de propiedades con merge profundo

  // 6.1 fondo_modo (global)
  let fondoModo: FondoModo = "clasico";
  if (
    plan.arte?.materialidad &&
    "fondo_modo" in plan.arte.materialidad &&
    plan.arte.materialidad.fondo_modo !== undefined &&
    plan.arte.materialidad.fondo_modo !== null
  ) {
    fondoModo = plan.arte.materialidad.fondo_modo;
  } else if (
    arteJsonObj?.materialidad &&
    typeof arteJsonObj.materialidad === "object" &&
    "fondo_modo" in (arteJsonObj.materialidad as Record<string, unknown>)
  ) {
    const val = (arteJsonObj.materialidad as Record<string, unknown>).fondo_modo;
    if (val === "clasico" || val === "malla_armonizada" || val === "transparente") {
      fondoModo = val;
    }
  } else if (gramaticaMundo) {
    fondoModo = gramaticaMundo.materialidad.fondo_modo;
  }

  // 6.2 grano_intensidad (global)
  let granoGlobal: number = 0;
  if (
    plan.arte &&
    "grano_intensidad" in plan.arte &&
    plan.arte.grano_intensidad !== undefined &&
    plan.arte.grano_intensidad !== null &&
    typeof plan.arte.grano_intensidad === "number" &&
    !isNaN(plan.arte.grano_intensidad)
  ) {
    granoGlobal = Math.min(1, Math.max(0, plan.arte.grano_intensidad));
  } else if (
    arteJsonObj &&
    "grano_intensidad" in arteJsonObj &&
    arteJsonObj.grano_intensidad !== undefined &&
    arteJsonObj.grano_intensidad !== null &&
    typeof arteJsonObj.grano_intensidad === "number" &&
    !isNaN(arteJsonObj.grano_intensidad as number)
  ) {
    granoGlobal = Math.min(1, Math.max(0, arteJsonObj.grano_intensidad as number));
  } else if (gramaticaMundo) {
    granoGlobal = gramaticaMundo.grano_intensidad;
  }

  // 6.3 vineta_intensidad (global)
  let vinetaGlobal: number = 0;
  if (
    plan.arte &&
    "vineta_intensidad" in plan.arte &&
    plan.arte.vineta_intensidad !== undefined &&
    plan.arte.vineta_intensidad !== null &&
    typeof plan.arte.vineta_intensidad === "number" &&
    !isNaN(plan.arte.vineta_intensidad)
  ) {
    vinetaGlobal = Math.min(1, Math.max(0, plan.arte.vineta_intensidad));
  } else if (
    arteJsonObj &&
    "vineta_intensidad" in arteJsonObj &&
    arteJsonObj.vineta_intensidad !== undefined &&
    arteJsonObj.vineta_intensidad !== null &&
    typeof arteJsonObj.vineta_intensidad === "number" &&
    !isNaN(arteJsonObj.vineta_intensidad as number)
  ) {
    vinetaGlobal = Math.min(1, Math.max(0, arteJsonObj.vineta_intensidad as number));
  } else if (gramaticaMundo) {
    vinetaGlobal = gramaticaMundo.vineta_intensidad;
  }

  // 6.4 Tokens cromáticos (global)
  // Precedencia: plan.arte.colores > arte.json.colores > gramaticaMundo.colores > tokensClasicos
  const baseTokens: TokensCromaticos = gramaticaMundo
    ? { ...gramaticaMundo.colores }
    : { ...tokensClasicosCompatibles };

  const coloresArteJson = (arteJsonObj?.colores && typeof arteJsonObj.colores === "object")
    ? (arteJsonObj.colores as Partial<TokensCromaticos>)
    : undefined;

  const coloresPlanArte = (plan.arte?.colores && typeof plan.arte.colores === "object")
    ? (plan.arte.colores as Partial<TokensCromaticos>)
    : undefined;

  const tokensGlobalesResueltos: TokensCromaticos = {
    ...baseTokens,
    ...(coloresArteJson ?? {}),
    ...(coloresPlanArte ?? {}),
    manchas: coloresPlanArte?.manchas ?? coloresArteJson?.manchas ?? baseTokens.manchas,
    datos: coloresPlanArte?.datos ?? coloresArteJson?.datos ?? baseTokens.datos,
  };

  const crearTokensCompatibles = (tok: TokensCromaticos): TokensCromaticosCompatibles => ({
    ...tok,
    fondo2: tok.fondoSub,
    suave: tok.textoMuted,
    tarjetaTexto: tok.texto,
    oscuro: tok.fondoSub,
    oscuroTexto: tok.texto,
    exito: tok.destaque,
    error: tok.alerta,
  });

  const coloresGlobalesCompatibles = crearTokensCompatibles(tokensGlobalesResueltos);

  // Validación de accesibilidad y contraste WCAG para tokens globales
  const validarContrasteTokens = (tok: TokensCromaticos, prefijo: string) => {
    const cTextoFondo = calcularContraste(tok.texto, tok.fondo);
    if (cTextoFondo < 4.5) {
      problemas.push(
        `${prefijo}: Contraste insuficiente texto/fondo: ${cTextoFondo.toFixed(2)}:1 (${tok.texto} sobre ${tok.fondo}). Mínimo requerido WCAG AA: 4.5:1.`
      );
    }
    const cTextoTarjeta = calcularContraste(tok.texto, tok.tarjeta);
    if (cTextoTarjeta < 4.5) {
      problemas.push(
        `${prefijo}: Contraste insuficiente texto/tarjeta: ${cTextoTarjeta.toFixed(2)}:1 (${tok.texto} sobre ${tok.tarjeta}). Mínimo requerido WCAG AA: 4.5:1.`
      );
    }
    const cAcentoTexto = calcularContraste(tok.acentoTexto, tok.acento);
    if (cAcentoTexto < 4.5) {
      problemas.push(
        `${prefijo}: Contraste insuficiente acentoTexto/acento: ${cAcentoTexto.toFixed(2)}:1 (${tok.acentoTexto} sobre ${tok.acento}). Mínimo requerido WCAG AA: 4.5:1.`
      );
    }
    const cMutedFondo = calcularContraste(tok.textoMuted, tok.fondo);
    if (cMutedFondo < 3.0) {
      avisos.push(
        `${prefijo}: Contraste bajo texto secundario/fondo: ${cMutedFondo.toFixed(2)}:1 (${tok.textoMuted} sobre ${tok.fondo}). Recomendado WCAG: 3.0:1.`
      );
    }
    const cMutedTarjeta = calcularContraste(tok.textoMuted, tok.tarjeta);
    if (cMutedTarjeta < 3.0) {
      avisos.push(
        `${prefijo}: Contraste bajo texto secundario/tarjeta: ${cMutedTarjeta.toFixed(2)}:1 (${tok.textoMuted} sobre ${tok.tarjeta}). Recomendado WCAG: 3.0:1.`
      );
    }
  };

  validarContrasteTokens(tokensGlobalesResueltos, "Dirección de arte");

  const resolverArteFraseFn = (iOrFrase: number | Partial<FrasePlan>) => {
    let f: Partial<FrasePlan> | undefined;
    if (typeof iOrFrase === "number") {
      f = plan.frases ? plan.frases[iOrFrase] : undefined;
    } else if (iOrFrase && typeof iOrFrase === "object") {
      f = iOrFrase;
    }

    let grano = granoGlobal;
    let vineta = vinetaGlobal;

    if (f && typeof f.grano_intensidad === "number" && !isNaN(f.grano_intensidad)) {
      grano = Math.min(1, Math.max(0, f.grano_intensidad));
    }
    if (f && typeof f.vineta_intensidad === "number" && !isNaN(f.vineta_intensidad)) {
      vineta = Math.min(1, Math.max(0, f.vineta_intensidad));
    }

    return {
      grano_intensidad: grano,
      vineta_intensidad: vineta,
      fondo_modo: fondoModo,
      modoArteActivo,
      mundoVisualActivo,
      colores: coloresGlobalesCompatibles,
    };
  };

  return {
    modoArteActivo,
    mundoVisualActivo,
    materialidad: { fondo_modo: fondoModo },
    grano_intensidad: granoGlobal,
    vineta_intensidad: vinetaGlobal,
    colores: coloresGlobalesCompatibles,
    avisos,
    problemas,
    resolverArteFrase: resolverArteFraseFn,
  };
}

export const ARTE_RESOLUCION = resolverDireccionArte(PLAN);
export const modoArteActivo: boolean = ARTE_RESOLUCION.modoArteActivo;
export const mundoVisualActivo: MundoVisualId | null = ARTE_RESOLUCION.mundoVisualActivo;
export const MATERIALIDAD = ARTE_RESOLUCION.materialidad;
export const GRANO_INTENSIDAD = ARTE_RESOLUCION.grano_intensidad;
export const VINETA_INTENSIDAD = ARTE_RESOLUCION.vineta_intensidad;
export const COLORES: TokensCromaticosCompatibles = ARTE_RESOLUCION.colores;

/** Colores del estilo/arte activo con nombre de uso semántico compatible. */
export const C = modoArteActivo ? ARTE_RESOLUCION.colores : (ESTILO.colores as unknown as TokensCromaticosCompatibles);
export const SUAVE = ESTILO.familia === "suave";

/** Sombra de las tarjetas calibrada según el estilo activo. */
export const SOMBRA =
  ESTILO.nombre === "nexora"
    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)"
    : SUAVE
      ? "0 26px 54px rgba(40, 30, 60, 0.18), 0 8px 16px rgba(40, 30, 60, 0.10)"
      : `10px 12px 0 ${C.borde}`;

export const SOMBRA_PEQ =
  ESTILO.nombre === "nexora"
    ? "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)"
    : SUAVE
      ? "0 10px 22px rgba(40, 30, 60, 0.16), 0 3px 6px rgba(40, 30, 60, 0.10)"
      : `5px 6px 0 ${C.borde}`;

/** Borde de las tarjetas (solo en familias de estilo marcado). */
export const BORDE = SUAVE ? "none" : `5px solid ${C.borde}`;

/**
 * Resuelve arte para una frase dada, admitiendo:
 * 1. resolverArteFrase(indice) -> usando la resolución activa
 * 2. resolverArteFrase(resolucionGlobal, fraseOverride) -> resolución personalizada
 */
export function resolverArteFrase(
  arg1: ResolucionArte | number | Partial<FrasePlan>,
  arg2?: Partial<FrasePlan>
) {
  if (typeof arg1 === "object" && arg1 !== null && "modoArteActivo" in arg1 && arg2) {
    const resGlobal = arg1 as ResolucionArte;
    const f = arg2 as Partial<FrasePlan>;
    let grano = resGlobal.grano_intensidad;
    let vineta = resGlobal.vineta_intensidad;
    if (typeof f.grano_intensidad === "number" && !isNaN(f.grano_intensidad)) {
      grano = Math.min(1, Math.max(0, f.grano_intensidad));
    }
    if (typeof f.vineta_intensidad === "number" && !isNaN(f.vineta_intensidad)) {
      vineta = Math.min(1, Math.max(0, f.vineta_intensidad));
    }
    return {
      grano_intensidad: grano,
      vineta_intensidad: vineta,
      materialidad: resGlobal.materialidad,
      fondo_modo: resGlobal.materialidad.fondo_modo,
      modoArteActivo: resGlobal.modoArteActivo,
      mundoVisualActivo: resGlobal.mundoVisualActivo,
      colores: resGlobal.colores,
    };
  }
  return ARTE_RESOLUCION.resolverArteFrase(arg1 as any);
}

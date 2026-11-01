// Estilos visuales para Nexora Motion Reels.
// Integra los tokens corporativos de THEME como estilo por defecto ("nexora")
// preservando al 100% los estilos temáticos heredados ("nube", "noche", "menta", "limon", "pizarra").
import { THEME } from "./theme";

export type Fuente = { archivo: string; peso: number };

export type Estilo = {
  nombre: string;
  familia: "suave" | "marcado";
  colores: {
    fondo: string;
    fondo2: string;
    manchas: string[];
    texto: string;
    suave: string;
    acento: string;
    acentoTexto: string;
    tarjeta: string;
    tarjetaTexto: string;
    linea: string;
    oscuro: string;
    oscuroTexto: string;
    borde: string;
    exito: string;
    error: string;
  };
  fuentes: {
    titulo: Fuente;
    texto: Fuente[];
    mano: Fuente;
    mono: Fuente[];
  };
  /** Escala relativa de las fuentes del título. */
  escalaTitulo: number;
  /** Opacidad de la textura de grano (0 a 1). */
  grano: number;
};

const MONO: Fuente[] = [
  { archivo: "fuentes/jetbrains-mono-latin-400-normal.woff2", peso: 400 },
  { archivo: "fuentes/jetbrains-mono-latin-700-normal.woff2", peso: 700 },
];
const MANO: Fuente = { archivo: "fuentes/caveat-latin-700-normal.woff2", peso: 700 };

export const ESTILOS: Record<string, Estilo> = {
  nexora: {
    nombre: "nexora",
    familia: "suave",
    colores: {
      fondo: THEME.colores.fondo,
      fondo2: THEME.colores.fondoElevado,
      manchas: [THEME.colores.fondoMalla1, THEME.colores.fondoMalla2, THEME.colores.superficie],
      texto: THEME.colores.textoPrimario,
      suave: THEME.colores.textoSecundario,
      acento: THEME.colores.acento,
      acentoTexto: THEME.colores.acentoTexto,
      tarjeta: THEME.colores.tarjeta,
      tarjetaTexto: THEME.colores.textoPrimario,
      linea: THEME.colores.superficieBorde,
      oscuro: THEME.colores.superficie,
      oscuroTexto: THEME.colores.textoSecundario,
      borde: THEME.colores.tarjetaBorde,
      exito: THEME.colores.acentoVerde,
      error: THEME.colores.acentoRojo,
    },
    fuentes: {
      titulo: { archivo: "fuentes/space-grotesk-latin-700-normal.woff2", peso: 700 },
      texto: [
        { archivo: "fuentes/inter-latin-600-normal.woff2", peso: 600 },
        { archivo: "fuentes/inter-latin-800-normal.woff2", peso: 800 },
      ],
      mano: MANO,
      mono: MONO,
    },
    escalaTitulo: 1.0,
    grano: 0.1,
  },
  nube: {
    nombre: "nube",
    familia: "suave",
    colores: {
      fondo: "#EEF0FF",
      fondo2: "#E1E5FF",
      manchas: ["#D6CEFF", "#CBE2FF", "#FFFFFF"],
      texto: "#1C1F3A",
      suave: "#5A5F86",
      acento: "#6157F5",
      acentoTexto: "#FFFFFF",
      tarjeta: "#FFFFFF",
      tarjetaTexto: "#1C1F3A",
      linea: "#E3E5F5",
      oscuro: "#171A33",
      oscuroTexto: "#E9EBFA",
      borde: "#1C1F3A",
      exito: "#22B07D",
      error: "#E5484D",
    },
    fuentes: {
      titulo: { archivo: "fuentes/manrope-latin-800-normal.woff2", peso: 800 },
      texto: [
        { archivo: "fuentes/manrope-latin-600-normal.woff2", peso: 600 },
        { archivo: "fuentes/manrope-latin-800-normal.woff2", peso: 800 },
      ],
      mano: MANO,
      mono: MONO,
    },
    escalaTitulo: 1,
    grano: 0.25,
  },
  noche: {
    nombre: "noche",
    familia: "suave",
    colores: {
      fondo: "#0E1120",
      fondo2: "#1A1F3D",
      manchas: ["#2B3A88", "#5A2A72", "#14324F"],
      texto: "#F3F4FB",
      suave: "#A9B0CF",
      acento: "#B8F34B",
      acentoTexto: "#0E1120",
      tarjeta: "#1C2242",
      tarjetaTexto: "#F3F4FB",
      linea: "#2D3664",
      oscuro: "#090C18",
      oscuroTexto: "#E8EBF7",
      borde: "#F3F4FB",
      exito: "#3DDC97",
      error: "#FF6B6B",
    },
    fuentes: {
      titulo: { archivo: "fuentes/space-grotesk-latin-700-normal.woff2", peso: 700 },
      texto: [
        { archivo: "fuentes/inter-latin-600-normal.woff2", peso: 600 },
        { archivo: "fuentes/inter-latin-800-normal.woff2", peso: 800 },
      ],
      mano: MANO,
      mono: MONO,
    },
    escalaTitulo: 1.02,
    grano: 0.12,
  },
  menta: {
    nombre: "menta",
    familia: "marcado",
    colores: {
      fondo: "#DDF3EA",
      fondo2: "#D2EEE2",
      manchas: ["#C6EBDB", "#FFFFFF"],
      texto: "#0D3B35",
      suave: "#4E7A72",
      acento: "#FF4F7B",
      acentoTexto: "#FFFFFF",
      tarjeta: "#FFFFFF",
      tarjetaTexto: "#0D3B35",
      linea: "#CFE5DC",
      oscuro: "#0D3B35",
      oscuroTexto: "#E6F6F0",
      borde: "#0D3B35",
      exito: "#1FA971",
      error: "#E5484D",
    },
    fuentes: {
      titulo: { archivo: "fuentes/bricolage-grotesque-latin-800-normal.woff2", peso: 800 },
      texto: [
        { archivo: "fuentes/dm-sans-latin-600-normal.woff2", peso: 600 },
        { archivo: "fuentes/dm-sans-latin-800-normal.woff2", peso: 800 },
      ],
      mano: MANO,
      mono: MONO,
    },
    escalaTitulo: 1,
    grano: 0.55,
  },
  limon: {
    nombre: "limon",
    familia: "marcado",
    colores: {
      fondo: "#FFE94A",
      fondo2: "#FFE23B",
      manchas: ["#FFF27A", "#FFFFFF"],
      texto: "#141414",
      suave: "#59511C",
      acento: "#2F5BFF",
      acentoTexto: "#FFFFFF",
      tarjeta: "#FFFFFF",
      tarjetaTexto: "#141414",
      linea: "#EBD94A",
      oscuro: "#141414",
      oscuroTexto: "#F5F5F5",
      borde: "#141414",
      exito: "#12A150",
      error: "#E5484D",
    },
    fuentes: {
      titulo: { archivo: "fuentes/anton-latin-400-normal.woff2", peso: 400 },
      texto: [
        { archivo: "fuentes/inter-latin-600-normal.woff2", peso: 600 },
        { archivo: "fuentes/inter-latin-800-normal.woff2", peso: 800 },
      ],
      mano: MANO,
      mono: MONO,
    },
    escalaTitulo: 1.12,
    grano: 0.45,
  },
  pizarra: {
    nombre: "pizarra",
    familia: "marcado",
    colores: {
      fondo: "#1E2B25",
      fondo2: "#22322B",
      manchas: ["#2A3D35", "#1A2620"],
      texto: "#F1EFE4",
      suave: "#B6C0B2",
      acento: "#FFD449",
      acentoTexto: "#1E2B25",
      tarjeta: "#26372F",
      tarjetaTexto: "#F1EFE4",
      linea: "#3A4E44",
      oscuro: "#141D19",
      oscuroTexto: "#ECEADF",
      borde: "#F1EFE4",
      exito: "#7DDB8F",
      error: "#FF7F6B",
    },
    fuentes: {
      titulo: { archivo: "fuentes/archivo-black-latin-400-normal.woff2", peso: 400 },
      texto: [
        { archivo: "fuentes/archivo-latin-600-normal.woff2", peso: 600 },
        { archivo: "fuentes/archivo-latin-800-normal.woff2", peso: 800 },
      ],
      mano: MANO,
      mono: MONO,
    },
    escalaTitulo: 0.95,
    grano: 0.5,
  },
};

export const ESTILO_POR_DEFECTO = "nexora";

/** Estilo personalizado en el plan: parte de uno de serie y cambia lo que haga falta. */
export type EstiloPlan =
  | string
  | {
      base?: string;
      familia?: Estilo["familia"];
      colores?: Partial<Estilo["colores"]>;
      fuentes?: Partial<Estilo["fuentes"]>;
      escalaTitulo?: number;
      grano?: number;
    };

export const resolverEstilo = (e: EstiloPlan | undefined): Estilo => {
  if (!e) return ESTILOS[ESTILO_POR_DEFECTO];
  if (typeof e === "string") {
    const s = ESTILOS[e];
    if (!s) throw new Error(`No existe el estilo «${e}». Estilos disponibles: ${Object.keys(ESTILOS).join(", ")}`);
    return s;
  }
  const base = ESTILOS[e.base ?? ESTILO_POR_DEFECTO];
  if (!base) throw new Error(`No existe el estilo base «${e.base}». Estilos disponibles: ${Object.keys(ESTILOS).join(", ")}`);
  return {
    ...base,
    nombre: `${base.nombre}+propio`,
    familia: e.familia ?? base.familia,
    colores: { ...base.colores, ...(e.colores ?? {}) },
    fuentes: { ...base.fuentes, ...(e.fuentes ?? {}) },
    escalaTitulo: e.escalaTitulo ?? base.escalaTitulo,
    grano: e.grano ?? base.grano,
  };
};

/** Nombres de familia con los que se registran las fuentes del estilo. */
export const F = { titulo: "BRTitulo", texto: "BRTexto", mano: "BRMano", mono: "BRMono" } as const;

/** Añade canal alfa hexadecimal a un color #RRGGBB. */
export const alfa = (hex: string, a: number): string =>
  `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

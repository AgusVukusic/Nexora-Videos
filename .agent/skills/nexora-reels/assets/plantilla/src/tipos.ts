// Formato del plan del reel y contratos de datos para Nexora Reels.
// Preserva la totalidad de contratos de Becario Reels incorporando tipos extendidos
// para transiciones cinematográficas y capas visuales opcionales.
import React from "react";
import type { EstiloPlan } from "./motor/estilos";
import type { BgMeshConfig, ColorGradeConfig, PostProcessConfig } from "./CapasCine";

export type EstiloClasicoId =
  | "nexora"
  | "nube"
  | "noche"
  | "menta"
  | "limon"
  | "pizarra";

export const ESTILOS_CLASICOS: readonly EstiloClasicoId[] = [
  "nexora",
  "nube",
  "noche",
  "menta",
  "limon",
  "pizarra",
] as const;

export type MundoVisualId =
  | "cinematic-dark"
  | "editorial-print"
  | "technical-blueprint"
  | "kinetic-swiss"
  | "neobrutalist-pop"
  | "organic-botanical"
  | "data-cyber"
  | "mixed-collage";

export const MUNDOS_VISUALES: readonly MundoVisualId[] = [
  "cinematic-dark",
  "editorial-print",
  "technical-blueprint",
  "kinetic-swiss",
  "neobrutalist-pop",
  "organic-botanical",
  "data-cyber",
  "mixed-collage",
] as const;

export type FondoModo = "clasico" | "malla_armonizada" | "transparente";

export type MaterialidadArte = {
  fondo_modo?: FondoModo;
};

/**
 * Tokens semánticos cromáticos para las gramáticas de mundos visuales.
 * Permiten abstraer la identidad de color sin hardcodear componentes.
 */
export interface TokensCromaticos {
  /** Color de fondo principal (60% atmósfera). */
  fondo: string;
  /** Color de fondo secundario / elevado / superficies profundas. */
  fondoSub: string;
  /** Color de superficie de tarjetas y paneles (30% estructura). */
  tarjeta: string;
  /** Color de borde y delimitación de tarjetas. */
  tarjetaBorde: string;
  /** Color de texto principal de alto contraste (WCAG >= 4.5:1). */
  texto: string;
  /** Color de texto secundario / atenuado (WCAG >= 3.0:1). */
  textoMuted: string;
  /** Color focal de acento principal (10% impacto). */
  acento: string;
  /** Color secundario de acento / soporte cromático. */
  acentoSecundario: string;
  /** Color de texto sobre contenedor de acento (WCAG >= 4.5:1). */
  acentoTexto: string;
  /** Color de realce / confirmación / éxito. */
  destaque: string;
  /** Color de advertencia / error / llamada de atención. */
  alerta: string;
  /** Color de bordes y separadores generales. */
  borde: string;
  /** Color sutil para líneas divisorias internas. */
  linea: string;
  /** Manchas armónicas para gradientes procedurales o fondos de malla. */
  manchas: [string, string];
  /** Serie ordenada de colores para visualización de métricas y datos. */
  datos: string[];
}

export type ContratoArte = {
  mundo_visual?: MundoVisualId | null;
  materialidad?: MaterialidadArte;
  grano_intensidad?: number;
  vineta_intensidad?: number;
  colores?: Partial<TokensCromaticos>;
  camara?: CamaraConfig;
};

/**
 * Transiciones espaciales y ópticas avanzadas (Etapa 39B).
 */
export type TransicionEspacial =
  | "whip-pan-izq"
  | "whip-pan-der"
  | "whip-pan-arriba"
  | "whip-pan-abajo"
  | "zoom-through"
  | "iris-apertura"
  | "iris-cierre";

/**
 * Cómo entra o sale una escena.
 * Soporta las transiciones heredadas ("corte", "suave", "semitono"),
 * las cinematográficas 39A ("deslizar-arriba", "deslizar-abajo", "disolver")
 * y las espaciales 39B (whip-pan, zoom-through, iris).
 */
export type Entrada =
  | "corte"
  | "suave"
  | "semitono"
  | "deslizar-arriba"
  | "deslizar-abajo"
  | "disolver"
  | TransicionEspacial;

export type TipoMovimientoCamara =
  | "estatica"
  | "empuje"
  | "paneo"
  | "orbital"
  | "zoom-in"
  | "zoom-out"
  | "travel-in"
  | "travel-out"
  | "custom";

export interface ParallaxConfig {
  /** Activar efecto parallax entre planos (por defecto false). */
  activo?: boolean;
  /** Multiplicador de escala global de parallax (por defecto 1.0). */
  intensidad?: number;
  /** Factor de profundidad del fondo / BgMesh (Capa 1). Por defecto 0.3. */
  profundidadFondo?: number;
  /** Factor de profundidad de recursos visuales / Assets (Capa 2). Por defecto 0.7. */
  profundidadAssets?: number;
  /** Factor de profundidad del plano focal UI / Escena (Capa 3). Por defecto 1.0. */
  profundidadUI?: number;
  /** Factor de profundidad de primer plano / Overlays (Capa 4/5). Por defecto 1.3. */
  profundidadFrente?: number;
}

export interface CamaraConfig {
  /** Activar cámara 2.5D en esta escena o globalmente. Por defecto false. */
  activa?: boolean;
  /** Tipo de movimiento espacial predefinido. Por defecto "estatica". */
  tipo?: TipoMovimientoCamara;
  /**
   * Factor de escala: número escalar fijo, o tupla [escalaInicial, escalaFinal].
   * Por defecto [1.0, 1.0].
   */
  escala?: number | [number, number];
  /**
   * Traslación en píxeles: tupla fija [x, y], o tupla de rango [[xIni, yIni], [xFin, yFin]].
   * Por defecto [0, 0].
   */
  posicion?: [number, number] | [[number, number], [number, number]];
  /**
   * Origen de la transformación (punto focal / transform-origin).
   * String CSS ("50% 40%", "50% 50%") o tupla de coordenadas en píxeles [x, y].
   * Por defecto "50% 40%".
   */
  origen?: string | [number, number];
  /**
   * Rotación sutil en grados: número o tupla [rotInicial, rotFinal].
   * Por defecto 0.
   */
  rotacion?: number | [number, number];
  /** Duración en fotogramas del movimiento (si se omite, dura toda la escena). */
  duracion?: number;
  /** Fotograma de inicio del movimiento relativo a la escena (por defecto 0). */
  inicio?: number;
  /** Curva de aceleración/desaceleración ("lineal", "suave", "in", "out", "in-out"). */
  curva?: "lineal" | "suave" | "in" | "out" | "in-out";
  /** Configuración de parallax entre planos para este movimiento. */
  parallax?: boolean | ParallaxConfig;
  /** Opciones específicas para zoom-through. */
  zoomThrough?: {
    escalaMax?: number;
    puntoFocal?: [number, number];
    desenfoque?: boolean;
  };
  /** Opciones específicas para transición Iris. */
  iris?: {
    tipo?: "apertura" | "cierre";
    centro?: [number, number];
    duracion?: number;
  };
  /** Opciones específicas para whip-pan. */
  whipPan?: {
    direccion?: "izq" | "der" | "arriba" | "abajo";
    duracion?: number;
    desenfoque?: boolean;
    intensidadDesenfoque?: number;
  };
}

/**
 * Referencia a un momento de la frase:
 *  - "palabra"       cuando aparece esa palabra (sin tildes ni signos; vale el principio: "anim" = "animación")
 *  - "palabra#2"     la segunda vez que sale esa palabra en la frase
 *  - "palabra+6"     6 fotogramas después (también "-4"); se combinan: "palabra#2+6"
 *  - "inicio"/"fin"  principio o final de la escena
 *  - un número       fotogramas desde el principio de la escena
 */
export type Momento = string | number;

export type EscenaPlan = {
  /** Tipo de escena de la biblioteca (ver references/escenas.md) o "propia" para una escena de src/propias. */
  tipo: string;
  /** Momentos que disparan cada elemento de la escena, en orden. Si faltan, se reparten solos. */
  en?: Momento[];
  /** Nombre de la escena propia (solo con tipo "propia"). */
  nombre?: string;
  /** Parámetros específicos de cada tipo de escena. */
  [prop: string]: unknown;
};

export type FrasePlan = {
  /** Texto de la frase tal cual se ve en los subtítulos, con las palabras clave entre *asteriscos*. */
  texto: string;
  /** Texto para la voz si hay que escribirlo distinto para que se pronuncie bien (Clod, rils…). */
  voz?: string;
  /** Etiqueta de emoción para ElevenLabs ([excited], [curious]…). */
  emocion?: string;
  escena: EscenaPlan;
  /** Transición de entrada de la escena (por defecto según estilo o "suave"). */
  entrada?: Entrada;
  /** Transición de salida explícita opcional. */
  salida?: Entrada;
  /** Factor de empuje o zoom lento continuo de cámara (0 a 0.05). Por defecto 0 en Nexora. */
  empuje?: number;
  /** Configuración opcional para el fondo procedural de CapasCine en esta escena. */
  bgMeshConfig?: BgMeshConfig;
  /** Configuración opcional de etalonaje cromático en esta escena. */
  colorGrade?: ColorGradeConfig;
  /** Configuración opcional de post-procesado (viñeta/grano) en esta escena. */
  postProcess?: PostProcessConfig;
  /** Cambios de pose del personaje: [momento, pose]. */
  poses?: [Momento, string][];
  /** Efectos de sonido extra: [momento, sonido, volumen 0–1]. */
  sonidos?: [Momento, string, number?][];
  /** true = esta frase no lleva subtítulos (porque el texto ya está en pantalla, como en el gancho). */
  sinSubtitulos?: boolean;
  /** Slot opcional para recursos visuales de soporte (Capa 2 de CapasCine). */
  assets?: React.ReactNode;
  /** Slot opcional para elementos de interfaz de usuario de soporte (Capa 3 de CapasCine). */
  ui?: React.ReactNode;
  /** Configuración local de grano para esta frase (0 a 1). */
  grano_intensidad?: number;
  /** Configuración local de viñeta para esta frase (0 a 1). */
  vineta_intensidad?: number;
  /** Configuración de cámara 2.5D y movimiento espacial para esta frase. */
  camara?: CamaraConfig;
  /** Propiedad global capturada para validación si se incluye erróneamente en frase. Las frases solo pueden personalizar grano_intensidad y vineta_intensidad. */
  colores?: unknown;
  /** Propiedad global capturada para validación si se incluye erróneamente en frase. */
  mundo_visual?: unknown;
};

export type PortadaPlan = {
  etiqueta?: string;
  /** Líneas del título; la palabra entre *asteriscos* va en el color de acento. */
  lineas: string[];
  imagenes?: string[];
  icono?: string;
  pegatina?: string;
  pose?: string;
  oscura?: boolean;
};

export type Plan = {
  titulo: string;
  estilo?: EstiloPlan;
  /** Acceso directo de conveniencia para mundo visual global. */
  mundo_visual?: MundoVisualId | null;
  /** Declaración opcional de dirección de arte global. */
  arte?: ContratoArte;
  /** Configuración global de cámara 2.5D para el reel. */
  camara?: CamaraConfig;
  /** "linea": una línea centrada con cajas de color; "bloque": hasta 3 líneas arriba a la izquierda; "no": sin subtítulos. */
  subtitulos?: "linea" | "bloque" | "no";
  /** Entrada por defecto de las escenas (si una frase no dice otra). */
  transicion?: Entrada;
  /** Usa el personaje de public/personaje (poses.json). */
  personaje?: boolean;
  /** false si el reel no tiene voz (modo solo texto). */
  voz?: boolean;
  frases: FrasePlan[];
  portada?: PortadaPlan;
};

// Tiempos que escribe scripts/alinear.py (src/datos/tiempos.json)
export type PalabraT = { w: string; t: number; clave?: boolean; g?: number };
export type FraseT = { texto: string; inicio: number; fin: number; palabras: PalabraT[] };
export type Tiempos = { duracion: number; frases: FraseT[]; voz?: string };

/** Palabra de la frase con su fotograma de aparición relativo al inicio de la escena. */
export type PalabraEscena = { w: string; f: number; clave: boolean; g: number };

/** Lo que recibe cada escena en su componente React. */
export type PropsEscena = {
  /** Propiedades de la escena tal cual vienen en el plan. */
  p: Record<string, unknown>;
  /** Fotogramas (relativos al inicio de la escena) en los que entra cada elemento. */
  b: number[];
  /** Duración de la escena en fotogramas. */
  dur: number;
  /** Palabras de la frase con su fotograma relativo. */
  palabras: PalabraEscena[];
  /** Índice de la frase (0 = la primera). */
  i: number;
};

export type DefEscena = {
  /** Componente React de renderizado de la escena (opcional en fase de planificación de línea de tiempo). */
  C?: React.FC<PropsEscena>;
  /** Slot opcional para recursos visuales de soporte por defecto de la escena (Capa 2 de CapasCine). */
  assets?: React.ReactNode | ((props: PropsEscena) => React.ReactNode);
  /** Slot opcional para elementos de interfaz de usuario por defecto de la escena (Capa 3 de CapasCine). */
  ui?: React.ReactNode | ((props: PropsEscena) => React.ReactNode);
  /** Cuántos momentos usa la escena (los que no vengan en "en" se reparten solos). Puede depender de los datos. */
  momentos: number | ((p: Record<string, unknown>) => number);
  /** Consejos que no impiden renderizar (texto que saldrá pequeño, etc.). */
  avisar?: (p: Record<string, unknown>) => string[];
  /** true si la escena ya enseña algo desde su primer fotograma (tarjeta, título…), aunque su primer momento llegue más tarde. */
  alInicio?: (p: Record<string, unknown>) => boolean;
  /** Sonidos que pone la escena sola: [índice de momento, sonido, volumen]. */
  sonidos?: (p: Record<string, unknown>, b: number[]) => [number, string, number][];
  /** Comprueba las propiedades y devuelve problemas legibles. */
  validar?: (p: Record<string, unknown>) => string[];
};

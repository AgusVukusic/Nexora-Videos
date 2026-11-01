// Formato del plan del reel y contratos de datos para Nexora Reels.
// Preserva la totalidad de contratos de Becario Reels incorporando tipos extendidos
// para transiciones cinematográficas y capas visuales opcionales.
import React from "react";
import type { EstiloPlan } from "./motor/estilos";
import type { BgMeshConfig, ColorGradeConfig, PostProcessConfig } from "./CapasCine";

/**
 * Cómo entra o sale una escena.
 * Soporta las transiciones heredadas ("corte", "suave", "semitono")
 * y las nuevas transiciones cinematográficas ("deslizar-arriba", "deslizar-abajo", "disolver").
 */
export type Entrada =
  | "corte"
  | "suave"
  | "semitono"
  | "deslizar-arriba"
  | "deslizar-abajo"
  | "disolver";

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

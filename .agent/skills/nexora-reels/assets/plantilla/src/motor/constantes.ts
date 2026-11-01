import { THEME } from "./theme";

/**
 * Fotogramas por segundo del reel (estándar: 30 FPS).
 */
export const FPS: number = THEME.maquetacion.fps;

/**
 * Ancho en píxeles del lienzo vertical (1080 px).
 */
export const ANCHO: number = THEME.maquetacion.ancho;

/**
 * Alto en píxeles del lienzo vertical (1920 px).
 */
export const ALTO: number = THEME.maquetacion.alto;

/**
 * Fotogramas de adelanto de las palabras de subtítulos respecto al audio (así se leen a tiempo).
 */
export const ADELANTO = 4;

/**
 * Fotogramas que se solapan dos escenas contiguas en una transición suave o disolución.
 */
export const SOLAPE = 10;

/**
 * Duración total de la transición de semitono en fotogramas (el corte de escena queda en el centro).
 */
export const SEMI = 18;

/**
 * Convierte un tiempo en segundos a número entero de fotogramas a los FPS del sistema.
 */
export const s2f = (s: number): number => Math.round(s * FPS);

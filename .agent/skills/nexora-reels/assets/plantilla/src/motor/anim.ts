import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig, type SpringConfig } from "remotion";
import { THEME } from "./theme";

// Fotogramas por segundo estándar del sistema
export const FPS_ESTANDAR: number = THEME.maquetacion.fps;

// ============================================================================
// 1. UTILIDADES ORIGINALES PRESERVADAS (100% Compatibilidad con Becario Reels)
// ============================================================================

/**
 * Escala con rebote a partir del fotograma `desde` (0 antes).
 * Preservado de becario-reels con retrocompatibilidad exacta.
 */
export const usePop = (
  desde: number,
  config: SpringConfig = { damping: 12, stiffness: 190, mass: 0.6, overshootClamping: false }
) => {
  const frame = useCurrentFrame();
  if (frame < desde) return 0;
  return spring({ frame: frame - desde, fps: FPS_ESTANDAR, config });
};

/**
 * Entrada suave sin rebote (0→1).
 * Preservado de becario-reels con retrocompatibilidad exacta.
 */
export const useSuave = (desde: number, dur = 12) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [desde, desde + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * Interpolación lineal con acotación (clamping) y aceleración opcional.
 * Preservado de becario-reels con retrocompatibilidad exacta.
 */
export const lerp = (
  f: number,
  a: number,
  b: number,
  from: number,
  to: number,
  ease = Easing.out(Easing.cubic)
) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

/**
 * Flotación continua (px) para que elementos focales no queden inertes.
 * Preservado de becario-reels con retrocompatibilidad exacta.
 */
export const useFlota = (fase: number, amp = 6, vel = 14) => {
  const frame = useCurrentFrame();
  return amp * Math.sin(frame / vel + fase);
};

/**
 * Pico senoidal 0→1→0 alrededor de `en` (para golpes de escala o acentos).
 * Preservado de becario-reels con retrocompatibilidad exacta.
 */
export const bump = (frame: number, en: number, dur = 7) => {
  const t = (frame - en) / dur;
  return t < 0 || t > 1 ? 0 : Math.sin(t * Math.PI);
};

/**
 * Generador de ruido pseudoaleatorio determinista en [0,1) basado en semilla.
 * Preservado de becario-reels con retrocompatibilidad exacta.
 */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Formateador de números con separador de miles en español (ej. 1.250,50).
 * Preservado de becario-reels con retrocompatibilidad exacta.
 */
export const numeroES = (n: number, decimales = 0) => {
  const [ent, dec] = Math.abs(n).toFixed(decimales).split(".");
  const conPuntos = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "-" : ""}${conPuntos}${dec ? `,${dec}` : ""}`;
};

// ============================================================================
// 2. NUEVAS UTILIDADES DE ANIMACIÓN CINEMATOGRÁFICA (Nexora Motion Reels)
// ============================================================================

/**
 * Configuración individual para una propiedad en useMultiSpring.
 */
export interface MultiSpringItem {
  /** Fotograma local en el que inicia la animación de esta propiedad (por defecto 0). */
  desde?: number;
  /**
   * Configuración física del resorte.
   * Puede ser una clave de preset ("snappy" | "bouncy" | "heavy" | "gentle") de THEME.springs
   * o un objeto SpringConfig compatible con Remotion.
   */
  config?: keyof typeof THEME.springs | SpringConfig;
  /** Valor inicial antes del inicio de la animación (por defecto 0). */
  from?: number;
  /** Valor objetivo final de la animación (por defecto 1). */
  to?: number;
  /** Duración máxima en fotogramas tras la cual se fija el valor (opcional, para clamping estricto). */
  duracionMaxima?: number;
}

/**
 * Opciones generales de ejecución para useMultiSpring.
 */
export interface MultiSpringOptions {
  /** Sobrescribir los FPS del cálculo (por defecto detecta useVideoConfig().fps o THEME.maquetacion.fps). */
  fps?: number;
}

/**
 * Hook determinista para orquestar múltiples canales de animación spring coordinados.
 * Permite animar conjuntamente escala, traslación, opacidad y rotación con físicas coherentes.
 *
 * @example
 * const { escala, opacidad, y } = useMultiSpring({
 *   escala: { desde: 0, config: "bouncy", from: 0.8, to: 1 },
 *   opacidad: { desde: 0, config: "snappy", from: 0, to: 1 },
 *   y: { desde: 2, config: "gentle", from: 40, to: 0 }
 * });
 */
export const useMultiSpring = <T extends Record<string, MultiSpringItem>>(
  items: T,
  opciones?: MultiSpringOptions
): { [K in keyof T]: number } => {
  const currentFrame = useCurrentFrame();
  let compositionFps = FPS_ESTANDAR;

  try {
    // Si estamos dentro de un Composition de Remotion, leemos los FPS reales
    const videoConfig = useVideoConfig();
    if (videoConfig && typeof videoConfig.fps === "number") {
      compositionFps = videoConfig.fps;
    }
  } catch {
    // Si se invoca fuera del árbol de Composition (ej. tests unitarios), usamos el fallback
    compositionFps = FPS_ESTANDAR;
  }

  const fps = opciones?.fps ?? compositionFps;
  const resultado = {} as { [K in keyof T]: number };

  for (const clave of Object.keys(items) as (keyof T)[]) {
    const item = items[clave];
    const desde = Math.max(0, item.desde ?? 0);
    const from = item.from ?? 0;
    const to = item.to ?? 1;

    // Resolución de la configuración de resorte (preset nombrado o SpringConfig explícito)
    let springConfig: SpringConfig;
    if (typeof item.config === "string" && item.config in THEME.springs) {
      springConfig = THEME.springs[item.config as keyof typeof THEME.springs];
    } else if (typeof item.config === "object" && item.config !== null) {
      springConfig = item.config;
    } else {
      springConfig = THEME.springs.bouncy;
    }

    if (currentFrame < desde) {
      resultado[clave] = from;
    } else {
      const progreso = spring({
        frame: currentFrame - desde,
        fps,
        config: springConfig,
      });

      // Si se definió duración máxima y se alcanzó, aseguramos el valor final sin jitter residual
      if (item.duracionMaxima !== undefined && currentFrame >= desde + item.duracionMaxima) {
        resultado[clave] = to;
      } else {
        resultado[clave] = from + progreso * (to - from);
      }
    }
  }

  return resultado;
};

/**
 * Opciones para el hook useStagger.
 */
export interface StaggerOptions {
  /** Fotograma base en el que comienza la secuencia general (por defecto 0). */
  desde?: number;
  /**
   * Fotogramas de desfase entre elementos sucesivos (por defecto 4 fotogramas).
   * A 30 FPS: 4 fotogramas ≈ 133 ms (suficiente para percibir orden sin frenar el ritmo).
   * Si es 0, desactiva el escalonamiento e inicia todos a la vez.
   */
  retrasoPorItem?: number;
  /** Duración de la interpolación individual de cada elemento en fotogramas (por defecto 12 fotogramas ≈ 400 ms). */
  duracion?: number;
  /** Curva de aceleración (por defecto Easing.out(Easing.cubic)). */
  easing?: (t: number) => number;
}

/**
 * Calcula el fotograma de inicio de un elemento dentro de una secuencia escalonada.
 * Útil para sincronizar efectos de audio o usar con usePop.
 */
export const staggerFrame = (indice: number, desde = 0, retrasoPorItem = 4): number => {
  const idx = Math.max(0, indice);
  const retraso = Math.max(0, retrasoPorItem);
  const base = Math.max(0, desde);
  return base + idx * retraso;
};

/**
 * Hook determinista para calcular el progreso de animación escalonada (stagger) de 0 a 1.
 * Permite revelar elementos en cascada secuencial sin saltos ni dependencias de reloj.
 *
 * @param indice Índice secuencial del elemento (0, 1, 2, ...). Se acota a valores >= 0.
 * @param opciones Configuración de fotograma inicial, desfase por elemento y duración.
 */
export const useStagger = (indice: number, opciones?: StaggerOptions): number => {
  const currentFrame = useCurrentFrame();
  const desde = Math.max(0, opciones?.desde ?? 0);
  const retraso = Math.max(0, opciones?.retrasoPorItem ?? 4);
  const duracion = Math.max(1, opciones?.duracion ?? 12);
  const easing = opciones?.easing ?? Easing.out(Easing.cubic);

  const frameInicio = staggerFrame(indice, desde, retraso);

  return interpolate(currentFrame, [frameInicio, frameInicio + duracion], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
};

/**
 * Opciones para el hook useBreathing.
 */
export interface BreathingOptions {
  /**
   * Amplitud de la oscilación senoidal.
   * Por defecto 4 (px si es traslación, o 0.02 si es factor de escala).
   * Si es 0, desactiva completamente la respiración.
   */
  amplitud?: number;
  /**
   * Período de ciclo completo en fotogramas (por defecto 60 fotogramas = 2.0 s a 30 FPS).
   * Valores recomendados: 60 a 90 fotogramas para un ritmo orgánico pausado.
   */
  periodo?: number;
  /** Desfase angular inicial en radianes (por defecto 0). */
  fase?: number;
  /**
   * Valor neutro sobre el cual oscila la onda senoidal.
   * Por defecto 0 (para posición/traslación). Usar 1 para transform scale.
   */
  centro?: number;
}

/**
 * Hook determinista de respiración senoidal sutil para elementos focales destacados.
 * Basado estrictamente en el fotograma de Remotion sin timers, Date.now ni Math.random.
 *
 * @example
 * // Oscilación sutil de escala para un botón principal:
 * const escala = useBreathing({ amplitud: 0.02, periodo: 60, centro: 1 });
 * // Flotación vertical suave:
 * const translateY = useBreathing({ amplitud: 6, periodo: 75, centro: 0 });
 */
export const useBreathing = (opciones?: BreathingOptions): number => {
  const frame = useCurrentFrame();
  const amplitud = opciones?.amplitud ?? 4;
  const periodo = Math.max(1, opciones?.periodo ?? 60);
  const fase = opciones?.fase ?? 0;
  const centro = opciones?.centro ?? 0;

  if (amplitud === 0) return centro;

  // Oscilación matemática determinista: centro + amplitud * sen(2 * PI * frame / periodo + fase)
  return centro + amplitud * Math.sin((2 * Math.PI * frame) / periodo + fase);
};

import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { THEME } from "./motor/theme";

/**
 * Modos de revelado tipográfico admitidos.
 */
export type ModoRevelado = "completo" | "palabra" | "caracter";

/**
 * Estilo visual del revelado de cada unidad de texto.
 */
export type EstiloRevelado = "desvanecer" | "deslizar";

/**
 * Propiedades del componente TextoRevelado.
 */
export interface TextoReveladoProps {
  /** Cadena de texto a animar (soporta acentos en español, signos de apertura ¿ ¡, puntuación y números). */
  texto: string;
  /**
   * Modo de revelado:
   * - 'palabra': Revelado secuencial palabra por palabra (recomendado para reels dinámicos).
   * - 'caracter': Revelado progresivo carácter por carácter (efecto mecanografía/teletipo sutil).
   * - 'completo': Revelado simultáneo de todo el bloque tipográfico sin desfases.
   * Por defecto 'palabra'.
   */
  modo?: ModoRevelado;
  /**
   * Estilo de animación visual para las unidades:
   * - 'deslizar': Máscara vertical limpia con desplazamiento translateY y opacidad.
   * - 'desvanecer': Transición de opacidad pura sin desplazamiento espacial.
   * Por defecto 'deslizar'.
   */
  estilo?: EstiloRevelado;
  /** Fotograma en el que comienza el revelado del texto (por defecto 0). */
  desde?: number;
  /**
   * Intervalo de fotogramas entre unidades sucesivas.
   * Por defecto: 3 fotogramas para 'palabra' (≈100 ms a 30 FPS); 1 fotograma para 'caracter' (≈33 ms).
   * Si es 0, todas las unidades inician conjuntamente.
   */
  intervalo?: number;
  /** Duración de la animación de cada unidad individual en fotogramas (por defecto 8 fotogramas ≈ 266 ms). */
  duracionUnidad?: number;
  /** Curva de aceleración para la interpolación (por defecto Easing.out(Easing.cubic)). */
  easing?: (t: number) => number;
  /** Estilos CSS para el contenedor exterior. */
  style?: React.CSSProperties;
  /** Estilos CSS aplicados a cada unidad individual (palabra o carácter). */
  itemStyle?: React.CSSProperties;
  /** Etiqueta HTML semántica a renderizar (por defecto 'div'). */
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

interface IntlWithSegmenter {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity?: "grapheme" | "word" | "sentence" }
  ) => {
    segment: (input: string) => Iterable<{ segment: string }>;
  };
}

/**
 * Segmenta un texto en caracteres respetando grafemas compuestos y pares sustitutos Unicode.
 */
function segmentarGrafemas(texto: string): string[] {
  const intlAny = Intl as unknown as IntlWithSegmenter;
  if (typeof intlAny.Segmenter === "function") {
    const segmenter = new intlAny.Segmenter("es", { granularity: "grapheme" });
    return Array.from(segmenter.segment(texto), (s) => s.segment);
  }
  return Array.from(texto);
}

/**
 * Segmenta un texto en palabras preservando signos de apertura y puntuación adjuntos.
 */
function segmentarPalabras(texto: string): string[] {
  if (!texto || texto.trim().length === 0) return [];
  return texto.trim().split(/\s+/);
}

/**
 * Componente TextoRevelado: Revelado cinético tipográfico progresivo y determinista para Remotion.
 * Diseñado para garantizar estabilidad de maquetación (sin saltos de línea al animar),
 * compatibilidad plena con ortografía en español y accesibilidad semántica.
 */
export const TextoRevelado: React.FC<TextoReveladoProps> = ({
  texto,
  modo = "palabra",
  estilo = "deslizar",
  desde = 0,
  intervalo,
  duracionUnidad = 8,
  easing = Easing.out(Easing.cubic),
  style,
  itemStyle,
  as: Component = "div",
}) => {
  const currentFrame = useCurrentFrame();

  // Tratamiento inmediato de texto vacío
  if (!texto || texto.trim().length === 0) {
    return <Component style={style}>{texto}</Component>;
  }

  // Intervalo por defecto según el modo de revelado
  const paso = Math.max(
    0,
    intervalo !== undefined ? intervalo : modo === "caracter" ? 1 : modo === "palabra" ? 3 : 0
  );
  const duracion = Math.max(1, duracionUnidad);
  const inicioBase = Math.max(0, desde);

  // División del texto según el modo seleccionado
  let unidades: string[];
  if (modo === "completo") {
    unidades = [texto];
  } else if (modo === "caracter") {
    unidades = segmentarGrafemas(texto);
  } else {
    unidades = segmentarPalabras(texto);
  }

  // Padding vertical de protección para evitar recortes de tildes o trazos descendentes en español
  const paddingMascara = THEME.maquetacion.mascaraPaddingVertical;

  return (
    <Component
      aria-label={texto}
      style={{
        display: "block",
        lineHeight: 1.25,
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ display: "inline" }}>
        {unidades.map((unidad, i) => {
          // Si modo es completo o paso es 0, todas las unidades arrancan en inicioBase
          const frameInicioItem = modo === "completo" ? inicioBase : inicioBase + i * paso;

          const progreso = interpolate(
            currentFrame,
            [frameInicioItem, frameInicioItem + duracion],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing,
            }
          );

          // Si el estilo es deslizar, usamos máscara vertical estable con translateY
          if (estilo === "deslizar") {
            const translateY = (1 - progreso) * 100;
            return (
              <React.Fragment key={`${i}-${unidad}`}>
                <span
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    paddingTop: paddingMascara,
                    paddingBottom: paddingMascara,
                    marginTop: -paddingMascara,
                    marginBottom: -paddingMascara,
                    verticalAlign: "top",
                    ...itemStyle,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      opacity: progreso,
                      transform: `translateY(${translateY.toFixed(2)}%)`,
                      whiteSpace: modo === "caracter" ? "pre" : "normal",
                    }}
                  >
                    {unidad}
                  </span>
                </span>
                {modo === "palabra" && i < unidades.length - 1 ? " " : null}
              </React.Fragment>
            );
          }

          // Estilo desvanecer (fade simple sin traslación)
          return (
            <React.Fragment key={`${i}-${unidad}`}>
              <span
                style={{
                  display: modo === "caracter" ? "inline" : "inline-block",
                  opacity: progreso,
                  whiteSpace: modo === "caracter" ? "pre" : "normal",
                  ...itemStyle,
                }}
              >
                {unidad}
              </span>
              {modo === "palabra" && i < unidades.length - 1 ? " " : null}
            </React.Fragment>
          );
        })}
      </span>
    </Component>
  );
};

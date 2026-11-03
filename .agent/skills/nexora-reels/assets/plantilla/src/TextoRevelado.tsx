import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "./motor/theme";
import { C } from "./motor/actual";
import {
  type SegmentoTexto,
  type VarianteEnfasis,
  aplanarEnUnidadesRevelado,
} from "./piezas/tipografia";

/**
 * Modos de revelado tipográfico admitidos.
 */
export type ModoRevelado = "completo" | "palabra" | "caracter";

/**
 * Estilo visual del revelado de cada unidad de texto:
 * - 'deslizar': Máscara vertical limpia con desplazamiento translateY y opacidad (histórico por defecto).
 * - 'desvanecer': Transición de opacidad pura sin desplazamiento espacial (histórico).
 * - 'pop': Entrada elástica con rebote de resorte amortiguado sin desplazamiento de layout.
 * - 'blur': Desempañado cinético con desenfoque decreciente de 8px a 0px.
 * - 'subrayado': Revelado con trazado sincronizado de línea de subrayado inferior.
 * - 'cortinilla': Desplazamiento horizontal progresivo mediante máscara clip-path.
 */
export type EstiloRevelado = "desvanecer" | "deslizar" | "pop" | "blur" | "subrayado" | "cortinilla";

/**
 * Propiedades del componente TextoRevelado.
 */
export interface TextoReveladoProps {
  /** Cadena de texto a animar (soporta acentos en español, signos de apertura ¿ ¡, puntuación y números). */
  texto?: string;
  /** Estructura explícita de segmentos enriquecidos opcional (Etapa 40). */
  segmentos?: SegmentoTexto[];
  /**
   * Modo de revelado:
   * - 'palabra': Revelado secuencial palabra por palabra (recomendado para reels dinámicos).
   * - 'caracter': Revelado progresivo carácter por carácter (efecto mecanografía/teletipo sutil).
   * - 'completo': Revelado simultáneo de todo el bloque tipográfico sin desfases.
   * Por defecto 'palabra'.
   */
  modo?: ModoRevelado;
  /**
   * Estilo de animación visual para las unidades.
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
  /** Color de acento para estilos con trazo o resaltado ('subrayado', 'pop'). */
  colorAcento?: string;
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

interface UnidadRevelada {
  texto: string;
  enfasis?: boolean;
  variante?: VarianteEnfasis;
  color?: string;
  esEspacio?: boolean;
  esSaltoLinea?: boolean;
}

/**
 * Componente TextoRevelado: Revelado cinético tipográfico progresivo y determinista para Remotion.
 * Diseñado para garantizar estabilidad de maquetación (sin saltos de línea al animar),
 * compatibilidad plena con ortografía en español y accesibilidad semántica.
 */
export const TextoRevelado: React.FC<TextoReveladoProps> = ({
  texto: textoProp,
  segmentos,
  modo = "palabra",
  estilo = "deslizar",
  desde = 0,
  intervalo,
  duracionUnidad = 8,
  easing = Easing.out(Easing.cubic),
  colorAcento,
  style,
  itemStyle,
  as: Component = "div",
}) => {
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Si se proveen segmentos enriquecidos
  const texto = textoProp ?? (segmentos ? segmentos.map((s) => s.texto).join("") : "");

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

  // División del texto en unidades
  let unidades: UnidadRevelada[];

  if (segmentos && segmentos.length > 0) {
    unidades = aplanarEnUnidadesRevelado(segmentos, modo === "caracter" ? "caracter" : "palabra");
  } else if (modo === "completo") {
    unidades = [{ texto }];
  } else if (modo === "caracter") {
    unidades = segmentarGrafemas(texto).map((ch) => ({ texto: ch, esEspacio: ch === " " }));
  } else {
    unidades = segmentarPalabras(texto).map((p) => ({ texto: p }));
  }

  // Padding vertical de protección para evitar recortes de tildes o trazos descendentes en español
  const paddingMascara = THEME.maquetacion.mascaraPaddingVertical;
  const colAcento = colorAcento ?? C.acento ?? THEME.colores.acento;

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
        {unidades.map((u, i) => {
          if (u.esSaltoLinea) {
            return <br key={`br-${i}`} />;
          }

          const unidad = u.texto;

          // Si es espacio puro proveniente de segmentos
          if (u.esEspacio) {
            return (
              <span key={`sp-${i}`} style={{ whiteSpace: "pre" }}>
                {unidad}
              </span>
            );
          }

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

          // Estilo de énfasis opcional si la unidad tiene metadata
          const estiloEnfasis: React.CSSProperties = u.enfasis
            ? {
                color: u.color ?? colAcento,
                fontWeight: 700,
              }
            : {};

          // -------------------------------------------------------------
          // 1. Estilo histórico 'deslizar' (PRESERVADO 100% IDÉNTICO)
          // -------------------------------------------------------------
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
                      ...estiloEnfasis,
                    }}
                  >
                    {unidad}
                  </span>
                </span>
                {modo === "palabra" && !segmentos && i < unidades.length - 1 ? " " : null}
              </React.Fragment>
            );
          }

          // -------------------------------------------------------------
          // 2. Estilo histórico 'desvanecer' (PRESERVADO 100% IDÉNTICO)
          // -------------------------------------------------------------
          if (estilo === "desvanecer") {
            return (
              <React.Fragment key={`${i}-${unidad}`}>
                <span
                  style={{
                    display: modo === "caracter" ? "inline" : "inline-block",
                    opacity: progreso,
                    whiteSpace: modo === "caracter" ? "pre" : "normal",
                    ...estiloEnfasis,
                    ...itemStyle,
                  }}
                >
                  {unidad}
                </span>
                {modo === "palabra" && !segmentos && i < unidades.length - 1 ? " " : null}
              </React.Fragment>
            );
          }

          // -------------------------------------------------------------
          // 3. Estilo nuevo 'pop' (Resorte elástico amortiguado)
          // -------------------------------------------------------------
          if (estilo === "pop") {
            const escalaResorte = spring({
              frame: Math.max(0, currentFrame - frameInicioItem),
              fps,
              config: THEME.springs.bouncy,
            });
            const opac = progreso;
            const esc = 0.8 + 0.2 * escalaResorte;

            return (
              <React.Fragment key={`${i}-${unidad}`}>
                <span
                  style={{
                    display: "inline-block",
                    opacity: opac,
                    transform: `scale(${esc.toFixed(3)})`,
                    transformOrigin: "center baseline",
                    whiteSpace: modo === "caracter" ? "pre" : "normal",
                    ...estiloEnfasis,
                    ...itemStyle,
                  }}
                >
                  {unidad}
                </span>
                {modo === "palabra" && !segmentos && i < unidades.length - 1 ? " " : null}
              </React.Fragment>
            );
          }

          // -------------------------------------------------------------
          // 4. Estilo nuevo 'blur' (Desempañado cinético)
          // -------------------------------------------------------------
          if (estilo === "blur") {
            const blurPx = (1 - progreso) * 8;
            return (
              <React.Fragment key={`${i}-${unidad}`}>
                <span
                  style={{
                    display: modo === "caracter" ? "inline" : "inline-block",
                    opacity: progreso,
                    filter: blurPx > 0.3 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
                    whiteSpace: modo === "caracter" ? "pre" : "normal",
                    ...estiloEnfasis,
                    ...itemStyle,
                  }}
                >
                  {unidad}
                </span>
                {modo === "palabra" && !segmentos && i < unidades.length - 1 ? " " : null}
              </React.Fragment>
            );
          }

          // -------------------------------------------------------------
          // 5. Estilo nuevo 'subrayado' (Trazo vectorial inferior)
          // -------------------------------------------------------------
          if (estilo === "subrayado") {
            return (
              <React.Fragment key={`${i}-${unidad}`}>
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    opacity: progreso,
                    whiteSpace: modo === "caracter" ? "pre" : "normal",
                    ...estiloEnfasis,
                    ...itemStyle,
                  }}
                >
                  {unidad}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: -2,
                      height: 3,
                      width: `${(progreso * 100).toFixed(1)}%`,
                      backgroundColor: colAcento,
                      borderRadius: 1,
                      pointerEvents: "none",
                    }}
                  />
                </span>
                {modo === "palabra" && !segmentos && i < unidades.length - 1 ? " " : null}
              </React.Fragment>
            );
          }

          // -------------------------------------------------------------
          // 6. Estilo nuevo 'cortinilla' (Máscara clip-path)
          // -------------------------------------------------------------
          if (estilo === "cortinilla") {
            const clipRight = ((1 - progreso) * 100).toFixed(1);
            return (
              <React.Fragment key={`${i}-${unidad}`}>
                <span
                  style={{
                    display: "inline-block",
                    clipPath: `inset(0 ${clipRight}% 0 0)`,
                    opacity: progreso > 0 ? 1 : 0,
                    willChange: "clip-path",
                    whiteSpace: modo === "caracter" ? "pre" : "normal",
                    ...estiloEnfasis,
                    ...itemStyle,
                  }}
                >
                  {unidad}
                </span>
                {modo === "palabra" && !segmentos && i < unidades.length - 1 ? " " : null}
              </React.Fragment>
            );
          }

          return null;
        })}
      </span>
    </Component>
  );
};

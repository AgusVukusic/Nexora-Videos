import React from "react";
import { C } from "../motor/actual";
import { THEME } from "../motor/theme";

// ============================================================================
// 1. CONTRATO Y ANALIZADOR LÉXICO DETERMINISTA DE TEXTO CON ÉNFASIS
// ============================================================================

export type VarianteEnfasis = "acento" | "fondo" | "subrayado" | "borde" | "mono";

export interface SegmentoTexto {
  id: string;
  texto: string;
  enfasis: boolean;
  variante?: VarianteEnfasis;
  color?: string;
  esEspacio: boolean;
  esSaltoLinea: boolean;
}

/**
 * Analizador léxico determinista (máquina de estados carácter a carácter).
 * Procesa marcas de énfasis con sintaxis '*énfasis*' o '*[variante:énfasis]*'
 * preservando fielmente:
 * - Asteriscos literales escapados con '\*'
 * - Espacios en blanco múltiples y sangrías
 * - Saltos de línea explícitos '\n'
 * - Puntuación y signos ortográficos en español (¿, ¡, ., ,, :, ;, etc.)
 *
 * @param texto Cadena de texto a procesar.
 * @param variantePorDefecto Variante aplicada a los segmentos enfatizados (por defecto 'acento').
 */
export function analizarTextoConAsteriscos(
  texto: string,
  variantePorDefecto: VarianteEnfasis = "acento"
): SegmentoTexto[] {
  if (!texto) return [];

  const segmentos: SegmentoTexto[] = [];
  let buffer = "";
  let segId = 0;

  const emitirBuffer = (enfasis = false, variante?: VarianteEnfasis) => {
    if (buffer.length === 0) return;

    if (buffer === "\n") {
      segmentos.push({
        id: `seg-${segId++}`,
        texto: "\n",
        enfasis: false,
        esEspacio: false,
        esSaltoLinea: true,
      });
      buffer = "";
      return;
    }

    const esEspacioPuro = /^\s+$/.test(buffer);
    segmentos.push({
      id: `seg-${segId++}`,
      texto: buffer,
      enfasis,
      variante: enfasis ? (variante ?? variantePorDefecto) : undefined,
      esEspacio: esEspacioPuro,
      esSaltoLinea: false,
    });
    buffer = "";
  };

  let i = 0;
  while (i < texto.length) {
    const ch = texto[i];

    // 1. Escape de asterisco literal: \*
    if (ch === "\\" && i + 1 < texto.length && texto[i + 1] === "*") {
      buffer += "*";
      i += 2;
      continue;
    }

    // 2. Salto de línea explícito
    if (ch === "\n") {
      emitirBuffer(false);
      buffer = "\n";
      emitirBuffer(false);
      i++;
      continue;
    }

    // 3. Verificación de asterisco
    if (ch === "*") {
      // 3.1 Aritmética: dígito antes y dígito después (ej: 5*5 = 25)
      const prevCh = i > 0 ? texto[i - 1] : "";
      const nextCh = i + 1 < texto.length ? texto[i + 1] : "";
      if (/\d/.test(prevCh) && /\d/.test(nextCh)) {
        buffer += "*";
        i++;
        continue;
      }

      // 3.2 Asterisco aislado entre espacios: ' * ' (ej: 2 * 3)
      if ((i === 0 || /\s/.test(prevCh)) && (i + 1 === texto.length || /\s/.test(nextCh))) {
        buffer += "*";
        i++;
        continue;
      }

      // 3.3 Buscar si existe un asterisco de cierre válido para este bloque
      let j = i + 1;
      let cierreIdx = -1;
      while (j < texto.length) {
        if (texto[j] === "\\" && j + 1 < texto.length && texto[j + 1] === "*") {
          j += 2;
          continue;
        }
        if (texto[j] === "\n") {
          break; // El énfasis no cruza saltos de línea sin cerrar
        }
        if (texto[j] === "*") {
          // El cierre no puede estar precedido inmediatamente por espacio (ej: '*texto *')
          if (j > i + 1 && !/\s/.test(texto[j - 1])) {
            cierreIdx = j;
            break;
          }
        }
        j++;
      }

      // Si no hay cierre válido, tratar este '*' como carácter literal
      if (cierreIdx === -1) {
        buffer += "*";
        i++;
        continue;
      }

      // Si hay cierre válido, emitir el buffer acumulado anterior como texto plano
      emitirBuffer(false);

      // Extraer contenido entre i y cierreIdx
      let contenido = texto.slice(i + 1, cierreIdx);
      let variante = variantePorDefecto;

      // Verificar si contiene selector de variante:
      // Formato A: *[subrayado]texto*
      // Formato B: *[subrayado:texto]*
      if (contenido.startsWith("[")) {
        const finCorchete = contenido.indexOf("]");
        const dosPuntos = contenido.indexOf(":");

        if (finCorchete !== -1 && (dosPuntos === -1 || finCorchete < dosPuntos)) {
          const varNombre = contenido.slice(1, finCorchete).trim();
          if (["acento", "fondo", "subrayado", "borde", "mono"].includes(varNombre)) {
            variante = varNombre as VarianteEnfasis;
            contenido = contenido.slice(finCorchete + 1);
          }
        } else if (dosPuntos !== -1 && contenido.endsWith("]")) {
          const varNombre = contenido.slice(1, dosPuntos).trim();
          if (["acento", "fondo", "subrayado", "borde", "mono"].includes(varNombre)) {
            variante = varNombre as VarianteEnfasis;
            contenido = contenido.slice(dosPuntos + 1, -1);
          }
        }
      }

      buffer = contenido;
      emitirBuffer(true, variante);
      i = cierreIdx + 1;
      continue;
    }

    buffer += ch;
    i++;
  }

  emitirBuffer(false);
  return segmentos;
}

/**
 * Descompone una lista de segmentos de texto en unidades de revelado lineales
 * (palabras o caracteres), manteniendo los metadatos de énfasis y estilo asociados.
 */
export function aplanarEnUnidadesRevelado(
  segmentos: SegmentoTexto[],
  modo: "palabra" | "caracter" = "palabra"
): Array<{
  texto: string;
  enfasis: boolean;
  variante?: VarianteEnfasis;
  color?: string;
  esEspacio: boolean;
  esSaltoLinea: boolean;
}> {
  const unidades: Array<{
    texto: string;
    enfasis: boolean;
    variante?: VarianteEnfasis;
    color?: string;
    esEspacio: boolean;
    esSaltoLinea: boolean;
  }> = [];

  for (const seg of segmentos) {
    if (seg.esSaltoLinea) {
      unidades.push(seg);
      continue;
    }

    if (modo === "caracter") {
      for (const ch of Array.from(seg.texto)) {
        unidades.push({
          texto: ch,
          enfasis: seg.enfasis,
          variante: seg.variante,
          color: seg.color,
          esEspacio: ch === " ",
          esSaltoLinea: false,
        });
      }
    } else {
      // Modo palabra
      const palabras = seg.texto.split(/(\s+)/);
      for (const p of palabras) {
        if (!p) continue;
        const esEspacio = /^\s+$/.test(p);
        unidades.push({
          texto: p,
          enfasis: esEspacio ? false : seg.enfasis,
          variante: seg.variante,
          color: seg.color,
          esEspacio,
          esSaltoLinea: false,
        });
      }
    }
  }

  return unidades;
}

// ============================================================================
// 2. COMPONENTE TextoConEnfasis
// ============================================================================

export interface TextoConEnfasisProps {
  /** Texto plano con sintaxis de marcado '*énfasis*'. */
  texto?: string;
  /** Alternativa declarativa: lista explícita de segmentos AST. */
  segmentos?: SegmentoTexto[];
  variantePorDefecto?: VarianteEnfasis;
  colorAcento?: string;
  colorTexto?: string;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

export const TextoConEnfasis: React.FC<TextoConEnfasisProps> = ({
  texto,
  segmentos: segmentosProp,
  variantePorDefecto = "acento",
  colorAcento,
  colorTexto,
  style,
  itemStyle,
}) => {
  const segmentos =
    segmentosProp ?? (texto ? analizarTextoConAsteriscos(texto, variantePorDefecto) : []);

  const acento = colorAcento ?? C.acento ?? THEME.colores.acento;
  const colTexto = colorTexto ?? C.texto ?? THEME.colores.textoPrimario;

  return (
    <span
      style={{
        display: "inline",
        color: colTexto,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {segmentos.map((seg) => {
        if (seg.esSaltoLinea) {
          return <br key={seg.id} />;
        }

        if (!seg.enfasis) {
          return (
            <span key={seg.id} style={itemStyle}>
              {seg.texto}
            </span>
          );
        }

        // Estilos específicos para cada variante de énfasis
        let estiloVariante: React.CSSProperties = {};
        const colSegAcento = seg.color ?? acento;

        switch (seg.variante) {
          case "acento":
            estiloVariante = {
              color: colSegAcento,
              fontWeight: 700,
            };
            break;
          case "fondo":
            estiloVariante = {
              backgroundColor: colSegAcento,
              color: C.acentoTexto ?? "#000000",
              padding: "1px 6px",
              borderRadius: "4px",
              fontWeight: 700,
            };
            break;
          case "subrayado":
            estiloVariante = {
              borderBottom: `3px solid ${colSegAcento}`,
              paddingBottom: "1px",
              fontWeight: 600,
            };
            break;
          case "borde":
            estiloVariante = {
              border: `1.5px solid ${colSegAcento}`,
              padding: "0 6px",
              borderRadius: "4px",
              color: colSegAcento,
              fontWeight: 600,
            };
            break;
          case "mono":
            estiloVariante = {
              fontFamily: "monospace",
              color: colSegAcento,
              backgroundColor: "rgba(255,255,255,0.06)",
              padding: "0 4px",
              borderRadius: "2px",
              letterSpacing: "-0.02em",
            };
            break;
          default:
            estiloVariante = {
              color: colSegAcento,
              fontWeight: 700,
            };
        }

        return (
          <span
            key={seg.id}
            style={{
              display: "inline",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              ...estiloVariante,
              ...itemStyle,
            }}
          >
            {seg.texto}
          </span>
        );
      })}
    </span>
  );
};

// ============================================================================
// 3. COMPONENTES TIPOGRÁFICOS DE JERARQUÍA EDITORIAL
// ============================================================================

export interface TipografiaBaseProps {
  color?: string;
  alinear?: "izquierda" | "centro" | "derecha";
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const alignMap = {
  izquierda: "left" as const,
  centro: "center" as const,
  derecha: "right" as const,
};

/**
 * Titular Principal: Elemento focal de máximo impacto visual.
 * Diseñado para encabezados contundentes, números sobredimensionados o frases clave.
 */
export const TitularPrincipal: React.FC<TipografiaBaseProps & { tamano?: number }> = ({
  color,
  alinear = "izquierda",
  tamano = 72,
  style,
  children,
}) => {
  return (
    <h1
      style={{
        margin: 0,
        padding: 0,
        fontSize: `${tamano}px`,
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: "-0.035em",
        textAlign: alignMap[alinear],
        color: color ?? C.texto ?? THEME.colores.textoPrimario,
        ...style,
      }}
    >
      {children}
    </h1>
  );
};

/**
 * Titular Secundario: Apoyo estructural para subtítulos, categorías o pasos.
 */
export const TitularSecundario: React.FC<TipografiaBaseProps & { tamano?: number }> = ({
  color,
  alinear = "izquierda",
  tamano = 42,
  style,
  children,
}) => {
  return (
    <h2
      style={{
        margin: 0,
        padding: 0,
        fontSize: `${tamano}px`,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        textAlign: alignMap[alinear],
        color: color ?? C.texto ?? THEME.colores.textoPrimario,
        ...style,
      }}
    >
      {children}
    </h2>
  );
};

/**
 * Cuerpo de Texto: Lectura clara, espaciado cómodo y jerarquía de texto secundario.
 */
export const CuerpoTexto: React.FC<TipografiaBaseProps & { tamano?: number }> = ({
  color,
  alinear = "izquierda",
  tamano = 28,
  style,
  children,
}) => {
  return (
    <p
      style={{
        margin: 0,
        padding: 0,
        fontSize: `${tamano}px`,
        fontWeight: 400,
        lineHeight: 1.45,
        letterSpacing: "-0.01em",
        textAlign: alignMap[alinear],
        color: color ?? C.textoMuted ?? THEME.colores.textoSecundario,
        ...style,
      }}
    >
      {children}
    </p>
  );
};

/**
 * Etiqueta / Badge: Micro-elemento de categorización, estado o metadatos de escena.
 */
export interface EtiquetaProps extends TipografiaBaseProps {
  variante?: "solida" | "borde" | "tecnica";
  colorAcento?: string;
}

export const Etiqueta: React.FC<EtiquetaProps> = ({
  variante = "solida",
  colorAcento,
  color,
  alinear = "izquierda",
  style,
  children,
}) => {
  const acento = colorAcento ?? C.acento ?? THEME.colores.acento;

  let varianteStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: color ?? C.texto ?? THEME.colores.textoPrimario,
    borderRadius: "4px",
    padding: "4px 10px",
  };

  if (variante === "solida") {
    varianteStyle = {
      backgroundColor: acento,
      color: C.acentoTexto ?? "#000000",
      borderRadius: "4px",
      padding: "4px 12px",
      fontWeight: 700,
    };
  } else if (variante === "borde") {
    varianteStyle = {
      backgroundColor: "transparent",
      border: `1.5px solid ${acento}`,
      color: color ?? acento,
      borderRadius: "4px",
      padding: "3px 10px",
      fontWeight: 600,
    };
  } else if (variante === "tecnica") {
    varianteStyle = {
      backgroundColor: "rgba(0,0,0,0.3)",
      borderLeft: `3px solid ${acento}`,
      color: color ?? C.texto ?? THEME.colores.textoPrimario,
      borderRadius: "0",
      padding: "3px 8px",
      fontFamily: "monospace",
    };
  }

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "18px",
        lineHeight: 1,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        textAlign: alignMap[alinear],
        ...varianteStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/**
 * Microtexto: Metadatos técnicos, coordenadas, pies de página o códigos de registro.
 */
export const Microtexto: React.FC<TipografiaBaseProps & { mono?: boolean }> = ({
  color,
  mono = false,
  alinear = "izquierda",
  style,
  children,
}) => {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: mono ? "0.02em" : "0.04em",
        fontFamily: mono ? "monospace" : undefined,
        textTransform: "uppercase",
        textAlign: alignMap[alinear],
        color: color ?? C.textoMuted ?? THEME.colores.textoMuted,
        opacity: 0.85,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/**
 * DatoMetrico: Visualización de números destacados de alto impacto visual para métricas o estadísticas.
 */
export interface DatoMetricoProps {
  valor: string | number;
  etiqueta?: string;
  prefijo?: string;
  sufijo?: string;
  color?: string;
  colorEtiqueta?: string;
  tamano?: number;
  alinear?: "izquierda" | "centro" | "derecha";
  style?: React.CSSProperties;
}

export const DatoMetrico: React.FC<DatoMetricoProps> = ({
  valor,
  etiqueta,
  prefijo,
  sufijo,
  color,
  colorEtiqueta,
  tamano = 96,
  alinear = "izquierda",
  style,
}) => {
  const colNumero = color ?? C.acento ?? THEME.colores.acento;
  const colEtiqueta = colorEtiqueta ?? C.textoMuted ?? THEME.colores.textoMuted;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: alinear === "centro" ? "center" : alinear === "derecha" ? "flex-end" : "flex-start",
        textAlign: alignMap[alinear],
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
          fontSize: `${tamano}px`,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: colNumero,
        }}
      >
        {prefijo && (
          <span style={{ fontSize: `${Math.round(tamano * 0.45)}px`, fontWeight: 700, opacity: 0.85 }}>
            {prefijo}
          </span>
        )}
        <span>{valor}</span>
        {sufijo && (
          <span style={{ fontSize: `${Math.round(tamano * 0.45)}px`, fontWeight: 700, opacity: 0.85 }}>
            {sufijo}
          </span>
        )}
      </div>
      {etiqueta && (
        <span
          style={{
            marginTop: "6px",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: colEtiqueta,
            textTransform: "uppercase",
          }}
        >
          {etiqueta}
        </span>
      )}
    </div>
  );
};

import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { LIENZO, ZONA, C, SOMBRA } from "../motor/actual";
import { THEME } from "../motor/theme";
import type { CamaraConfig } from "../tipos";
import { normalizarCamara, calcularTransformacionCamara } from "../motor/camara";
import { calcularDashOffset, generarEsquinasReticula, generarMarcasRegla } from "../motor/trazos";

// ============================================================================
// TOKENS Y UTILIDADES DE ESPACIADO
// ============================================================================

export type EspaciadoToken = "ninguno" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;

export function resolverEspaciado(esp?: EspaciadoToken): number {
  if (typeof esp === "number") return Math.max(0, esp);
  switch (esp) {
    case "ninguno":
      return 0;
    case "xs":
      return 8;
    case "sm":
      return 16;
    case "md":
      return 24;
    case "lg":
      return 40;
    case "xl":
      return 64;
    case "2xl":
      return 96;
    default:
      return 24;
  }
}

// ============================================================================
// 1. ÁREA DE COMPOSICIÓN (AreaComposicion)
// ============================================================================

export type ModoAreaComposicion =
  | "dinamica"
  | "lienzo-estandar"
  | "pantalla-completa"
  | "editorial-alta"
  | "split-superior"
  | "personalizada";

export interface AreaComposicionProps {
  modo?: ModoAreaComposicion;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  padding?: EspaciadoToken | [EspaciadoToken, EspaciadoToken];
  margenPlataforma?: boolean;
  desbordamiento?: "visible" | "oculto";
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const AreaComposicion: React.FC<AreaComposicionProps> = ({
  modo = "dinamica",
  x,
  y,
  w,
  h,
  padding,
  margenPlataforma = false,
  desbordamiento = "visible",
  style,
  children,
}) => {
  let area = { x: 60, y: 210, w: 960, h: 860 };

  switch (modo) {
    case "dinamica":
      area = { x: ZONA.x, y: ZONA.y, w: ZONA.w, h: ZONA.h };
      break;
    case "lienzo-estandar":
      area = { x: LIENZO.x, y: LIENZO.y, w: LIENZO.w, h: LIENZO.h };
      break;
    case "pantalla-completa":
      area = { x: 0, y: 0, w: 1080, h: 1920 };
      break;
    case "editorial-alta":
      area = { x: 60, y: 160, w: 960, h: 900 };
      break;
    case "split-superior":
      area = { x: 60, y: 100, w: 960, h: 860 };
      break;
    case "personalizada":
      area = {
        x: x ?? 60,
        y: y ?? 210,
        w: w ?? 960,
        h: h ?? 860,
      };
      break;
  }

  // Si se pasan coordenadas explícitas sobreescribiendo el modo
  if (x !== undefined) area.x = x;
  if (y !== undefined) area.y = y;
  if (w !== undefined) area.w = w;
  if (h !== undefined) area.h = h;

  let padY = 0;
  let padX = 0;
  if (Array.isArray(padding)) {
    padY = resolverEspaciado(padding[0]);
    padX = resolverEspaciado(padding[1]);
  } else if (padding !== undefined) {
    const p = resolverEspaciado(padding);
    padY = p;
    padX = p;
  }

  // Protección contra UI de plataformas en modo pantalla-completa
  if (margenPlataforma && modo === "pantalla-completa") {
    padY = Math.max(padY, 160);
    padX = Math.max(padX, 60);
  }

  return (
    <div
      style={{
        position: "absolute",
        left: area.x,
        top: area.y,
        width: area.w,
        height: area.h,
        paddingTop: padY,
        paddingBottom: padY,
        paddingLeft: padX,
        paddingRight: padX,
        boxSizing: "border-box",
        overflow: desbordamiento === "oculto" ? "hidden" : "visible",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 2. PILA DE DISTRIBUCIÓN (Pila / Stack)
// ============================================================================

export interface PilaProps {
  direccion?: "vertical" | "horizontal";
  espaciado?: EspaciadoToken;
  alinear?: "inicio" | "centro" | "fin" | "estirar" | "linea-base";
  distribuir?: "inicio" | "centro" | "fin" | "espacio-entre" | "espacio-alrededor";
  envolver?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Pila: React.FC<PilaProps> = ({
  direccion = "vertical",
  espaciado = "md",
  alinear = "estirar",
  distribuir = "inicio",
  envolver = false,
  style,
  children,
}) => {
  const gap = resolverEspaciado(espaciado);

  const alignMap = {
    inicio: "flex-start",
    centro: "center",
    fin: "flex-end",
    estirar: "stretch",
    "linea-base": "baseline",
  };

  const justifyMap = {
    inicio: "flex-start",
    centro: "center",
    fin: "flex-end",
    "espacio-entre": "space-between",
    "espacio-alrededor": "space-around",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direccion === "vertical" ? "column" : "row",
        gap: `${gap}px`,
        alignItems: alignMap[alinear] ?? "stretch",
        justifyContent: justifyMap[distribuir] ?? "flex-start",
        flexWrap: envolver ? "wrap" : "nowrap",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 3. GRILLA EDITORIAL (GrillaEditorial / Grid)
// ============================================================================

export interface GrillaEditorialProps {
  columnas?: number | string;
  filas?: number | string;
  espaciado?: EspaciadoToken | [EspaciadoToken, EspaciadoToken];
  alinearItems?: "inicio" | "centro" | "fin" | "estirar";
  escalonado?: {
    desde?: number;
    intervalo?: number;
  };
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const GrillaEditorial: React.FC<GrillaEditorialProps> = ({
  columnas = 2,
  filas,
  espaciado = "md",
  alinearItems = "estirar",
  escalonado,
  style,
  children,
}) => {
  const frame = useCurrentFrame();

  let gapY = 24;
  let gapX = 24;
  if (Array.isArray(espaciado)) {
    gapY = resolverEspaciado(espaciado[0]);
    gapX = resolverEspaciado(espaciado[1]);
  } else {
    const g = resolverEspaciado(espaciado);
    gapY = g;
    gapX = g;
  }

  const gridTemplateColumns =
    typeof columnas === "number" ? `repeat(${Math.max(1, columnas)}, 1fr)` : columnas;

  const gridTemplateRows =
    typeof filas === "number" ? `repeat(${Math.max(1, filas)}, 1fr)` : filas;

  const alignMap = {
    inicio: "start",
    centro: "center",
    fin: "end",
    estirar: "stretch",
  };

  const childArray = React.Children.toArray(children);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns,
        gridTemplateRows,
        columnGap: `${gapX}px`,
        rowGap: `${gapY}px`,
        alignItems: alignMap[alinearItems] ?? "stretch",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {childArray.map((child, idx) => {
        if (!escalonado) return child;

        const base = Math.max(0, escalonado.desde ?? 0);
        const intervalo = Math.max(1, escalonado.intervalo ?? 2);
        const startFrame = base + idx * intervalo;
        const dur = 8;

        const opacidad = interpolate(frame, [startFrame, startFrame + dur], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const translateY = interpolate(frame, [startFrame, startFrame + dur], [20, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

        return (
          <div
            key={idx}
            style={{
              opacity: opacidad,
              transform: `translateY(${translateY.toFixed(2)}px)`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 4. COMPOSICIÓN ASIMÉTRICA (ComposicionAsimetrica / SplitLayout)
// ============================================================================

export type RatioAsimetrico = "50-50" | "60-40" | "70-30" | "38-62" | "80-20" | [number, number];

export interface ComposicionAsimetricaProps {
  orientacion?: "horizontal" | "vertical";
  proporcion?: RatioAsimetrico;
  separacion?: EspaciadoToken;
  primario: React.ReactNode;
  secundario: React.ReactNode;
  invertir?: boolean;
  style?: React.CSSProperties;
}

export const ComposicionAsimetrica: React.FC<ComposicionAsimetricaProps> = ({
  orientacion = "horizontal",
  proporcion = "70-30",
  separacion = "lg",
  primario,
  secundario,
  invertir = false,
  style,
}) => {
  let flexA = 7;
  let flexB = 3;

  if (Array.isArray(proporcion)) {
    flexA = Math.max(0.1, proporcion[0]);
    flexB = Math.max(0.1, proporcion[1]);
  } else {
    switch (proporcion) {
      case "50-50":
        flexA = 1;
        flexB = 1;
        break;
      case "60-40":
        flexA = 6;
        flexB = 4;
        break;
      case "70-30":
        flexA = 7;
        flexB = 3;
        break;
      case "38-62":
        flexA = 3.82;
        flexB = 6.18;
        break;
      case "80-20":
        flexA = 8;
        flexB = 2;
        break;
    }
  }

  const slot1 = invertir ? secundario : primario;
  const slot2 = invertir ? primario : secundario;
  const f1 = invertir ? flexB : flexA;
  const f2 = invertir ? flexA : flexB;

  const gap = resolverEspaciado(separacion);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: orientacion === "horizontal" ? "row" : "column",
        gap: `${gap}px`,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ flex: f1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        {slot1}
      </div>
      <div style={{ flex: f2, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        {slot2}
      </div>
    </div>
  );
};

// ============================================================================
// 5. PANEL EDITORIAL (PanelEditorial)
// ============================================================================

export type VariantePanel = "transparente" | "editorial" | "tecnico" | "solido" | "flotante";

export interface PanelEditorialProps {
  variante?: VariantePanel;
  padding?: EspaciadoToken;
  bordeColor?: string;
  fondoColor?: string;
  cabecera?: React.ReactNode;
  pie?: React.ReactNode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const PanelEditorial: React.FC<PanelEditorialProps> = ({
  variante = "editorial",
  padding = "md",
  bordeColor,
  fondoColor,
  cabecera,
  pie,
  style,
  children,
}) => {
  const pad = resolverEspaciado(padding);
  const colorBorde = bordeColor ?? C.linea ?? THEME.colores.superficieBorde;
  const colorFondo = fondoColor ?? C.tarjeta ?? THEME.colores.superficie;

  let baseStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  switch (variante) {
    case "transparente":
      baseStyle = {
        ...baseStyle,
        background: "transparent",
        border: "none",
      };
      break;
    case "editorial":
      baseStyle = {
        ...baseStyle,
        background: "transparent",
        borderTop: `1px solid ${colorBorde}`,
        borderBottom: `1px solid ${colorBorde}`,
      };
      break;
    case "tecnico":
      baseStyle = {
        ...baseStyle,
        background: colorFondo,
        border: `1px solid ${colorBorde}`,
        // Esquinas recortadas en chaflán técnico
        clipPath: "polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px)",
      };
      break;
    case "solido":
      baseStyle = {
        ...baseStyle,
        background: colorFondo,
        border: `1px solid ${colorBorde}`,
        borderRadius: "4px",
      };
      break;
    case "flotante":
      baseStyle = {
        ...baseStyle,
        background: colorFondo,
        border: `1px solid ${colorBorde}`,
        borderRadius: "8px",
        boxShadow: SOMBRA,
      };
      break;
  }

  return (
    <div style={{ ...baseStyle, ...style }}>
      {cabecera && (
        <div
          style={{
            paddingLeft: pad,
            paddingRight: pad,
            paddingTop: Math.max(8, pad * 0.6),
            paddingBottom: 8,
            borderBottom: variante === "editorial" || variante === "tecnico" ? `1px solid ${colorBorde}` : undefined,
          }}
        >
          {cabecera}
        </div>
      )}
      <div style={{ padding: pad, flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      {pie && (
        <div
          style={{
            paddingLeft: pad,
            paddingRight: pad,
            paddingBottom: Math.max(8, pad * 0.6),
            paddingTop: 8,
            borderTop: variante === "editorial" || variante === "tecnico" ? `1px solid ${colorBorde}` : undefined,
          }}
        >
          {pie}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. MARCO DE ENCUADRE (MarcoEncuadre)
// ============================================================================

export type VarianteMarco = "esquinas" | "reticula-tercios" | "regla" | "perimetro-abierto" | "completo";

export interface MarcoEncuadreProps {
  variante?: VarianteMarco;
  color?: string;
  grosor?: number;
  opacidad?: number;
  animar?: {
    desde?: number;
    duracion?: number;
  };
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const MarcoEncuadre: React.FC<MarcoEncuadreProps> = ({
  variante = "esquinas",
  color,
  grosor = 1.5,
  opacidad = 0.85,
  animar,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const c = color ?? C.linea ?? THEME.colores.acento;

  let progreso = 1;
  if (animar) {
    const inicio = Math.max(0, animar.desde ?? 0);
    const dur = Math.max(1, animar.duracion ?? 15);
    progreso = interpolate(frame, [inicio, inicio + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  }

  // Dimensiones representativas de contenedor SVG
  const w = 960;
  const h = 860;
  const dash = calcularDashOffset(progreso, 120);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", ...style }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
          opacity: opacidad,
        }}
      >
        {variante === "esquinas" && (() => {
          const esq = generarEsquinasReticula(2, 2, w - 4, h - 4, 32);
          return (
            <g
              stroke={c}
              strokeWidth={grosor}
              fill="none"
              strokeDasharray={animar ? dash.strokeDasharray : undefined}
              strokeDashoffset={animar ? dash.strokeDashoffset : undefined}
            >
              <path d={esq.topIzq} />
              <path d={esq.topDer} />
              <path d={esq.botIzq} />
              <path d={esq.botDer} />
            </g>
          );
        })()}

        {variante === "reticula-tercios" && (
          <g stroke={c} strokeWidth={grosor * 0.75} strokeDasharray="4 6" opacity={0.5}>
            {/* Líneas horizontales de tercio */}
            <line x1={0} y1={h * 0.333} x2={w} y2={h * 0.333} />
            <line x1={0} y1={h * 0.666} x2={w} y2={h * 0.666} />
            {/* Líneas verticales de tercio */}
            <line x1={w * 0.333} y1={0} x2={w * 0.333} y2={h} />
            <line x1={w * 0.666} y1={0} x2={w * 0.666} y2={h} />
          </g>
        )}

        {variante === "regla" && (() => {
          const marcas = generarMarcasRegla(20, w - 20, 20, 100);
          return (
            <g stroke={c} strokeWidth={grosor}>
              <line x1={20} y1={16} x2={w - 20} y2={16} />
              {marcas.map((m, idx) => (
                <line
                  key={idx}
                  x1={m.posicion}
                  y1={16}
                  x2={m.posicion}
                  y2={m.esMayor ? 28 : 22}
                />
              ))}
            </g>
          );
        })()}

        {variante === "perimetro-abierto" && (
          <g stroke={c} strokeWidth={grosor} fill="none">
            {/* Corchete izquierdo [ */}
            <path d={`M 30 20 L 10 20 L 10 ${h - 20} L 30 ${h - 20}`} />
            {/* Corchete derecho ] */}
            <path d={`M ${w - 30} 20 L ${w - 10} 20 L ${w - 10} ${h - 20} L ${w - 30} ${h - 20}`} />
          </g>
        )}

        {variante === "completo" && (
          <rect
            x={4}
            y={4}
            width={w - 8}
            height={h - 8}
            stroke={c}
            strokeWidth={grosor}
            fill="none"
          />
        )}
      </svg>
      {children}
    </div>
  );
};

// ============================================================================
// 7. CAPA DE PROFUNDIDAD (CapaProfundidad)
// ============================================================================

export interface CapaProfundidadProps {
  /** Factor de profundidad espacial objetivo (1.0 = plano focal UI, 0.7 = assets, 0.3 = fondo). */
  profundidad?: number;
  /**
   * Factor de profundidad del plano contenedor padre.
   * - Si el elemento está dentro de la Capa 3 (UI) de CapasCine, la profundidad padre es 1.0.
   * - Si está dentro de un contenedor neutro sin cámara previa, la profundidad padre es 0.0 (por defecto).
   * CapaProfundidad calcula la traslación diferencial (profundidad - profundidadPadre)
   * para evitar duplicar el desplazamiento ya aplicado por el contenedor superior.
   */
  profundidadPadre?: number;
  /**
   * Desplazamiento de profundidad relativo directo (offset diferencial).
   * Si se define, tiene precedencia y se aplica directamente sobre el plano actual (ej: +0.15 o -0.15).
   */
  profundidadRelativa?: number;
  /** Configuración de cámara explícita (requerida para calcular transformaciones espaciales). */
  camara?: CamaraConfig;
  dur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const CapaProfundidad: React.FC<CapaProfundidadProps> = ({
  profundidad = 1.0,
  profundidadPadre = 0.0,
  profundidadRelativa,
  camara,
  dur = 90,
  style,
  children,
}) => {
  const frame = useCurrentFrame();

  if (camara && camara.activa !== false) {
    const factorDiferencial =
      profundidadRelativa !== undefined
        ? profundidadRelativa
        : profundidad - profundidadPadre;

    // Si el factor diferencial es 0, no hay desplazamiento respecto al contenedor padre
    if (Math.abs(factorDiferencial) < 1e-4) {
      return <div style={style}>{children}</div>;
    }

    const camNorm = normalizarCamara(camara, dur);
    const t = calcularTransformacionCamara(frame, camNorm, factorDiferencial);

    // H-03: Composición correcta de transformaciones CSS sin pérdida.
    // La transformación de cámara se ubica primero (espacio de escena) y la del consumidor después (espacio local).
    const combinedTransform = [t.transform, style?.transform].filter(Boolean).join(" ");
    const { transform: _discard, ...restStyle } = style ?? {};

    return (
      <div
        style={{
          ...restStyle,
          transform: combinedTransform || undefined,
          transformOrigin: t.transformOrigin ?? style?.transformOrigin,
        }}
      >
        {children}
      </div>
    );
  }

  return <div style={style}>{children}</div>;
};

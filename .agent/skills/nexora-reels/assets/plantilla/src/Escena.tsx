import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CapasCine, type BgMeshConfig, type ColorGradeConfig, type PostProcessConfig } from "./CapasCine";

/**
 * Tipos de transición de entrada disponibles para la escena.
 */
export type TipoTransicionEntrada =
  | "corte"
  | "suave"
  | "deslizar-arriba"
  | "deslizar-abajo"
  | "disolver";

/**
 * Tipos de transición de salida disponibles para la escena.
 */
export type TipoTransicionSalida =
  | "corte"
  | "suave"
  | "disolver";

/**
 * Configuración detallada para una transición de escena.
 */
export interface TransicionConfig<T = TipoTransicionEntrada> {
  /** Tipo de transición. */
  tipo?: T;
  /** Duración de la transición en fotogramas (por defecto 10 fotogramas). */
  duracion?: number;
  /** Curva de aceleración (opcional, por defecto Easing.out(Easing.cubic)). */
  easing?: (t: number) => number;
}

/**
 * Propiedades del componente maestro de Escena.
 * Ofrece una abstracción limpia sobre el 5-Layer Composite Stack (CapasCine)
 * con soporte para transiciones de cámara y modulación de entrada/salida.
 */
export interface EscenaProps {
  /** Duración total de la escena en fotogramas. Si se omite, se deduce del contexto de Remotion. */
  dur?: number;
  /** Transición de entrada (nombre del modo o configuración completa). Por defecto 'corte'. */
  entrada?: TipoTransicionEntrada | TransicionConfig<TipoTransicionEntrada>;
  /** Transición de salida opcional (nombre del modo o configuración completa). Por defecto 'corte'. */
  salida?: TipoTransicionSalida | TransicionConfig<TipoTransicionSalida>;
  /**
   * Factor de empuje o zoom lento continuo de cámara (0 a 0.05).
   * Por defecto 0 (sin movimiento forzado, respetando la política de animación deliberada).
   */
  empuje?: number;
  /** Fondo visual personalizado (sustituye el BgMesh de CapasCine). */
  fondo?: React.ReactNode;
  /** Parámetros de personalización para el BgMesh procedural por defecto. */
  bgMeshConfig?: BgMeshConfig;
  /** Capa 2: Gráficos de soporte, mockups, diagramas e ilustraciones. */
  assets?: React.ReactNode;
  /** Capa 3: Elementos de UI, tarjetas, titulares y subtítulos. */
  ui?: React.ReactNode;
  /** Contenido principal de la escena (se renderiza dentro de la Capa 3 de UI). */
  children?: React.ReactNode;
  /** Capa 4: Tratamiento de etalonaje cromático (ColorGrade). */
  colorGrade?: ColorGradeConfig;
  /** Capa 5: Efectos ópticos de post-procesado (Viñeta y Grano). */
  postProcess?: PostProcessConfig;
  /** Estilos adicionales para el contenedor raíz de la escena. */
  style?: React.CSSProperties;
}

/**
 * Resuelve la configuración de transición normalizando strings o configuraciones parciales.
 */
function normalizarTransicion<T extends string>(
  transicion?: T | TransicionConfig<T>,
  defectoTipo: T = "corte" as T
): { tipo: T; duracion: number; easing: (t: number) => number } {
  if (!transicion) {
    return { tipo: defectoTipo, duracion: 10, easing: Easing.out(Easing.cubic) };
  }
  if (typeof transicion === "string") {
    return { tipo: transicion, duracion: 10, easing: Easing.out(Easing.cubic) };
  }
  return {
    tipo: transicion.tipo ?? defectoTipo,
    duracion: Math.max(1, transicion.duracion ?? 10),
    easing: transicion.easing ?? Easing.out(Easing.cubic),
  };
}

/**
 * Componente Escena: Abstracción reutilizable para secuencias de video vertical en Remotion.
 * Orquesta la composición de capas y las transiciones deterministas sin imponer animaciones obligatorias.
 */
export const Escena: React.FC<EscenaProps> = ({
  dur,
  entrada = "corte",
  salida = "corte",
  empuje = 0,
  fondo,
  bgMeshConfig,
  assets,
  ui,
  children,
  colorGrade,
  postProcess,
  style,
}) => {
  const frame = useCurrentFrame();
  let duracionEscena = dur;

  try {
    const videoConfig = useVideoConfig();
    if (!duracionEscena && videoConfig && typeof videoConfig.durationInFrames === "number") {
      duracionEscena = videoConfig.durationInFrames;
    }
  } catch {
    // Si se renderiza fuera de una Composición (ej. pruebas aisladas), se asigna duración de resguardo
    duracionEscena = duracionEscena ?? 90;
  }

  const durTotal = Math.max(1, duracionEscena ?? 90);
  const progresoEscena = Math.min(1, Math.max(0, frame / durTotal));

  // Normalización de transiciones
  const cfgEntrada = normalizarTransicion(entrada, "corte");
  const cfgSalida = normalizarTransicion(salida, "corte");

  // Parámetros de composición
  let opacidad = 1;
  let escala = 1 + empuje * progresoEscena;
  let translateY = 0;
  let blur = 0;

  // 1. Cálculo de Transición de Entrada
  if (cfgEntrada.tipo !== "corte" && frame < cfgEntrada.duracion) {
    const t = cfgEntrada.easing(Math.min(1, Math.max(0, frame / cfgEntrada.duracion)));

    switch (cfgEntrada.tipo) {
      case "suave":
        opacidad *= t;
        blur += (1 - t) * 12;
        escala *= 1.04 - 0.04 * t;
        break;
      case "disolver":
        opacidad *= t;
        break;
      case "deslizar-arriba":
        opacidad *= t;
        translateY += (1 - t) * 60;
        break;
      case "deslizar-abajo":
        opacidad *= t;
        translateY -= (1 - t) * 60;
        break;
    }
  }

  // 2. Cálculo de Transición de Salida
  const frameSalida = durTotal - cfgSalida.duracion;
  if (cfgSalida.tipo !== "corte" && frame > frameSalida) {
    const factorSalida = Math.min(1, Math.max(0, (frame - frameSalida) / cfgSalida.duracion));
    const t = cfgSalida.easing(factorSalida);

    switch (cfgSalida.tipo) {
      case "suave":
        opacidad *= 1 - t;
        blur += t * 10;
        escala *= 1 - 0.02 * t;
        break;
      case "disolver":
        opacidad *= 1 - t;
        break;
    }
  }

  // Generación de estilos de contenedor
  const transformParts: string[] = [];
  if (Math.abs(escala - 1) > 1e-4) {
    transformParts.push(`scale(${escala})`);
  }
  if (Math.abs(translateY) > 1e-2) {
    transformParts.push(`translateY(${translateY}px)`);
  }

  const contenedorEstilo: React.CSSProperties = {
    opacity: opacidad,
    filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
    transform: transformParts.length > 0 ? transformParts.join(" ") : undefined,
    transformOrigin: "50% 40%",
    ...style,
  };

  return (
    <AbsoluteFill style={contenedorEstilo}>
      <CapasCine
        bgMesh={fondo}
        bgMeshConfig={bgMeshConfig}
        assets={assets}
        ui={ui}
        colorGrade={colorGrade}
        postProcess={postProcess}
      >
        {children}
      </CapasCine>
    </AbsoluteFill>
  );
};

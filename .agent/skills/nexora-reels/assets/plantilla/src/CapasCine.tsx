import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { THEME } from "./motor/theme";

/**
 * Configuración de la Capa 1: Fondo y malla visual (BgMesh).
 */
export interface BgMeshConfig {
  /** Activar movimiento oscilatorio suave del fondo. Por defecto false (estático). */
  animado?: boolean;
  /** Color base de fondo profundo (por defecto THEME.colores.fondo). */
  colorBase?: string;
  /** Color de la primera mancha de luz difusa (por defecto THEME.colores.fondoMalla1). */
  mancha1?: string;
  /** Color de la segunda mancha de luz difusa (por defecto THEME.colores.fondoMalla2). */
  mancha2?: string;
  /** Opacidad global de la malla difusa (0 a 1, por defecto 0.8). */
  opacidad?: number;
}

/**
 * Configuración de la Capa 4: Etalonaje y tratamiento cromático (ColorGrade).
 */
export interface ColorGradeConfig {
  /** Activar el filtro de etalonaje. Por defecto false. */
  activo?: boolean;
  /** Color cromático de gradación (ej. ámbar cálido, cian frío). Por defecto THEME.colores.acento. */
  color?: string;
  /** Modo de fusión CSS (por defecto 'soft-light'). */
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** Opacidad del etalonaje (0 a 1, por defecto 0.12). */
  opacidad?: number;
}

/**
 * Configuración de la Capa 5: Efectos ópticos de post-procesado (PostProcess).
 */
export interface PostProcessConfig {
  /** Configuración de viñeta perimetral. */
  vignette?: {
    /** Activar viñeta de oscurecimiento periférico. Por defecto false. */
    activa?: boolean;
    /** Opacidad en los bordes extremos (por defecto 0.45). */
    opacidad?: number;
    /** Punto de inicio de la penumbra (porcentaje 0 a 100, por defecto 55%). */
    radioInicio?: number;
  };
  /** Configuración de grano cinematográfico analógico. */
  grano?: {
    /** Activar grano. Por defecto false. */
    activo?: boolean;
    /** Opacidad del grano (por defecto 0.05). */
    opacidad?: number;
    /**
     * Método técnico de generación de ruido:
     * - 'svg-patron': Patrón SVG de micro-puntos procedimentales (ligero, determinista, 0 coste de GPU).
     * - 'svg-turbulence': Filtro feTurbulence (efecto analógico continuo; RENDIMIENTO NO MEDIDO, usar con cautela).
     * Por defecto 'svg-patron'.
     */
    metodo?: "svg-patron" | "svg-turbulence";
  };
}

/**
 * Propiedades del componente CapasCine.
 * Implementa la arquitectura visual de 5 capas:
 * 1. BgMesh (Fondo)
 * 2. Assets (Ilustraciones y mockups)
 * 3. UI (Tipografía, subtítulos y tarjetas)
 * 4. ColorGrade (Tratamiento cromático)
 * 5. PostProcess (Viñeta y grano óptico)
 */
export interface CapasCineProps {
  /** Capa 1 personalizada: componente de fondo libre. Si no se provee, se utiliza el BgMesh por defecto. */
  bgMesh?: React.ReactNode;
  /** Parámetros de personalización para el BgMesh por defecto. */
  bgMeshConfig?: BgMeshConfig;
  /** Capa 2: Gráficos de soporte, ilustraciones, mockups y metraje secundario. */
  assets?: React.ReactNode;
  /** Capa 3: Elementos de interfaz, titulares, tarjetas interactivas y subtítulos. */
  ui?: React.ReactNode;
  /** Contenido principal. Si se provee, se monta dentro de la Capa 3 (UI). */
  children?: React.ReactNode;
  /** Capa 4: Configuración de gradación cromática (opcional). */
  colorGrade?: ColorGradeConfig;
  /** Capa 5: Configuración de grano y viñeta (opcional). */
  postProcess?: PostProcessConfig;
  /** Estilos adicionales para el contenedor principal AbsoluteFill. */
  style?: React.CSSProperties;
}

/**
 * Fondo con malla de gradientes radiales difusos (BgMesh).
 * Renderizado determinista y ligero mediante CSS puro sin dependencias externas.
 */
export const BgMesh: React.FC<{ config?: BgMeshConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const animado = config?.animado ?? false;
  const base = config?.colorBase ?? THEME.colores.fondo;
  const c1 = config?.mancha1 ?? THEME.colores.fondoMalla1;
  const c2 = config?.mancha2 ?? THEME.colores.fondoMalla2;
  const opacidad = config?.opacidad ?? 0.8;

  // Si está animado, genera un desplazamiento senoidal suave y determinista a 30 FPS
  const dx1 = animado ? 40 * Math.sin(frame / 90) : 0;
  const dy1 = animado ? 50 * Math.cos(frame / 110) : 0;
  const dx2 = animado ? 50 * Math.cos(frame / 100) : 0;
  const dy2 = animado ? 40 * Math.sin(frame / 80) : 0;

  const gradienteManchas = [
    `radial-gradient(circle 850px at ${800 + dx1}px ${1450 + dy1}px, ${c1} 0%, transparent 70%)`,
    `radial-gradient(circle 750px at ${280 + dx2}px ${480 + dy2}px, ${c2} 0%, transparent 70%)`,
  ].join(", ");

  return (
    <AbsoluteFill
      style={{
        backgroundColor: base,
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: gradienteManchas,
          opacity: opacidad,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Capa de viñeta perimetral elíptica.
 * Proporciona profundidad visual y enfoca la atención en la zona central provisional (y: 80–1040 px).
 */
export const Vignette: React.FC<{
  activa?: boolean;
  opacidad?: number;
  radioInicio?: number;
}> = ({ activa = false, opacidad = 0.45, radioInicio = 55 }) => {
  if (!activa || opacidad <= 0) return null;

  return (
    <AbsoluteFill
      style={{
        zIndex: 41,
        pointerEvents: "none",
        background: `radial-gradient(ellipse 65% 55% at 50% 48%, transparent ${radioInicio}%, rgba(0, 0, 0, ${opacidad}) 100%)`,
      }}
    />
  );
};

/**
 * Capa de grano cinematográfico procedural.
 * No requiere texturas externas descargadas de disco ni peticiones HTTP.
 */
export const FilmGrain: React.FC<{
  activo?: boolean;
  opacidad?: number;
  metodo?: "svg-patron" | "svg-turbulence";
}> = ({ activo = false, opacidad = 0.05, metodo = "svg-patron" }) => {
  if (!activo || opacidad <= 0) return null;

  if (metodo === "svg-turbulence") {
    // Implementación SVG con feTurbulence.
    // ADVERTENCIA TÉCNICA: El coste de renderizado por fotograma no ha sido medido en benchmark real.
    return (
      <AbsoluteFill
        style={{
          zIndex: 42,
          pointerEvents: "none",
          opacity: opacidad,
          mixBlendMode: "overlay",
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="nexora-film-grain-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#nexora-film-grain-filter)" />
        </svg>
      </AbsoluteFill>
    );
  }

  // Método por defecto: Patrón SVG de micro-puntos distribuido (0 coste de GPU, determinismo absoluto)
  return (
    <AbsoluteFill
      style={{
        zIndex: 42,
        pointerEvents: "none",
        opacity: opacidad,
        mixBlendMode: "overlay",
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="nexora-dot-noise"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="0.6" fill="#ffffff" opacity="0.4" />
            <circle cx="6" cy="3" r="0.8" fill="#000000" opacity="0.5" />
            <circle cx="4" cy="7" r="0.7" fill="#ffffff" opacity="0.3" />
            <circle cx="7" cy="6" r="0.5" fill="#000000" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nexora-dot-noise)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Componente principal CapasCine.
 * Orquesta la composición multicapa de Remotion con control de apilamiento y no-intrusión.
 */
export const CapasCine: React.FC<CapasCineProps> = ({
  bgMesh,
  bgMeshConfig,
  assets,
  ui,
  children,
  colorGrade,
  postProcess,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        ...style,
      }}
    >
      {/* CAPA 1: Fondo visual y malla de iluminación difusa */}
      {bgMesh ? (
        <AbsoluteFill style={{ zIndex: 0 }}>{bgMesh}</AbsoluteFill>
      ) : (
        <BgMesh config={bgMeshConfig} />
      )}

      {/* CAPA 2: Recursos visuales, ilustraciones, mockups y elementos de apoyo */}
      {assets && (
        <AbsoluteFill
          style={{
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {assets}
        </AbsoluteFill>
      )}

      {/* CAPA 3: UI, Tipografía, Subtítulos y Jerarquía Principal */}
      {(ui || children) && (
        <AbsoluteFill
          style={{
            zIndex: 20,
          }}
        >
          {ui}
          {children}
        </AbsoluteFill>
      )}

      {/* CAPA 4: Etalonaje y tratamiento cromático (ColorGrade) */}
      {colorGrade?.activo && (
        <AbsoluteFill
          style={{
            zIndex: 30,
            pointerEvents: "none",
            backgroundColor: colorGrade.color ?? THEME.colores.acento,
            opacity: colorGrade.opacidad ?? 0.12,
            mixBlendMode: colorGrade.blendMode ?? "soft-light",
          }}
        />
      )}

      {/* CAPA 5: Post-procesado óptico (Viñeta y Grano) */}
      <Vignette
        activa={postProcess?.vignette?.activa}
        opacidad={postProcess?.vignette?.opacidad}
        radioInicio={postProcess?.vignette?.radioInicio}
      />
      <FilmGrain
        activo={postProcess?.grano?.activo}
        opacidad={postProcess?.grano?.opacidad}
        metodo={postProcess?.grano?.metodo}
      />
    </AbsoluteFill>
  );
};

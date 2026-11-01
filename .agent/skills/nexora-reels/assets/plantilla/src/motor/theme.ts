import type { SpringConfig } from "remotion";

/**
 * Sistema centralizado de tokens de diseño para Nexora Motion Reels.
 * Proporciona constantes de color, físicas de resorte, curvas de aceleración
 * y métricas de maquetación para garantizar coherencia estética en todas las escenas.
 */
export const THEME = {
  // Paletas cromáticas estructuradas (60-30-10)
  colores: {
    // 60% - Fondos y atmósfera
    fondo: "#090a0f",
    fondoElevado: "#11141d",
    fondoMalla1: "#141829",
    fondoMalla2: "#1d122b",

    // 30% - Estructuras, superficies y tarjetas
    superficie: "#161b26",
    superficieBorde: "#262f40",
    tarjeta: "#1a202c",
    tarjetaBorde: "#2d3748",

    // 10% - Acentos focales de alto contraste
    acento: "#f59e0b", // Ámbar principal
    acentoTexto: "#000000",
    acentoCian: "#06b6d4", // Datos / Agua / Frío
    acentoRojo: "#ef4444", // Alerta / Calor / Error
    acentoVerde: "#10b981", // Éxito / Confirmación
    acentoPurpura: "#a855f7", // Creatividad / Especial

    // Jerarquía tipográfica de color
    textoPrimario: "#ffffff",
    textoSecundario: "#94a3b8",
    textoMuted: "#64748b",
    textoInverso: "#090a0f",
  },

  // Físicas de resorte calibradas para diferentes intenciones visuales
  // Cumplen con la interfaz SpringConfig completa de Remotion
  springs: {
    /** Entradas ágiles y secas: para botones, chips, badges y micro-interacciones */
    snappy: {
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      overshootClamping: false,
    } as SpringConfig,

    /** Entradas elásticas y amigables: para tarjetas principales, titulares y pop-ins */
    bouncy: {
      damping: 12,
      stiffness: 180,
      mass: 0.6,
      overshootClamping: false,
    } as SpringConfig,

    /** Entradas con inercia pesada: para fondos, ventanas completas y contenedores grandes */
    heavy: {
      damping: 24,
      stiffness: 140,
      mass: 1.4,
      overshootClamping: false,
    } as SpringConfig,

    /** Movimientos suaves sin rebote: para transiciones de posición progresivas */
    gentle: {
      damping: 20,
      stiffness: 120,
      mass: 1.0,
      overshootClamping: false,
    } as SpringConfig,
  },

  // Curvas de aceleración Bézier cúbicas normalizadas
  curvas: {
    /** Frenada brusca con inercia: ideal para revelado de texto y desplazamientos rápidos */
    decel: [0.16, 1, 0.3, 1] as const,
    /** Aceleración gradual: apropiada para salidas de escena */
    accel: [0.7, 0, 0.84, 0] as const,
    /** Transición suave estándar tipo cubic-bezier(0.2, 0, 0, 1) */
    standard: [0.2, 0, 0, 1] as const,
  },

  // Parámetros de composición y márgenes de seguridad provisionales en formato 9:16 (1080x1920)
  // Requieren validación visual en cada proyecto según plataforma y densidad de contenido
  maquetacion: {
    ancho: 1080,
    alto: 1920,
    fps: 30,
    zonaSeguraProvisional: {
      x: 60,
      y: 80,
      w: 960,
      h: 960, // referencia visual aproximada: y = 80 a 1040 px
    },
    subtitulosY: 1330,
    mascaraPaddingVertical: 6, // px de holgura mínima sugerida para tildes y descendentes en español
  },
} as const;

export type Theme = typeof THEME;

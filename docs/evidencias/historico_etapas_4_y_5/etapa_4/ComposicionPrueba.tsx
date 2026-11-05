import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Escena } from "../assets/plantilla/src/Escena";
import { TextoRevelado } from "../assets/plantilla/src/TextoRevelado";
import { THEME } from "../assets/plantilla/src/motor/theme";
import { useMultiSpring, useBreathing } from "../assets/plantilla/src/motor/anim";

/**
 * Escena 1: Comprueba fondo difuso, transición de entrada suave,
 * tipografía cinética en español con signos de apertura y tildes,
 * sección estática y salida suave.
 */
const Escena1Contenido: React.FC = () => {
  return (
    <Escena
      dur={75}
      entrada="suave"
      salida="suave"
      bgMeshConfig={{ animado: false, colorBase: THEME.colores.fondo }}
      colorGrade={{ activo: true, color: THEME.colores.acento, opacidad: 0.12 }}
      postProcess={{ vignette: { activa: true, opacidad: 0.35 } }}
    >
      <div
        style={{
          padding: "140px 60px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Sección estática: texto fijo que verifica ausencia de transforms innecesarios */}
        <span
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: THEME.colores.acento,
            letterSpacing: 4,
            marginBottom: 30,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          Team Nexora • Motion Graphics
        </span>

        {/* Texto cinético revelado progresivamente con caracteres españoles complejos */}
        <TextoRevelado
          as="h1"
          texto="¿Cómo funciona el núcleo de energía en España?"
          modo="palabra"
          desde={10}
          intervalo={3}
          duracionUnidad={8}
          style={{
            fontSize: 60,
            fontWeight: 900,
            color: THEME.colores.textoPrimario,
            textAlign: "center",
            lineHeight: 1.25,
            maxWidth: 920,
            fontFamily: "sans-serif",
          }}
        />

        <div
          style={{
            marginTop: 50,
            padding: "16px 36px",
            borderRadius: 12,
            backgroundColor: THEME.colores.superficie,
            border: `1px solid ${THEME.colores.superficieBorde}`,
          }}
        >
          <span style={{ fontSize: 24, color: THEME.colores.textoSecundario, fontFamily: "sans-serif" }}>
            Validación de Integración — Etapa 4
          </span>
        </div>
      </div>
    </Escena>
  );
};

/**
 * Escena 2: Comprueba transición deslizar-arriba, físicas de resortes
 * animadas mediante useMultiSpring, oscilación determinista con useBreathing
 * y texto de confirmación con ¡, % y tildes.
 */
const Escena2Contenido: React.FC = () => {
  // Animación física del card mediante useMultiSpring
  const { cardEscala, cardOpacidad, cardY } = useMultiSpring({
    cardEscala: { desde: 5, config: "bouncy", from: 0.75, to: 1.0 },
    cardOpacidad: { desde: 5, config: "snappy", from: 0, to: 1.0 },
    cardY: { desde: 5, config: "gentle", from: 90, to: 0 },
  });

  // Animación senoidal determinista sutil con useBreathing
  const badgeBreathing = useBreathing({ amplitud: 0.04, periodo: 60, centro: 1.0 });

  return (
    <Escena
      dur={75}
      entrada="deslizar-arriba"
      salida="corte"
      bgMeshConfig={{
        animado: false,
        colorBase: "#0b0d14",
        mancha1: "#1e1b4b",
        mancha2: "#172554",
      }}
    >
      <div
        style={{
          padding: "140px 60px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Tarjeta de métricas animada con físicas spring */}
        <div
          style={{
            transform: `translateY(${cardY}px) scale(${cardEscala})`,
            opacity: cardOpacidad,
            backgroundColor: THEME.colores.tarjeta,
            border: `2px solid ${THEME.colores.tarjetaBorde}`,
            borderRadius: 28,
            padding: "50px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            maxWidth: 900,
            width: "100%",
          }}
        >
          {/* Badge con respiración senoidal sutil */}
          <div
            style={{
              transform: `scale(${badgeBreathing})`,
              backgroundColor: THEME.colores.acento,
              color: THEME.colores.acentoTexto,
              fontSize: 22,
              fontWeight: 800,
              padding: "12px 28px",
              borderRadius: 30,
              marginBottom: 30,
              letterSpacing: 2,
              fontFamily: "sans-serif",
            }}
          >
            ¡VALIDACIÓN EN REMOTION!
          </div>

          <TextoRevelado
            as="h2"
            texto="¡100% de eficacia y precisión técnica!"
            modo="palabra"
            desde={15}
            intervalo={4}
            duracionUnidad={8}
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: THEME.colores.textoPrimario,
              textAlign: "center",
              marginBottom: 20,
              fontFamily: "sans-serif",
            }}
          />

          <p
            style={{
              fontSize: 26,
              color: THEME.colores.textoSecundario,
              textAlign: "center",
              margin: 0,
              fontFamily: "sans-serif",
            }}
          >
            Render local real • Chromium + FFmpeg
          </p>
        </div>
      </div>
    </Escena>
  );
};

/**
 * Composición global de prueba para la Etapa 4.
 * Duración: 150 fotogramas (5,0 s a 30 FPS).
 * Formato vertical: 1080 × 1920 píxeles.
 */
export const ComposicionPrueba: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Sequence from={0} durationInFrames={75} name="Escena 1 - Introducción">
        <Escena1Contenido />
      </Sequence>
      <Sequence from={75} durationInFrames={75} name="Escena 2 - Métricas y Físicas">
        <Escena2Contenido />
      </Sequence>
    </AbsoluteFill>
  );
};

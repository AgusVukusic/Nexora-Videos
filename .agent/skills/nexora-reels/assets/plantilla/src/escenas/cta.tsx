// Escena "cta": la llamada a la acción final de alta conversión para Nexora Motion Reels.
// Renovación visual Lote 1 (Etapa 41B):
// - Bloque de conversión editorial limpio y contundente.
// - Palabra clave monumental en cápsula táctil iluminada con revelado cinético letra por letra.
// - Tipografía editorial estructurada para el texto secundario (sin manuscrita desordenada).
// - Módulos de iconos de respuesta directa con micro-interacciones estables (sin saltos en bucle ni sobres de caricatura).
// - Safe area estricta: y in [260, 1020] px, x in [80, 1000] px.
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import { BORDE, C, SOMBRA } from "../motor/actual";
import { FPS } from "../motor/constantes";
import { F, alfa } from "../motor/estilos";
import { bump, lerp, usePop } from "../motor/anim";
import { Icono } from "../piezas/basicas";
import { generarEsquinasReticula } from "../motor/trazos";
import type { DefEscena, PropsEscena } from "../tipos";
import { arr, iconos, reglas, txt } from "./util";

const Cta: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const [bPalabra, bTexto, bIconos] = b;
  const palabra = txt(p, "palabra", "INFO").toUpperCase();
  const verbo = txt(p, "verbo", "Comenta");
  const lineas = txt(p, "texto")
    .split("/")
    .map((l) => l.trim())
    .filter(Boolean);
  const icos = (arr<string>(p, "iconos").length ? arr<string>(p, "iconos") : ["message-circle", "send", "gift", "list-checks", "check"]).slice(0, 5);

  const entra = spring({ frame: f, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.8 } });
  const tam = palabra.length <= 6 ? 90 : palabra.length <= 9 ? 72 : 56;

  // Barrido de luz cinético sutil a través de la cápsula
  const ciclo = (f - bPalabra - 12) % 24;
  const barrido = f > bPalabra + 12 && ciclo < 12 ? ciclo / 12 : -1;

  const x = 100;
  const y = 290;
  const w = 880;
  const h = 420;
  const esquinas = generarEsquinasReticula(x, y + (1 - entra) * 60, w, h, 24);

  return (
    <AbsoluteFill>
      {/* Contenedor editorial de conversión */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + (1 - entra) * 60,
          width: w,
          height: h,
          borderRadius: 32,
          background: C.tarjeta,
          border: `1.5px solid ${C.linea}`,
          boxShadow: SOMBRA,
          opacity: Math.min(1, entra * 1.8),
          padding: "36px 44px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Esquinas técnicas decorativas */}
        <svg
          viewBox={`${x} ${y + (1 - entra) * 60} ${w} ${h}`}
          style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <path d={esquinas.topIzq} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
          <path d={esquinas.topDer} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
          <path d={esquinas.botIzq} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
          <path d={esquinas.botDer} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
        </svg>

        {/* Micro-kicker superior */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: C.acento }} />
          <span
            style={{
              fontFamily: F.texto,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: alfa(C.tarjetaTexto, 0.65),
            }}
          >
            LLAMADA A LA ACCIÓN
          </span>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: C.acento }} />
        </div>

        {/* Verbo de acción monumental */}
        <div
          style={{
            fontFamily: F.titulo,
            fontSize: 72,
            fontWeight: 800,
            color: C.tarjetaTexto,
            letterSpacing: "-1.5px",
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          {verbo}
        </div>

        {/* Cápsula táctil de palabra clave con destello */}
        <div
          style={{
            width: "88%",
            height: 126,
            borderRadius: 63,
            background: C.acento,
            color: C.acentoTexto,
            boxShadow: `0 16px 36px ${alfa(C.acento, 0.4)}`,
            border: `2px solid rgba(255, 255, 255, 0.25)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            transform: `scale(${1 + 0.04 * bump(f, bPalabra + 10, 10)})`,
          }}
        >
          <span style={{ fontFamily: F.titulo, fontWeight: 900, fontSize: tam, color: C.acentoTexto, marginRight: 8 }}>
            «
          </span>
          {palabra.split("").map((letra, k) => {
            const q = spring({ frame: f - bPalabra - k * 2, fps: FPS, config: { damping: 11, stiffness: 280, mass: 0.4 } });
            return (
              <span
                key={k}
                style={{
                  display: "inline-block",
                  fontFamily: F.titulo,
                  fontWeight: 900,
                  fontSize: tam,
                  color: C.acentoTexto,
                  letterSpacing: "2px",
                  transform: `translateY(${(1 - q) * -30}px) scale(${q})`,
                  opacity: f >= bPalabra + k * 2 ? 1 : 0,
                }}
              >
                {letra === " " ? " " : letra}
              </span>
            );
          })}
          <span style={{ fontFamily: F.titulo, fontWeight: 900, fontSize: tam, color: C.acentoTexto, marginLeft: 8 }}>
            »
          </span>

          {barrido >= 0 && (
            <div
              style={{
                position: "absolute",
                top: -20,
                bottom: -20,
                left: `${-30 + barrido * 140}%`,
                width: "24%",
                background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.65), rgba(255,255,255,0))",
                transform: "skewX(-20deg)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>

      {/* Texto explicativo editorial (reemplaza manuscrita curvada desordenada) */}
      {lineas.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: y + h + 32,
            left: 80,
            right: 80,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {lineas.map((l, k) => {
            const t0 = bTexto + k * 8;
            const opac = lerp(f, t0, t0 + 8, 0, 1);
            const slide = lerp(f, t0, t0 + 8, 14, 0);
            return (
              <div
                key={k}
                style={{
                  fontFamily: F.texto,
                  fontWeight: 700,
                  fontSize: 36,
                  color: C.texto,
                  lineHeight: 1.25,
                  opacity: opac,
                  transform: `translateY(${slide}px)`,
                }}
              >
                {l}
              </div>
            );
          })}
        </div>
      )}

      {/* Fila de micro-tarjetas táctiles de canales/iconos sociales */}
      <div
        style={{
          position: "absolute",
          top: y + h + 36 + Math.max(1, lineas.length) * 54 + 20,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {icos.map((nombre, k) => {
          const q = usePop(bIconos + k * 3, { damping: 11, stiffness: 220, mass: 0.5, overshootClamping: false });
          const oscuro = k % 2 === 1;
          return (
            <div
              key={k}
              style={{
                width: 92,
                height: 92,
                borderRadius: 24,
                background: oscuro ? C.oscuro : C.tarjeta,
                border: `1.5px solid ${oscuro ? alfa(C.acento, 0.4) : C.linea}`,
                boxShadow: SOMBRA,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${q})`,
                opacity: Math.min(1, q * 2),
              }}
            >
              <Icono nombre={nombre} tam={48} color={oscuro ? C.oscuroTexto : C.acento} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const cta: DefEscena = {
  C: Cta,
  momentos: 3,
  sonidos: () => [
    [0, "tecla", 0.3],
    [1, "exito", 0.3],
  ],
  validar: (p) => [
    ...reglas(p, [
      ["palabra", "texto", { max: 12 }],
      ["verbo", "texto", { opcional: true, max: 14 }],
      ["texto", "texto", { opcional: true, max: 50 }],
      ["iconos", "lista", { opcional: true, maxItems: 5 }],
    ]),
    ...iconos(arr<string>(p, "iconos")),
  ],
};

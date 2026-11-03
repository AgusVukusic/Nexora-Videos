// Escena "titular": el gancho editorial para Nexora Motion Reels.
// Renovación visual Lote 1 (Etapa 41B):
// - Composición tipográfica asimétrica de estilo suizo cinético (Kinetic Swiss).
// - Contraste tipográfico bold de alto impacto sin cursiva manuscrita obligatoria.
// - Kicker editorial estructurado (Etiqueta) con micro-indicador técnico.
// - Deck multimedia fotográfico moderno con composición limpia y sin rotación desordenada de abanico plano.
// - Safe area estricta: y in [220, 1020] px, x in [70, 1010] px.
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Img, spring, staticFile, useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { C, ESTILO, SOMBRA } from "../motor/actual";
import { FPS } from "../motor/constantes";
import { F, alfa } from "../motor/estilos";
import { useFuentes } from "../motor/fuentes";
import { lerp, usePop } from "../motor/anim";
import { Baldosa, Icono } from "../piezas/basicas";
import type { DefEscena, PropsEscena } from "../tipos";
import { arr, bool, iconos, norm, reglas, txt } from "./util";

type Tok = { w: string; enfasis: boolean; f: number };

/** Tamaño máximo del título y ancho disponible en safe area. */
const TAM_MAX = 118;
const ANCHO_MAX = 920;
/** Alto que ocupa la etiqueta kicker encima del título. */
const ALTO_ETIQUETA = 64;

/** Reparte el título en líneas y asigna a cada palabra el fotograma exacto sincronizado con la voz. */
const preparar = (texto: string, palabras: PropsEscena["palabras"], dur: number): Tok[][] => {
  let dentro = false;
  const lineas = texto
    .split("/")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) =>
      l.split(/\s+/).map((w) => {
        if (w.startsWith("*")) dentro = true;
        const t = { w: w.replace(/\*/g, ""), enfasis: dentro, f: -1 };
        if (w.replace(/[.,:;!?…]+$/, "").endsWith("*")) dentro = false;
        return t;
      })
    );
  const toks = lineas.flat();
  const dichas = palabras.map((p) => ({ n: norm(p.w), f: p.f }));
  let j = 0,
    vistos = 0,
    ultimo = 2;
  for (const t of toks) {
    const n = norm(t.w);
    let hallada = -1;
    for (let k = j; k < Math.min(dichas.length, j + 6); k++) {
      if (n && (dichas[k].n === n || dichas[k].n.startsWith(n) || n.startsWith(dichas[k].n))) {
        hallada = k;
        break;
      }
    }
    if (hallada >= 0) {
      t.f = dichas[hallada].f;
      j = hallada + 1;
      vistos++;
    } else t.f = ultimo;
    ultimo = t.f;
  }
  if (vistos === 0) {
    toks.forEach((t, k) => (t.f = Math.round(2 + (k * dur * 0.6) / Math.max(1, toks.length))));
  }
  return lineas;
};

/** Renderizado cinético de cada palabra con contraste tipográfico suizo. */
const PalabraTitulo: React.FC<{ t: Tok; tam: number; ultima: boolean }> = ({ t, tam, ultima }) => {
  const f = useCurrentFrame();
  if (f < t.f) return null;

  // Enfoque suizo cinético: tipografía contundente, contraste bold + acento sin mano alzada obligatoria
  const peso = t.enfasis ? "900" : String(ESTILO.fuentes.titulo.peso ?? "800");
  const color = t.enfasis ? C.acento : C.texto;
  const letterSpacing = t.enfasis ? -tam * 0.025 : -tam * 0.03;

  const ancho = measureText({
    text: t.w,
    fontFamily: F.titulo,
    fontWeight: peso,
    fontSize: tam,
    letterSpacing: `${letterSpacing}px`,
    validateFontIsLoaded: false,
  }).width;

  const hueco = ancho + (ultima ? 0 : 0.24 * tam);

  // Animación cinética suave con desenfoque de desempañado y rebote de resorte para énfasis
  const progreso = lerp(f, t.f, t.f + 5, 0, 1, Easing.out(Easing.cubic));
  const escalaPop = t.enfasis
    ? spring({ frame: f - t.f, fps: FPS, config: { damping: 11, stiffness: 240, mass: 0.5 } })
    : 1;

  return (
    <span style={{ display: "inline-block", width: hueco * Math.min(1, progreso * 1.08), whiteSpace: "nowrap", textAlign: "left" }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: F.titulo,
          fontWeight: peso,
          fontSize: tam,
          letterSpacing,
          color,
          lineHeight: 1.06,
          opacity: Math.min(1, progreso * 1.5),
          transform: `translateY(${(1 - progreso) * 18}px) scale(${0.96 + 0.04 * escalaPop})`,
          filter: progreso < 1 ? `blur(${(1 - progreso) * 4}px)` : undefined,
          transformOrigin: "bottom left",
        }}
      >
        {t.w}
      </span>
    </span>
  );
};

/** Kicker / Etiqueta editorial con indicador técnico */
const EtiquetaEditorial: React.FC<{ texto: string; primera: number; grande: boolean; top: number }> = ({
  texto,
  primera,
  grande,
  top,
}) => {
  const f = useCurrentFrame();
  const opacidad = lerp(f, Math.max(0, primera - 6), primera + 4, 0, 1, Easing.out(Easing.quad));
  const slideY = lerp(f, Math.max(0, primera - 6), primera + 5, 12, 0, Easing.out(Easing.cubic));

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: opacidad,
        transform: `translateY(${slideY}px)`,
      }}
    >
      <div
        style={{
          width: grande ? 9 : 8,
          height: grande ? 9 : 8,
          borderRadius: 2,
          background: C.acento,
          boxShadow: `0 0 10px ${C.acento}`,
        }}
      />
      <span
        style={{
          fontFamily: F.texto,
          fontWeight: 800,
          fontSize: grande ? 26 : 22,
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: C.acento,
          whiteSpace: "nowrap",
        }}
      >
        {texto}
      </span>
      <div style={{ flex: 1, height: 1, background: alfa(C.linea, 0.6), marginLeft: 8 }} />
    </div>
  );
};

/** Galería multimedia fotográfica moderna y equilibrada (sin deformación de abanico de cartas). */
const DeckFotografico: React.FC<{ imagenes: string[]; desde: number; arriba: number }> = ({
  imagenes,
  desde,
  arriba,
}) => {
  const f = useCurrentFrame();
  const n = imagenes.length;

  if (n === 1) {
    const w = 720;
    const h = 340;
    const p = spring({ frame: f - desde, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.8 } });
    if (f < desde) return null;
    return (
      <div
        style={{
          position: "absolute",
          left: 540 - w / 2,
          top: arriba + 36,
          width: w,
          height: h,
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${C.linea}`,
          boxShadow: SOMBRA,
          transform: `scale(${0.92 + 0.08 * p}) translateY(${(1 - p) * 24}px)`,
          opacity: Math.min(1, p * 2),
        }}
      >
        <Img src={staticFile(imagenes[0])} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  if (n === 2) {
    const w = 440;
    const h = 280;
    return (
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: arriba + 36,
          display: "flex",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {imagenes.map((src, k) => {
          const d = desde + k * 4;
          const p = spring({ frame: f - d, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.8 } });
          if (f < d) return null;
          return (
            <div
              key={k}
              style={{
                width: w,
                height: h,
                borderRadius: 18,
                overflow: "hidden",
                border: `1px solid ${C.linea}`,
                boxShadow: SOMBRA,
                transform: `scale(${0.92 + 0.08 * p}) translateY(${(1 - p) * 20}px)`,
                opacity: Math.min(1, p * 2),
              }}
            >
              <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          );
        })}
      </div>
    );
  }

  // 3 o 4 imágenes: composición en deck moderno escalonado
  const w = n === 3 ? 360 : 320;
  const h = 250;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: arriba + 32,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: n === 3 ? 24 : 16,
      }}
    >
      {imagenes.map((src, k) => {
        const d = desde + k * 3;
        const p = spring({ frame: f - d, fps: FPS, config: { damping: 13, stiffness: 150, mass: 0.7 } });
        if (f < d) return null;
        return (
          <div
            key={k}
            style={{
              width: w,
              height: h,
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${C.linea}`,
              boxShadow: SOMBRA,
              transform: `scale(${0.9 + 0.1 * p}) translateY(${(1 - p) * 18}px)`,
              opacity: Math.min(1, p * 2),
            }}
          >
            <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
    </div>
  );
};

const Titular: React.FC<PropsEscena> = ({ p, b, dur, palabras }) => {
  const ok = useFuentes();
  const texto = txt(p, "texto");
  const etiqueta = txt(p, "etiqueta");
  const imagenes = arr<string>(p, "imagenes").slice(0, 4);
  const icono = txt(p, "icono");
  const lineas = useMemo(() => preparar(texto, palabras, dur), [texto, palabras, dur]);
  const ic = usePop(b[0] ?? 0);

  if (!ok) return null;

  // Medición matemática de texto para cálculo determinista de safe areas
  const anchoLinea = (l: Tok[], s: number) =>
    l.reduce(
      (a, t, k) =>
        a +
        measureText({
          text: t.w,
          fontFamily: F.titulo,
          fontWeight: t.enfasis ? "900" : String(ESTILO.fuentes.titulo.peso ?? "800"),
          fontSize: s,
          letterSpacing: t.enfasis ? `${-s * 0.025}px` : `${-s * 0.03}px`,
          validateFontIsLoaded: false,
        }).width +
        (k < l.length - 1 ? 0.24 * s : 0),
      0
    );

  const ancho100 = Math.max(1, ...lineas.map((l) => anchoLinea(l, 100)));
  const conMedia = imagenes.length > 0 || !!icono;
  const altoMaxTitulo = conMedia ? 420 : 620;

  const factores = lineas.map(() => 1.18);
  const sumaFactores = factores.reduce((a, x) => a + x, 0) || 1;
  const tam = Math.max(46, Math.min(TAM_MAX * ESTILO.escalaTitulo, (100 * ANCHO_MAX) / ancho100, altoMaxTitulo / sumaFactores));
  const altos = factores.map((x) => x * tam);
  const altoTitulo = altos.reduce((a, x) => a + x, 0);

  // Espacio multimedia estructurado
  const altoMedia = imagenes.length === 1 ? 380 : imagenes.length >= 2 ? 310 : icono ? 220 : 0;
  const altoBloque = (etiqueta ? ALTO_ETIQUETA : 0) + altoTitulo + (conMedia ? altoMedia + 24 : 0);

  // Centrado vertical dentro de la safe area [220, 1020] px
  const yMin = 230;
  const yCentro = 610 - altoBloque / 2;
  const y0 = Math.max(yMin, Math.min(1020 - altoBloque, yCentro));
  const topTitulo = y0 + (etiqueta ? ALTO_ETIQUETA : 0);
  const finTitulo = topTitulo + altoTitulo;
  const primera = lineas[0]?.[0]?.f ?? 0;

  return (
    <AbsoluteFill>
      {etiqueta && (
        <EtiquetaEditorial
          texto={etiqueta}
          primera={primera}
          grande={bool(p, "etiquetaGrande", true)}
          top={y0}
        />
      )}

      {/* Composición tipográfica asimétrica editorial con margen izquierdo firme */}
      <div
        style={{
          position: "absolute",
          top: topTitulo,
          left: 80,
          right: 80,
          textAlign: "left",
        }}
      >
        {lineas.map((l, k) => (
          <div
            key={k}
            style={{
              height: altos[k],
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "baseline",
              paddingTop: tam * 0.02,
              boxSizing: "border-box",
            }}
          >
            {l.map((t, j) => (
              <PalabraTitulo key={j} t={t} tam={tam} ultima={j === l.length - 1} />
            ))}
          </div>
        ))}
      </div>

      {/* Media fotográfica o icono editorial */}
      {imagenes.length > 0 && <DeckFotografico imagenes={imagenes} desde={b[0] ?? 0} arriba={finTitulo} />}

      {imagenes.length === 0 && icono && ic > 0 && (
        <div
          style={{
            position: "absolute",
            left: 540 - 80,
            top: finTitulo + 40,
            width: 160,
            height: 160,
            borderRadius: 28,
            background: C.tarjeta,
            border: `1.5px solid ${C.linea}`,
            boxShadow: SOMBRA,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${ic})`,
            opacity: Math.min(1, ic * 2),
          }}
        >
          <Icono nombre={icono} tam={84} color={C.acento} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const titular: DefEscena = {
  C: Titular,
  momentos: 1,
  avisar: (p) => {
    const lineas = txt(p, "texto")
      .split("/")
      .map((l) => l.replace(/\*/g, "").trim());
    const larga = lineas.reduce((a, l) => (l.length > a.length ? l : a), "");
    return larga.length > 18
      ? [`la línea «${larga}» tiene ${larga.length} letras y el título sale pequeño (la línea más larga decide el tamaño). Pártelo con «/» en líneas de 14 letras o menos.`]
      : [];
  },
  sonidos: (p) => (arr(p, "imagenes").length ? [[0, "whoosh", 0.3]] : txt(p, "icono") ? [[0, "pop", 0.35]] : []),
  validar: (p) => [
    ...reglas(p, [
      ["texto", "texto", { max: 90 }],
      ["etiqueta", "texto", { opcional: true, max: 24 }],
      ["imagenes", "lista", { opcional: true, maxItems: 4 }],
      ["icono", "texto", { opcional: true }],
    ]),
    ...(txt(p, "texto").split("/").length > 4 ? ["«texto» tiene más de 4 líneas; usa como mucho 3 «/»"] : []),
    ...txt(p, "texto")
      .split("/")
      .map((l) => l.replace(/\*/g, "").trim())
      .filter((l) => l.length > 28)
      .map((l) => `la línea «${l}» es muy larga para el titular (más de 28 letras): pártela con «/»`),
    ...iconos([txt(p, "icono") || undefined]),
  ],
};

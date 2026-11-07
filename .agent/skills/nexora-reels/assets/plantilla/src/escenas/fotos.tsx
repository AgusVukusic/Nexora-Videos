// Escenas con imágenes para Nexora Motion Reels:
// "imagen" (una ilustración o foto grande en un encuadre de visor, con efectos animados con código)
// y "galeria" (varias imágenes en tira de contacto, en anillo alrededor de un icono o en muro modular).
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { C } from "../motor/actual";
import { FPS } from "../motor/constantes";
import { F, alfa } from "../motor/estilos";
import { generarEsquinasReticula } from "../motor/trazos";
import { lerp } from "../motor/anim";
import { Baldosa } from "../piezas/basicas";
import { BarraVideo, Burbujas, Causticas, Cine, Estrellas, HazFaro, ImagenCard, Koi, Ondulaciones, Rayos, SubtituloCine } from "../piezas/imagenes";
import type { DefEscena, PropsEscena } from "../tipos";
import { arr, num, obj, reglas, txt } from "./util";

// ================================================================== imagen
const EFECTOS = ["agua", "causticas", "estrellas", "haz", "burbujas", "rayos", "cine", "flotar"];

// Encuadre fotográfico: imagen de esquinas casi rectas y sin sombra, revelada con una máscara de
// arriba abajo, con HUD de visor (REC, código de tiempo, formato, esquinas) y pie de foto editorial.
// Geometría (coordenadas de escena): horizontal y ∈ [300, 900], cuadrada y vertical y ∈ [270, 950];
// el pie de foto termina como mucho en y ≈ 1030.
const FORMATOS: Record<string, { x: number; y: number; w: number; h: number; rotulo: string }> = {
  horizontal: { x: 90, y: 300, w: 900, h: 600, rotulo: "3:2" },
  cuadrada: { x: 200, y: 270, w: 680, h: 680, rotulo: "1:1" },
  vertical: { x: 290, y: 270, w: 500, h: 680, rotulo: "3:4" },
};

/** HUD de visor de cámara dibujado encima de la imagen (colores fijos: siempre va sobre foto). */
const VisorCamara: React.FC<{ w: number; h: number; rotulo: string; etiqueta: string; desde: number }> = ({ w, h, rotulo, etiqueta, desde }) => {
  const f = useCurrentFrame();
  const op = lerp(f, desde + 6, desde + 16, 0, 1);
  const seg = Math.max(0, f - desde) / FPS;
  const tc = `00:${String(Math.floor(seg)).padStart(2, "0")}:${String(Math.floor((seg % 1) * FPS)).padStart(2, "0")}`;
  const esq = generarEsquinasReticula(22, 22, w - 44, h - 44, 34);
  const blanco = "#FFFFFF";
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        {[esq.topIzq, esq.topDer, esq.botIzq, esq.botDer].map((d, i) => (
          <path key={i} d={d} stroke={alfa(blanco, 0.85)} strokeWidth={3} fill="none" />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 44, top: 40, display: "flex", alignItems: "center", gap: 10, fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: "2px", color: blanco }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#EF4444", opacity: Math.floor(f / 15) % 2 ? 0.35 : 1 }} />
        REC {tc}
      </div>
      <div style={{ position: "absolute", right: 44, top: 40, fontFamily: F.mono, fontSize: 20, letterSpacing: "2px", color: alfa(blanco, 0.85) }}>{rotulo}</div>
      {etiqueta && (
        <div style={{ position: "absolute", left: 44, bottom: 40, fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: "2px", textTransform: "uppercase", color: blanco, background: "rgba(0,0,0,0.5)", padding: "8px 14px", borderRadius: 4 }}>{etiqueta}</div>
      )}
    </div>
  );
};

const Imagen: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const [b0, b1] = b;
  const ef = new Set(arr<string>(p, "efectos"));
  const formato = txt(p, "formato", "horizontal"); // horizontal (3:2) · cuadrada · vertical
  const R = FORMATOS[formato] ?? FORMATOS.horizontal;
  const haz = arr<number>(p, "haz");
  const peces = obj(p, "peces");
  const nPeces = Math.min(3, num(peces, "n", txt(peces, "imagen") ? 2 : 0));
  const flota = ef.has("flotar") ? Math.sin(f / 12) * 8 : 0;
  const revela = lerp(f, 0, 16, 0, 1, Easing.inOut(Easing.cubic));
  const texto = txt(p, "texto");
  const etiqueta = txt(p, "etiqueta");
  const pie = lerp(f, b1, b1 + 10, 0, 1, Easing.out(Easing.cubic));
  const fuerza = 0.3 + 0.15 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (f - b0) / 30))));
  // Máscara de revelado de arriba abajo, en coordenadas del lienzo.
  const recorte = `inset(${R.y - 4}px 0px ${(1920 - (R.y - 4) - (R.h + 8) * revela).toFixed(1)}px 0px)`;
  return (
    <AbsoluteFill style={{ transform: `translateY(${flota}px)` }}>
      <AbsoluteFill style={{ clipPath: recorte }}>
      <ImagenCard src={txt(p, "imagen")} {...R} r={6} agua={ef.has("agua")} zoom={0.08} sombra={false}>
        {ef.has("causticas") && <Causticas opacidad={fuerza} />}
        {ef.has("estrellas") && <Estrellas w={R.w} h={R.h * 0.55} n={46} />}
        {ef.has("haz") && <HazFaro x={R.w * (haz[0] ?? 0.3)} y={R.h * (haz[1] ?? 0.3)} largo={R.w} />}
        {ef.has("rayos") && <Rayos w={R.w} h={R.h} />}
        {ef.has("burbujas") && <Burbujas w={R.w} h={R.h} n={22} />}
        {nPeces > 0 &&
          Array.from({ length: nPeces }).map((_, k) => {
            const rutas: [number, number][][] = [
              [[-100, R.h * 0.92], [R.w * 0.25, R.h * 0.55], [R.w * 0.62, R.h * 0.82], [R.w + 110, R.h * 0.3]],
              [[R.w + 100, R.h * 0.62], [R.w * 0.75, R.h * 0.18], [R.w * 0.3, R.h * 0.42], [-110, R.h * 0.12]],
              [[R.w * 0.45, R.h + 120], [R.w * 0.5, R.h * 0.7], [R.w * 0.2, R.h * 0.4], [R.w * 0.1, -120]],
            ];
            return <Koi key={k} src={txt(peces, "imagen")} desde={b0 - 4 + k * 10} dur={120 + k * 10} p={rutas[k]} tam={R.h * (0.34 - k * 0.06)} espejo={k === 1} />;
          })}
        {(ef.has("agua") || nPeces > 0) && <Ondulaciones desde={b1} x={R.w * 0.52} y={R.h * 0.5} n={4} separacion={7} tam={340} />}
        {ef.has("cine") && <Cine desde={b0} w={R.w} h={R.h} banda={0.11} />}
        {ef.has("cine") && texto && <SubtituloCine texto={texto} desde={b1} bottom={R.h * 0.11 + 18} />}
        <VisorCamara w={R.w} h={R.h} rotulo={R.rotulo} etiqueta={etiqueta} desde={0} />
      </ImagenCard>
      </AbsoluteFill>
      {ef.has("cine") && (
        <div style={{ position: "absolute", left: R.x + 40, top: R.y + R.h + 26, opacity: lerp(f, b0 + 4, b0 + 12, 0, 1) }}>
          <div style={{ background: C.oscuro, borderRadius: 22, padding: "14px 24px", boxShadow: "0 10px 24px rgba(0,0,0,0.2)" }}>
            <BarraVideo w={R.w - 160} desde={b0} />
          </div>
        </div>
      )}
      {/* Pie de foto editorial */}
      {!ef.has("cine") && texto && f >= b1 && (
        <div style={{ position: "absolute", left: R.x, width: Math.max(R.w, 700), top: R.y + R.h + 26, display: "flex", alignItems: "center", gap: 16, opacity: pie, transform: `translateY(${((1 - pie) * 12).toFixed(2)}px)` }}>
          <div style={{ width: 6, height: 40, background: C.acento, flexShrink: 0 }} />
          <div style={{ fontFamily: F.titulo, fontSize: 40, lineHeight: 1.1, letterSpacing: -0.5, color: C.texto, whiteSpace: "nowrap" }}>{texto}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const usePopLocal = (f: number, desde: number) =>
  f < desde ? 0 : spring({ frame: f - desde, fps: FPS, config: { damping: 11, stiffness: 220, mass: 0.5, overshootClamping: false } });

export const imagen: DefEscena = {
  C: Imagen,
  momentos: 2,
  sonidos: (p) => {
    const ef = new Set(arr<string>(p, "efectos"));
    if (ef.has("cine")) return [[0, "proyector", 0.32]];
    if (ef.has("burbujas") || ef.has("agua")) return [[0, "burbuja", 0.28]];
    if (ef.has("estrellas") || ef.has("haz")) return [[0, "campana", 0.22]];
    return txt(p, "texto") ? [[1, "pop", 0.3]] : [];
  },
  validar: (p) => [
    ...reglas(p, [
      ["imagen", "imagen"],
      ["texto", "texto", { opcional: true, max: 34 }],
      ["etiqueta", "texto", { opcional: true, max: 22 }],
      ["efectos", "lista", { opcional: true }],
    ]),
    ...arr<string>(p, "efectos").flatMap((e) => (EFECTOS.includes(e) ? [] : [`el efecto «${e}» no existe (efectos: ${EFECTOS.join(", ")})`])),
    ...(["horizontal", "cuadrada", "vertical", ""].includes(txt(p, "formato")) ? [] : [`«formato» tiene que ser "horizontal", "cuadrada" o "vertical"`]),
    ...(Object.keys(obj(p, "peces")).length && !txt(obj(p, "peces"), "imagen")
      ? [`«peces» necesita "imagen": un PNG con fondo transparente del animal visto desde arriba, mirando hacia arriba`]
      : []),
  ],
};

// ================================================================== galeria
// Tres composiciones sin marcos blancos: filetes finos y códigos de cuadro monoespaciados.
// - rejilla: muro modular asimétrico (la primera imagen ocupa 2×2 celdas de una retícula de 3 columnas).
// - abanico: tira de contacto fotográfica con perforaciones que se desplaza en horizontal.
// - orbita: anillo fijo de imágenes alrededor del icono central, con conectores (sin giro ni solapes).
// Geometría: todo dentro de y ∈ [~260, ~980] (coordenadas de escena).
const GAL = { x: 100, w: 880, centro: 640, hueco: 16 };

/** Código de cuadro monoespaciado (01, 02…) para pies de imagen. */
const codigoCuadro = (k: number) => String(k + 1).padStart(2, "0");

/** Pie editorial compartido por los modos (barra de acento + texto). */
const PieGaleria: React.FC<{ texto: string; desde: number; top: number; centrado?: boolean }> = ({ texto, desde, top, centrado = false }) => {
  const f = useCurrentFrame();
  const q = lerp(f, desde, desde + 10, 0, 1, Easing.out(Easing.cubic));
  if (!texto || f < desde) return null;
  return (
    <div style={{ position: "absolute", left: GAL.x, width: GAL.w, top, display: "flex", justifyContent: centrado ? "center" : "flex-start", opacity: q, transform: `translateY(${((1 - q) * 12).toFixed(2)}px)`, zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 6, height: 36, background: C.acento }} />
        <div style={{ fontFamily: F.titulo, fontSize: 38, lineHeight: 1.1, letterSpacing: -0.5, color: C.texto, whiteSpace: "nowrap" }}>{texto}</div>
      </div>
    </div>
  );
};

const Galeria: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const [b0, b1] = b;
  const imagenes = arr<string>(p, "imagenes").slice(0, 6);
  const modo = txt(p, "modo", "abanico");
  const n = imagenes.length;
  const etiqueta = txt(p, "etiqueta");

  if (modo === "orbita") {
    const cx = 540;
    const cy = 620;
    const rx = 330;
    const ry = 290;
    const wM = 200;
    const hM = (wM * 2) / 3;
    const tile = usePopLocal(f, b0);
    const brillo = interpolate(f, [b1, b1 + 6, b1 + 26], [0, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const enlace = lerp(f, b1, b1 + 12, 0, 1, Easing.out(Easing.cubic));
    const pos = imagenes.map((_, k) => {
      const ang = -Math.PI / 2 + (k / n) * Math.PI * 2;
      return { x: cx + Math.cos(ang) * rx, y: cy + Math.sin(ang) * ry };
    });
    return (
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible", pointerEvents: "none" }}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={alfa(C.texto, 0.14)} strokeWidth={1.5} strokeDasharray="6 8" fill="none" opacity={lerp(f, b0, b0 + 12, 0, 1)} />
          {pos.map((q, k) => (
            <line key={k} x1={cx} y1={cy} x2={cx + (q.x - cx) * enlace} y2={cy + (q.y - cy) * enlace} stroke={alfa(C.acento, 0.55)} strokeWidth={2} />
          ))}
        </svg>
        {imagenes.map((src, k) => {
          const t = b0 + 2 + k * 3;
          const q = lerp(f, t, t + 10, 0, 1, Easing.out(Easing.cubic));
          if (f < t) return null;
          return <Marco key={k} src={src} w={wM} codigo={codigoCuadro(k)} style={{ left: pos[k].x - wM / 2, top: pos[k].y - hM / 2, opacity: q, transform: `scale(${0.9 + 0.1 * q})` }} />;
        })}
        <div style={{ position: "absolute", left: cx - 110, top: cy - 110, transform: `scale(${tile})`, zIndex: 2 }}>
          <Baldosa size={220} icono={txt(p, "centro") || undefined} brillo={brillo} />
        </div>
        {etiqueta && f >= b1 && (
          <div style={{ position: "absolute", left: cx - 300, width: 600, top: cy + ry + hM / 2 + 36, textAlign: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: "3px", textTransform: "uppercase", color: C.acento, opacity: enlace, zIndex: 4 }}>{etiqueta}</div>
        )}
      </AbsoluteFill>
    );
  }

  if (modo === "rejilla") {
    // Retícula de 3 columnas; la imagen 1 ocupa 2×2. Celdas libres: columna derecha y fila inferior.
    const cw = (GAL.w - 2 * GAL.hueco) / 3;
    const ch = (cw * 2) / 3;
    // [columna, fila, ancho en celdas, alto en celdas] según la cantidad de imágenes (sin huecos vacíos).
    const DISTRIBUCION: Record<number, [number, number, number, number][]> = {
      2: [[0, 0, 2, 2], [2, 0, 1, 2]],
      3: [[0, 0, 2, 2], [2, 0, 1, 1], [2, 1, 1, 1]],
      4: [[0, 0, 2, 2], [2, 0, 1, 1], [2, 1, 1, 1], [0, 2, 3, 1]],
      5: [[0, 0, 2, 2], [2, 0, 1, 1], [2, 1, 1, 1], [0, 2, 1, 1], [1, 2, 2, 1]],
      6: [[0, 0, 2, 2], [2, 0, 1, 1], [2, 1, 1, 1], [0, 2, 1, 1], [1, 2, 1, 1], [2, 2, 1, 1]],
    };
    const celdas = DISTRIBUCION[Math.max(2, Math.min(6, n))];
    const filas = n <= 3 ? 2 : 3;
    const alto = filas * ch + (filas - 1) * GAL.hueco;
    const y0 = GAL.centro - alto / 2;
    const destacar = num(p, "destacar", -1);
    const v = lerp(f, b1, b1 + 10, 0, 1, Easing.out(Easing.cubic));
    return (
      <AbsoluteFill>
        {imagenes.map((src, k) => {
          const t = b0 + k * 4;
          if (f < t) return null;
          const q = lerp(f, t, t + 10, 0, 1, Easing.out(Easing.cubic));
          const [cx, cy, sx, sy] = celdas[k];
          const w = sx * cw + (sx - 1) * GAL.hueco;
          const h = sy * ch + (sy - 1) * GAL.hueco;
          const hayDestacada = destacar >= 0 && destacar < n;
          const resalta = hayDestacada && k === destacar;
          return (
            <Marco
              key={k}
              src={src}
              w={w}
              h={h}
              codigo={codigoCuadro(k)}
              codigoDentro
              resaltado={resalta ? v : 0}
              style={{
                left: GAL.x + cx * (cw + GAL.hueco),
                top: y0 + cy * (ch + GAL.hueco),
                clipPath: q < 1 ? `inset(0 ${((1 - q) * 100).toFixed(1)}% 0 0)` : undefined,
                opacity: hayDestacada && !resalta ? 1 - 0.5 * v : 1,
              }}
            />
          );
        })}
        <PieGaleria texto={etiqueta} desde={b1} top={y0 + alto + 24} />
      </AbsoluteFill>
    );
  }

  // abanico → tira de contacto: cuadros sobre una tira con perforaciones que se desplaza en horizontal.
  const wC = 300;
  const hC = 200;
  const paso = wC + 24;
  const anchoTira = n * paso + 24;
  const recorrido = Math.max(0, anchoTira - GAL.w);
  const entra = lerp(f, b0, b0 + 14, 0, 1, Easing.out(Easing.cubic));
  const desplaza = lerp(f, b0 + 6, b1 + 40, 0, 1, Easing.inOut(Easing.cubic));
  const xTira = GAL.x + (1 - entra) * 200 - recorrido * desplaza;
  const yTira = GAL.centro - (hC + 96) / 2;
  const perforaciones = Math.ceil(anchoTira / 36);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: yTira, height: hC + 96, overflow: "hidden", opacity: entra }}>
        <div style={{ position: "absolute", left: xTira, top: 0, width: anchoTira, height: hC + 96, background: alfa(C.texto, 0.07), borderTop: `1.5px solid ${alfa(C.texto, 0.2)}`, borderBottom: `1.5px solid ${alfa(C.texto, 0.2)}` }}>
          {[10, hC + 72].map((top) => (
            <div key={top} style={{ position: "absolute", left: 0, right: 0, top, height: 14 }}>
              {Array.from({ length: perforaciones }).map((_, i) => (
                <div key={i} style={{ position: "absolute", left: 12 + i * 36, top: 0, width: 18, height: 12, borderRadius: 3, background: alfa(C.texto, 0.22) }} />
              ))}
            </div>
          ))}
          {imagenes.map((src, k) => (
            <Marco key={k} src={src} w={wC} h={hC} codigo={`${codigoCuadro(k)}A`} codigoDentro style={{ left: 24 + k * paso, top: 48 }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: GAL.x, width: GAL.w, top: yTira - 44, display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 20, letterSpacing: "2px", color: C.suave, opacity: entra }}>
        <span>{`HOJA DE CONTACTO · ${n} CUADROS`}</span>
        <span>{`${codigoCuadro(Math.min(n - 1, Math.round(desplaza * (n - 1))))}/${codigoCuadro(n - 1)}`}</span>
      </div>
      <PieGaleria texto={etiqueta} desde={b1} top={yTira + hC + 96 + 30} />
    </AbsoluteFill>
  );
};

/** Imagen con filete fino (3:2 por defecto), código de cuadro y resaltado opcional en acento. */
export const Marco: React.FC<{ src: string; w: number; h?: number; codigo?: string; codigoDentro?: boolean; resaltado?: number; style?: React.CSSProperties }> = ({
  src,
  w,
  h,
  codigo,
  codigoDentro = false,
  resaltado = 0,
  style,
}) => (
  <div style={{ position: "absolute", width: w, height: h ?? (w * 2) / 3, ...style }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden", background: C.oscuro, border: `1.5px solid ${alfa(C.texto, 0.25)}` }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    {resaltado > 0 && <div style={{ position: "absolute", inset: -6, borderRadius: 6, border: `4px solid ${alfa(C.acento, resaltado)}` }} />}
    {codigo && (
      <div
        style={{
          position: "absolute",
          left: codigoDentro ? 10 : 0,
          bottom: codigoDentro ? 8 : undefined,
          top: codigoDentro ? undefined : "100%",
          marginTop: codigoDentro ? 0 : 6,
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: "1px",
          color: codigoDentro ? "#FFFFFF" : resaltado > 0 ? C.acento : C.suave,
          background: codigoDentro ? "rgba(0,0,0,0.5)" : undefined,
          padding: codigoDentro ? "2px 6px" : 0,
          borderRadius: 3,
        }}
      >
        {codigo}
      </div>
    )}
  </div>
);

export const galeria: DefEscena = {
  C: Galeria,
  momentos: 2,
  sonidos: (p) => [[txt(p, "modo") === "rejilla" ? 0 : 1, txt(p, "modo") === "orbita" ? "ding" : "whoosh", 0.3]],
  validar: (p) => [
    ...reglas(p, [
      ["imagenes", "lista", { minItems: 2, maxItems: 6 }],
      ["etiqueta", "texto", { opcional: true, max: 30 }],
    ]),
    ...(["abanico", "orbita", "rejilla", ""].includes(txt(p, "modo")) ? [] : [`«modo» tiene que ser "abanico", "orbita" o "rejilla"`]),
  ],
};

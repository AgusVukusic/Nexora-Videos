// Escenas de tarjetas: contador, cifras, ficha, lista, comparacion, objecion, pasos, pregunta, barras y tachado.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { BORDE, C, ESTILO, SOMBRA } from "../motor/actual";
import { FPS } from "../motor/constantes";
import { F, alfa } from "../motor/estilos";
import { pesoTexto, useFuentes } from "../motor/fuentes";
import { bump, lerp, numeroES, usePop } from "../motor/anim";
import { Icono, Llama, Onda, useGolpe } from "../piezas/basicas";
import { calcularDashOffset, generarArcoSvg, generarConectorOrtogonal, generarEsquinasReticula, generarMarcasRegla } from "../motor/trazos";
import type { DefEscena, PropsEscena } from "../tipos";
import { arr, bool, iconos, item, num, obj, reglas, txt } from "./util";

const T = (peso: number): React.CSSProperties => ({ fontFamily: F.texto, fontWeight: pesoTexto(peso) });

/** Tamaño de letra para que el texto quepa en `ancho` (entre `min` y `max`). */
const tamQueCabe = (texto: string, fuente: string, peso: string, max: number, ancho: number, min = 40) => {
  const w100 = measureText({ text: texto || " ", fontFamily: fuente, fontWeight: peso, fontSize: 100, validateFontIsLoaded: false }).width;
  return Math.max(min, Math.min(max, (100 * ancho) / Math.max(1, w100)));
};

const Numero: React.FC<{ desde: number; hasta: number; v0: number; v1: number; tam: number; color?: string; golpe?: number; prefijo?: string; sufijo?: string; decimales?: number }> = ({
  desde,
  hasta,
  v0,
  v1,
  tam,
  color = C.tarjetaTexto,
  golpe = -100,
  prefijo = "",
  sufijo = "",
  decimales = 0,
}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [desde, Math.max(desde + 1, hasta)], [v0, v1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const g = useGolpe(golpe, 0.22, 12);
  return (
    <div style={{ fontFamily: F.titulo, fontSize: tam, lineHeight: 0.92, color, letterSpacing: -tam * 0.02, transform: `scale(${g})`, transformOrigin: "50% 60%", whiteSpace: "nowrap" }}>
      {prefijo}
      {numeroES(v, decimales)}
      {sufijo}
    </div>
  );
};

// ================================================================== contador
const Contador: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const [b0, b1] = b;
  const valor = num(p, "valor");
  const desde = p.desde === undefined ? valor : num(p, "desde");
  const llama = bool(p, "llama");
  const icono = txt(p, "icono");
  const destacar = bool(p, "destacar", true) && f >= b1;
  const entra = usePop(b0, { damping: 14, stiffness: 150, mass: 0.7, overshootClamping: false });

  // Geometría del contenedor monumental
  const x = 100;
  const y = 370;
  const w = 880;
  const h = 440;
  const esquinas = generarEsquinasReticula(x, y, w, h, 28);
  const progresoBarra = lerp(f, b0, b1, desde === valor ? 0 : 8, desde === valor ? 0 : 100);

  return (
    <AbsoluteFill>
      {entra > 0 && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y + (1 - entra) * 80,
            width: w,
            height: h,
            opacity: Math.min(1, entra * 1.6),
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 50px 38px",
            boxSizing: "border-box",
          }}
        >
          {/* Retícula de esquinas técnicas vectoriales */}
          <svg
            viewBox={`${x} ${y} ${w} ${h}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path d={esquinas.topIzq} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
            <path d={esquinas.topDer} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
            <path d={esquinas.botIzq} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
            <path d={esquinas.botDer} stroke={alfa(C.acento, 0.45)} strokeWidth={2} fill="none" />
          </svg>

          {/* Cabecera técnica: Etiqueta e indicadores */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 2, background: C.acento }} />
              <span
                style={{
                  fontFamily: F.texto,
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: alfa(C.tarjetaTexto, 0.85),
                  lineHeight: 1.15,
                }}
              >
                {txt(p, "etiqueta")}
              </span>
            </div>
            <div>
              {llama && <Llama size={64} enciende={b0 + 4} apaga={b1} />}
              {!llama && icono && <Icono nombre={icono} tam={68} color={C.acento} />}
            </div>
          </div>

          {/* Cifra tipográfica monumental */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-start", marginTop: 8 }}>
            <Numero
              desde={b0 + 4}
              hasta={b1}
              v0={desde}
              v1={valor}
              tam={200}
              color={destacar ? C.acento : C.tarjetaTexto}
              golpe={b1}
              prefijo={txt(p, "prefijo")}
              sufijo={txt(p, "sufijo")}
            />
          </div>

          {/* Calibrador técnico milimétrico con progreso */}
          <div style={{ marginTop: 20 }}>
            <div style={{ height: 6, borderRadius: 3, background: alfa(C.linea, 0.5), position: "relative" }}>
              <div
                style={{
                  width: `${progresoBarra}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: C.acento,
                  boxShadow: `0 0 12px ${alfa(C.acento, 0.6)}`,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontFamily: F.mono,
                fontSize: 16,
                color: alfa(C.tarjetaTexto, 0.45),
                letterSpacing: "1px",
              }}
            >
              <span>0%</span>
              <span>CALIBRACIÓN</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}
      {f >= b1 && <Onda desde={b1} x={540} y={590} r0={60} r1={260} />}
    </AbsoluteFill>
  );
};

export const contador: DefEscena = {
  C: Contador,
  momentos: 2,
  sonidos: (p) => [[1, bool(p, "llama") ? "puff" : "golpe", bool(p, "llama") ? 0.4 : 0.45]],
  validar: (p) => [...reglas(p, [["valor", "numero"], ["etiqueta", "texto", { max: 40 }], ["desde", "numero", { opcional: true }]]), ...iconos([txt(p, "icono") || undefined])],
  avisar: (p) => (txt(p, "etiqueta").length > 28 ? [`la etiqueta tiene ${txt(p, "etiqueta").length} letras: con 28 o menos cabe en una línea y se lee mejor`] : []),
};

// ================================================================== cifras
// Módulos analíticos abiertos (sin tarjeta): filete que se traza y cifra monumental.
// Solo los porcentajes (0–100 con sufijo "%") llevan arco: así el arco siempre representa el dato.
// Geometría: el bloque completo queda dentro de y ∈ [250, 1040] (coordenadas de escena) con 3 filas.
const CIFRAS = { x: 100, w: 880, centro: 640, cabecera: 52, pie: 50 };

const Cifras: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const filas = arr<Record<string, unknown>>(p, "filas").slice(0, 3);
  const n = filas.length;
  const tam = n === 1 ? 190 : n === 2 ? 150 : 124;
  const alto = Math.round(CIFRAS.cabecera + tam * 0.92 + CIFRAS.pie);
  const hueco = n === 1 ? 0 : 40;
  const y0 = CIFRAS.centro - (n * alto + (n - 1) * hueco) / 2;
  const radio = Math.round(tam * 0.36);
  const trazo = Math.max(6, Math.round(tam * 0.05));

  return (
    <AbsoluteFill>
      {filas.map((fila, k) => {
        const bk = b[k] ?? 0;
        if (f < bk - 4) return null;
        const destacar = bool(fila, "destacar");
        const v = num(fila, "valor");
        const v0 = num(fila, "desde", 0);
        const sufijo = txt(fila, "sufijo");
        const detalle = txt(fila, "detalle");
        const y = y0 + k * (alto + hueco);
        const entra = spring({ frame: f - (bk - 4), fps: FPS, config: { damping: 16, stiffness: 140, mass: 0.7 } });
        const filete = lerp(f, bk - 4, bk + 10, 0, 1, Easing.out(Easing.cubic));
        const conteo = lerp(f, bk, bk + 20, 0, 1, Easing.out(Easing.cubic));
        const esPorcentaje = sufijo.trim() === "%" && v >= 0 && v <= 100 && v0 >= 0 && v0 <= 100;
        const fraccion = (v0 + (v - v0) * conteo) / 100;
        const color = destacar ? C.acento : C.texto;
        const cx = CIFRAS.w - radio - trazo;
        const cy = CIFRAS.cabecera + (alto - CIFRAS.cabecera) / 2;
        const arco = generarArcoSvg(cx, cy, radio, 0, 359.99);
        const largo = 2 * Math.PI * radio;
        const dash = calcularDashOffset(fraccion, largo);
        const indice = `${String(k + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;

        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: CIFRAS.x,
              top: y + (1 - entra) * 40,
              width: CIFRAS.w,
              height: alto,
              opacity: Math.min(1, entra * 1.6),
            }}
          >
            {/* Cabecera: índice monoespaciado + filete milimétrico que se traza */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, height: 36 }}>
              <span style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "2px", color: destacar ? C.acento : alfa(C.texto, 0.55), whiteSpace: "nowrap" }}>{indice}</span>
              <div style={{ flex: 1, height: 2, background: alfa(C.linea, 0.6), position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: 2, width: `${filete * 100}%`, background: destacar ? C.acento : alfa(C.texto, 0.5) }} />
              </div>
            </div>

            {/* Cuerpo: cifra monumental con etiqueta y detalle */}
            <div style={{ position: "absolute", left: 0, top: CIFRAS.cabecera, width: esPorcentaje ? cx - radio - 40 : CIFRAS.w, height: alto - CIFRAS.cabecera, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Numero desde={bk} hasta={bk + 20} v0={v0} v1={v} tam={tam} color={color} golpe={destacar ? bk + 20 : -100} prefijo={txt(fila, "prefijo")} sufijo={sufijo} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 14, whiteSpace: "nowrap" }}>
                <span style={{ ...T(800), fontSize: 30, letterSpacing: "3px", textTransform: "uppercase", color }}>{txt(fila, "etiqueta")}</span>
                {detalle && <span style={{ ...T(600), fontSize: 28, color: C.suave }}>{detalle}</span>}
              </div>
            </div>

            {/* Arco vectorial: proporción real del porcentaje */}
            {esPorcentaje && (
            <svg viewBox={`0 0 ${CIFRAS.w} ${alto}`} style={{ position: "absolute", left: 0, top: 0, width: CIFRAS.w, height: alto, overflow: "visible", pointerEvents: "none" }}>
              <circle cx={cx} cy={cy} r={radio} stroke={alfa(C.texto, 0.22)} strokeWidth={trazo} fill="none" />
              <path d={arco} stroke={destacar ? C.acento : alfa(C.texto, 0.75)} strokeWidth={trazo} strokeLinecap="round" fill="none" strokeDasharray={dash.strokeDasharray} strokeDashoffset={dash.strokeDashoffset} />
            </svg>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const cifras: DefEscena = {
  C: Cifras,
  momentos: (p) => Math.max(1, Math.min(3, arr(p, "filas").length)),
  sonidos: (p) => arr<Record<string, unknown>>(p, "filas").slice(0, 3).map((fila, k) => [k, bool(fila, "destacar") ? "golpe" : "tic", bool(fila, "destacar") ? 0.45 : 0.3] as [number, string, number]),
  validar: (p) => {
    const out = reglas(p, [["filas", "lista", { minItems: 1, maxItems: 3 }]]);
    arr<Record<string, unknown>>(p, "filas").forEach((fila, k) => out.push(...reglas(fila, [["valor", "numero"], ["etiqueta", "texto", { max: 14 }], ["detalle", "texto", { opcional: true, max: 30 }]]).map((s) => `fila ${k + 1}: ${s}`)));
    return out;
  },
};

// ================================================================== ficha
// Ficha técnica de laboratorio: marco abierto con esquinas de visor y regla graduada en el borde
// izquierdo, claves en monoespaciado y valores que entran con desenfoque cinético.
// Geometría: con 4 filas el marco ocupa y ∈ [~330, ~950] (coordenadas de escena).
const FICHA = { x: 100, w: 880, centro: 640, cabecera: 150, fila: 104, pie: 36, regla: 56 };

const Ficha: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const filas = arr<unknown[]>(p, "filas").slice(0, 4);
  const n = filas.length;
  const icono = txt(p, "icono");
  const etiqueta = txt(p, "etiqueta");
  const alto = FICHA.cabecera + n * FICHA.fila + FICHA.pie;
  const y = FICHA.centro - alto / 2;
  const entra = spring({ frame: f, fps: FPS, config: { damping: 16, stiffness: 130, mass: 0.7 } });
  const marco = lerp(f, 0, 14, 0, 1, Easing.out(Easing.cubic));
  const esquinas = generarEsquinasReticula(0, 0, FICHA.w, alto, 34);
  const marcas = generarMarcasRegla(FICHA.cabecera - 10, alto - FICHA.pie + 10, 12, 60);
  const xContenido = FICHA.regla + 14;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: FICHA.x, top: y + (1 - entra) * 50, width: FICHA.w, height: alto, opacity: Math.min(1, entra * 1.6) }}>
        {/* Esquinas de visor y regla graduada que se despliega de arriba abajo */}
        <svg viewBox={`0 0 ${FICHA.w} ${alto}`} style={{ position: "absolute", left: 0, top: 0, width: FICHA.w, height: alto, overflow: "visible", pointerEvents: "none" }}>
          {[esquinas.topIzq, esquinas.topDer, esquinas.botIzq, esquinas.botDer].map((d, i) => (
            <path key={i} d={d} stroke={alfa(C.acento, 0.6)} strokeWidth={2.5} fill="none" />
          ))}
          {marcas.map((m, i) => {
            const visible = (m.posicion - marcas[0].posicion) / Math.max(1, marcas[marcas.length - 1].posicion - marcas[0].posicion) <= marco;
            return visible ? <line key={i} x1={18} x2={18 + (m.esMayor ? 24 : 11)} y1={m.posicion} y2={m.posicion} stroke={alfa(C.texto, m.esMayor ? 0.55 : 0.25)} strokeWidth={m.esMayor ? 2 : 1.5} /> : null;
          })}
        </svg>

        {/* Cabecera: icono, título y etiqueta de estado en contorno */}
        <div style={{ position: "absolute", left: xContenido, right: 40, top: 36, display: "flex", alignItems: "center", gap: 20 }}>
          {icono ? <Icono nombre={icono} tam={56} color={C.acento} /> : <div style={{ width: 14, height: 14, borderRadius: 3, background: C.acento }} />}
          <div style={{ fontFamily: F.titulo, fontSize: 62, lineHeight: 1, letterSpacing: -1, color: C.texto, whiteSpace: "nowrap" }}>{txt(p, "titulo")}</div>
          {etiqueta && (
            <div style={{ marginLeft: "auto", fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: "3px", textTransform: "uppercase", color: C.acento, border: `1.5px solid ${alfa(C.acento, 0.7)}`, padding: "8px 16px", borderRadius: 6, whiteSpace: "nowrap" }}>{etiqueta}</div>
          )}
        </div>
        <div style={{ position: "absolute", left: xContenido, right: 40, top: 118, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "2px", color: alfa(C.texto, 0.45), whiteSpace: "nowrap" }}>{`FICHA · ${String(n).padStart(2, "0")} CAMPOS`}</span>
          <div style={{ flex: 1, height: 1.5, background: alfa(C.linea, 0.8) }} />
        </div>

        {/* Filas: clave monoespaciada a la izquierda, valor a la derecha */}
        {filas.map((fila, k) => {
          const [etq, val, dest] = fila as [string, string | number, boolean?];
          const t = b[k] ?? 0;
          const q = lerp(f, t, t + 9, 0, 1, Easing.out(Easing.cubic));
          const g = 1 + 0.18 * bump(f, t + 3, 10);
          const grande = dest || typeof val === "number";
          const top = FICHA.cabecera + k * FICHA.fila;
          return (
            <div key={k} style={{ position: "absolute", left: xContenido, right: 40, top, height: FICHA.fila, display: "flex", alignItems: "center" }}>
              {k < n - 1 && <div style={{ position: "absolute", left: 0, bottom: 0, width: `${q * 100}%`, borderBottom: `1.5px dashed ${alfa(C.linea, 0.9)}` }} />}
              {dest && <div style={{ position: "absolute", left: -xContenido + 18, top: FICHA.fila / 2 - 2, width: 30 * q, height: 4, background: C.acento }} />}
              <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "2px", textTransform: "uppercase", color: dest ? C.acento : C.suave, opacity: Math.min(1, q * 1.5), whiteSpace: "nowrap" }}>{etq}</div>
              <div
                style={{
                  marginLeft: "auto",
                  fontFamily: grande ? F.titulo : F.texto,
                  fontWeight: grande ? undefined : pesoTexto(800),
                  fontSize: grande ? 60 : 36,
                  color: dest ? C.acento : C.texto,
                  opacity: q,
                  filter: q < 1 ? `blur(${((1 - q) * 10).toFixed(2)}px)` : undefined,
                  transform: `translateX(${((1 - q) * 30).toFixed(2)}px) scale(${g})`,
                  transformOrigin: "100% 50%",
                  whiteSpace: "nowrap",
                }}
              >
                {typeof val === "number" ? numeroES(val) : val}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ficha: DefEscena = {
  C: Ficha,
  alInicio: () => true,
  momentos: (p) => Math.max(1, Math.min(4, arr(p, "filas").length)),
  sonidos: (p) => arr(p, "filas").slice(0, 4).map((_, k) => [k, "pop", 0.25] as [number, string, number]),
  validar: (p) => [
    ...reglas(p, [["titulo", "texto", { max: 18 }], ["etiqueta", "texto", { opcional: true, max: 14 }], ["filas", "lista", { minItems: 1, maxItems: 4 }]]),
    ...arr<unknown>(p, "filas").flatMap((fila, k) => (Array.isArray(fila) && fila.length >= 2 ? [] : [`fila ${k + 1}: tiene que ser ["etiqueta", "valor"] o ["etiqueta", "valor", true]`])),
    ...iconos([txt(p, "icono") || undefined]),
  ],
};

// ================================================================== lista
// Manifiesto editorial abierto: sin cajas, con ordinales monumentales, filetes que se trazan
// y un subrayado cinético que marca cada punto al enunciarse.
// Geometría: con título y 5 puntos el bloque ocupa y ∈ [~300, ~980] (coordenadas de escena).
const LISTA = { x: 100, w: 880, centro: 640, titulo: 120, num: 128, icono: 58 };

const Lista: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const ok = useFuentes();
  const items = arr(p, "items").slice(0, 5).map(item);
  const n = items.length;
  const titulo = txt(p, "titulo");
  const alto = n >= 5 ? 112 : 124;
  const cab = titulo ? LISTA.titulo : 0;
  const y0 = LISTA.centro - (n * alto + cab) / 2;
  const tp = lerp(f, 0, 12, 0, 1, Easing.out(Easing.cubic));
  const conIconos = items.some((it) => !!it.icono);
  // Punto vigente: el último ya enunciado. Los anteriores conservan su marca pero atenuada.
  const vigente = items.reduce((acc, _, k) => (f >= (b[k] ?? 0) + 4 ? k : acc), -1);
  if (!ok) return null;
  const pesoTxt = String(pesoTexto(800));

  return (
    <AbsoluteFill>
      {titulo && (
        <div style={{ position: "absolute", left: LISTA.x, width: LISTA.w, top: y0, height: LISTA.titulo, opacity: tp, transform: `translateY(${((1 - tp) * 20).toFixed(2)}px)` }}>
          <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "3px", color: C.acento, marginBottom: 10, whiteSpace: "nowrap" }}>{`${String(n).padStart(2, "0")} PUNTOS`}</div>
          <div style={{ fontFamily: F.titulo, fontSize: 60, lineHeight: 1, letterSpacing: -1, color: C.texto, whiteSpace: "nowrap" }}>{titulo}</div>
        </div>
      )}
      {items.map((it, k) => {
        const t = b[k] ?? 0;
        if (f < t - 3) return null;
        const y = y0 + cab + k * alto;
        const revela = lerp(f, t - 3, t + 7, 0, 1, Easing.out(Easing.cubic));
        const subraya = lerp(f, t + 4, t + 14, 0, 1, Easing.inOut(Easing.cubic));
        const activo = f >= t + 4;
        const atenuado = activo && k < vigente;
        const xTexto = LISTA.num + (conIconos ? LISTA.icono : 0);
        const tam = tamQueCabe(it.texto, F.texto, pesoTxt, n >= 5 ? 40 : 44, LISTA.w - xTexto - 10, 28);
        const anchoTxt = measureText({ text: it.texto, fontFamily: F.texto, fontWeight: pesoTxt, fontSize: tam, validateFontIsLoaded: false }).width;
        return (
          <div key={k} style={{ position: "absolute", left: LISTA.x, width: LISTA.w, top: y, height: alto }}>
            {/* Filete superior que se traza de izquierda a derecha */}
            <div style={{ position: "absolute", left: 0, top: 0, height: 1.5, width: `${revela * 100}%`, background: alfa(C.texto, 0.18) }} />
            {/* Contenido revelado con cortinilla horizontal */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", clipPath: `inset(0 ${((1 - revela) * 100).toFixed(2)}% 0 0)` }}>
              <div style={{ width: LISTA.num, flexShrink: 0, fontFamily: F.titulo, fontSize: 64, lineHeight: 1, letterSpacing: -1, color: !activo ? alfa(C.texto, 0.25) : atenuado ? alfa(C.acento, 0.55) : C.acento, transform: `scale(${1 + 0.12 * bump(f, t + 4, 9)})`, transformOrigin: "0% 60%" }}>
                {String(k + 1).padStart(2, "0")}
              </div>
              {conIconos && <div style={{ width: LISTA.icono, flexShrink: 0 }}>{it.icono && <Icono nombre={it.icono} tam={38} color={C.suave} />}</div>}
              <div style={{ position: "relative", fontFamily: F.texto, fontWeight: pesoTxt, fontSize: tam, lineHeight: 1.1, color: C.texto, whiteSpace: "nowrap" }}>
                {it.texto}
                <svg width={anchoTxt} height={8} style={{ position: "absolute", left: 0, bottom: -14, overflow: "visible" }}>
                  <line x1={0} y1={4} x2={anchoTxt} y2={4} stroke={atenuado ? alfa(C.acento, 0.3) : C.acento} strokeWidth={atenuado ? 3 : 5} strokeLinecap="round" {...calcularDashOffset(subraya, anchoTxt)} />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const lista: DefEscena = {
  C: Lista,
  alInicio: (p) => !!txt(p, "titulo"),
  momentos: (p) => Math.max(1, Math.min(5, arr(p, "items").length)),
  sonidos: (p) => arr(p, "items").slice(0, 5).map((_, k, a) => [k, k === a.length - 1 ? "ding" : "tic", k === a.length - 1 ? 0.26 : 0.3] as [number, string, number]),
  validar: (p) => [
    ...reglas(p, [["titulo", "texto", { opcional: true, max: 22 }], ["items", "lista", { minItems: 2, maxItems: 5 }]]),
    ...arr(p, "items").map(item).flatMap((it, k) => (it.texto.length > 30 ? [`item ${k + 1} es demasiado largo (${it.texto.length} letras; máximo 30)`] : [])),
    ...iconos(arr(p, "items").map(item).map((it) => it.icono)),
  ],
};

// ================================================================== comparacion
// Pantalla dividida por un corte vertical. En el veredicto el reparto pasa de 50/50 a 60/40 a favor
// del ganador: su lado se ilumina y recibe la marca; el perdedor se atenúa y su título queda cortado.
// Con ganador "ninguno" se mantiene el 50/50 y ambos lados quedan en igualdad.
// Geometría: el área ocupa y ∈ [330, 890] (coordenadas de escena).
const COMP = { x: 100, w: 880, y: 330, h: 560, columna: 300, margen: 36 };

const LadoComparado: React.FC<{ d: Record<string, unknown>; rotulo: string; x: number; desde: number; gana: boolean; pierde: boolean; veredicto: number; tamTitulo: number }> = ({
  d,
  rotulo,
  x,
  desde,
  gana,
  pierde,
  veredicto,
  tamTitulo,
}) => {
  const f = useCurrentFrame();
  const entra = lerp(f, desde, desde + 12, 0, 1, Easing.out(Easing.cubic));
  const v = lerp(f, veredicto, veredicto + 12, 0, 1, Easing.out(Easing.cubic));
  const corte = lerp(f, veredicto, veredicto + 7, 0, 1, Easing.out(Easing.cubic));
  if (f < desde) return null;
  const icono = txt(d, "icono");
  const titulo = txt(d, "titulo");
  const anchoTitulo = measureText({ text: titulo, fontFamily: F.titulo, fontWeight: String(ESTILO.fuentes.titulo.peso), fontSize: tamTitulo, validateFontIsLoaded: false }).width;
  const colorClave = gana && v > 0 ? C.acento : C.texto;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: COMP.y + 40,
        width: COMP.columna,
        opacity: entra * (pierde ? 1 - 0.55 * v : 1),
        transform: `translateY(${((1 - entra) * 30).toFixed(2)}px) scale(${gana ? 1 + 0.05 * v : 1})`,
        transformOrigin: "0% 0%",
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "3px", color: gana && v > 0 ? C.acento : C.suave, whiteSpace: "nowrap" }}>{rotulo}</div>
      <div style={{ height: 96, display: "flex", alignItems: "center", marginTop: 18 }}>{icono && <Icono nombre={icono} tam={76} color={gana && v > 0 ? C.acento : alfa(C.texto, 0.8)} grosor={1.6} />}</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 18, fontFamily: F.titulo, fontWeight: ESTILO.fuentes.titulo.peso, fontSize: tamTitulo, lineHeight: 1.05, letterSpacing: -1, color: colorClave, whiteSpace: "nowrap" }}>
        {titulo}
        {pierde && f >= veredicto && (
          <svg width={anchoTitulo + 16} height={10} style={{ position: "absolute", left: -8, top: "55%", overflow: "visible" }}>
            <line x1={0} y1={5} x2={(anchoTitulo + 16) * corte} y2={5} stroke={C.texto} strokeWidth={Math.max(4, tamTitulo * 0.07)} strokeLinecap="round" />
          </svg>
        )}
      </div>
      {txt(d, "texto") && <div style={{ ...T(600), fontSize: 30, lineHeight: 1.3, color: C.suave, marginTop: 18 }}>{txt(d, "texto")}</div>}
      {gana && f >= veredicto && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 30, fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: "3px", color: C.acentoTexto, background: C.acento, padding: "8px 16px", borderRadius: 6, transform: `scale(${0.9 + 0.1 * v})`, transformOrigin: "0% 50%", opacity: v }}>
          <svg viewBox="0 0 24 24" width={22} height={22}>
            <path d="M5 12.5 L10 17 L19 7" stroke={C.acentoTexto} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          MEJOR OPCIÓN
        </div>
      )}
    </div>
  );
};

const Comparacion: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const ok = useFuentes();
  const [b0, b1, b2] = b;
  const g = txt(p, "ganador", "derecha");
  const izq = obj(p, "izquierda");
  const der = obj(p, "derecha");
  const v = g === "ninguno" ? 0 : lerp(f, b2, b2 + 14, 0, 1, Easing.inOut(Easing.cubic));
  // Reparto del ancho: 0,5 → 0,6 para el ganador.
  const parteIzq = 0.5 + (g === "izquierda" ? 0.1 : g === "derecha" ? -0.1 : 0) * v;
  const xCorte = COMP.x + COMP.w * parteIzq;
  const corte = lerp(f, b1 - 6, b1 + 6, 0, 1, Easing.inOut(Easing.cubic));
  if (!ok) return null;
  const peso = String(ESTILO.fuentes.titulo.peso);
  // Un único tamaño de título para ambos lados, calculado sobre la columna más estrecha.
  const tamTitulo = Math.min(tamQueCabe(txt(izq, "titulo"), F.titulo, peso, 60, COMP.columna - 20, 30), tamQueCabe(txt(der, "titulo"), F.titulo, peso, 60, COMP.columna - 20, 30));

  return (
    <AbsoluteFill>
      {/* Campo iluminado del ganador */}
      {g !== "ninguno" && v > 0 && (
        <div
          style={{
            position: "absolute",
            left: g === "izquierda" ? COMP.x : xCorte,
            top: COMP.y,
            width: g === "izquierda" ? xCorte - COMP.x : COMP.x + COMP.w - xCorte,
            height: COMP.h,
            background: `linear-gradient(180deg, ${alfa(C.acento, 0.1 * v)} 0%, ${alfa(C.acento, 0)} 100%)`,
            borderTop: `2px solid ${alfa(C.acento, 0.8 * v)}`,
          }}
        />
      )}

      {/* Corte vertical que separa ambos lados */}
      {f >= b1 - 6 && (
        <svg viewBox={`0 0 1080 1920`} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible", pointerEvents: "none" }}>
          {/* Dos tramos con hueco central para el rótulo "VS"; el hueco se cierra en el veredicto */}
          {(() => {
            const medio = COMP.y + COMP.h / 2;
            const hueco = 30 * (1 - v);
            const tramo = COMP.h / 2 - hueco;
            return (
              <>
                <line x1={xCorte} y1={COMP.y} x2={xCorte} y2={medio - hueco} stroke={alfa(C.texto, 0.35)} strokeWidth={2} {...calcularDashOffset(corte, tramo)} />
                <line x1={xCorte} y1={COMP.y + COMP.h} x2={xCorte} y2={medio + hueco} stroke={alfa(C.texto, 0.35)} strokeWidth={2} {...calcularDashOffset(corte, tramo)} />
              </>
            );
          })()}
        </svg>
      )}
      {f >= b1 && (
        <div style={{ position: "absolute", left: xCorte - 30, top: COMP.y + COMP.h / 2 - 16, width: 60, textAlign: "center", fontFamily: F.mono, fontSize: 22, letterSpacing: "2px", color: C.suave, opacity: lerp(f, b1, b1 + 8, 0, 1) * (1 - v) }}>VS</div>
      )}

      <LadoComparado d={izq} rotulo="OPCIÓN A" x={COMP.x + COMP.margen / 2} desde={b0} gana={g === "izquierda"} pierde={g === "derecha"} veredicto={b2} tamTitulo={tamTitulo} />
      <LadoComparado d={der} rotulo="OPCIÓN B" x={xCorte + COMP.margen} desde={b1} gana={g === "derecha"} pierde={g === "izquierda"} veredicto={b2} tamTitulo={tamTitulo} />
    </AbsoluteFill>
  );
};

export const comparacion: DefEscena = {
  C: Comparacion,
  momentos: 3,
  sonidos: () => [
    [0, "pop", 0.3],
    [1, "pop", 0.3],
    [2, "exito", 0.26],
  ],
  validar: (p) => {
    const out = reglas(p, [["izquierda", "objeto"], ["derecha", "objeto"]]);
    for (const lado of ["izquierda", "derecha"]) out.push(...reglas(obj(p, lado), [["titulo", "texto", { max: 16 }], ["texto", "texto", { opcional: true, max: 50 }]]).map((s) => `${lado}: ${s}`));
    if (!["izquierda", "derecha", "ninguno", ""].includes(txt(p, "ganador"))) out.push(`«ganador» tiene que ser "izquierda", "derecha" o "ninguno"`);
    out.push(...iconos([txt(obj(p, "izquierda"), "icono") || undefined, txt(obj(p, "derecha"), "icono") || undefined]));
    return out;
  },
};

// ================================================================== objecion ("¿Pensarás que…?")
const Objecion: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const [b0, b1] = b;
  const burbuja = spring({ frame: f - b0, fps: FPS, config: { damping: 14, stiffness: 160, mass: 0.7 } });
  const resp = usePop(b1, { damping: 11, stiffness: 220, mass: 0.6, overshootClamping: false });
  const numero = txt(p, "numero");
  const conectorP = lerp(f, b1 - 6, b1, 0, 1, Easing.out(Easing.cubic));

  const x0 = 100;
  const w = 880;
  const topCita = 320;

  return (
    <AbsoluteFill>
      {/* Comillas gigantes en marca de agua de fondo editorial */}
      {f >= b0 && (
        <div
          style={{
            position: "absolute",
            left: x0 + 10,
            top: topCita - 70,
            fontFamily: F.titulo,
            fontWeight: 900,
            fontSize: 220,
            lineHeight: 1,
            color: alfa(C.acento, 0.12),
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          «
        </div>
      )}

      {/* Cita editorial de la objeción */}
      {f >= b0 && (
        <div
          style={{
            position: "absolute",
            left: x0,
            top: topCita,
            width: w,
            transform: `translateY(${(1 - burbuja) * 36}px) scale(${0.96 + 0.04 * burbuja})`,
            opacity: Math.min(1, burbuja * 1.8),
          }}
        >
          {/* Header editorial con micro-kicker o número */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                padding: "5px 14px",
                borderRadius: 4,
                background: C.acento,
                color: C.acentoTexto,
                fontFamily: F.texto,
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              {numero ? `OBJECIÓN ${numero}` : "PREGUNTA FRECUENTE"}
            </div>
            <div style={{ flex: 1, height: 1, background: alfa(C.linea, 0.6) }} />
          </div>

          {/* Bloque de texto de la objeción con alta dignidad editorial */}
          <div
            style={{
              padding: "24px 34px",
              background: C.tarjeta,
              color: C.tarjetaTexto,
              borderRadius: 24,
              border: `1.5px solid ${C.linea}`,
              boxShadow: SOMBRA,
            }}
          >
            <div
              style={{
                fontFamily: F.texto,
                fontWeight: 700,
                fontSize: 24,
                color: C.acento,
                marginBottom: 8,
                letterSpacing: "1px",
              }}
            >
              ¿PENSARÁS QUE...
            </div>
            <div
              style={{
                fontFamily: F.titulo,
                fontWeight: 800,
                fontSize: 54,
                lineHeight: 1.12,
                letterSpacing: "-1px",
              }}
            >
              {txt(p, "texto")}?
            </div>
          </div>
        </div>
      )}

      {/* Conector ortogonal vectorial hacia la respuesta */}
      {f >= b1 - 6 && (
        <svg
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <line
            x1={540}
            y1={topCita + 280}
            x2={540}
            y2={topCita + 280 + 110 * conectorP}
            stroke={C.acento}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        </svg>
      )}

      {/* Tarjeta de réplica / respuesta categórica */}
      {resp > 0 && txt(p, "respuesta") && (
        <div
          style={{
            position: "absolute",
            left: 100,
            right: 100,
            top: topCita + 410,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${resp}) translateY(${(1 - resp) * 20}px)`,
            opacity: Math.min(1, resp * 2),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: C.oscuro,
              color: C.oscuroTexto,
              padding: "20px 42px",
              borderRadius: 24,
              border: `1.5px solid ${C.acento}`,
              boxShadow: `0 16px 36px ${alfa(C.acento, 0.28)}`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: C.acento,
                color: C.acentoTexto,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              ✓
            </div>
            <span
              style={{
                fontFamily: F.titulo,
                fontWeight: 800,
                fontSize: 38,
                letterSpacing: "-0.5px",
                lineHeight: 1.15,
              }}
            >
              {txt(p, "respuesta")}
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const objecion: DefEscena = {
  C: Objecion,
  alInicio: (p) => !!txt(p, "numero"),
  momentos: 2,
  sonidos: (p) => [[0, "pop", 0.32], ...(txt(p, "respuesta") ? ([[1, "ding", 0.26]] as [number, string, number][]) : [])],
  validar: (p) => reglas(p, [["texto", "texto", { max: 60 }], ["respuesta", "texto", { opcional: true, max: 30 }], ["numero", "texto", { opcional: true, max: 12 }]]),
};

// ================================================================== pasos
// Diagrama de flujo: columna de nodos de estado (pendiente → vigente → completado) unidos por
// conectores vectoriales que se trazan al avanzar. Los nodos pendientes se ven desde el inicio
// (anticipan la estructura) pero el texto de cada paso solo aparece al enunciarse.
// Geometría: con 4 pasos el diagrama ocupa y ∈ [~350, ~930] (coordenadas de escena).
const PASOS = { x: 100, w: 880, centro: 640, radio: 34, xTexto: 116 };

const Pasos: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const ok = useFuentes();
  const pasos = arr(p, "pasos").slice(0, 4).map(item);
  const n = pasos.length;
  const paso = n <= 3 ? 200 : 168;
  const y0 = PASOS.centro - ((n - 1) * paso) / 2;
  const cx = PASOS.radio + 2;
  const vigente = pasos.reduce((acc, _, k) => (f >= (b[k] ?? 0) ? k : acc), -1);
  const aparece = lerp(f, 0, 10, 0, 1);
  if (!ok) return null;
  const pesoTxt = String(pesoTexto(800));

  return (
    <AbsoluteFill>
      {/* Conectores entre nodos: guía tenue + trazo de acento que avanza hacia el paso siguiente */}
      <svg viewBox={`0 0 ${PASOS.w} 1920`} style={{ position: "absolute", left: PASOS.x, top: 0, width: PASOS.w, height: 1920, overflow: "visible", pointerEvents: "none" }}>
        {pasos.slice(0, -1).map((_, k) => {
          const ya = y0 + k * paso + PASOS.radio + 8;
          const yb = y0 + (k + 1) * paso - PASOS.radio - 8;
          const largo = Math.max(1, yb - ya);
          const tSig = b[k + 1] ?? 0;
          const avance = lerp(f, tSig - 8, tSig, 0, 1, Easing.inOut(Easing.cubic));
          const d = generarConectorOrtogonal([cx, ya], [cx, yb], "vertical-primero");
          return (
            <g key={k} opacity={aparece}>
              <path d={d} stroke={alfa(C.texto, 0.18)} strokeWidth={2} strokeDasharray="5 7" fill="none" />
              <path d={d} stroke={C.acento} strokeWidth={4} strokeLinecap="round" fill="none" {...calcularDashOffset(avance, largo)} />
            </g>
          );
        })}
      </svg>

      {pasos.map((ps, k) => {
        const t = b[k] ?? 0;
        const cy = y0 + k * paso;
        const estado = f < t ? "pendiente" : k === vigente ? "vigente" : "hecho";
        const q = lerp(f, t, t + 10, 0, 1, Easing.out(Easing.cubic));
        const pulso = bump(f, t, 12);
        const anchoTxt = PASOS.w - PASOS.xTexto - 10;
        const tam = tamQueCabe(ps.texto, F.texto, pesoTxt, n <= 3 ? 46 : 42, anchoTxt, 28);
        const relleno = estado === "vigente" ? C.acento : "transparent";
        const borde = estado === "pendiente" ? alfa(C.texto, 0.25) : C.acento;
        const colorNum = estado === "vigente" ? C.acentoTexto : estado === "hecho" ? C.acento : alfa(C.texto, 0.35);
        return (
          <div key={k} style={{ position: "absolute", left: PASOS.x, width: PASOS.w, top: cy - PASOS.radio, height: PASOS.radio * 2 }}>
            {/* Nodo de estado con halo al activarse */}
            <div style={{ position: "absolute", left: cx - PASOS.radio, top: 0, width: PASOS.radio * 2, height: PASOS.radio * 2, opacity: aparece }}>
              {pulso > 0 && <div style={{ position: "absolute", inset: -14 * pulso, borderRadius: "50%", border: `2px solid ${alfa(C.acento, 0.5 * (1 - pulso))}` }} />}
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: relleno, border: `2.5px solid ${borde}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 24, color: colorNum, transform: `scale(${1 + 0.1 * pulso})` }}>
                {String(k + 1).padStart(2, "0")}
              </div>
            </div>
            {/* Texto del paso: aparece al enunciarse */}
            {f >= t && (
              <div style={{ position: "absolute", left: PASOS.xTexto, right: 0, top: PASOS.radio - 46, height: 92, display: "flex", alignItems: "center", opacity: q, transform: `translateX(${((1 - q) * 24).toFixed(2)}px)` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: F.mono, fontSize: 18, letterSpacing: "3px", color: estado === "vigente" ? C.acento : C.suave, marginBottom: 6, whiteSpace: "nowrap" }}>
                    {`PASO ${String(k + 1).padStart(2, "0")}`}
                    {ps.icono && <Icono nombre={ps.icono} tam={22} color={estado === "vigente" ? C.acento : C.suave} />}
                  </div>
                  <div style={{ fontFamily: F.texto, fontWeight: pesoTxt, fontSize: tam, lineHeight: 1.1, color: estado === "vigente" ? C.texto : alfa(C.texto, 0.75), whiteSpace: "nowrap" }}>{ps.texto}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const pasos: DefEscena = {
  C: Pasos,
  momentos: (p) => Math.max(1, Math.min(4, arr(p, "pasos").length)),
  sonidos: (p) => arr(p, "pasos").slice(0, 4).map((_, k) => [k, "pop", 0.3] as [number, string, number]),
  validar: (p) => [
    ...reglas(p, [["pasos", "lista", { minItems: 2, maxItems: 4 }]]),
    ...arr(p, "pasos").map(item).flatMap((it, k) => (it.texto.length > 34 ? [`paso ${k + 1} es demasiado largo (máximo 34 letras)`] : [])),
    ...iconos(arr(p, "pasos").map(item).map((it) => it.icono)),
  ],
};

// ================================================================== pregunta (test)
// Consola de test: pregunta editorial, opciones en filas abiertas con tecla monoespaciada y un
// arco de cuenta regresiva que se vacía entre la última opción y el revelado (el tiempo para pensar).
// En el revelado la correcta toma el acento y las demás se atenúan con un corte.
// Geometría: cabecera desde y = 250, pregunta en y ∈ [320, ~550]; con 4 opciones las filas terminan
// en y = 1006 (coordenadas de escena).
const PREG = { x: 100, w: 880, yPregunta: 320, yOpciones: 590, fila: 104, tecla: 56, radio: 30 };

const Pregunta: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const ok = useFuentes();
  const [b0, b1, b2] = b;
  const opciones = arr<string>(p, "opciones").slice(0, 4);
  const n = opciones.length;
  const correcta = num(p, "correcta", 0);
  const entra = lerp(f, b0, b0 + 12, 0, 1, Easing.out(Easing.cubic));
  const finOpciones = b1 + (n - 1) * 4 + 8;
  const restante = 1 - lerp(f, finOpciones, b2, 0, 1, Easing.linear);
  const revela = f >= b2;
  const segundos = Math.max(0, Math.ceil((b2 - f) / FPS));
  if (!ok) return null;
  const pesoTxt = String(pesoTexto(800));
  const largoArco = 2 * Math.PI * PREG.radio;

  return (
    <AbsoluteFill>
      {/* Cabecera: rótulo + cuenta regresiva */}
      <div style={{ position: "absolute", left: PREG.x, width: PREG.w, top: PREG.yPregunta - 70, height: 2 * PREG.radio + 8, display: "flex", alignItems: "center", opacity: entra }}>
        <span style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "3px", color: C.acento, whiteSpace: "nowrap" }}>{`PREGUNTA · ${n} OPCIONES`}</span>
        <div style={{ flex: 1, height: 1.5, margin: "0 20px", background: alfa(C.linea, 0.8) }} />
        <div style={{ position: "relative", width: PREG.radio * 2 + 8, height: PREG.radio * 2 + 8 }}>
          <svg width={PREG.radio * 2 + 8} height={PREG.radio * 2 + 8} style={{ overflow: "visible" }}>
            <circle cx={PREG.radio + 4} cy={PREG.radio + 4} r={PREG.radio} stroke={alfa(C.texto, 0.18)} strokeWidth={4} fill="none" />
            {f >= b1 && !revela && (
              <path d={generarArcoSvg(PREG.radio + 4, PREG.radio + 4, PREG.radio, 0, 359.99)} stroke={C.acento} strokeWidth={4} strokeLinecap="round" fill="none" {...calcularDashOffset(restante, largoArco)} />
            )}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 22, color: revela ? C.acento : C.suave }}>
            {revela ? "✓" : f >= b1 ? String(segundos) : "·"}
          </div>
        </div>
      </div>

      {/* Pregunta */}
      <div style={{ position: "absolute", left: PREG.x, width: PREG.w, top: PREG.yPregunta, fontFamily: F.titulo, fontSize: 56, lineHeight: 1.1, letterSpacing: -1, color: C.texto, opacity: entra, transform: `translateY(${((1 - entra) * 20).toFixed(2)}px)` }}>
        {txt(p, "pregunta")}
      </div>

      {/* Opciones */}
      {opciones.map((o, k) => {
        const t = b1 + k * 4;
        if (f < t) return null;
        const q = lerp(f, t, t + 9, 0, 1, Easing.out(Easing.cubic));
        const bien = k === correcta;
        const v = lerp(f, b2, b2 + 10, 0, 1, Easing.out(Easing.cubic));
        const xTexto = PREG.tecla + 28;
        const tam = tamQueCabe(String(o), F.texto, pesoTxt, 40, PREG.w - xTexto - 70, 28);
        const anchoTxt = measureText({ text: String(o), fontFamily: F.texto, fontWeight: pesoTxt, fontSize: tam, validateFontIsLoaded: false }).width;
        const resaltada = revela && bien;
        const descartada = revela && !bien;
        return (
          <div key={k} style={{ position: "absolute", left: PREG.x, width: PREG.w, top: PREG.yOpciones + k * PREG.fila, height: PREG.fila, display: "flex", alignItems: "center", opacity: q * (descartada ? 1 - 0.6 * v : 1), transform: `translateX(${((1 - q) * 30).toFixed(2)}px)` }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: 1.5, width: `${q * 100}%`, background: alfa(C.texto, 0.14) }} />
            {resaltada && <div style={{ position: "absolute", left: -18, top: 22, bottom: 22, width: 5, background: C.acento, transform: `scaleY(${v})` }} />}
            <div
              style={{
                width: PREG.tecla,
                height: PREG.tecla,
                flexShrink: 0,
                borderRadius: 8,
                border: `2px solid ${resaltada ? C.acento : alfa(C.texto, 0.35)}`,
                background: resaltada ? C.acento : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 26,
                color: resaltada ? C.acentoTexto : C.texto,
                transform: `scale(${resaltada ? 1 + 0.12 * bump(f, b2, 10) : 1})`,
              }}
            >
              {"ABCD"[k]}
            </div>
            <div style={{ position: "relative", marginLeft: 28, fontFamily: F.texto, fontWeight: pesoTxt, fontSize: tam, lineHeight: 1.1, color: resaltada ? C.acento : C.texto, whiteSpace: "nowrap" }}>
              {o}
              {descartada && (
                <svg width={anchoTxt + 12} height={6} style={{ position: "absolute", left: -6, top: "52%", overflow: "visible" }}>
                  <line x1={0} y1={3} x2={(anchoTxt + 12) * v} y2={3} stroke={alfa(C.texto, 0.7)} strokeWidth={3} strokeLinecap="round" />
                </svg>
              )}
            </div>
            {resaltada && (
              <svg viewBox="0 0 24 24" width={40} height={40} style={{ marginLeft: "auto", opacity: v }}>
                <path d="M5 12.5 L10 17 L19 7" stroke={C.acento} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" {...calcularDashOffset(v, 22)} />
              </svg>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const pregunta: DefEscena = {
  C: Pregunta,
  momentos: 3,
  sonidos: () => [
    [1, "pop", 0.3],
    [2, "exito", 0.28],
  ],
  validar: (p) => [
    ...reglas(p, [["pregunta", "texto", { max: 60 }], ["opciones", "lista", { minItems: 2, maxItems: 4 }], ["correcta", "numero", { opcional: true }]]),
    ...arr<string>(p, "opciones").flatMap((o, k) => (String(o).length > 28 ? [`opción ${k + 1} es demasiado larga (máximo 28 letras)`] : [])),
  ],
};

// ================================================================== barras
// Infografía con escala: retícula de guías horizontales con valores redondos, regla en el eje
// vertical y barras que crecen sobre una base firme. La barra destacada es la única en acento.
// Geometría: título en y ≈ 260, base en y = 930 y etiquetas hasta y ≈ 990 (coordenadas de escena).
const BARRAS = { x: 100, w: 880, eje: 92, base: 930, altoMax: 440, yTitulo: 256 };

/** Paso "redondo" (1, 2, 2,5 o 5 × 10^k) para dividir la escala en unas 4 guías. */
const pasoEscala = (max: number): number => {
  const bruto = Math.max(1e-9, max / 4);
  const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
  const r = bruto / pot;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * pot;
};

const Barras: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const barras = arr<Record<string, unknown>>(p, "barras").slice(0, 5);
  const max = Math.max(1, ...barras.map((x) => num(x, "valor")));
  const destacar = num(p, "destacar", -1);
  const unidad = txt(p, "unidad");
  const titulo = txt(p, "titulo");
  const n = barras.length;
  const paso = pasoEscala(max);
  const tope = Math.ceil(max / paso) * paso;
  const guias = Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso);
  const yDe = (v: number) => BARRAS.base - BARRAS.altoMax * (v / tope);
  const x0 = BARRAS.x + BARRAS.eje;
  const anchoArea = BARRAS.w - BARRAS.eje;
  const celda = anchoArea / n;
  const ancho = Math.min(124, celda - 44);
  const reticula = lerp(f, 0, 16, 0, 1, Easing.out(Easing.cubic));
  const decimales = paso < 1 ? 1 : 0;
  const marcas = generarMarcasRegla(yDe(tope), BARRAS.base, BARRAS.altoMax / (guias.length - 1) / 5, BARRAS.altoMax / (guias.length - 1));

  return (
    <AbsoluteFill>
      {titulo && (
        <div style={{ position: "absolute", left: BARRAS.x, width: BARRAS.w, top: BARRAS.yTitulo, opacity: reticula }}>
          <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "3px", color: C.acento, marginBottom: 10, whiteSpace: "nowrap" }}>{unidad ? `UNIDAD · ${unidad}` : "COMPARATIVA"}</div>
          <div style={{ fontFamily: F.titulo, fontSize: 56, lineHeight: 1, letterSpacing: -1, color: C.texto, whiteSpace: "nowrap" }}>{titulo}</div>
        </div>
      )}

      {/* Retícula: guías con valor de escala + regla en el eje vertical */}
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible", pointerEvents: "none" }}>
        {guias.map((g, i) => {
          const y = yDe(g);
          const largo = BARRAS.x + BARRAS.w - x0;
          return (
            <line key={i} x1={x0} y1={y} x2={x0 + largo} y2={y} stroke={alfa(C.texto, i === 0 ? 0.5 : 0.12)} strokeWidth={i === 0 ? 3 : 1.5} {...(i === 0 ? calcularDashOffset(reticula, largo) : { strokeDasharray: "6 8" })} opacity={i === 0 ? 1 : reticula} />
          );
        })}
        {marcas.map((m, i) => (
          <line key={`m${i}`} x1={x0 - (m.esMayor ? 16 : 8)} x2={x0} y1={m.posicion} y2={m.posicion} stroke={alfa(C.texto, m.esMayor ? 0.5 : 0.22)} strokeWidth={m.esMayor ? 2 : 1.2} opacity={reticula} />
        ))}
        <line x1={x0} y1={yDe(tope)} x2={x0} y2={BARRAS.base} stroke={alfa(C.texto, 0.3)} strokeWidth={1.5} opacity={reticula} />
      </svg>
      {guias.map((g, i) => (
        <div key={i} style={{ position: "absolute", left: BARRAS.x - 10, width: BARRAS.eje - 14, top: yDe(g) - 12, textAlign: "right", fontFamily: F.mono, fontSize: 19, color: C.suave, opacity: reticula, whiteSpace: "nowrap" }}>
          {numeroES(g, decimales)}
        </div>
      ))}

      {barras.map((x, k) => {
        const t = b[k] ?? 0;
        const v = num(x, "valor");
        const crece = lerp(f, t, t + 14, 0, 1, Easing.out(Easing.cubic));
        const h = BARRAS.altoMax * (v / tope) * crece;
        const cx = x0 + celda * (k + 0.5);
        const esDest = k === destacar;
        const etiqueta = lerp(f, t + 6, t + 12, 0, 1);
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: cx - ancho / 2, top: BARRAS.base - h, width: ancho, height: h, background: esDest ? C.acento : alfa(C.texto, 0.16), borderTop: h > 0 ? `3px solid ${esDest ? C.acento : alfa(C.texto, 0.7)}` : undefined, boxSizing: "border-box", boxShadow: esDest ? `0 0 28px ${alfa(C.acento, 0.35)}` : undefined }} />
            {f >= t + 6 && (
              <div style={{ position: "absolute", left: cx - 100, width: 200, top: BARRAS.base - h - 62, textAlign: "center", fontFamily: F.titulo, fontSize: 44, lineHeight: 1, color: esDest ? C.acento : C.texto, opacity: etiqueta, transform: `translateY(${((1 - etiqueta) * 10).toFixed(2)}px)`, whiteSpace: "nowrap" }}>
                {numeroES(v, Number.isInteger(v) ? 0 : 1)}
                {unidad && <span style={{ fontSize: 26, marginLeft: 4, color: esDest ? C.acento : C.suave }}>{unidad}</span>}
              </div>
            )}
            <div style={{ position: "absolute", left: cx - celda / 2, width: celda, top: BARRAS.base + 18, textAlign: "center", ...T(800), fontSize: n >= 5 ? 22 : 26, color: esDest ? C.acento : C.texto, opacity: f >= t ? 1 : 0.4, whiteSpace: "nowrap" }}>{txt(x, "etiqueta")}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export const barras: DefEscena = {
  C: Barras,
  alInicio: (p) => !!txt(p, "titulo"),
  momentos: (p) => Math.max(1, Math.min(5, arr(p, "barras").length)),
  sonidos: (p) => arr(p, "barras").slice(0, 5).map((_, k) => [k, "tic", 0.3] as [number, string, number]),
  validar: (p) => {
    const out = reglas(p, [["barras", "lista", { minItems: 2, maxItems: 5 }], ["titulo", "texto", { opcional: true, max: 26 }], ["unidad", "texto", { opcional: true, max: 4 }]]);
    arr<Record<string, unknown>>(p, "barras").forEach((x, k) => out.push(...reglas(x, [["etiqueta", "texto", { max: 12 }], ["valor", "numero"]]).map((s) => `barra ${k + 1}: ${s}`)));
    return out;
  },
};

// ================================================================== tachado ("No es X: es Y")
const CARTA = { x: 100, y: 310, w: 880, h: 560 };

const Tachado: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const ok = useFuentes();
  const [b0, b1] = b;
  const imagen = txt(p, "imagen");
  const icono = txt(p, "icono");
  const codigo = txt(p, "modo") === "codigo";
  const antes = txt(p, "antes");
  const despues = txt(p, "despues");
  const entra = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 130, mass: 0.8 } });

  // Sacudida cinemática de impacto en el fotograma b0 (damped mechanical micro-jitter)
  const deltaB0 = f - b0;
  const temblor = f >= b0 && deltaB0 < 9 ? Math.sin(deltaB0 * 2.8) * Math.exp(-deltaB0 * 0.45) * 8 : 0;

  const sube = lerp(f, b1 - 2, b1 + 10, 0, 1, Easing.inOut(Easing.cubic));
  const nueva = usePop(b1, { damping: 11, stiffness: 190, mass: 0.6, overshootClamping: false });

  if (!ok) return null;
  const peso = String(ESTILO.fuentes.titulo.peso);
  const tamA = tamQueCabe(antes, F.titulo, peso, 84 * ESTILO.escalaTitulo, CARTA.w - 180);
  const anchoA = measureText({ text: antes, fontFamily: F.titulo, fontWeight: peso, fontSize: tamA, validateFontIsLoaded: false }).width;
  const textoN = codigo ? `</> ${despues}` : despues;
  const tamN = codigo ? tamQueCabe(textoN, F.mono, "700", 60, CARTA.w - 200) : tamQueCabe(despues, F.titulo, "900", 98 * ESTILO.escalaTitulo, CARTA.w - 160);
  const conVisual = !!(imagen || icono);
  const yAntes = CARTA.y + (conVisual ? 310 : 210);
  const yNueva = CARTA.y + (conVisual ? 440 : 380);
  const bajada = (1 - entra) * 80;
  const visible = Math.min(1, entra * 1.6);

  const esquinas = generarEsquinasReticula(CARTA.x, CARTA.y + bajada, CARTA.w, CARTA.h, 24);
  const progresoTachon = lerp(f, b0, b0 + 5, 0, 1, Easing.out(Easing.cubic));

  return (
    <AbsoluteFill>
      {/* Contenedor editorial estilizado con esquinas técnicas */}
      <div
        style={{
          position: "absolute",
          left: CARTA.x,
          top: CARTA.y + bajada,
          width: CARTA.w,
          height: CARTA.h,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: SOMBRA,
          border: `1.5px solid ${C.linea}`,
          background: C.tarjeta,
          opacity: visible,
          transform: `translateX(${temblor.toFixed(2)}px)`,
        }}
      >
        {/* Esquinas técnicas */}
        <svg
          viewBox={`${CARTA.x} ${CARTA.y + bajada} ${CARTA.w} ${CARTA.h}`}
          style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <path d={esquinas.topIzq} stroke={alfa(C.acento, 0.5)} strokeWidth={2} fill="none" />
          <path d={esquinas.topDer} stroke={alfa(C.acento, 0.5)} strokeWidth={2} fill="none" />
          <path d={esquinas.botIzq} stroke={alfa(C.acento, 0.5)} strokeWidth={2} fill="none" />
          <path d={esquinas.botDer} stroke={alfa(C.acento, 0.5)} strokeWidth={2} fill="none" />
        </svg>

        {imagen && (
          <Img
            src={staticFile(imagen)}
            style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 210, objectFit: "cover" }}
          />
        )}
        {!imagen && icono && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 36, display: "flex", justifyContent: "center" }}>
            <Icono nombre={icono} tam={120} color={alfa(C.acento, 0.7)} grosor={1.6} />
          </div>
        )}
      </div>

      {/* Lo de antes: Descarte geométrico con línea de corte neta y retroceso en profundidad */}
      <div
        style={{
          position: "absolute",
          left: CARTA.x,
          width: CARTA.w,
          top: yAntes - tamA * 0.5 - sube * tamA * 0.85 + bajada,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: visible * (1 - 0.65 * sube),
          transform: `translateX(${temblor.toFixed(2)}px) scale(${1 - 0.28 * sube})`,
        }}
      >
        <span
          style={{
            fontFamily: F.texto,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: alfa(C.tarjetaTexto, 0.45),
            marginBottom: 6,
          }}
        >
          CONCEPCIÓN ANTERIOR
        </span>
        <div
          style={{
            position: "relative",
            fontFamily: F.titulo,
            fontWeight: ESTILO.fuentes.titulo.peso,
            fontSize: tamA,
            lineHeight: 1.12,
            color: C.tarjetaTexto,
            whiteSpace: "nowrap",
          }}
        >
          {antes}
          {/* Corte geométrico cinemático */}
          {f >= b0 && (
            <svg
              style={{
                position: "absolute",
                left: -16,
                top: "50%",
                width: anchoA + 32,
                height: 18,
                transform: "translateY(-50%) rotate(-3deg)",
                overflow: "visible",
                pointerEvents: "none",
              }}
            >
              <line
                x1={0}
                y1={9}
                x2={(anchoA + 32) * progresoTachon}
                y2={9}
                stroke="#EF4444"
                strokeWidth={Math.max(6, tamA * 0.09)}
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Lo nuevo: Revelado en tipografía ultra-bold con acento vibrante */}
      {nueva > 0 && (
        <div
          style={{
            position: "absolute",
            left: CARTA.x,
            width: CARTA.w,
            top: yNueva - tamN * 0.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${0.9 + 0.1 * nueva}) translateY(${(1 - nueva) * 20}px)`,
            opacity: Math.min(1, nueva * 2),
          }}
        >
          <span
            style={{
              fontFamily: F.texto,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: C.acento,
              marginBottom: 8,
            }}
          >
            NUEVO ESTÁNDAR
          </span>
          {codigo ? (
            <div
              style={{
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: tamN,
                lineHeight: 1.2,
                background: C.oscuro,
                color: C.acento,
                padding: "14px 34px",
                borderRadius: 20,
                border: `1.5px solid ${alfa(C.acento, 0.4)}`,
                whiteSpace: "nowrap",
                boxShadow: `0 12px 28px ${alfa(C.acento, 0.2)}`,
              }}
            >
              {textoN}
            </div>
          ) : (
            <div
              style={{
                fontFamily: F.titulo,
                fontWeight: 900,
                fontSize: tamN,
                lineHeight: 1.1,
                color: C.acento,
                whiteSpace: "nowrap",
                textShadow: `0 4px 20px ${alfa(C.acento, 0.35)}`,
              }}
            >
              {despues}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const tachado: DefEscena = {
  C: Tachado,
  alInicio: () => true,
  momentos: 2,
  sonidos: () => [
    [0, "negacion", 0.22],
    [1, "swoosh", 0.3],
  ],
  validar: (p) => [
    ...reglas(p, [["antes", "texto", { max: 22 }], ["despues", "texto", { max: 18 }], ["imagen", "imagen", { opcional: true }]]),
    ...(["texto", "etiqueta", "codigo", ""].includes(txt(p, "modo")) ? [] : [`«modo» tiene que ser "texto" o "codigo"`]),
    ...iconos([txt(p, "icono") || undefined]),
  ],
};

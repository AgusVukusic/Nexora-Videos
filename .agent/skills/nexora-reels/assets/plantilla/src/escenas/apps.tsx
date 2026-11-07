// Escenas con apps dibujadas para Nexora Motion Reels:
// "chat" (consola: alguien escribe una idea y la IA responde con código y un resultado),
// "editor" (zoom hacia atrás que revela el propio reel en una mesa de edición con su línea de tiempo) y
// "movil" (dispositivo con su pantalla y, al lado, contador y pegatina).
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, PLAN } from "../motor/actual";
import { F, alfa } from "../motor/estilos";
import { pesoTexto } from "../motor/fuentes";
import { bump, lerp, numeroES } from "../motor/anim";
import { Icono } from "../piezas/basicas";
import { CodigoStream } from "../piezas/ventanas";
import { generarMarcasRegla } from "../motor/trazos";
import type { DefEscena, PropsEscena } from "../tipos";
import { arr, iconos, num, obj, reglas, txt } from "./util";

// ================================================================== chat
// Consola técnica: cabecera de sesión, línea de prompt que se teclea, conector hacia el bloque de
// respuesta (código que se escribe y se desplaza solo en un panel oscuro) y una fila de resultado
// alineada (sin móvil flotante). La píldora final es una línea de estado.
// Si la frase anterior también es "chat", la consola ya está en pantalla (sin entrada).
// Geometría (coordenadas de escena): cabecera y = 260, código y ∈ [560, 840], resultado y ∈ [870, 960],
// estado hasta y ≈ 1020.
const CHAT = { x: 100, w: 880, yCab: 260, yPrompt: 330, yResp: 500, yCodigo: 560, hCodigo: 280, yResultado: 870, tamCodigo: 21, lineas: 11 };

const Chat: React.FC<PropsEscena> = ({ p, b, i }) => {
  const f = useCurrentFrame();
  const [bEscribe, bEnvia, bResponde, bMovil, bPildora] = b;
  const mensaje = txt(p, "mensaje");
  const titulo = txt(p, "titulo", "Claude");
  const saludo = txt(p, "saludo", "¿Qué hacemos hoy?");
  const respuesta = txt(p, "respuesta", "Escribiendo el reel");
  const archivo = txt(p, "archivo", "reel.tsx");
  const movil = obj(p, "movil");
  const tituloMovil = txt(movil, "titulo");
  const pildora = txt(p, "pildora");
  const anotacion = txt(p, "anotacion");
  const anterior = i > 0 ? PLAN.frases[i - 1]?.escena?.tipo : "";
  const entra = anterior === "chat" ? 1 : lerp(f, 0, 14, 0, 1, Easing.out(Easing.cubic));
  const enviado = mensaje ? bEnvia : 1e9;
  const tecleo = Math.round(lerp(f, bEscribe, Math.max(bEscribe + 6, bEnvia - 4), 0, mensaje.length, Easing.linear));
  const escribiendo = !!mensaje && f >= bEscribe && f < enviado;
  const cursor = Math.floor(f / 8) % 2 === 0;
  const env = lerp(f, enviado, enviado + 8, 0, 1);
  const enlace = mensaje ? lerp(f, bResponde - 8, bResponde, 0, 1, Easing.inOut(Easing.cubic)) : 0;
  const resp = mensaje ? lerp(f, bResponde - 2, bResponde + 8, 0, 1) : 0;
  const hastaCodigo = Math.max(bResponde + 20, (bPildora ?? bResponde + 40) - 4);
  // Desplazamiento del panel: la última línea escrita queda siempre visible.
  const altoLinea = CHAT.tamCodigo * 1.55;
  const lineasVisibles = (CHAT.hCodigo - 36) / altoLinea;
  const progreso = lerp(f, bResponde + 2, hastaCodigo, 0, 1, Easing.linear);
  const scroll = Math.max(0, progreso * CHAT.lineas - lineasVisibles) * altoLinea;
  const res = lerp(f, bMovil, bMovil + 10, 0, 1, Easing.out(Easing.cubic));
  const est = lerp(f, bPildora, bPildora + 8, 0, 1, Easing.out(Easing.cubic));
  const puntos = ".".repeat(1 + (Math.floor(f / 8) % 3));
  const yEstado = tituloMovil ? CHAT.yResultado + 110 : CHAT.yResultado;
  // Sin mensaje solo hay cabecera y prompt con el saludo: se centran verticalmente.
  const centrado = mensaje ? 0 : 220;

  return (
    <AbsoluteFill style={{ opacity: entra, transform: `translateY(${((1 - entra) * 30 + centrado).toFixed(2)}px)` }}>
      {/* Cabecera de sesión */}
      <div style={{ position: "absolute", left: CHAT.x, width: CHAT.w, top: CHAT.yCab, display: "flex", alignItems: "center", gap: 16, fontFamily: F.mono, fontSize: 20, letterSpacing: "3px", whiteSpace: "nowrap" }}>
        <span style={{ color: C.texto }}>{`SESIÓN · ${titulo.toUpperCase()}`}</span>
        <div style={{ flex: 1, height: 1.5, background: alfa(C.linea, 0.8) }} />
        <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.acento }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: C.acento, display: "inline-block" }} />
          EN LÍNEA
        </span>
      </div>

      {/* Línea de prompt */}
      <div style={{ position: "absolute", left: CHAT.x, width: CHAT.w, top: CHAT.yPrompt }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F.mono, fontSize: 18, letterSpacing: "3px", color: C.suave, whiteSpace: "nowrap" }}>
          <span>&gt; PROMPT</span>
          {anotacion && f >= bEscribe + 8 && f < enviado + 12 && (
            <span style={{ color: C.acento, opacity: lerp(f, bEscribe + 8, bEscribe + 14, 0, 1) * (1 - lerp(f, enviado, enviado + 12, 0, 1)) }}>{`← ${anotacion.toUpperCase()}`}</span>
          )}
          {f >= enviado && <span style={{ marginLeft: "auto", color: C.acento, opacity: env }}>↵ ENVIADO</span>}
        </div>
        <div style={{ marginTop: 14, paddingBottom: 14, borderBottom: `2px solid ${escribiendo ? C.acento : alfa(C.texto, 0.25)}`, fontFamily: F.texto, fontWeight: pesoTexto(600), fontSize: 36, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden" }}>
          {mensaje && f >= bEscribe ? (
            <span style={{ color: C.texto }}>{mensaje.slice(0, tecleo)}</span>
          ) : (
            <span style={{ color: alfa(C.texto, 0.4), textShadow: !mensaje ? `0 0 ${18 * bump(f, bEscribe, 16)}px ${alfa(C.acento, 0.8)}` : undefined }}>{saludo}</span>
          )}
          {(escribiendo || !mensaje) && <span style={{ color: C.acento, opacity: cursor ? 1 : 0 }}>▍</span>}
        </div>
      </div>

      {/* Conector prompt → respuesta */}
      {enlace > 0 && (
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible", pointerEvents: "none" }}>
          <circle cx={CHAT.x + 8} cy={CHAT.yPrompt + 112} r={5} fill={C.acento} />
          <line x1={CHAT.x + 8} y1={CHAT.yPrompt + 112} x2={CHAT.x + 8} y2={CHAT.yPrompt + 112 + (CHAT.yResp + 14 - CHAT.yPrompt - 112) * enlace} stroke={C.acento} strokeWidth={2} strokeDasharray="5 5" />
        </svg>
      )}

      {/* Bloque de respuesta */}
      {resp > 0 && (
        <div style={{ position: "absolute", left: CHAT.x, width: CHAT.w, top: CHAT.yResp, opacity: resp }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 26, fontFamily: F.texto, fontWeight: pesoTexto(600), fontSize: 26, color: C.texto, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "3px", color: C.acento }}>{titulo.toUpperCase()}</span>
            <span>{respuesta}</span>
            <span style={{ fontFamily: F.mono, fontSize: 22, color: C.acento }}>{archivo}</span>
            <span style={{ fontFamily: F.mono, color: C.suave, width: 40 }}>{f < hastaCodigo ? puntos : ""}</span>
          </div>
          {/* Panel de código: siempre oscuro (el resaltado de CodigoStream está pensado para fondo oscuro) */}
          <div style={{ position: "absolute", left: 0, width: CHAT.w, top: CHAT.yCodigo - CHAT.yResp, height: CHAT.hCodigo, borderRadius: 10, background: "#0E1220", border: `1.5px solid ${alfa(C.texto, 0.2)}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 22, right: 22, top: 18 - scroll }}>
              <CodigoStream desde={bResponde + 2} hasta={hastaCodigo} tam={CHAT.tamCodigo} titulo={tituloMovil || "Mi reel"} />
            </div>
          </div>
        </div>
      )}

      {/* Fila de resultado (antes, un móvil flotante) */}
      {tituloMovil && f >= bMovil && (
        <div style={{ position: "absolute", left: CHAT.x, width: CHAT.w, top: CHAT.yResultado, height: 90, display: "flex", alignItems: "center", gap: 22, opacity: res, transform: `translateY(${((1 - res) * 14).toFixed(2)}px)` }}>
          <div style={{ width: 84, height: 84, borderRadius: 20, flexShrink: 0, background: alfa(C.acento, 0.14), border: `1.5px solid ${alfa(C.acento, 0.4)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icono nombre={txt(movil, "icono") || "sparkles"} tam={46} color={C.acento} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.titulo, fontSize: 36, lineHeight: 1.05, color: C.texto, whiteSpace: "nowrap" }}>{tituloMovil}</div>
            {txt(movil, "subtitulo") && <div style={{ fontFamily: F.texto, fontWeight: pesoTexto(600), fontSize: 24, color: C.suave, marginTop: 6, whiteSpace: "nowrap" }}>{txt(movil, "subtitulo")}</div>}
          </div>
          <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: "2px", color: C.acento, border: `1.5px solid ${alfa(C.acento, 0.7)}`, padding: "8px 14px", borderRadius: 6, whiteSpace: "nowrap" }}>✓ LISTO</div>
        </div>
      )}

      {/* Línea de estado (antes, una píldora) */}
      {pildora && f >= bPildora && (
        <div style={{ position: "absolute", left: CHAT.x, width: CHAT.w, top: yEstado, display: "flex", alignItems: "center", gap: 14, opacity: est, fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: "1px", color: C.acentoTexto }}>
          <span style={{ background: C.acento, padding: "8px 16px", borderRadius: 6, whiteSpace: "nowrap", transform: `scale(${0.9 + 0.1 * est})`, transformOrigin: "0% 50%" }}>{`▸ ${pildora}`}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const chat: DefEscena = {
  C: Chat,
  momentos: 5,
  sonidos: (p) => [
    ...(txt(p, "mensaje") ? ([[0, "tecla", 0.3], [1, "pop", 0.32]] as [number, string, number][]) : []),
    ...(txt(obj(p, "movil"), "titulo") ? ([[3, "pop", 0.35]] as [number, string, number][]) : []),
    ...(txt(p, "pildora") ? ([[4, "ding", 0.26]] as [number, string, number][]) : []),
  ],
  validar: (p) => [
    ...reglas(p, [
      ["mensaje", "texto", { opcional: true, max: 38 }],
      ["titulo", "texto", { opcional: true, max: 20 }],
      ["saludo", "texto", { opcional: true, max: 28 }],
      ["respuesta", "texto", { opcional: true, max: 26 }],
      ["pildora", "texto", { opcional: true, max: 34 }],
      ["anotacion", "texto", { opcional: true, max: 16 }],
      ["movil", "objeto", { opcional: true }],
    ]),
    ...iconos([txt(obj(p, "movil"), "icono") || undefined]),
  ],
};

// ================================================================== editor
// Mesa de trabajo técnica: marco con reglas graduadas, cabecera de archivo, vista previa 9:16 del
// propio reel y cuatro pistas (subtítulos, escenas, voz, sonidos) con cabezal de reproducción.
// Se conserva la idea original: zoom hacia atrás que revela el editor. Las "palabras" y los "sonidos"
// encajan como clips dentro de sus pistas (sin chips volando ni rotaciones).
// Si la frase anterior también es "editor", la mesa ya está en pantalla (sin zoom).
// Geometría: la mesa ocupa y ∈ [250, 1030] (coordenadas de escena).
const MESA = { x: 100, y: 250, w: 880, h: 780, regla: 26, cab: 56, xPistas: 190, margenDer: 24 };
const PISTAS_MESA = ["SUBTÍTULOS", "ESCENAS", "VOZ", "SONIDOS"];

const geometriaMesa = () => {
  const yVista = MESA.regla + MESA.cab + 14;
  const altoVista = 380;
  const anchoVista = Math.round(altoVista * 0.5625);
  const yPistas = yVista + altoVista + 28;
  const altoPista = (MESA.h - yPistas - 14) / PISTAS_MESA.length;
  const anchoPistas = MESA.w - MESA.xPistas - MESA.margenDer;
  return { yVista, altoVista, anchoVista, yPistas, altoPista, anchoPistas };
};

/** Clip de pista que cae en su lugar (palabras y sonidos). */
const ClipPista: React.FC<{ texto: string; desde: number; x: number; y: number; h: number; acento?: boolean }> = ({ texto, desde, x, y, h, acento = true }) => {
  const f = useCurrentFrame();
  const q = lerp(f, desde, desde + 8, 0, 1, Easing.out(Easing.cubic));
  if (f < desde) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + h * 0.18 - (1 - q) * 30,
        height: h * 0.64,
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        borderRadius: 4,
        background: acento ? C.acento : alfa(C.texto, 0.85),
        color: acento ? C.acentoTexto : C.fondo,
        fontFamily: F.mono,
        fontWeight: 700,
        fontSize: 17,
        whiteSpace: "nowrap",
        opacity: q,
      }}
    >
      {texto}
    </div>
  );
};

const MesaEditor: React.FC<{ archivo: string; cabezal: number; vibra: number; children?: React.ReactNode }> = ({ archivo, cabezal, vibra, children }) => {
  const g = geometriaMesa();
  const marcasH = generarMarcasRegla(MESA.regla, MESA.w, 22, 110);
  const marcasV = generarMarcasRegla(MESA.regla, MESA.h, 22, 110);
  const xVista = (MESA.w - g.anchoVista) / 2;
  return (
    <div style={{ position: "relative", width: MESA.w, height: MESA.h, border: `1.5px solid ${alfa(C.texto, 0.3)}`, borderRadius: 6, background: alfa(C.texto, 0.03) }}>
      {/* Reglas graduadas (superior e izquierda) */}
      <svg width={MESA.w} height={MESA.h} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <line x1={0} y1={MESA.regla} x2={MESA.w} y2={MESA.regla} stroke={alfa(C.texto, 0.25)} strokeWidth={1} />
        <line x1={MESA.regla} y1={0} x2={MESA.regla} y2={MESA.h} stroke={alfa(C.texto, 0.25)} strokeWidth={1} />
        {marcasH.map((m, k) => (
          <line key={`h${k}`} x1={m.posicion} y1={MESA.regla} x2={m.posicion} y2={MESA.regla - (m.esMayor ? 14 : 7)} stroke={alfa(C.texto, m.esMayor ? 0.5 : 0.25)} strokeWidth={1.2} />
        ))}
        {marcasV.map((m, k) => (
          <line key={`v${k}`} x1={MESA.regla} y1={m.posicion} x2={MESA.regla - (m.esMayor ? 14 : 7)} y2={m.posicion} stroke={alfa(C.texto, m.esMayor ? 0.5 : 0.25)} strokeWidth={1.2} />
        ))}
      </svg>
      {/* Cabecera de archivo */}
      <div style={{ position: "absolute", left: MESA.regla + 18, right: 18, top: MESA.regla, height: MESA.cab, display: "flex", alignItems: "center", gap: 14, fontFamily: F.mono, fontSize: 19, letterSpacing: "1px", borderBottom: `1.5px solid ${alfa(C.texto, 0.18)}` }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: C.acento, display: "inline-block" }} />
        <span style={{ color: C.texto }}>{archivo}</span>
        <span style={{ marginLeft: "auto", color: C.suave }}>1080×1920 · 30 FPS</span>
      </div>
      {/* Vista previa 9:16 del propio reel */}
      <div style={{ position: "absolute", left: xVista, top: g.yVista, width: g.anchoVista, height: g.altoVista, borderRadius: 6, overflow: "hidden", background: C.fondo, border: `1.5px solid ${alfa(C.texto, 0.35)}` }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.04 * vibra})` }}>
          <div style={{ position: "absolute", left: 16, right: 16, top: "18%", fontFamily: F.titulo, fontSize: 22, lineHeight: 1.1, color: C.texto }}>{PLAN.titulo}</div>
          <div style={{ position: "absolute", left: 16, top: "18%", marginTop: 62, width: 46, height: 4, background: C.acento }} />
          <div style={{ position: "absolute", left: 16, right: 16, top: "48%", height: 70, borderRadius: 4, background: alfa(C.acento, 0.14), border: `1px solid ${alfa(C.acento, 0.4)}` }} />
          <div style={{ position: "absolute", left: 30, right: 30, bottom: "14%", height: 18, borderRadius: 3, background: alfa(C.texto, 0.8) }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: xVista + g.anchoVista + 16, top: g.yVista, fontFamily: F.mono, fontSize: 16, lineHeight: 1.6, color: C.suave, whiteSpace: "pre" }}>
        {"VISTA PREVIA\n9:16"}
      </div>
      {/* Pistas */}
      {PISTAS_MESA.map((nombre, k) => (
        <div key={nombre} style={{ position: "absolute", left: MESA.regla, right: 0, top: g.yPistas + k * g.altoPista, height: g.altoPista, borderTop: `1px solid ${alfa(C.texto, 0.15)}` }}>
          <div style={{ position: "absolute", left: 14, top: g.altoPista / 2 - 10, fontFamily: F.mono, fontSize: 16, letterSpacing: "1px", color: C.suave }}>{nombre}</div>
          <PistaMesa tipo={k} x={MESA.xPistas - MESA.regla} w={g.anchoPistas} h={g.altoPista} />
        </div>
      ))}
      {/* Cabezal de reproducción */}
      <div style={{ position: "absolute", left: MESA.xPistas + g.anchoPistas * cabezal, top: g.yPistas - 14, bottom: 14, width: 2, background: C.acento }}>
        <div style={{ position: "absolute", left: -7, top: -2, width: 16, height: 12, background: C.acento, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
      </div>
      {children}
    </div>
  );
};

/** Contenido decorativo (determinista) de cada pista. */
const PistaMesa: React.FC<{ tipo: number; x: number; w: number; h: number }> = ({ tipo, x, w, h }) => {
  if (tipo === 2) {
    const n = 70;
    return (
      <>
        {Array.from({ length: n }).map((_, k) => {
          const a = (0.25 + 0.7 * Math.abs(Math.sin(k * 0.7) * Math.cos(k * 0.23))) * h * 0.7;
          return <div key={k} style={{ position: "absolute", left: x + (k / n) * w, top: (h - a) / 2, width: (w / n) * 0.5, height: a, background: alfa(C.acento, 0.6) }} />;
        })}
      </>
    );
  }
  const cortes = tipo === 1 ? [0, 0.14, 0.29, 0.38, 0.47, 0.58, 0.65, 0.76, 0.87, 1] : [0, 0.11, 0.24, 0.36, 0.5, 0.63, 0.77, 0.9, 1];
  if (tipo === 3) {
    return (
      <>
        {[0.06, 0.2, 0.44, 0.6, 0.71, 0.9].map((q, k) => (
          <div key={k} style={{ position: "absolute", left: x + q * w, top: h / 2 - 6, width: 12, height: 12, transform: "rotate(45deg)", background: alfa(C.texto, 0.4) }} />
        ))}
      </>
    );
  }
  return (
    <>
      {cortes.slice(0, -1).map((c, k) => (
        <div key={k} style={{ position: "absolute", left: x + c * w + 2, top: h * 0.22, width: (cortes[k + 1] - c) * w - 4, height: h * 0.56, borderRadius: 3, background: alfa(C.texto, tipo === 1 ? (k % 2 ? 0.3 : 0.18) : 0.1), border: tipo === 0 ? `1px solid ${alfa(C.texto, 0.25)}` : undefined }} />
      ))}
    </>
  );
};

const EditorEscena: React.FC<PropsEscena> = ({ p, b, i }) => {
  const f = useCurrentFrame();
  const [bZoom, bHecho, bPalabras, bSonidos] = b;
  const g = geometriaMesa();
  const anterior = i > 0 ? PLAN.frases[i - 1]?.escena?.tipo : "";
  const zoom =
    anterior === "editor"
      ? 1
      : interpolate(f, [bZoom, bZoom + 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });
  const escala = 3.6 + (1 - 3.6) * zoom;
  const desenfoque = Math.sin(Math.PI * zoom) * 5;
  const cab = Math.min(0.95, 0.15 + 0.003 * f);
  const hecho = txt(p, "hecho", "hecho con código");
  const palabras = arr<string>(p, "palabras").slice(0, 4);
  const sonidos = arr<string>(p, "sonidos").slice(0, 3);
  const vibra = bump(f, bPalabras + 10, 10);
  const sello = lerp(f, bHecho, bHecho + 8, 0, 1, Easing.out(Easing.back(1.4)));
  // Origen del zoom: el centro de la vista previa, para que el reel "se aleje" y revele la mesa.
  const origen = `${MESA.w / 2}px ${g.yVista + g.altoVista / 2}px`;
  const yPista = (k: number) => g.yPistas + k * g.altoPista;
  const xPista = (q: number) => MESA.xPistas + q * g.anchoPistas;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, filter: desenfoque > 0.3 ? `blur(${desenfoque.toFixed(2)}px)` : undefined }}>
        <div style={{ position: "absolute", left: MESA.x, top: MESA.y, transform: `scale(${escala})`, transformOrigin: origen }}>
          <MesaEditor archivo={txt(p, "archivo", "este_reel.tsx")} cabezal={cab} vibra={vibra}>
            {palabras.map((w, k) => (
              <ClipPista key={`p${k}`} texto={w} desde={bPalabras + k * 3} x={xPista(0.04 + k * 0.24)} y={yPista(0)} h={g.altoPista} />
            ))}
            {sonidos.map((s, k) => (
              <ClipPista key={`s${k}`} texto={`♪ ${s}`} desde={bSonidos + k * 8} x={xPista(0.1 + k * 0.3)} y={yPista(3)} h={g.altoPista} acento={false} />
            ))}
            {f >= bHecho && (
              <div style={{ position: "absolute", left: MESA.w / 2, top: g.yVista + g.altoVista - 24, transform: `translate(-50%, 0) scale(${(0.85 + 0.15 * sello).toFixed(3)})`, opacity: Math.min(1, sello * 1.5), fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: "2px", color: C.acentoTexto, background: C.acento, padding: "8px 16px", borderRadius: 4, whiteSpace: "nowrap" }}>
                {`✓ ${hecho.toUpperCase()}`}
              </div>
            )}
          </MesaEditor>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const editor: DefEscena = {
  C: EditorEscena,
  momentos: 4,
  sonidos: (p) => [
    [0, "whoosh", 0.3],
    [1, "exito", 0.26],
    ...(arr(p, "sonidos").length ? ([[3, "pop", 0.35]] as [number, string, number][]) : []),
  ],
  validar: (p) =>
    reglas(p, [
      ["hecho", "texto", { opcional: true, max: 24 }],
      ["archivo", "texto", { opcional: true, max: 24 }],
      ["palabras", "lista", { opcional: true, maxItems: 4 }],
      ["sonidos", "lista", { opcional: true, maxItems: 3 }],
    ]),
};

// ================================================================== móvil
// Pantalla dividida asimétrica: dispositivo recto a la izquierda (sin rotaciones ni flotación) y,
// a la derecha, los datos en tipografía: contador monumental unido al dispositivo por un conector
// y la pegatina como etiqueta de estado. Sin contador ni pegatina, el dispositivo queda centrado.
// Geometría: dispositivo en y ∈ [300, 980] (coordenadas de escena).
const MOVIL = { w: 340, h: 680, y: 300, xIzq: 100, xDatos: 510, anchoDatos: 470 };

const Movil: React.FC<PropsEscena> = ({ p, b }) => {
  const f = useCurrentFrame();
  const [bEntra, bContenido, bPegatina] = b;
  const pegatina = txt(p, "pegatina");
  const subtitulo = txt(p, "subtitulo");
  const icono = txt(p, "icono");
  const cont = obj(p, "contador");
  const tieneCont = cont.hasta !== undefined;
  const conDatos = tieneCont || !!pegatina;
  const entra = lerp(f, bEntra, bEntra + 14, 0, 1, Easing.out(Easing.cubic));
  const pantalla = lerp(f, bContenido, bContenido + 12, 0, 1, Easing.out(Easing.cubic));
  const conteo = lerp(f, bContenido, bContenido + 26, 0, 1, Easing.out(Easing.cubic));
  const v = num(cont, "desde", 0) + (num(cont, "hasta", 0) - num(cont, "desde", 0)) * conteo;
  const pg = lerp(f, bPegatina, bPegatina + 10, 0, 1, Easing.out(Easing.back(1.4)));
  if (f < bEntra) return null;
  const x = conDatos ? MOVIL.xIzq : 540 - MOVIL.w / 2;
  const yCont = MOVIL.y + MOVIL.h * 0.42;
  const enlace = lerp(f, bContenido + 4, bContenido + 16, 0, 1, Easing.inOut(Easing.cubic));
  const xEnlace0 = x + MOVIL.w + 14;
  const xEnlace1 = MOVIL.xDatos - 16;
  // Tamaño fijo calculado sobre el valor final (≈0,6 em por carácter) para que el conteo no salte ni desborde.
  const textoFinal = numeroES(Math.round(Math.max(Math.abs(num(cont, "hasta", 0)), Math.abs(num(cont, "desde", 0)))));
  const tamCont = Math.min(112, Math.floor(MOVIL.anchoDatos / (textoFinal.length * 0.62)));

  return (
    <AbsoluteFill>
      {/* Dispositivo: bisel fino, isla superior y pantalla con el contenido */}
      <div style={{ position: "absolute", left: x, top: MOVIL.y + (1 - entra) * 60, width: MOVIL.w, height: MOVIL.h, opacity: entra, borderRadius: 52, border: `2.5px solid ${alfa(C.texto, 0.55)}`, padding: 12, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 42, overflow: "hidden", background: alfa(C.texto, 0.06) }}>
          <div style={{ position: "absolute", left: "50%", top: 16, width: 96, height: 26, marginLeft: -48, borderRadius: 13, background: alfa(C.texto, 0.85) }} />
          <div style={{ position: "absolute", left: 22, right: 22, top: 64, display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 15, letterSpacing: "1px", color: C.suave }}>
            <span>9:41</span>
            <span>5G ▮▮▮</span>
          </div>
          <div style={{ position: "absolute", left: 26, right: 26, top: 150, opacity: pantalla, transform: `translateY(${((1 - pantalla) * 16).toFixed(2)}px)` }}>
            <div style={{ width: 84, height: 84, borderRadius: 22, background: alfa(C.acento, 0.14), display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}>
              <Icono nombre={icono || "sparkles"} tam={50} color={C.acento} />
            </div>
            <div style={{ fontFamily: F.titulo, fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5, color: C.texto }}>{txt(p, "titulo")}</div>
            {subtitulo && <div style={{ fontFamily: F.texto, fontWeight: pesoTexto(600), fontSize: 24, color: C.suave, marginTop: 12 }}>{subtitulo}</div>}
          </div>
          {/* Vista previa del reel con barra de reproducción */}
          <div style={{ position: "absolute", left: 26, right: 26, top: 420, height: 150, borderRadius: 18, background: alfa(C.acento, 0.1), border: `1.5px solid ${alfa(C.acento, 0.35)}`, opacity: pantalla, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width={44} height={44}>
              <path d="M8 5 L19 12 L8 19 Z" fill={C.acento} />
            </svg>
          </div>
          <div style={{ position: "absolute", left: 26, right: 26, top: 590, height: 4, borderRadius: 2, background: alfa(C.texto, 0.15), opacity: pantalla }}>
            <div style={{ width: `${(lerp(f, bContenido, bContenido + 90, 0, 1, Easing.linear) * 100).toFixed(2)}%`, height: "100%", borderRadius: 2, background: C.acento }} />
          </div>
          <div style={{ position: "absolute", left: "50%", bottom: 14, width: 120, height: 5, marginLeft: -60, borderRadius: 3, background: alfa(C.texto, 0.4) }} />
        </div>
      </div>

      {/* Conector del dispositivo al dato */}
      {tieneCont && f >= bContenido + 4 && (
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible", pointerEvents: "none" }}>
          <circle cx={xEnlace0} cy={yCont} r={5} fill={C.acento} opacity={enlace} />
          <line x1={xEnlace0} y1={yCont} x2={xEnlace0 + (xEnlace1 - xEnlace0) * enlace} y2={yCont} stroke={alfa(C.acento, 0.8)} strokeWidth={2} strokeDasharray="6 6" />
        </svg>
      )}

      {/* Datos: contador monumental */}
      {tieneCont && f >= bContenido && (
        <div style={{ position: "absolute", left: MOVIL.xDatos, width: MOVIL.anchoDatos, top: yCont - 96, opacity: pantalla }}>
          <div style={{ fontFamily: F.mono, fontSize: 20, letterSpacing: "3px", color: C.acento, marginBottom: 6, whiteSpace: "nowrap" }}>EN VIVO</div>
          <div style={{ fontFamily: F.titulo, fontSize: tamCont, lineHeight: 0.95, letterSpacing: -2, color: C.texto, whiteSpace: "nowrap" }}>{numeroES(Math.round(v))}</div>
          <div style={{ fontFamily: F.texto, fontWeight: pesoTexto(800), fontSize: 26, letterSpacing: "3px", textTransform: "uppercase", color: C.suave, marginTop: 14, whiteSpace: "nowrap" }}>{txt(cont, "etiqueta", "visitas")}</div>
        </div>
      )}

      {/* Pegatina como etiqueta de estado */}
      {pegatina && f >= bPegatina && (
        <div style={{ position: "absolute", left: MOVIL.xDatos, top: tieneCont ? yCont + 120 : MOVIL.y + MOVIL.h / 2 - 40, opacity: Math.min(1, pg * 1.5), transform: `scale(${0.85 + 0.15 * pg})`, transformOrigin: "0% 50%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.acento, color: C.acentoTexto, fontFamily: F.titulo, fontSize: 44, lineHeight: 1, padding: "16px 26px", borderRadius: 8, whiteSpace: "nowrap" }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: C.acentoTexto }} />
            {pegatina}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const movil: DefEscena = {
  C: Movil,
  momentos: 3,
  sonidos: (p) => [[0, "whoosh", 0.28], ...(txt(p, "pegatina") ? ([[2, "pop", 0.38]] as [number, string, number][]) : [])],
  validar: (p) => [
    ...reglas(p, [
      ["titulo", "texto", { max: 24 }],
      ["subtitulo", "texto", { opcional: true, max: 18 }],
      ["pegatina", "texto", { opcional: true, max: 12 }],
      ["contador", "objeto", { opcional: true }],
    ]),
    ...iconos([txt(p, "icono") || undefined]),
  ],
};

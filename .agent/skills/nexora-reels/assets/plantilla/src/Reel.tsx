import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import "./motor/fuentes";
import {
  C,
  CON_PERSONAJE,
  GRANO_INTENSIDAD,
  PLAN,
  SUBTITULOS,
  modoArteActivo,
  resolverArteFrase,
  type MedidasPose,
} from "./motor/actual";
import { Escena, type TipoTransicionEntrada, type TipoTransicionSalida } from "./Escena";
import { Fondo } from "./motor/Fondo";
import { Semitono } from "./motor/Semitono";
import { Lienzo } from "./piezas/Lienzo";
import { CAMBIOS_POSE, EFECTOS, ESCENAS, HAY_VOZ, T, corte, type EscenaLinea, type Efecto } from "./motor/linea";
import { Personaje } from "./piezas/Personaje";
import { SubtitulosBloque, SubtitulosLinea } from "./piezas/Subtitulos";
import { BIBLIOTECA } from "./escenas";
import { resolverCamaraParaFrase } from "./motor/camara";
import type { FraseT, Plan } from "./tipos";
import type { Estilo } from "./motor/estilos";

export interface ReelProps {
  /** Plan opcional pasado vía inputProps. */
  plan?: Plan;
  /** Escenas planificadas opcionales. */
  escenas?: EscenaLinea[];
  /** Cambios de pose del personaje opcionales. */
  cambiosPose?: { desde: number; pose: string }[];
  /** Efectos de sonido opcionales. */
  efectos?: Efecto[];
  /** Modo de subtítulos opcional. */
  subtitulos?: "linea" | "bloque" | "no";
  /** Frases con sincronización fonética para subtítulos. */
  frasesT?: FraseT[];
  /** Índices de frases sin subtítulos. */
  sinSubtitulos?: number[];
  /** Forzar activación de personaje. */
  conPersonaje?: boolean;
  /** Diccionario de medidas de poses. */
  poses?: Record<string, MedidasPose>;
  /** Estilo visual activo. */
  estilo?: Estilo;
  /** Indicador de pista de voz activa. */
  hayVoz?: boolean;
  /** Ruta o nombre del archivo de voz. */
  vozSrc?: string;
  /** Resumen técnico precalculado (opcional). */
  resumen?: unknown;
}

const SIN_SUBTITULOS_DEFAULT = PLAN.frases
  .map((f, i) => (f.sinSubtitulos ? i : -1))
  .filter((i) => i >= 0);

/**
 * Overlay global de grano cinematográfico continuo para toda la composición.
 * Solo se activa en modo artístico (z-index objetivo: 43).
 * Interpola cambios de intensidad entre frases con una ventana de 6 frames.
 * Mantiene continuidad temporal sin reiniciar la semilla ni la fase de ruido.
 */
const FilmGrainGlobal: React.FC<{
  escenas: EscenaLinea[];
  resolverArte: (i: number) => { grano_intensidad: number };
}> = ({ escenas, resolverArte }) => {
  const frame = useCurrentFrame();

  if (!modoArteActivo) return null;

  if (escenas.length === 0) {
    if (GRANO_INTENSIDAD <= 0) return null;
    return renderGrainSvg(GRANO_INTENSIDAD);
  }

  let escenaIdx = 0;
  for (let idx = 0; idx < escenas.length; idx++) {
    if (frame >= escenas[idx].ini) {
      escenaIdx = idx;
    }
  }

  const escActual = escenas[escenaIdx];
  const gActual = resolverArte(escActual.i).grano_intensidad;
  let intensidad = gActual;

  if (escenaIdx > 0) {
    const tCorte = escActual.ini;
    const durTransicion = 6;
    if (frame >= tCorte && frame < tCorte + durTransicion) {
      const gPrev = resolverArte(escenas[escenaIdx - 1].i).grano_intensidad;
      const progreso = (frame - tCorte) / durTransicion;
      intensidad = gPrev + (gActual - gPrev) * progreso;
    }
  }

  if (intensidad <= 0.001) return null;

  return renderGrainSvg(intensidad);
};

const renderGrainSvg = (opacidad: number) => (
  <AbsoluteFill
    style={{
      zIndex: 43,
      pointerEvents: "none",
      opacity: Math.min(1, Math.max(0, opacidad)),
      mixBlendMode: "overlay",
    }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="nexora-global-film-grain"
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
      <rect width="100%" height="100%" fill="url(#nexora-global-film-grain)" />
    </svg>
  </AbsoluteFill>
);

export const Reel: React.FC<ReelProps> = ({
  plan: planProp,
  escenas: escenasProp,
  cambiosPose: cambiosPoseProp,
  efectos: efectosProp,
  subtitulos: subtitulosProp,
  frasesT: frasesTProp,
  sinSubtitulos: sinSubtitulosProp,
  conPersonaje: conPersonajeProp,
  poses: posesProp,
  estilo: estiloProp,
  hayVoz: hayVozProp,
  vozSrc: vozSrcProp,
}) => {
  const planActivo = planProp ?? PLAN;
  const escenasActivas = escenasProp ?? ESCENAS;
  const cambiosPoseActivos = cambiosPoseProp ?? CAMBIOS_POSE;
  const efectosActivos = efectosProp ?? EFECTOS;
  const subtitulosActivos = subtitulosProp ?? SUBTITULOS;
  const frasesActivas = frasesTProp ?? T.frases;
  const sinSubtitulosActivos =
    sinSubtitulosProp ??
    (planProp
      ? planProp.frases.map((f, i) => (f.sinSubtitulos ? i : -1)).filter((i) => i >= 0)
      : SIN_SUBTITULOS_DEFAULT);
  const conPersonajeActivo =
    conPersonajeProp !== undefined
      ? conPersonajeProp
      : posesProp
        ? Object.keys(posesProp).length > 0
        : CON_PERSONAJE;
  const hayVozActiva = hayVozProp !== undefined ? hayVozProp : HAY_VOZ;
  const vozSrcActivo = vozSrcProp ?? "voz.wav";
  const coloresActivos = estiloProp ? estiloProp.colores : C;

  return (
    <AbsoluteFill style={{ background: coloresActivos.fondo }}>
      {/* CAPA 0: Fondo */}
      <Fondo estilo={estiloProp} />

      {/* CAPA 10: Escenas / BgMesh / contenido */}
      {escenasActivas.map((e) => {
        const tipoEscena = planActivo.frases[e.i]?.escena?.tipo ?? "";
        const Comp = e.def?.C ?? (tipoEscena ? BIBLIOTECA[tipoEscena]?.C : undefined);
        if (!Comp) return null;
        const frase = planActivo.frases[e.i];
        const entradaEscena: TipoTransicionEntrada =
          e.i === 0 || e.entrada === "semitono" ? "corte" : e.entrada;
        const salidaEscena: TipoTransicionSalida =
          e.salida && e.salida !== "semitono" ? (e.salida as TipoTransicionSalida) : "corte";

        const propsEscena = { p: e.p, b: e.b, dur: e.dur, palabras: e.palabras, i: e.i };
        const slotAssets = frase?.assets ?? (typeof e.def?.assets === "function" ? e.def.assets(propsEscena) : e.def?.assets);
        const slotUi = frase?.ui ?? (typeof e.def?.ui === "function" ? e.def.ui(propsEscena) : e.def?.ui);
        const camaraEscena = resolverCamaraParaFrase(planActivo, frase);

        return (
          <Sequence
            key={e.i}
            from={e.ini}
            durationInFrames={Math.max(1, e.dur)}
            name={`${e.i + 1}. ${tipoEscena || "escena"}`}
          >
            <Escena
              dur={e.dur}
              camara={camaraEscena}
              entrada={entradaEscena}
              salida={salidaEscena}
              empuje={frase?.empuje ?? 0}
              bgMeshConfig={frase?.bgMeshConfig}
              colorGrade={frase?.colorGrade}
              postProcess={frase?.postProcess}
              assets={slotAssets}
              ui={slotUi}
            >
              <Lienzo>
                <Comp p={e.p} b={e.b} dur={e.dur} palabras={e.palabras} i={e.i} />
              </Lienzo>
            </Escena>
          </Sequence>
        );
      })}

      {/* CAPA 43: FilmGrain global continuo (solo se activa en modo artístico) */}
      <FilmGrainGlobal escenas={escenasActivas} resolverArte={resolverArteFrase} />

      {/* CAPA 44: Personaje */}
      {conPersonajeActivo && <Personaje cambios={cambiosPoseActivos} poses={posesProp} />}

      {/* CAPA 45: Semitono decorativo */}
      {escenasActivas.filter((e) => e.entrada === "semitono").map((e) => (
        <Semitono key={e.i} centro={corte(e.i)} />
      ))}

      {/* CAPA 50: Subtítulos */}
      {subtitulosActivos === "linea" && <SubtitulosLinea frases={frasesActivas} sin={sinSubtitulosActivos} />}
      {subtitulosActivos === "bloque" && <SubtitulosBloque frases={frasesActivas} sin={sinSubtitulosActivos} />}

      {hayVozActiva && <Audio src={staticFile(vozSrcActivo)} />}
      {efectosActivos.map((x, k) => (
        <Sequence key={k} from={Math.max(0, x.en)} durationInFrames={60} layout="none">
          <Audio src={staticFile(`sonidos/${x.s}.wav`)} volume={x.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

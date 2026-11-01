import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./motor/fuentes";
import { C, CON_PERSONAJE, PLAN, SUBTITULOS, type MedidasPose } from "./motor/actual";
import { Escena, type TipoTransicionEntrada, type TipoTransicionSalida } from "./Escena";
import { Fondo } from "./motor/Fondo";
import { Semitono } from "./motor/Semitono";
import { Lienzo } from "./piezas/Lienzo";
import { CAMBIOS_POSE, EFECTOS, ESCENAS, HAY_VOZ, T, corte, type EscenaLinea, type Efecto } from "./motor/linea";
import { Personaje } from "./piezas/Personaje";
import { SubtitulosBloque, SubtitulosLinea } from "./piezas/Subtitulos";
import { BIBLIOTECA } from "./escenas";
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
      <Fondo estilo={estiloProp} />
      {escenasActivas.map((e) => {
        const tipoEscena = planActivo.frases[e.i]?.escena?.tipo ?? "";
        const Comp = e.def?.C ?? (tipoEscena ? BIBLIOTECA[tipoEscena]?.C : undefined);
        if (!Comp) return null;
        const frase = planActivo.frases[e.i];
        const entradaEscena: TipoTransicionEntrada =
          e.i === 0 || e.entrada === "semitono" ? "corte" : e.entrada;
        const salidaEscena: TipoTransicionSalida =
          e.salida && e.salida !== "semitono" ? (e.salida as TipoTransicionSalida) : "corte";

        return (
          <Sequence
            key={e.i}
            from={e.ini}
            durationInFrames={Math.max(1, e.dur)}
            name={`${e.i + 1}. ${tipoEscena || "escena"}`}
          >
            <Escena
              dur={e.dur}
              entrada={entradaEscena}
              salida={salidaEscena}
              empuje={frase?.empuje ?? 0}
              bgMeshConfig={frase?.bgMeshConfig}
              colorGrade={frase?.colorGrade}
              postProcess={frase?.postProcess}
            >
              <Lienzo>
                <Comp p={e.p} b={e.b} dur={e.dur} palabras={e.palabras} i={e.i} />
              </Lienzo>
            </Escena>
          </Sequence>
        );
      })}

      {/* La transición de semitono cubre la escena; los subtítulos y el personaje permanecen encima */}
      {escenasActivas.filter((e) => e.entrada === "semitono").map((e) => (
        <Semitono key={e.i} centro={corte(e.i)} />
      ))}

      {subtitulosActivos === "linea" && <SubtitulosLinea frases={frasesActivas} sin={sinSubtitulosActivos} />}
      {subtitulosActivos === "bloque" && <SubtitulosBloque frases={frasesActivas} sin={sinSubtitulosActivos} />}
      {conPersonajeActivo && <Personaje cambios={cambiosPoseActivos} poses={posesProp} />}
      {hayVozActiva && <Audio src={staticFile(vozSrcActivo)} />}
      {efectosActivos.map((x, k) => (
        <Sequence key={k} from={Math.max(0, x.en)} durationInFrames={60} layout="none">
          <Audio src={staticFile(`sonidos/${x.s}.wav`)} volume={x.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

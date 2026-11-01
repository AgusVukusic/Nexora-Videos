// Configuración activa para Nexora Motion Reels.
// Conecta los datos de plan.json y poses.json con THEME y la geometría de pantalla.
import plan0 from "../datos/plan.json";
import poses0 from "../datos/poses.json";
import type { Plan } from "../tipos";
import { resolverEstilo } from "./estilos";
import { THEME } from "./theme";

export { THEME };

export const PLAN: Plan = (plan0 as unknown as Plan) ?? { titulo: "Sin título", frases: [] };
export const ESTILO = resolverEstilo(PLAN.estilo);
/** Colores del estilo activo con nombre de uso semántico. */
export const C = ESTILO.colores;
export const SUAVE = ESTILO.familia === "suave";

export type MedidasPose = {
  src: string;
  ancho: number;
  alto: number;
  cabeza: number;
  anchoCabeza: number;
  peloArriba: number;
};

/** Poses del personaje medidas por scripts/poses.py. */
export const POSES: Record<string, MedidasPose> = {};
const posesRaw = (poses0 as Record<string, unknown>) ?? {};
for (const [k, v] of Object.entries(posesRaw)) {
  if (!k.startsWith("_") && typeof v === "object" && v !== null) {
    POSES[k] = v as MedidasPose;
  }
}

export const CON_PERSONAJE = (PLAN.personaje ?? true) && Object.keys(POSES).length > 0;

/** Pose por defecto: referencia de poses.py ("normal" si existe) o la primera disponible. */
const ref = posesRaw["_referencia"];
export const POSE_BASE: string =
  typeof ref === "string" && POSES[ref] ? ref : POSES.normal ? "normal" : Object.keys(POSES)[0] ?? "normal";

export const SUBTITULOS = PLAN.subtitulos ?? "linea";

/** Zona de diseño de las escenas: coordenadas base de pantalla dentro de este rectángulo (960x860 px). */
export const LIENZO = { x: 60, y: 210, w: 960, h: 860 };

/** Dónde cabe la escena según la presencia de subtítulos y personaje (Lienzo se escala y centra aquí). */
export const ZONA =
  SUBTITULOS === "bloque"
    ? CON_PERSONAJE
      ? { x: 60, y: 500, w: 960, h: 740 }
      : { x: 60, y: 500, w: 960, h: 1000 }
    : CON_PERSONAJE
      ? { x: 60, y: 210, w: 960, h: 860 }
      : { x: 60, y: 250, w: 960, h: 960 };

/** Centro vertical de la línea de subtítulos (modo "linea"). */
export const SUB_Y = CON_PERSONAJE ? 1170 : THEME.maquetacion.subtitulosY;

/** Sombra de las tarjetas calibrada según el estilo activo. */
export const SOMBRA =
  ESTILO.nombre === "nexora"
    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)"
    : SUAVE
      ? "0 26px 54px rgba(40, 30, 60, 0.18), 0 8px 16px rgba(40, 30, 60, 0.10)"
      : `10px 12px 0 ${C.borde}`;

export const SOMBRA_PEQ =
  ESTILO.nombre === "nexora"
    ? "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)"
    : SUAVE
      ? "0 10px 22px rgba(40, 30, 60, 0.16), 0 3px 6px rgba(40, 30, 60, 0.10)"
      : `5px 6px 0 ${C.borde}`;

/** Borde de las tarjetas (solo en familias de estilo marcado). */
export const BORDE = SUAVE ? "none" : `5px solid ${C.borde}`;

import { Easing } from "remotion";
import type {
  CamaraConfig,
  ParallaxConfig,
  Plan,
  FrasePlan,
  TipoMovimientoCamara,
} from "../tipos";

export interface TransformacionCamara {
  escala: number;
  x: number;
  y: number;
  rotacion: number;
  transformOrigin?: string;
  transform?: string;
}

export interface CamaraConfigNormalizada {
  activa: boolean;
  tipo: TipoMovimientoCamara;
  escala: [number, number];
  posicion: [[number, number], [number, number]];
  rotacion: [number, number];
  origen: string;
  duracion: number;
  inicio: number;
  curva: (t: number) => number;
  curvaNombre: string;
  parallax: Required<ParallaxConfig>;
  zoomThrough?: CamaraConfig["zoomThrough"];
  iris?: CamaraConfig["iris"];
  whipPan?: CamaraConfig["whipPan"];
}

/**
 * Mapeo de curvas de aceleración y desaceleración estándar para cinemática.
 */
export function resolverCurvaEasing(
  nombre?: "lineal" | "suave" | "in" | "out" | "in-out" | string
): (t: number) => number {
  switch (nombre) {
    case "lineal":
      return (t: number) => t;
    case "in":
      return Easing.in(Easing.cubic);
    case "out":
      return Easing.out(Easing.cubic);
    case "in-out":
      return Easing.inOut(Easing.cubic);
    case "suave":
    default:
      return Easing.inOut(Easing.quad);
  }
}

/**
 * Normaliza la configuración de parallax garantizando valores seguros y deterministas.
 */
export function normalizarParallax(p?: boolean | ParallaxConfig): Required<ParallaxConfig> {
  if (p === true) {
    return {
      activo: true,
      intensidad: 1.0,
      profundidadFondo: 0.3,
      profundidadAssets: 0.7,
      profundidadUI: 1.0,
      profundidadFrente: 1.3,
    };
  }
  if (typeof p === "object" && p !== null) {
    return {
      activo: p.activo ?? true,
      intensidad: typeof p.intensidad === "number" ? Math.max(0, p.intensidad) : 1.0,
      profundidadFondo: typeof p.profundidadFondo === "number" ? p.profundidadFondo : 0.3,
      profundidadAssets: typeof p.profundidadAssets === "number" ? p.profundidadAssets : 0.7,
      profundidadUI: typeof p.profundidadUI === "number" ? p.profundidadUI : 1.0,
      profundidadFrente: typeof p.profundidadFrente === "number" ? p.profundidadFrente : 1.3,
    };
  }
  return {
    activo: false,
    intensidad: 1.0,
    profundidadFondo: 1.0,
    profundidadAssets: 1.0,
    profundidadUI: 1.0,
    profundidadFrente: 1.0,
  };
}

/**
 * Normaliza una configuración de cámara con valores por defecto y límites matemáticos.
 */
export function normalizarCamara(
  cfg?: CamaraConfig,
  durEscena: number = 90
): CamaraConfigNormalizada {
  const activa =
    cfg?.activa !== undefined
      ? Boolean(cfg.activa)
      : Boolean(
          cfg &&
            (cfg.tipo !== undefined ||
              cfg.escala !== undefined ||
              cfg.posicion !== undefined ||
              cfg.rotacion !== undefined ||
              cfg.parallax !== undefined)
        );

  const tipo: TipoMovimientoCamara = cfg?.tipo ?? "estatica";

  // Valores predeterminados según el tipo de movimiento
  let defaultEscala: [number, number] = [1.0, 1.0];
  let defaultPos: [[number, number], [number, number]] = [
    [0, 0],
    [0, 0],
  ];
  let defaultRot: [number, number] = [0, 0];
  let defaultCurva = "suave";

  switch (tipo) {
    case "empuje":
      defaultEscala = [1.0, 1.05];
      defaultCurva = "suave";
      break;
    case "paneo":
      defaultPos = [
        [-30, 0],
        [30, 0],
      ];
      defaultCurva = "suave";
      break;
    case "orbital":
      defaultRot = [-1.2, 1.2];
      defaultEscala = [1.02, 1.02];
      defaultCurva = "suave";
      break;
    case "zoom-in":
      defaultEscala = [1.0, 1.15];
      defaultPos = [
        [0, 0],
        [0, -20],
      ];
      defaultCurva = "out";
      break;
    case "zoom-out":
      defaultEscala = [1.15, 1.0];
      defaultPos = [
        [0, -20],
        [0, 0],
      ];
      defaultCurva = "in-out";
      break;
    case "travel-in":
      defaultEscala = [1.0, 1.12];
      defaultPos = [
        [-40, 20],
        [0, 0],
      ];
      defaultCurva = "suave";
      break;
    case "travel-out":
      defaultEscala = [1.12, 1.0];
      defaultPos = [
        [0, 0],
        [40, -20],
      ];
      defaultCurva = "suave";
      break;
    case "estatica":
    case "custom":
    default:
      break;
  }

  // Parseo de escala
  let escala: [number, number] = defaultEscala;
  if (typeof cfg?.escala === "number") {
    escala = [1.0, cfg.escala];
  } else if (Array.isArray(cfg?.escala) && cfg.escala.length >= 2) {
    escala = [cfg.escala[0], cfg.escala[1]];
  }

  // Parseo de posición
  let posicion: [[number, number], [number, number]] = defaultPos;
  if (Array.isArray(cfg?.posicion)) {
    if (
      cfg.posicion.length === 2 &&
      typeof cfg.posicion[0] === "number" &&
      typeof cfg.posicion[1] === "number"
    ) {
      posicion = [
        [0, 0],
        [cfg.posicion[0] as number, cfg.posicion[1] as number],
      ];
    } else if (
      cfg.posicion.length >= 2 &&
      Array.isArray(cfg.posicion[0]) &&
      Array.isArray(cfg.posicion[1])
    ) {
      posicion = [
        [Number(cfg.posicion[0][0]) || 0, Number(cfg.posicion[0][1]) || 0],
        [Number(cfg.posicion[1][0]) || 0, Number(cfg.posicion[1][1]) || 0],
      ];
    }
  }

  // Parseo de rotación
  let rotacion: [number, number] = defaultRot;
  if (typeof cfg?.rotacion === "number") {
    rotacion = [0, cfg.rotacion];
  } else if (Array.isArray(cfg?.rotacion) && cfg.rotacion.length >= 2) {
    rotacion = [cfg.rotacion[0], cfg.rotacion[1]];
  }

  // Parseo de origen (transformOrigin)
  let origen = "50% 40%";
  if (typeof cfg?.origen === "string") {
    origen = cfg.origen;
  } else if (Array.isArray(cfg?.origen) && cfg.origen.length >= 2) {
    origen = `${cfg.origen[0]}px ${cfg.origen[1]}px`;
  }

  const durTotal = Math.max(1, durEscena);
  const durMov = Math.max(1, Math.min(durTotal, cfg?.duracion ?? durTotal));
  const inicio = Math.max(0, cfg?.inicio ?? 0);
  const curvaNombre = cfg?.curva ?? defaultCurva;
  const curva = resolverCurvaEasing(curvaNombre);
  const parallax = normalizarParallax(cfg?.parallax);

  return {
    activa,
    tipo,
    escala,
    posicion,
    rotacion,
    origen,
    duracion: durMov,
    inicio,
    curva,
    curvaNombre,
    parallax,
    zoomThrough: cfg?.zoomThrough,
    iris: cfg?.iris,
    whipPan: cfg?.whipPan,
  };
}

/**
 * Calcula la transformación espacial 2.5D para un fotograma dado y un plano con profundidad específica.
 *
 * @param frame Fotograma relativo al inicio de la escena.
 * @param camara Configuración de cámara normalizada.
 * @param factorProfundidad Factor de profundidad del plano (ej: 0.3 fondo, 0.7 assets, 1.0 UI, 0 subtítulos).
 */
export function calcularTransformacionCamara(
  frame: number,
  camara: CamaraConfigNormalizada,
  factorProfundidad: number = 1.0
): TransformacionCamara {
  if (!camara.activa) {
    return {
      escala: 1,
      x: 0,
      y: 0,
      rotacion: 0,
      transformOrigin: undefined,
      transform: undefined,
    };
  }

  // Si el factor de profundidad es 0 (ej. subtítulos fijos), la cámara no lo altera
  if (Math.abs(factorProfundidad) < 1e-5) {
    return {
      escala: 1,
      x: 0,
      y: 0,
      rotacion: 0,
      transformOrigin: camara.origen,
      transform: undefined,
    };
  }

  const fRel = Math.max(0, frame - camara.inicio);
  const progreso = Math.min(1, Math.max(0, fRel / camara.duracion));
  const t = camara.curva(progreso);

  // Valores brutos interpolados
  const rawEscala = camara.escala[0] + (camara.escala[1] - camara.escala[0]) * t;
  const rawX = camara.posicion[0][0] + (camara.posicion[1][0] - camara.posicion[0][0]) * t;
  const rawY = camara.posicion[0][1] + (camara.posicion[1][1] - camara.posicion[0][1]) * t;
  const rawRot = camara.rotacion[0] + (camara.rotacion[1] - camara.rotacion[0]) * t;

  let escala = rawEscala;
  let x = rawX;
  let y = rawY;
  let rotacion = rawRot;

  // Si parallax está activo, modulamos por el factor de profundidad
  if (camara.parallax.activo) {
    const pMult = factorProfundidad * camara.parallax.intensidad;
    escala = 1.0 + (rawEscala - 1.0) * pMult;
    x = rawX * pMult;
    y = rawY * pMult;
    rotacion = rawRot * pMult;
  }

  const transformParts: string[] = [];
  if (Math.abs(escala - 1.0) > 1e-4) {
    transformParts.push(`scale(${escala.toFixed(4)})`);
  }
  if (Math.abs(x) > 1e-2 || Math.abs(y) > 1e-2) {
    transformParts.push(`translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`);
  }
  if (Math.abs(rotacion) > 1e-3) {
    transformParts.push(`rotate(${rotacion.toFixed(3)}deg)`);
  }

  return {
    escala,
    x,
    y,
    rotacion,
    transformOrigin: camara.origen,
    transform: transformParts.length > 0 ? transformParts.join(" ") : undefined,
  };
}

/**
 * Resuelve la configuración de cámara activa para una frase respetando la precedencia de arte.
 * Precedencia:
 * 1. frase.camara (si está explícitamente declarada)
 * 2. plan.arte?.camara (contrato de arte global)
 * 3. plan.camara (configuración global en plan)
 * 4. Desactivado (undefined / inactivo por defecto)
 */
export function resolverCamaraParaFrase(
  plan?: Plan,
  frase?: FrasePlan | null
): CamaraConfig | undefined {
  if (frase && frase.camara !== undefined) {
    return frase.camara;
  }
  if (plan?.arte?.camara !== undefined) {
    return plan.arte.camara;
  }
  if (plan?.camara !== undefined) {
    return plan.camara;
  }
  return undefined;
}

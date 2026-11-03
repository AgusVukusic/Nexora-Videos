/**
 * Motor de trazado vectorial y herramientas geométricas para composiciones cinéticas.
 * Proporciona funciones matemáticas puras y deterministas para animación de trazos,
 * arcos, conectores ortogonales, retículas técnicas y reglas graduadas.
 */

export interface DashOffsetConfig {
  strokeDasharray: number;
  strokeDashoffset: number;
}

/**
 * Calcula las propiedades strokeDasharray y strokeDashoffset para animar el dibujo
 * progresivo de un trazo SVG determinista de 0 a 100%.
 *
 * @param progreso Valor entre 0 (invisible) y 1 (completamente dibujado).
 * @param longitudTotal Longitud del trazado en píxeles.
 * @param invertir Si es true, el dibujo se realiza en sentido contrario.
 */
export function calcularDashOffset(
  progreso: number,
  longitudTotal: number,
  invertir = false
): DashOffsetConfig {
  const p = Math.min(1, Math.max(0, isNaN(progreso) ? 0 : progreso));
  const l = Math.max(0, longitudTotal);
  const offset = invertir ? (p - 1) * l : (1 - p) * l;

  return {
    strokeDasharray: l,
    strokeDashoffset: offset,
  };
}

/**
 * Convierte coordenadas polares (centro, radio, ángulo en grados) a cartesianas (x, y).
 */
export function polarACartesiano(
  cx: number,
  cy: number,
  r: number,
  anguloDeg: number
): { x: number; y: number } {
  const anguloRad = ((anguloDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(anguloRad),
    y: cy + r * Math.sin(anguloRad),
  };
}

/**
 * Genera el comando SVG 'd' para dibujar un arco circular de precisión.
 *
 * @param cx Coordenada X del centro.
 * @param cy Coordenada Y del centro.
 * @param r Radio del arco.
 * @param anguloInicioDeg Ángulo inicial en grados (0° = 12 en punto / cenit).
 * @param anguloFinDeg Ángulo final en grados en sentido horario.
 */
export function generarArcoSvg(
  cx: number,
  cy: number,
  r: number,
  anguloInicioDeg: number,
  anguloFinDeg: number
): string {
  if (r <= 0) return "";
  const diff = anguloFinDeg - anguloInicioDeg;
  if (Math.abs(diff) < 1e-4) return "";

  // Si el arco cubre o supera 360°, se dibuja como círculo completo
  if (Math.abs(diff) >= 360) {
    const inicio = polarACartesiano(cx, cy, r, 0);
    const medio = polarACartesiano(cx, cy, r, 180);
    return `M ${inicio.x.toFixed(2)} ${inicio.y.toFixed(2)} A ${r} ${r} 0 1 1 ${medio.x.toFixed(2)} ${medio.y.toFixed(2)} A ${r} ${r} 0 1 1 ${inicio.x.toFixed(2)} ${inicio.y.toFixed(2)}`;
  }

  const inicio = polarACartesiano(cx, cy, r, anguloInicioDeg);
  const fin = polarACartesiano(cx, cy, r, anguloFinDeg);
  const largeArcFlag = Math.abs(diff) <= 180 ? 0 : 1;
  const sweepFlag = diff > 0 ? 1 : 0;

  return `M ${inicio.x.toFixed(2)} ${inicio.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${fin.x.toFixed(2)} ${fin.y.toFixed(2)}`;
}

/**
 * Genera la ruta SVG 'd' para un conector ortogonal (ángulo recto a 90 grados) entre dos puntos.
 * Admite esquinas rectas o curvas redondeadas con radio de empalme suave.
 *
 * @param p1 Punto de partida [x, y].
 * @param p2 Punto de llegada [x, y].
 * @param direccion 'horizontal-primero' (X -> Y) o 'vertical-primero' (Y -> X).
 * @param radioCurva Radio de curvatura del codo en píxeles (0 para esquina recta a 90°).
 */
export function generarConectorOrtogonal(
  p1: [number, number],
  p2: [number, number],
  direccion: "horizontal-primero" | "vertical-primero" = "horizontal-primero",
  radioCurva = 0
): string {
  const [x1, y1] = p1;
  const [x2, y2] = p2;

  // Si están alineados en el mismo eje, línea recta directa
  if (Math.abs(x1 - x2) < 1e-3 || Math.abs(y1 - y2) < 1e-3) {
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (radioCurva <= 0) {
    if (direccion === "horizontal-primero") {
      return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    } else {
      return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x1.toFixed(2)} ${y2.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    }
  }

  // Codo redondeado con radio limitado al espacio disponible
  const rMax = Math.min(Math.abs(dx) / 2, Math.abs(dy) / 2);
  const r = Math.min(radioCurva, rMax);

  const sx = Math.sign(dx);
  const sy = Math.sign(dy);

  if (direccion === "horizontal-primero") {
    const codoX = x2;
    const codoY = y1;
    const pAntesX = codoX - sx * r;
    const pDespuesY = codoY + sy * r;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${pAntesX.toFixed(2)} ${codoY.toFixed(2)} Q ${codoX.toFixed(2)} ${codoY.toFixed(2)} ${codoX.toFixed(2)} ${pDespuesY.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  } else {
    const codoX = x1;
    const codoY = y2;
    const pAntesY = codoY - sy * r;
    const pDespuesX = codoX + sx * r;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${codoX.toFixed(2)} ${pAntesY.toFixed(2)} Q ${codoX.toFixed(2)} ${codoY.toFixed(2)} ${pDespuesX.toFixed(2)} ${codoY.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
}

export interface MarcaRegla {
  posicion: number;
  esMayor: boolean;
  valor: number;
}

/**
 * Genera la lista de marcas para una regla técnica graduada.
 *
 * @param inicio Coordenada inicial en píxeles.
 * @param fin Coordenada final en píxeles.
 * @param paso Separación entre marcas menores en píxeles.
 * @param pasoMayor Separación entre marcas mayores destacadas (por defecto paso * 5).
 */
export function generarMarcasRegla(
  inicio: number,
  fin: number,
  paso: number,
  pasoMayor?: number
): MarcaRegla[] {
  const pasoVal = Math.max(1, paso);
  const mayorVal = pasoMayor && pasoMayor > 0 ? pasoMayor : pasoVal * 5;
  const longitud = fin - inicio;
  if (longitud <= 0) return [];

  const marcas: MarcaRegla[] = [];
  const cantidad = Math.floor(longitud / pasoVal);

  for (let i = 0; i <= cantidad; i++) {
    const pos = inicio + i * pasoVal;
    const distancia = i * pasoVal;
    const esMayor = Math.abs(distancia % mayorVal) < 1e-3 || Math.abs((distancia % mayorVal) - mayorVal) < 1e-3;
    marcas.push({
      posicion: pos,
      esMayor,
      valor: distancia,
    });
  }

  return marcas;
}

export interface EsquinasReticula {
  topIzq: string;
  topDer: string;
  botIzq: string;
  botDer: string;
}

/**
 * Genera los trazados SVG 'd' para las 4 marcas de esquina de visor técnico / encuadre.
 *
 * @param x Coordenada X del borde izquierdo.
 * @param y Coordenada Y del borde superior.
 * @param w Ancho del rectángulo delimitador.
 * @param h Alto del rectángulo delimitador.
 * @param tamano Longitud de cada brazo del corchete de esquina en píxeles.
 */
export function generarEsquinasReticula(
  x: number,
  y: number,
  w: number,
  h: number,
  tamano = 16
): EsquinasReticula {
  const t = Math.min(tamano, w / 2, h / 2);
  const x2 = x + w;
  const y2 = y + h;

  return {
    topIzq: `M ${x + t} ${y} L ${x} ${y} L ${x} ${y + t}`,
    topDer: `M ${x2 - t} ${y} L ${x2} ${y} L ${x2} ${y + t}`,
    botIzq: `M ${x} ${y2 - t} L ${x} ${y2} L ${x + t} ${y2}`,
    botDer: `M ${x2} ${y2 - t} L ${x2} ${y2} L ${x2 - t} ${y2}`,
  };
}

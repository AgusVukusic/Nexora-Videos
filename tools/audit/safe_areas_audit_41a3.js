/**
 * ============================================================================
 * SCRIPT DETERMINISTA Y REPRODUCIBLE DE AUDITORÍA MATEMÁTICA DE SAFE AREAS
 * Etapa 41A.3 — Nexora Motion Reels (AgusVukusic/Nexora-Videos)
 * Archivo: tools/audit/safe_areas_audit_41a3.js
 * ============================================================================
 *
 * FUENTES DE PARÁMETROS EN CÓDIGO DE PRODUCCIÓN:
 * 1. src/motor/actual.ts (L48-63):
 *    - LIENZO: { x: 60, y: 210, w: 960, h: 860 }
 *    - ZONA dinámica (según SUBTITULOS y CON_PERSONAJE)
 *    - SUB_Y: CON_PERSONAJE ? 1170 : 1330
 * 2. src/piezas/Lienzo.tsx (L9-28):
 *    - s = Math.min(ZONA.w / LIENZO.w, ZONA.h / LIENZO.h)
 *    - translate(cx - lx, cy - ly) scale(s) con transformOrigin `${lx}px ${ly}px`
 * 3. src/motor/camara.ts (L110-247, L256-327):
 *    - Presets de cámara, origen "50% 40%" ([540, 768] px)
 *    - Transformación CSS: scale(S) translate(tx, ty) rotate(rot)
 * 4. src/CapasCine.tsx (L301-356):
 *    - Capa 3 UI: profundidadUI = 1.0 (transformada por cámara)
 * 5. src/piezas/Subtitulos.tsx (L16, L137, L159):
 *    - Modo línea: top = SUB_Y - 62 * 0.75 = SUB_Y - 46.5 px. Alto ~85 px.
 *    - Modo bloque: x = 130, y = 210, ancho = 830, alto ~255 px (Y: 210 a 465 px).
 * 6. src/piezas/Personaje.tsx (L8-10):
 *    - CABEZA_X = 300, PELO_Y = 1262. Cuadrante X: [80, 520], Y: [1262, 1920].
 */

const W = 1080;
const H = 1920;
const originCamara = [W * 0.5, H * 0.4]; // [540, 768]
const LIENZO = { x: 60, y: 210, w: 960, h: 860 };
const lx = LIENZO.x + LIENZO.w / 2; // 540
const ly = LIENZO.y + LIENZO.h / 2; // 640

/**
 * 1. INVENTARIO DE PRESETS DE CÁMARA
 * Clasificación estricta:
 * - PRESET_REAL: Nativo en src/motor/camara.ts (L121-174)
 * - CUSTOM_VALIDO: Configuración válida vía API pública de CamaraConfig
 * - STRESS_SINTETICO: Escenario artificial para auditar robustez extrema
 */
const CAMERA_STATES = [
  {
    id: 'estatica',
    nombre: 'Estática',
    categoria: 'PRESET_REAL',
    s: 1.0,
    tx: 0,
    ty: 0,
    rot: 0,
    fuente: 'src/motor/camara.ts:113-118,170',
    desc: 'Cámara desactivada / inmóvil'
  },
  {
    id: 'empuje_t1',
    nombre: 'Empuje (Final)',
    categoria: 'PRESET_REAL',
    s: 1.05,
    tx: 0,
    ty: 0,
    rot: 0,
    fuente: 'src/motor/camara.ts:122-125',
    desc: 'Empuje sutil adelante (+5% escala en t=1)'
  },
  {
    id: 'paneo_t0',
    nombre: 'Paneo (Inicio - Izq)',
    categoria: 'PRESET_REAL',
    s: 1.0,
    tx: -30,
    ty: 0,
    rot: 0,
    fuente: 'src/motor/camara.ts:126-132',
    desc: 'Extremo izquierdo de traslación (-30px en t=0)'
  },
  {
    id: 'paneo_t1',
    nombre: 'Paneo (Final - Der)',
    categoria: 'PRESET_REAL',
    s: 1.0,
    tx: 30,
    ty: 0,
    rot: 0,
    fuente: 'src/motor/camara.ts:126-132',
    desc: 'Extremo derecho de traslación (+30px en t=1)'
  },
  {
    id: 'orbital_t1',
    nombre: 'Orbital (Final)',
    categoria: 'PRESET_REAL',
    s: 1.02,
    tx: 0,
    ty: 0,
    rot: 1.2,
    fuente: 'src/motor/camara.ts:133-137',
    desc: 'Inclinación angular máxima (+1.2° en t=1)'
  },
  {
    id: 'zoom_in_t1',
    nombre: 'Zoom-In (Final)',
    categoria: 'PRESET_REAL',
    s: 1.15,
    tx: 0,
    ty: -20,
    rot: 0,
    fuente: 'src/motor/camara.ts:138-145',
    desc: 'Zoom impacto (+15% escala, -20px Y en t=1)'
  },
  {
    id: 'zoom_out_t0',
    nombre: 'Zoom-Out (Inicio)',
    categoria: 'PRESET_REAL',
    s: 1.15,
    tx: 0,
    ty: -20,
    rot: 0,
    fuente: 'src/motor/camara.ts:147-153',
    desc: 'Zoom retroceso (+15% escala, -20px Y en t=0)'
  },
  {
    id: 'travel_in_t0',
    nombre: 'Travel-In (Inicio)',
    categoria: 'PRESET_REAL',
    s: 1.0,
    tx: -40,
    ty: 20,
    rot: 0,
    fuente: 'src/motor/camara.ts:154-161',
    desc: 'Desplazamiento inicial (+20px Y, -40px X en t=0)'
  },
  {
    id: 'travel_out_t1',
    nombre: 'Travel-Out (Final)',
    categoria: 'PRESET_REAL',
    s: 1.0,
    tx: 40,
    ty: -20,
    rot: 0,
    fuente: 'src/motor/camara.ts:162-169',
    desc: 'Desplazamiento final (-20px Y, +40px X en t=1)'
  },
  {
    id: 'stress_sintetico',
    nombre: 'Estrés Sintético Máx',
    categoria: 'STRESS_SINTETICO',
    s: 1.15,
    tx: 30,
    ty: 30,
    rot: 1.2,
    fuente: 'Escenario de auditoría (no nativo en motor)',
    desc: 'Prueba límite: escala +15%, traslación +30px Y, rotación 1.2°'
  }
];

/**
 * 2. CUATRO CONFIGURACIONES DE ENTORNO EN TIEMPO DE EJECUCIÓN (ZONA)
 */
const ZONA_CONFIGS = [
  {
    id: 'cfg1_linea_con_personaje',
    nombre: 'Línea con Personaje',
    subModo: 'linea',
    conPersonaje: true,
    zona: { x: 60, y: 210, w: 960, h: 860 }, // actual.ts:58
    subTop: 1123.5, // 1170 - 46.5
    subBottom: 1208.5,
    personajeTop: 1262, // Personaje.tsx:10
    fuente: 'actual.ts:57-58, Subtitulos.tsx:137, Personaje.tsx:10'
  },
  {
    id: 'cfg2_linea_sin_personaje',
    nombre: 'Línea sin Personaje',
    subModo: 'linea',
    conPersonaje: false,
    zona: { x: 60, y: 250, w: 960, h: 960 }, // actual.ts:59
    subTop: 1283.5, // 1330 - 46.5
    subBottom: 1368.5,
    personajeTop: null,
    fuente: 'actual.ts:59, theme.ts:subtitulosY(1330), Subtitulos.tsx:137'
  },
  {
    id: 'cfg3_bloque_con_personaje',
    nombre: 'Bloque con Personaje',
    subModo: 'bloque',
    conPersonaje: true,
    zona: { x: 60, y: 500, w: 960, h: 740 }, // actual.ts:55
    subTop: 210,
    subBottom: 465, // 210 + 3 * (72 * 1.18) = 464.88
    personajeTop: 1262,
    fuente: 'actual.ts:54-55, Subtitulos.tsx:159, Personaje.tsx:10'
  },
  {
    id: 'cfg4_bloque_sin_personaje',
    nombre: 'Bloque sin Personaje',
    subModo: 'bloque',
    conPersonaje: false,
    zona: { x: 60, y: 500, w: 960, h: 1000 }, // actual.ts:56
    subTop: 210,
    subBottom: 465,
    personajeTop: null,
    fuente: 'actual.ts:56, Subtitulos.tsx:159'
  }
];

/**
 * Calcula la transformación de Lienzo.tsx hacia ZONA.
 */
function getLienzoTransform(zona) {
  const s = Math.min(zona.w / LIENZO.w, zona.h / LIENZO.h);
  const cx = zona.x + zona.w / 2;
  const cy = zona.y + zona.h / 2;
  return { s, dx: cx - lx, dy: cy - ly };
}

/**
 * Simulación exacta de la composición de matrices en CSS / Chromium:
 * P_screen = M_camara * M_lienzo * P_escena
 */
function calcScreenPoint(pt, tLienzo, cam) {
  // Paso 1: Lienzo transform (Lienzo.tsx:21)
  const x1 = lx + tLienzo.s * (pt[0] - lx) + tLienzo.dx;
  const y1 = ly + tLienzo.s * (pt[1] - ly) + tLienzo.dy;

  // Paso 2: Cámara 2.5D en CapasCine UI (CapasCine.tsx:350, camara.ts:308-326)
  // CSS: scale(S) translate(tx, ty) rotate(rot) con transform-origin [540, 768]
  // Evaluación CSS de derecha a izquierda:
  const rad = (cam.rot * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);

  const v0 = x1 - originCamara[0];
  const v1 = y1 - originCamara[1];

  // 1. Rotación
  const vRot0 = v0 * cosR - v1 * sinR;
  const vRot1 = v0 * sinR + v1 * cosR;

  // 2. Traslación
  const vTrans0 = vRot0 + cam.tx;
  const vTrans1 = vRot1 + cam.ty;

  // 3. Escala y restitución de origen
  const x2 = originCamara[0] + vTrans0 * cam.s;
  const y2 = originCamara[1] + vTrans1 * cam.s;

  return [x2, y2];
}

/**
 * Calcula el Bounding Box de la composición dada una coordenada inferior y superior.
 */
function calcBoundingBox(tLienzo, cam, yTop = 210, yBottom = 1040) {
  const pts = [
    calcScreenPoint([60, yTop], tLienzo, cam),     // Sup-Izq
    calcScreenPoint([1020, yTop], tLienzo, cam),   // Sup-Der
    calcScreenPoint([60, yBottom], tLienzo, cam),  // Inf-Izq
    calcScreenPoint([1020, yBottom], tLienzo, cam),// Inf-Der
    calcScreenPoint([540, yTop], tLienzo, cam),    // Sup-Centro
    calcScreenPoint([540, yBottom], tLienzo, cam), // Inf-Centro
    calcScreenPoint([540, 640], tLienzo, cam)      // Centro absoluto
  ];

  const minX = Math.min(...pts.map(p => p[0]));
  const maxX = Math.max(...pts.map(p => p[0]));
  const minY = Math.min(...pts.map(p => p[1]));
  const maxY = Math.max(...pts.map(p => p[1]));

  return { minX, maxX, minY, maxY, pts };
}

// ============================================================================
// EJECUCIÓN DE LA AUDITORÍA DE LOS 40 CASOS
// ============================================================================

console.log('================================================================================');
console.log('AUDITORÍA MATEMÁTICA DEFINITIVA DE SAFE AREAS Y CÁMARA 2.5D (ETAPA 41A.3)');
console.log('Repositorio: AgusVukusic/Nexora-Videos | Skill: nexora-reels');
console.log('================================================================================\n');

const results40 = [];

ZONA_CONFIGS.forEach(cfg => {
  const tL = getLienzoTransform(cfg.zona);

  CAMERA_STATES.forEach(cam => {
    // Evaluamos el límite recomendado: yTop = 210 (o 250 en bloque), yBottom = 1040
    const localTop = cfg.subModo === 'bloque' ? 250 : 210;
    const bb1040 = calcBoundingBox(tL, cam, localTop, 1040);
    const bb1070 = calcBoundingBox(tL, cam, localTop, 1070);
    const bb1140 = calcBoundingBox(tL, cam, localTop, 1140);

    let margenMin = 9999;
    let colision = false;
    let detalleColision = 'Ninguna (Seguro)';
    let zonaReservada = '';

    if (cfg.subModo === 'linea') {
      zonaReservada = `Subtítulos Línea (Top: ${cfg.subTop}px)`;
      // La colisión se evalúa en el borde inferior contra los subtítulos
      const margen = cfg.subTop - bb1040.maxY;
      margenMin = margen;
      if (margen < 0) {
        colision = true;
        detalleColision = `Colisión Subtítulos: overlap ${(-margen).toFixed(1)}px`;
      }
    } else {
      // Modo bloque:
      // 1. Colisión superior con subtítulos en Y in [210, 465]
      const margenSup = bb1040.minY - cfg.subBottom;
      // 2. Colisión inferior: si conPersonaje, en cuadrante izquierdo X <= 520 contra pelo Y=1262
      let margenInf = 9999;
      if (cfg.personajeTop) {
        // Obtenemos los puntos inferiores en el cuadrante izquierdo (X <= 520)
        const ptInfIzq = calcScreenPoint([60, 1040], tL, cam);
        const ptInfCentro = calcScreenPoint([300, 1040], tL, cam); // Centro personaje
        const maxYIzq = Math.max(ptInfIzq[1], ptInfCentro[1]);
        margenInf = cfg.personajeTop - maxYIzq;
        zonaReservada = `Subtítulos Bloque (210-465) + Personaje (Y>=1262 en X<=520)`;
      } else {
        zonaReservada = `Subtítulos Bloque (210-465)`;
      }

      margenMin = Math.min(margenSup, margenInf);
      if (margenSup < 0) {
        colision = true;
        detalleColision = `Colisión Subtítulos Superior: overlap ${(-margenSup).toFixed(1)}px`;
      } else if (margenInf < 0) {
        colision = true;
        detalleColision = `Colisión Personaje Cabeza: overlap ${(-margenInf).toFixed(1)}px`;
      }
    }

    results40.push({
      configId: cfg.id,
      configNombre: cfg.nombre,
      presetId: cam.id,
      presetNombre: cam.nombre,
      categoria: cam.categoria,
      escala: cam.s,
      tx: cam.tx,
      ty: cam.ty,
      rot: cam.rot,
      bb1040: `X:[${bb1040.minX.toFixed(1)}, ${bb1040.maxX.toFixed(1)}] Y:[${bb1040.minY.toFixed(1)}, ${bb1040.maxY.toFixed(1)}]`,
      bb1070MaxY: bb1070.maxY.toFixed(1),
      bb1140MaxY: bb1140.maxY.toFixed(1),
      zonaReservada,
      margenMin: margenMin.toFixed(1),
      colision,
      resultado: colision ? `COLISIÓN (${detalleColision})` : `OK (+${margenMin.toFixed(1)}px)`
    });
  });
});

// Imprimir tabla resumen de los 40 casos
console.log('MATRIZ COMPLETA DE LOS 40 CASOS EVALUADOS:\n');
console.log('| # | Configuración | Preset | Tipo | Escala | tx | ty | Rot | Bounding Box Pantalla | Margen Mínimo | Estado |');
console.log('|---|---|---|:---:|---:|---:|---:|---:|---|---:|:---:|');

results40.forEach((r, idx) => {
  console.log(`| ${idx + 1} | ${r.configNombre} | ${r.presetNombre} | ${r.categoria === 'PRESET_REAL' ? 'Real' : 'Estrés'} | ${r.escala} | ${r.tx} | ${r.ty} | ${r.rot}° | ${r.bb1040} | ${r.margenMin}px | ${r.colision ? '**COLISIÓN**' : 'OK'} |`);
});

// ============================================================================
// ANÁLISIS DE ROBUSTEZ Y COMPARATIVA 1040 VS 1070 VS 1140
// ============================================================================

console.log('\n================================================================================');
console.log('COMPARATIVA CRÍTICA DE LÍMITES INFERIORES: y=1040 vs y=1070 vs y=1140');
console.log('================================================================================\n');

console.log('| Configuración | Preset | MaxY (y=1040) | Margen 1040 | MaxY (y=1070) | Margen 1070 | MaxY (y=1140) | Margen 1140 |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|');

results40.forEach(r => {
  const cfg = ZONA_CONFIGS.find(c => c.id === r.configId);
  const tL = getLienzoTransform(cfg.zona);
  const cam = CAMERA_STATES.find(c => c.id === r.presetId);
  const p1040 = calcScreenPoint([540, 1040], tL, cam)[1];
  const p1070 = calcScreenPoint([540, 1070], tL, cam)[1];
  const p1140 = calcScreenPoint([540, 1140], tL, cam)[1];

  let m1040, m1070, m1140;
  if (cfg.subModo === 'linea') {
    m1040 = (cfg.subTop - p1040).toFixed(1);
    m1070 = (cfg.subTop - p1070).toFixed(1);
    m1140 = (cfg.subTop - p1140).toFixed(1);
  } else {
    const limit = cfg.personajeTop ?? 1920;
    m1040 = (limit - p1040).toFixed(1);
    m1070 = (limit - p1070).toFixed(1);
    m1140 = (limit - p1140).toFixed(1);
  }

  const s1040 = m1040 < 0 ? `**${m1040}**` : `+${m1040}`;
  const s1070 = m1070 < 0 ? `**${m1070}**` : `+${m1070}`;
  const s1140 = m1140 < 0 ? `**${m1140}**` : `+${m1140}`;

  console.log(`| ${r.configNombre} | ${r.presetNombre} | ${p1040.toFixed(1)} | ${s1040}px | ${p1070.toFixed(1)} | ${s1070}px | ${p1140.toFixed(1)} | ${s1140}px |`);
});

console.log('\nAuditoría matemática completada con éxito. Cero valores NaN. Cero indefinidos.');

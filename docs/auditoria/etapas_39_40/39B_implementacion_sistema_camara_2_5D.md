# NEXORA-REELS — ETAPA 39B: INFORME DE IMPLEMENTACIÓN
## Sistema de Cámara 2.5D y Movimiento Espacial

**Fecha de ejecución:** 1 de noviembre de 2026  
**Repositorio:** `AgusVukusic/Nexora-Videos`  
**Directorio de trabajo:** `VideoContenido/.agent/skills/nexora-reels/assets/plantilla/`  
**Rama:** `main`  
**Estado de aprobación:** **APTA (Cierre definitivo de Etapa 39B)**

---

## 1. Resumen Ejecutivo

La **Etapa 39B** incorpora a la arquitectura audiovisual de `nexora-reels` un sistema integral de **cámara 2.5D y movimiento espacial cinematográfico**, compuesto por cinco efectos coordinados, deterministas y gobernados por contrato:

1. **Cámara 2.5D:** Transformaciones espaciales continuas (`escala`, traslación `x/y`, `rotacion`, `origen`) interpoladas deterministamente vía frame de Remotion sin recortes accidentales ni dependencia del tiempo real.
2. **Parallax multinivel entre planos:** Profundidad diferenciada entre capas desacopladas dentro del *5-Layer Composite Stack* (`profundidadFondo: 0.3`, `profundidadAssets: 0.7`, `profundidadUI: 1.0`, `profundidadFrente: 1.3`), preservando subtítulos (factor `0.0`) y personajes en anclaje estable.
3. **Whip-pan:** Transición espacial de desplazamiento ultra-rápido en 4 ejes (`whip-pan-izq`, `whip-pan-der`, `whip-pan-arriba`, `whip-pan-abajo`) con aceleración/desaceleración senoidal, desenfoque dinámico calibrado y continuidad lockstep a distancia fija (1080px / 1920px), eliminando cualquier fotograma negro o salto de posición.
4. **Zoom-through:** Movimiento portal inmersivo donde la escena saliente escala hacia adelante ($1.0 \to 3.5\times$) con desvanecimiento suave de opacidad mientras la entrante emerge desde el túnel focal ($0.45 \to 1.0\times$).
5. **Transiciones Iris:** Apertura (`iris-apertura`) y cierre (`iris-cierre`) circulares mediante `clip-path: circle(...)` con radio progresivo de 0% a 150%, garantizando cobertura absoluta de las cuatro esquinas del lienzo vertical ($1080 \times 1920\text{ px}$) sin artefactos perimetrales.

### Hitos verificados
- **Compilación TypeScript:** 0 errores de tipado en `tsc --noEmit`.
- **Suite de pruebas automatizadas:** 101/101 pruebas superadas con éxito (100% passed).
- **Render real completo:** Generación de `salida/reel.mp4` a $1080 \times 1920\text{ px}$, $30\text{ fps}$, 481 fotogramas exactos (16.033333 s), verificado con FFprobe y sincronización audiovisual estricta.
- **Regresión visual clásica:** Evaluación píxel a píxel de 34 fotogramas históricos (70,502,400 píxeles evaluados) contra la línea base limpia: **0 diferencias de píxel (100% idéntico bit a bit)**.
- **Integridad criptográfica:** 262 de 262 archivos protegidos verificados mediante SHA-256 (100% de coincidencia exacta).
- **Políticas de Git:** Cero commits y cero pushes realizados.

---

## 2. Arquitectura Implementada

El sistema de movimiento espacial se implementó desacoplando las responsabilidades según la jerarquía de capas existente:

```
[ plan.json / plan.arte ]
           │
           ▼
[ resolverCamaraParaFrase() ] (motor/camara.ts)
           │
           ├───────────────────────────────┐
           ▼                               ▼
     [ Escena.tsx ]                 [ CapasCine.tsx ]
 (Transiciones espaciales:       (Cámara 2.5D y Parallax:
  - whip-pan (X/Y lockstep)       - Capa 1 BgMesh: factor 0.3
  - zoom-through                  - Capa 2 Assets: factor 0.7
  - iris apertura/cierre          - Capa 3 UI/Lienzo: factor 1.0)
  - clip-path y blur dinámico)             │
           │                               │
           └───────────────┬───────────────┘
                           ▼
                      [ Reel.tsx ]
         (Capa 43: FilmGrainGlobal fija
          Capa 44: Personaje anclado
          Capa 50: Subtítulos fijos factor 0.0)
```

### Principios de diseño respetados
- **Determinismo estricto:** Todo movimiento deriva exclusivamente de `frame / duracion` y curvas deterministas de `remotion` (`Easing.cubic`, `Easing.inOut`). Prohibido el uso de `Date.now()`, `Math.random()` o estados asíncronos.
- **Desactivación por defecto:** Si no se declara `camara` o el reel utiliza estilos clásicos, la configuración resulta inactiva (`activa: false`), devolviendo matrices de identidad y `transform: undefined`. Cero impacto en el DOM generado.
- **No invasión de escenas nativas:** Ninguna de las 17 escenas nativas fue modificada. Renderizan dentro de `<Lienzo>` en su espacio local de coordenadas ($960 \times 860\text{ px}$).

---

## 3. Contrato de Cámara

### 3.1 Definición tipada (`src/tipos.ts`)

```typescript
export type TransicionEspacial =
  | "whip-pan-izq"
  | "whip-pan-der"
  | "whip-pan-arriba"
  | "whip-pan-abajo"
  | "zoom-through"
  | "iris-apertura"
  | "iris-cierre";

export type TipoMovimientoCamara =
  | "estatica"
  | "empuje"
  | "paneo"
  | "orbital"
  | "zoom-in"
  | "zoom-out"
  | "travel-in"
  | "travel-out"
  | "custom";

export interface ParallaxConfig {
  activo?: boolean;
  intensidad?: number;
  profundidadFondo?: number;   // Defecto: 0.3
  profundidadAssets?: number;  // Defecto: 0.7
  profundidadUI?: number;      // Defecto: 1.0
  profundidadFrente?: number;  // Defecto: 1.3
}

export interface CamaraConfig {
  activa?: boolean;
  tipo?: TipoMovimientoCamara;
  escala?: number | [number, number];
  posicion?: [number, number] | [[number, number], [number, number]];
  origen?: string | [number, number];
  rotacion?: number | [number, number];
  duracion?: number;
  inicio?: number;
  curva?: "lineal" | "suave" | "in" | "out" | "in-out";
  parallax?: boolean | ParallaxConfig;
  zoomThrough?: {
    escalaMax?: number;
    puntoFocal?: [number, number];
    desenfoque?: boolean;
  };
  iris?: {
    tipo?: "apertura" | "cierre";
    centro?: [number, number];
    duracion?: number;
  };
  whipPan?: {
    direccion?: "izq" | "der" | "arriba" | "abajo";
    duracion?: number;
    desenfoque?: boolean;
    intensidadDesenfoque?: number;
  };
}
```

### 3.2 Precedencia de resolución
La configuración de cámara se resuelve deterministamente mediante la función `resolverCamaraParaFrase(plan, frase)` con la siguiente precedencia:

1. `frase.camara` (anulación o movimiento local para la frase activa).
2. `plan.arte.camara` (declaración global en el contrato de dirección de arte).
3. `plan.camara` (acceso directo en metadatos del plan).
4. `undefined` (inactivo por defecto, matriz identidad).

---

## 4. Descripción Detallada de los Cinco Efectos

### 4.1 Cámara 2.5D
- **Mecanismo:** El módulo `src/motor/camara.ts` normaliza los parámetros y calcula para cada frame:
  $$\text{progreso} = \text{clamp}\left(\frac{\text{frame} - \text{inicio}}{\text{duracion}}, 0, 1\right)$$
  $$t = \text{curva}(\text{progreso})$$
  $$\text{escala} = s_0 + (s_1 - s_0) \times t$$
  $$\vec{x} = \vec{x}_0 + (\vec{x}_1 - \vec{x}_0) \times t$$
  $$\theta = \theta_0 + (\theta_1 - \theta_0) \times t$$
- **Presets incorporados:**
  - `"empuje"`: escala de $1.0 \to 1.05\times$, curva suave.
  - `"paneo"`: desplazamiento lateral de $-30\text{ px} \to +30\text{ px}$.
  - `"orbital"`: rotación leve de $-1.2^\circ \to +1.2^\circ$ con escala de resguardo $1.02\times$.
  - `"zoom-in"`: escala $1.0 \to 1.15\times$, traslación vertical focal $(0, 0) \to (0, -20)\text{ px}$.
  - `"zoom-out"`: escala $1.15 \to 1.0\times$.
  - `"travel-in"`: aproximación compuesta $(-40, 20)\text{ px} \to (0, 0)\text{ px}$ con escala $1.0 \to 1.12\times$.
  - `"travel-out"`: alejamiento compuesto $(0, 0)\text{ px} \to (40, -20)\text{ px}$.

### 4.2 Parallax entre Planos
- **Mecanismo:** `CapasCine.tsx` recibe `camara` y modula la transformación de cada plano mediante su factor de profundidad $z$:
  $$\text{escala}_z = 1.0 + (\text{escala} - 1.0) \times (z \times \text{intensidad})$$
  $$\vec{x}_z = \vec{x} \times (z \times \text{intensidad})$$
  $$\theta_z = \theta \times (z \times \text{intensidad})$$
- **Valores por plano:**
  - Capa 1 (`BgMesh`): $z = 0.3$ (el fondo se desplaza al 30% de la velocidad aparente).
  - Capa 2 (`assets`): $z = 0.7$ (elementos de apoyo se mueven al 70%).
  - Capa 3 (`ui` y `children`): $z = 1.0$ (plano focal a velocidad 1:1).
  - Capa 50 (`Subtitulos`): $z = 0.0$ (fijo absoluto, inmóvil en pantalla).

### 4.3 Whip-Pan
- **Continuidad Lockstep:** En la ventana de solapamiento (`SOLAPE = 10` fotogramas):
  - Escena saliente ($i-1$): se desplaza desde $0$ hacia $+1080\text{ px}$ (whip-pan-izq).
  - Escena entrante ($i$): se desplaza desde $-1080\text{ px}$ hacia $0\text{ px}$.
  - Distancia relativa instantánea:
    $$\Delta x(t) = (t \times 1080) - ((1 - t) \times (-1080)) = 1080\text{ px}$$
    Permanece exactamente igual al ancho del viewport en todo momento: **0 gaps, 0 fotogramas negros, 0 solapamientos accidentales**.
- **Desenfoque dinámico (Motion Blur):**
  $$\text{blur}(t) = \text{maxBlur} \times \sin(t \times \pi)$$
  Alcanza un pico controlado de 10px en el centro de la transición ($t = 0.5$) y desciende suavemente a 0px en los extremos.

### 4.4 Zoom-Through
- **Dinámica de inmersión:**
  - Escena saliente: zoom acelerado de $1.0\times \to 3.5\times$ hacia el punto focal con desvanecimiento cuadrático de opacidad ($\text{opacity} = 1 - t^2$) y desenfoque óptico gradual.
  - Escena entrante: emerge desde el interior del túnel focal ($0.45\times \to 1.0\times$) con ganancia lineal de opacidad ($\text{opacity} = t$).
  - Punto focal configurable mediante `puntoFocal: [x, y]` (defecto: `[50, 40]`).

### 4.5 Transición Iris
- **Mecanismo:** Utiliza la propiedad CSS `clip-path: circle(radio at cx cy)`:
  - Apertura: el radio circular crece suavemente de $0\%$ a $150\%$.
  - Cierre: el radio decrece de $150\%$ a $0\%$.
- **Cobertura trigonométrica:** Dado el aspect ratio 9:16 ($1080 \times 1920\text{ px}$), la distancia desde el centro $(50\%, 50\%)$ al vértice más alejado es:
  $$d_{\text{max}} = \sqrt{(540)^2 + (960)^2} \approx 1101\text{ px} \approx 102\% \text{ del ancho}$$
  Un radio máximo de $150\%$ cubre holgadamente $1620\text{ px}$, eliminando cualquier recorte residual o artefacto en esquinas.

---

## 5. Archivos Modificados y Nuevos

| Archivo | Tipo | Rol en la Etapa 39B |
| :--- | :---: | :--- |
| `src/motor/camara.ts` | **Nuevo** | Motor cinemático 2.5D, normalización, curvas Easing y cálculo determinista. |
| `src/tipos.ts` | Modificado | Interfaces `CamaraConfig`, `ParallaxConfig`, `TransicionEspacial`, `Entrada`. |
| `src/motor/linea.ts` | Modificado | Registro de transiciones solapadas (`esTransicionSolapada`) para whip-pan, zoom-through e iris. |
| `src/motor/actual.ts` | Modificado | Validación de contrato de arte y frases para propiedades de cámara. |
| `src/CapasCine.tsx` | Modificado | Inyección de transformaciones de cámara y parallax multinivel por capa. |
| `src/Escena.tsx` | Modificado | Transiciones whip-pan (X/Y lockstep), zoom-through e iris (`clip-path`). |
| `src/Reel.tsx` | Modificado | Resolución y pase de configuración de cámara a cada secuencia de escena. |
| `src/escenas/util.ts` | Modificado | Re-exportación de utilidades de cámara para escenas y pruebas. |

---

## 6. Pruebas Automatizadas y Resultados

Se ejecutó la suite de pruebas unitarias y de integración `test_camara_25d.ts`, compilada y ejecutada con `esbuild` y `node`:

```
=== INICIANDO SUITE DE PRUEBAS: SISTEMA DE CÁMARA 2.5D Y MOVIMIENTO ESPACIAL (ETAPA 39B) ===

--- 1. CÁMARA 2.5D ---
[PASS] Cámara sin configuración está inactiva por defecto
[PASS] Cámara inactiva devuelve transform undefined
[PASS] Cámara inactiva tiene escala 1.0
[PASS] Cámara inactiva tiene traslación (0, 0)
[PASS] Preset empuje se activa correctamente
[PASS] Preset empuje tiene rango de escala [1.0, 1.05]
[PASS] Empuje en frame 0 tiene escala 1.0
[PASS] Empuje en frame final (60) alcanza escala máxima 1.05
[PASS] Determinismo: misma escala en mismo fotograma
[PASS] Determinismo: mismo string CSS transform
[PASS] Paneo inicia en X = -30px
[PASS] Paneo finaliza en X = +30px
[PASS] Origen de transformación CSS personalizado preservado
[PASS] Transformación contiene rotación CSS
[PASS] Transformación reporta transformOrigin correcto

--- 2. PARALLAX ENTRE PLANOS ---
[PASS] Parallax Fondo (profundidad 0.3) se desplaza exactamente 30px
[PASS] Parallax Assets (profundidad 0.7) se desplaza exactamente 70px
[PASS] Parallax UI (profundidad 1.0) se desplaza exactamente 100px
[PASS] Parallax Frente (profundidad 1.3) se desplaza exactamente 130px
[PASS] Subtítulos (factor 0.0) permanecen 100% inmóviles
[PASS] Subtítulos no tienen transformación CSS generada
[PASS] Continuidad temporal parallax en frame 0..60 (13 verificaciones)

--- 3. WHIP-PAN ---
[PASS] whip-pan-izq es reconocida como transición solapada
[PASS] whip-pan-der es reconocida como transición solapada
[PASS] whip-pan-arriba es reconocida como transición solapada
[PASS] whip-pan-abajo es reconocida como transición solapada
[PASS] Lockstep whip-pan-izq frame 0..10: delta constante 1080px (11 verificaciones)
[PASS] Lockstep whip-pan-arriba frame 0..10: delta vertical constante 1920px (11 verificaciones)
[PASS] Desenfoque en frame 0 es 0px
[PASS] Desenfoque en punto medio alcanza máximo 10px
[PASS] Desenfoque en frame final retorna a 0px

--- 4. ZOOM-THROUGH ---
[PASS] zoom-through es reconocida como transición solapada
[PASS] Escala salida y entrada en rango válido frame 0..10 (22 verificaciones)
[PASS] Opacidad inicial saliente es 1.0
[PASS] Opacidad final saliente es 0.0

--- 5. TRANSICIONES IRIS ---
[PASS] iris-apertura es reconocida como transición solapada
[PASS] iris-cierre es reconocida como transición solapada
[PASS] Radio iris apertura inicia en 0%
[PASS] Radio iris apertura al 50% es 75%
[PASS] Radio iris apertura final alcanza 150% (cobertura total de esquinas)
[PASS] Radio iris cierre inicia en 150%
[PASS] Radio iris cierre finaliza en 0%

--- 6. PRECEDENCIA DEL CONTRATO DE CÁMARA ---
[PASS] Precedencia: frase.camara prevalece sobre plan.arte.camara y plan.camara
[PASS] Precedencia: plan.arte.camara prevalece sobre plan.camara si frase no declara cámara
[PASS] Precedencia: plan.camara aplica como fallback global
[PASS] Precedencia: sin declaración devuelve undefined (inactivo por defecto)

--- 7. COMPATIBILIDAD CLÁSICA Y VALIDACIÓN ---
[PASS] Plan clásico pasa validación de contrato de arte sin problemas
[PASS] Plan con configuración de cámara válida pasa sin problemas

======================================================
RESUMEN DE PRUEBAS AUTOMATIZADAS:
Total pruebas ejecutadas: 101
Total pruebas superadas:  101 (100%)
Total fallos:             0
[OK] Todas las pruebas unitarias y de integración superadas con éxito.
======================================================
```

---

## 7. Render Real y Parámetros

Se ejecutó un renderizado audiovisual completo de validación mediante `render.mjs video` utilizando el plan maestro `plan.camara_39b.json` en el motor de validación:

- **Composición:** `La mentira del microondas`
- **Mundo visual:** `cinematic-dark`
- **Frases / Escenas:** 5 frases (titular, chat, imagen, lista, cta).
- **Efectos aplicados en el plan:**
  1. Frase 1: Cámara 2.5D `zoom-in` ($1.0 \to 1.12\times$, traslación vertical).
  2. Transición 1 $\to$ 2: `whip-pan-der` (paneo rápido horizontal con blur).
  3. Frase 2: Parallax multinivel ($z_{\text{fondo}}=0.25$, $z_{\text{assets}}=0.7$, $z_{\text{ui}}=1.0$).
  4. Transición 2 $\to$ 3: `zoom-through` ($1.0 \to 3.5\times$).
  5. Frase 3: Cámara `empuje` hacia el magnetrón.
  6. Transición 3 $\to$ 4: `iris-apertura` circular ($0\% \to 150\%$).
  7. Frase 4: Cámara `orbital` con rotación suave y parallax.
  8. Transición 4 $\to$ 5: `whip-pan-izq`.
  9. Frase 5: Cámara `travel-in` hacia el CTA.
- **Tiempos de render medidos:**
  - Trozo 1/3 (fotogramas 0…239): 29.3 s
  - Trozo 2/3 (fotogramas 240…479): 27.9 s
  - Trozo 3/3 (fotogramas 480…480): 1.2 s
  - Ensamblado final FFmpeg: 1.2 s
  - **Tiempo total de render:** 59.6 s

---

## 8. Validación Técnica con FFprobe

La inspección forense del archivo generado `salida/reel.mp4` mediante `ffprobe` confirmó exactitud absoluta en todos los parámetros técnicos:

```json
{
  "streams": [
    {
      "codec_name": "h264",
      "width": 1080,
      "height": 1920,
      "r_frame_rate": "30/1",
      "avg_frame_rate": "4810/161",
      "duration": "16.033333",
      "nb_read_packets": "481"
    },
    {
      "codec_name": "aac",
      "sample_rate": "48000",
      "channels": 2,
      "duration": "16.021333",
      "nb_read_packets": "752"
    }
  ],
  "format": {
    "duration": "16.033333",
    "size": "5700193",
    "bit_rate": "2844171"
  }
}
```

### Hallazgos de FFprobe
1. **Fotogramas exactos:** 481 fotogramas leídos (`nb_read_packets: 481`), coincidencia 1:1 con la suma de los chunks de Remotion ($240 + 240 + 1 = 481$). Cero frames perdidos.
2. **Duración exacta:** 16.033333 s a 30 FPS.
3. **Resolución:** $1080 \times 1920\text{ px}$.
4. **Códecs:** Vídeo H.264 (YUV420p) y Audio AAC 48 kHz estéreo.
5. **Sincronización:** Sin desfase perceptible entre la pista de voz, efectos SFX y la cinemática de cámara.

---

## 9. Evidencia Visual e Inspección de Fotogramas

Se generaron la hoja de contacto (`salida/hoja.png`) y 9 capturas fijas de momentos críticos, preservadas en `scratch/render_39b_camara/stills/`:

| Archivo | Fotograma | Tiempo | Efecto demostrado |
| :--- | :---: | :---: | :--- |
| `frame_030_camara_25d_zoom_in.png` | 30 | 1.00 s | Cámara 2.5D: escala suave $1.06\times$, traslación vertical sin corte. |
| `frame_100_transicion_whip_pan_der.png` | 100 | 3.33 s | Transición Whip-pan: desplazamiento lateral continuo con blur moderado. |
| `frame_150_parallax_chat_multinivel.png` | 150 | 5.00 s | Parallax: fondo a 25%, UI a 100%, subtítulos y personaje estables. |
| `frame_190_transicion_zoom_through.png` | 190 | 6.33 s | Zoom-through: escena de chat escalando a $2.5\times$ con opacidad translúcida. |
| `frame_230_escena_imagen_magnetron.png` | 230 | 7.66 s | Cámara empuje sobre imagen en modo `cinematic-dark`. |
| `frame_260_transicion_iris_apertura.png` | 260 | 8.66 s | Iris: apertura circular con `clip-path` expandiéndose al 75% sin artefactos. |
| `frame_320_camara_orbital_lista.png` | 320 | 10.66 s | Movimiento orbital: leve inclinación angular con escala de resguardo. |
| `frame_355_transicion_whip_pan_izq.png` | 355 | 11.83 s | Whip-pan izquierdo: desplazamiento lockstep sin gaps hacia CTA. |
| `frame_420_camara_travel_in_cta.png` | 420 | 14.00 s | Travel-in hacia el llamado a la acción final con subtítulo desactivado. |

### Resultados de la inspección visual
- **Bordes de composición:** Sin fugas ni líneas negras periféricas gracias a `overflow: "hidden"` y escalado mínimo preventivo.
- **Legibilidad de subtítulos:** Los subtítulos permanecen 100% estables, fijos en su posición $Y$ predeterminada y perfectamente legibles en todo momento (factor $0.0$).
- **Personaje:** Conserva su anclaje anatómico y sombras sin deformarse por el movimiento de capas internas.
- **Fluidez y continuidad:** Transiciones suaves, sin parpadeos, saltos de posición ni fotogramas vacíos.

---

## 10. Rendimiento y Caché

1. **Tiempo de compilación y bundle:** El bundle de Remotion se completó en 3.9 s a 5.5 s, sin impacto medible por la incorporación del módulo `camara.ts`.
2. **Tiempo de render por fotograma:** ~124 ms/frame en Chromium local con aceleración por software/GPU estándar.
3. **Impacto de filtros CSS:** El filtro `blur` está estrictamente acotado a la ventana veloz del whip-pan (máximo 10px en ~6 frames), evitando cualquier degradación de rendimiento.
4. **Preservación de huellas de caché:**
   - La función `huellaVideo()` y `huellaAudio()` en `render.mjs` se mantuvieron intactas.
   - La partición de chunks ($240 + 240 + 1$) y la caché de audio se preservaron al 100%.

---

## 11. Regresión Visual Clásica

Para garantizar que ningún reel histórico o estilo clásico reciba alteraciones visuales no deseadas:

1. Se cargó el plan clásico de referencia `plan.clasico.json` (estilo `nube`, sin contrato de arte ni configuración de cámara).
2. Se generaron las 34 capturas fotográficas estándar mediante `node render.mjs fotos`.
3. Se realizó una comparación automatizada píxel a píxel contra las 34 imágenes de la línea base pre-39A/pre-39B limpia (`nexora-baseline-clean/salida/`):

```
Total baseline frames to compare: 34
Total frames evaluated: 34
Total pixels evaluated: 70,502,400
Frames with differences: 0
[OK] 100% BIT-BY-BIT IDENTICAL MATCH ON ALL 34 CLASSICAL FRAMES (0 DIFFERENCES)!
```

**Resultado:** Coincidencia exacta bit a bit en los 34 fotogramas (0 diferencias sobre 70.5 millones de píxeles evaluados). La compatibilidad hacia atrás es absoluta.

---

## 12. Integridad de Archivos Protegidos

Se ejecutó la verificación criptográfica SHA-256 sobre los 262 archivos protegidos del repositorio contra el registro de huellas base:

```
Baseline contains: 262 files
Missing: 0
Mismatches: 0
[OK] 262/262 protected files intact (100% cryptographic match)!
```

Ningún archivo protegido (`becario-reels`, `reel-microondas`, `VideoFactory`, `napkin`, etc.) fue modificado, eliminado ni corrompido.

---

## 13. Limitaciones y Dictamen Técnico

### Limitaciones identificadas
1. **Filtro de desenfoque en sistemas sin aceleración GPU:** En entornos headless con emulación pura por CPU de Chromium, valores de desenfoque superiores a 15px en `whip-pan` pueden incrementar el tiempo de render en un 15-20%. Por esta razón, se fijó el valor por defecto en 10px y se incluyó la opción `desenfoque: false` para desactivarlo si fuera necesario.
2. **Escala en Zoom-Through:** Factores de zoom superiores a $4.5\times$ sobre imágenes de baja resolución pueden generar pixelación aparente del recurso visual antes de que la opacidad caiga a 0. Se recomienda utilizar activos vectoriales o imágenes de al menos $1080 \times 1080\text{ px}$.

### Dictamen Técnico Final
La **Etapa 39B** cumple rigurosamente con todos los requerimientos funcionales, arquitectónicos y de calidad establecidos:
- Cámara 2.5D, Parallax multinivel, Whip-pan, Zoom-through e Iris implementados y verificados.
- 101/101 pruebas automatizadas aprobadas.
- Renders reales validados mediante FFprobe.
- 0 regresión visual clásica comprobada sobre 70.5M de píxeles.
- 262/262 archivos protegidos intactos.
- Cero dependencias npm externas incorporadas.
- Cero commits y pushes no autorizados.

Se declara la Etapa 39B como **APTA** para su cierre formal. Se aguarda la revisión y autorización expresa del usuario antes de proceder con cualquier etapa posterior del roadmap.

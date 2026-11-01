# 18. Auditoría de Integración del Motor Visual de Nexora Reels — Etapa 5.1
## Skill `nexora-reels` • Team Nexora

---

### 1. Resumen Ejecutivo

- **Objetivo de la Etapa 5.1:** Auditar técnicamente el flujo completo de producción audiovisual procedente de `becario-reels` y evaluar la integración ordenada, no destructiva y modular de los componentes cinematográficos desarrollados en las etapas 1 a 4.1 (`theme.ts`, `CapasCine.tsx`, `anim.ts`, `Escena.tsx` y `TextoRevelado.tsx`) en la nueva skill independiente `nexora-reels`.
- **Naturaleza de la Etapa:** Exclusivamente de **auditoría, diagnóstico y arquitectura de planificación**. No se han aplicado cambios funcionales ni se han modificado archivos protegidos.
- **Hallazgos Principales:**
  1. **Separación de Responsabilidades Impecable:** El sistema original desacopla nítidamente las tareas de preproducción y alineación de audio en Python (`preparar.py`, `voz.py`, `alinear.py`, `poses.py`) de la composición visual en Remotion (`linea.ts`, `Reel.tsx`, `Root.tsx`) y del renderizado por trozos en Node.js (`render.mjs`). Esto permite incorporar el nuevo motor visual en Remotion sin tener que alterar el pipeline de Python.
  2. **Viabilidad de las 17 Escenas Nativas:** Las 17 escenas nativas (`titular`, `chat`, `editor`, `movil`, `contador`, `cifras`, `ficha`, `lista`, `pasos`, `comparacion`, `tachado`, `objecion`, `pregunta`, `barras`, `imagen`, `galeria` y `cta`) son plenamente preservables. Ninguna debe descartarse ni reemplazarse por una plantilla genérica.
  3. **Mapeo de Capas y Contenedores:** El componente [`Escena.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/Escena.tsx) y su pila [`CapasCine.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/CapasCine.tsx) pueden sustituir al envoltorio arcaico `motor/Escena.tsx` (que imponía zoom continuo forzado de cámara y semitonos rígidos) envolviendo al componente adaptativo `Lienzo.tsx`, manteniendo intactas las coordenadas de maquetación (60–1020, 210–1070) de cada escena.
  4. **Coexistencia Tipográfica y Cinemática:** `TextoRevelado.tsx` debe aplicarse selectivamente en titulares secundarios, tarjetas y preguntas, pero **NO** debe sustituir el motor interno de `titular.tsx` (que utiliza alineación audio-palabra directa con `measureText`) ni el sistema de subtítulos karaoke (`SubtitulosLinea`/`SubtitulosBloque`), preservando la sincronización labio-voz.
- **Veredicto:** **INTEGRACIÓN VIABLE CON CONDICIONES**  
  *(La arquitectura es robusta y compatible, pero requiere una migración por capas aisladas para adaptar los tokens de estilo a `THEME`, evitar duplicación de fondos/grano y validar fotograma a fotograma cada escena antes del primer reel de producción).*

---

### 2. Inventario de Archivos Inspeccionados

Se examinaron en profundidad los siguientes archivos reales del repositorio:

| Archivo Inspeccionado | Rol en el Sistema | Observación Técnica Principal |
| :--- | :--- | :--- |
| `.agent/skills/becario-reels/scripts/preparar.py` | Bootstrap del proyecto | Copia plantilla, instala dependencias npm, localiza binarios de Chrome/FFmpeg y escribe `entorno.json`. |
| `.agent/skills/becario-reels/scripts/voz.py` | Extracción de guion | Extrae frases con etiquetas de emoción de ElevenLabs (`[excited]`) o limpias. Escribe `salida/voz.txt`. |
| `.agent/skills/becario-reels/scripts/alinear.py` | Procesamiento y alineación de audio | Recorta pausas ($\le 0.26\text{ s}$), normaliza a $-14\text{ LUFS}$, genera `public/voz.wav` y calcula timestamps de palabras en `tiempos.json`. |
| `.agent/skills/becario-reels/scripts/poses.py` | Visión por computador / Poses | Normaliza tamaño y posición de cabeza para evitar saltos entre poses del personaje. Escribe `poses.json`. |
| `.agent/skills/becario-reels/scripts/ritmo.py` | Control de calidad post-render | Analiza diferencias de píxeles en escala de grises en 3 zonas verticales y baldosas de $90\times 80\text{ px}$. Falla si hay pausas visuales $>0.6\text{ s}$. |
| `.agent/skills/becario-reels/scripts/sonidos.py` | Síntesis de audio determinista | Genera 17 efectos de sonido en WAV (48 kHz mono, pico $-1\text{ dBFS}$) usando filtros Scipy sin dependencias externas. |
| `.agent/skills/becario-reels/assets/plantilla/render.mjs` | Orquestador de render Remotion | Renderiza video por trozos de 240 frames (8 s), genera hojas de contacto (`fotos`), mezcla audio con FFmpeg (`amix`) y recompone a $\le 28\text{ MB}$. |
| `.agent/skills/becario-reels/assets/plantilla/src/tipos.ts` | Contrato de datos | Define `Plan`, `FrasePlan`, `EscenaPlan`, `PropsEscena`, `DefEscena`, `Tiempos`. |
| `.agent/skills/becario-reels/assets/plantilla/src/motor/actual.ts` | Configuración activa | Vincula `plan.json`, estilos y define `LIENZO = {x:60, y:210, w:960, h:860}`, `ZONA` y `SUB_Y`. |
| `.agent/skills/becario-reels/assets/plantilla/src/motor/linea.ts` | Motor temporal | Resuelve momentos `"en"`, calcula solapes de transición (`ini`, `fin`, `corte`), valida escenas y programa eventos de audio y poses. |
| `.agent/skills/becario-reels/assets/plantilla/src/motor/Escena.tsx` | Envoltorio original | Impone `empuje = 0.035` continuo, transición suave con desenfoque y semitono con círculos SVG. |
| `.agent/skills/becario-reels/assets/plantilla/src/motor/Lienzo.tsx` | Adaptador de maquetación | Escala y traslada el lienzo de coordenadas fijas hacia la `ZONA` libre de subtítulos y personaje. |
| `.agent/skills/becario-reels/assets/plantilla/src/motor/Fondo.tsx` | Fondo procedural legado | Fondo global con degradado lineal, manchas de luz senoidales y textura de grano (`grano.png`). |
| `.agent/skills/becario-reels/assets/plantilla/src/Reel.tsx` | Composición raíz del reel | Secuencia de escenas, capas de subtítulos, personaje, voz y efectos de sonido. |
| `.agent/skills/becario-reels/assets/plantilla/src/Root.tsx` | Registro de Remotion | Registra `Reel` (con `calculateMetadata: resumen()`), `Portada`, `PortadaCheck` y `Mosaico`. |
| `.agent/skills/becario-reels/assets/plantilla/src/escenas/*.tsx` | Biblioteca de 17 escenas | `titular.tsx`, `apps.tsx` (3 escenas), `tarjetas.tsx` (10 escenas), `fotos.tsx` (2 escenas), `cta.tsx` (1 escena). |

---

### 3. Diagrama del Flujo de Producción Actual

```
                        [ Guion / Prompt del Usuario ]
                                      │
                                      ▼
                        [ src/datos/plan.json ]
                         (Estructura y Escenas)
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
       [ scripts/voz.py ]                             [ scripts/poses.py ]
              │                                               │
              ▼                                               ▼
     (Grabación / TTS)                              [ src/datos/poses.json ]
     public/voz.wav / VOZ.mp3                        (Medidas de cabeza)
              │
              ▼
     [ scripts/alinear.py ]
   (-14 LUFS, recorta silencios)
              │
              ├───────────────────────────────────────────────┐
              ▼                                               ▼
      public/voz.wav                               [ src/datos/tiempos.json ]
     (Audio limpio 48kHz)                            (Timestamps de palabras)
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      ▼
                       [ src/motor/linea.ts & actual.ts ]
                     (Cálculo de ini/fin, momentos "en",
                      asignación de b[], validación, resumen)
                                      │
                                      ▼
                           [ src/Root.tsx & Reel.tsx ]
                     (Composición de Remotion a 1080x1920)
                       ┌──────────────┴──────────────┐
                       ▼                             ▼
                [ Capas de Audio ]            [ Capas Visuales ]
               - public/voz.wav              - Fondo procedural
               - public/sonidos/*.wav        - Escenas (1..N en Lienzo)
                                             - Subtítulos sincronizados
                                             - Personaje con poses
                                      │
                                      ▼
                          [ render.mjs (Node.js) ]
                ┌─────────────────────┴─────────────────────┐
                ▼                                           ▼
      [ Remotion renderMedia ]                      [ FFmpeg Audio Mix ]
      (Trozos de video 240 frames,                 (Mezcla voz + SFX con
       sin audio, concurrency: 2)                   adelay y atrim exactos)
                └─────────────────────┬─────────────────────┘
                                      ▼
                            [ FFmpeg Concat & Mux ]
                         (salida/reel.mp4 a 1080x1920)
                                      │
                                      ▼
                           [ scripts/ritmo.py ]
                     (QA: Control de huecos visuales)
```

---

### 4. Auditoría Exhaustiva de las 17 Escenas Nativas

Se examinó el código fuente de cada escena para evaluar su función, props, animaciones internas y compatibilidad con el nuevo motor:

| N.º | Identificador | Archivo Fuente | Función Narrativa y Visual | Props Principales | Momentos (`en`) | Animaciones Propias | Clasificación de Integración |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **1** | `titular` | `escenas/titular.tsx` | Gancho del reel. Título gigante con revelado palabra a palabra según la voz, palabras de énfasis (`*palabra*`) en letra a mano y abanico de imágenes o icono central. | `texto`, `etiqueta`, `etiquetaGrande`, `icono`, `imagenes` | 1 | `measureText`, reveal sincronizado con audio (`p.palabras`), físicas de abanico con `spring`, badge `lerp`, pop de icono. | **Adaptación Menor** (Preservar su sincronizador con voz; mapear estilos a `THEME`). |
| **2** | `chat` | `escenas/apps.tsx` | Simulación de conversación con asistente IA. Prompt del usuario, respuesta generativa de código y vista previa en móvil. | `mensaje`, `titulo`, `saludo`, `respuesta`, `archivo`, `movil`, `pildora`, `anotacion` | 5 | Subida elástica de ventana, pop de burbuja de chat, streaming de código, floating de móvil (`useFlota`). | **Compatible Directamente** (Mapear colores a tokens oscuros). |
| **3** | `editor` | `escenas/apps.tsx` | Revelación meta-visual: zoom-out que expone el reel dentro de una interfaz de edición de video con pistas. | `hecho`, `archivo`, `palabras`, `sonidos` | 4 | Retroceso de cámara (`interpolate`), chips voladores hacia pistas de subtítulos y audio. | **Compatible Directamente**. |
| **4** | `movil` | `escenas/apps.tsx` | Mockup de teléfono móvil con pantalla interactiva, pegatina pop y contador dinámico. | `titulo`, `subtitulo`, `icono`, `pegatina`, `contador` | 3 | Entrada elástica de dispositivo, contador con incremento progresivo, pop de sticker. | **Compatible Directamente**. |
| **5** | `contador` | `escenas/tarjetas.tsx` | Tarjeta con cifra numérica masiva que cuenta en vivo hasta el valor objetivo, barra de progreso y golpe final (*bump*). | `valor`, `etiqueta`, `desde`, `prefijo`, `sufijo`, `icono`, `llama`, `destacar` | 2 | Tarjeta con resorte, conteo con `interpolate`, barra de relleno, pulso `bump` al llegar al valor. | **Compatible Directamente** (Candidato a `useMultiSpring`). |
| **6** | `cifras` | `escenas/tarjetas.tsx` | Muestra hasta 3 filas métricas con números destacados, etiquetas a mano y barritas animadas. | `filas` (array de hasta 3 objetos) | 1–3 | Entradas escalonadas (`usePop`), contadores independientes, barras oscilantes. | **Compatible Directamente**. |
| **7** | `ficha` | `escenas/tarjetas.tsx` | Tarjeta de especificaciones técnicas: título con icono y hasta 4 pares de datos «etiqueta $\to$ valor». | `titulo`, `icono`, `etiqueta`, `filas` | 1–4 | Entrada general de tarjeta, revelado escalonado de filas con `usePop`, realce cromático. | **Compatible Directamente**. |
| **8** | `lista` | `escenas/tarjetas.tsx` | Lista de comprobación interactiva (2 a 5 ítems) con checks animados que se marcan secuencialmente. | `titulo`, `items` (2 a 5) | 2–5 | Entrada en cascada (*stagger* con `usePop`), marcado de tick verde/acento. | **Compatible Directamente**. |
| **9** | `pasos` | `escenas/tarjetas.tsx` | Proceso numerado (2 a 4 fases) interconectadas mediante flechas direccionales. | `pasos` (2 a 4) | 2–4 | Despliegue secuencial de pasos numerados y flechas conectoras. | **Compatible Directamente**. |
| **10** | `comparacion` | `escenas/tarjetas.tsx` | Comparativa lado a lado («VS»). Dos tarjetas enfrentadas; la ganadora se resalta y la perdedora se atenúa. | `izquierda`, `derecha`, `ganador` | 3 | Deslizamiento de tarjetas, badge VS elástico, resplandor del ganador y desvanecimiento del perdedor. | **Compatible Directamente**. |
| **11** | `tachado` | `escenas/tarjetas.tsx` | «No es X: es Y». Muestra X, traza una cruz/tachón rojo encima, lo desplaza y presenta Y en tamaño gigante. | `antes`, `despues`, `icono`, `imagen`, `modo` | 2 | Dibujo de línea diagonal roja, desplazamiento vertical, entrada de Y con acento o bloque de código. | **Compatible Directamente** (Opcional: titular Y con `TextoRevelado`). |
| **12** | `objecion` | `escenas/tarjetas.tsx` | Destructor de mitos. Bocadillo flotante con duda/interrogante seguido de una píldora con la respuesta contundente. | `texto`, `respuesta`, `numero` | 2 | Pop elástico de bocadillo con flotación (`useFlota`), vibración de interrogantes, pop de respuesta. | **Compatible Directamente**. |
| **13** | `pregunta` | `escenas/tarjetas.tsx` | Cuestionario interactivo con opciones múltiples (A, B, C...) y revelación de la alternativa correcta en verde. | `pregunta`, `opciones` (2 a 4), `correcta` | 3 | Entrada de pregunta, cascada de opciones con `usePop`, cambio cromático y check de la correcta. | **Compatible Directamente**. |
| **14** | `barras` | `escenas/tarjetas.tsx` | Gráfico de barras horizontales/verticales que crecen dinámicamente con etiquetas de valores y porcentajes. | `barras` (2 a 5), `titulo`, `unidad`, `destacar` | 2–5 | Crecimiento progresivo de barras con `lerp`, fade de etiquetas numéricas. | **Compatible Directamente**. |
| **15** | `imagen` | `escenas/fotos.tsx` | Fotografía/ilustración enmarcada con efectos de sombreado y procesado procedimental (ondas de agua, cáusticas, partículas). | `imagen`, `formato`, `texto`, `etiqueta`, `efectos`, `peces` | 2 | Resorte de marco, shaders procedurales (cáusticas, haces de luz, partículas), flotación. | **Adaptación Menor** (Coordinar efectos con capa 5 de `CapasCine`). |
| **16** | `galeria` | `escenas/fotos.tsx` | Muestra de 2 a 6 imágenes con modos de presentación: abanico desplegable, órbita o cuadrícula con zoom. | `imagenes` (2 a 6), `modo`, `etiqueta`, `centro`, `destacar` | 2 | Despliegue angular de abanico, rotación orbital senoidal/cosenoidal, zoom de cuadrícula. | **Adaptación Menor** (Comprobar límites de safe zone vertical). |
| **17** | `cta` | `escenas/cta.tsx` | Llamada a la acción final: «Comenta PALABRA» con efecto mecanografía, sobre volador 3D, confeti e iconos rebotando en bucle. | `palabra`, `verbo`, `texto`, `iconos` | 3 | Mecanografía letra a letra, vuelo parabólico de sobre, física de confeti, bucle de iconos saltarines. | **Compatible Directamente**. |

#### Conclusión del Catálogo:
- **0 escenas descartadas:** La totalidad de las 17 escenas aportan un valor de retención crucial para el formato corto vertical.
- **14 escenas compatibles de forma inmediata o menor:** Sus componentes solo requieren vincular los tokens de color (`C`) y tipografías (`F`) a `THEME`.
- **3 escenas con adaptación cuidadosa:** `titular` (por su sincronización fonética estricta), e `imagen`/`galeria` (para evitar solapamientos con las capas de posprocesado de `CapasCine`).

---

### 5. Compatibilidad e Integración del Nuevo Motor Visual

#### 5.1. `CapasCine` (Pila de 5 Capas)
- **Problema en `becario-reels`:** El fondo se renderiza de forma estática y global al fondo del reel (`<Fondo />` en `Reel.tsx`), mientras que cada escena vive en un plano flotante sin etalonaje cromático (*color grade*) ni viñeta óptica coordinada.
- **Estrategia en `nexora-reels`:**
  - `CapasCine` se gestiona por escena a través del componente maestro [`Escena.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/Escena.tsx).
  - Cada escena proyecta su contenido (`Comp` dentro de `Lienzo`) en la **Capa 3 (UI)** de `CapasCine`.
  - La **Capa 1 (Fondo)** utiliza el fondo procedural `BgMesh` configurado desde `theme.ts` (`#0b0d14` a `#1e1b4b`). Si dos escenas contiguas usan transición `"corte"`, el fondo se percibe continuo y homogéneo.
  - La **Capa 4 (ColorGrade)** y **Capa 5 (PostProcess)** aplican el tratamiento cinematográfico de viñeta y temperatura de color unificado para todo el video, desactivando el grano legado de `Fondo.tsx` para evitar doble filtrado.

#### 5.2. `Escena.tsx` como Contenedor Común
- **Eliminación del Empuje Forzado:** En `becario-reels`, `Escena.tsx` aplicaba un empuje de zoom obligatorio (`empuje = 0.035`, `translateY(-10px)`) en todas las escenas, generando fatiga visual y distorsionando gráficos de precisión. En `nexora-reels`, `empuje: 0` por defecto.
- **Nuevas Transiciones Deterministas:** La nueva `Escena.tsx` soporta nativamente transiciones cinematográficas:
  - `"corte"` (cero transformaciones, coste nulo de render).
  - `"suave"` (disolución de opacidad con micro-desenfoque de cámara).
  - `"deslizar-arriba"` y `"deslizar-abajo"` (desplazamiento vertical limpio con resorte).
  - `"disolver"` (fundido cruzado lineal).
- **Evitación de Doble Transición:** El componente de escena (`Comp`) gestiona exclusivamente los momentos internos $b_0, b_1, \dots$ de sus elementos; la transición de entrada y salida la gestiona únicamente `Escena.tsx` en los bordes de la secuencia.

#### 5.3. `TextoRevelado.tsx` (Tipografía Cinética)
- **Dónde sí debe integrarse:**
  - Títulos de apertura o cierres en tarjetas (`contador`, `tachado`, `objecion`, `pregunta`).
  - Escenas personalizadas (`src/propias/`).
- **Dónde no debe sustituir el código existente:**
  - **No sustituir en `titular.tsx`:** El gancho inicial depende de una coincidencia fonética exacta palabra por palabra (`p.palabras[k].f`), con medición física de cajas mediante `measureText` y alternancia de tipografía manuscrita. `TextoRevelado` utiliza un intervalo temporal fijo en fotogramas (`intervalo`), no alineado fonema a fonema con el audio.
  - **No sustituir en subtítulos (`Subtitulos.tsx`):** El sistema de subtítulos ya implementa resaltado tipo karaoke acoplado a `tiempos.json`.

#### 5.4. `anim.ts` (Físicas de Resortes y Cinemática)
- **Coexistencia Total:** En la Etapa 2 se implementó en `nexora-reels/assets/plantilla/src/motor/anim.ts` la totalidad de las primitivas originales (`usePop`, `useSuave`, `lerp`, `useFlota`, `bump`, `rnd`, `numeroES`).
- **Nuevas Capacidades Disponibles:** Las escenas pueden adoptar progresivamente `useMultiSpring` (físicas multieje `bouncy`/`snappy`/`gentle`) y `useBreathing` (oscilación senoidal determinista) sin obligar a reescribir las animaciones probadas de las 17 escenas.

---

### 6. Compatibilidad con el Procesamiento Audiovisual

| Módulo Audiovisual | Función Técnica | Compatibilidad con el Motor Visual | Puntos de Atención / Riesgos Mitigados |
| :--- | :--- | :---: | :--- |
| **`alinear.py`** | Sincronización voz-texto y generación de `tiempos.json`. | **100% Compatible** | Opera exclusivamente en preproducción. Genera `tiempos.json` y `public/voz.wav` independientemente del motor gráfico. |
| **Normalización LUFS** | `-14 LUFS` aplicado por `alinear.py` mediante FFmpeg `loudnorm`. | **100% Compatible** | Proceso de audio puro en Python. No colisiona con Remotion. |
| **Control de Ritmo (`ritmo.py`)** | Detección de pausas visuales $>0.6\text{ s}$ en fotogramas de $540\times 960$. | **100% Compatible** | Las animaciones de `anim.ts` y las transiciones de `Escena.tsx` generan eventos de movimiento suficientes para evitar falsos positivos de congelación. |
| **Poses del Personaje (`poses.py`)** | Medición y anclaje de cabeza en `poses.json`. | **100% Compatible** | El personaje se renderiza en una capa superior independiente en `Reel.tsx` (`<Personaje />`), por encima de las escenas y sus capas. |
| **Efectos de Sonido (`sonidos.py`)** | Programación de SFX deterministas en `linea.ts` (`EFECTOS`). | **100% Compatible** | `Escena.tsx` no altera la programación de `b[]` ni de `esc.def.sonidos`. `render.mjs` los mezcla con FFmpeg en los milisegundos exactos. |
| **Renderizado por Trozos (`render.mjs`)** | Render en bloques de 240 frames y multiplexación final con FFmpeg. | **100% Compatible** | Todos los componentes del nuevo motor son funciones puras y deterministas de `useCurrentFrame()`. El renderizado en trozos no produce costuras ni artefactos. |

---

### 7. Arquitectura de Integración Propuesta

Para garantizar modularidad, bajo costo y cero rotura del sistema probado, se propone la siguiente arquitectura:

```
.agent/skills/nexora-reels/
├── SKILL.md
├── references/
│   ├── escenas.md
│   ├── estilos.md
│   ├── ingenieria-remotion.md
│   └── patrones-motion.md
├── scripts/
│   ├── preparar.py        (Bootstrap y comprobación del entorno)
│   ├── voz.py             (Extracción de texto para voz)
│   ├── alinear.py         (Alineación fonética y -14 LUFS)
│   ├── poses.py           (Normalización de cabeza del personaje)
│   ├── ritmo.py           (QA de ritmo visual post-render)
│   └── sonidos.py         (Síntesis determinista de SFX)
└── assets/
    └── plantilla/
        ├── package.json
        ├── tsconfig.json
        ├── render.mjs     (Render por trozos y mezcla FFmpeg)
        ├── public/
        │   ├── fuentes/   (Fuentes WOFF2 con licencias OFL)
        │   ├── sonidos/   (17 SFX deterministas en WAV)
        │   └── texturas/  (Texturas opcionales de cáusticas/grano)
        └── src/
            ├── motor/
            │   ├── theme.ts            [NUEVO] (Tokens centralizados Nexora)
            │   ├── anim.ts             [HÍBRIDO] (usePop, lerp + useMultiSpring, useBreathing)
            │   ├── CapasCine.ts        [NUEVO] (Re-export)
            │   ├── Escena.ts           [NUEVO] (Re-export)
            │   ├── TextoRevelado.ts    [NUEVO] (Re-export)
            │   ├── actual.ts           [ADAPTADO] (Mapea plan.json, ZONA y tokens THEME)
            │   ├── linea.ts            [ADAPTADO] (Soporta transiciones deslizar y nuevas entradas)
            │   ├── Lienzo.tsx          (Envoltorio adaptativo de pantalla)
            │   ├── Personaje.tsx       (Render del personaje)
            │   └── Subtitulos.tsx      (Subtítulos sincronizados)
            ├── escenas/                (Las 17 escenas nativas adaptadas a THEME)
            │   ├── index.ts            (BIBLIOTECA)
            │   ├── titular.tsx
            │   ├── apps.tsx            (chat, editor, movil)
            │   ├── tarjetas.tsx        (10 escenas de datos/tarjetas)
            │   ├── fotos.tsx           (imagen, galeria)
            │   ├── cta.tsx
            │   └── util.ts
            ├── piezas/                 (Componentes UI: basicas, ventanas, imagenes)
            ├── propias/                (Escenas libres del usuario)
            ├── CapasCine.tsx           [NUEVO] (Pila de 5 capas)
            ├── Escena.tsx              [NUEVO] (Master wrapper con transiciones)
            ├── TextoRevelado.tsx       [NUEVO] (Tipografía cinética corregida)
            ├── Reel.tsx                [ADAPTADO] (Orquesta Escena + Lienzo + Comp)
            ├── Root.tsx                (Composiciones de Remotion)
            └── tipos.ts                (Contratos de tipos)
```

#### Principios Clave de la Arquitectura:
1. **Contrato `PropsEscena` Invariable:** Cada una de las 17 escenas sigue recibiendo `{ p, b, dur, palabras, i }`. Su lógica interna permanece autónoma y desacoplada del contenedor.
2. **Orquestación en `Reel.tsx`:**
   ```tsx
   <Sequence key={e.i} from={e.ini} durationInFrames={e.dur}>
     <Escena dur={e.dur} entrada={e.entrada} salida={e.salida}>
       <Lienzo>
         <Comp p={e.p} b={e.b} dur={e.dur} palabras={e.palabras} i={e.i} />
       </Lienzo>
     </Escena>
   </Sequence>
   ```
3. **Compatibilidad Hacia Atrás:** Un `plan.json` escrito con la sintaxis clásica funcionará de inmediato; si se añaden propiedades de `nexora-reels` (como `entrada: "deslizar-arriba"` o nuevos colores de `THEME`), el motor las aprovecha sin fricción.

---

### 8. Plan de Implementación por Etapas Pequeñas y Verificables

```
[Etapa 5.1: Auditoría (Actual)] 
              │
              ▼
[Etapa 5.2: Motor Base y Puente de Tipos] ──> Valida compilación TS estricta de linea.ts y actual.ts
              │
              ▼
[Etapa 5.3: Migración de Piezas y Escenas] ──> Valida las 17 escenas con THEME sin romper tests
              │
              ▼
[Etapa 5.4: Orquestación de Reel y Root] ──> Valida composición completa en Reel.tsx con CapasCine
              │
              ▼
[Etapa 5.5: Scripts y Render Real de QA] ──> Valida render.mjs video y ritmo.py en composición de prueba
```

#### Desglose de Futuras Etapas:

#### **Etapa 5.2 — Puente de Motor y Compatibilidad de Tipos**
- **Objetivo:** Incorporar los contratos de datos y la lógica temporal en `nexora-reels`: `tipos.ts`, `actual.ts`, `linea.ts`, adaptándolos para importar `theme.ts` y soportar las transiciones ampliadas (`"deslizar-arriba"`, `"deslizar-abajo"`, `"disolver"`).
- **Archivos a crear/modificar:** `.agent/skills/nexora-reels/assets/plantilla/src/tipos.ts`, `src/motor/actual.ts`, `src/motor/linea.ts`, `src/motor/estilos.ts`, `src/motor/constantes.ts`.
- **Pruebas:** Suite de verificación en Node.js que procese un `plan.json` y `tiempos.json` de prueba y valide `resumen()` sin errores.
- **Criterio de Aprobación:** 0 errores de TypeScript y cálculo exacto de fotogramas de entrada/salida.

#### **Etapa 5.3 — Migración y Adaptación de las 17 Escenas Nativas**
- **Objetivo:** Portar la biblioteca de componentes UI (`piezas/basicas.tsx`, `piezas/ventanas.tsx`, `piezas/imagenes.tsx`) y las 17 escenas (`escenas/`) a `nexora-reels`, adaptando las llamadas de estilos a `THEME` y preservando su comportamiento exacto.
- **Archivos a crear:** `.agent/skills/nexora-reels/assets/plantilla/src/piezas/*`, `src/escenas/*`.
- **Pruebas:** Renderizado sintético (`renderToStaticMarkup`) de cada una de las 17 escenas comprobando que montan sus elementos sin excepciones.
- **Criterio de Aprobación:** 17/17 escenas renderizan correctamente y satisfacen sus funciones de validación.

#### **Etapa 5.4 — Orquestación de `Reel.tsx` y `Root.tsx`**
- **Objetivo:** Conectar el nuevo componente [`Escena.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/Escena.tsx) y [`CapasCine.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/CapasCine.tsx) con `Lienzo.tsx`, `Subtitulos.tsx`, `Personaje.tsx` y las escenas en `Reel.tsx`, registrando las composiciones en `Root.tsx`.
- **Archivos a crear:** `.agent/skills/nexora-reels/assets/plantilla/src/Reel.tsx`, `Root.tsx`, `index.ts`, `Portada.tsx`, `motor/Lienzo.tsx`, `motor/Subtitulos.tsx`, `motor/Personaje.tsx`.
- **Pruebas:** Validación de empaquetado Webpack con `@remotion/bundler`.
- **Criterio de Aprobación:** Empaquetado exitoso en $<4\text{ s}$ y metadata resuelta correctamente.

#### **Etapa 5.5 — Scripts de Automatización y Renderizado de Integración**
- **Objetivo:** Portar los scripts de automatización (`render.mjs`, `preparar.py`, `alinear.py`, `poses.py`, `ritmo.py`, `sonidos.py`) y los assets públicos (`public/fuentes`, `public/sonidos`) a `nexora-reels`. Ejecutar un render real completo de prueba.
- **Archivos a crear:** `.agent/skills/nexora-reels/assets/plantilla/render.mjs`, `.agent/skills/nexora-reels/scripts/*`, `.agent/skills/nexora-reels/assets/plantilla/public/*`.
- **Pruebas:** Ejecutar `render.mjs video --borrador` y verificar el MP4 final con `ritmo.py`.
- **Criterio de Aprobación:** Video MP4 renderizado, audio sincronizado a $-14\text{ LUFS}$, $0$ huecos en `ritmo.py` y 262/262 archivos protegidos intactos.

---

### 9. Riesgos y Limitaciones

1. **Riesgo de Regresión Visual en `titular`:** Si se intenta homogeneizar el titular con `TextoRevelado`, se perdería la sincronización fonética palabra por palabra con la voz. *Mitigación:* Mantener la lógica fonética de `titular.tsx` y aplicar únicamente los tokens de color y tipografía de `THEME`.
2. **Riesgo de Doble Filtrado Óptico:** Si `Fondo.tsx` mantiene su textura de grano mientras `CapasCine` activa su capa de grano/viñeta, el video presentará ruido excesivo y pérdida de nitidez. *Mitigación:* Centralizar el posprocesado exclusivamente en la Capa 5 de `CapasCine`.
3. **Límites de Peso de Archivo:** Para videos de $>45\text{ s}$, los fondos con movimiento continuo y grano pueden aumentar la tasa de bits por encima de los $28\text{ MB}$. *Mitigación:* Mantener la rutina de recompresión automática de `render.mjs`.

---

### 10. Archivos que Deben Permanecer Protegidos

Se ratifica la prohibición estricta de modificar los siguientes conjuntos:
1. **Skill Base `becario-reels` (93 archivos):** Conservar intacta como respaldo inmutable.
2. **Reel de Producción `reel-microondas` (169 archivos):** No tocar dependencias, configuraciones ni assets del reel de referencia.
3. **Línea base histórica (`scratch/baseline_hashes.json`):** Verificada al 100% (262/262 archivos coincidentes).

---

### 11. Recomendación Técnica Final y Veredicto

La auditoría confirma que la integración del motor visual desarrollado en las etapas 1 a 4.1 con el flujo probado de `becario-reels` es técnicamente sólida, elegante y viable sin necesidad de reescribir el sistema.

**Veredicto:** **INTEGRACIÓN VIABLE CON CONDICIONES**

**Condiciones Obligatorias:**
1. Ejecutar la integración siguiendo el plan estricto de las etapas 5.2 a 5.5, sin saltar pasos ni omitir pruebas intermedias.
2. Preservar la autonomía y sincronización interna de las 17 escenas nativas, integrándolas dentro de `Escena` y `Lienzo` sin reemplazarlas por abstracciones genéricas.
3. Mantener inmutables los 262 archivos protegidos en todas las fases.

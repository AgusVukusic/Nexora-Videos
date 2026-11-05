# Auditoría Previa del Pipeline de Producción — Etapa 5.5 (Parte I)

**Skill:** `nexora-reels`  
**Fecha:** 30 de octubre de 2026  
**Entorno de ejecución:** Windows 11 (x64), Node.js v22.14.0, Python 3.12 (py), Chromium Headless Shell 138, FFmpeg 7.1  
**Estado de integridad:** 262/262 archivos protegidos intactos (100 % coincidencia SHA-256)

---

## 1. Resumen Ejecutivo

En cumplimiento de las directivas de la **Etapa 5.5 — Automatización de Producción, Integración del Pipeline y Cierre Técnico (Parte I)**, se realizó una auditoría técnica exhaustiva de solo lectura sobre el pipeline de producción audiovisual de reels. Se analizaron en profundidad los scripts en Python (`preparar.py`, `alinear.py`, `poses.py`, `ritmo.py`, `sonidos.py`), el orquestador en Node.js (`render.mjs`), el motor temporal y tipado en TypeScript (`actual.ts`, `linea.ts`), y los componentes de composición gráfica en Remotion (`Root.tsx`, `Reel.tsx`, `Escena.tsx`, `CapasCine.tsx`, `escenas/index.ts`, `piezas/index.ts`).

Esta auditoría establece los límites de responsabilidad, documenta los contratos de datos intermedios, define los mecanismos de recuperación ante fallos y propone el plan de implementación por bloques para la Parte II, garantizando que ninguna capacidad preexistente se degrade ni se alteren los contratos de datos aprobados en las etapas 1 a 5.4.1.

---

## 2. Diagrama de Flujo del Pipeline Completo

El siguiente diagrama ilustra el flujo de extremo a extremo, desde los insumos del usuario hasta el producto audiovisual final y el control de calidad automatizado:

```mermaid
flowchart TD
    subgraph INSUMOS["1. Insumos del Usuario / LLM"]
        GUI["Guion & Narrativa"] --> PLAN["src/datos/plan.json"]
        AUD["Locución Grabada / TTS"] --> VOZ_SRC["VOZ.mp3 / VOZ.wav"]
        IMG["Fotos de Personaje"] --> FOTOS_P["public/personaje/*.png"]
    end

    subgraph PREPARACION["2. Preparación de Entorno (preparar.py)"]
        SCAF["Copia plantilla assets/plantilla"]
        DET_NAV["Detección Chromium / Chrome"]
        DET_FF["Detección FFmpeg"]
        INST_NPM["Instalación npm ci (npm.cmd en Win)"]
        SCAF --> DET_NAV --> DET_FF --> INST_NPM --> ENT_JSON["entorno.json"]
    end

    subgraph PROCESAMIENTO_PY["3. Procesamiento Offline en Python"]
        subgraph ALINEACION["alinear.py"]
            DEC["Decodificación FFmpeg a 48kHz Float32"]
            PAUSAS["Recorte Pausas > 0.26s con micro-fade"]
            SILABAS["Alineación Fonética por Sílabas (DP)"]
            NORM_LUFS["Filtro paso alto + EBU R128 (-14 LUFS)"]
            DEC --> PAUSAS --> SILABAS --> NORM_LUFS
            NORM_LUFS --> VOZ_WAV["public/voz.wav"]
            SILABAS --> TIEMPOS_JSON["src/datos/tiempos.json"]
        end

        subgraph POSES["poses.py"]
            BG_REM["Eliminación de fondo (SciPy EDT + Alfa suave)"]
            ALARG["Extensión inferior +90px si cortado"]
            KMEANS["Clustering K-Means (Color de pelo/cabeza)"]
            METRICAS["Cálculo métricas: cabeza, anchoCabeza, peloArriba"]
            BG_REM --> ALARG --> KMEANS --> METRICAS
            METRICAS --> POSES_JSON["src/datos/poses.json"]
            ALARG --> POSES_PNG["public/personaje/*.png optimizados"]
        end

        subgraph SONIDOS_GEN["sonidos.py"]
            SINTESIS["Síntesis procedural analítica (SciPy IIR, seed=7)"]
            SINTESIS --> WAV_SFX["public/sonidos/*.wav (17 efectos)"]
        end
    end

    subgraph MOTOR_TS["4. Motor de Composición TypeScript / Remotion"]
        ACTUAL["src/motor/actual.ts<br/>- Carga plan.json, poses.json<br/>- Resuelve estilo/colores THEME<br/>- Geometría de Lienzo y Subtítulos"]
        LINEA["src/motor/linea.ts<br/>- Ingesta tiempos.json<br/>- Validación contraste y texto<br/>- Fotogramas: corte, ini, fin (30 FPS)<br/>- Solapes (SOLAPE=10)<br/>- Asignación momentos b[] y efectos EFECTOS"]
        ACTUAL --> LINEA

        ROOT["src/Root.tsx<br/>Composiciones: Reel, Portada, PortadaCheck, Mosaico<br/>calculateMetadata: duración y resumen()"]
        REEL["src/Reel.tsx<br/>Fondo + Escena(CapasCine) + Lienzo + 17 Escenas<br/>+ Semitono + Subtítulos + Personaje + Audio"]
        LINEA --> ROOT --> REEL
    end

    subgraph ORQUESTADOR["5. Renderizado y Multiplexación (render.mjs)"]
        BUNDLE["Empaquetado @remotion/bundler (Cache SHA-1)"]
        META_GET["Consulta calculateMetadata -> comp.props.resumen"]
        CHUNKING["Renderizado por Trozos (240 f / 8s)<br/>Chromium headless-shell mudo (muted: true)"]
        FF_AUDIO["Mezcla de Audio FFmpeg:<br/>voz.wav + 17 SFX con adelay y volume"]
        FF_CONCAT["Concatenación sin transcodificación (-c:v copy)<br/>Multiplexación AAC 192k"]
        BUNDLE --> META_GET --> CHUNKING
        META_GET --> FF_AUDIO
        CHUNKING --> FF_CONCAT
        FF_AUDIO --> FF_CONCAT
        FF_CONCAT --> SALIDA_MP4["salida/reel.mp4"]
    end

    subgraph CONTROL_QA["6. Control de Calidad Post-Render"]
        RITMO["scripts/ritmo.py<br/>Diferencia entre fotogramas en gris<br/>Detección de huecos estáticos > 0.60s"]
        SALIDA_MP4 --> RITMO
        HOJA["render.mjs fotos -> salida/hoja.png"]
        PORTADA_CHK["render.mjs portada -> salida/portada_check.png"]
    end
```

---

## 3. Matriz Exhaustiva de Responsabilidades

| Componente / Subsistema | Tecnología / Lenguaje | Responsabilidades Principales | Lo que NO debe hacer |
| :--- | :--- | :--- | :--- |
| **`preparar.py`** | Python 3 | - Scaffolding del proyecto desde `assets/plantilla`.<br/>- Detección de navegadores (Chrome, Chromium, Edge) y FFmpeg en el SO.<br/>- Generación de `entorno.json`.<br/>- Instalación de dependencias npm mediante `npm.cmd` en Windows.<br/>- Comprobación de que el motor de video arranca. | - No diseña ni modifica el contenido de `plan.json`.<br/>- No renderiza frames finales ni mezcla audio. |
| **`alinear.py`** | Python 3 / NumPy / FFmpeg | - Decodificación de audio de entrada.<br/>- Recorte automático de silencios y pausas internas ($>0.26\text{ s}$).<br/>- Normalización de volumen a estándar -14 LUFS (EBU R128).<br/>- Alineación fonética palabra por palabra (motor `"silabas"` offline o `"asr"` Parakeet).<br/>- Generación de `public/voz.wav` y `src/datos/tiempos.json`. | - No asigna estilos visuales ni transiciones.<br/>- No calcula fotogramas discretos de Remotion.<br/>- No descarga modelos sin autorización explícita. |
| **`poses.py`** | Python 3 / PIL / SciPy | - Recorte de fondo de fotos de personaje (componentes conexos y EDT).<br/>- Extensión inferior de siluetas cortadas (+90 px).<br/>- Detección de pelo/cabeza vía K-Means en RGB.<br/>- Extracción de métricas de anclaje: `cabeza`, `anchoCabeza`, `peloArriba`.<br/>- Generación de `src/datos/poses.json`. | - No anima al personaje en pantalla.<br/>- No decide en qué segundo cambia la pose (lo define `plan.json`). |
| **`sonidos.py`** | Python 3 / SciPy Signal | - Síntesis procedural pura de 17 efectos de sonido en WAV 48 kHz mono (`pop`, `ding`, `exito`, `whoosh`, etc.).<br/>- Determinismo matemático garantizado mediante semilla fija (`default_rng(7)`). | - No programa en qué momento del video suena cada efecto. |
| **`ritmo.py`** | Python 3 / FFmpeg / NumPy | - Auditoría post-render de dinamismo visual.<br/>- Lectura de video a 540x960 en escala de grises.<br/>- Comparación zonal (arriba, centro, abajo) y en bloques de 90x80 px.<br/>- Identificación de tramos estáticos superiores a 0.60 s ("huecos"). | - No modifica el video renderizado; emite reporte y código de salida para QA. |
| **`actual.ts` & `estilos.ts`** | TypeScript | - Ingesta fuertemente tipada de `plan.json` y `poses.json`.<br/>- Resolución de paleta de colores y tokens CSS (`THEME`).<br/>- Cálculo de geometrías de pantalla (`LIENZO`, `ZONA`, `SUB_Y`).<br/>- Configuración de sombras según estilo (`nexora`, `suave`, marcado). | - No calcula tiempos de animación ni genera fotogramas. |
| **`linea.ts`** | TypeScript | - Conversión de marcas temporales continuas (segundos) a discretas (fotogramas a 30 FPS).<br/>- Mapeo y validación de escenas contra `BIBLIOTECA`.<br/>- Cálculo de solapes de transición (`SOLAPE = 10` frames en suave/disolver).<br/>- Asignación armónica de momentos reactivos `b[]`.<br/>- Validación de integridad: textos guion vs audio, contraste WCAG, duración mínima de elementos ($>15$ frames).<br/>- Planificación de lista ordenada `EFECTOS` y `CAMBIOS_POSE`.<br/>- Exposición del método `resumen()`. | - No renderiza elementos DOM / React.<br/>- No invoca directamente a FFmpeg. |
| **`Root.tsx` & `Reel.tsx`** | React / Remotion | - Orquestación visual multicapa dentro de `<Sequence>`.<br/>- Integración de `Fondo`, `Escena` (con `CapasCine`), `Lienzo`, escenas nativas, `Semitono`, `Subtitulos`, `Personaje` y `<Audio>`.<br/>- Exposición de composiciones para Remotion (`Reel`, `Portada`, `PortadaCheck`, `Mosaico`).<br/>- Cálculo dinámico de metadatos en `calculateMetadata`. | - No gestiona la fragmentación en disco de los trozos MP4 ni su multiplexación final. |
| **`render.mjs`** | Node.js (Remotion API / FFmpeg) | - Empaquetado web con caché SHA-1 (`@remotion/bundler`).<br/>- Orquestación de renderizado por trozos de 240 fotogramas (8.0 s) con reintentos y tolerancia a timeouts (`--max-segundos`).<br/>- Mezcla acústica multicanal mediante FFmpeg (`amix`).<br/>- Concatenación de video sin transcodificación (`-c:v copy`).<br/>- Control de tamaño de archivo final (`--limite-mb 28`). | - No altera los contratos temporales de `linea.ts`.<br/>- No reemplaza la lógica de animación de React. |

---

## 4. Respuestas a los 10 Puntos Clave de la Auditoría

### 1. Responsabilidades de Python vs TypeScript/Remotion
- **Python:** Actúa como motor analítico y de preprocesamiento "offline". Sus fortalezas son la visión artificial matricial (SciPy/NumPy para segmentación de imágenes y K-Means en `poses.py`), el procesamiento de señal acústica (FFmpeg, RMS, algoritmos de alineación fonética en `alinear.py`, síntesis IIR en `sonidos.py`) y el análisis numérico de cuadros de video post-render en `ritmo.py`.
- **TypeScript / Remotion:** Actúa como motor de diseño, geometría, maquetación reactiva y síntesis visual en tiempo real. Sus fortalezas son el tipado estricto en tiempo de compilación, el cálculo determinista de fotogramas discretos a 30 FPS (`linea.ts`), la parametrización de tokens visuales (`THEME`, `estilos.ts`) y la composición gráfica multicapa con CSS/WebGL/SVG acelerado por Chromium.

### 2. Mecanismos de Transferencia de Datos
- La comunicación es **completamente desacoplada** mediante el sistema de archivos local (*File System Data Contracts*). No se requiere IPC, sockets ni servidores HTTP en segundo plano.
- Python lee insumos iniciales (`plan.json`, `VOZ.mp3`, fotos PNG), procesa los datos y escribe archivos en disco:
  - `src/datos/tiempos.json`
  - `src/datos/poses.json`
  - `entorno.json`
  - `public/voz.wav`
  - `public/sonidos/*.wav`
- Remotion/TypeScript importa estáticamente los JSON (`import plan0 from "../datos/plan.json"`) empaquetados por Webpack/esbuild dentro de un directorio temporal (`os.tmpdir()`).
- Node.js (`render.mjs`) extrae los metadatos dinámicos devueltos por `calculateMetadata` de Remotion (`comp.props.resumen`), orquesta los renders de video e invoca a FFmpeg pasándole argumentos con los timestamps calculados para la mezcla de audio.

### 3. Contratos JSON Intermedios y Esquemas

| Archivo Contrato | Productor Principal | Consumidores | Esquema Principal |
| :--- | :--- | :--- | :--- |
| **`src/datos/plan.json`** | Usuario / Diseñador / LLM | `alinear.py`, `poses.py`, `preparar.py`, `actual.ts`, `linea.ts`, `Reel.tsx` | `{ titulo: string, estilo?: string, voz?: boolean, personaje?: boolean, subtitulos?: "linea"\|"bloque"\|"no", transicion?: Entrada, frases: [ { texto: string, escena: { tipo: string, ...props, en?: Momento[] }, entrada?: Entrada, salida?: Entrada, poses?: [Momento, string][], sonidos?: [Momento, string, number?][], empuje?: number, sinSubtitulos?: boolean, bgMeshConfig?: object, colorGrade?: object, postProcess?: object } ], portada?: { lineas: string[], estilo?: string, autor?: string } }` |
| **`src/datos/tiempos.json`** | `scripts/alinear.py` | `src/motor/linea.ts`, `piezas/Subtitulos.tsx`, `escenas/titular.tsx`, `scripts/ritmo.py` | `{ voz: string \| null, motor: "silabas"\|"asr"\|"sin-voz", velocidad?: number, duracion: number, frases: [ { texto: string, inicio: number, fin: number, palabras: [ { w: string, t: number, clave: boolean, g: number } ] } ] }` |
| **`src/datos/poses.json`** | `scripts/poses.py` | `src/motor/actual.ts`, `piezas/Personaje.tsx` | `{ _referencia: string, _colorCabeza: string, _ajustes?: Record<string, any>, [pose: string]: { src: string, ancho: number, alto: number, cabeza: number, anchoCabeza: number, peloArriba: number } }` |
| **`entorno.json`** | `scripts/preparar.py` | `assets/plantilla/render.mjs` | `{ navegador: string \| null, modo: "headless-shell"\|"chrome-for-testing", ffmpeg: string \| null }` |
| **Objeto `resumen()`** | `src/motor/linea.ts` $\rightarrow$ `Root.tsx` | `assets/plantilla/render.mjs` | `{ duracion: number, estilo: string, escenas: EscenaResumen[], efectos: number, poses: number, problemas: string[], avisos: string[], audio: { fotogramas: number, voz: string \| null, efectos: EfectoAudio[] } }` |

### 4. Generación, Sincronización y Validación de Tiempos de Voz
- **Ingesta y Limpieza:** `alinear.py` decodifica la voz con FFmpeg a 48 kHz mono float32. Calcula la envolvente RMS en ventanas de 10 ms. Identifica silencios ($>0.28\text{ s}$) y los recorta a un máximo de 0.26 s mediante fundidos lineales cruzados de 6 ms, eliminando tiempos muertos.
- **Alineación por Sílabas (motor `"silabas"`, 100% local):** Convierte números y símbolos del español a palabras habladas, cuenta núcleos vocálicos y ejecuta una programación dinámica que hace coincidir los cortes de frase con las pausas acústicas reales. Cada palabra se adelanta 70 ms respecto al centro de su sílaba inicial.
- **Normalización:** Aplica filtro paso alto a 70 Hz, añade 1.5 s de cola final (`--cola`) y normaliza la ganancia integrada a -14 LUFS (EBU R128 `loudnorm`), guardando `public/voz.wav`.
- **Validaciones Cruzadas:**
  - `alinear.py` emite `avisos_ritmo` si una frase difiere en más de 45 % de la velocidad media en sílabas/s.
  - `linea.ts` compara el texto normalizado de cada frase en `plan.json` con `tiempos.json`. Si difieren, genera un `problema()` bloqueante indicando que debe re-alinearse la voz.

### 5. Detección, Recorte y Cálculo de Métricas de Poses
- **Segmentación:** `poses.py` lee las imágenes en `public/personaje/`. Si tienen fondo liso, muestrea las cuatro esquinas, aplica etiquetado de componentes conexos (`scipy.ndimage.label`), limpia huecos y produce un canal alfa suave mediante transformadas de distancia euclidiana y desenfoque gaussiano ($\sigma=0.5$).
- **Estabilización Vertical:** Si la silueta toca el borde inferior, duplica la última fila 90 píxeles hacia abajo (`alargar_si_cortado`) para garantizar que la respiración oscilatoria no deje ver el corte.
- **Anclaje Anatómico:** Analiza el 10 % superior de la pose de referencia con K-Means ($k=3$) para extraer el color del pelo/cabeza. Para cada pose, localiza la masa superior de dicho color y calcula:
  - `cabeza`: centro horizontal normalizado ($x_{50} / \text{ancho}$).
  - `anchoCabeza`: ancho en píxeles ($x_{94} - x_6$).
  - `peloArriba`: posición vertical del punto más alto (percentil 0.3 de $y$).
- **Consumo en React:** `Personaje.tsx` utiliza estas medidas para escalar y anclar cada pose respecto a una altura base (`ALTO_BASE = 840` px) y un centro fijo, logrando que al cambiar de pose (ej. de "normal" a "celebra") la cabeza permanezca fija sin saltos visuales.

### 6. Incorporación de Efectos de Sonido y Música
- **Biblioteca FX:** `sonidos.py` sintetiza proceduralmente 17 archivos `.wav` mono a 48 kHz normalizados a -1 dBFS pico con semilla reproducible (`seed=7`), ubicados en `public/sonidos/`.
- **Mapeo Automático y Manual:** `linea.ts` asigna sonidos automáticos definidos en `METADATA_ESCENAS_ESTANDAR` (ej. `titular` dispara `whoosh` o `pop`, `chat` dispara `tecla` y `ding`) vinculados a los momentos `b[]` de cada escena, y suma los sonidos manuales definidos en `frases[i].sonidos`.
- **Renderizado Mudo y Mezcla Externa:** Para máxima estabilidad y rendimiento, el video en Remotion se renderiza sin audio (`muted: true`). En `render.mjs`, la función `mezclarAudio` invoca a FFmpeg utilizando un filtro complejo `amix`, colocando `voz.wav` en el canal base y concatenando cada efecto en su milisegundo exacto (`adelay=${ms}|${ms}`) con su volumen individual (`volume=${vol}`).

### 7. Gestión del Renderizado (Chunking, Paralelismo, Timeouts)
- **Empaquetado y Huella:** `render.mjs` calcula un hash SHA-1 de 12 dígitos (`huella()`) sobre `src/` y `public/`. Si el bundle compilado en `os.tmpdir()` ya existe, lo reutiliza instantáneamente.
- **Fragmentación en Trozos (Chunking):** El reel completo (ej. 929 frames) se particiona en bloques independientes de 240 fotogramas (8.0 s). Cada trozo se renderiza como `salida/trozos/<clave>/000.mp4`.
- **Paralelismo:** La opción `--hilos` controla la cantidad de pestañas de Chromium ejecutándose simultáneamente (por defecto $\min(\text{CPUs}, 4)$).
- **Timeouts Controlados:** La opción `--max-segundos 270` detiene la ejecución de manera limpia antes de que un comando interactivo corte por tiempo, devolviendo código 3 y permitiendo continuar de inmediato.
- **Concatenación Lossless:** Tras renderizar todos los trozos, FFmpeg lee `lista.txt` y concatena los fragmentos de video (`-c:v copy`) combinándolos con el audio mezclado (`-c:a aac -b:a 192k`), generando `salida/reel.mp4` en cuestión de milisegundos.

### 8. Recuperación de Renders Interrumpidos
- **Idempotencia de Fragmentos:** `render.mjs` evalúa en cada iteración si el archivo `00k.mp4` ya existe y tiene un tamaño válido ($>1000$ bytes). De ser así, se omite su cálculo.
- **Escritura Atómica:** Remotion renderiza inicialmente en `<k>.mp4.tmp.mp4` y solo al finalizar exitosamente lo renombra a `<k>.mp4`. Esto garantiza que un render cortado a mitad de un trozo nunca deje un archivo corrupto que confunda al siguiente intento.
- **Reanudación Transparente:** Si un render se interrumpe por timeout, corte de energía o intervención del usuario, relanzar el mismo comando (`node render.mjs video`) salta los trozos existentes, procesa únicamente los faltantes y procede a la concatenación final.

### 9. Pasos que Requieren Intervención Manual vs Automatización
- **Pasos Manuales / Creativos:**
  1. Definición del guion narrativo y props de escenas en `src/datos/plan.json`.
  2. Aportación de la locución en audio (`VOZ.mp3` o similar) o selección del modo `--sin-voz`.
  3. (Opcional) Aportación de fotos de personaje en `public/personaje/` o imágenes para escenas `imagen`/`galeria`.
  4. Revisión visual de la hoja de contactos (`salida/hoja.png`) o comprobación de portada (`salida/portada_check.png`).
- **Pasos 100 % Automatizados:**
  1. Scaffolding y chequeo de herramientas locales (`preparar.py`).
  2. Normalización de voz a -14 LUFS, recorte de pausas y alineación fonética (`alinear.py`).
  3. Segmentación alfa, recorte y medición espacial de poses (`poses.py`).
  4. Síntesis procedural de los 17 archivos de sonido FX (`sonidos.py`).
  5. Resolución matemática de la línea temporal, solapes y momentos de animación (`linea.ts`).
  6. Renderizado modular por fragmentos tolerante a fallos (`render.mjs`).
  7. Mezcla multicanal de audio con precisión de milisegundo en FFmpeg (`render.mjs`).
  8. Concatenación sin transcodificación y multiplexación MP4 final (`render.mjs`).
  9. Análisis algorítmico de dinamismo y detección de huecos sin movimiento (`ritmo.py`).

### 10. Robustez en Entorno Windows
- **Ejecutables por Lote:** En Windows, los comandos como `npm` son ejecutables de tipo script por lote (`npm.cmd`). Las invocaciones directas mediante `subprocess.run(["npm", ...])` fallan si no se resuelven con `shutil.which` o `shell=True`.
- **Codificación UTF-8:** Todas las entradas y salidas estándar de los scripts de Python deben forzar la reconfiguración UTF-8 (`sys.stdout.reconfigure(encoding="utf-8", errors="replace")`) para evitar errores `UnicodeEncodeError` en consolas de Windows (páginas de códigos cp1252 o cp850).
- **Rutas y Espacios:** Las rutas con espacios (ej. carpetas de usuario o OneDrive) deben gestionarse utilizando rutas absolutas normalizadas (`os.path.abspath`) y comillas apropiadas al delegar en subprocesos de FFmpeg o Node.js.
- **Detección de Chromium en Windows:** La búsqueda debe incluir las rutas estándar del registro y carpetas de programa (`C:\Program Files\Google\Chrome\Application\chrome.exe`, `%LocalAppData%\Google\Chrome`, Edge, etc.).

---

## 5. Plan de Implementación para la Parte II (A Integrar Tras Autorización)

Para ejecutar la **Parte II — Integración del Pipeline** de manera controlada y sin riesgos sobre el código aprobado, se propone la siguiente estructura modular:

### Bloque 1: Migración y Robustecimiento de Scripts Python en `nexora-reels`
- Crear el directorio `.agent/skills/nexora-reels/scripts/`.
- Portar y robustecer los 5 scripts esenciales:
  1. `preparar.py`: Configurado para copiar la plantilla de `nexora-reels`, soportar `npm.cmd` en Windows y generar `entorno.json`.
  2. `alinear.py`: Adaptado a rutas relativas de `nexora-reels`, manteniendo los modos `"silabas"`, `"asr"` (sin descarga automática) y `"sin-voz"`.
  3. `poses.py`: Adaptado a `nexora-reels`, con soporte completo para recorte SciPy y medición invariante de cabeza.
  4. `sonidos.py`: Generador determinista de los 17 WAV para `public/sonidos/`.
  5. `ritmo.py`: Herramienta de auditoría QA post-render para detección de huecos $>0.6\text{ s}$.

### Bloque 2: Estructuración y Completitud de `assets/plantilla`
- Dotar a `.agent/skills/nexora-reels/assets/plantilla/` de su estructura completa de ejecución:
  - `package.json` y `package-lock.json` compatibles con Remotion 4.
  - `tsconfig.json` con tipado estricto.
  - `public/fuentes/` con las fuentes necesarias para la tipografía activa.
  - `public/texturas/` para efectos cinematográficos.
  - `public/sonidos/` con los 17 archivos sintetizados por `sonidos.py`.
  - `src/propias/` como punto de extensión para escenas de usuario.

### Bloque 3: Integración y Calibración de `render.mjs`
- Portar y adaptar `render.mjs` a `assets/plantilla/`:
  - Identificador de bundle `nexora-reels-${id}`.
  - Soporte de renderizado por trozos (240 fotogramas).
  - Manejo de comandos: `resumen`, `fotos`, `foto`, `portada`, `video`.
  - Integración fluida con `Root.tsx` y `Reel.tsx` de `nexora-reels`.

### Bloque 4: Validación y Pruebas Unitarias/Integración
- Ejecución de pruebas de compilación TypeScript estricto.
- Prueba unitaria de ejecución de cada script de Python en entorno Windows.
- Validación de generación de contratos JSON intermedios (`tiempos.json`, `poses.json`, `entorno.json`).

---

## 6. Veredicto de la Auditoría Previa

**Veredicto:** **APTO PARA PROCEDER A LA PARTE II**

Los contratos de datos están 100 % identificados y son totalmente consistentes con las implementaciones previas (etapas 1 a 5.4.1). No se detectan inconsistencias arquitectónicas ni colisiones de responsabilidades entre Python y TypeScript.

**Acción requerida:** Esperar la confirmación y autorización del usuario antes de iniciar la implementación del Bloque 1 de la Parte II.

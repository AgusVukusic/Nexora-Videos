---
name: nexora-reels
description: Produce reels y videos verticales animados de nivel profesional con código (React + Remotion), aplicando dirección de arte deliberada, físicas realistas, composición multicapa y flujo de producción local para Team Nexora.
---

# Nexora Motion Reels (`nexora-reels`)
## Manual Operativo y Guía de Producción Audiovisual con Remotion

Skill de ingeniería y producción audiovisual basada en código para **Team Nexora**. Genera videos verticales en alta definición ($1080 \times 1920\text{ px}$, $30\text{ fps}$) mediante **Remotion** (React, TypeScript), combinando cinemática determinista con resortes físicos, composición en 5 capas (*The 5-Layer Composite Stack*), tipografía cinética y un pipeline de renderizado local ultrarrápido con invalidación desacoplada de caché visual y acústica.

---

## 1. Principios de Producción y Arquitectura de 5 Capas

Cada reel producido bajo `nexora-reels` implementa tres principios fundamentales:
1. **Determinismo Estricto:** Toda animación, color y transformación depende exclusivamente del fotograma actual (`useCurrentFrame()`). Quedan prohibidas llamadas a `Date.now()`, `Math.random()` o temporizadores asíncronos.
2. **Dirección de Arte con Propósito:** Aplicación de la regla cromática 60-30-10 (60% fondo/atmósfera, 30% tarjetas/superficies, 10% acento focal), jerarquía tipográfica máxima de dos familias por video y zonas de seguridad verticales estrictas ($y: 80\text{ a }1040\text{ px}$).
3. **The 5-Layer Composite Stack:** Organización lógica de la escena en 5 capas superpuestas:
   - **Capa 5 (PostProcess):** Textura de grano cinematográfico y viñeteado perimetral.
   - **Capa 4 (ColorGrade):** Unificación cromática y etalonaje de temperatura.
   - **Capa 3 (UI & Typography):** Tipografía cinética, tarjetas elevadas, iconos vectoriales y subtítulos.
   - **Capa 2 (Assets):** Fotografías, ilustraciones y metraje con movimiento sutil.
   - **Capa 1 (BgMesh):** Fondos procedurales dinámicos y gradientes en movimiento.

Guías de arte y cinemática en [`references/arte-y-referencias.md`](./references/arte-y-referencias.md) y [`references/patrones-motion.md`](./references/patrones-motion.md).

---

## 2. Checklist Operativa en 9 Pasos para el Agente

Sigue esta secuencia metódica en cada encargo de producción:

```
[1. Guion y Beats] ──> [2. Instanciación] ──> [3. plan.json] ──> [4. Alineación] ──> [5. Personaje/SFX]
                                                                                            │
[9. QA y Portada]  <── [8. Render Video]  <── [7. Fotos QA]  <── [6. Validación] <────────┘
```

### Paso 1: Guion y Estructura Narrativa
- **Extensión recomendada:** Entre 8 y 16 frases cortas (duración final de 25 a 50 segundos).
- **Estructura de beats:**
  - *Frase 1 (El Gancho, 0–3 s):* Pregunta o afirmación contraintuitiva. Se configura con `"sinSubtitulos": true` porque el texto se lee grande en la escena `titular`.
  - *Frases intermedias (Desarrollo):* Explicación, datos y contrastes visuales (comparación, listas, cifras).
  - *Frase final (Llamada a la Acción):* Cierre con escena `cta`, también con `"sinSubtitulos": true`.
- **Énfasis tipográfico:** Encerrar entre `*asteriscos*` de 1 a 2 grupos de palabras clave por frase (se resaltan en color de acento o fuente a mano).
- Detalles en [`references/narrativa-y-ritmo.md`](./references/narrativa-y-ritmo.md).

### Paso 2: Instanciación del Proyecto (`preparar.py`)
Desde la raíz del repositorio, ejecuta `preparar.py` para crear el entorno de trabajo:
```bash
py .agent/skills/nexora-reels/scripts/preparar.py <ruta_destino>
```
- **Qué hace:** Copia los 91 archivos de la plantilla maestra (omitiendo `node_modules` y `salida/`), ejecuta `npm ci`, detecta automáticamente Google Chrome/Chromium y FFmpeg en el host, escribe `entorno.json` y ejecuta una prueba preliminar de `render.mjs resumen`.
- **Actualización de proyectos existentes:** Si se añade el flag `--actualizar`, actualiza el motor y componentes de Remotion preservando intactas las carpetas `src/datos/`, `src/propias/` y `public/`.

### Paso 3: Configuración de `src/datos/plan.json`
Dentro de la carpeta del proyecto creado, edita `src/datos/plan.json` definiendo:
- Metadatos globales: `titulo`, `estilo` (`"nexora"`, `"nube"`, `"noche"`, `"menta"`, `"limon"`, `"pizarra"` o personalizado), `subtitulos` (`"linea"`, `"bloque"` o `"no"`), `transicion` (`"corte"`, `"suave"`, etc.) y `personaje` (`true`/`false`).
- Portada: bloque `portada` con `lineas` (máx. 12 letras por línea), `icono`, `etiqueta` y `pose`.
- Secuencia de frases: arreglo `frases` con cada escena, sus parámetros específicos y sus momentos `"en"`.

### Paso 4: Locución y Alineación Fonética (`alinear.py`)
El script `alinear.py` sincroniza la voz con el guion generando `src/datos/tiempos.json` y `public/voz.wav`:

- **Opción A: Con locución grabada o generada (MP3, WAV, M4A):**
  ```bash
  py ../.agent/skills/nexora-reels/scripts/alinear.py locucion.mp3 --proyecto .
  ```
  - **Opciones avanzadas:**
    - `--motor <auto|silabas|asr>`: Por defecto `silabas` (determinista sin dependencias externas ni descargas). `asr` utiliza el modelo neuronal Parakeet v3 (`sherpa-onnx`).
    - `--pausa 0.26`: Umbral en segundos para recortar silencios muertos entre oraciones.
    - `--tempo 1.0`: Ajuste de velocidad del audio sin variar el tono.
    - `--cola 1.5`: Silencio de seguridad final para dejar respirar el CTA.
  - **Salidas procesadas:** `public/voz.wav` (48 kHz mono, filtro paso alto a 70 Hz, normalizado a -14 LUFS) y `src/datos/tiempos.json`.

- **Opción B: Sin voz (modo solo texto o borrador previo):**
  ```bash
  py ../.agent/skills/nexora-reels/scripts/alinear.py --sin-voz --proyecto . [--ppm 175]
  ```
  Calcula los tiempos de lectura estimando 175 palabras por minuto.

> [!IMPORTANT]
> **Regla de oro de sincronización:** Si se altera el texto de cualquier frase en `plan.json`, es **obligatorio volver a ejecutar `alinear.py`**. Si los textos difieren, el motor `linea.ts` bloquea el renderizado arrojando un error en `PROBLEMAS`.

### Paso 5: Personaje (`poses.py`) y Sonidos (`sonidos.py`)
- **Gestión de Personaje Opcional:**  
  Requiere un entorno virtual aislado con `pip install numpy pillow scipy`:
  ```bash
  # Comandos disponibles en poses.py:
  py ../.agent/skills/nexora-reels/scripts/poses.py recortar   # Recorta siluetas
  py ../.agent/skills/nexora-reels/scripts/poses.py medir      # Extrae bounding boxes a poses.json
  py ../.agent/skills/nexora-reels/scripts/poses.py ajustar --cabeza 0.22 --ancho-cabeza 0.38
  py ../.agent/skills/nexora-reels/scripts/poses.py quitar    # Elimina el personaje del proyecto
  ```
- **Efectos de Sonido Deterministas:**  
  Los 17 archivos WAV nativos sintetizados con física matemática ya vienen incluidos en `public/sonidos/`:
  - *Micro-interacciones y UI:* `pop`, `ding`, `exito`, `campana`, `tecla`, `tic`, `clic`.
  - *Cinemática y movimiento:* `whoosh`, `swoosh`, `papel`, `burbuja`, `subida`.
  - *Impactos y retroalimentación:* `golpe`, `negacion`, `puff`, `cristal`, `proyector`.
  Si se requieren regenerar matemáticamente desde cero con `scipy`:
  ```bash
  py ../.agent/skills/nexora-reels/scripts/sonidos.py public/sonidos
  ```

### Paso 6: Validación Estática y de Plan (`tipos` y `resumen`)
Antes de renderizar, verifica la consistencia de tipos y datos:
```bash
npm run tipos     # Compilación estricta de TypeScript (tsc -p .)
npm run resumen   # Análisis de plan, escenas, tiempos y avisos
```
- **PROBLEMAS (Bloquean el render):** Desajuste de texto frente a `tiempos.json`, palabra de `"en"` no hallada en la frase, icono Lucide inexistente, texto que excede la longitud máxima o escena/pose no registrada.
- **AVISOS (No bloquean, pero se notan en el video):** Contraste cromático inferior a 3:1, líneas de portada con $> 12$ letras, elementos que entran a menos de 15 frames del corte, o escenas vacías durante más de 24 frames al inicio.

### Paso 7: Inspección Visual Previa (`fotos` y `foto`)
Inspecciona visualmente el reel antes de invertir tiempo en renderizar el video completo:
```bash
npm run fotos             # Genera salida/hoja.png con fotogramas clave de cada escena
node render.mjs fotos 0.5 # Hoja de contacto con un fotograma cada medio segundo
node render.mjs foto 12.5 # Fotograma a resolución completa (1080x1920) en salida/foto_12.50.png
```

### Paso 8: Renderizado Final y Caché Desacoplada (`video`)
Renderiza el video final mediante trozos con invalidación selectiva de caché:
```bash
# Render de prueba ultrarrápido (540x960, CRF 26):
node render.mjs video --borrador

# Render final de emisión (1080x1920 @ 30 FPS, CRF 20):
npm run video
```
- **Flags operativos de `render.mjs video`:**
  - `--borrador`: Escala 0.5 y CRF 26 en `salida/borrador.mp4`.
  - `--forzar`: Permite renderizar omitiendo los errores no críticos de `PROBLEMAS`.
  - `--crf <num>`: Factor de compresión (20 por defecto, menor = mayor calidad).
  - `--hilos <num>`: Concurrencia de renderizado en Chromium (por defecto detecta CPUs, máx. 4).
  - `--max-segundos <seg>`: Límite de tiempo por pasada (270 s por defecto). Si se alcanza, finaliza limpiamente con código 3 PARCIAL y permite reanudar desde el último trozo.
  - `--limite-mb <num>`: Límite de tamaño (28 MB por defecto). Si el video lo supera, se recomprime a la tasa de bits justa para garantizar descarga y subida móvil.

### Paso 9: Control de Calidad (`ritmo.py`) y Portada (`portada`)
Finalizada la exportación, verifica el ritmo visual y genera la portada:
```bash
# Auditoría de retención algorítmica:
py ../.agent/skills/nexora-reels/scripts/ritmo.py salida/reel.mp4 --tiempos src/datos/tiempos.json

# Generación de portadas:
npm run portada
```
- **Auditoría de ritmo:** Reporta huecos sin movimiento visual superiores a 0,6 s. Al pasar `--tiempos`, distingue las pausas de asimilación intencionales (1.0 a 1.5 s) de escenas muertas que requieren adelantar momentos `"en"`.
- **Miniatura y encuadre:** Produce `salida/portada.png` y `salida/portada_check.png` (cuadrícula 3:4 del perfil de Instagram para asegurar que el título no sea recortado).

Protocolo de lanzamiento en [`references/publicacion-manual.md`](./references/publicacion-manual.md).

---

## 3. Contratos de Datos y Esquema de `plan.json`

### 3.1. Estructura de `FrasePlan`
Cada elemento del arreglo `frases` en `plan.json` contiene:
- `texto` *(string, obligatorio)*: Guion tal como se lee en los subtítulos. Las palabras clave van entre `*asteriscos*`.
- `escena` *(objeto, obligatorio)*: Configuración de la escena (`tipo`, momentos `en` y parámetros específicos).
- `entrada` *(string, opcional)*: Transición de entrada (`"corte"`, `"suave"`, `"semitono"`, `"deslizar-arriba"`, `"deslizar-abajo"`, `"disolver"`).
- `salida` *(string, opcional)*: Transición de salida explícita (`"corte"`, `"suave"`, `"disolver"`).
- `poses` *(lista de tuplas, opcional)*: Cambios de pose del personaje `[[momento, "nombre_pose"]]`.
- `sonidos` *(lista de tuplas, opcional)*: Efectos de sonido adicionales `[[momento, "nombre_sonido", volumen?]]`.
- `sinSubtitulos` *(boolean, opcional)*: Oculta los subtítulos en esta frase (usado en el gancho o en el CTA).
- `empuje` *(number, opcional)*: Zoom continuo de cámara (0 a 0.05, por defecto 0).
- `bgMeshConfig`, `colorGrade`, `postProcess` *(objetos, opcional)*: Sobrescritura de capas de `CapasCine`.

### 3.2. Sintaxis de Momentos (`en`)
La propiedad `en` de cada escena define cuándo aparece cada elemento visual. Admite las siguientes variantes:
- `"palabra"`: Fotograma en que se pronuncia esa palabra (sin tildes ni signos, admite prefijos: `"calien"` coincide con `"calienta"`).
- `"palabra#2"`: Segunda aparición de la palabra en la frase.
- `"palabra+6"` o `"palabra-4"`: Desfase de fotogramas respecto a la palabra. Se pueden combinar: `"palabra#2+8"`.
- `"inicio"` o `"fin"`: Primer o último fotograma de la frase.
- `15` *(número)*: Fotograma relativo exacto desde el inicio de la escena.
- Si se omite `en` o contiene menos momentos de los que la escena requiere, el motor los **reparte armónicamente** de forma automática.

---

## 4. Catálogo Sintético de las 17 Escenas Nativas

| Escena | Momentos | Propósito Principal | Campos Clave Obligatorios / Opcionales | Sonidos Automáticos |
| :--- | :---: | :--- | :--- | :--- |
| **`titular`** | 1 | Gancho con revelado tipográfico | `texto` (máx. 90, líneas $\le 28$), `etiqueta`, `imagenes`, `icono` | `whoosh` / `pop` |
| **`chat`** | 5 | Consola de prompt y respuesta | `mensaje`, `titulo`, `saludo`, `respuesta`, `pildora`, `movil` | `tecla`, `pop`, `ding` |
| **`editor`** | 4 | Mesa de edición con 4 pistas | `archivo`, `hecho`, `palabras` (máx. 4), `sonidos` (máx. 3) | `whoosh`, `exito`, `pop` |
| **`movil`** | 3 | Dispositivo y datos en pantalla dividida | `titulo` (máx. 24), `subtitulo`, `pegatina`, `contador`, `icono` | `whoosh`, `pop` |
| **`contador`** | 2 | Cifra numérica impactante | `valor` (número), `etiqueta` (máx. 40), `desde`, `icono`, `llama` | `puff` / `golpe` |
| **`cifras`** | 1–3 | 1 a 3 módulos de métricas abiertos | `filas` (1–3 ítems: `valor`, `etiqueta`, `detalle`, `destacar`) | `golpe` / `tic` |
| **`ficha`** | 1–4 | Ficha técnica clave-valor con regla | `titulo` (máx. 18), `etiqueta`, `filas` (1–4 tuplas), `icono` | `pop` |
| **`lista`** | 2–5 | Manifiesto numerado con subrayado | `items` (2–5 textos o `{texto, icono}`), `titulo` | `tic`, `ding` |
| **`pasos`** | 2–4 | Diagrama de flujo con nodos | `pasos` (2–4 textos o `{texto, icono}`) | `pop` |
| **`comparacion`** | 3 | Pantalla dividida con veredicto | `izquierda`, `derecha`, `ganador` (`"izquierda"`/`"derecha"`) | `pop`, `pop`, `exito` |
| **`tachado`** | 2 | Desmentido "No es X: es Y" | `antes` (máx. 22), `despues` (máx. 18), `modo` (`"texto"`/`"codigo"`) | `negacion`, `swoosh` |
| **`objecion`** | 2 | Cita editorial y réplica | `texto` (máx. 60), `respuesta` (máx. 30), `numero` (máx. 12) | `pop`, `ding` |
| **`pregunta`** | 3 | Test con cuenta regresiva | `pregunta` (máx. 60), `opciones` (2–4), `correcta` (0–3) | `pop`, `exito` |
| **`barras`** | 2–5 | Infografía de barras con escala | `barras` (2–5 ítems: `etiqueta`, `valor`), `titulo`, `unidad` | `tic` |
| **`imagen`** | 2 | Encuadre fotográfico con visor | `imagen`, `texto`, `etiqueta`, `formato`, `efectos` (`cine`, etc.) | `proyector`/`burbuja`/`pop` |
| **`galeria`** | 2 | 2 a 6 imágenes | `imagenes` (2–6), `modo` (`abanico`, `orbita`, `rejilla`), `etiqueta` | `whoosh` / `ding` |
| **`cta`** | 3 | Llamada a la acción y confeti | `palabra` (máx. 12), `verbo`, `texto`, `iconos` (máx. 5 Lucide) | `tecla`, `exito` |

Catálogo exhaustivo con esquemas y ejemplos JSON en [`references/escenas.md`](./references/escenas.md).

---

## 5. Creación de Escenas Propias (`src/propias/`)

Cuando se requiere un diseño visual no cubierto por las 17 escenas nativas:
1. Copia [`assets/plantilla/src/propias/Ejemplo.tsx`](./assets/plantilla/src/propias/Ejemplo.tsx) a `src/propias/MiEscena.tsx`.
2. Dibuja dentro del lienzo: $x: 60\text{ a }1020$, $y: 210\text{ a }1070$.
3. Utiliza los hooks cinemáticos disponibles en `../motor/anim`:
   - `useMultiSpring`: Coordinación multi-propiedad de resorte.
   - `useStagger` y `staggerFrame`: Escalonamiento temporal determinista.
   - `useBreathing`: Microanimación senoidal sutil.
   - `usePop`, `useSuave`, `lerp`, `useFlota`, `bump`.
   - Componentes básicos: `Tarjeta`, `Icono`, `Pildora`, `Destello`, `TextoRevelado`.
4. Exporta tu definición `DefEscena` en [`assets/plantilla/src/propias/index.ts`](./assets/plantilla/src/propias/index.ts):
   ```ts
   import { miEscena } from "./MiEscena";
   export const PROPIAS = { MiEscena: miEscena };
   ```
5. Úsala en `plan.json`:
   ```json
   { "escena": { "tipo": "propia", "nombre": "MiEscena", "en": ["palabra1"] } }
   ```

---

## 6. Arquitectura de Caché Desacoplada (`video-v2` / `audio-v2`)

[`render.mjs`](./assets/plantilla/render.mjs) implementa un sistema de doble huella SHA-256 de **24 caracteres hexadecimales**:
- **Caché de Video (`huellaVideo()`, versión `video-v2`):**  
  Hashea el código en `src/` y los recursos visuales en `public/`, ignorando deliberadamente campos de audio y carpetas de sonido. Los trozos mudos se guardan en `salida/trozos/${claveVideo}/`.
- **Caché de Audio (`huellaAudio()`, versión `audio-v2`):**  
  Hashea `public/voz.wav`, archivos WAV de efectos requeridos, marcas temporales y volúmenes. La mezcla final a 48 kHz estéreo se guarda en `salida/trozos/audio/${claveAudio}.wav`.
- **Comportamiento desacoplado:**  
  Cambiar la locución o los efectos sonoros renderiza **0 fotogramas de video**; modificar colores o textos reutiliza instantáneamente el archivo WAV pre-mezclado.
- Detalles en [`references/ingenieria-remotion.md`](./references/ingenieria-remotion.md).

---

## 7. Tabla de Diagnóstico y Resolución de Problemas

| Síntoma o Error | Causa Raíz | Solución Inmediata |
| :--- | :--- | :--- |
| **`El texto de la frase X ha cambiado`** | Se editó `plan.json` tras la última alineación. | Ejecutar `py ../.agent/skills/nexora-reels/scripts/alinear.py locucion.mp3 --proyecto .` |
| **`No encuentro la palabra X en "en"`** | La palabra indicada en `en` no coincide con el texto. | Verificar la ortografía en `plan.json` o usar solo el inicio de la palabra sin signos. |
| **`El icono X no existe`** | El nombre de icono no pertenece a Lucide Icons. | Buscar el nombre exacto en kebab-case en [lucide.dev/icons](https://lucide.dev/icons). |
| **`La línea X tiene más de 12 letras (portada)`** | El título de la portada saldrá muy pequeño en miniatura. | Dividir el título en más líneas con palabras de 12 letras o menos. |
| **`PARCIAL: hechos X de Y trozos`** | Se superó el límite `--max-segundos` (270 s). | Volver a ejecutar el mismo comando `npm run video`; continuará desde el último trozo válido. |
| **`ImportError: No module named 'scipy'`** | Se ejecutó `poses.py` o `sonidos.py` sin `.venv`. | Crear entorno virtual local e instalar: `pip install numpy pillow scipy`. |
| **Video excede los 28 MB** | Tasa de bits alta en reels de más de 45 s. | El motor recomprime automáticamente; o fijar `--limite-mb 28` o elevar el CRF con `--crf 22`. |
| **Huecos $> 0.6\text{ s}$ en `ritmo.py`** | Escena sin cambios visuales durante locución larga. | Añadir momentos intermedios a la propiedad `en` de la escena o verificar si es pausa intencional. |

---

## 8. Restricciones Operativas

- **Coste Cero y Ejecución Local:** Todo el procesamiento (código, síntesis de audio, alineación y renderizado de video) se realiza localmente sin requerir servicios de pago ni suscripciones en la nube.
- **Herramientas Autorizadas Exclusivas:** No invocar scripts inexistentes ni comandos no declarados (como `npm run dev` o `remotion preview`). Utilizar únicamente los scripts de `scripts/` y los comandos de `render.mjs`.
- **Publicación Estrictamente Manual:** Toda exportación se deposita en `salida/` para que el creador humano la supervise, verifique la miniatura 3:4 y la publique manualmente desde su dispositivo móvil.
- **Integridad de Proyectos Protegidos:** Queda estrictamente prohibido modificar `becario-reels`, `reel-microondas`, `VideoFactory`, `.gitmodules` o los submódulos Git de Napkin.

---

## 9. Índice de Referencias Técnicas

| Documento | Contenido Principal |
| :--- | :--- |
| **[`references/arte-y-referencias.md`](./references/arte-y-referencias.md)** | Criterios de dirección visual, paletas 60-30-10, jerarquía tipográfica y composición vertical. |
| **[`references/patrones-motion.md`](./references/patrones-motion.md)** | Físicas de resortes, cinemática multi-propiedad, máscaras tipográficas seguras y staggering. |
| **[`references/escenas.md`](./references/escenas.md)** | Catálogo técnico de las 17 escenas nativas, escenas propias, estilos y esquema de `plan.json`. |
| **[`references/narrativa-y-ritmo.md`](./references/narrativa-y-ritmo.md)** | Beats narrativos, pausas de asimilación, diseño sonoro por capas y cadencia vertical. |
| **[`references/ingenieria-remotion.md`](./references/ingenieria-remotion.md)** | Determinismo headless, zonas seguras, caché desacoplada de 24 caracteres y herramientas de QA. |
| **[`references/publicacion-manual.md`](./references/publicacion-manual.md)** | Especificaciones técnicas del MP4 final, validación de miniatura 3:4 y metadatos editoriales. |

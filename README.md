# VideoContenido — Producción Programática de Video Vertical con Remotion

Framework, herramientas y pipeline de producción automatizada para la generación determinista de videos cortos en formato vertical (9:16 para Reels, TikTok y YouTube Shorts), impulsado por **Remotion** (React, TypeScript), Node.js y scripts de procesamiento en Python.

---

## 1. Clonación del Repositorio y Submódulos Git

El proyecto utiliza **submódulos Git** para integrar la herramienta auxiliar `napkin`:
- `.agent/skills/napkin`
- `.agents/skills/napkin`

Ambas rutas apuntan al repositorio oficial [`https://github.com/blader/napkin.git`](https://github.com/blader/napkin.git) y se conservan de forma independiente para garantizar compatibilidad con las diferentes convenciones de descubrimiento de agentes (por ejemplo, agentes basados en `.agent` frente a entornos que buscan en `.agents`).

### Clonación Inicial Completa
Para clonar el repositorio descargando automáticamente todos sus submódulos en un solo paso:
```bash
git clone --recurse-submodules https://github.com/AgusVukusic/Nexora-Videos.git
```

### Inicialización en un Repositorio ya Clonado
Si el repositorio se clonó de forma estándar sin el flag `--recurse-submodules`, los directorios de los submódulos aparecerán vacíos. Para inicializarlos y sincronizarlos:
```bash
git submodule update --init --recursive
```

---

## 2. Arquitectura y Componentes del Repositorio

El proyecto articula varios módulos complementarios diseñados para trabajar de forma modular y desacoplada:

```
VideoContenido/
├── .agent/
│   └── skills/
│       ├── nexora-reels/          # Skill definitiva de producción audiovisual
│       │   ├── assets/plantilla/   # Plantilla maestra de ensamblado Remotion
│       │   ├── scripts/            # Scripts de soporte y andamiaje en Python
│       │   └── SKILL.md            # Definición formal de la skill
│       ├── becario-reels/          # Skill base original (referencia histórica)
│       └── napkin/                 # Submódulo Git: notas de ejecución del entorno
├── .agents/                        # Estructura paralela de descubrimiento de skills
├── auditoria-skill-nexora/         # Informes técnicos y auditorías (00 al 35)
├── reel-microondas/                # Primer reel completo producido (proyecto de referencia)
├── public/                         # Espacio estructural reservado
├── src/                            # Espacio estructural reservado
└── README.md                       # Documentación central de entrada
```

### Componentes Principales:

1. **`nexora-reels` (`.agent/skills/nexora-reels/`):**
   Skill principal de producción audiovisual para Team Nexora. Implementa una arquitectura en 5 capas (*The 5-Layer Composite Stack*), físicas de animación basadas en resortes deterministas (`anim.ts`), tipado estricto en TypeScript, y un motor de renderizado local ultrarrápido con invalidación desacoplada de caché visual y acústica ([`render.mjs`](.agent/skills/nexora-reels/assets/plantilla/render.mjs)).
2. **`auditoria-skill-nexora/`:**
   Registro documental cronológico de 36 informes técnicos (del `00` al `35`) que respaldan cada decisión de diseño, validación crítica, resolución de cuellos de botella y mediciones de laboratorio (SSIM, PSNR, determinismo temporal y huellas SHA-256).
3. **`becario-reels/`:**
   Skill original utilizada como línea base y punto de partida técnico. Se preserva íntegramente como referencia histórica y base de comparación.
4. **`reel-microondas/`:**
   Primer caso de éxito del pipeline: reel completo renderizado a 1080×1920 @ 30 FPS, con locución, subtítulos dinámicos y microanimaciones de cocina.
5. **`.agents/`:**
   Estructura auxiliar de discovery que replica las skills para compatibilidad con distintos agentes y entornos de ejecución.

---

## 3. Requisitos del Sistema e Instalación Limpia

### 3.1. Requisitos de Software
1. **Node.js:** Versión 18.x o superior (verificado en Node.js v22.x).
2. **npm:** Versión 9.x o superior (incluido con Node.js).
3. **Python:** Versión 3.11.x (verificado en Python 3.11.4).
4. **FFmpeg:** Binario de FFmpeg (`ffmpeg` y `ffprobe`) instalado y accesible en la variable de entorno `PATH` (indispensable para la remezcla acústica y multiplexación de video en `render.mjs`).
5. **Navegador para Remotion:** Google Chrome, Chromium o `chrome-headless-shell`. Si se dispone de un binario específico, puede configurarse mediante la variable de entorno `BROWSER_EXECUTABLE` o en un archivo `entorno.json`.

### 3.2. Instalación de Dependencias Node.js
Para instalar las dependencias exactas declaradas en el `package-lock.json` de la plantilla o de una instancia instanciada:
```bash
npm ci
```
*(O alternativamente `npm install`).*

### 3.3. Preparación del Entorno Python
Los scripts de soporte (`preparar.py`, `alinear.py`, `ritmo.py`, `poses.py`, `sonidos.py`) requieren ciertas librerías auxiliares:
- **Librerías estándar:** `preparar.py` y `ritmo.py` se ejecutan directamente con el intérprete estándar de Python 3.11.
- **Alineación:** `alinear.py` utiliza por defecto el motor determinista de energía y sílabas (`--motor silabas`, sin descargas de modelos ni dependencias externas pesadas). Opcionalmente admite reconocimiento neuronal ASR con Parakeet v3 (`sherpa-onnx`) mediante `--motor asr`.
- **Morfología y audio sintético:** `poses.py` y `sonidos.py` requieren `numpy`, `pillow` y `scipy`.

> [!NOTE]
> La plantilla maestra no incluye un archivo `requirements.txt` cerrado para no imponer versiones globales al sistema. Se recomienda crear un entorno virtual aislado para las herramientas avanzadas:
> ```bash
> py -m venv .venv
> .venv\Scripts\activate
> pip install numpy pillow scipy
> ```

---

## 4. Comandos de Producción y Ejecución

La plantilla maestra define sus comandos en [`package.json`](.agent/skills/nexora-reels/assets/plantilla/package.json), respaldados por el motor de renderizado [`render.mjs`](.agent/skills/nexora-reels/assets/plantilla/render.mjs):

| Comando npm | Comando Equivalente | Función |
| :--- | :--- | :--- |
| `npm run resumen` | `node render.mjs resumen` | Analiza el guion (`plan.json`) y la locución, mostrando la duración exacta, escenas, momentos de transición, efectos de sonido y avisos técnicos. Si se ejecuta `node render.mjs` sin argumentos, se activa este comportamiento por defecto. |
| `npm run fotos` | `node render.mjs fotos` | Genera una hoja de contacto (`salida/hoja.png`) con fotogramas representativos de cada escena para revisión rápida. |
| — | `node render.mjs fotos 0.5` | Genera una hoja de contacto con un fotograma cada medio segundo (o el intervalo indicado). |
| — | `node render.mjs foto 12.5` | Extrae un fotograma a resolución completa (1080×1920) en el segundo indicado (`salida/foto_12.50.png`). |
| `npm run video` | `node render.mjs video` | Renderiza el video final a resolución de emisión (1080×1920 a 30 FPS) mediante trozos con caché determinista en `salida/reel.mp4`. |
| — | `node render.mjs video --borrador` | Render rápido de borrador a mitad de resolución (540×960, CRF 26) en `salida/borrador.mp4`. |
| `npm run portada` | `node render.mjs portada` | Genera la miniatura vertical (`salida/portada.png`) y la comprobación de encuadre en formato 3:4 (`salida/portada_check.png`). |
| `npm run tipos` | `tsc -p .` | Ejecuta la comprobación estricta de tipos de TypeScript sin emitir archivos. |

---

## 5. Arquitectura de Caché Desacoplada (Audio y Vídeo)

A partir de la Etapa 33 e integrada definitivamente en la Etapa 35, el motor [`render.mjs`](.agent/skills/nexora-reels/assets/plantilla/render.mjs) implementa un sistema de doble huella criptográfica SHA-256 (de 24 caracteres hexadecimales) completamente independiente y gobernada por constantes explícitas de versión (`CACHE_BUNDLE_VERSION = "bundle-v1"`, `CACHE_VIDEO_VERSION = "video-v2"`, `CACHE_AUDIO_VERSION = "audio-v2"`):

### 5.1. Huella Visual (`huellaVideo()`)
- **Alcance:** Recorre recursivamente `src/` (componentes TSX, estilos, lógica de escena) y `public/` (texturas, fuentes tipográficas, fotos).
- **Aislamiento Sonoro:** Al evaluar `src/datos/plan.json`, ignora deliberadamente los campos `.portada`, `.sonidos`, `.audio` y `frases[].sonidos`. Al recorrer `public/`, ignora con expresión regular quirúrgica exclusivamente los recursos de audio (`sonidos/`, `voz.*`, extensiones `.wav`, `.mp3`, etc.), permitiendo que recursos gráficos con la palabra "voz" (p. ej. `altavoz_icono.png`) invaliden correctamente la caché visual.
- **Almacenamiento de Trozos:** Los chunks de video mudos (`muted: true`) se almacenan en `salida/trozos/${huellaVideo}-${escala}-${crf}/`.
- **Efecto:** Modificar la voz, un efecto de sonido o su volumen **no invalida los trozos de video ya renderizados** (0 fotogramas re-renderizados).

### 5.2. Huella Acústica (`huellaAudio()`)
- **Alcance:** Hashea la versión de caché acústica (`audio-v2`), el contenido de `public/voz.wav`, los archivos WAV de los efectos de sonido realmente utilizados, los FPS, los fotogramas totales y los eventos de sonido con su marca temporal y volumen.
- **Almacenamiento de Mezcla:** La pista sonora pre-mezclada se guarda en `salida/trozos/audio/${huellaAudio}.wav`.
- **Efecto:** Modificar colores, fuentes, textos visuales o imágenes **no invalida la mezcla de audio**, reutilizando el WAV generado instantáneamente.

### 5.3. Recuperación de Caché y Validación
- **Restauración Histórica:** Si se altera un recurso y luego se revierte a su estado original, el motor recupera de inmediato los trozos y audios anteriores sin procesar nada de nuevo.
- **Validación con FFprobe:** Cada chunk `.mp4` es verificado con `ffprobe` (`validarTrozo()`, con umbral mínimo de 1.000 bytes). Si un chunk falta o está corrupto, solo ese chunk específico se regenera, conservando el resto intacto.

---

## 6. Procedimiento para Iniciar un Nuevo Proyecto de Reel

### Paso 1: Instanciar la plantilla
Desde la raíz del repositorio, ejecutar `preparar.py` indicando la carpeta de destino:
```bash
py .agent/skills/nexora-reels/scripts/preparar.py <ruta_del_nuevo_proyecto>
```

### Paso 2: Instalar dependencias
Acceder al proyecto creado e instalar los paquetes necesarios:
```bash
cd <ruta_del_nuevo_proyecto>
npm ci
```

### Paso 3: Configurar locución y plan
1. Ubicar la locución grabada (por ejemplo `locucion.mp3` o `locucion.wav`).
2. Alinear la voz con el guion:
   ```bash
   py ../.agent/skills/nexora-reels/scripts/alinear.py locucion.mp3 --proyecto .
   ```
   *(Por defecto utiliza `--motor silabas` determinista sin descargas. Opcionalmente admite `--motor asr` con modelo neural Parakeet v3). Esto genera `src/datos/tiempos.json` y copia la voz a `public/voz.wav`.*
3. Editar `src/datos/plan.json` definiendo las escenas, textos, colores y efectos de sonido.

### Paso 4: Validar y renderizar
- **Validar el plan y detectar posibles errores:**
  ```bash
  npm run resumen
  ```
- **Revisar visualmente las escenas:**
  ```bash
  npm run fotos
  ```
- **Renderizado final de producción:**
  ```bash
  npm run video
  ```
  El video resultante se generará en `salida/reel.mp4` a 1080×1920 @ 30 FPS.

---

## 7. Elementos Excluidos del Repositorio Git

Para mantener el repositorio ágil, seguro y libre de artefactos efímeros, los siguientes elementos se excluyen mediante `.gitignore`:

- **Dependencias instaladas (`node_modules/`, `.venv/`):** Regenerables localmente mediante gestores de paquetes.
- **Binario de navegador Remotion (`.remotion/`):** Contiene `chrome-headless-shell` (~281 MB); Remotion lo descarga automáticamente cuando se requiere.
- **Renders y trozos de video (`salida/`, `*.mp4`):** Videos finales y trozos intermedios generados durante ejecuciones de prueba o producción.
- **Cachés (`.cache/`, `__pycache__/`):** Cachés temporales de Webpack y bytecode de Python.
- **Entorno interno de agentes (`.claude/`):** Bitácoras y runbooks contextuales del entorno local.

---

## 8. Estado del Desarrollo y Limitaciones Conocidas

### Estado Actual:
- **Bloques 1 al 4C y Etapa 35 (Cierre Correctivo Integral):** **Completados y Aprobados (APTO)**.
  - Scripts Python verificados y libres de dependencias impuestas al sistema global.
  - Plantilla maestra actualizada con caché desacoplada (`huellaVideo` / `huellaAudio`), claves SHA-256 de 24 caracteres y versiones explícitas.
  - Registro y reconciliación de escenas personalizadas del usuario (`tipo: "propia"`).
  - Pruebas de regresión visual y acústica aprobadas (SSIM = 0.9988, PSNR = 52.60 dB, 0 frames negros o congelados).
- **Bloque 5:** En fase de preparación (consolidación final de la documentación en `SKILL.md` para creadores y directrices de arte).

### Limitaciones Conocidas y Resoluciones:
1. **Resolución de FFmpeg:** `render.mjs` detecta binarios de FFmpeg/FFprobe comprobando sucesivamente `entorno.json`, el `PATH` del sistema y el paquete nativo embebido de Remotion (`@remotion/compositor-*`).
2. **Entorno Python para SciPy:** La ejecución de `poses.py` y `sonidos.py` requiere `scipy`, `numpy` y `pillow` configurados en un entorno virtual (`.venv`) independiente para no contaminar el intérprete global.
3. **Zonas Seguras:** Las composiciones deben respetar los márgenes seguros verticales (y: 80 a 1040) para evitar superposiciones con los subtítulos y los elementos de interfaz nativos de Instagram Reels / TikTok.

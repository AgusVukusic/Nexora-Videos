# Nexora-Videos — Producción Programática de Video Vertical con Remotion

Framework, herramientas y pipeline de ingeniería audiovisual para la generación programática, determinista y de alto impacto de video vertical (9:16 a 1080×1920 @ 30 FPS para Instagram Reels, TikTok y YouTube Shorts), desarrollado para **Team Nexora**.

El sistema integra **Remotion** (React 19, TypeScript 5), Node.js, multiplexación y procesamiento de audio con **FFmpeg**, y scripts auxiliares en **Python** para el procesamiento acústico, alineación fonética y manipulación de sprites.

---

## 1. Clonación e Inicio Rápido

El repositorio es completamente autónomo y no depende de submódulos de Git externos.

### Clonación del Repositorio
```bash
git clone https://github.com/AgusVukusic/Nexora-Videos.git
cd Nexora-Videos
```

> [!NOTE]
> **Nombre de carpeta al clonar:** Por defecto, Git descargará el repositorio en la carpeta `Nexora-Videos/`. En entornos locales de desarrollo previo o estaciones de trabajo específicas, esta carpeta de trabajo puede haberse denominado `VideoContenido/`.
>
> **Directorio de ejecución:** La raíz del repositorio actúa como catálogo central y punto de entrada documental. Los comandos de compilación, previsualización y renderizado deben ejecutarse **dentro del directorio del proyecto específico** (por ejemplo, `cd reel-microondas/`) o dentro de nuevos proyectos generados a partir de la plantilla maestra.

---

## 2. Arquitectura y Estructura del Repositorio

La siguiente estructura distingue explícitamente entre los componentes **versionados en Git** (disponibles inmediatamente tras un clon limpio) y los entornos **exclusivamente locales** (generados durante ejecuciones de producción o por herramientas externas):

```text
Nexora-Videos/                      # Raíz del repositorio (localmente puede nombrarse VideoContenido/)
├── .agent/skills/                  # Skills de desarrollo asistido y patrones de producción [VERSIONADO]
│   ├── nexora-reels/               # Skill maestra de producción audiovisual cinemática
│   │   ├── assets/plantilla/       # Plantilla base de Remotion (React 19, TSX, render.mjs dual-cache)
│   │   ├── references/             # Guías de ingeniería, escenas, composición y motion graphics
│   │   ├── scripts/                # Scripts Python (preparar.py, alinear.py, ritmo.py, poses.py, sonidos.py)
│   │   └── SKILL.md                # Manual operativo, checklist en 9 pasos y contratos de datos
│   └── becario-reels/              # Skill original de referencia histórica para video programático
├── docs/                           # Documentación técnica y archivo histórico centralizado [VERSIONADO]
│   ├── auditoria/                  # 54 informes canónicos de laboratorio (Etapas 00 a 41B.4) y reportes de gobernanza
│   ├── evidencias/                 # Metadatos, hojas de contacto y registros de verificación visual
│   └── normas_diseno_nexora.md     # Las 7 directivas oficiales de diseño y composición de Nexora
├── tools/audit/                    # Suite de 32 archivos de auditoría geométrica y Chromium [VERSIONADO]
│   ├── results/                    # Capturas PNG, datasets JSON y reportes de renderizado
│   └── README.md                   # Catálogo técnico detallado de las 32 herramientas y recursos
├── reel-microondas/                # Proyecto de referencia completo con código fuente [VERSIONADO]
│   ├── src/                        # Código fuente modular en React 19 / TypeScript 5
│   ├── public/                     # Assets estáticos (fuentes, locución, efectos sonoros, texturas)
│   ├── render.mjs                  # Script de renderizado y previsualización local
│   ├── package.json                # Dependencias del proyecto (Remotion 4.0.538, React 19)
│   └── entorno.json                # Configuración local de rutas para navegador y FFmpeg
├── reel-olla-presion/              # Entorno local de producción previa [LOCAL / NO VERSIONADO]
│   ├── node_modules/               # Dependencias locales (ignorado por Git; 16.664 archivos)
│   └── salida/                     # Renders y artefactos de corrida previa (ignorado por Git; 132 archivos)
├── .claude/                        # Entorno de memoria local del asistente Claude [LOCAL / NO VERSIONADO]
├── .gitignore                      # Reglas estrictas de exclusión (dependencias, renders, cachés, VideoFactory) [VERSIONADO]
└── README.md                       # Documentación principal del repositorio [VERSIONADO]
```

### Contenido Versionado vs. Contenido Exclusivamente Local

1. **Incluido en un `git clone` limpio:**
   - `.agent/skills/nexora-reels/` y `.agent/skills/becario-reels/`
   - `docs/` (`auditoria/`, `evidencias/`, `normas_diseno_nexora.md`)
   - `tools/audit/` (los 32 archivos: 31 funcionales + 1 README)
   - `reel-microondas/` (código fuente completo editable)
   - `README.md` y `.gitignore`
2. **Exclusivamente local (ignorado por `.gitignore` y ausente en un clon fresco):**
   - `reel-olla-presion/`: Contiene únicamente dependencias instaladas (`node_modules/`) y artefactos generados (`salida/`) de una producción histórica. No posee código fuente versionado en Git.
   - `.claude/`: Bitácoras locales y archivos de sesión de Claude Code.
   - `.remotion/`: Caché binaria del navegador (`chrome-headless-shell`, ~281 MB).
   - `.cache/`: Archivos temporales de compilación de Webpack.
   - `salida/` y `node_modules/` dentro de cualquier proyecto de reel.

---

## 3. Proyectos Audiovisuales

### 3.1. `reel-microondas/` (Proyecto de Referencia Versionado)
Es la implementación de referencia canónica con su código fuente íntegramente versionado:
- **Contenido versionado:** Configuración (`package.json`, `tsconfig.json`, `entorno.json`), motor de renderizado (`render.mjs`), lógica de escenas en TypeScript (`src/`) y assets públicos (`public/`).
- **Propósito:** Demostrar el funcionamiento completo del pipeline de Nexora: composición en 5 capas (*The 5-Layer Composite Stack*), subtitulado dinámico cinemático, safe areas 9:16 y transiciones visuales.
- **Artefactos locales:** Sus carpetas `node_modules/` y `salida/` están excluidas por `.gitignore` y deben ser generadas localmente mediante `npm install` y los comandos de render.

### 3.2. `reel-olla-presion/` (Entorno de Producción Previa y Evidencia Local)
Corresponde a la corrida de producción del reel *"Física, Química e Ingeniería de la Olla a Presión"*:
- **Naturaleza y estado:** Es un directorio de trabajo local que conserva los artefactos generados durante su renderizado (`salida/`: video final `reel.mp4`, paquete Webpack `bundle.js`, hoja de contacto `hoja.png`, portadas y trozos de caché) junto con sus dependencias (`node_modules/`).
- **Ausencia en Git:** Al estar compuesto en un 100% por carpetas y archivos cubiertos por reglas de exclusión de `.gitignore` (`node_modules/` y `salida/`), **no está presente tras clonar el repositorio**. Su plan de producción compilado y metadatos pueden examinarse mediante la herramienta forense [`tools/audit/inspect_plan_olla.js`](tools/audit/inspect_plan_olla.js).

---

## 4. Requisitos del Sistema e Instalación

### 4.1. Requisitos de Software

| Componente | Requisito Mínimo Declarado | Versión Recomendada | Entorno Probado / Verificado | Observaciones |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | `>= 16.0.0` | `>= 18.x` o `>= 20.x LTS` | `v22.x` (`v22.14.0`) | Remotion 4.x declara compatibilidad desde Node 16; ESM nativo y Web APIs en React 19 recomiendan >= 18. |
| **npm** | `>= 7.0.0` / `>= 8.x` | `>= 9.x` o `>= 10.x` | `10.x` (`10.9.2`) | Lockfile v3 requiere npm >= 7; Node 16 incluye npm 8; probado exitosamente en npm 10.9.2. |
| **Python** | `>= 3.9.x` | `>= 3.11.x` | `3.11+` | Compatibilidad sintáctica con f-strings y anotaciones de tipo en los scripts auxiliares. |
| **Chromium** | Remotion 4.x runtime | Chrome / Chromium actual | `chrome-headless-shell` | Remotion descarga automáticamente `chrome-headless-shell` en `.remotion/` si no se configura navegador local. |
| **FFmpeg / FFprobe** | `>= 4.4` | `>= 6.0` | `FFmpeg 6+ / 7+` | Requerido para multiplexación por trozos, concatenación, mezcla externa de audio y validación de streams. |

> [!TIP]
> Si el sistema no dispone de FFmpeg instalado globalmente en el `PATH`, Remotion puede aprovechar los binarios de `@remotion/compositor-*` o las rutas especificadas manualmente en el archivo `entorno.json` de cada proyecto.

### 4.2. Instalación de Dependencias Node.js

Para preparar el proyecto de referencia:
```bash
cd reel-microondas
npm install
```

### 4.3. Entorno Python para Scripts de Soporte

Los scripts de soporte ubicados en [`.agent/skills/nexora-reels/scripts/`](.agent/skills/nexora-reels/scripts/) presentan una arquitectura de dependencias modular según la tarea operativa:

1. **Sin dependencias externas (100 % Biblioteca estándar de Python):**
   - `preparar.py`: Genera la estructura inicial de nuevos proyectos a partir de la plantilla base y detecta binarios locales (Chromium y FFmpeg). Puede ejecutarse en una instalación limpia de Python sin `pip` ni entorno virtual.
2. **Dependencia obligatoria de cálculo numérico (`numpy`):**
   - `alinear.py`: Requiere `numpy` incondicionalmente en su import de nivel superior para la lectura de buffers de audio PCM (`np.frombuffer`), cálculo de decibelios RMS, normalización, umbrales de silencio e interpolación temporal de frases. El algoritmo determinista `--motor silabas` **no requiere modelos de IA neuronales ni descargas pesadas**, pero **sí exige `numpy`** para el procesamiento acústico y fonético.
   - `ritmo.py`: Requiere `numpy` para el análisis de teselas y variaciones zonales de brillo en video.
3. **Dependencias científicas y de imagen (`scipy`, `pillow`):**
   - `poses.py`: Requiere `numpy`, `pillow` (`PIL`) y `scipy` (`scipy.ndimage`) para la segmentación, centrado y recorte automático de sprites de personajes transparentes.
   - `sonidos.py`: Requiere `numpy` y `scipy` (`scipy.signal`) para el filtrado paso-banda y síntesis procedural de efectos de sonido.
4. **Dependencias opcionales avanzadas de IA acústica (`sherpa-onnx`):**
   - `alinear.py` (con `--motor asr`): Transcripción acústica fonética de alta precisión mediante el modelo Parakeet v3 (`sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`, ~470 MB). Requiere instalar `sherpa-onnx` y ejecutar `--descargar-modelo`.
   - `imageio-ffmpeg`: Paquete opcional utilizado como mecanismo de respaldo secundario en `alinear.py` y `ritmo.py` únicamente si FFmpeg no se encuentra en el sistema ni en el compositor de Remotion.

Para habilitar la suite completa de herramientas en un entorno virtual aislado:
```bash
python -m venv .venv

# En Windows:
.venv\Scripts\activate

# En Linux / macOS:
source .venv/bin/activate

# Instalar dependencias científicas base:
pip install numpy pillow scipy

# Opcional (solo si se utilizará reconocimiento de voz neuronal ASR):
pip install sherpa-onnx imageio-ffmpeg
```

---

## 5. Comandos de Producción y Renderizado

> [!IMPORTANT]
> Todos los comandos deben ejecutarse **desde la carpeta del proyecto** (por ejemplo, `cd reel-microondas/`).

| Comando | Acción Principal | Salida Generada |
| :--- | :--- | :--- |
| `npm run resumen` | Valida duraciones, safe areas y consistencia del plan sin renderizar. | Diagnóstico en consola (`exit 0` si está limpio, `exit 1` con problemas). |
| `npm run fotos` | Genera una hoja de contacto en cuadrícula con fotogramas clave por escena. | `salida/hoja.png` |
| `node render.mjs fotos 2` | Genera hoja de contacto extrayendo un fotograma cada N segundos (ej. cada 2 s). | `salida/hoja.png` |
| `node render.mjs foto 12.5` | Exporta uno o varios fotogramas específicos a tamaño completo (1080×1920). | `salida/foto_12.50.png` |
| `npm run video` | Renderizado completo del reel por trozos a máxima calidad (CRF 20, escala 1.0). | `salida/reel.mp4` |
| `node render.mjs video --borrador` | Renderizado rápido a media resolución (540×960, CRF 26, escala 0.5). | `salida/borrador.mp4` |
| `npm run portada` | Genera la portada 9:16 y el comprobador de recorte 3:4/1:1 para feed. | `salida/portada.png` y `salida/portada_check.png` |
| `npm run tipos` | Comprobación estricta de tipos con TypeScript (`tsc -p .`). | Reporte de errores de tipado sin emitir JS. |

### Opciones y Modificadores de Renderizado (`node render.mjs video`)
- `--max-segundos <seg>`: Límite de ejecución por comando (por defecto 270 s). Si se alcanza, interrumpe el proceso de forma limpia (`exit 3`) guardando los trozos completados para reanudar luego.
- `--crf <n>`: Factor de tasa constante (por defecto 20 en video final, 26 en borrador). Menor valor = mayor fidelidad y mayor peso.
- `--hilos <n>`: Número de pestañas de Chromium en paralelo (por defecto hasta 4 hilos o el número de núcleos de CPU).
- `--limite-mb <mb>`: Si el video final supera el límite establecido (por defecto 28 MB), se recomprime automáticamente con FFmpeg mediante tasa de bits calculada para asegurar su portabilidad y descarga.
- `--forzar`: Omite las advertencias del validador de resumen y fuerza el renderizado.

---

## 6. Arquitectura de Caché Desacoplada (Video y Audio)

El motor de renderizado implementa una arquitectura de caché en dos niveles, optimizada para iteraciones creativas ultrarrápidas:

### 1. Motor de Producción Cinemática ([`.agent/skills/nexora-reels/assets/plantilla/render.mjs`](.agent/skills/nexora-reels/assets/plantilla/render.mjs))
- **Hashes Criptográficos:** Emplea **SHA-256**, truncados a **24 caracteres hexadecimales**.
- **Control de Versiones de Caché:**
  - `CACHE_BUNDLE_VERSION = "bundle-v1"`
  - `CACHE_VIDEO_VERSION = "video-v2"`
  - `CACHE_AUDIO_VERSION = "audio-v3"`
- **Huella Visual (`huellaVideo`):** Recorre el código fuente en `src/` (ignorando el campo de portada en `plan.json`) y assets en `public/` (texturas, fuentes, imágenes), **excluyendo explícitamente los recursos de audio** (`public/sonidos/` y `public/voz.*`). Los trozos visuales se renderizan mudos (`muted: true`) en Chromium, lo que permite modificar la voz o los efectos de sonido sin re-renderizar un solo fotograma de video.
- **Huella de Audio (`huellaAudio`):** Recorre el archivo de voz (`public/voz.*`), los efectos de sonido utilizados (`public/sonidos/*.wav`), los eventos acústicos con sus marcas de tiempo y volumen, duración total y FPS. Modificar colores, textos o estilos visuales **reutiliza al 100% la pista de audio mezclada**.
- **Validación de Integridad con FFprobe:** La función `validarTrozo(archivo)` comprueba que cada chunk `.mp4` en `salida/trozos/` exista, tenga un tamaño mínimo de 1.000 bytes y que `ffprobe` certifique que la duración del flujo de video sea válida y no presente corrupción.

### 2. Motor del Proyecto de Referencia ([`reel-microondas/render.mjs`](reel-microondas/render.mjs))
- Implementación autónoma compacta con hashes SHA-1 (12 caracteres) y clave combinada `${huella(true)}-${escala}-${crf}`, validada por tamaño mínimo de chunk (> 1.000 bytes) y reanudación incremental, representando la base operativa sobre la que se consolidó la plantilla desacoplada.

---

## 7. Procedimiento para Iniciar un Nuevo Proyecto de Reel

Para generar un nuevo reel vertical desde cero utilizando la plantilla maestra de Nexora:

### Paso 1: Instanciar la Plantilla
Desde la raíz del repositorio, ejecutar el script generador indicando la ruta destino:
```bash
python .agent/skills/nexora-reels/scripts/preparar.py nuevo-reel-ejemplo
```

### Paso 2: Instalar Dependencias
Acceder al proyecto creado e instalar los paquetes requeridos:
```bash
cd nuevo-reel-ejemplo
npm install
```

### Paso 3: Configurar Locución y Alinear Tiempos
1. Colocar el archivo de audio con la locución grabada (`locucion.mp3` o `locucion.wav`) en la carpeta del proyecto.
2. Sincronizar fonéticamente la voz con el guion para generar los timestamps de subtítulos:
   ```bash
   python ../.agent/skills/nexora-reels/scripts/alinear.py locucion.mp3 --proyecto .
   ```
   *(Genera `src/datos/tiempos.json` y copia la voz procesada a `public/voz.wav`).*
   > [!NOTE]
   > Si aún no se dispone de locución grabada, puede usarse el modo sintético `--sin-voz` (`python ../.agent/skills/nexora-reels/scripts/alinear.py --sin-voz --proyecto .`), el cual calcula tiempos estimados a ritmo de lectura estándar (175 palabras por minuto). Recuerde que `alinear.py` requiere tener instalado `numpy`.
3. Configurar las escenas, estilos y tipografías en `src/datos/plan.json`.

### Paso 4: Validar y Renderizar
```bash
# 1. Validar consistencia y safe areas
npm run resumen

# 2. Comprobar escenas en hoja de contacto
npm run fotos

# 3. Renderizar video final de emisión
npm run video
```
El archivo final se guardará en `salida/reel.mp4` a 1080×1920 @ 30 FPS.

---

## 8. Elementos Excluidos del Repositorio (`.gitignore`)

Para preservar el repositorio ligero, portable y libre de artefactos temporales pesados, [`.gitignore`](.gitignore) mantiene activas sus 48 reglas de exclusión, entre las que destacan:

- **Dependencias instaladas (`node_modules/`, `.venv/`):** Regenerables localmente mediante `npm install` y `pip install`.
- **Binario de navegador Remotion (`.remotion/`):** Contiene `chrome-headless-shell` (~281 MB), descargado automáticamente por Remotion según la plataforma.
- **Renders y trozos de video (`salida/`, `*.mp4`):** Videos finales, imágenes intermedias y trozos de caché generados en tiempo de ejecución.
- **Cachés de compilación (`.cache/`, `__pycache__/`, `*.pyc`):** Temporales de Webpack y bytecode de Python.
- **Entorno interno de agentes (`.claude/`):** Configuraciones, notas locales y bitácoras del entorno del desarrollador.
- **Secretos y certificados (`.env`, `*.pem`, `*.key`):** Claves privadas y credenciales locales.
- **Proyectos y directorios externos (`VideoFactory/`):** Módulo desacoplado expresamente excluido en la línea 48 de `.gitignore`.
- **Proyectos de producción local sin código versionado (`reel-olla-presion/`):** Excluido por las reglas de `node_modules/` y `salida/`.

---

## 9. Documentación Técnica y Herramientas de Auditoría

El repositorio cuenta con un archivo exhaustivo de especificaciones y herramientas de control de calidad:

- **Normas de Diseño y Composición:** [`docs/normas_diseno_nexora.md`](docs/normas_diseno_nexora.md) detalla las 7 reglas oficiales de tipografía, jerarquía visual, márgenes seguros 9:16 y paleta cromática de Nexora.
- **Catálogo de Herramientas de Auditoría:** [`tools/audit/README.md`](tools/audit/README.md) documenta la suite de 32 archivos (13 scripts JS, 2 scripts PowerShell, 7 arneses HTML, 6 datasets JSON, 3 capturas PNG y 1 manual técnico) para la verificación geométrica de safe areas y renderizado en Chromium.
- **Archivo de Auditorías Técnicas:** [`docs/auditoria/`](docs/auditoria/) alberga los 54 informes canónicos de certificación de laboratorio (Etapas 00 a 41B.4), junto con los informes de gobernanza y control de calidad de la reorganización (Etapas 3.1, 4, 5B, 5B.1 y 5B.2).
- **Evidencias Gráficas y Renders:** [`docs/evidencias/`](docs/evidencias/) conserva las hojas de contacto y registros visuales de las composiciones.
- **Guía de la Skill Nexora:** [`.agent/skills/nexora-reels/SKILL.md`](.agent/skills/nexora-reels/SKILL.md) contiene la checklist operativa en 9 pasos, contratos de datos y solución de problemas para agentes y desarrolladores.

---

## 10. Trazabilidad Histórica del Proyecto

El desarrollo de **Nexora-Videos** ha seguido un riguroso ciclo de ingeniería y certificación técnica en 41 etapas principales y un ciclo estructurado de gobernanza y reorganización integral:
- **Etapas 00 a 38:** Consolidación de la plantilla base, sistema de capas compositivas (*The 5-Layer Composite Stack*), arquitectura de doble caché y pruebas de regresión visual (SSIM = 0.9988, PSNR = 52.60 dB).
- **Etapas 39 a 40:** Optimización de componentes editoriales, contratos de datos y cinemática de cámara.
- **Etapa 41 (41A a 41B.4):** Análisis determinista de 160 trayectorias cinemáticas de cámara 2.5D, resolución de colisiones con subtítulos y validación cruzada con Chromium Headless.
- **Etapas 0A a 5B.2 (Gobernanza, Saneamiento y Consolidación Documental):**
  - **Etapa 0A & 0B:** Creación y certificación de backup externo con hash SHA-256 (34.869 archivos) y apertura de la rama `reorg/limpieza-integral`.
  - **Etapa 1:** Saneamiento de la raíz del repositorio y eliminación de duplicados no controlados.
  - **Etapa 2:** Retiro ordenado de submódulos extintos (`napkin`) y consolidación de las 7 normas de diseño en `docs/normas_diseno_nexora.md`.
  - **Etapa 3 & 3.1:** Centralización y unificación documental en `docs/auditoria/` y clasificación de evidencias históricas en `docs/evidencias/`.
  - **Etapa 4, 4.1 & 4.2:** Certificación de paridad SHA-256 para las 31 herramientas de `tools/audit/`, creación de su manual técnico y conciliación operativa de comandos.
  - **Etapa 5A, 5A.1, 5B, 5B.1 & 5B.2:** Auditoría técnica exhaustiva del `README.md` principal, verificación empírica contra el código fuente, conciliación estricta de dependencias modulares de Python (diferenciando `preparar.py` de `alinear.py` con `numpy`), precisión de versiones mínimas de software, preservación íntegra de `.gitignore` (incluyendo `VideoFactory/`) y consolidación fidedigna de las instrucciones de clonación y uso para la comunidad de desarrolladores.

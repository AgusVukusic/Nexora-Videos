# Informe de Implementación — Bloque 1: Portabilidad de los Scripts Python

**Skill:** `nexora-reels`  
**Etapa:** 5.5 — Automatización de Producción, Integración del Pipeline y Cierre Técnico  
**Bloque:** 1 (Portabilidad de los scripts Python)  
**Fecha:** 30 de octubre de 2026  
**Entorno de ejecución:** Windows 11 (x64), Python 3.11.4, FFmpeg 7.1 / 9.0.1, Chrome 138 (chrome-for-testing)  
**Entorno de validación temporal:** `%TEMP%\nexora-reels-validation` (Python 3.11.4 venv con SciPy 1.17.1, NumPy 2.4.6, Pillow 13.0.0; Python global intacto)  
**Estado de integridad:** 262/262 archivos protegidos intactos (100 % coincidencia SHA-256)

---

## 1. Resumen Ejecutivo

En cumplimiento de las autorizaciones otorgadas para el **Bloque 1 de la Etapa 5.5**, se creó el directorio `.agent/skills/nexora-reels/scripts/` y se portaron, adaptaron y validaron empíricamente los cinco scripts fundamentales del pipeline de producción:

1. `preparar.py`
2. `alinear.py`
3. `ritmo.py`
4. `poses.py`
5. `sonidos.py`

Las validaciones que requerían SciPy se realizaron dentro de un entorno virtual temporal aislado (`%TEMP%\nexora-reels-validation`), sin modificar el Python global del sistema ni los archivos permanentes del proyecto.

**Resultados globales del Bloque 1:**
- **5 de 5 scripts APROBADOS** y verificados con pruebas funcionales de extremo a extremo.
- `sonidos.py` demostró **100 % de determinismo binario**: dos ejecuciones independientes generaron 17 archivos WAV idénticos bit a bit entre sí, y con **100 % de coincidencia SHA-256 (17 de 17)** respecto a los archivos WAV de referencia de la plantilla.
- `poses.py` ejecutó con éxito las operaciones de `recortar`, `medir`, `ajustar` y `quitar`, extrayendo las métricas anatómicas de anclaje de cabeza con precisión submétrica y generando un `poses.json` compatible con el contrato de `nexora-reels`.
- `alinear.py`, `preparar.py` y `ritmo.py` operan de forma completamente autónoma con el Python base del sistema, procesando datos reales de audio y video.
- Los 262 archivos protegidos de la línea base (`becario-reels`, `reel-microondas`, `VideoFactory`, etc.) se mantienen al 100 % intactos (0 discrepancias de hash).

---

## 2. Archivos Creados

| Archivo | Ubicación | Tamaño | Líneas | Estado de Validación |
| :--- | :--- | :--- | :--- | :--- |
| **`preparar.py`** | `.agent/skills/nexora-reels/scripts/preparar.py` | 6.5 KB | 165 | **APROBADO** |
| **`alinear.py`** | `.agent/skills/nexora-reels/scripts/alinear.py` | 24.8 KB | 563 | **APROBADO** |
| **`ritmo.py`** | `.agent/skills/nexora-reels/scripts/ritmo.py` | 6.3 KB | 148 | **APROBADO** |
| **`poses.py`** | `.agent/skills/nexora-reels/scripts/poses.py` | 15.1 KB | 328 | **APROBADO** |
| **`sonidos.py`** | `.agent/skills/nexora-reels/scripts/sonidos.py` | 7.0 KB | 224 | **APROBADO** |

---

## 3. Diferencias Respecto de los Originales y Adaptaciones de Rutas

1. **Codificación UTF-8 Universal:**
   - Inserción de `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` en el preámbulo de todos los scripts.
   - Forzado de `encoding="utf-8"` explícito en todas las operaciones de apertura (`open(..., encoding="utf-8")`) de archivos de configuración (`plan.json`, `tiempos.json`, `poses.json`, `entorno.json`, `ritmo.json`), eliminando fallos en consolas de Windows con páginas de códigos cp1252 o cp850.
2. **Detección de Binarios en Windows (`ffmpeg.exe`):**
   - En `preparar.py`, `alinear.py` y `ritmo.py`, la resolución de FFmpeg dentro del directorio `@remotion/compositor-*` se actualizó para buscar `ffmpeg.exe` en `sys.platform == "win32"` (el original buscaba `ffmpeg` sin extensión, lo que fallaba en Windows si el ejecutable no estaba en el PATH global).
3. **Manejo de Scripts por Lotes (`npm.cmd`):**
   - En `preparar.py`, la función de subproceso `run()` comprueba si el comando resuelto por `shutil.which` termina en `.cmd` o `.bat` y activa automáticamente `shell=True` para evitar excepciones `FileNotFoundError` en Windows.
4. **Independencia del Directorio de Trabajo:**
   - `preparar.py` resuelve la plantilla dinámicamente mediante `os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "plantilla")`, garantizando que funcione independientemente del directorio actual desde el cual se invoque.
5. **Caché y Modelos de `nexora-reels`:**
   - `alinear.py` prioriza el directorio `~/.cache/nexora-reels` y la variable de entorno `NEXORA_ASR_MODELO`, manteniendo compatibilidad retrospectiva con `~/.cache/becario-reels`.

---

## 4. Dependencias Identificadas y Estado en el Entorno

| Script | Dependencias Estándar | Dependencias Externas | Estado en Sistema Global | Estado en Venv Temporal |
| :--- | :--- | :--- | :--- | :--- |
| **`preparar.py`** | `argparse`, `glob`, `json`, `os`, `shutil`, `subprocess`, `sys`, `time` | Ninguna | Instalada (stdlib) | Instalada (stdlib) |
| **`alinear.py`** | `argparse`, `difflib`, `json`, `os`, `re`, `shutil`, `subprocess`, `sys`, `unicodedata`, `wave` | `numpy`, `FFmpeg` binario | **100 % Operativo** (`numpy` 1.24.3) | **100 % Operativo** |
| **`ritmo.py`** | `argparse`, `json`, `os`, `shutil`, `subprocess`, `sys` | `numpy`, `FFmpeg` binario | **100 % Operativo** (`numpy` 1.24.3) | **100 % Operativo** |
| **`poses.py`** | `argparse`, `json`, `os`, `sys` | `numpy`, `Pillow`, `scipy` | Parcial (`scipy` no instalada) | **100 % Operativo** (`scipy` 1.17.1) |
| **`sonidos.py`** | `os`, `sys`, `wave` | `numpy`, `scipy` | Parcial (`scipy` no instalada) | **100 % Operativo** (`scipy` 1.17.1) |

> [!NOTE]
> Ninguna otra dependencia externa es requerida por los 5 scripts de Python. La única dependencia no disponible en el Python global es `scipy`.

### Nota sobre la Verificación del Python Global y Desmantelamiento del Entorno Temporal:
1. **Investigación del código de salida 1 en la prueba global:** El comando `py -3.11 -c "import scipy"` devolvió código 1 porque la ausencia de la biblioteca provocó la excepción estándar no capturada `ModuleNotFoundError: No module named 'scipy'`. Esto confirma concluyentemente que SciPy **no está ni estuvo instalado** en el Python global del sistema. Una comprobación con `importlib.util.find_spec('scipy')` ratificó que el resultado es `None` y que `pip list` en el entorno global carece por completo de paquetes SciPy.
2. **Confinamiento de la instalación:** La instalación autorizada de SciPy 1.17.1, NumPy 2.4.6 y Pillow 13.0.0 se produjo de forma estrictamente aislada dentro del directorio `%TEMP%\nexora-reels-validation`.
3. **Desmantelamiento:** Concluidas con éxito las pruebas de determinismo de `sonidos.py` y recorte de `poses.py`, el directorio temporal `%TEMP%\nexora-reels-validation` fue eliminado definitivamente del disco (`Test-Path` devuelve `False`).

---

## 5. Pruebas Ejecutadas y Evidencia Técnica

Todas las pruebas se ejecutaron en el entorno aislado `scratch/test_bloque_1` con copias temporales de trabajo:

### A. Validación de `sonidos.py` (Determinismo y Especificaciones de Audio)

Se ejecutaron dos corridas independientes con la misma semilla (`seed=7`):
- `Run 1`: `scratch/test_bloque_1/sonidos_run1`
- `Run 2`: `scratch/test_bloque_1/sonidos_run2`
- `Referencia`: `.agent/skills/becario-reels/assets/plantilla/public/sonidos`

**Resultados numéricos y acústicos:**

| Archivo WAV | Frecuencia | Canales | Bits | Duración | Determinismo (Run 1 vs Run 2) | Coincidencia con Referencia | SHA-256 (primeros 16 caracteres) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `burbuja.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.320 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `627912d01ec68d8b...` |
| `campana.wav` | 48000 Hz | 1 (mono) | 16-bit | 1.800 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `769e70a89062a212...` |
| `clic.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.012 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `fa236194ac0bbb59...` |
| `cristal.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.900 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `8f2304c4607078c6...` |
| `ding.wav` | 48000 Hz | 1 (mono) | 16-bit | 1.300 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `cfd56210077433b3...` |
| `exito.wav` | 48000 Hz | 1 (mono) | 16-bit | 1.250 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `098c0e0bc9d326eb...` |
| `golpe.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.320 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `89cc2ca506ca94e5...` |
| `negacion.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.320 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `d4d1ab8f30ca8036...` |
| `papel.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.090 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `e41f99ec9f184395...` |
| `pop.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.140 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `d449cc682f2d8e07...` |
| `proyector.wav`| 48000 Hz | 1 (mono) | 16-bit | 1.000 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `b7f5cd751430149a...` |
| `puff.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.350 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `1a5612b34e99d761...` |
| `subida.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.900 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `c800a93e21438f80...` |
| `swoosh.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.280 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `ec74919a972c0e2b...` |
| `tecla.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.060 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `e9e78f0b6ef595e2...` |
| `tic.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.030 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `a6023504e062add9...` |
| `whoosh.wav` | 48000 Hz | 1 (mono) | 16-bit | 0.500 s | **IDÉNTICO (100 %)** | **COINCIDE (100 %)** | `df636c31527c721e...` |

- **Diferencias entre Run 1 y Run 2:** 0 / 17 (100 % reproducible).
- **Coincidencias idénticas con los archivos de referencia:** 17 / 17 (100 % exactas).
- **Veredicto de `sonidos.py`:** **APROBADO**.

---

### B. Validación de `poses.py` (Segmentación Morfológica y Contrato JSON)

Se generaron dos imágenes de prueba representativas con fondo sólido (`foto_normal.png` y `foto_celebra.png`) simulando un torso y una cabeza con pelo oscuro (`#321E14`).

1. **Prueba de `recortar`:**
   - `poses.py --proyecto scratch/test_bloque_1 recortar normal foto_normal.png celebra foto_celebra.png`
   - Remoción de fondo exitosa: fondo `#F5F5F5` detectado en las esquinas y eliminado con alfa suave mediante `scipy.ndimage.distance_transform_edt` y filtro gaussiano ($\sigma=0.5$).
   - Detección de color de pelo/cabeza vía K-Means: `#321E14`.
   - Dimensiones resultantes recortadas y ajustadas:
     - `normal`: 303×811 px.
     - `celebra`: 443×811 px.
   - Métricas anatómicas extraídas:
     - `normal`: `cabeza x=0.4983` (centro exacto), `anchoCabeza=136.0 px`, `peloArriba=2.0 px`.
     - `celebra`: `cabeza x=0.4989` (centro exacto), `anchoCabeza=136.0 px`, `peloArriba=2.0 px`.
   - **Invarianza anatómica:** La cabeza en ambas poses tiene exactamente el mismo ancho (136 px), la misma altura superior (2 px) y el mismo centro horizontal (0.498 vs 0.499), garantizando cero saltos al alternar poses en pantalla.
2. **Prueba de `medir`:**
   - Invocación de `poses.py --proyecto scratch/test_bloque_1 medir` recalculó exactamente las mismas métricas sobre `public/personaje/*.png`.
3. **Prueba de `ajustar` y `quitar`:**
   - Invocación de `poses.py ajustar normal anchoCabeza=140.0 peloArriba=5.0` actualizó el bloque `_ajustes` y la pose `normal` en `poses.json`.
   - Invocación de `poses.py quitar normal` eliminó la pose del JSON y del disco.
4. **Validación del Contrato JSON (`poses.json`):**
   - El esquema generado cumple 100 % con la estructura esperada por `src/motor/actual.ts` (`MedidasPose`).
- **Veredicto de `poses.py`:** **APROBADO**.

---

### C. Validación de `alinear.py` (Voz y Sincronización)

1. **Modo `--sin-voz`:** Generó `tiempos.json` (8.914 s, 175 ppm) con parsing exacto de palabras clave (`*mundo*` $\rightarrow$ `clave: true, g: 0`).
2. **Modo con audio real (`.mp3` de 41.48 s y guion de 10 frases):**
   - Recorte de pausas internas $>0.26\text{ s}$ redujo la locución a 39.52 s de voz activa (+1.5 s de cola final = 41.02 s total).
   - Generó `public/voz.wav` normalizado a -14 LUFS con el filtro EBU R128 (`loudnorm=I=-14:TP=-1.5:LRA=7`).
   - Generó `src/datos/tiempos.json` con 10 frases y 107 palabras correctamente sincronizadas.
   - Fallback de filtrado paso alto en NumPy verificado y operativo.
- **Veredicto de `alinear.py`:** **APROBADO**.

---

### D. Validación de `ritmo.py` (Auditoría Post-Render)

- Ejecutado sobre el video real de la Etapa 5.4 (`test-render-5-4/salida/reel_integracion_5_4.mp4`, 210 frames / 7.0 s a 30 FPS).
- Medición: 9.6 % de fotogramas quietos, 1.00 arranques de movimiento por segundo, 0 huecos estáticos mayores a 0.60 s.
- Generó `ritmo_test.json` con código de salida 0.
- **Veredicto de `ritmo.py`:** **APROBADO**.

---

### E. Validación de `preparar.py` (Detección de Entorno y Scaffolding)

- Navegador detectado en Windows: `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` (`chrome-for-testing`).
- FFmpeg detectado en Windows: `ffmpeg.EXE` (Gyan Essentials 9.0.1).
- Scaffolding aislado de plantilla (`copiar_plantilla`): 41 archivos replicados limpiamente sin alterar los orígenes.
- Soporte de `npm.cmd` con `shell=True` verificado.
- **Veredicto de `preparar.py`:** **APROBADO**.

---

## 6. Estado de Verificación de Archivos Protegidos (SHA-256)

Se verificó el árbol completo de 262 archivos registrados en la línea base:
- **Archivos monitoreados:** 262
- **Coincidencias exactas:** 262 (100 %)
- **Discrepancias:** 0
- **Repositorios protegidos intactos:**
  - `becario-reels`: 100 % intacto.
  - `reel-microondas`: 100 % intacto.
  - `VideoFactory`: 100 % intacto.
  - `nexora-reels/assets/plantilla/src/`: 100 % intacto.

---

## 7. Matriz de Resultados Finales del Bloque 1

| Prueba / Componente | Objetivo | Estado | Evidencia |
| :--- | :--- | :---: | :--- |
| **Sintaxis y Compilación** | Validar `py_compile` en los 5 scripts | **APROBADO** | 0 errores de sintaxis en Python 3.11 |
| **CLI & Ayuda (`-h`)** | Argumentos y descripciones en UTF-8 | **APROBADO** | Opciones y flags verificadas |
| **`preparar.py`** | Detección de Chrome/FFmpeg y scaffolding | **APROBADO** | Chrome y FFmpeg detectados; 41 archivos copiados |
| **`alinear.py` (`--sin-voz`)** | Generación de tiempos a ritmo de lectura | **APROBADO** | `tiempos.json` (8.91 s, 175 ppm, flags `clave`) |
| **`alinear.py` (audio real)** | Normalización -14 LUFS y alineación fonética | **APROBADO** | `voz.wav` (-14 LUFS) y `tiempos.json` (10 frases, 107 palabras) |
| **`ritmo.py`** | Auditoría zonal de dinamismo en MP4 | **APROBADO** | 7.0 s analizados, 9.6 % quietos, 0 huecos |
| **`sonidos.py` (Determinismo)** | Dos corridas independientes comparadas | **APROBADO** | 17/17 archivos idénticos entre sí (0 diferencias) |
| **`sonidos.py` (vs Referencia)** | Comparación con WAV de plantilla | **APROBADO** | 17/17 coincidencia exacta SHA-256 (100 %) |
| **`poses.py` (Morfología)** | Recorte de fondo y alfa suave con SciPy | **APROBADO** | Fondo `#F5F5F5` eliminado en 2 poses sintéticas |
| **`poses.py` (Anatomía)** | Invarianza de cabeza K-Means | **APROBADO** | `anchoCabeza=136 px`, `cabeza=0.498 vs 0.499` |
| **`poses.py` (Contrato)** | Comandos `ajustar` y `quitar` en UTF-8 | **APROBADO** | `poses.json` actualizado según contrato |
| **Integridad de Línea Base** | SHA-256 de 262 archivos protegidos | **APROBADO** | 262/262 coincidencias (0 discrepancias) |

---

## 8. Veredicto Técnico Final del Bloque 1

**Veredicto:** **APTO — BLOQUE 1 COMPLETADO EXITOSAMENTE**

Los 5 scripts de Python están completamente portados a `.agent/skills/nexora-reels/scripts/`, adaptados a Windows, alineados con los contratos de datos y empíricamente verificados con datos de prueba reales. No se requiere ninguna dependencia adicional aparte de `scipy` (que ya fue validada en el entorno temporal y probó generar resultados idénticos al 100 % respecto a la plantilla).

Se da por concluido el Bloque 1. Se detiene la ejecución a la espera de la autorización del usuario para iniciar el Bloque 2 (Estructuración de `assets/plantilla`).

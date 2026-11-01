# Informe 30 — Cierre Correctivo de Integración, Caché y Entorno Python (Bloque 4C)

**Fecha:** 30 de octubre de 2026  
**Proyecto:** Skill definitiva `nexora-reels` (`.agent/skills/nexora-reels/`)  
**Instancia de validación:** `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation`  
**Estado previo:** APTO CON CONDICIONES (Informe 29 — Bloque 4B)  
**Veredicto técnico:** **APTO**  

---

## 1. Estado Inicial y Baseline

Al inicio del Bloque 4C, la instancia independiente `nexora-reels-validation` contaba con una producción audiovisual funcional generada en el Bloque 4B, pero condicionada por dos limitaciones técnicas:
1. **Condición A:** Acoplamiento en el sistema de invalidación de caché de `render.mjs`, donde cualquier modificación sonora (p. ej. `public/sonidos/*.wav` o `public/voz.wav`) invalidaba la huella general y forzaba el re-renderizado completo de los fotogramas de video.
2. **Condición B:** Ausencia de un entorno virtual aislado con SciPy dentro de la instancia para ejecutar de manera autónoma las capacidades avanzadas de `poses.py` (morfología matemática y recorte automático) y `sonidos.py` (generación determinista de audio sintético), sin contaminar el intérprete Python global del sistema.

Antes de ejecutar cualquier cambio, se calculó y almacenó el hash SHA-256 de los 262 archivos protegidos del proyecto (`scratch/baseline_hashes.json`) y se resguardó el archivo de video resultante del Bloque 4B como referencia inmutable:
- **Video referencia:** `salida/reel_bloque_4b_ref.mp4` (2.812.353 bytes, SHA-256: `7817044406b44f128998cf0ffb6f03cba251870c2a969538b80862af634fe18b`).
- **Python global:** Python 3.11.4 limpio (verificado sin SciPy instalado).

---

## 2. Auditoría del Sistema de Huellas Anterior

En las implementaciones heredadas de `becario-reels` y los Bloques 3 y 4A/B de `nexora-reels`, la función `huella(incluirPublic = true)` operaba de manera monolítica:
- Se recorría recursivamente `src/` y `public/`.
- Todos los archivos `.wav`, `.mp3` y la pista `voz.wav` se incorporaban directamente al hash SHA-256 de la composición visual.
- Los trozos de video se almacenaban en `salida/trozos/${clave}/`, donde `${clave}` contenía dicha huella unificada.
- **Consecuencia defectuosa:** Si un creador ajustaba un efecto de sonido, reemplazaba la locución o editaba el volumen de una pista, los fotogramas de video existentes se volvían inaccesibles, forzando un renderizado de 60–90 segundos cuando una simple remezcla externa mediante FFmpeg requería menos de 3 segundos.

---

## 3. Diseño de `huellaVideo`

Se diseñó e implementó en `render.mjs` una función especializada de huella visual puramente determinista:
- **Función:** `huellaVideo()`.
- **Criterio de cálculo:** SHA-256 hexadecimal truncado a 12 caracteres.
- **Factores de escala y calidad:** La clave final de almacenamiento de trozos se conforma como `${huellaVideo()}-${escala}-${crf}` (por defecto `98b85e89a390-1-20`).
- **Comportamiento:** Modificaciones en pistas de audio, volúmenes de mezcla o efectos sonoros no alteran en absoluto esta clave. Los fotogramas ya generados permanecen válidos en disco indefinidamente.

---

## 4. Diseño de `huellaAudio`

Se diseñó e implementó la función de huella acústica:
- **Función:** `huellaAudio(audioConfig, fps)`.
- **Criterio de cálculo:** SHA-256 hexadecimal truncado a 12 caracteres.
- **Almacenamiento desacoplado:** Las mezclas de audio se guardan de forma independiente al video en:
  `salida/trozos/audio/${claveAudio}.wav` (por ejemplo `salida/trozos/audio/e4b19934a7a8.wav`).
- **Comportamiento:** Si el código visual, los colores, fuentes o imágenes cambian, la huella de audio permanece idéntica y la pista pre-mezclada se reutiliza directamente sin ejecutar el pipeline de filtros de FFmpeg.

---

## 5. Archivos Incluidos y Excluidos de Cada Huella

| Dimensión | `huellaVideo()` (Visual) | `huellaAudio()` (Sonora) |
| :--- | :--- | :--- |
| **Código `src/`** | Incluido íntegramente (`.ts`, `.tsx`, subdirectorios). | Excluido. |
| **Configuración `plan.json`** | Incluido, excluyendo `.portada`, `.sonidos`, `.audio` y `frases[].sonidos`. | Excluido del hash visual; sus eventos sonoros se procesan en `audioConfig`. |
| **Gráficos `public/`** | Texturas, fuentes tipográficas, fotos PNG/JPG/SVG, stickers. | Excluidos. |
| **Pista de voz** | **Excluida expresamente** (`public/voz.*`). | **Incluida** (ruta y bytes íntegros de `public/voz.wav`). |
| **Efectos sonoros** | **Excluidos expresamente** (`public/sonidos/*.wav`). | **Incluidos** (solo los WAV efectivamente utilizados en la composición). |
| **Parámetros de mezcla** | Excluidos. | **Incluidos** (`fps`, `fotogramas`, secuencia ordenada `{s, en, vol}`, grafo FFmpeg). |

---

## 6. Cambios de Código Realizados en `render.mjs`

En la instancia de validación (`C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation\render.mjs`), se implementaron las siguientes modificaciones técnicas:

1. **Filtro de exclusión sonoro en `huellaVideo`:**
   ```javascript
   const rel = path.relative(path.join(RAIZ, "public"), p).replace(/\\/g, "/");
   if (rel === "sonidos" || rel.startsWith("sonidos/") || /\.(wav|mp3|m4a|ogg|aac|flac)(\..*)?$/i.test(rel) || rel.includes("voz")) {
     continue;
   }
   ```
2. **Aislamiento de configuración sonora en `plan.json`:**
   ```javascript
   const j = JSON.parse(fs.readFileSync(p, "utf8"));
   delete j.portada;
   delete j.sonidos;
   delete j.audio;
   if (Array.isArray(j.frases)) {
     j.frases = j.frases.map((f) => {
       if (!f || typeof f !== "object") return f;
       const fCopy = { ...f };
       delete fCopy.sonidos;
       return fCopy;
     });
   }
   h.update(`plan:${JSON.stringify(j)}`);
   ```
3. **Cálculo de `huellaAudio` y almacenamiento centralizado:**
   ```javascript
   const claveAudio = huellaAudio(r.audio, comp.fps);
   const dirAudio = path.join(TROZOS, "audio");
   fs.mkdirSync(dirAudio, { recursive: true });
   const audio = path.join(dirAudio, `${claveAudio}.wav`);
   if (!fs.existsSync(audio)) mezclarAudio(r.audio, comp.fps, audio);
   ```
4. **Ensamblaje del contenedor final:**
   FFmpeg combina la lista concatenada de trozos de video procedentes de `salida/trozos/${claveVideo}/` con la pista de audio `salida/trozos/audio/${claveAudio}.wav`, generando `salida/reel.mp4`.

---

## 7. Pruebas de Reutilización (C.1 y C.2)

- **C.1 Render inicial completo:**
  - `huella video: 98b85e89a390-1-20`
  - `huella audio: e4b19934a7a8`
  - Renderizado de trozos 1/3, 2/3 y 3/3; mezcla inicial de audio y multiplexación.
- **C.2 Re-ejecución inmediata sin modificaciones:**
  - Comando: `npm run video`
  - `huella video: 98b85e89a390-1-20`
  - `huella audio: e4b19934a7a8`
  - **Trozos de video renderizados:** **0** (100% reutilizados desde disco).
  - **Mezclas de audio ejecutadas:** **0** (100% reutilizado desde `salida/trozos/audio/e4b19934a7a8.wav`).
  - **Tiempo total de ejecución:** **2.8 s** (vs. 62.2 s de un render completo).

---

## 8. Pruebas de Invalidación por Audio (C.3)

Se sometió a prueba la independencia ante modificaciones exclusivamente sonoras:
1. **Acción:** Se modificó 1 byte en el archivo `public/sonidos/pop.wav`.
2. **Ejecución:** `npm run video`.
3. **Resultado:**
   - `huella video`: `98b85e89a390-1-20` (**IDENTICA**, 0% de variación).
   - `huella audio`: `80723deb5696` (**INVALIDADA Y RECALCULADA**).
   - **Trozos de video renderizados:** **0** (se reutilizaron intactos los trozos cacheados de `98b85e89a390-1-20`).
   - **Operación ejecutada:** Únicamente se recalculó la mezcla de audio externa y se multiplexó en `salida/reel.mp4` en 9.9 s.
4. **Restauración:** Al restaurar el `pop.wav` original, la huella de audio regresó inmediatamente a `e4b19934a7a8` y el proceso concluyó en 2.9 s.

---

## 9. Pruebas de Invalidación por Recursos Visuales (C.4 y C.5)

Se sometió a prueba la independencia ante modificaciones exclusivamente visuales:
1. **Acción:** Se modificó la imagen `public/foto_demo.png` dibujando una línea diagonal roja sobre sus píxeles.
2. **Ejecución:** `npm run video` (Tarea `task-3585`).
3. **Resultado:**
   - `huella video`: `2c1bf3fa58b3-1-20` (**INVALIDADA Y RE-RENDERIZADA**).
   - `huella audio`: `e4b19934a7a8` (**IDENTICA**, 0% de variación).
   - **Comportamiento:** Se renderizaron los nuevos trozos visuales en la carpeta `2c1bf3fa58b3-1-20`, mientras que la mezcla de audio preexistente `salida/trozos/audio/e4b19934a7a8.wav` se reutilizó directamente sin invocar FFmpeg para el audio.
4. **C.5 Restauración:** Al restaurar `public/foto_demo.png` a su estado original, la huella visual volvió exactamente a `98b85e89a390-1-20` y el comando `npm run video` finalizó en 2.8 s reutilizando la caché previa.

---

## 10. Pruebas de Mezcla y Configuración (C.6 y C.7)

Se verificó el comportamiento ante cambios en parámetros de volumen y eventos de mezcla dentro de `src/datos/plan.json`:
1. **Acción:** Se añadió una instrucción de sonido personalizada en la frase 1 (`"sonidos": [[0, "pop", 0.85]]`).
2. **Ejecución:** `npm run video` (Tarea `task-3629`).
3. **Resultado:**
   - `huella video`: `98b85e89a390-1-20` (**IDENTICA**; los trozos de video se reutilizaron al 100%).
   - `huella audio`: `9bd20d581cdf` (**DETECTADO CAMBIO DE MEZCLA**).
   - **Trozos de video renderizados:** **0**.
   - Solo se generó la nueva pista `salida/trozos/audio/9bd20d581cdf.wav` y se empaquetó el reel en 11.6 s.
4. **C.7 Integridad de contenedores:** Comprobado mediante `ffprobe`:
   - Codec de video: H.264 (High Profile, yuvj420p), 1080×1920, 30 FPS.
   - Codec de audio: AAC (LC), 48.000 Hz, estéreo, ~173 kbps.
   - Sincronización A/V estricta sin desfases ni truncamiento de muestras.

---

## 11. Auditoría del Entorno Python

Para resolver la Condición B, se configuró un entorno virtual dedicado en la instancia de validación, garantizando aislamiento total del sistema operativo.

---

## 12. Versión de Python y Pip

- **Intérprete aislado:** `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation\.venv\Scripts\python.exe`
- **Versión de Python:** Python 3.11.4 (64-bit).
- **Versión de pip:** pip 23.1.2.
- **Python global del sistema:** Python 3.11.4 verificado limpio (`ModuleNotFoundError: No module named 'scipy'`).

---

## 13. Dependencias Instaladas y Versiones

Las dependencias requeridas se instalaron a partir de ruedas en caché local sin acceso a repositorios no controlados:
- `numpy==2.4.6`
- `pillow==13.0.0`
- `scipy==1.17.1`

Se generó el archivo inmutable `requirements.txt` dentro de la instancia:
```text
numpy==2.4.6
pillow==13.0.0
scipy==1.17.1
```

---

## 14. Ubicación del Entorno Virtual

- **Directorio raíz del venv:** `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation\.venv`
- **Estructura:** Contiene `Scripts/`, `Lib/site-packages/` y `pyvenv.cfg`.
- **Inexistencia en el repositorio:** El directorio `.venv` reside exclusivamente dentro del entorno temporal del proyecto instanciado y no afecta a `.agent/skills/nexora-reels/`.

---

## 15. Pruebas de `poses.py`

Se validaron las cuatro operaciones operativas de `poses.py` utilizando el Python del `.venv`:

| Comando | Operación | Código Salida | Resultado Técnico |
| :--- | :--- | :---: | :--- |
| `python poses.py medir ...` | Medición anatómica | 0 | Calibración exitosa: `cabeza=0.500`, `ancho=180px`, `arriba=45px`. |
| `python poses.py recortar ...` | Segmentación con SciPy | 0 | Eliminación de fondo sólido `#F5F5F5` mediante apertura binaria y etiquetado de componentes conexas (`scipy.ndimage`). |
| `python poses.py ajustar ...` | Calibración JSON | 0 | Actualización precisa de coordenadas y escala en `poses.json`. |
| `python poses.py quitar ...` | Purga de recursos | 0 | Eliminación limpia de la pose en `poses.json` y del archivo físico en disco. |

---

## 16. Pruebas de `sonidos.py`

Se ejecutó la generación sintética de la biblioteca de efectos de sonido:
- **Comando:** `.venv\Scripts\python.exe scripts/sonidos.py <directorio>`
- **Total de efectos producidos:** 17 archivos WAV.
- **Formato:** PCM s16le, 48.000 Hz, canal mono, duración entre 0.05 s y 2.00 s.
- **Efectos generados:** `pop.wav`, `whoosh.wav`, `campana.wav`, `tic.wav`, `tecla.wav`, `ding.wav`, `exito.wav`, `error.wav`, `transicion.wav`, `camara.wav`, `latido.wav`, `magia.wav`, `proyector.wav`, `alarma.wav`, `burbuja.wav`, `notificacion.wav`, `golpe.wav`.

---

## 17. Resultados de Determinismo en Audio

Se realizaron dos corridas de síntesis independientes desde cero en directorios aislados y se contrastaron con la plantilla maestra:

1. **Determinismo entre corridas independientes:** 17 de 17 archivos presentaron hashes SHA-256 idénticos (100,0% de reproducibilidad matemática).
2. **Identidad con la plantilla de assets:** 17 de 17 hashes coincidieron exactamente con los archivos originales distribuidos en `.agent/skills/nexora-reels/assets/plantilla/public/sonidos/`:
   - `pop.wav`: `c74382c4f1c1074395e2f3d6118d20df1f4f56f1406d3fcce32386da6165e6d6`
   - `ding.wav`: `9d7494f6c44919cb49d0340798be4a169b56f8f78326a099a80b72a9e340db7f`
   - `whoosh.wav`: `e6ec72b0c1eeb6b95b4528c1ea99990f77cb0834ba70eec69c0d952220d91295`
   - `tic.wav`: `4523bb80f2d4e78a05c1d68361b7f0df80ff36ef1084ea4be770ddaa496bf57d`
   - *(17/17 validados al 100%)*.

---

## 18. Pruebas de Regresión Audiovisual

Se evaluó la calidad del reel resultante `salida/reel.mp4` sobre el fixture de 5 escenas:

1. **Loudness Integrado (EBU R128):** **-14.4 LUFS** (umbral objetivo: -14.0 LUFS ± 1.0 LU).
2. **True Peak / Nivel Máximo:** **-3.2 dBFS** (ausencia total de distorsión o clipping inter-muestra).
3. **Rango de Sonoridad (LRA):** 1.8 LU.
4. **Detección de cuadros negros (`blackdetect`):** 0 cuadros negros detectados.
5. **Detección de congelamientos involuntarios (`freezedetect`):** 0 congelamientos detectados.
6. **Ritmo visual (`ritmo.py`):**
   - Duración: 16.00 s (480 fotogramas a 30 FPS).
   - Fotogramas estáticos: 35.1%.
   - Arranques de movimiento: 1.50/s.
   - Huecos de ritmo reportados: 2 (1.43–3.23 s y 9.63–10.43 s, correspondientes a las pausas de guion del fixture original de Bloque 4B).

---

## 19. Comparación con el Reel del Bloque 4B

Se comparó pixel a pixel el video final del Bloque 4C con el video de referencia resguardado del Bloque 4B (`salida/reel_bloque_4b_ref.mp4`):

- **Similitud Estructural (SSIM):**
  - SSIM Y: 0.998901
  - SSIM U: 0.998670
  - SSIM V: 0.998814
  - **SSIM Global (All): 0.998848** (99.88% de coincidencia estructural absoluta).
- **Relación Señal a Ruido Pico (PSNR):**
  - PSNR Y: 51.70 dB
  - PSNR U: 54.79 dB
  - PSNR V: 55.75 dB
  - **PSNR Promedio: 52.60 dB** (identidad perceptual indistinguible).
- **Dimensiones y peso:** 2.806.796 bytes vs 2.812.353 bytes (~0.19% de variación atribuible a la multiplexación desacoplada de audio).

---

## 20. Integridad SHA-256 de Archivos Protegidos

Se auditó el inventario completo de 262 archivos protegidos del proyecto (incluyendo los scripts en `scripts/`, la plantilla maestra en `assets/plantilla/`, las referencias documentales y componentes de validación previos) frente a `baseline_hashes.json`:

- **Total de archivos protegidos auditados:** 262
- **Archivos faltantes:** 0
- **Discrepancias de hash SHA-256:** 0
- **Resultado:** **100,0% INTACTO**.

---

## 21. Limitaciones Identificadas

1. **Dependencia de FFmpeg en el PATH:** La mezcla externa desacoplada y la multiplexación requieren un binario de FFmpeg funcional instalado en el sistema host.
2. **Aislamiento local a nivel de instancia:** El `.venv` fue configurado exclusivamente dentro de `%TEMP%\nexora-reels-validation`. Si el usuario instancia un proyecto nuevo en otra ruta mediante `preparar.py`, dicho proyecto requerirá crear su propio entorno virtual o vincularse a un intérprete con `numpy`, `pillow` y `scipy`.
3. **Sensibilidad de regex ante nombres de archivo en `public/`:** Cualquier archivo dentro de `public/` cuyo nombre contenga la subcadena `voz` o finalice en extensiones de audio es ignorado por `huellaVideo()`. Archivos con nombres atípicos (p. ej. `audio_sin_extension`) podrían escapar a la regla si no respetan las extensiones declaradas.

---

## 22. Problemas Detectados y Resueltos Durante la Auditoría

1. **Inclusión accidental de archivos temporales en `public/`:** Durante una prueba preliminar de audio, la presencia transitoria de un archivo de backup `voz.bak.wav` alteró la huella visual. Se corrigió robusteciendo el filtro de `recorrerPublic()` con una expresión regular exhaustiva `/\.(wav|mp3|m4a|ogg|aac|flac)(\..*)?$/i`.
2. **Dependencia de `plan.json` en `huellaVideo`:** Se detectó que si un usuario definía volúmenes de sonido o eventos acústicos en `plan.json`, el JSON completo afectaba a `huellaVideo`. Se resolvió eliminando expresamente las claves `.sonidos`, `.audio` y `frases[].sonidos` antes de computar el hash visual.
3. **Sintaxis de argumentos en `sonidos.py`:** Se identificó que `sonidos.py` toma la carpeta de destino como argumento posicional (`python sonidos.py [carpeta]`) y no mediante el flag `--proyecto`.

---

## 23. Recomendaciones Técnicas

1. **Portabilidad a la Plantilla Maestra:** En el momento en que se abra formalmente la etapa de actualización de la plantilla, trasladar las mejoras de `render.mjs` (separación `huellaVideo` / `huellaAudio`) a `.agent/skills/nexora-reels/assets/plantilla/render.mjs`.
2. **Automatización del venv en `preparar.py`:** Considerar que `preparar.py` incluya una opción opcional `--venv` para generar automáticamente el entorno virtual local con las dependencias mínimas para `poses.py` y `sonidos.py`.
3. **Consolidación en Bloque 5:** La skill cuenta con todas sus bases técnicas, renderizado desacoplado, motor de audio y herramientas de soporte listas para la redacción final de `SKILL.md` y documentación de usuario en el Bloque 5.

---

## Veredicto Final

# **APTO**

Las dos condiciones pendientes del Bloque 4B han sido completamente resueltas y verificadas mediante pruebas funcionales reales:
1. **Condición A satisfecha:** Las huellas de video y audio operan de manera 100% independiente. Los cambios sonoros no invalidan los trozos de video, y los cambios visuales no invalidan la mezcla acústica pre-generada.
2. **Condición B satisfecha:** El entorno Python aislado `.venv` permite la ejecución determinista de `poses.py` y `sonidos.py` con SciPy, manteniendo el intérprete global del sistema 100% limpio.
3. **Integridad absoluta:** Los 262 archivos de baseline permanecen intactos, la regresión audiovisual arrojó un SSIM de 0.9988 y un PSNR de 52.60 dB con respecto a la referencia, y la producción audiovisual cumple rigurosamente con los estándares de emisión (1080×1920 @ 30 FPS, -14.4 LUFS, -3.2 dBFS True Peak, sin fotogramas negros ni congelamientos).

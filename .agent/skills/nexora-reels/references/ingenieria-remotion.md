# Ingeniería de Remotion, Determinismo y Zonas Seguras
## Guía Técnica para Nexora Motion Reels

---

### 1. Determinismo en el Renderizado Headless

Remotion renderiza video fotograma a fotograma utilizando instancias paralelas de Chromium headless. Para garantizar que cada pasada sea bit-a-bit idéntica y no sufra parpadeos:

1. **Dependencia Exclusiva de `useCurrentFrame()`:**
   - Cualquier cálculo de posición, escala, opacidad o color debe ser una función determinista de `frame` y `fps`.
   - Prohibido el uso de `Date.now()`, `performance.now()`, `setInterval`, `setTimeout` o `requestAnimationFrame`.
2. **Generación Aleatoria con Semilla:**
   - Si se requiere ruido visual o distribución de partículas, utilizar un generador pseudoaleatorio determinista alimentado por una semilla fija (ej. `rnd(seed)` basado en seno trigonométrico). Prohibido `Math.random()`.
3. **Clamping Obligatorio en Interpolaciones:**
   - Siempre que se utilice `interpolate()`, definir explícitamente:
     ```ts
     { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
     ```
     para prevenir desbordamientos numéricos cuando el fotograma actual supere el rango previsto de la escena.

---

### 2. Coordinación de Tiempos y Línea de Secuencia

* **Uso de `useVideoConfig()`:**
  - Evitar constantes fijas en segundos dentro de los componentes. El tiempo debe calcularse siempre con `frame / fps`.
* **Secuenciación con `<Sequence>`:**
  - Cada escena se aísla en su propio componente `<Sequence from={ini} durationInFrames={dur}>`.
  - Las animaciones internas deben iniciar en fotogramas locales relativos al inicio de la escena (`frame = useCurrentFrame()`, donde 0 es el inicio de esa escena concreta).

---

### 3. Zonas Seguras Provisionales y Distribución Espacial en Pantalla Vertical

En el formato 1080×1920 (relación de aspecto 9:16), la distribución debe anticipar la interfaz de las diferentes plataformas (Instagram Reels, TikTok, YouTube Shorts). Las coordenadas indicadas a continuación son **valores provisionales de referencia técnica** y **no constituyen zonas seguras universales fijas**:

```
┌──────────────────────────────────────────┐ y = 0
│   MARGEN SUPERIOR (Notch, Cámaras)       │ y = 0 a 80 px
├──────────────────────────────────────────┤ y = 80 px
│                                          │
│   ZONA GRÁFICA PROVISIONAL DE REFERENCIA │
│   (Contenido principal, ilustraciones,   │ y = 80 a 1040 px (Provisional)
│   tarjetas y diagramas)                  │
│                                          │
├──────────────────────────────────────────┤ y = 1040 px
│   BÚFER LIMPIO DE SEGURIDAD (≈290 px)    │ y = 1040 a 1330 px
├──────────────────────────────────────────┤ y = 1330 px
│   ZONA DE SUBTÍTULOS (Línea central)     │ y = 1200 a 1450 px
├──────────────────────────────────────────┤ y = 1450 px
│   MARGEN INFERIOR / INTERFAZ SOCIAL      │ y = 1450 a 1920 px
│   (Pie de audio, descripción y botones)  │
└──────────────────────────────────────────┘ y = 1920 px
```

> [!WARNING] **Advertencia sobre zonas seguras:**
> Las coordenadas $y: 80–1040$ son una **estimación de partida provisional** optimizada para subtitulado en línea sin avatar. Debido a la dispersión de interfaces de usuario (botones laterales de TikTok vs. Shorts vs. Reels, densidad de texto en descripciones y diferencias en relaciones de aspecto de pantallas móviles), estas coordenadas **requieren siempre validación visual específica** en cada proyecto mediante `salida/hoja.png` o el Remotion Player. No deben asumirse como una garantía absoluta contra solapamientos. En configuraciones con subtitulado en bloque o avatares, la zona se recalcula dinámicamente mediante `ZONA` en `actual.ts`.

---

### 4. Herramientas de Validación, Renderizado y QA

El pipeline de Nexora Reels dispone de un conjunto integral de herramientas de inspección, renderizado determinista y control de calidad totalmente operativas:

#### A. Motor de Renderizado y Caché Desacoplada (`render.mjs`):
* **Caché Criptográfica Independiente:**
  - `huellaVideo()`: Prefijada con `video-v2` y la especificación técnica de codec (`codec:h264:yuv420p:veryfast:jpeg:92`). Hashea recursivamente `src/` y `public/` excluyendo selectivamente los recursos sonoros (`sonidos/`, `voz.*`, formatos `.wav`, `.mp3`). Genera un hash SHA-256 de **24 caracteres hexadecimales**. Los trozos de video mudos se almacenan en `salida/trozos/${claveVideo}/`.
  - `huellaAudio(audio, fps)`: Prefijada con `audio-v2`. Hashea la pista `public/voz.wav`, los archivos WAV de los efectos de sonido requeridos, FPS, fotogramas totales y eventos sonoros `[nombre, fotograma, volumen]`. Genera un hash SHA-256 de **24 caracteres hexadecimales**. La mezcla estéreo PCM a 48 kHz se almacena en `salida/trozos/audio/${claveAudio}.wav`.
  - **Efecto de Desacoplamiento:** Cambiar la voz o un efecto sonoro renderiza **0 fotogramas de video**; cambiar estilos o recursos gráficos reutiliza instantáneamente la mezcla de audio.
* **Inspección de Integridad (`validarTrozo`):**
  - Cada fragmento de video es validado con `ffprobe` para confirmar legibilidad estructural y duración positiva, con un umbral de tamaño mínimo de **1.000 bytes** para admitir trozos residuales breves de 1 fotograma sin re-renderizados innecesarios.
* **Resolución Automática de Binarios Multimedia:**
  - El motor busca dinámicamente FFmpeg y FFprobe en tres niveles jerárquicos: configuración en `entorno.json`, variable de entorno `PATH` del sistema, y paquete nativo de Remotion (`node_modules/@remotion/compositor-*`).
* **Comandos y Flags Operativos:**
  - `npm run video` (o `node render.mjs video`): Renderiza a 1080×1920 @ 30 FPS, CRF 20 en `salida/reel.mp4`.
  - `node render.mjs video --borrador`: Render rápido a 540×960, CRF 26 en `salida/borrador.mp4`.
  - Flags de control: `--crf <num>`, `--hilos <num>`, `--max-segundos <seg>` (interrupción limpia con código 3 PARCIAL y reanudación automática), `--limite-mb <num>` (recompresión automática si supera 28 MB), `--forzar` (ignora avisos bloqueantes en `resumen`).

#### B. Inspección Visual y Comprobación Estática:
* **`npm run resumen` (o `node render.mjs resumen`):**
  - Analiza `plan.json` frente a `tiempos.json`, verifica iconos en la biblioteca Lucide, comprueba contraste cromático ($\ge 3:1$) y valida límites de caracteres.
  - Distingue entre **PROBLEMAS** (errores fatales que bloquean el render salvo `--forzar`) y **AVISOS** (recomendaciones editoriales y advertencias de ritmo).
* **`npm run fotos` (o `node render.mjs fotos`):**
  - Genera la hoja de contacto `salida/hoja.png` extrayendo el punto medio, momentos de entrada y fotograma final de cada escena. Admite intervalo temporal personalizado (`node render.mjs fotos 0.5`).
* **`node render.mjs foto <segundo>`:**
  - Extrae un fotograma a resolución nativa completa (1080×1920) en el segundo indicado (ej. `node render.mjs foto 2.5 12.0` $\rightarrow$ `salida/foto_2.50.png`).
* **`npm run portada` (o `node render.mjs portada`):**
  - Genera `salida/portada.png` y `salida/portada_check.png` con la cuadrícula de comprobación del recorte 3:4 del feed de Instagram.
* **`npm run tipos` (`tsc -p .`):**
  - Comprobación estricta de tipos de TypeScript sin emitir archivos.

#### C. Control de Calidad Dinámico (`ritmo.py` y `alinear.py`):
* **Auditoría de Retención (`ritmo.py`):**
  - `py ../.agent/skills/nexora-reels/scripts/ritmo.py salida/reel.mp4 --tiempos src/datos/tiempos.json`
  - Analiza el flujo óptico y la variación de píxeles en escala de grises. Cuando se proporciona `--tiempos`, coteja los momentos de voz para distinguir pausas de asimilación deliberadas (1.0–1.5 s) de tramos verdaderamente estáticos o escenas desprovistas de momentos `en`.
* **Normalización Acústica (`alinear.py`):**
  - Procesa la pista vocal aplicando filtro paso alto a 70 Hz, remuestreo a 48 kHz mono y normalización de sonoridad estricta a **-14 LUFS** según el estándar EBU R128 antes de ubicarla en `public/voz.wav`.

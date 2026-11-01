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

### 4. Estado Real de las Herramientas de Validación y QA

Es fundamental distinguir con precisión las capacidades que ya funcionan de las que están planificadas para fases posteriores:

#### A. Controles Existentes y Operativos en el Código:
* **`node render.mjs resumen`:** Comprueba la consistencia de `plan.json`, verifica que los iconos pertenezcan a la librería Lucide, valida la presencia de palabras clave en `tiempos.json` y audita el contraste cromático de los estilos.
* **`node render.mjs fotos`:** Genera `salida/hoja.png` extrayendo automáticamente el punto medio, los momentos clave y el fotograma final de cada escena para inspección visual humana.
* **`python scripts/ritmo.py salida/reel.mp4`:** Audita el video renderizado mediante visión artificial en escala de grises para detectar tramos sin cambios visuales superiores a 0,6 s.
* **`node render.mjs portada`:** Genera `salida/portada_check.png` verificando el recorte 3:4 utilizado por el feed de Instagram.

#### B. Controles Propuestos para Integración Futura (No Existentes Todavía):
* **Auditoría de Audio (`audio-check`):** `ritmo.py` **no mide audio**. La medición de sonoridad integrada a -14 LUFS y True Peak con FFmpeg `ebur128` se integrará como una herramienta independiente en fases posteriores.
* **Detección Automática de Colisiones Espaciales:** Comprobación algorítmica de cajas envolventes (*bounding boxes*) en `resumen` para validar que ningún elemento sobrepase $y = 1040$. Actualmente debe verificarse visualmente en `hoja.png`.
* **Prueba de Determinismo Bit-a-Bit:** Script de cálculo de hash SHA256 sobre fotogramas para validar consistencia entre renders sucesivos.

# 02. Informe Individual de Fuentes Externas
## Evaluación Técnica de MotionCraft, Claude Remotion Skill y Remotion Best Practices

---

### 1. Fuente A: MotionCraft (`ahmdd4vd/MotionCraft`)

#### A. Arquitectura y Componentes Verificados
MotionCraft está concebido como una skill integral y un asistente CLI para agentes de código (Claude Code, Cursor, Codex), estructurado para guiar la producción de videos explicativos, demos de producto y contenido social en Remotion.

```text
MotionCraft/
├── SKILL.md                   # Definición de la persona, flujo de 9 pasos y reglas maestras
├── scripts/
│   └── motioncraft.mjs        # Controlador CLI unificado para el agente
├── references/
│   ├── preflight.md           # Verificación de dependencias de entorno
│   ├── script-and-structure.md# Estructura narrativa (Gancho 0-3s -> Reframe -> Prueba -> CTA)
│   ├── research-and-topic.md  # Metodología de investigación y verificación de fuentes
│   ├── reference-analysis.md  # Extracción de métricas visuales y cortes de videos modelo
│   ├── social-formats.md      # Zonas seguras para TikTok, IG Reels y límites de compresión
│   └── phase4-templates.md    # Mapeo de componentes y plantillas
└── templates/                 # Plantillas Remotion con tokens de diseño bloqueados
```

#### B. Capacidades Analizadas
1. **Metodología "Reference First" ([`references/reference-analysis.md`]):**
   - Prohíbe que el agente invente una dirección visual desde cero. Obliga a seleccionar o descargar un video de referencia (`ref get <url>`), analizar sus cortes por segundo, su distribución cromática y su energía de movimiento (`ref report`), usándolo como ancla estilística para el código.
2. **Planificación Narrativa y Beats ([`references/script-and-structure.md`]):**
   - Estructura el guion en bloques rígidos de retención:
     * *0–3s:* Gancho visual y auditivo de alta energía.
     * *3–10s:* Reencuadre del problema (contraste).
     * *10–25s:* Demostración / Prueba técnica con soporte visual.
     * *Final:* Llamada a la acción (CTA) con retención de marca.
3. **Control de Calidad Visual Automatizado (`motioncraft.mjs qa`):**
   - Incorpora scripts para detectar colisiones entre capas de texto e interfaces gráficas antes del renderizado final.
4. **Plantillas con Estética "SaaS / Tech":**
   - Ofrece temas visuales preconfigurados (`pi-v2`, `warm-paper`, `mono-editorial`, `tech-neon-soft`) con espaciados y tipografías consistentes.

#### C. Licencia y Dependencias
- **Licencia:** MIT (código abierto permisivo).
- **Dependencias Principales:** Node.js 18+, Remotion.
- **Dependencias Secundarias / Opcionales:**
  * Python 3 con `faster-whisper` (alineación fonética).
  * `yt-dlp` (descarga de videos de referencia de YouTube/Vimeo).
  * `librosa` (análisis musical y detección de BPM).
  * `tesseract` (OCR para extraer textos de videos de referencia).

#### D. Evaluación Crítica para Team Nexora
- **Aporte real:** La metodología de preproducción (*Reference First*), el desglose estructurado de guion por bloques temporales y los criterios de zonas seguras en [`social-formats.md`].
- **Elementos no recomendados:** Su CLI `motioncraft.mjs` y su pipeline de audio duplican de forma innecesaria lo que Becario Reels ya resuelve con mayor ligereza (nuestro `alinear.py` no necesita descargar `faster-whisper` ni dependencias pesadas de audio para funcionar). Adoptar MotionCraft entero añadiría complejidad innecesaria sin aportar mejoras directas al motor gráfico.

---

### 2. Fuente B: Claude Remotion Skill (`haidrrrry/claude-remotion-skill`)

#### A. Arquitectura y Componentes Verificados
Un repositorio enfocado con precisión quirúrgica en erradicar el "aspecto de video genérico de IA" mediante reglas de diseño estrictas, físicas realistas y componentes de acabado cinematográfico en Remotion.

```text
remotion-motion-graphics/
├── SKILL.md                   # Flujo operativo y las "10 Reglas No Negociables de Animación"
├── references/
│   ├── design-rules.md        # Teoría del color (60-30-10), tipografía y ritmo visual
│   └── motion-patterns.md     # Biblioteca de código reutilizable (Backgrounds, Físicas, Shaders)
└── assets/
    └── theme.ts               # Starter kit de tokens de color, fuentes y configuraciones spring
```

#### B. Capacidades Analizadas
1. **Las 10 Reglas No Negociables de Animación ([`SKILL.md`]):**
   - **Regla 1 (Física obligatoria):** Prohibido el `interpolate()` lineal simple; todo movimiento debe usar `spring()` o funciones con `Easing` explícito y `extrapolate: "clamp"`.
   - **Regla 2 (Entradas multi-propiedad):** Toda entrada debe animar simultáneamente al menos 2–3 propiedades coordinadas (ejemplo: `opacity` + `translateY` + `scale` elástico).
   - **Regla 3 (Staggering universal):** Los elementos de un mismo grupo o lista deben ingresar con desfases obligatorios de 3 a 6 fotogramas.
   - **Regla 4 (Salidas rápidas):** Las salidas de escena deben ejecutarse en aproximadamente la mitad de tiempo que las entradas (~10 fotogramas frente a ~20 fotogramas) para mantener la agilidad del video.
   - **Regla 5 (The 5-Layer Composite Stack):** Ninguna escena puede tener un fondo plano sólido. Obliga a componer cinco capas conceptuales de abajo hacia arriba:
     $$\text{1. BgMesh (atmósfera de fondo)} \rightarrow \text{2. Metraje/Assets} \rightarrow \text{3. Gráficos/UI} \rightarrow \text{4. Color Grade} \rightarrow \text{5. PostProcess (Grain + Vignette)}$$
     *(Nota técnica de arquitectura: Se compone de 5 capas lógicas ordenadas, donde la capa 5 integra los dos efectos de acabado óptico: grano estocástico y viñeteado perimetral).*
   - **Regla 6 (Ken Burns continuo):** Las imágenes fijas deben tener siempre una micro-escala lenta (`1.0 → 1.08`).
   - **Regla 7 (Idle breathing):** Los elementos estáticos en pantalla durante más de 1,5 segundos deben poseer una oscilación procedural senoidal sutil para mantener el dinamismo.
   - **Regla 8 (Sincronía con FPS):** Los cálculos deben derivarse de `useVideoConfig().fps`, prohibiendo números mágicos arbitrarios.
   - **Regla 9 (Centralización temática):** Todos los valores de color y física deben importarse de un `theme.ts` centralizado.
   - **Regla 10 (Render-Inspect Loop):** Verificación obligatoria de fotogramas clave renderizados antes de dar por buena una escena.

2. **Biblioteca de Patrones Listos para Producción ([`references/motion-patterns.md`]):**
   - Componente `BgMesh`: Fondos multicapa con gradientes radiales oscilantes.
   - Componentes `FilmGrain` y `Vignette`: Filtros SVG nativos con `feTurbulence` que aportan textura de celuloide analógico sin consumir apenas memoria.
   - Resortes calibrados en `theme.ts`:
     * `snappy`: `{ damping: 18, stiffness: 220, mass: 0.8 }` (entradas ágiles de UI).
     * `bouncy`: `{ damping: 12, stiffness: 180, mass: 0.6 }` (elementos destacados y badges).
     * `heavy`: `{ damping: 24, stiffness: 140, mass: 1.4 }` (tarjetas grandes y fondos).

#### C. Licencia y Dependencias
- **Licencia:** MIT (código abierto permisivo).
- **Dependencias:** **0 dependencias adicionales.** Se apoya al 100% en las APIs nativas de Remotion (`remotion`), React y CSS/SVG nativo.

#### D. Evaluación Crítica para Team Nexora
- **Aporte real:** **Máximo valor visual con cero coste.** Es el recurso de mayor impacto estético de los tres. Al integrarlo en los componentes de Becario Reels, transforma de inmediato las ilustraciones planas en piezas con volumen, textura y movimiento profesional.

---

### 3. Fuente C: Antigravity Awesome Skills — Remotion Best Practices (`sickn33/antigravity-awesome-skills`)

#### A. Arquitectura y Componentes Verificados
Un conjunto modular de directrices técnicas de ingeniería de software para Remotion, diseñado como base de conocimiento para agentes en el ecosistema Antigravity/Codex.

```text
skills/remotion-best-practices/
├── SKILL.md                 # Router principal que guía al agente hacia la regla correcta
└── rules/
    ├── animations.md        # Principios fundamentales y renderizado determinista
    ├── timing.md            # Mapeo temporal, interpolaciones y físicas
    ├── text-animations.md   # Tipografía cinética, máscaras y efectos de revelado
    ├── transitions.md       # Transiciones avanzadas entre secuencias
    ├── 3d.md                # Integración de Three.js y WebGL con @remotion/three
    ├── audio.md             # Curvas de volumen, sincronización y prevención de desincronización
    ├── sequencing.md        # Estructuración con <Sequence>, <Series> y duraciones
    └── tailwind.md          # Reglas para TailwindCSS dentro del flujo de canvas
```

#### B. Capacidades Analizadas
1. **Renderizado Determinista y Prevención de Errores ([`rules/animations.md`]):**
   - Prohíbe terminantemente el uso de transiciones CSS (`transition: all 0.3s`), bucles de reloj asíncronos (`setInterval`, `Date.now()`, `requestAnimationFrame`) y números pseudo-aleatorios sin semilla (`Math.random()`), ya que provocan fallos de parpadeo y asincronía en renders paralelos de Chrome Headless.
   - Enfatiza el uso de estilos en línea enlazados estrictamente a `useCurrentFrame()`.
2. **Tipografía Cinética Avanzada ([`rules/text-animations.md`]):**
   - Patrones para enmascarado de texto: Contenedores con `overflow: hidden` donde el texto emerge verticalmente con aceleración no lineal.
   - Desfase métrico por caracteres y palabras sin saltos de maquetación (*layout shift*).
   - Efecto de máquina de escribir determinista con cursor parpadeante sincronizado con la frecuencia de fotogramas.
3. **Fórmulas de Timing y Easing ([`rules/timing.md`]):**
   - Implementación de curvas Bézier cúbicas personalizadas (`Easing.bezier(x1, y1, x2, y2)`) para conseguir frenadas bruscas con inercia visual.
   - Parámetros de extrapolación seguros (`extrapolateLeft: "clamp"`, `extrapolateRight: "clamp"`).
4. **Integración 3D Determinista ([`rules/3d.md`]):**
   - Guía paso a paso para utilizar `@remotion/three` mediante el componente `<ThreeCanvas>`.
   - Garantiza que la cámara virtual y los shaders se sincronicen directamente con `useCurrentFrame()`, evitando el desfase temporal del `useFrame` tradicional de React Three Fiber.

#### C. Licencia y Dependencias
- **Licencia:** MIT (código abierto permisivo).
- **Dependencias:**
  * Para directrices generales (2D, tipografía, timing): **0 dependencias adicionales.**
  * Para el módulo 3D: Requiere instalar `three`, `@types/three` y `@remotion/three`.

#### D. Evaluación Crítica para Team Nexora
- **Aporte real:** Es el complemento de ingeniería perfecto para las reglas artísticas de Claude Remotion Skill. Proporciona la fundamentación matemática para las máscaras tipográficas, las curvas Bézier y los protocolos de renderizado estable, además de brindar una ruta clara para incorporar elementos 3D deterministas si el guion lo requiere en el futuro.

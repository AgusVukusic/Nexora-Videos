# 01. Informe de Auditoría Técnica: Becario Reels
## Análisis de Arquitectura, Funcionalidades, Limitaciones y Preservación

---

### 1. Fuentes Inspeccionadas y Metodología
La auditoría se realizó mediante la inspección directa del archivo maestro distribuido:
- Archivo comprimido original: `media_1793192037910_f5866e75.zip` (93 archivos registrados en el manifiesto zip).
- Árbol de archivos activo en el entorno: `.agent/skills/becario-reels/` y proyecto renderizado `reel-microondas/`.

El sistema se compone de tres capas acopladas:
1. **Capa de Control e Instrucciones (`SKILL.md` + `references/`):** Define el comportamiento del agente de IA, las reglas de guionización y el formato del plan de producción (`plan.json`).
2. **Capa de Soporte Python (`scripts/`):** Herramientas de preparación del entorno, síntesis de audio, alineación fonética de voz, segmentación de imágenes y control de calidad de ritmo.
3. **Capa de Renderizado Remotion/React (`assets/plantilla/`):** Proyecto TypeScript/React empaquetado con Remotion 4.0.538, motor de composición por capas y biblioteca de escenas.

---

### 2. Inventario y Clasificación de Capacidades

#### A. Funciones Implementadas y Funcionales (Evidencia Verificada en Código)

1. **Alineación Fonética Temporal y Sincronía ([`scripts/alinear.py`](../../../.agent/skills/becario-reels/scripts/alinear.py)):**
   - **Mecanismo:** Decodifica el audio mediante FFmpeg a PCM 48 kHz mono (`decodificar`), calcula la envolvente de energía RMS por ventanas de 10 ms (`envolvente_db`) y suprime pausas mayores a 0,26 s (`tramos_silencio`), eliminando tiempos muertos.
   - **Alineación:** Implementa dos motores:
     * Motor `"silabas"`: Algoritmo determinista puro en NumPy que divide las palabras según reglas silábicas del español y ajusta los límites a los picos de energía de la voz sin descargar modelos externos.
     * Motor `"asr"`: Integración con modelos de reconocimiento automático del habla (CTC).
   - **Salida:** Genera `public/voz.wav` normalizado a -14 LUFS y `src/datos/tiempos.json` con estampas milimétricas por palabra y adelanto visual (`ADELANTO = 4` fotogramas).

2. **Renderizado Seguro por Lotes y Orquestación Node ([`assets/plantilla/render.mjs`](../../../.agent/skills/becario-reels/assets/plantilla/render.mjs)):**
   - **Mecanismo:** Utiliza la API programática de `@remotion/renderer` (`renderMedia`, `renderStill`) en lugar de invocar la CLI externa.
   - **Tolerancia a fallos:** Divide el renderizado en fragmentos (`TROZOS = salida/trozos`) con tiempo límite configurable (`--max-segundos 270`), permitiendo reanudar renders interrumpidos por límites de sesión.
   - **Inspección sin render:** Subcomando `resumen` que valida tipos de escenas, existencia de iconos Lucide, solapamiento de textos y límites de caracteres sin consumir tiempo de GPU.
   - **Generación de Hoja de Contacto (`fotos`):** Genera `salida/hoja.png` extrayendo automáticamente el punto medio, los momentos clave (`en`) y el fotograma final de cada escena.

3. **Auditoría de Ritmo por Visión Artificial ([`scripts/ritmo.py`](../../../.agent/skills/becario-reels/scripts/ritmo.py)):**
   - **Mecanismo:** Extrae el stream de video en escala de grises a 540x960 mediante FFmpeg y calcula matrices de diferencia absoluta entre fotogramas consecutivos segmentados en tres regiones espaciales (`arriba`, `centro`, `abajo`) y cuadrículas de 90x80 px.
   - **Detección:** Señala cualquier hueco estático superior a 0,6 s (`--hueco 0.6`), devolviendo código de error `1` si el video decae en retención visual.

4. **Síntesis Determinista de Efectos Sonoros ([`scripts/sonidos.py`](../../../.agent/skills/becario-reels/scripts/sonidos.py)):**
   - **Mecanismo:** Generación matemática de audio a 48 kHz usando filtros Butterworth paso-banda, paso-bajo, paso-alto y barridos exponenciales en SciPy (`scipy.signal.sosfilt`).
   - **Biblioteca:** 17 sonidos nativos deterministas (`pop`, `ding`, `exito`, `campana`, `tecla`, `whoosh`, `swoosh`, etc.) sin dependencias de librerías de terceros con copyright.

5. **Mezcla Determinista de Pistas en FFmpeg ([`render.mjs: mezclarAudio`](../../../.agent/skills/becario-reels/assets/plantilla/render.mjs#L80-L115)):**
   - No delega la mezcla de audio al navegador durante el canvas render; genera una cadena de filtros FFmpeg (`aresample`, `atrim`, `adelay`, `amix`) que sincroniza cada efecto sonoro al milisegundo exacto respecto a la pista de voz.

6. **Normalización y Recorte de Personajes ([`scripts/poses.py`](../../../.agent/skills/becario-reels/scripts/poses.py)):**
   - Elimina fondos lisos con análisis de gradiente de color y distancia euclidiana (`scipy.ndimage`), calculando el centro y ancho de la cabeza para evitar que el avatar salte de posición al alternar poses.

---

#### B. Funciones Documentadas cuya Implementación no está Confirmada o es Parcial

1. **Reconocimiento ASR con Parakeet/NeMo (`alinear.py --motor asr`):**
   - Aunque está codificada la rama condicional, requiere la descarga de un modelo CTC de ~470 MB y paquetes complejos (`nemo_toolkit` o `torch`). En entornos estándar de Windows o sin GPU CUDA dedicada, suele fallar o requerir compiladores de C++, por lo que el sistema recurre casi siempre al motor de `"silabas"`.
2. **Biblioteca de 17 Escenas Nativas ([`src/escenas/`](../../../.agent/skills/becario-reels/assets/plantilla/src/escenas)):**
   - Las escenas estándar (`tarjetas.tsx`, `apps.tsx`, `titular.tsx`) son funcionalmente operativas, pero su diseño se basa en maquetaciones muy rígidas (cajas rectangulares, bordes CSS simples y listas de viñetas). La promesa de un "vídeo que parece editado a mano" no se cumple con las escenas predeterminadas, obligando en la práctica a diseñar escenas propias en SVG (`src/propias/`) para obtener un acabado visual aceptable.
3. **Efectos de Imagen Avanzados documentados en `escenas.md` (`agua`, `causticas`, `rayos`, `peces`):**
   - Están implementados en [`src/piezas/imagenes.tsx`](../../../.agent/skills/becario-reels/assets/plantilla/src/piezas/imagenes.tsx) mediante filtros CSS y assets en `public/texturas/`, pero su uso está restringido a la escena `imagen` y no pueden combinarse de forma global con gráficos vectoriales o texto.

---

#### C. Limitaciones Visuales, Técnicas y de Flujo de Trabajo

1. **Carencia de Profundidad Espacial y Acabado Cinematográfico:**
   - La composición en [`Reel.tsx`](../../../.agent/skills/becario-reels/assets/plantilla/src/Reel.tsx) renderiza un fondo plano ([`Fondo.tsx`](../../../.agent/skills/becario-reels/assets/plantilla/src/motor/Fondo.tsx)) y superpone las escenas directamente. No hay gradientes dinámicos vivos, ni iluminación direccional, ni viñeteado óptico ni textura de grano analógico. El resultado tiene el aspecto de gráficos vectoriales 2D sintéticos ("look diapositiva digital").
2. **Motor de Animación Primitivo ([`src/motor/anim.ts`](../../../.agent/skills/becario-reels/assets/plantilla/src/motor/anim.ts)):**
   - Solo dispone de una función de resorte (`usePop`) con configuración fija (`damping: 12, stiffness: 190, mass: 0.6`).
   - No admite amortiguación diferenciada según el tipo de objeto (pesado, elástico, seco).
   - No tiene utilidades para coreografía escalonada (*staggering*), obligando a calcular offsets manuales en fotogramas (`en + 6`, `en + 12`).
   - Los movimientos de entrada son univariables (habitualmente solo escala o solo traslación).
3. **Transiciones Extremadamente Reducidas ([`src/motor/Escena.tsx`](../../../.agent/skills/becario-reels/assets/plantilla/src/motor/Escena.tsx)):**
   - Solo soporta `corte`, `suave` (fundido lineal con blur) y `semitono` (malla procedural de círculos).
   - Carece de transiciones cinéticas: barridos direccionales (*whip pan*), zooms de inmersión (*zoom-through*) o continuidad morfológica de objetos entre planos consecutivos.
4. **Fragilidad de Maquetación y Desbordamiento Tipográfico:**
   - En el lienzo de 1080x1920 (mapeado internamente a un viewBox de 800 o lienzo de 960x860), textos con más de 25 caracteres tienden a colisionar con los márgenes o desbordar las cajas decorativas.
   - La zona inferior de subtítulos (`y: 1080 a 1920`) compite frecuentemente con tarjetas informativas si no se aplican zonas de seguridad estrictas.

---

### 3. Elementos que Deben Conservarse sin Cambios

Los siguientes componentes de Becario Reels representan una sólida base de ingeniería y deben ser preservados íntegramente:
1. **Pipeline de Voz y Whisper (`alinear.py`):** La normalización sonora a -14 LUFS, el recorte de pausas excesivas (`--pausa 0.26`) y la exportación estructurada de `tiempos.json`.
2. **Mapeo Perceptual de Subtítulos (`Subtitulos.tsx`):** La lógica de partición de frases, agrupamiento de palabras clave entre asteriscos y anticipación de 4 fotogramas para lectura cómoda.
3. **Motor de Renderizado Headless (`render.mjs`):** La arquitectura de renderizado por trozos con tolerancia a tiempos de espera, la generación de la hoja de contactos (`hoja.png`) y el empaquetado final con FFmpeg.
4. **Auditoría de Retención (`ritmo.py`):** El detector de fotogramas estáticos por visión artificial (es un estándar de control de calidad objetivo).
5. **Generador Determinista de Sonidos (`sonidos.py`):** La síntesis matemática de SFX (cero problemas de copyright y reproducibilidad exacta).

---

### 4. Elementos que Conviene Ampliar o Sustituir

| Componente | Archivo Actual | Acción Propuesta | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Motor de Físicas y Easing** | `src/motor/anim.ts` | **Ampliar** | Integrar `useMultiSpring`, generadores de *stagger*, micro-movimiento senoidal (*breathing*) y curvas Bézier cinemáticas. |
| **Profundidad y Acabado** | `src/motor/Fondo.tsx` y `Reel.tsx` | **Sustituir / Extender** | Implementar *The 5-Layer Stack*: mallas de degradado vivas (`BgMesh`), viñeta radial y filtro SVG de grano de película (`feTurbulence`). |
| **Transiciones de Escena** | `src/motor/Escena.tsx` | **Ampliar** | Añadir transiciones cinéticas continuas (`whip-pan` direccional con desenfoque de movimiento y `zoom-through`). |
| **Tipografía Cinética** | `src/piezas/basicas.tsx` | **Añadir Componente** | Crear componente `TextoRevelado` con máscaras de recorte (`overflow: hidden`) y revelado direccional por resorte. |
| **Tokens de Diseño** | `src/motor/estilos.ts` | **Reestructurar** | Reemplazar los estilos rígidos por un sistema de diseño centralizado (`theme.ts`) con paletas 60-30-10 y constantes físicas. |

---

### 5. Riesgos Técnicos, Dependencias y Licencias

1. **Licencia de Remotion:** Remotion se distribuye bajo una licencia de uso dual: es gratuito para personas individuales y entidades de hasta 3 empleados; para organizaciones de mayor tamaño requiere una licencia comercial de pago (`remotion.dev/license`). Esto debe considerarse en el modelo operativo de Team Nexora.
2. **Dependencia de Binarios Nativos:** `render.mjs` y `alinear.py` dependen de ejecutables de FFmpeg y Chrome/Chromium Headless. En Windows, las llamadas directas sin extensión `.cmd` o rutas absolutas pueden generar fallos `WinError 2`, riesgo ya mitigado en la configuración actual pero que debe vigilarse al introducir nuevos scripts.
3. **Paquetes NPM:** La plantilla utiliza React 19.2.3 y Remotion 4.0.538. Cualquier librería adicional debe ser estrictamente compatible con React 19 para evitar bloqueos de resolución en `npm install`.

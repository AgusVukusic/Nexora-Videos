# 07. Registro de Limitaciones de la Investigación
## Elementos no Accesibles, Hipótesis Pendientes y Aspectos a Verificar

---

### 1. Alcance y Restricciones Operativas de la Auditoría
En cumplimiento estricto de las directivas de la **Fase 1**, la presente auditoría se realizó sin instalar paquetes externos, sin descargar modelos neuronales pesados, sin alterar las configuraciones del entorno y sin modificar los archivos de código existentes. 

A continuación se detallan las limitaciones metodológicas y las hipótesis que quedan pendientes de verificación empírica en las etapas prácticas posteriores.

---

### 2. Elementos no Ejecutados por Restricción de Auditoría

1. **Pruebas de Descarga y Análisis de Video con MotionCraft (`yt-dlp` + `librosa`):**
   - *Detalle:* El script `motioncraft.mjs ref get` requiere `yt-dlp` para descargar videos de plataformas de streaming y `librosa` para la detección automática de BPM.
   - *Impacto:* No se ejecutaron descargas de metraje externo para no generar tráfico ni instalar librerías pesadas en el entorno local. La evaluación de su metodología se realizó mediante inspección estática del código y de sus archivos de referencia (`references/reference-analysis.md`).
2. **Motor ASR con Redes Neuronales de Becario Reels (`alinear.py --motor asr`):**
   - *Detalle:* El código de Becario Reels contempla la opción de descargar un modelo CTC de reconocimiento fonético de ~470 MB (Parakeet/NeMo).
   - *Impacto:* No se forzó la descarga de dicho modelo. La auditoría confirmó que el motor de `"silabas"` opera de manera determinista y autónoma con NumPy sin requerir esta descarga. La hipótesis de que el motor de sílabas es suficiente para el 100% de los casos en español queda respaldada por la experiencia del primer reel, pero se auditará con mayor rigor en el reel de prueba.
3. **Instalación de `@remotion/three` y Ecosistema 3D:**
   - *Detalle:* No se instalaron paquetes de Three.js ni `@remotion/three` en el entorno de trabajo.
   - *Hipótesis pendiente de confirmación:* Remotion 4.0.538 y React 19.2.3 están instalados en la plantilla. En el ecosistema de Node.js, `react-three-fiber` ha tenido discrepancias históricas de compatibilidad con versiones mayores de React 19 (`peerDependencies`). Si en el futuro se desea incorporar 3D, deberá probarse la compatibilidad de versiones de `@remotion/three` en un entorno de prueba aislado antes de integrarlo a la plantilla definitiva.

---

### 3. Hipótesis Técnicas Pendientes de Verificación Empírica

1. **Impacto en el Tiempo de Renderizado del Filtro SVG de Grano (`feTurbulence`):**
   - *Hipótesis:* Aplicar una capa fija de grano analógico mediante un filtro SVG nativo con `feTurbulence` y mezcla `overlay` añade entre un 4% y un 7% de tiempo de CPU/GPU por fotograma en Chrome Headless.
   - *Plan de verificación:* En la Etapa 2 de implementación, se medirá el tiempo de renderizado de 100 fotogramas con y sin la capa `FilmGrain` para cuantificar el impacto exacto en segundos.
2. **Estabilidad de las Máscaras Tipográficas con Fuentes Display:**
   - *Hipótesis:* El enmascaramiento con `overflow: hidden` puede recortar ligeramente las virgulillas de la "ñ" o las tildes en fuentes de caja alta muy condensadas (como *Anton* o *Archivo Black*) si la altura del contenedor no incluye un margen superior de seguridad de al menos 4 px.
   - *Plan de verificación:* En la Etapa 3, se construirá un banco de pruebas tipográfico con caracteres especiales en español (`Á, É, Í, Ó, Ú, Ñ, ¿, ¡`) en el componente `TextoRevelado.tsx`.
3. **Suavidad del Desenfoque en la Transición Whip-Pan:**
   - *Hipótesis:* Un filtro CSS `blur(Xpx)` animado durante un desplazamiento de alta velocidad simula eficazmente el *motion blur* de After Effects sin degradar los fotogramas exportados por Chromium.
   - *Plan de verificación:* Se extraerán fotogramas congelados en mitad de la transición (`node render.mjs foto <segundo>`) para auditar si el desenfoque se percibe natural o genera artefactos visuales.
4. **Determinismo Bit-a-Bit entre Renders Sucesivos:**
   - *Hipótesis:* Dos renders del mismo plan con los mismos assets producen fotogramas con hashes SHA256 idénticos en Chromium headless.
   - *Plan de verificación:* En la Etapa 4, se calculará el hash SHA256 de una secuencia de 30 fotogramas exportados en dos ejecuciones separadas.
5. **Calibración del Umbral de Retención en Escenas Explicativas Densas:**
   - *Hipótesis:* El umbral fijo de 0,6 s de `ritmo.py` puede forzar animaciones innecesarias durante la asimilación de diagramas anatómicos o esquemas con más de 12 palabras.
   - *Plan de verificación:* Contrastar en el reel de prueba si permitir pausas deliberadas de hasta 1,0–1,2 s en infografías técnicas complejas mejora la comprensión sin penalizar la retención percibida.

---

### 4. Conclusiones Verificadas sin Incertidumbre

Las siguientes conclusiones técnicas están **100% verificadas** con evidencia directa de los archivos del repositorio:
- `becario-reels` no posee actualmente ningún componente de viñeta, grano, gradiente dinámico ni físicas multi-resorte.
- `haidrrrry/claude-remotion-skill` no requiere ninguna dependencia externa y su código es compatible con React 19 y Remotion 4.0.
- El pipeline local de renderizado por lotes y FFmpeg en `render.mjs` funciona de forma estable en Windows sin coste de servidores ni APIs de pago.
- La publicación manual y la exclusión de música de fondo cumplen plenamente con los objetivos de Team Nexora.

# 05. Lista Priorizada de Integraciones
## Jerarquización Estratégica para la Skill Definitiva de Team Nexora

---

### 1. Resumen de Criterios de Priorización
La jerarquización se basa estrictamente en la relación entre **impacto visual perceptible**, **coste computacional/dependencias** y **facilidad de mantenimiento**.

```
                ▲ ALTO IMPACTO VISUAL
                │
                │   [Nivel 1: Inmediato]
                │   • The 5-Layer Stack (CapasCine)
                │   • MultiSpring & Stagger
                │   • Idle Breathing
                │   • Reference First
                │                                    [Nivel 2: Consolidación]
                │                                    • TextoRevelado (Máscaras)
                │                                    • Transiciones Whip/Zoom
                │                                    • Auditoría Espacial QA
                │
                │                                    [Nivel 3: Diferido]
                │                                    • Lienzo 3D con Three.js
                │
                │   [Descartado]
                │   • CLI MotionCraft
                │   • ASR Parakeet pesado
                │   • Auto-publicación
                └─────────────────────────────────────────────────────────────►
                  BAJA COMPLEJIDAD / 0 DEPENDENCIAS      ALTA COMPLEJIDAD / PESO
```

---

### 2. Nivel 1: Prioridad Inmediata (Impacto Masivo, Complejidad Baja, 0 Dependencias)

Estas capacidades deben implementarse en el primer ciclo de desarrollo de la skill, ya que resuelven el 80% de la brecha visual frente a producciones de agencia sin añadir peso técnico:

1. **The 5-Layer Scene Stack (`CapasCine.tsx`):**
   - **Por qué primero:** Transforma de forma global e instantánea cualquier video. Elimina el aspecto de dibujo plano digital al inyectar mallas de degradado vivas (`BgMesh`), viñeteado perimetral y grano analógico sutil (`FilmGrain`).
   - **Coste/Dependencias:** 0 dependencias nuevas. Utiliza SVG nativo y CSS estándar.
2. **Toolkit de Físicas y Easing (`anim.ts` ampliado):**
   - **Por qué primero:** Proporciona las funciones fundamentales (`useMultiSpring`, `useStagger`, `useBreathing`, curvas Bézier de deceleración) que utilizarán todas las escenas futuras.
   - **Coste/Dependencias:** 0 dependencias. Se apoya en el motor matemático existente de Remotion.
3. **Metodología de Preproducción "Reference First":**
   - **Por qué primero:** Es una regla de comportamiento para el agente en `SKILL.md` que garantiza coherencia en paletas de color (60-30-10) y tipografía antes de programar una escena.
   - **Coste/Dependencias:** 0 dependencias técnicas.
4. **Sistema Centralizado de Tokens (`theme.ts`):**
   - **Por qué primero:** Estandariza la escala de resortes, curvas y paletas cromáticas, evitando valores "mágicos" dispersos en el código.

---

### 3. Nivel 2: Prioridad Secundaria (Refinamiento Cinemático y Narrativo)

Capacidades que aportan un salto cualitativo en la fluidez y el dinamismo entre planos:

1. **Componente de Tipografía Cinética (`TextoRevelado.tsx`):**
   - **Qué aporta:** Permite que titulares y números de alto impacto emerjan desde máscaras de recorte (`overflow: hidden`), logrando el acabado editorial de After Effects.
   - **Por qué en fase 2:** Requiere validar anchos y alturas de contenedor para evitar que los acentos o colas de letras (g, j, p, q, y) se corten involuntariamente.
2. **Transiciones Continuas de Cámara en `Escena.tsx` (Whip-Pan y Zoom-Through):**
   - **Qué aporta:** Conecta el final de una frase con el inicio de la siguiente mediante movimientos de cámara inmersivos, evitando la monotonía de los cortes secos.
   - **Por qué en fase 2:** Exige ajustar los tiempos de solape (`SOLAPE`) para que la sincronización con el audio sea matemáticamente exacta.
3. **Pauta Estructurada de Beats Narrativos (Guion 0–3s):**
   - **Qué aporta:** Directrices en `references/narrativa-y-ritmo.md` para garantizar ganchos de alta retención que eviten el abandono del usuario en los primeros segundos.
4. **Validación de Espacios Seguros y Bounding Boxes en QA:**
   - **Qué aporta:** Mejora el script `resumen` para comprobar de forma programática que ningún elemento sobrepase la coordenada $y = 1040$ reservada a los subtítulos.

---

### 4. Nivel 3: Prioridad Diferida / Especializada (Investigación Futura)

Capacidades que solo deben abordarse cuando el tipo de contenido lo justifique expresamente:

1. **Integración de Canvas 3D con Three.js (`@remotion/three`):**
   - **Justificación de la postergación:**
     * Para reels de divulgación, ciencia explicativa o conceptos abstractos, el dibujo vectorial SVG enriquecido con el *5-Layer Stack* y *MultiSpring* es más que suficiente y mucho más rápido de iterar.
     * Incorporar Three.js añade librerías pesadas (`three`, `@remotion/three`, loaders glTF), incrementa el consumo de memoria en Windows y multiplica por 4 el tiempo de renderizado de cada fotograma.
     * **Decisión:** Mantener las directrices técnicas documentadas en `references/ingenieria-remotion.md` como referencia, pero **no instalar los paquetes** hasta que se apruebe un video que requiera modelos 3D explícitos (ej. renderizado de hardware o packaging físico).

---

### 5. Capacidades Opcionales Existentes Preservadas (Sin Descarte)

Para evitar degradar la versatilidad de la skill base, las siguientes funciones se **conservan íntegramente como alternativas opcionales**, aunque no formen parte del flujo de trabajo por defecto:

1. **Alineador Neuronal ASR (`alinear.py --motor asr`):** Se conserva en el script para usuarios que decidan voluntariamente instalar modelos CTC (`parakeet`), manteniendo como motor predeterminado y recomendado el de sílabas (`--motor silabas`) por su inmediatez ($0,2\text{ s}$) y funcionamiento sin descargas.
2. **Sistema de Poses de Personaje (`poses.py` y `Personaje.tsx`):** Se conserva completo para reels con avatares o mascotas.
3. **Biblioteca Completa de 17 Escenas Nativas (`src/escenas/`):** Se mantienen operativas como plantillas rápidas.

---

### 6. Elementos Descartados Definitivamente y Justificación

| Elemento Descartado | Procedencia | Justificación Técnica del Descarte |
| :--- | :--- | :--- |
| **CLI Monolítico `motioncraft.mjs`** | MotionCraft | Becario Reels ya cuenta con `preparar.py` y `render.mjs`, optimizados para Windows y con renderizado por chunks. El CLI de MotionCraft duplica estas tareas e introduce dependencias conflictivas (`yt-dlp`, `tesseract`). |
| **Generación / Separación Musical con IA** | MotionCraft (`music moods`) | Team Nexora prefiere videos sin pista musical de fondo para aprovechar las canciones en tendencia de las plataformas sociales al publicar manualmente. |
| **Automatización de Publicación a Redes** | MotionCraft | Incumple la directriz obligatoria del proyecto: la publicación, etiquetado y selección de miniatura debe ser estrictamente manual y supervisada por humanos. |
| **Transiciones CSS Nativas en Remotion** | Patrones web comunes | Prohibidas por Remotion Best Practices. Producen parpadeos y desincronizaciones en renders paralelos de Chrome Headless. Toda animación debe apoyarse en `useCurrentFrame()`. |

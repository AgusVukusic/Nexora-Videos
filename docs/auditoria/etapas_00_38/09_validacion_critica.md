# 09. Validación Crítica y Ajuste de la Auditoría (Fase 1.1)
## Registro de Verificaciones Técnicas, Correcciones Arquitectónicas y Directrices Deliberadas

---

### 1. Registro de Verificación de Afirmaciones Técnicas

Conforme a las directrices de la Fase 1.1, se evaluaron rigurosamente las conclusiones y afirmaciones de la auditoría inicial, clasificándolas con base en evidencia concreta de código y documentación:

| Afirmación Evaluada | Clasificación | Evidencia Técnica / Justificación | Acción / Corrección Adoptada |
| :--- | :--- | :--- | :--- |
| **1. El pipeline de audio (`sonidos.py`) es determinista** | **Verificada** | [`sonidos.py`](../../../.agent/skills/becario-reels/scripts/sonidos.py#L21) fija explícitamente `RNG = np.random.default_rng(7)` y genera ondas con filtros IIR en SciPy. Mismo código = mismos bytes de audio siempre. | Conservar sin modificaciones como base de SFX. |
| **2. El pipeline de video de Becario Reels es determinista** | **Parcialmente verificada** | Remotion calcula propiedades en función de `useCurrentFrame()`. Sin embargo, [`anim.ts`](../../../reel-microondas/src/motor/anim.ts#L33) define `rnd(seed)` pseudoaleatorio determinista, pero en [`Escena.tsx`](../../../reel-microondas/src/motor/Escena.tsx#L58) la semilla depende de coordenadas. Falta prueba empírica de hash SHA256 bit-a-bit en dos renders idénticos. | Registrar como hipótesis pendiente de prueba con hash en banco de pruebas. |
| **3. Becario Reels es robusto y compatible en Windows de serie** | **Parcialmente verificada** | La auditoría práctica previa demostró que `preparar.py` requirió resolver `npm.cmd` con `shell=True`, forzar codificación UTF-8 para evitar errores con charmap cp1252 y requerir ejecución de `render.mjs` desde el directorio hijo. No era 100% robusto "out-of-the-box" en Windows sin esas correcciones. | Documentar las correcciones necesarias de entorno para que `nexora-reels` las integre de forma nativa. |
| **4. Alineación por sílabas y corte de pausas funcionan como se describe** | **Verificada** | Inspección directa de [`alinear.py`](../../../.agent/skills/becario-reels/scripts/alinear.py#L84-L120): envolvente RMS por bloques de 10 ms, umbral relativo a picos (-32 dB) y eliminación de pausas > 260 ms comprobada en `voz.wav`. | Preservar íntegramente la lógica de `alinear.py`. |
| **5. Renderizado modular por fragmentos tolerante a límites de tiempo** | **Verificada** | Inspección de [`render.mjs`](../../../.agent/skills/becario-reels/assets/plantilla/render.mjs#L140-L190): divide el metraje en chunks (`TROZOS`), monitorea `Date.now() - t0 < MAX_SEG`, guarda el progreso y concatena con FFmpeg demuxer. | Preservar el runner Node.js. |
| **6. Auditoría de retención visual con visión artificial en `ritmo.py`** | **Verificada** | Inspección de [`ritmo.py`](../../../.agent/skills/becario-reels/scripts/ritmo.py#L75-L100): FFmpeg extrae `rawvideo` 540x960 en escala de grises, calcula diferencias en 3 bandas verticales y cuadrículas de 90x80 px, y valida si hay tramos estáticos > 0.6 s. | Preservar como control de calidad objetivo. |
| **7. Las mejoras visuales se implementan con dependencias ya instaladas** | **Verificada** | `CapasCine` (SVG `feTurbulence` + gradientes CSS), `TextoRevelado` (`overflow: hidden` + CSS translateY), `useMultiSpring` y `useStagger` (APIs nativas de `remotion`). Cero dependencias npm nuevas para la fase inicial. | Confirmar estrategia de $0 USD de coste adicional. |
| **8. La sobrecarga de render de `feTurbulence` es de solo el ~5%** | **Pendiente de prueba** | Es una estimación teórica basada en literatura de WebGL/Canvas, pero no se ha medido empíricamente en la CPU/GPU del entorno Windows del usuario. | Etiquetar como hipótesis pendiente de medición en banco de pruebas. |
| **9. Identificación de archivos y repositorios externos** | **Verificada** | Comprobación cruzada de rutas y contenidos en `ahmdd4vd/MotionCraft`, `haidrrrry/claude-remotion-skill` y `sickn33/antigravity-awesome-skills`. | Citas y rutas validadas. |
| **10. Licencias permiten uso comercial sin costes** | **Incorrecta (matizada)** | La auditoría inicial indicó $0 USD en licencias, pero **Remotion tiene licencia dual**: es gratuita para particulares o entidades de hasta 3 empleados con ingresos menores a $1M; empresas mayores requieren licencia comercial de pago (`remotion.dev/license`). Fuentes (OFL) y Lucide (ISC) sí son 100% libres de uso comercial. | Aclarar expresamente las condiciones de la licencia de Remotion para Team Nexora. |
| **11. La ruta `.agent/skills/nexora-reels/` es descubierta por Antigravity** | **Verificada** | Documentación oficial de Antigravity (`C:\Users\Agustín\.gemini\antigravity\builtin\skills\agy-customizations\SKILL.md` y `docs/skills.md`) confirma que el agente descubre automáticamente skills en `.agents/skills/` y `.agent/skills/` en la raíz del proyecto. | Confirmar `.agent/skills/nexora-reels/` como ubicación definitiva. |

---

### 2. Aclaración Arquitectónica: "The 5-Layer Composite Stack"

En la auditoría previa se identificó una discrepancia al hablar de un "5-Layer Stack" pero enumerar seis elementos (`BgMesh`, Assets, UI, `Grade`, `Grain`, `Vignette`). 

A continuación se formaliza la arquitectura exacta de composición:

#### A. Las 5 Capas Conceptuales de Composición (Orden de Renderizado: Abajo hacia Arriba)

```
▲ SALIDA DE PANTALLA (1080x1920)
│
├── CAPA 5: Post-procesado Óptico (PostProcess)
│   ├── Sub-capa 5A: Grain (Filtro SVG feTurbulence con mezcla 'overlay' a 4% opacidad)
│   └── Sub-capa 5B: Vignette (Gradiente radial perimetral oscuro hacia las esquinas)
│
├── CAPA 4: Gradación Cromática (ColorGrade)
│   └── Filtro unificador de tinte/atmósfera para armonizar el metraje con la identidad de marca
│
├── CAPA 3: Primer Plano de Gráficos e Interfaces (UI & Typography)
│   └── Ilustraciones vectoriales SVG, kinetic typography (TextoRevelado), tarjetas y badges
│
├── CAPA 2: Contenido y Metraje Base (Assets)
│   └── Fotografías, capturas de interfaz o clips de metraje con movimiento Ken Burns continuo
│
└── CAPA 1: Atmósfera y Profundidad de Fondo (BgMesh)
    └── Gradientes radiales multicapa en movimiento senoidal lento (simulando iluminación viva)
```

#### B. Nomenclatura y Componentes de Código
Para no generar proliferación innecesaria de componentes en React, la implementación agrupa estas capas en **tres entidades funcionales**:
1. **`CapasCine.tsx` (Envoltorio Global):** Implementa la **Capa 1 (`BgMesh`)** en el fondo y la **Capa 5 (`Grain` + `Vignette`)** en la parte superior absoluta con `pointerEvents: "none"`.
2. **`Lienzo.tsx` / `Escena.tsx` (Contenedor de Contenido):** Aloja las **Capas 2 y 3** (los gráficos, ilustraciones y textos propios de cada escena), respetando la `ZonaSegura`.
3. **Capa 4 (`ColorGrade`):** Se gestiona como una propiedad configurable en `theme.ts` mediante un overlay CSS con `mixBlendMode: "color"` o `"multiply"`, activable solo cuando se requiera teñir estéticamente metraje externo.

---

### 3. Principios de Animación Deliberada vs. Dogmatismo de Movimiento

La auditoría inicial proponía reglas que, interpretadas rígidamente por un agente de IA, podrían derivar en "sobre-animación", fatiga visual o pérdida de jerarquía informativa. Se establecen los siguientes criterios deliberados:

#### A. Criterio de Foco y Jerarquía (Contraste entre Movimiento y Reposo)
* **Regla de la Información Clave:** En cualquier momento dado de la escena, **solo un elemento debe protagonizar la animación primaria** (el dato nuevo, la palabra que se pronuncia o el gráfico que se transforma).
* **Elementos de Soporte:** Fondos, marcos y etiquetas secundarias deben permanecer estables o tener movimientos de acompañamiento a una velocidad significativamente menor para no competir por la atención del espectador.
* **La Pausa como Herramienta Narrativa:** Las pausas no son errores técnicos; son silencios visuales necesarios para asimilar conceptos densos. Un titular o cifra contundente debe sostenerse completamente inmóvil durante 1,0 a 1,5 segundos tras su entrada para permitir su lectura.

#### B. Clarificación y Calibración de Umbrales Temporales
Es crítico distinguir entre las diferentes naturalezas de los parámetros temporales del sistema:

| Parámetro / Umbral | Naturaleza | Valor Actual | Comportamiento y Criterio de Ajuste |
| :--- | :--- | :--- | :--- |
| **`--pausa 0.26`** | Umbral de procesamiento (`alinear.py`) | 0,26 s | **Fijo:** Cualquier silencio en la locución mayor a 260 ms se recorta para mantener el ritmo vocal ágil característico de formatos cortos. |
| **`ADELANTO = 4`** | Constante perceptual (`constantes.ts`) | 4 fotogramas (~133 ms) | **Fijo:** Hace que las palabras aparezcan un instante antes de escucharse, facilitando la lectura natural. |
| **`--hueco 0.6`** | Umbral de auditoría (`ritmo.py`) | 0,60 s | **Auditoría objetiva:** Si la pantalla no cambia en ninguna región durante >0,6 s, `ritmo.py` lanza advertencia. |
| **Calibración de Huecos Creativos** | Parámetro a calibrar empíricamente | Pendiente | En escenas explicativas complejas con esquemas anatómicos o moleculares, 0,6 s puede resultar excesivamente estricto si se desea sostener una explicación. **Propuesta:** Probar en el benchmark si conviene permitir excepciones de hasta 1,0 s cuando el elemento en pantalla contiene más de 12 palabras de lectura obligatoria. |

---

### 4. Protocolo Detallado de Control de Calidad (QA)

Se formaliza la separación entre las comprobaciones existentes de Becario Reels y las nuevas comprobaciones que aportará Nexora Reels:

#### A. Comprobaciones Existentes en Becario Reels (A Conservar)
1. **Validación de Plan (`render.mjs resumen`):** Tipos de escena válidos, existencia de iconos en Lucide, correspondencia de palabras clave en `en` y límites de caracteres por línea.
2. **Inspección de Keyframes (`render.mjs fotos`):** Generación de `salida/hoja.png` con cortes del punto medio, momentos y fotograma final de cada escena.
3. **Auditoría de Retención (`ritmo.py`):** Detección de tramos estáticos superiores a 0,6 s por análisis de diferencias de píxeles.
4. **Comprobación de Miniatura (`render.mjs portada`):** Verificación visual del recorte 3:4 para perfiles de Instagram.

#### B. Nuevas Comprobaciones a Incorporar en Nexora Reels

1. **Auditoría de Zonas Seguras y Colisión de Subtítulos:**
   - *Problema:* Elementos gráficos que bajan de la coordenada $y = 1040$ colisionan con los subtítulos situados en $y = 1330$.
   - *Detección:* Verificación programática en `resumen` que audite que todas las escenas propias utilicen el envoltorio `ZonaSegura` ($y: 80-1040$).
   - *Automatización:* 100% automatizable en Node.js.
   - *Criterio de aprobación:* Ningún componente visual renderiza fuera de los límites de seguridad verticales ($y: 80-1040$) ni laterales ($x: 60-1020$).

2. **Auditoría Tipográfica de Caracteres Especiales en Español:**
   - *Problema:* El uso de máscaras con `overflow: hidden` puede cortar virgulillas de la "ñ", tildes (Á, É, Í, Ó, Ú) o colas descendentes (g, j, p, q, y).
   - *Detección:* Banco de pruebas tipográfico en `TextoRevelado.tsx` con padding vertical de seguridad (mínimo 6 px arriba y 4 px abajo).
   - *Automatización:* Comprobación visual en `hoja.png` y verificación de `lineHeight >= 1.2` en TypeScript.
   - *Criterio de aprobación:* Caracteres acentuados y descendentes visibles íntegramente en fotogramas de prueba a resolución completa (1080x1920).

3. **Auditoría de Niveles Sonoros y Picos de Audio:**
   - *Problema:* Al solapar múltiples efectos sonoros (`whoosh` + `ding`) con la voz se pueden generar picos por encima de 0 dBFS (distorsión digital) o niveles de mezcla incoherentes.
   - *Detección:* Script FFmpeg con filtro `ebur128` y `volumedetect` sobre la pista mezclada final.
   - *Automatización:* Automatizable mediante subcomando `node render.mjs audio-check`.
   - *Criterio de aprobación:* Nivel integrado de sonoridad en $-14 \pm 1$ LUFS y pico máximo estricto por debajo de $-1.0$ dBFS.

4. **Auditoría de Determinismo de Renderizado:**
   - *Problema:* Fugas de memoria o variaciones en Chromium que hagan que renderizar dos veces el mismo commit genere fotogramas distintos.
   - *Detección:* Cálculo de hash SHA256 sobre una muestra de 10 fotogramas clave renderizados en dos ejecuciones sucesivas.
   - *Automatización:* Script ejecutable bajo demanda.
   - *Criterio de aprobación:* Coincidencia exacta del hash SHA256 entre ambas pasadas.

---

### 5. Preservación Explícita de Capacidades Existentes

Para evitar cualquier regresión técnica respecto a Becario Reels, se declara la preservación incondicional de los siguientes módulos:
1. **Sistema de Poses de Personaje ([`scripts/poses.py`](../../../.agent/skills/becario-reels/scripts/poses.py)):** Se conserva intacto para reels que requieran avatares, mascotas o presentadores virtuales.
2. **Biblioteca Completa de 17 Escenas Nativas:** Se conservan todas las escenas predeterminadas (`tarjetas.tsx`, `apps.tsx`, `titular.tsx`, `fotos.tsx`, etc.) como opciones de fallback rápido.
3. **Generador Matemático de Sonidos ([`scripts/sonidos.py`](../../../.agent/skills/becario-reels/scripts/sonidos.py)):** Se conservan los 17 efectos WAV deterministas.
4. **Soporte de Modos de Alineación:** Se conserva el motor determinista de sílabas (`--motor silabas`) por defecto y se mantiene la opción ASR (`--motor asr`) como alternativa opcional para quienes deseen instalar modelos externos.
5. **Estrategia de Fork Independiente:** `nexora-reels` se ubicará en su propio directorio `.agent/skills/nexora-reels/`, manteniendo `becario-reels` 100% operativa y disponible en todo momento.

---

### 6. Clasificación Final de Dependencias y Costes

| Dependencia | Categoría | Estado / Comprobación | Coste |
| :--- | :--- | :--- | :--- |
| **Remotion (4.0.538)** | Base de Video | Instalada y verificada en `package.json`. Sujeta a licencia Remotion Software License (gratis para < 3 empleados / < $1M; pago para grandes empresas). | $0 USD (cumpliendo umbrales de microempresa). |
| **React & React-DOM (19.2.3)** | Framework UI | Instalada y verificada. Licencia MIT. | $0 USD. |
| **Lucide React (1.61.0)** | Iconografía | Instalada y verificada. Licencia ISC. | $0 USD. |
| **Google Fonts (10 familias)** | Tipografía | Instaladas en `public/fuentes/`. Licencia SIL Open Font License (OFL-1.1). | $0 USD (100% libre comercial). |
| **Python 3.11 + NumPy + SciPy + PIL** | Pipeline de Soporte | Instaladas y operativas en el entorno Windows. | $0 USD. |
| **FFmpeg + Chrome Headless** | Render & Encode | Localizados y configurados por `preparar.py` en `entorno.json`. | $0 USD. |
| **Three.js (`@remotion/three`)** | Gráficos 3D | **Opcional / Diferida a Fase 2.** No se instala en esta fase. | $0 USD. |
| **yt-dlp / librosa / tesseract** | Herramientas MotionCraft | **Innecesarias / Descartadas.** No se incorporan al sistema. | $0 USD. |

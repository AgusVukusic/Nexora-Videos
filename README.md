# VideoContenido — Producción Programática de Video Vertical con Remotion

Framework, herramientas y pipeline de producción automatizada para la generación determinista de videos cortos en formato vertical (9:16 para Reels, TikTok y YouTube Shorts), impulsado por **Remotion** (React, TypeScript), Node.js y scripts de procesamiento en Python.

---

## 1. Arquitectura y Componentes del Repositorio

El proyecto articula varios módulos complementarios diseñados para trabajar de forma modular y desacoplada:

```
VideoContenido/
├── .agent/
│   └── skills/
│       ├── nexora-reels/          # Skill definitiva de producción audiovisual
│       │   ├── assets/plantilla/   # Plantilla maestra de ensamblado Remotion
│       │   ├── scripts/            # Scripts de soporte y andamiaje en Python
│       │   └── SKILL.md            # Definición formal de la skill
│       ├── becario-reels/          # Skill base original (referencia histórica)
│       └── napkin/                 # Guía y notas de ejecución del entorno
├── .agents/                        # Estructura paralela de descubrimiento de skills
├── auditoria-skill-nexora/         # Informes técnicos y auditorías (00 al 32)
├── reel-microondas/                # Primer reel completo producido (proyecto de referencia)
├── public/                         # Espacio estructural reservado
├── src/                            # Espacio estructural reservado
└── README.md                       # Documentación central de entrada
```

### Componentes Principales:

1. **`nexora-reels` (`.agent/skills/nexora-reels/`):**
   Skill principal en desarrollo para Team Nexora. Implementa una arquitectura en 5 capas (*The 5-Layer Composite Stack*), físicas realistas de animación mediante resortes deterministas (`anim.ts`), tipado estricto en TypeScript, y un motor de renderizado con invalidación desacoplada de caché visual y acúsitca (`render.mjs`).
2. **`auditoria-skill-nexora/`:**
   Registro documental cronológico y exhaustivo de 32 informes técnicos (del `00` al `32`) que respaldan cada decisión de diseño, validación crítica, resolución de cuellos de botella y mediciones de laboratorio (SSIM, PSNR, determinismo temporal y huellas SHA-256).
3. **`becario-reels/`:**
   Skill original utilizada como línea base y punto de partida técnico. Se preserva íntegramente como referencia histórica y base de comparación.
4. **`reel-microondas/`:**
   Primer caso de éxito del pipeline: reel completo renderizado a 1080×1920 @ 30 FPS, con locución, subtítulos dinámicos y microanimaciones de cocina.
5. **`.agents/`:**
   Estructura auxiliar de discovery que replica las skills para compatibilidad con distintos agentes y entornos de ejecución.

---

## 2. Componentes de la Skill Definitiva (`nexora-reels`)

### 2.1. Plantilla Maestra (`assets/plantilla/`)
- **Composición Central:** [`Root.tsx`](.agent/skills/nexora-reels/assets/plantilla/src/Root.tsx) y [`Reel.tsx`](.agent/skills/nexora-reels/assets/plantilla/src/Reel.tsx).
- **Catálogo de 17 Escenas:** 17 componentes visuales predefinidos en `src/escenas/`:
  - `apps.tsx`: `chat`, `editor`, `movil`.
  - `cta.tsx`: `cta` (pantalla final con llamadas a la acción e iconos sociales).
  - `fotos.tsx`: `imagen`, `galeria`.
  - `tarjetas.tsx`: `contador`, `cifras`, `ficha`, `lista`, `comparacion`, `objecion`, `pasos`, `pregunta`, `barras`, `tachado`.
  - `titular.tsx`: `titular`.
- **Motor Visual:** Fondos dinámicos ([`Fondo.tsx`](.agent/skills/nexora-reels/assets/plantilla/src/motor/Fondo.tsx)), lienzos ([`Lienzo.tsx`](.agent/skills/nexora-reels/assets/plantilla/src/motor/Lienzo.tsx)), personajes ([`Personaje.tsx`](.agent/skills/nexora-reels/assets/plantilla/src/motor/Personaje.tsx)), semitonos y subtítulos de alta legibilidad.
- **Capas Cinematográficas:** [`CapasCine.tsx`](.agent/skills/nexora-reels/assets/plantilla/src/CapasCine.tsx) (grano fílmico SVG determinista, viñeteado óptico y gradiente atmosférico).
- **Texto Revelado:** [`TextoRevelado.tsx`](.agent/skills/nexora-reels/assets/plantilla/src/TextoRevelado.tsx) (aparición palabra por palabra sincronizada con la locución).
- **Motor de Render Desacoplado:** [`render.mjs`](.agent/skills/nexora-reels/assets/plantilla/render.mjs), con cálculo independiente de `huellaVideo` (SHA-256 visual) y `huellaAudio` (SHA-256 sonoro), permitiendo remezclas acústicas en < 3 segundos sin re-renderizar fotogramas.
- **Recursos Gráficos y Sonoros:** 17 efectos de sonido originales en formato WAV (`public/sonidos/`), fuentes tipográficas WOFF2 (`Anton`, `Archivo Black`, `Bricolage Grotesque`, `Caveat`, `DM Sans`) y texturas.

### 2.2. Scripts Python de Soporte (`scripts/`)
- [`preparar.py`](.agent/skills/nexora-reels/scripts/preparar.py): Creación y andamiaje automático de una nueva instancia de reel a partir de la plantilla maestra.
- [`alinear.py`](.agent/skills/nexora-reels/scripts/alinear.py): Alineación temporal precisa palabra por palabra utilizando Whisper.
- [`ritmo.py`](.agent/skills/nexora-reels/scripts/ritmo.py): Análisis de pausas acústicas, cálculo de cadencia silábica y sugerencia de cortes de edición.
- [`poses.py`](.agent/skills/nexora-reels/scripts/poses.py): Detección morfológica, encuadre y recorte de expresiones de personaje (requiere SciPy en venv).
- [`sonidos.py`](.agent/skills/nexora-reels/scripts/sonidos.py): Generación y calibración sintética de ondas de audio complementarias.

---

## 3. Requisitos del Sistema

- **Node.js:** Versión 18.x o superior.
- **npm:** Incluido con Node.js.
- **Python:** Versión 3.11.x (verificado en 3.11.4).
- **FFmpeg:** Binario instalado y disponible en el `PATH` del sistema (requerido para la multiplexación externa de video y audio en `render.mjs`).

---

## 4. Procedimiento para Iniciar un Nuevo Proyecto de Reel

### Paso 1: Instanciar la plantilla
Desde la raíz del repositorio, ejecutar `preparar.py` indicando la carpeta de destino:
```bash
py .agent/skills/nexora-reels/scripts/preparar.py <ruta_del_nuevo_proyecto>
```

### Paso 2: Instalar dependencias
Acceder al proyecto creado e instalar los paquetes necesarios:
```bash
cd <ruta_del_nuevo_proyecto>
npm install
```

### Paso 3: Configurar locución y plan
1. Ubicar la locución grabada en `public/voz.wav`.
2. Generar la alineación de subtítulos:
   ```bash
   py ../.agent/skills/nexora-reels/scripts/alinear.py public/voz.wav --salida src/subtitulos.json
   ```
3. Editar `src/plan.json` definiendo las escenas, textos, colores y efectos de sonido.

### Paso 4: Previsualizar y renderizar
- **Previsualización interactiva con Remotion Player:**
  ```bash
  npm run dev
  ```
- **Renderizado final acelerado (con caché de trozos y desacoplamiento de audio):**
  ```bash
  node render.mjs
  ```
  El video resultante se generará en `salida/reel.mp4` a 1080×1920 @ 30 FPS.

---

## 5. Elementos Excluidos del Repositorio Git

Para mantener el repositorio ágil, seguro y libre de artefactos efímeros, los siguientes elementos se excluyen mediante `.gitignore`:

- **Dependencias instaladas (`node_modules/`, `.venv/`):** Regenerables localmente mediante gestores de paquetes.
- **Binario de navegador Remotion (`.remotion/`):** Contiene `chrome-headless-shell` (~281 MB); Remotion lo descarga automáticamente cuando se requiere.
- **Renders y trozos de video (`salida/`, `*.mp4`):** Videos finales y trozos intermedios generados durante ejecuciones de prueba o producción.
- **Cachés (`.cache/`, `__pycache__/`):** Cachés temporales de Webpack y bytecode de Python.
- **Entorno interno de agentes (`.claude/`):** Bitácoras y runbooks contextuales del entorno local.

---

## 6. Estado del Desarrollo y Limitaciones Conocidas

### Estado Actual:
- **Bloques 1 al 4C:** **Completados y Aprobados (APTO)**.
  - Scripts Python verificados y libres de dependencias impuestas al sistema global.
  - Plantilla ensamblada y componentes tipados al 100%.
  - Renderizado desacoplado (`huellaVideo` / `huellaAudio`) validado con pruebas de regresión visual (SSIM > 0.998).
- **Bloque 5:** En fase de preparación (consolidación final de la documentación en `SKILL.md` para creadores y directrices de arte).

### Limitaciones Conocidas:
1. **FFmpeg en PATH:** La multiplexación y remezcla de audio en `render.mjs` dependen de que el binario de FFmpeg esté accesible en la línea de comandos del sistema.
2. **Entorno Python para SciPy:** La ejecución de `poses.py` y `sonidos.py` requiere `scipy`, `numpy` y `pillow` configurados en un entorno virtual (`.venv`) independiente para no contaminar el intérprete global.
3. **Zonas Seguras:** Las composiciones deben respetar los márgenes seguros verticales (y: 80 a 1040) para evitar superposiciones con los subtítulos y los elementos de interfaz nativos de Instagram Reels / TikTok.

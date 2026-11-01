# 04. Propuesta de Arquitectura: Skill Definitiva "Nexora Motion Reels"
## Especificación de Instrucciones, Referencias Técnicas, Componentes y Control de Calidad

---

### 1. Visión General de la Arquitectura

La skill definitiva para Team Nexora, **`nexora-reels`** (o *Nexora Motion Reels*), fusiona la robusta orquestación de ingeniería local de **Becario Reels** con la dirección artística y física avanzada de **Claude Remotion Skill**, las directrices de ingeniería determinista de **Remotion Best Practices** y la metodología de preproducción de **MotionCraft**.

Para mantener una arquitectura modular, limpia y de bajo consumo de contexto para el agente, la skill se divide estrictamente en **cuatro pilares**:

```
nexora-reels/
├── SKILL.md                          # PILAR 1: Instrucciones Principales y Reglamento del Agente
├── references/                       # PILAR 2: Base de Conocimiento y Patrones de Consulta
│   ├── arte-y-referencias.md         # Reference First, Paletas 60-30-10 y Tipografía
│   ├── patrones-motion.md            # Biblioteca de código copiable (Físicas, Capas, Máscaras)
│   ├── narrativa-y-ritmo.md          # Estructura de beats (0-3s), Pacing y Capas Sonoras
│   ├── ingenieria-remotion.md        # Determinismo, Zonas Seguras y Prevención de Errores
│   └── publicacion-manual.md         # Protocolos de exportación, miniaturas y metadatos
├── scripts/                          # PILAR 3A: Herramientas de Soporte Local (Python)
│   ├── preparar.py                   # Inicializador y actualizador (--actualizar)
│   ├── alinear.py                    # Whisper / Alineación fonética por sílabas
│   ├── ritmo.py                      # Auditoría de retención visual por visión artificial
│   └── sonidos.py                    # Sintetizador matemático de efectos WAV
└── assets/plantilla/                 # PILAR 3B: Motor y Componentes Ejecutables (Remotion/React)
    ├── render.mjs                    # Runner programático por chunks y capturas
    └── src/
        ├── motor/
        │   ├── theme.ts              # NUEVO: Tokens de diseño, colores y resortes
        │   ├── CapasCine.tsx         # NUEVO: The 5-Layer Stack (BgMesh, Grano, Viñeta)
        │   ├── anim.ts               # EXPANDIDO: MultiSpring, Stagger, Breathing, Béziers
        │   ├── Escena.tsx            # EXPANDIDO: Transiciones Whip-Pan y Zoom-Through
        │   └── Subtitulos.tsx        # Subtítulos con adelanto y padding de seguridad
        └── piezas/
            └── TextoRevelado.tsx     # NUEVO: Tipografía cinética con máscara de recorte
```

---

### 2. Pilar A: Instrucciones Principales de la Skill (`SKILL.md`)

El archivo `SKILL.md` es el núcleo operativo que carga Antigravity. Contiene únicamente las directrices ejecutivas y criterios de decisión, delegando el código extenso a las referencias.

#### Reglas Maestras que rigen al Agente:
1. **Regla de Preproducción ("Reference First"):** Antes de escribir la primera línea de código de una escena, el agente debe definir o solicitar una referencia de estilo visual (paleta 60-30-10, tipografía y estilo gráfico: minimalista, neon-tech, editorial o ilustrado). Prohibido improvisar estéticas planas sin referencia.
2. **Principios de Animación Deliberada y Criterios Visuales:**
   - *Física obligatoria en focos activos:* Prohibido el `interpolate()` lineal simple; las entradas de elementos prioritarios deben usar `spring()` o `Easing` explícito con `extrapolate: "clamp"`.
   - *Entradas multi-propiedad con intención:* Los elementos que portan la información clave entran combinando posición vertical, escala elástica y opacidad. Los elementos secundarios de soporte permanecen estables para evitar saturación.
   - *Staggering jerárquico:* Desfase de 3 a 5 fotogramas entre elementos de una misma composición para guiar la mirada en orden de lectura.
   - *The 5-Layer Composite Stack:* Composición en 5 capas lógicas (`BgMesh` -> Assets -> UI -> `ColorGrade` -> `PostProcess` con Grano y Viñeta).
   - *Pausa deliberada y respiración selectiva:* Se valora la pausa (1,0 a 1,5 s de estabilidad en datos clave para asimilación). El micro-movimiento senoidal (*breathing*) se aplica exclusivamente a elementos orgánicos o badges que lo justifiquen narrativamente, nunca a bloques densos de texto.
   - *Salidas rápidas:* Salidas diseñadas en ~50% del tiempo de entrada para no entorpecer el ritmo del corte.
   - *Sincronización con FPS:* Prohibido codificar fotogramas rígidos no derivados de `useVideoConfig()`.
   - *Tokens obligatorios:* Uso estricto de `theme.ts` para fuentes, colores y físicas.
   - *Inspección antes de entrega:* Inspeccionar visualmente la hoja de contactos (`hoja.png`) y fotogramas clave antes de validar el video.
   - *Retención y cadencia:* Evitar planos estáticos sin intención que superen los umbrales de retención, pero respetando los tiempos de lectura.
3. **Flujo de Trabajo Estricto de 7 Pasos:**
   `Guion con beats (0-3s) → Voz alineada (alinear.py) → Plan con referencia visual → Build con 5-Layer Composite Stack → Verificación QA multicapa → Render local por chunks → Auditoría de ritmo y audio`.

---

### 3. Pilar B: Referencias Técnicas (`references/`)

Documentación técnica que el agente consulta bajo demanda sin sobrecargar el contexto inicial:

1. **`arte-y-referencias.md`:**
   - Métricas de armonía cromática: 60% color dominante (fondo/malla), 30% color estructural (tarjetas/marcos), 10% color de acento de alto contraste (palabras clave, llamadas de atención).
   - Jerarquía tipográfica: Máximo 2 familias por video (una display para ganchos y números, una neutra legible para subtítulos y datos).
2. **`patrones-motion.md`:**
   - Ejemplos de implementación de código listos para copiar:
     * Implementación del filtro SVG `feTurbulence` para grano analógico.
     * Configuración matemática de resortes `snappy`, `bouncy` y `heavy`.
     * Lógica de enmascaramiento CSS `clipPath` y `overflow: hidden` para textos que emergen de la nada.
3. **`narrativa-y-ritmo.md`:**
   - Plantilla de beats narrativos en formato vertical:
     * *0 a 3s:* Declaración contraintuitiva o visualmente disruptiva (Gancho).
     * *3 a 12s:* Desarrollo del mecanismo / explicación técnica visual.
     * *12 a 25s:* Ejemplificación o demostración práctica.
     * *Cierre:* CTA de 4 iconos sociales con retención activa.
   - Pautas de diseño sonoro: capas de graves (*sub-drop*) en impactos de gancho y clics mecánicos en revelado de datos.
4. **`ingenieria-remotion.md`:**
   - Buenas prácticas de renderizado determinista de `Remotion Best Practices`:
     * Prohibición de funciones no deterministas (`Math.random` sin semilla, `Date.now`).
     * Manejo estricto de clamping en interpolaciones para evitar saltos al final de secuencias.
     * Mapeo de zonas seguras: la zona inferior ($y \ge 1080$) se reserva para subtítulos y controles de TikTok/Instagram; todo gráfico central debe ceñirse a $y: 80$ hasta $1040$.

---

### 4. Pilar C: Componentes y Código Reutilizable (`assets/plantilla/src/`)

Código real y ejecutable que se incorpora a la plantilla base para habilitar las nuevas capacidades:

#### 1. Sistema Centralizado de Tokens ([`src/motor/theme.ts`])
```typescript
import { SpringConfig } from "remotion";

export const THEME = {
  colores: {
    fondoOscuro: "#0a0a0c",
    fondoGradiente1: "#14151f",
    fondoGradiente2: "#1c1427",
    acento: "#f59e0b",
    textoPrimario: "#ffffff",
    textoSecundario: "#94a3b8",
  },
  springs: {
    snappy: { damping: 18, stiffness: 220, mass: 0.8 } as SpringConfig,
    bouncy: { damping: 12, stiffness: 180, mass: 0.6 } as SpringConfig,
    heavy: { damping: 24, stiffness: 140, mass: 1.4 } as SpringConfig,
  },
  curvas: {
    decel: [0.16, 1, 0.3, 1] as const, // frenada con inercia
  }
};
```

#### 2. Acabado Cinematográfico Multicapa ([`src/motor/CapasCine.tsx`])
Componente contenedor de alto rendimiento que encapsula el video en 5 capas lógicas:
- **Capa 1 (`BgMesh`):** Combina dos elipses radiales en movimiento senoidal con desenfoque gaussiano de 80px que oscilan suavemente detrás del contenido.
- **Capas 2 y 3 (Metraje y UI):** Contenido específico de cada escena renderizado dentro de `ZonaSegura` ($y: 80-1040$).
- **Capa 4 (`ColorGrade`):** Overlay de tinte para unificación cromática si se emplean fuentes mixtas de video o imágenes.
- **Capa 5 (`PostProcess` Óptico):**
  * **`Vignette`:** Gradiente radial perimetral que oscurece suavemente las esquinas exteriores del encuadre 9:16.
  * **`FilmGrain`:** Filtro SVG imperceptible de ruido estocástico (`<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3"/>`) mezclado con `opacity: 0.04` y `mixBlendMode: "overlay"`.

#### 3. Toolkit de Física y Cinemática ([`src/motor/anim.ts`])
- **`useMultiSpring(desde, config)`:** Retorna simultáneamente valores normalizados de `scale`, `translateY` y `rotate` calibrados con retrasos de fase internos.
- **`useStagger(indice, base, retardo = 4)`:** Devuelve el fotograma de activación escalonado para componentes dependientes.
- **`useBreathing(amplitud = 0.015, velocidad = 16)`:** Retorna una micro-escala senoidal infinita que evita la inmovilidad en pantalla en badges o ilustraciones orgánicas.

#### 4. Tipografía Cinética con Máscara ([`src/piezas/TextoRevelado.tsx`])
Componente que envuelve cualquier texto dentro de un contenedor rígido con `overflow: hidden` y padding vertical de seguridad (6px superior/inferior para proteger tildes y descendentes en español), animando el texto desde `translateY(100%)` a `translateY(0%)` mediante resorte `snappy`, produciendo una aparición nítida sin halos de desvanecimiento simple.

#### 5. Transiciones Continuas ([`src/motor/Escena.tsx`])
Ampliación de los modos de entrada y salida con:
- Modo `whip`: Desplazamiento horizontal acelerado en 8 fotogramas con desenfoque direccional simulado (`filter: blur(Xpx)`).
- Modo `zoom-through`: La escena previa escala a 2.2 mientras su opacidad decae, simulando que la cámara vuela a través del plano para entrar al siguiente.

---

### 5. Pilar D: Protocolo de Validación y Control de Calidad (QA)

El control de calidad combina validaciones automáticas y visuales en cuatro filtros objetivos:

```
[Paso 1: Validación Estática y Espacial] node render.mjs resumen
       │  Comprueba tipos, campos requeridos, iconos Lucide, límites de caracteres
       │  y ausencia de colisiones fuera de ZonaSegura (y: 80-1040).
       ▼
[Paso 2: Inspección Visual de Keyframes] node render.mjs fotos
       │  Genera salida/hoja.png. Comprueba márgenes de cajas, solapes y tildes en máscaras.
       ▼
[Paso 3: Verificación de Puntos Críticos] node render.mjs foto 1.5 12.0
       │  Extrae fotogramas clave a tamaño completo (1080x1920) para auditar contraste y nitidez.
       ▼
[Paso 4: Auditoría de Retención y Audio] python scripts/ritmo.py salida/reel.mp4
          Audita el video renderizado con visión artificial (código 0 = sin huecos > 0,6 s)
          y verifica sonoridad integrada a -14 LUFS con picos estrictos < -1.0 dBFS.
```

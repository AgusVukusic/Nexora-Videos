# Patrones de Animación y Cinemática
## Guía Técnica para Nexora Motion Reels

---

### 1. Elección de Primitivas: ¿Cuándo Usar Cada Herramienta?

En Remotion, la cinemática debe elegirse en función de la naturaleza física del objeto animado:

| Herramienta | Cuándo Elegirla | Características Técnicas |
| :--- | :--- | :--- |
| **`spring()`** | Elementos con masa que entran al primer plano (tarjetas, botones, ventanas de UI, iconos). | Simula aceleración, deceleración y amortiguación elástica sin definir duraciones rígidas. Se parametriza con `damping`, `mass` y `stiffness`. |
| **`interpolate()` + `Easing`** | Desplazamientos continuos de cámara, rotaciones exactas, barras de progreso y cambios de opacidad. | Asigna un rango de fotogramas a un rango de valores. Permite curvas Bézier no lineales (`Easing.bezier`, `Easing.out(Easing.cubic)`). |
| **`interpolate()` Lineal** | Cambios de color progresivos, loops senoidales puros y barridos de gradiente. | Velocidad constante. Apropiado para fondos o rotaciones continuas de engranajes/partículas. |

---

### 2. Uso Contextual del Staggering (Cascada Temporal)

El *stagger* o desfase temporal evita que un grupo de elementos aparezca simultáneamente, lo que genera confusión visual.

* **Regla de Aplicación:** En listas de viñetas, tarjetas comparativas o cuadrículas de iconos, aplicar un desfase de **3 a 5 fotogramas** entre cada elemento sucesivo.
* **Jerarquía de Lectura:** El primer elemento debe ingresar inmediatamente al comenzar la mención de la voz; los elementos secundarios deben seguirlo en el orden natural en que el ojo debe recorrer la composición (arriba hacia abajo o izquierda hacia derecha).

---

### 3. Máscaras Tipográficas y Protección de Caracteres en Español

El revelado de texto mediante máscaras (`overflow: hidden`) produce un acabado editorial moderno donde el texto emerge de una línea invisible.

#### Precauciones Obligatorias con el Español:
1. **Astiles y Acentos Superiores:** Fuentes condensadas o de caja alta con tildes (Á, É, Í, Ó, Ú) o la virgulilla de la "Ñ" exceden frecuentemente la altura nominal de la fuente.
2. **Trazos Descendentes:** Letras como *g, j, p, q, y* bajan de la línea base tipográfica.
3. **Regla de Padding Vertical:** Todo contenedor de máscara tipográfica debe incluir una holgura superior e inferior mínima de **6 px** y un `lineHeight` no menor a 1.2 para garantizar que ningún carácter sea amputado.

```tsx
// Patrón de máscara tipográfica segura para caracteres en español
<div style={{ overflow: "hidden", paddingTop: 6, paddingBottom: 6 }}>
  <span style={{ display: "inline-block", transform: `translateY(${(1 - progreso) * 100}%)` }}>
    {texto}
  </span>
</div>
```

---

### 4. Ciclo de Vida de los Elementos: Entrada, Permanencia y Salida

#### A. Entradas Multi-propiedad Moderadas
Para dar sensación de tridimensionalidad sin saturar, combinar dos o tres propiedades que se refuercen mutuamente:
- **Desplazamiento + Opacidad:** `translateY: 40px → 0px` con `opacity: 0 → 1`.
- **Escala Elástica + Opacidad:** `scale: 0.85 → 1.0` con resorte `bouncy` y suavizado de entrada.
- *Evitar:* Rotaciones extremas o giros que dificulten la lectura en el primer segundo.

#### B. Permanencia y Pausas de Asimilación
- **Pausa de Asimilación (1,0 a 1,5 s):** Cuando se introduce una conclusión técnica o una cifra relevante, el elemento debe sostenerse completamente estático para que el cerebro del espectador asimile la información antes de cambiar de encuadre.
- **Micro-animación Senoidal (`useBreathing`):** Aplicable opcionalmente a elementos gráficos secundarios o badges flotantes para mantener dinamismo durante locuciones largas, pero **desaconsejada** en bloques de texto denso.

#### C. Salidas Ágiles
- Cuando una escena concluye o un elemento se retira, la salida debe ser rápida (un 40% a 50% de la duración de entrada, típicamente 8 a 10 fotogramas) para no retrasar el ritmo del siguiente bloque narrativo.

---

### 5. Estado de los Componentes y Patrones en Nexora Reels

Todos los patrones avanzados de cinemática y composición de capas se encuentran plenamente implementados y operativos dentro de la plantilla maestra ([`src/motor/anim.ts`](../assets/plantilla/src/motor/anim.ts) y componentes asociados en [`src/`](../assets/plantilla/src/)):

#### A. Primitivas de Animación y Cinemática Multi-propiedad:
* **`useMultiSpring()` ([`src/motor/anim.ts`](../assets/plantilla/src/motor/anim.ts)):**
  - Orquesta múltiples canales de resorte en un único hook determinista (`escala`, `y`, `opacidad`, `rotacion`).
  - Admite presets nombrados (`"snappy"`, `"bouncy"`, `"heavy"`, `"gentle"` procedentes de `THEME.springs`) o configuraciones `SpringConfig` personalizadas.
  - Implementa clamping automático y duración máxima opcional para fijar valores sin jitter residual.
* **`useStagger()` y `staggerFrame()` ([`src/motor/anim.ts`](../assets/plantilla/src/motor/anim.ts)):**
  - Calcula cascadas temporales deterministas para listas y grupos (por defecto 4 fotogramas de desfase por ítem).
  - `staggerFrame()` permite calcular el fotograma absoluto de inicio de cada elemento para sincronizar efectos de audio o usar con `usePop`.
* **`useBreathing()` ([`src/motor/anim.ts`](../assets/plantilla/src/motor/anim.ts)):**
  - Oscilación senoidal suave determinista para badges flotantes o acentos secundarios, parametrizada por `amplitud`, `periodo` (60–90 frames), `fase` y `centro`.
* **Utilidades Cinemáticas Base (100% Compatibilidad):**
  - `usePop(desde, config)`: Escala elástica con rebote para elementos focales.
  - `useSuave(desde, dur)`: Entrada suave `0 → 1` con `Easing.out(Easing.cubic)`.
  - `lerp(f, a, b, from, to, ease)`: Interpolación acotada con clamping estricto.
  - `useFlota(fase, amp, vel)`: Flotación continua armónica.
  - `bump(frame, en, dur)`: Pico senoidal transitorio `0 → 1 → 0`.
  - `rnd(seed)`: Ruido determinista basado en seno trigonométrico.
  - `numeroES(n, dec)`: Formateador numérico en español con separador de miles.

#### B. Componentes Arquitectónicos de Capas y Texto:
* **`TextoRevelado` ([`src/TextoRevelado.tsx`](../assets/plantilla/src/TextoRevelado.tsx)):**
  - Componente de máscara tipográfica editorial segura con protección estricta contra cortes de caracteres en español (tildes superiores, virgulillas de la Ñ y trazos descendentes).
* **`CapasCine` ([`src/CapasCine.tsx`](../assets/plantilla/src/CapasCine.tsx)):**
  - Envoltorio de composición en 5 capas: `BgMesh` (fondo procedural dinámico), `ColorGrade` (etalonaje de temperatura y viñeta) y `PostProcess` (grano y textura analógica).
* **`Escena` ([`src/Escena.tsx`](../assets/plantilla/src/Escena.tsx)):**
  - Contenedor de transición de secuencia con soporte para 6 transiciones de entrada (`corte`, `suave`, `semitono`, `deslizar-arriba`, `deslizar-abajo`, `disolver`) y 3 de salida (`corte`, `suave`, `disolver`).
* **Subtítulos Dinámicos ([`src/piezas/Subtitulos.tsx`](../assets/plantilla/src/piezas/Subtitulos.tsx)):**
  - Subtitulado fonético palabra por palabra en modalidades `linea` (caja de acento centrada) y `bloque` (párrafo dinámico superior izquierdo).

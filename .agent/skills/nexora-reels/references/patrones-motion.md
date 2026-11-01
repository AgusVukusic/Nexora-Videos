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

### 5. Estado de los Componentes en Nexora Reels

* **Patrones Validados en Remotion Nativo (Disponibles):**
  - Interpolaciones con `spring()` y `Easing` estándar.
  - Subtítulos sincronizados palabra por palabra (`Subtitulos.tsx`).
* **Componentes Propuestos para Etapas Siguientes (En Planificación):**
  - `useMultiSpring()`: Helper para coordinar traslación, escala y rotación en un único resorte.
  - `TextoRevelado`: Componente reutilizable de máscara tipográfica protegida.
  - `CapasCine`: Envoltorio de 5 capas lógicas.
* **Componentes Pendientes de Prototipo Aislado:**
  - Transiciones continuas `whip` y `zoom-through` (requieren validar el gestor de solape de `<Sequence>` antes de su adopción).

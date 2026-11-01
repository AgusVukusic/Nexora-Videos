# 06. Plan de Implementación por Etapas
## Hoja de Ruta para la Construcción y Validación de "Nexora Motion Reels"

---

### Visión General del Plan
Este plan describe la secuencia técnica necesaria para construir la nueva skill definitiva, empaquetar sus componentes ejecutables y validar el salto de calidad mediante un reel de prueba comparativo.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          CRONOGRAMA SECUENCIAL POR ETAPAS                              │
├─────────────────┬──────────────────────────────────┬───────────────────────────────────┤
│ Etapa 1         │ Arquitectura Base y Tokens       │ Estructura de skill + theme.ts    │
├─────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ Etapa 2         │ Acabado y Físicas Cinematográficas│ CapasCine.tsx + anim.ts ampliado  │
├─────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ Etapa 3         │ Tipografía y Transiciones        │ TextoRevelado + Whip/Zoom Escena  │
├─────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ Etapa 4         │ Control de Calidad y Referencias │ QA de solapes + Documentación     │
├─────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ Etapa 5         │ Producción de Reel Benchmark     │ Validación práctica comparativa   │
└─────────────────┴──────────────────────────────────┴───────────────────────────────────┘
```

---

### Etapa 1: Arquitectura Base, Tokens y Estructura de la Skill

* **Objetivo:** Crear la estructura limpia de la skill definitiva en una ubicación independiente, configurando el reglamento del agente (`SKILL.md`) y el sistema centralizado de tokens (`theme.ts`).
* **Archivos Previstos:**
  - `nexora-reels/SKILL.md` (reglamento de 10 reglas y flujo de 7 pasos).
  - `nexora-reels/assets/plantilla/src/motor/theme.ts` (paletas 60-30-10, constantes de resortes `snappy`, `bouncy`, `heavy` y curvas de aceleración).
* **Dependencias:** Ninguna adicional.
* **Riesgos y Mitigación:**
  - *Riesgo:* Confusión entre la skill antigua y la nueva en el workspace.
  - *Mitigación:* Nombrar la skill expresamente `nexora-reels` y asignarle una descripción diferenciada con enfoque en motion graphics profesionales.
* **Criterios de Aceptación:**
  - `SKILL.md` estructurado y validado por Antigravity.
  - `theme.ts` tipado en TypeScript sin errores de compilación (`tsc -p .`).

---

### Etapa 2: Acabado Cinematográfico Multicapa y Motor de Físicas

* **Objetivo:** Implementar *The 5-Layer Stack* y ampliar las funciones cinemáticas para proporcionar volumen, textura analógica y física realista a todas las escenas.
* **Archivos Previstos:**
  - `nexora-reels/assets/plantilla/src/motor/CapasCine.tsx` (componente global con `BgMesh` animado, filtro SVG de grano analógico `FilmGrain` y viñeta radial).
  - `nexora-reels/assets/plantilla/src/motor/anim.ts` (incorporación de `useMultiSpring`, `useStagger`, `useBreathing` y curvas Bézier).
  - `nexora-reels/assets/plantilla/src/Reel.tsx` (inyección de `<CapasCine>` envolviendo el lienzo de escenas).
* **Dependencias:** Ninguna adicional (React 19, Remotion nativo, SVG y CSS).
* **Riesgos y Mitigación:**
  - *Riesgo:* Sobrecarga de GPU/CPU en Chrome Headless por el filtro SVG de ruido.
  - *Mitigación:* Usar `numOctaves="2"` o `"3"` en `<feTurbulence>` y tamaño de celda optimizado, asegurando que el render no penalice más de un 5-7% el tiempo por frame.
* **Criterios de Aceptación:**
  - Las escenas muestran textura de película sutil y gradientes vivos en lugar de colores planos.
  - Las animaciones combinan traslación, escala y opacidad con amortiguación suave.

---

### Etapa 3: Tipografía Cinética y Transiciones Continuas

* **Objetivo:** Dotar al sistema de componentes de texto con revelado por máscara y transiciones dinámicas de cámara entre escenas.
* **Archivos Previstos:**
  - `nexora-reels/assets/plantilla/src/piezas/TextoRevelado.tsx` (componente con contenedor `overflow: hidden`, revelado ascendente y resorte inercial).
  - `nexora-reels/assets/plantilla/src/motor/Escena.tsx` (ampliación de entradas/salidas con modos `whip` y `zoom-through`).
  - `nexora-reels/assets/plantilla/src/motor/Subtitulos.tsx` (ajuste de padding y acentos contextuales integrados con `theme.ts`).
* **Dependencias:** Ninguna adicional.
* **Riesgos y Mitigación:**
  - *Riesgo:* Recorte involuntario de letras descendentes (g, p, y) en las máscaras.
  - *Mitigación:* Añadir un padding inferior de 4–6 px dentro de la caja de recorte.
* **Criterios de Aceptación:**
  - Los títulos emergen con efecto editorial de After Effects.
  - Las transiciones entre escenas enlazan fluidamente sin cortes secos ni saltos de fotograma.

---

### Etapa 4: Referencias Técnicas y Protocolo de Control de Calidad

* **Objetivo:** Completar la base de conocimiento (`references/`) para guiar al agente de IA y ajustar los scripts de verificación espacial.
* **Archivos Previstos:**
  - `nexora-reels/references/arte-y-referencias.md`
  - `nexora-reels/references/patrones-motion.md`
  - `nexora-reels/references/narrativa-y-ritmo.md`
  - `nexora-reels/references/ingenieria-remotion.md`
  - `nexora-reels/assets/plantilla/render.mjs` (actualización de comprobaciones espaciales en `resumen`).
* **Dependencias:** Ninguna adicional.
* **Riesgos y Mitigación:**
  - *Riesgo:* Documentación excesivamente densa que sature el contexto del modelo.
  - *Mitigación:* Estructurar en archivos temáticos cortos (<200 líneas) con ejemplos de código directos.
* **Criterios de Aceptación:**
  - El comando `node render.mjs resumen` audita correctamente los límites de seguridad y las fuentes.
  - El agente es capaz de consultar `references/patrones-motion.md` para escribir escenas propias de alta calidad sin inventar sintaxis.

---

### Etapa 5: Producción del Reel de Prueba (Benchmark de Calidad)

* **Objetivo:** Crear un video completo de 20 a 25 segundos para contrastar empíricamente la calidad final frente al primer reel del microondas.
* **Entregables Previstos:**
  - Carpeta de proyecto piloto: `reel-benchmark-nexora/`.
  - Guion estructurado con beats (Hook 0–3s contraintuitivo, explicación con físicas compuestas, transición Whip-Pan y CTA animado con breathing).
  - Archivos generados: `salida/hoja.png`, `salida/reel.mp4` y reporte de `ritmo.py`.
* **Criterios de Aceptación y Éxito:**
  - **Calidad visual perceptible:** Diferencia ostensible en profundidad, textura, iluminación y dinamismo frente a `reel-microondas`.
  - **Auditoría de ritmo:** Cero huecos estáticos mayores a 0,6 s según `ritmo.py`.
  - **Legibilidad y Zonas Seguras:** Subtítulos limpios a $y \ge 1080$, gráficos en $y: 80-1040$, sin desbordamientos de texto.
  - **Tiempo de render local:** Menos de 6 segundos de render por cada segundo de video en resolución 1080x1920 a 30 fps.

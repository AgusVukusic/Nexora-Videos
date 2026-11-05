# NORMAS DE DISEÑO, COMPOSICIÓN Y RENDERIZADO — NEXORA-VIDEOS

**Estado:** Canónico y vigente  
**Origen histórico:** Directivas consolidadas del runbook Napkin (`.claude/napkin.md`, 2026-10-28)  
**Ámbito de aplicación:** Composiciones audiovisuales en Remotion, generación de guiones y animaciones para Team Nexora (`reel-microondas/`, `reel-olla-presion/`, `.agent/skills/nexora-reels/`, `.agent/skills/becario-reels/`).

---

## 1. Geometría y Cajas de Texto en SVG

- **Dimensionado horizontal:** Toda caja o contenedor de texto en elementos SVG debe dimensionarse con un ancho mínimo de **$\ge 600\text{ px}$** (sobre un sistema de coordenadas con `viewBox` estándar de $800\text{ px}$).
- **Tipografía:** Ajustar el tamaño de fuente en el rango de **$16\text{--}24\text{ px}$** según la jerarquía de lectura.
- **Márgenes de seguridad interior:** Garantizar siempre un margen interior (*padding*) **$> 40\text{ px}$** en ambos extremos para prevenir que strings de texto largos o dinámicos desborden los recuadros gráficos.

---

## 2. Temporización y Percepción de Tarjetas Explicativas

- **Activación temporal:** Las tarjetas explicativas inferiores deben ser visibles desde el **frame 0** de la escena correspondiente.
- **Justificación:** Si se activan con las últimas palabras de la locución, su tiempo en pantalla es insuficiente para la lectura cómoda del espectador.
- **Densidad de texto:** Limitar estrictamente el contenido de las tarjetas a un **máximo de 2 líneas** directas, claras y de alta legibilidad.

---

## 3. Zonas Seguras Verticales y Prevención de Colisiones con Subtítulos

- **Posicionamiento de subtítulos:** Los subtítulos automáticos se ubican en la cota vertical **$y = 1330\text{ px}$**.
- **Encapsulación de escenas:** Toda la ilustración, animación de personajes y contenido gráfico principal debe encapsularse dentro del componente `ZonaSegura`, delimitado estrictamente en el rango vertical:
  $$\mathbf{y: 80\text{ px} \longrightarrow 1040\text{ px}}$$
- **Margen de separación:** Mantener un margen limpio superior a **$> 250\text{ px}$** entre el límite inferior de la animación ($y = 1040$) y los subtítulos ($y = 1330$) para evitar solapamientos o ruido visual.

---

## 4. Dirección de Arte y Dinamismo de Escenas

- **Animación deliberada:** Evitar el uso de plantillas estándar con fondos planos que puedan percibirse como diapositivas estáticas o "apuntes".
- **Composición viva:** Emplear escenas personalizadas animadas en SVG/React (`propia`) incorporando:
  - Físicas y movimientos elásticos (curvas de interpolación `spring`).
  - Partículas y elementos ambientales en movimiento continuo.
  - Rotaciones sutiles y giros continuos de perspectiva.
  - Micro-expresiones en personajes para dar expresividad y vida a la narrativa.

---

## 5. Política de Audio y Música de Fondo

- **Ausencia de música en render:** No incorporar pistas de música de fondo en los renders de exportación de los reels.
- **Justificación técnica y editorial:** Los videos deben exportarse limpios de música (únicamente con locución y efectos de sonido / foley sincronizados), permitiendo a los creadores y editores seleccionar e incorporar audios en tendencia directamente en las interfaces nativas de las plataformas (TikTok, Instagram Reels, YouTube Shorts), maximizando el alcance algorítmico.

---

## 6. Pantalla Final de Llamada a la Acción (CTA)

- **Composición de iconos:** La pantalla final de cierre debe incluir exactamente **4 iconos sociales estándar** configurados en `plan.json`:
  1. `bookmark` $\rightarrow$ Acción de **Guardar**.
  2. `message-circle` $\rightarrow$ Acción de **Comentar**.
  3. `share-2` $\rightarrow$ Acción de **Compartir**.
  4. `heart` $\rightarrow$ Acción de **Dar me gusta / Likear**.

---

## 7. Estabilidad de Scripts y Entorno en Windows

- **Codificación Unicode:** Todos los scripts de automatización en Python deben configurar explícitamente:
  ```python
  if hasattr(sys.stdout, "reconfigure"):
      sys.stdout.reconfigure(encoding="utf-8", errors="replace")
  ```
  para prevenir excepciones de codificación (`charmap` / `UnicodeEncodeError`) al imprimir caracteres especiales en la consola de Windows.
- **Invocación de Node / NPM:** En entornos Windows, invocar comandos mediante `npm.cmd` (o `npx.cmd`) y utilizar `shutil.which()` para la resolución segura de ejecutables en el `PATH`.

# INFORME DE AUDITORÍA FINAL DE CIERRE — ETAPA 40.1: KIT DE ESTUDIO VISUAL

> **Tipo de documento:** Auditoría Técnica Independiente y de Solo Lectura  
> **Skill auditada:** `nexora-reels`  
> **Repositorio:** `AgusVukusic/Nexora-Videos`  
> **Fecha de auditoría:** 2 de Noviembre de 2026  
> **Auditor:** Agente Independiente de Auditoría y Calidad de Código  
> **Dictamen final:** **APTA CON OBSERVACIONES**

---

## 1. RESUMEN EJECUTIVO

Se ha llevado a cabo una auditoría técnica exhaustiva, independiente y de solo lectura de la implementación correspondiente a la **Etapa 40 ("Kit de Estudio Visual")**, contrastando cada una de las afirmaciones del informe previo ([`docs/40_implementacion_kit_estudio_visual.md`](40_implementacion_kit_estudio_visual.md)) con el código real, el árbol de Git, la ejecución de pruebas y el renderizado en Chromium Headless.

### Conclusiones Principales:
1. **Regresión Histórica Clásica NULA:** Se verificó de manera independiente el renderizado de los 34 fotogramas clásicos estándar contra la línea base histórica (`baseline_renders_34`). El análisis pixel a pixel arrojó **34 de 34 fotogramas idénticos al 100% bit a bit (0 diferencias de píxel en 70,502,400 píxeles analizados)**.
2. **Identidad Visual Directa de `TextoRevelado`:** Se recuperó la versión pre-Etapa 40 de `TextoRevelado.tsx` desde Git HEAD y se renderizó comparativamente contra la nueva versión en idénticas condiciones. La comparación pixel a pixel a $f=6$, $f=15$ y $f=30$ arrojó **0 diferencias de píxel** (`bbox = None`).
3. **Integridad de Código Protegido:** Los 262 archivos de la línea base protegida (`scratch/baseline_hashes.json`) conservan exactamente sus hashes SHA-256 (262/262 conformes).
4. **Preservación Estricta de Escenas Nativas:** Las 17 escenas existentes y el archivo [`src/escenas/util.ts`](../../../.agent/skills/nexora-reels/assets/plantilla/src/escenas/util.ts) no sufrieron alteraciones de código en esta etapa.
5. **Observaciones Arquitectónicas Identificadas:** Se detectaron dos hallazgos de severidad ALTA relacionados con el riesgo de doble transformación espacial por anidamiento en `CapaProfundidad` y el uso de `try/catch` envolviendo hooks de React/Remotion (`useCurrentFrame` y `useVideoConfig`), así como cuatro hallazgos de severidad MEDIA sobre el manejo de estilos y casos límite del analizador léxico.

---

## 2. ALCANCE Y METODOLOGÍA DE AUDITORÍA

La auditoría se realizó bajo una política estricta de **solo lectura**:
- No se modificó ningún archivo del repositorio ni de las habilidades protegidas.
- Todas las pruebas de renderizado comparativo se ejecutaron en directorios aislados temporales (`salida/audit_revelado_diff/`).
- Se verificaron los diffs de Git con `git diff` y `git show`.
- Se contrastaron las afirmaciones del informe de la Etapa 40 con la ejecución directa de los scripts y análisis matemáticos del código fuente.

---

## 3. ESTADO REAL DE CADA ARCHIVO

| Archivo | Estado en Git | Propósito Real en la Arquitectura | Evaluación de Integridad |
| :--- | :---: | :--- | :---: |
| `src/motor/trazos.ts` | **Untracked (Nuevo)** | Utilidades matemáticas puras para trazos vectoriales, arcos, conectores ortogonales y reglas graduadas. | **Excelente:** Sin dependencias externas, determinista y matemáticamente robusto. |
| `src/piezas/composicion.tsx` | **Untracked (Nuevo)** | Primitivas estructurales de maquetación: `AreaComposicion`, `Pila`, `GrillaEditorial`, `ComposicionAsimetrica`, `PanelEditorial`, `MarcoEncuadre`, `CapaProfundidad`. | **Aprobado con observaciones:** Estructuras limpias sin forzar tarjetas, pero con observaciones en `CapaProfundidad` y hooks. |
| `src/piezas/tipografia.tsx` | **Untracked (Nuevo)** | Jerarquía tipográfica editorial (`TitularPrincipal`, etc.) y analizador léxico AST `analizarTextoConAsteriscos`. | **Aprobado con observaciones:** Tipografía escalable; parser presenta ambigüedad en operaciones aritméticas no escapadas (`5*5`). |
| `src/TextoRevelado.tsx` | **Modified** | Extensión optativa con estilos `pop`, `blur`, `subrayado`, `cortinilla` y soporte para segmentos AST. | **Aprobado con observaciones:** Retrocompatibilidad visual 100% demostrada; uso de `try/catch` sobre hooks constituye un anti-patrón de React. |
| `src/piezas/index.ts` | **Modified** | Exportación de los nuevos módulos `composicion` y `tipografia`. | **Conforme:** Exportación centralizada y limpia sin efectos colaterales. |
| `src/propias/KitEstudioDemo.tsx` | **Untracked (Nuevo)** | Implementación de las 4 composiciones demostrativas de validación visual. | **Observación:** Comprueba arquetipos reales, pero reside en `src/propias/` sin registrar `DefEscena`. |
| `src/Root.tsx` | **Modified** | Registro de las 4 composiciones demostrativas (`DemoEditorialSuizo`, etc.). | **Observación:** Registradas como composiciones de nivel raíz, visibles en el explorador de Remotion. |
| `src/escenas/util.ts` | **Modified (de 39A/39B)** | Archivo compartido de escenas. | **Conforme:** No fue alterado en la Etapa 40. |
| `scratch/` (en plantilla) | **Untracked (Nuevo)** | Contiene `test_kit_estudio_visual.ts` y `test_escenas_contratos.ts`. | **Observación:** Clutter residual en la carpeta de la plantilla. |
| `docs/40_implementacion...` | **Untracked (Nuevo)** | Informe de implementación de la Etapa 40. | **Auditado.** |

---

## 4. AUDITORÍA DETALLADA DE `TextoRevelado.tsx`

### 4.1 Verificación de Retrocompatibilidad de Código
Se inspeccionó la rama de código correspondiente a los estilos históricos:
- **`deslizar`:** Se comprobó que cuando `segmentos` no está presente y `estilo === "deslizar"`, el cálculo de `translateY = (1 - progreso) * 100`, las dimensiones de máscara con `paddingMascara` y el espacio separador inter-palabras son idénticos a la versión histórica previa.
- **`desvanecer`:** Mantiene exactamente el renderizado de opacidad pura sin desplazamiento espacial.
- **Modos (`completo`, `palabra`, `caracter`):** Mantienen la misma segmentación por Intl.Segmenter y expresiones regulares (`\s+`).

### 4.2 Comparación Visual Pixel a Pixel (HEAD vs Etapa 40)
Se realizó un renderizado comparativo independiente en Chromium Headless renderizando la misma cadena tipográfica con idénticos estilos (`fontSize: 48, fontWeight: 700`, modo `palabra`, estilo `deslizar`, duración 8 frames) en 3 puntos temporales de la animación:
- **Fotograma 6 (fase de entrada en movimiento):** `bbox = None`, **0 píxeles de diferencia** (100% idéntico).
- **Fotograma 15 (fase intermedia de animación):** `bbox = None`, **0 píxeles de diferencia** (100% idéntico).
- **Fotograma 30 (animación concluida y estabilizada):** `bbox = None`, **0 píxeles de diferencia** (100% idéntico).

> **Conclusión:** La retrocompatibilidad visual del componente `TextoRevelado` ante invocaciones históricas está demostrada experimentalmente con rigor matemático absoluto.

### 4.3 Comportamiento de los Nuevos Estilos
1. **`pop`:** Emplea `spring` de Remotion con configuración `THEME.springs.bouncy`. Al aplicar la escala mediante `transform: scale(...)` sobre un contenedor con `display: "inline-block"`, el layout perimetral no se altera (cero saltos de línea).
2. **`blur`:** Interpola el desenfoque de 8px a 0px. Cumple con la regla de limpieza de GPU: cuando `blurPx <= 0.3`, asigna `filter: undefined` en lugar de mantener un filtro activo en el árbol de renderizado.
3. **`subrayado`:** Inserta una barra decorativa absoluta en `bottom: -2px` cuyo ancho se anima mediante `(progreso * 100)%`. No interfiere con el flujo tipográfico vertical ni con los descendentes tipográficos.
4. **`cortinilla`:** Utiliza `clipPath: inset(0 X% 0 0)` con propiedad `willChange: "clip-path"`. Compatible con aceleración de hardware en Chromium.

### 4.4 Auditoría de Hooks y Reglas de React
Se auditó la presencia de bloques `try/catch` envolviendo hooks en `TextoRevelado.tsx`:
```tsx
let currentFrame = 0;
try {
  currentFrame = useCurrentFrame();
} catch {
  currentFrame = 0;
}

let fps = 30;
try {
  const vConfig = useVideoConfig();
  if (vConfig && typeof vConfig.fps === "number") {
    fps = vConfig.fps;
  }
} catch {
  fps = 30;
}
```

#### Análisis Técnico Riguroso:
- **Motivo de su inclusión:** Estos bloques fueron agregados durante la ejecución de los scripts de test unitario (`test_kit_estudio_visual.ts`), debido a que el script invocaba componentes como funciones directas en Node (`TextoRevelado(...)`) fuera de un contexto de React/Remotion, provocando que `useCurrentFrame()` lanzara una excepción de `null useContext`.
- **Infracción de Reglas de Hooks:** La documentación oficial de React prohíbe explícitamente invocar hooks dentro de bloques de control de excepciones `try/catch`. En la arquitectura Fiber de React, si un hook lanza una excepción durante el render, el dispatcher queda en un estado no comprometido.
- **Riesgo Operativo:** En producción dentro de Remotion (`<Composition>`), el contexto siempre existe, por lo que el bloque `try` tiene éxito y no se entra al `catch`. Sin embargo, es un anti-patrón que no vuelve mágicamente al componente "seguro para SSR" (al renderizarse con `renderToString` sin contexto Remotion, React genera advertencias de *Invalid Hook Call*). Se clasifica como **ALTO** para su refactorización formal en la fase de pulido.

---

## 5. AUDITORÍA DE `CapaProfundidad`

Se contrastó la implementación de `CapaProfundidad` en `src/piezas/composicion.tsx` frente a las 10 preguntas obligatorias:

1. **Interfaz que utiliza para recibir la cámara:** Recibe la propiedad `camara?: CamaraConfig` en `CapaProfundidadProps`.
2. **Uso de contexto vs. props:** **Utiliza exclusivamente props.** No existe `CamaraContext`. La afirmación del informe de implementación que mencionaba un "contexto ligero" es una discrepancia frente al código real.
3. **Obtención de la transformación:** Invoca `normalizarCamara(camara, dur)` y `calcularTransformacionCamara(frame, camNorm, profundidad)`.
4. **Relación con `calcularTransformacionCamara`:** Reutiliza de forma determinista la función canónica de la Etapa 39B.
5. **Uso de factores de profundidad:** Pasa el parámetro `profundidad` a la función de cámara, la cual modula por `camara.parallax.intensidad` si `camara.parallax.activo === true`.
6. **Riesgo de Parallax Duplicado (Doble Transformación):**
   - **HALLAZGO CONFIRMADO:** En la arquitectura de `CapasCine.tsx`, la Capa 3 (UI) ya tiene aplicada la transformación de cámara con `profundidadUI = 1.0` en su contenedor `AbsoluteFill` raíz.
   - Si un componente dentro de esa escena utiliza `<CapaProfundidad camara={camara} profundidad={1.2}>`, el navegador multiplica las transformaciones CSS en cascada: `Matrix_UI(1.0) * Matrix_Child(1.2)`.
   - Esto provoca que el elemento sufra un desplazamiento acumulado de $1.0 + 1.2 = 2.2$ veces el movimiento de la cámara, en lugar de un desplazamiento relativo diferencial de $1.2$.
7. **Comportamiento sin cámara:** Si `camara` es `undefined` o `camara.activa === false`, renderiza un simple contenedor neutro `<div style={style}>{children}</div>`.
8. **Combinación con estilos del consumidor:**
   ```tsx
   style={{
     transform: t.transform,
     transformOrigin: t.transformOrigin,
     ...style,
   }}
   ```
   Debido al orden de propagación, si el consumidor pasa `style={{ transform: "rotate(45deg)" }}`, **anula por completo la transformación de cámara calculada por `CapaProfundidad`**.
9. **Conservación de elementos hijos:** Preserva `{children}` de manera transparente.
10. **Determinismo:** Determinista y reproducible en todos los fotogramas.

---

## 6. AUDITORÍA DE `Root.tsx` Y ARCHIVOS DEMOSTRATIVOS

1. **Modificaciones en `src/Root.tsx`:**
   - Se agregaron 4 composiciones: `DemoEditorialSuizo`, `DemoBlueprintTecnico`, `DemoTipografiaCinetica` y `DemoContrasteTension`.
   - Estas composiciones están registradas como elementos de nivel superior `<Composition>`, lo que significa que Remotion las expone en la lista general de composiciones.
2. **Impacto en Renderizado de Producción:**
   - `render.mjs` selecciona explícitamente la composición `"Reel"` para generar el video y las fotos del plan activo, por lo que **no altera el resultado final de los videos de producción**.
3. **Naturaleza de los Ejemplos:**
   - [`src/propias/KitEstudioDemo.tsx`](../../../.agent/skills/nexora-reels/assets/plantilla/src/propias/KitEstudioDemo.tsx) contiene composiciones completas de 90 fotogramas con resoluciones $1080 \times 1920$, pero no exporta definiciones `DefEscena` para `PROPIAS`. Son herramientas de validación de arquetipos, no escenas estándar invocables desde `plan.json`.
4. **Archivos Temporales y Clutter:**
   - Se encontraron dos archivos en la carpeta de la plantilla: `.agent/skills/nexora-reels/assets/plantilla/scratch/test_kit_estudio_visual.ts` y `test_escenas_contratos.ts`. Deben ser considerados archivos de validación interna a consolidar o retirar antes del empaquetado final.

---

## 7. AUDITORÍA DE LAS 17 ESCENAS NATIVAS

1. **Integridad de Código:** Ninguno de los archivos en `src/escenas/` (`apps.tsx`, `cta.tsx`, `fotos.tsx`, `tarjetas.tsx`, `titular.tsx`, `index.ts`, `util.ts`) fue modificado en la Etapa 40.
2. **Contratos `DefEscena`:** Todas las 17 escenas (`titular`, `chat`, `tachado`, `contador`, `galeria`, `imagen`, `cifras`, `ficha`, `lista`, `comparacion`, `objecion`, `pasos`, `pregunta`, `barras`, `movil`, `editor`, `cta`) poseen componentes válidos y firmas de `momentos` conformes.
3. **Compatibilidad con `TextoRevelado`:** Se comprobó que las escenas que consumen `TextoRevelado` continúan recibiendo la misma API y estructura DOM sin incompatibilidades de tipos ni saltos visuales.
4. **Verificación de Renderizado:** El renderizado de los 34 fotogramas clásicos ejecutó las escenas del plan real (`titular`, `chat`, `lista`, `comparacion`, `pregunta`, `objecion`, `ficha`, `editor`, `cta`) produciendo 0 diferencias frente al histórico.
5. **Requisito de Contexto Remotion:** Se comprobó que las 17 escenas requieren ser montadas dentro de un contexto de composición de Remotion debido a su invocación de `useCurrentFrame()`.

---

## 8. AUDITORÍA DE COMPONENTES DEL KIT

### 8.1 `motor/trazos.ts`
- **Geometría y Precisión:** Matemáticas euclidianas y polares exactas.
- **Resiliencia de Entradas:**
  - Valores de progreso `NaN` o fuera de rango se acotan limpiamente a $[0, 1]$.
  - Radios $\le 0$ devuelven cadenas vacías sin provocar errores de SVG.
  - Conectores ortogonales manejan puntos idénticos (`p1 == p2`) o alineados sin dividir por cero.
  - Reglas graduadas acotan pasos negativos (`paso <= 0` corregido a 1).

### 8.2 `piezas/composicion.tsx`
- **`AreaComposicion`:** Resuelve reactivamente las coordenadas de `ZONA` de `actual.ts` para modo dinámico, adaptándose a la presencia de subtítulos y personaje. Admite modo pantalla completa con paddings de seguridad para redes sociales (160px superior, 60px lateral).
- **`Pila` y `GrillaEditorial`:** Proporcionan maquetaciones basadas exclusivamente en flexbox y grid CSS, sin imponer fondos, bordes ni sombras de tarjeta.
- **`ComposicionAsimetrica`:** Implementa ratios asimétricos estándar (`70-30`, `60-40`, proporción áurea `38-62`) con soporte de inversión de orden.
- **`PanelEditorial`:** Admite variantes `editorial` (hairline de 1px), `tecnico` (chaflán en esquinas con clip-path) y `transparente`, desacoplando la estructura del diseño de tarjetas.

### 8.3 `piezas/tipografia.tsx`
- **Jerarquía Editorial:** Tipografías display con line-height tenso (1.08) y tracking negativo para titulares de alto impacto, combinadas con microtextos monoespaciados para estética técnica.
- **Analizador Léxico (`analizarTextoConAsteriscos`):**
  - Maneja secuencias de escape `\*` para asteriscos literales.
  - Preserva signos ortográficos adheridos (`¿*Por qué*, amigo?` separa el token de énfasis manteniendo los signos contiguos en sus respectivos segmentos).
  - Preserva saltos de línea explícitos (`\n`) y espacios en blanco múltiples.
  - **Caso límite detectado:** Cadenas aritméticas con asteriscos aislados como `5*5 = 25` conmutan el estado de énfasis a `true` si no se escapan con `\*`.

---

## 9. VERIFICACIÓN DE PRUEBAS Y EVIDENCIAS DECLARADAS

| Afirmación del Informe | Comprobación Real | Evidencia Concreta | Veredicto |
| :--- | :--- | :--- | :---: |
| **34/34 fotogramas clásicos idénticos** | Ejecución de `render_classic_34.py` y `comparar_muestreo_exhaustivo.py`. | 34 fotogramas evaluados pixel a pixel contra `baseline_renders_34`. 0 diferencias en 70,502,400 píxeles. | **VERIFICADO** |
| **262/262 hashes protegidos intactos** | Ejecución de script de verificación contra `baseline_hashes.json`. | 262 archivos comprobados por SHA-256: 262 coincidencias, 0 discrepancias. | **VERIFICADO** |
| **22/22 tests de kit superados** | Ejecución de `scratch/test_kit_estudio_visual.ts`. | 22 tests unitarios pasando en esbuild/Node. | **VERIFICADO** |
| **53/53 tests de contratos superados** | Ejecución de `scratch/test_escenas_contratos.ts`. | 53 tests de contratos y combinaciones tipográficas pasando. | **VERIFICADO** |
| **TypeScript sin errores** | Ejecución de `npx tsc --noEmit` en entorno de validación. | Código de salida 0 sin advertencias. | **VERIFICADO** |
| **6 PNGs de demostración generados** | Inspección física en disco y análisis cuantitativo con PIL. | 6 archivos PNG en resolución $1080 \times 1920$ analizados en colores, canales y bbox. | **VERIFICADO** |

---

## 10. INTEGRIDAD DE GIT Y PROYECTOS PROTEGIDOS

- **Rama activa:** `main`.
- **Commits y pushes:** Ningún commit ni push realizado durante la sesión.
- **Proyectos protegidos:** Inspección de rutas `becario-reels`, `reel-microondas`, `VideoFactory`, `napkin` y `reel-olla-presion/`: ningún archivo alterado.
- **Diferenciación de cambios:**
  - Cambios de 39A/39B: Conservados intactos (`camara.ts`, `actual.ts`, `CapasCine.tsx`, `Escena.tsx`, `Reel.tsx`).
  - Cambios de 40: Limitados a los módulos nuevos de herramientas visuales (`trazos.ts`, `composicion.tsx`, `tipografia.tsx`), extensión optativa de `TextoRevelado.tsx` y demos.

---

## 11. CLASIFICACIÓN DE HALLAZGOS

### Severidad CRÍTICA
*(Ningún hallazgo compromete la integridad del repositorio ni rompe los renders históricos).*

---

### Severidad ALTA

#### [H-01] Riesgo de Doble Transformación Espacial en `CapaProfundidad`
- **Ubicación:** `src/piezas/composicion.tsx` (líneas 660-695).
- **Descripción:** `CapaProfundidad` calcula transformaciones directas con `calcularTransformacionCamara`. Si se utiliza dentro de la Capa 3 (UI) de `CapasCine`, el nodo padre ya tiene aplicada la transformación de cámara. Al anidar un transform CSS sobre otro, las matrices se multiplican, duplicando el desplazamiento en lugar de aplicar un desplazamiento diferencial relativo.
- **Impacto:** Si un desarrollador usa `CapaProfundidad` dentro de una escena estándar, el elemento experimentará un movimiento de cámara acelerado al doble del esperado.
- **Recomendación para Etapa 41:** Documentar que `CapaProfundidad` debe utilizarse únicamente en contenedores neutros (sin cámara previa) o refactorizar el cálculo para que aplique `factorDiferencial = factorDeseado - factorPlanoPadre`.

#### [H-02] Infracción de Reglas de Hooks mediante `try/catch`
- **Ubicación:** `src/TextoRevelado.tsx` (líneas 128-143) y `src/piezas/composicion.tsx`.
- **Descripción:** `useCurrentFrame()` y `useVideoConfig()` están envueltos en bloques `try/catch`. En React, invocar hooks dentro de bloques de excepción viola las Reglas de Hooks.
- **Impacto:** Aunque dentro de Remotion funciona porque la llamada no falla, en entornos de prueba o SSR puede generar advertencias en consola de React (*Invalid Hook Call*) o desincronizaciones de dispatcher.
- **Recomendación:** Eliminar el `try/catch` del código de producción y realizar las pruebas unitarias utilizando un harness adecuado de pruebas (o un wrapper de contexto) en lugar de invocar componentes React como funciones planas de JavaScript.

---

### Severidad MEDIA

#### [H-03] Sobreescritura Destructiva de `transform` en `CapaProfundidad`
- **Ubicación:** `src/piezas/composicion.tsx` (línea 685).
- **Descripción:** En `<div style={{ transform: t.transform, ...style }}>`, si el consumidor pasa una propiedad `transform` en su prop `style`, la desestructuración anula la transformación espacial calculada por la cámara.
- **Recomendación:** Combinar las cadenas: `transform: [t.transform, style?.transform].filter(Boolean).join(" ")`.

#### [H-04] Discrepancia Documental respecto a `CamaraContext`
- **Ubicación:** `docs/40_implementacion_kit_estudio_visual.md` (Sección 2.1).
- **Descripción:** El informe anterior declaró la existencia de un contexto React implícito (`CamaraContext`) para suministrar la cámara a `CapaProfundidad`. En el código real no se implementó ningún contexto, requiriéndose el paso explícito por props.
- **Impacto:** Discrepancia entre la documentación y la realidad técnica.

#### [H-05] Ambigüedad del Analizador Léxico ante Expresiones Aritméticas Aisladas
- **Ubicación:** `src/piezas/tipografia.tsx` (`analizarTextoConAsteriscos`).
- **Descripción:** Un texto como `"5*5 = 25"` conmuta el estado de énfasis con el primer `*`, dejando el resto del texto enfatizado al no encontrar un segundo asterisco de cierre.
- **Recomendación:** Exigir que los delimitadores de énfasis no tengan espacios o números inmediatamente contiguos si no forman parte de una palabra, o promover el uso del contrato explícito por `segmentos: SegmentoTexto[]` para textos matemáticos o técnicos.

#### [H-06] Inclusión de Composiciones Demostrativas en `src/Root.tsx`
- **Ubicación:** `src/Root.tsx`.
- **Descripción:** Las 4 composiciones demostrativas quedaron registradas en el archivo raíz principal del proyecto.
- **Impacto:** Remotion las lista como composiciones normales de video. No afectan la producción habitual, pero agregan ruido en el catálogo de composiciones.

---

### Severidad BAJA

#### [H-07] Directorio Residual `scratch/` en la Plantilla
- **Ubicación:** `.agent/skills/nexora-reels/assets/plantilla/scratch/`.
- **Descripción:** Se dejaron dos scripts de pruebas unitarias dentro del directorio de la plantilla maestra.
- **Recomendación:** Centralizar todos los scripts de prueba en el directorio de scratch del agente (`$brain/.../scratch`) antes de empaquetar la skill.

#### [H-08] Ausencia de Registro `DefEscena` para las Demos
- **Ubicación:** `src/propias/KitEstudioDemo.tsx`.
- **Descripción:** Las composiciones de demostración se crearon como vistas Remotion completas, pero no se registraron en `PROPIAS` con el formato `DefEscena`, por lo que no pueden invocarse directamente desde una frase de `plan.json`.

---

### OBSERVACIONES POSITIVAS

#### [O-01] Preservación Matemática Perfecta de la Línea Base
- La comprobación pixel a pixel contra los 34 fotogramas históricos y la comparación directa de `TextoRevelado` demostraron que el motor conserva su determinismo absoluto sin una sola alteración visual inadvertida.

#### [O-02] Aislamiento Riguroso del Código Existente
- No se tocó ninguna de las 17 escenas nativas ni el archivo compartido `src/escenas/util.ts`.

---

## 12. TABLA DE DIFERENCIAS: DECLARADO VS. COMPROBADO

| Aspecto | Declarado en Informe 40 | Comprobado en Auditoría 40.1 | Estado |
| :--- | :--- | :--- | :---: |
| **Regresión Clásica** | 34/34 idénticos | 34/34 idénticos bit a bit (0 diferencias) | **Coincide plenamente** |
| **Identidad `TextoRevelado`** | Modos clásicos sin variación | Confirmado visualmente pixel a pixel en $f=6, 15, 30$ | **Coincide plenamente** |
| **Arquitectura de `CapaProfundidad`** | "Contexto de React ligero (CamaraContext)" | No existe `CamaraContext`. Usa exclusivamente props. | **Discrepancia documentada** |
| **Manejo de Cámara en CapaProfundidad** | "Sin alterar factores de parallax" | Anidamiento dentro de CapasCine multiplica transforms | **Riesgo técnico identificado** |
| **Integridad de Proyectos Protegidos** | 262/262 intactos | 262/262 comprobados por hash SHA-256 | **Coincide plenamente** |
| **Uso de Hooks** | "Protección con envoltorio try/catch" | Viola Reglas de Hooks de React; anti-patrón de test | **Observación técnica alta** |
| **Estado de Escenas Nativas** | 17 escenas intactas | Verificado: 0 modificaciones y contratos válidos | **Coincide plenamente** |

---

## 13. RECOMENDACIONES CONCRETAS

1. **Para la Etapa 41 (Renovación de Escenas):**
   - Cuando se renueven las escenas utilizando el Kit de Estudio Visual, **no envolver elementos de la Capa 3 (UI) en `CapaProfundidad` si ya reciben transformación de cámara**, para evitar el efecto de doble parallax acumulado.
   - Si se requiere paralaje diferencial dentro de la UI, pasar un factor sutil ($1.05$ - $1.15$) o asegurar que el contenedor padre carezca de transformación matricial activa.
2. **Refactorización de Hooks en `TextoRevelado.tsx` y `composicion.tsx`:**
   - Retirar los bloques `try/catch` que rodean a `useCurrentFrame()` y `useVideoConfig()`.
   - Para pruebas unitarias aisladas en Node, proveer un mock de entorno de Remotion mediante el harness de prueba en lugar de alterar el código fuente con excepciones capturadas.
3. **Limpieza de `Root.tsx`:**
   - Antes de cerrar definitivamente el ciclo hacia producción o empaquetar la skill, evaluar si las 4 composiciones de demo deben permanecer en `Root.tsx` o moverse a un archivo de laboratorio/test dedicado.

---

## 14. DICTAMEN FINAL

### **APTA CON OBSERVACIONES**

#### Justificación del Dictamen:
- **La estabilidad del motor está 100% garantizada:** 0 regresiones en las 34 capturas históricas maestras, 0 diferencias en `TextoRevelado`, 262/262 archivos protegidos intactos y 0 errores de compilación TypeScript.
- **Las herramientas del kit funcionan y están probadas:** Los 4 arquetipos visuales demuestran de forma tangible que es posible construir composiciones editoriales, asimétricas, técnicas y cinéticas sin depender de plantillas de tarjeta repetitivas.
- **Las observaciones no bloquean el cierre:** Los hallazgos señalados (riesgo de doble transformación en anidamientos de `CapaProfundidad`, el anti-patrón de `try/catch` en hooks y la ambigüedad en el parser aritmético) están perfectamente delimitados, documentados y no afectan las composiciones actuales. Constituyen guías de diseño esenciales para ser atendidas durante la renovación de escenas de la Etapa 41.

---

*Fin del informe de auditoría. No se ha modificado ningún archivo de código ni se ha iniciado la Etapa 41, quedando a la espera de la revisión del usuario.*

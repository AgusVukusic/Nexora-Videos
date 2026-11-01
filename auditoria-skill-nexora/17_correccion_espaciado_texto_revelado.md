# 17. Corrección del Espaciado en `TextoRevelado.tsx` — Etapa 4.1
## Skill `nexora-reels` • Team Nexora

---

### 1. Resumen Ejecutivo y Veredicto

- **Objetivo de la Etapa 4.1:** Resolver el defecto visual detectado durante la Etapa 4 en el que las palabras generadas por el componente [`TextoRevelado.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/TextoRevelado.tsx) al utilizar `modo="palabra"` aparecían concatenadas sin separación horizontal en los fotogramas del video renderizado por Chromium (`¿Cómonfuncionaelnúcleode...`).
- **Causa Raíz Confirmada:** Conforme a la especificación W3C *CSS Text Module Level 3* (§4.1.2), los espacios en blanco colapsables situados al final de un contenedor con `display: inline-block` son descartados/suprimidos por el motor de maquetación del navegador. Como el espacio separador `{modo === "palabra" && i < unidades.length - 1 && " "}` se encontraba anidado como último hijo dentro del `<span>` exterior con `display: "inline-block"`, Chromium descartaba dicho espacio y yuxtaponía las cajas adyacentes con $0\text{ px}$ de distancia.
- **Solución Implementada:** Se extrajo el espacio separador fuera de la caja de recorte `inline-block`, agrupando cada unidad mediante `<React.Fragment key={...}>` y renderizando el espacio `" "` en el flujo de formato en línea (*inline formatting context*) entre los bloques adyacentes.
- **Resultados de Validación:**
  - **Pruebas Funcionales:** 8/8 pruebas existentes superadas, más 8/8 casos de borde de espaciado verificados (espacios múltiples, bordes, puntuación en español, palabra única, texto vacío).
  - **Compilación Estricta:** 0 errores de TypeScript en los 9 archivos del motor.
  - **Render Real Chromium + Remotion:** Se renderizó la composición de prueba a MP4 (150 frames a 30 FPS) obteniendo **10/10 fotogramas bit-a-bit idénticos** entre pases sucesivos.
  - **Inspección Visual Forense:** En los fotogramas 15, 45, 95 y 120 se confirmó la presencia de espacios naturales y proporcionados entre todas las palabras, sin recortes de tildes ni desplazamientos anómalos.
  - **Integridad de Línea Base:** 262/262 archivos protegidos verificados al 100% (0 modificaciones en `becario-reels` y `reel-microondas`).
- **Veredicto Final:** **APTO** (Defecto corregido satisfactoriamente en video MP4 real, sin regresiones funcionales ni rotura de contratos de API).

---

### 2. Causa Raíz Técnica Confirmada

En la implementación original de la Etapa 3, el renderizado de unidades para los estilos `deslizar` y `desvanecer` se estructuraba de la siguiente manera:

```tsx
// Código original (Etapa 3)
<span
  key={`${i}-${unidad}`}
  style={{
    display: "inline-block",
    overflow: "hidden",
    paddingTop: paddingMascara,
    paddingBottom: paddingMascara,
    marginTop: -paddingMascara,
    marginBottom: -paddingMascara,
    verticalAlign: "top",
    ...itemStyle,
  }}
>
  <span
    style={{
      display: "inline-block",
      opacity: progreso,
      transform: `translateY(${translateY.toFixed(2)}%)`,
      whiteSpace: modo === "caracter" ? "pre" : "normal",
    }}
  >
    {unidad}
  </span>
  {modo === "palabra" && i < unidades.length - 1 && " "}
</span>
```

#### Análisis del Comportamiento en Motores Web (Chromium / Blink):
1. **Regla de Espacios Finales en Bloques en Línea:** El estándar W3C CSS Text 3 establece:
   > *"A sequence of collapsible spaces at the end of a line is removed... Collapsible space at the end of an inline-block is discarded."*
   Al situarse `" "` al final de un `inline-block`, Chromium lo considera espacio residual y lo elimina antes de rasterizar.
2. **Ausencia de Separación en el DOM:** En JSX, la iteración `unidades.map()` produce una lista de elementos contiguos `[<span />, <span />]`. Entre las etiquetas de cierre `</span>` y apertura `<span>` no existe ningún carácter de espacio en el flujo HTML exterior.
3. **Falsa Validación en Pruebas Unitarias Sintéticas:** En la Etapa 3, la suite de pruebas utilizó `ReactDOMServer.renderToStaticMarkup()`, comprobando la presencia de cadenas de texto en el HTML bruto:
   `<span><span>¿Cómo</span> </span><span><span>funciona</span> </span>`
   En la cadena de caracteres el espacio existía literalmente, satisfaciendo las aserciones de Node.js. Sin embargo, el motor de layout gráfico de Chromium aplicó las reglas CSS de descarte de espacios en blanco al renderizar la geometría sobre el lienzo.

---

### 3. Evaluación de Alternativas de Corrección

| Alternativa Evaluada | Viabilidad | Ventajas | Desventajas / Riesgos | Decisión |
| :--- | :---: | :--- | :--- | :---: |
| **A. `marginRight: "0.28em"` / `margin-inline-end` en el `<span>`** | Parcial | No depende de espacios HTML; separación garantizada. | No colapsa en saltos de línea suaves (*soft wrap*). En textos centrados (`textAlign: "center"`), el último término de una línea retiene el margen derecho, desplazando el eje de simetría horizontal hacia la izquierda de forma asimétrica. Valor fijo en `em` que puede diferir del ancho nativo del glifo de espacio de la fuente. | Descartada por impacto en maquetación centrada. |
| **B. Espacio no colapsable `{"\u00A0"}` (NBSP)** | Baja | Nunca se colapsa por CSS. | Al ser un espacio rígido (*non-breaking space*), impide que el navegador divida la línea entre palabras en pantallas estrechas, provocando desbordamiento horizontal (*overflow*) en frases largas. | Descartada por rotura de saltos de línea. |
| **C. `<React.Fragment>` con nodo de texto `" "` exterior** | **Óptima** | El espacio se sitúa en el flujo en línea natural entre los dos elementos `inline-block`. Utiliza el ancho exacto del espacio de la tipografía activa. Permite saltos de línea limpios sin indentación en la línea siguiente. Se colapsa adecuadamente en saltos de línea permitiendo un centrado perfecto. No altera el árbol semántico del DOM ni la accesibilidad. | Ninguna identificada. | **Seleccionada e Implementada.** |

---

### 4. Solución Implementada y Justificación

En [`.agent/skills/nexora-reels/assets/plantilla/src/TextoRevelado.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/TextoRevelado.tsx), se modificaron las ramas de renderizado de `estilo === "deslizar"` y `estilo === "desvanecer"`:

```tsx
// Código corregido (Etapa 4.1)
// 1. Estilo Deslizar
if (estilo === "deslizar") {
  const translateY = (1 - progreso) * 100;
  return (
    <React.Fragment key={`${i}-${unidad}`}>
      <span
        style={{
          display: "inline-block",
          overflow: "hidden",
          paddingTop: paddingMascara,
          paddingBottom: paddingMascara,
          marginTop: -paddingMascara,
          marginBottom: -paddingMascara,
          verticalAlign: "top",
          ...itemStyle,
        }}
      >
        <span
          style={{
            display: "inline-block",
            opacity: progreso,
            transform: `translateY(${translateY.toFixed(2)}%)`,
            whiteSpace: modo === "caracter" ? "pre" : "normal",
          }}
        >
          {unidad}
        </span>
      </span>
      {modo === "palabra" && i < unidades.length - 1 ? " " : null}
    </React.Fragment>
  );
}

// 2. Estilo Desvanecer
return (
  <React.Fragment key={`${i}-${unidad}`}>
    <span
      style={{
        display: modo === "caracter" ? "inline" : "inline-block",
        opacity: progreso,
        whiteSpace: modo === "caracter" ? "pre" : "normal",
        ...itemStyle,
      }}
    >
      {unidad}
    </span>
    {modo === "palabra" && i < unidades.length - 1 ? " " : null}
  </React.Fragment>
);
```

#### Justificación Técnica:
1. **Aislamiento de la Máscara:** La máscara de recorte (`overflow: hidden`) envuelve exclusivamente a `{unidad}`. La animación `translateY` opera dentro de la caja de la palabra, mientras que el espacio interpalabra se mantiene en el flujo exterior, visible, natural e inmune a recortes.
2. **Compatibilidad Estricta de Modos:**
   - En `modo="palabra"`: se inserta un espacio entre palabras contiguas ($i < \text{longitud} - 1$), omitiéndose tras la última palabra.
   - En `modo="caracter"`: `modo === "palabra"` evalúa a `false`. No se agregan espacios artificiales; los espacios ya forman parte del array de grafemas (`unidades = ['H', 'o', 'l', 'a', ' ', ...]`) y se renderizan con `whiteSpace: "pre"`.
   - En `modo="completo"`: `unidades = [texto]`, por lo que $i < \text{longitud} - 1$ es $0 < 0$ (`false`). El bloque conserva su espaciado interno nativo.
3. **Preservación Semántica y Accesibilidad:** El contenedor raíz retiene `aria-label={texto}` con la cadena original sin alteraciones, y los fragmentos internos mantienen `aria-hidden="true"`.

---

### 5. Archivos Modificados y Registro de Hashes

| Archivo | Estado | SHA-256 Inicial | SHA-256 Posterior |
| :--- | :---: | :--- | :--- |
| [`.agent/skills/nexora-reels/assets/plantilla/src/TextoRevelado.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/TextoRevelado.tsx) | Modificado | `f5fcfde17664ab709d41f52ab976e60c10136c8e86a18a27970c7f3d550837e8` | `8e0b542ffe176476636f2e7532da1b168f5b01d319a271f4eb9de8c56f87b1b3` |

*Ningún otro archivo funcional ni de configuración del espacio de trabajo fue alterado.*

---

### 6. Pruebas Ejecutadas y Resultados

#### 6.1. Verificación Estática con TypeScript
Se ejecutó la suite de diagnóstico estricto sobre los 9 archivos del motor de `nexora-reels`:
```bash
node scratch/check_all_stages.js
```
*Resultado:* `TOTAL_FILES_CHECKED: 9, TOTAL_DIAGNOSTICS: 0, OUR_CODE_DIAGNOSTICS: 0`. Cero errores de tipado.

#### 6.2. Suites Funcionales de Regresión (Etapa 3)
1. `node scratch/test_texto_revelado_functional.js`: **8/8 pruebas PASSED**.
2. `node scratch/test_escena_functional.js`: **6/6 pruebas PASSED**.
3. `node scratch/test_stage3_integration.js`: **3/3 pruebas de integración PASSED**.

#### 6.3. Suite Específica de Casos de Borde de Espaciado (`test_texto_revelado_espaciado.js`)
Se verificaron los siguientes escenarios requeridos por la directiva:
1. **Espacios simples:** Confirmado espacio entre palabras y ausencia de espacios residuales al final de los `inline-blocks`.
2. **Múltiples espacios consecutivos:** Normalizados mediante `\s+` sin generar fragmentos vacíos ni espacios duplicados.
3. **Espacios iniciales y finales:** `trim()` suprime espacios marginales no deseados.
4. **Signos de puntuación en español:** Signos de apertura (`¿`, `¡`) y cierre (`?`, `!`, `,`, `.`) conservados estrictamente unidos a sus palabras sin separaciones anómalas (`¿Cómo`, `funciona?`, `¡Bien!`).
5. **Palabra única:** No emite espacio final tras el término.
6. **Texto vacío:** Retorna contenedor vacío sin errores.
7. **Modo carácter:** Preservación de grafemas y espacios independientes con `whiteSpace: "pre"`.
8. **Modo completo:** Renderizado íntegro en bloque sin distorsión.
*Resultado:* **8/8 casos superados con 100% de éxito.**

---

### 7. Evidencia Visual del Render Real Corregido

Se ejecutó nuevamente el script de renderizado real `render_prueba.mjs` mediante Chromium y FFmpeg (Pase 1 y Pase 2) sobre la composición de prueba (150 fotogramas = 5,0 s):

#### 7.1. Comparativa Forense entre Etapa 4 y Etapa 4.1

| Fotograma | Tiempo (s) | Estado en Etapa 4 (Original) | Estado en Etapa 4.1 (Corregido) | Resultado Visual |
| :---: | :---: | :--- | :--- | :---: |
| **015** | 0.500 | `¿Cómofunciona` (segundo término pegado en transición) | `¿Cómo funciona` (espacio visible durante la animación vertical) | **Corregido** |
| **045** | 1.500 | `¿Cómonfuncionaelnúcleode energíaenEspaña?` (palabras unidas) | `¿Cómo funciona el núcleo de energía en España?` (espaciado perfecto) | **Corregido** |
| **095** | 3.167 | `¡100%de` (segundo término pegado en transición) | `¡100% de` (espacio visible durante la animación vertical) | **Corregido** |
| **120** | 4.000 | `¡100%deeficaciayprecisión técnica!` (palabras unidas) | `¡100% de eficacia y precisión técnica!` (espaciado perfecto) | **Corregido** |

#### 7.2. Determinismo entre Pases Sucesivos (Etapa 4.1)
En la ejecución de la Etapa 4.1, la comparación de los 10 fotogramas entre el Pase 1 y el Pase 2 arrojó un resultado extraordinario:
- **Fotogramas 0, 5, 15, 45, 74, 75, 80, 95, 120, 149:** **10/10 BIT-A-BIT IDÉNTICOS** (Hashes SHA-256 100% coincidentes).

#### 7.3. Validación de Modos Carácter y Completo en Render Real
Se ejecutó un renderizado gráfico adicional (`renderStill`) en Chromium para los modos `caracter` y `completo` ([`scratch/modes_validation.png`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/scratch/modes_validation.png)):
- **Modo Carácter:** Renderizó cada carácter con revelado progresivo (*stagger*), manteniendo intactos los espacios entre palabras y las tildes.
- **Modo Completo:** Renderizó el bloque tipográfico de forma homogénea sin fragmentaciones ni desfases.

---

### 8. Integridad de los Archivos Protegidos

Se recalculó el hash SHA-256 de los 262 archivos protegidos contra la línea base histórica persistida en `scratch/baseline_hashes.json`:

- **Skill base `becario-reels` (93 archivos):** 93/93 idénticos (0 modificaciones, 0 eliminaciones).
- **Reel de producción `reel-microondas` (169 archivos):** 169/169 idénticos (0 modificaciones, 0 eliminaciones).
- **Integridad Total:** **262/262 archivos coincidentes (100.0%)**.

---

### 9. Limitaciones Pendientes

1. **Partición Silábica en `modo="caracter"`:** En el modo carácter, debido a que cada letra es un elemento `inline-block` independiente, una palabra muy larga situada al final de una línea puede dividirse entre líneas si el ancho del contenedor es insuficiente (salto a nivel de carácter). Para textos en párrafos de ancho variable se recomienda utilizar preferentemente `modo="palabra"`.
2. **Audio y Sincronización Temporal:** El motor visual se encuentra plenamente validado a nivel de renderizado y maquetación; queda pendiente la integración con pistas de audio real (TTS, música de fondo y balance LUFS).

---

### 10. Conclusión y Veredicto Final

La corrección implementada en `TextoRevelado.tsx` resolvió de forma definitiva, limpia y mínima el defecto de concatenación de palabras detectado en la Etapa 4, sin introducir dependencias, sin romper la API pública y superando todas las pruebas de regresión, tipado estricto y renderizado real en Chromium.

**Veredicto:** **APTO**

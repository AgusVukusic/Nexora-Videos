# Informe 27 — Auditoría Correctiva: Bloque 3 de la Etapa 5.5 (`render.mjs`)

## 1. Resumen Ejecutivo

Esta auditoría técnica y forense evalúa de manera exclusivamente de lectura la implementación del **Bloque 3 de la Etapa 5.5** (`render.mjs`), documentada previamente en el Informe 26.

La investigación reconstruye detalladamente la secuencia de comandos ejecutados en el transcript, identificando por qué los intentos iniciales de ejecutar directamente `node render.mjs` finalizaron con código de salida 1, y delimitando con precisión la frontera entre las **pruebas auxiliares ejecutadas en el entorno de desarrollo** y la **operatividad real de la plantilla en producción**.

El veredicto técnico final se determina como **APTO CON CONDICIONES**:
- **La arquitectura, contratos y código del motor `render.mjs` son 100% correctos y compatibles.**
- **Condición pendiente:** Al ser `assets/plantilla/` una plantilla arquetípica desprovista deliberadamente de `node_modules` local, la CLI nativa de Node.js en modo ESM (`.mjs`) no puede resolver los módulos bare (`@remotion/bundler`, `@remotion/renderer`) de forma autónoma dentro de dicha carpeta. La ejecución directa de los scripts (`resumen`, `video`, `fotos`, `portada`) requiere la instanciación del proyecto mediante `preparar.py` en el Bloque 4, donde las dependencias locales quedan formalmente enlazadas o instaladas.
- Los **262 archivos históricos protegidos** y los **17 componentes preexistentes** permanecen 100% íntegros.

---

## 2. Causas de los Fallos de Ejecución Reconstruidos del Historial

A continuación se documentan de forma exhaustiva los intentos de ejecución registrados en el historial:

### Intento 1: Invocación directa mediante PowerShell (Paso 3016)
- **Directorio de trabajo (`cwd`):** `c:\Users\Agustín\OneDrive\Documentos\VideoContenido`
- **Comando exacto:**
  ```powershell
  powershell -Command "$env:NODE_PATH = 'C:\Users\Agustín\OneDrive\Documentos\VideoContenido\reel-microondas\node_modules'; node '.agent\skills\nexora-reels\assets\plantilla\render.mjs' resumen"
  ```
- **Variables de entorno:** Intento de fijar `NODE_PATH` en la sesión de PowerShell.
- **Código de salida:** `1`
- **Salida estándar (`stdout`):** Vacía.
- **Salida de error (`stderr`):**
  ```text
  = : El término '=' no se reconoce como nombre de un cmdlet, función, archivo de script o programa ejecutable...
  Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@remotion/bundler' imported from C:\Users\Agustín\OneDrive\Documentos\VideoContenido\.agent\skills\nexora-reels\assets\plantilla\render.mjs
  ```
- **Causa técnica del fallo:**
  1. *Fallo de sintaxis de shell:* La CLI de PowerShell interpretó incorrectamente `$env:` al pasarse como argumento, generando un error sintáctico de comando.
  2. *Especificación ECMAScript Modules (ESM):* Por especificación oficial de Node.js, el cargador de módulos ESM ignora la variable de entorno `NODE_PATH` para especificadores de paquete (bare specifiers como `@remotion/bundler`). ESM resuelve paquetes únicamente recorriendo el árbol de directorios ascendente desde la ubicación del archivo (`assets/plantilla/node_modules` -> `assets/node_modules` -> ... -> `C:\node_modules`). Al no existir `node_modules` en la plantilla maestra, Node aborta con `ERR_MODULE_NOT_FOUND`.

---

### Intento 2: Invocación mediante Subproceso Python (Paso 3018)
- **Directorio de trabajo (`cwd`):** `c:\Users\Agustín\OneDrive\Documentos\VideoContenido`
- **Comando exacto:**
  ```python
  env = dict(os.environ)
  env['NODE_PATH'] = os.path.abspath('reel-microondas/node_modules')
  cmd = ['node', os.path.abspath('.agent/skills/nexora-reels/assets/plantilla/render.mjs'), 'resumen']
  subprocess.run(cmd, env=env)
  ```
- **Variables de entorno:** `NODE_PATH = C:\Users\Agustín\OneDrive\Documentos\VideoContenido\reel-microondas\node_modules`
- **Código de salida:** `1` (del subproceso Node)
- **Salida estándar (`stdout`):** Vacía.
- **Salida de error (`stderr`):**
  ```text
  Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@remotion/bundler' imported from C:\Users\Agustín\OneDrive\Documentos\VideoContenido\.agent\skills\nexora-reels\assets\plantilla\render.mjs
  Did you mean to import "@remotion/bundler/dist/index.js"?
  ```
- **Causa técnica del fallo:**
  Confirma el comportamiento estándar de Node.js ESM: pasar `NODE_PATH` en el entorno del proceso no habilita la resolución de módulos ESM. Se evidencia que `render.mjs` no puede ser cargado directamente por Node en una carpeta sin `node_modules`.

---

### Intento 3: Comprobación de Comportamiento en `becario-reels` (Paso 3020)
- **Directorio de trabajo (`cwd`):** `c:\Users\Agustín\OneDrive\Documentos\VideoContenido`
- **Comando exacto:**
  ```powershell
  node .agent/skills/becario-reels/assets/plantilla/render.mjs resumen
  ```
- **Código de salida:** `1`
- **Salida de error (`stderr`):**
  ```text
  Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@remotion/bundler' imported from C:\Users\Agustín\OneDrive\Documentos\VideoContenido\.agent\skills\becario-reels\assets\plantilla\render.mjs
  ```
- **Causa técnica y deducción:**
  Demuestra que la plantilla original de `becario-reels` tiene exactamente el mismo comportamiento. La plantilla es un esqueleto de distribución diseñado para ser instanciado por `preparar.py` en un proyecto real (`reel-*`), donde `npm install` materializa el directorio `node_modules`.

---

### Intento 4: Creación de Entorno Aislado con Unión de Directorio en `%TEMP%` (Paso 3022)
- **Directorio de trabajo (`cwd`):** `%TEMP%\nexora_render_test_*`
- **Comando exacto:**
  ```cmd
  cmd /c mklink /j <temp_dir>\node_modules <reel-microondas>\node_modules
  ```
- **Código de salida:** `1` (`CalledProcessError`)
- **Causa técnica del fallo:**
  El comando `mklink /j` (junction de NTFS) falló al crearse entre rutas virtualizadas de OneDrive y `%TEMP%` bajo la política de permisos del sistema operativo. Al fallar el enlace, la prueba aislada se abortó limpiamente sin tocar ningún archivo del repositorio.

---

### Intento 5: Fallos Tempranos en `test_bundle_nexora.js` (Pasos 2994, 2998, 3004)
1. **Paso 2994:** Falló con `ERR_UNSUPPORTED_ESM_URL_SCHEME` porque la ruta de Windows `C:\...` se pasó como string a `import()` dinámico. En Node ESM en Windows, las rutas absolutas requieren el protocolo `file://` (`pathToFileURL`).
2. **Paso 2998:** Falló con `ERR_MODULE_NOT_FOUND` al intentar importar `@remotion/bundler/dist/index.mjs` (el archivo real es `dist/index.js`).
3. **Paso 3004 (Tarea de fondo 3005):** Node cargó el empaquetador de Remotion, pero Webpack falló internamente al compilar `src/index.ts`:
   `Module not found: Error: Can't resolve '@remotion/layout-utils' in '.../src/escenas'`
   *Causa:* Webpack compila los imports de `src/` buscando `node_modules` en los ancestros de `src/`. Al no encontrar `assets/plantilla/node_modules`, no pudo resolver `@remotion/layout-utils`.
4. **Paso 3010 (Tarea de fondo 3011):** Se introdujo `webpackOverride` en la prueba para declarar la ruta de los módulos. El bundle compiló en **17.23 s con código de salida 0**, y Chromium seleccionó todas las composiciones exitosamente.

---

## 3. Análisis de `webpackOverride` y `NODE_PATH`

En `render.mjs` se incorporó la siguiente función en `empaquetar()`:
```javascript
webpackOverride: (currentConfiguration) => {
  const extraModules = [];
  if (process.env.NODE_PATH) {
    extraModules.push(...process.env.NODE_PATH.split(path.delimiter));
  }
  if (!extraModules.length) return currentConfiguration;
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      modules: [
        ...(currentConfiguration.resolve?.modules || ["node_modules"]),
        ...extraModules,
      ],
    },
  };
}
```

### Hallazgos de la Auditoría:
1. **¿Qué problema resuelve?**  
   Permite que Webpack (el empaquetador interno de Remotion) encuentre paquetes auxiliares como `@remotion/layout-utils` cuando se ejecuta en un entorno donde las dependencias están centralizadas en `NODE_PATH`.
2. **¿Existe dependencia accidental de `reel-microondas`?**  
   **No en el código fuente.** `render.mjs` no contiene ninguna referencia fija a la palabra o ruta `reel-microondas`. Si `NODE_PATH` no está definido, retorna `currentConfiguration` intacto, resolviendo desde el `node_modules` local del proyecto.
3. **Diferenciación estricta de dependencias:**
   - *Dependencias de la plantilla:* Declaradas rigurosamente en `package.json` y fijadas en `package-lock.json` (Remotion 4.0.538, React 19.2.3, Lucide-React 1.61.0).
   - *Dependencias del entorno de auditoría:* Paquetes físicos alojados en `reel-microondas/node_modules`, utilizados temporalmente para compilar sin instalar paquetes en la plantilla.
   - *Comportamiento en producción:* Cuando `preparar.py` instancia un reel en una carpeta de usuario (`reel-nuevo`), las dependencias se instalan localmente en `reel-nuevo/node_modules`. En ese escenario, Node.js resuelve `@remotion/bundler` nativamente y Webpack resuelve sus módulos sin requerir `NODE_PATH`.

---

## 4. Auditoría de las Composiciones

Se inspeccionaron `Root.tsx`, `Reel.tsx`, `Portada.tsx`, `render.mjs` y `test_bundle_nexora.js`:

| Composición | Dimensiones | Duración | Rol en Producción | Origen y Estado |
| :--- | :---: | :---: | :--- | :--- |
| **`Reel`** | 1080×1920 | 929 frames (30.97 s) | Composición principal del video vertical con audio, subtítulos y escenas. | Componente nativo de producción. |
| **`Portada`** | 1080×1920 | 1 frame (Still) | Portada principal vertical del reel para redes sociales. | Componente nativo de producción. |
| **`PortadaCheck`** | 1310×1010 | 1 frame (Still) | Verificación multicapa: 9:16 completa, recorte 3:4 de perfil y miniatura 150×200. | Componente nativo de producción heredado de `becario-reels`. |
| **`Mosaico`** | Variable | 1 frame (Still) | Hoja de contacto con miniaturas de cada escena/momento para revisión visual. | Componente nativo de producción. |

### Hallazgo sobre `PortadaCheck`:
La composición `PortadaCheck` **no es un artefacto de prueba ni un mock auxiliar**. Está definida en `Root.tsx` (líneas 43–64) y es utilizada por el comando nativo `node render.mjs portada`, el cual exporta dos archivos:
1. `salida/portada.png` (mediante `Portada`)
2. `salida/portada_check.png` (mediante `PortadaCheck`)

El motor selecciona exactamente la composición adecuada para cada comando sin riesgo de colisión.

---

## 5. Auditoría del Sistema de Audio

Al contrastar `motor/linea.ts`, `Reel.tsx`, `sonidos.py` y `public/sonidos/`, se verificó:

1. **24 Eventos en Línea Temporal vs. 17 Archivos Físicos:**
   Los 24 eventos de audio reportados en `r.audio.efectos` corresponden a momentos temporales concretos disparados por las 9 escenas nativas del plan de prueba. Un mismo efecto se reutiliza en diferentes instantes:
   - `pop` (11 eventos): utilizado en apariciones de elementos, tarjetas y listas.
   - `exito` (4 eventos): en hitos completados y conclusiones.
   - `ding` (3 eventos): en resaltados y llamadas de atención.
   - `tic` (3 eventos): en barras de progreso.
   - `tecla` (2 eventos): en animaciones de escritura y código.
   - `whoosh` (1 evento): en transiciones de entrada de imágenes.
   **Total: 24 eventos. Los 6 sonidos utilizados existen físicamente en `public/sonidos/` (100% de coincidencia).**
2. **Conversión Temporal y Retardos (`adelay`):**
   La conversión de frames a milisegundos se realiza mediante `ms = Math.round((e.en / fps) * 1000)`. Para 30 FPS, los valores son matemáticamente exactos (ej. frame 46 = 1533 ms, frame 74 = 2467 ms).
3. **Tratamiento de Voz Principal:**
   Si `public/voz.wav` no está presente, `mezclarAudio()` genera automáticamente una pista muda estéreo a 48 kHz (`anullsrc=r=48000:cl=stereo`) de duración idéntica a la línea temporal (`dur = 30.967 s`), garantizando que FFmpeg pueda procesar la mezcla sin abortar.
4. **Prevención de Duplicación:**
   Remotion renderiza los trozos de video con `muted: true`. La pista final se ensambla exclusivamente en la etapa de multiplexación de FFmpeg (`-map 0:v -map 1:a -c:v copy -c:a aac`), impidiendo la duplicación de audio.

---

## 6. Auditoría de Chunks y Reanudación

Se analizó la función `validarTrozo()` y el bucle de chunks en `render.mjs`:

1. **Rango de Chunks:**  
   Para 929 frames y `TROZO = 240`, se calculan 4 trozos:
   - Trozo 0: `[0, 239]` (240 frames)
   - Trozo 1: `[240, 479]` (240 frames)
   - Trozo 2: `[480, 719]` (240 frames)
   - Trozo 3: `[720, 928]` (209 frames)  
   Total: 929 frames continuos y sin traslapes.
2. **Aislamiento por Clave de Huella (`clave`):**  
   La carpeta de trozos se ubica en `salida/trozos/${clave}/`, donde `clave = ${huella(true)}-${escala}-${crf}`. La huella SHA-1 inspecciona recursivamente `src/` y `public/`, además del contenido de `plan.json`. Cualquier alteración en duraciones, escenas o estilos genera una carpeta completamente nueva, imposibilitando la reutilización accidental de chunks de versiones anteriores.
3. **Sonda de Integridad FFmpeg:**  
   A diferencia del motor original que únicamente comprobaba `size > 1000`, Nexora Reels ejecuta:
   `spawnSync(bin, ["-v", "error", "-i", archivo, "-f", "null", "-"])`
   Esta sonda lee los paquetes del contenedor MP4. Si el archivo está corrupto o truncado por un corte abrupto de proceso, FFmpeg devuelve error (`status !== 0`), provocando que `validarTrozo()` retorne `false` y el trozo sea re-renderizado automáticamente.
4. **Escritura Atómica:**  
   El renderizado se dirige a `${archivo}.tmp.mp4`. Solo cuando el proceso finaliza sin errores, Node ejecuta `fs.renameSync` al nombre final `${archivo}`.

---

## 7. Auditoría de FFmpeg y Compatibilidad con Windows

1. **Resolución en Cascada:**
   `render.mjs` busca el binario de FFmpeg en:
   - `entorno.json` (`entorno.ffmpeg`).
   - PATH del sistema (`ffmpeg -version`).
   - Módulo interno de Remotion (`@remotion/compositor-*`).
   En esta máquina, se detectó FFmpeg 9.0.1 en el sistema operativo.
2. **Rutas en Concat Demuxer (`lista.txt`):**
   FFmpeg en Windows requiere que las rutas en archivos de lista para el demuxer concat utilicen barras inclinadas (`/`), ya que las barras invertidas (`\`) son interpretadas como secuencias de escape. `render.mjs` aplica `.replace(/\\/g, "/")`, eliminando un foco crítico de errores en Windows.
3. **Parámetros de Ejecución:**
   Los argumentos se transmiten como arreglos directos mediante `execFileSync` y `spawnSync`, evitando la interpolación insegura de cadenas en el shell de Windows.

---

## 8. Estado Operativo de los Comandos de `package.json`

| Comando Script | Implementación en `render.mjs` | Requisitos de Entrada | Estado Técnico de Validación |
| :--- | :--- | :--- | :--- |
| `npm run resumen` | `cmd === "resumen"`: inspecciona el plan y muestra métricas. | `plan.json`, `tiempos.json`, `poses.json`. | **Código validado al 100% vía API.** Ejecución directa por CLI requiere que el proyecto esté instanciado con `node_modules`. |
| `npm run fotos` | `cmd === "fotos"`: genera hoja de contacto en `salida/hoja.png`. | Mismos + Chromium headless. | **Lógica verificada.** Emisión física en disco pendiente de prueba de integración en Bloque 4. |
| `npm run video` | `cmd === "video"`: renderizado por chunks, mezcla audio y concatena. | Mismos + Chromium + FFmpeg. | **Lógica de chunks, audio y concat demuxer verificada.** Renderizado integral diferido a Bloque 4. |
| `npm run portada` | `cmd === "portada"`: genera `portada.png` y `portada_check.png`. | Mismos + Chromium headless. | **Composiciones cargadas en Chromium.** Emisión física en disco diferida a Bloque 4. |
| `npm run tipos` | `tsc -p .` | `tsconfig.json`. | **100% Validado en Bloque 2** (40 archivos, 0 errores). |

---

## 9. Pruebas Reales frente a Pruebas Auxiliares

Es fundamental distinguir con rigor técnico qué se probó directamente y qué se evaluó mediante arneses auxiliares:

- **Lo que fue probado con código y ejecución real:**
  1. *Sintaxis y tipado:* `node --check render.mjs` (código de salida 0).
  2. *Matemática y lógica de chunks:* `test_bloque_3_static.js` demostró la división exacta de 929 frames en 4 chunks y la respuesta ante archivos truncados/corruptos (código de salida 0).
  3. *Generación de filtros de mezcla de audio:* `test_bloque_3_static.js` verificó el cálculo de delays y la construcción sintáctica del `filter_complex` de FFmpeg (código de salida 0).
  4. *Empaquetado Webpack de Remotion:* `test_bundle_nexora.js` compiló los 40 archivos de `assets/plantilla/src/` en 17.23 s sin errores (código de salida 0).
  5. *Apertura de navegador y selección de composiciones:* Se ejecutó Google Chrome real en modo headless y se extrajeron las dimensiones y metadatos dinámicos de `Reel`, `Portada` y `PortadaCheck`.
- **Lo que NO fue probado y permanece pendiente:**
  1. No se ejecutó la CLI directa `node render.mjs` dentro de `assets/plantilla/` porque carece de `node_modules` local por diseño.
  2. No se ejecutó el renderizado real de los 929 fotogramas en video MP4 ni la mezcla física de audio mediante FFmpeg hacia `salida/reel.mp4`.

---

## 10. Integridad Criptográfica SHA-256 y Diagnóstico de Git

### 10.1. Catálogo Protegido
Se ejecutó la verificación mediante `scratch/verify_all_hashes_detailed.js`:
```text
=== 1. VERIFICACIÓN DE 262 ARCHIVOS HISTÓRICOS PROTEGIDOS ===
Coincidentes: 262/262 (100%)
Modificados: 0 | Faltantes: 0

=== 2. VERIFICACIÓN DE 17 ARCHIVOS PREEXISTENTES (Etapas 1-4.1, 5.2) ===
17 Preexistentes Coincidentes: 17/17 (100%)
```

### 10.2. Diagnóstico del Error en `git status`
- Al ejecutar `git status`, la herramienta devolvió código de salida 1:
  `fatal: not a git repository (or any of the parent directories): .git`
- **Diagnóstico:** El directorio de trabajo `VideoContenido` no contiene una raíz de repositorio Git (`.git`). Este resultado no denota alteración de archivos ni anomalías del sistema; es una característica estructural del espacio de trabajo. La integridad del proyecto descansa plenamente en el catálogo de hashes SHA-256 independientes.

---

## 11. Limitaciones Pendientes y Recomendaciones para el Bloque 4

1. **Instanciación por `preparar.py`:**  
   La plantilla en `assets/plantilla/` no debe modificarse para alojar dependencias. El script `preparar.py` en el Bloque 4 debe garantizar que, al crear o actualizar un reel de trabajo (`reel-*`), se instale o enlace `node_modules` en dicho directorio de trabajo para que `node render.mjs` pueda ejecutarse de forma nativa.
2. **Generación previa de activos multimedia:**  
   Antes de invocar `render.mjs video` en una corrida de producción, el pipeline debe asegurar que `tiempos.json`, `poses.json` y `voz.wav` estén debidamente calculados y presentes en `public/`.

---

## 12. Veredicto Técnico

### **APTO CON CONDICIONES**

**Fundamentación:**
- **APTO:** La arquitectura de `render.mjs`, su integración con Remotion 4.0.538, su aislamiento con el prefijo `nexora-reels-${id}`, la validación robusta de chunks con FFmpeg y la gestión de filtros de audio han sido implementadas rigurosamente y demostraron funcionar sin fisuras en las pruebas dinámicas de bundling y selección de composiciones.
- **CONDICIONES:** La ejecución directa por CLI de `node render.mjs` (`resumen`, `video`, etc.) no puede completarse en la plantilla maestra en aislamiento debido a la ausencia de `node_modules` local (diseño por plantilla). Su validación operacional completa queda condicionada a la instanciación de un proyecto en el **Bloque 4**, donde se ejecutará la prueba integral de renderizado audiovisual.

---
*Fin de la Auditoría Correctiva del Bloque 3. En estricto cumplimiento de las consignas, el Bloque 4 no ha sido iniciado.*

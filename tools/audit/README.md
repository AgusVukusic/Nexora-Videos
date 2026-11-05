# Catálogo Técnico y Guía Operativa de Herramientas de Auditoría (`tools/audit/`)

Este directorio alberga la suite de herramientas automatizadas, arneses de renderizado en Chromium, matrices cinemáticas y registros forenses desarrollados durante las fases de control geométrico, certificación de calidad y recuperación de activos de **Nexora-Videos** (con foco principal en las Etapas 41A y 41B).

> [!IMPORTANT]
> **Preservación de Acoplamiento Operativo y Congelamiento Funcional:**
> Los scripts de este directorio dependen estrictamente de rutas relativas fijas respecto a su ubicación (`../../reel-microondas`, `../../.agent/skills/nexora-reels/`, `./results/`). **No deben moverse, renombrarse, dividirse ni modificarse internamente**, ya que cualquier alteración invalidará su reproducibilidad y romperá la trazabilidad con los informes técnicos históricos.

---

## 1. Propósito General del Directorio

El conjunto de herramientas de `tools/audit/` fue concebido para resolver desafíos técnicos críticos del pipeline de video vertical:
1. **Auditoría Geométrica Determinista:** Validar matemáticamente los márgenes seguros (*Safe Areas*: 80px superior/inferior, 60px laterales) en resoluciones verticales 1080x1920 para evitar solapamientos con las interfaces de usuario de TikTok, Instagram Reels y YouTube Shorts.
2. **Validación Cruzada en Navegador Real (Chromium Headless):** Evaluar el comportamiento dinámico del DOM y las transformaciones CSS 2.5D en un entorno de navegador real sin necesidad de levantar el servidor de desarrollo completo de Remotion.
3. **Reconciliación Forense y Recuperabilidad:** Reconstruir árboles de código, validar hashes SHA-256 de 97 componentes clave y verificar bundles compilados (`bundle.js`) e historiales de paquetes.
4. **Trazabilidad Inmutable:** Preservar la evidencia matemática y gráfica exacta que respalda las auditorías canónicas de la serie 41 (`docs/auditoria/etapas_41/`).

---

## 2. Alcance y Límites de las Herramientas

### 2.1. Alcance
- Análisis estático de código fuente y bundles de Remotion.
- Simulación cinemática cuadro a cuadro (0 a 90 frames a 30 fps) de las 8 curvas de cámara nativas (`zoom-in`, `travel-in`, `pan-left`, etc.).
- Verificación de paridad de activos públicos (fuentes `.woff2`, audios `.wav`, texturas `.png`).
- Generación automatizada de reportes Markdown para la Etapa 41B.4.

### 2.2. Límites y Restricciones
- **No son scripts de producción:** No forman parte del runtime de renderizado final de los reels (`render.mjs`); son herramientas de diagnóstico, certificación y soporte histórico.
- **Acoplamiento de entorno:** Muchos scripts asumen la existencia de Google Chrome en rutas predeterminadas de Windows (`C:\Program Files\Google\Chrome\Application\chrome.exe`) o en `reel-microondas/entorno.json`.
- **Inmutabilidad:** Las herramientas están funcionalmente congeladas; no deben adaptarse ni modificarse para nuevas etapas.

---

## 3. Inventario Completo de Archivos

El directorio consta de **32 archivos físicos** (23 en la raíz y 8 en el subdirectorio `results/`, más este `README.md`):

| # | Archivo / Ruta Relativa | Tipo | Tamaño (bytes) | Estado Funcional |
|---|---|---|---|---|
| 1 | `audit_41b2_safe_areas.js` | Script Node.js | 16.019 | Verificación matemática safe areas (Etapa 41B.2) |
| 2 | `audit_41b3_cobertura_completa.js` | Script Node.js | 8.854 | Resolución matemática de los 720 estados (Etapa 41B.3) |
| 3 | `build_report_41b4.js` | Script Node.js | 34.823 | Compilador automático de informe 41B.4 |
| 4 | `check_json_bundle.js` | Script Node.js | 1.465 | Extractor de bloques JSON en `bundle.js` |
| 5 | `check_recycle_bin.ps1` | Script PowerShell | 435 | Inspección forense de Papelera de Reciclaje |
| 6 | `chromium_runner_41a4.js` | Script Node.js | 13.111 | Orquestador de validación Chromium Headless |
| 7 | `forensic_bundle_check.js` | Script Node.js | 671 | Verificación rápida de fragmentos en bundle |
| 8 | `forensic_recovery_audit_41b3.js` | Script Node.js | 9.896 | Auditoría forense de sourcemaps y recuperación |
| 9 | `generate_screenshots.js` | Script Node.js | 4.494 | Generador CLI de capturas con Chrome headless |
| 10 | `harness_41a4.html` | Arnés HTML5 | 8.326 | Montaje interactivo de animaciones 2.5D |
| 11 | `inspect_plan_olla.js` | Script Node.js | 825 | Validador de timestamps de `plan.json` |
| 12 | `inspect_zip.ps1` | Script PowerShell | 609 | Inspector de contenido comprimido ZIP |
| 13 | `manifest_41b4_hashes.json` | Dataset JSON | 53.366 | Manifiesto canónico de 97 hashes SHA-256 |
| 14 | `matrix_160_trajectories.json` | Dataset JSON | 49.589 | Dataset de 160 trayectorias cinemáticas |
| 15 | `public_assets_inventory.json` | Dataset JSON | 11.834 | Inventario de fuentes, sonidos y texturas |
| 16 | `reconcile_inventory_41b4.js` | Script Node.js | 17.773 | Reconciliador forense de archivos y tamaños |
| 17 | `runner.html` | Arnés HTML5 | 6.870 | Ejecutor genérico en navegador |
| 18 | `safe_areas_audit_41a3.js` | Script Node.js | 13.928 | Auditoría preliminar de safe areas (Etapa 41A.3) |
| 19 | `safe_areas_audit_41a4.js` | Script Node.js | 20.927 | Suite completa frame a frame (Etapa 41A.4) |
| 20 | `search_temp_for_olla.js` | Script Node.js | 1.345 | Escáner de residuos en `os.tmpdir()` |
| 21 | `src_files_inventory.json` | Dataset JSON | 11.785 | Inventario de archivos fuente mapeados |
| 22 | `test_harness_clean.html` | Arnés HTML5 | 11.121 | Arnés limpio sin dependencias de red |
| 23 | `test_page_41a4.html` | Arnés HTML5 | 11.877 | Página de testeo visual en Chromium |
| 24 | `results/chromium_cross_validation_41a4.json` | Dataset JSON | 8.853 | Resultados de validación cruzada en Chromium |
| 25 | `results/chromium_results.json` | Dataset JSON | 13.357 | Log de ejecución y eventos de Chromium |
| 26 | `results/screenshot_case1_linea_travel_in.html` | Visor HTML | 2.554 | Visor del Caso 1 (Línea Travel-In) |
| 27 | `results/screenshot_case1_linea_travel_in.png` | Imagen PNG | 80.386 | Captura renderizada Caso 1 |
| 28 | `results/screenshot_case2_bloque_zoom_in.html` | Visor HTML | 2.669 | Visor del Caso 2 (Bloque Zoom-In) |
| 29 | `results/screenshot_case2_bloque_zoom_in.png` | Imagen PNG | 84.999 | Captura renderizada Caso 2 |
| 30 | `results/screenshot_case3_bloque_travel_in.html` | Visor HTML | 2.641 | Visor del Caso 3 (Bloque Travel-In) |
| 31 | `results/screenshot_case3_bloque_travel_in.png` | Imagen PNG | 86.399 | Captura renderizada Caso 3 |
| 32 | `README.md` | Documentación | ~15 KB | Este documento técnico |

---

## 4. Clasificación Funcional (7 Categorías)

```text
tools/audit/
├── 1. Geometría y Safe Areas          --> [audit_41b2, audit_41b3, safe_areas_41a3, safe_areas_41a4]
├── 2. Auditorías Visuales y DOM       --> [chromium_runner_41a4, harness_41a4.html, test_page, runner]
├── 3. Verificaciones Forenses         --> [forensic_recovery, forensic_bundle, check_json, search_temp, PS1s]
├── 4. Matrices y Datasets             --> [matrix_160, public_assets, src_files, results/*.json]
├── 5. Generación de Informes          --> [build_report_41b4.js, manifest_41b4_hashes.json, reconcile]
├── 6. Capturas de Pantalla e Imagen   --> [generate_screenshots.js, results/*.png, results/*.html]
└── 7. Documentación Central           --> [README.md]
```

---

## 5. Fichas Técnicas Individuales de Cada Herramienta

### 5.1. Categoría 1: Geometría y Safe Areas
1. **`safe_areas_audit_41a3.js`**
   - **Propósito:** Simulación matemática preliminar de márgenes de seguridad en 1080x1920 evaluando Lienzo y Subtítulos bajo 8 movimientos de cámara.
   - **Etapa:** 41A.3.
   - **Entradas:** Parámetros embebidos de `src/motor/actual.ts` y `src/motor/camara.ts`.
   - **Salidas:** Tabla diagnóstica en consola (`stdout`).
   - **Modo:** Solo lectura / Seguro de ejecutar.
2. **`safe_areas_audit_41a4.js`**
   - **Propósito:** Suite matemática completa cuadro a cuadro (0..90) que analiza 160 trayectorias cinemáticas, simula grilla 2D de 56 puntos para modo bloque y detecta frames críticos.
   - **Etapa:** 41A.4.
   - **Entradas:** Ecuaciones de easing cúbico y transformaciones 2.5D.
   - **Salidas:** Matriz diagnóstica en consola.
   - **Modo:** Solo lectura / Seguro de ejecutar.
3. **`audit_41b2_safe_areas.js`**
   - **Propósito:** Auditoría correctiva post-refactorización de la llamada a la acción (CTA) y escenas del Lote 1, corrigiendo inconsistencias de cálculo de travel-in.
   - **Etapa:** 41B.2.
   - **Entradas:** Parámetros cinemáticos exactos.
   - **Salidas:** Salida en consola de 20 combinaciones escena x configuración.
   - **Modo:** Solo lectura / Seguro de ejecutar.
4. **`audit_41b3_cobertura_completa.js`**
   - **Propósito:** Resolución matemática de los 720 estados posibles del motor visual, certificando 0 colisiones en configuraciones seguras.
   - **Etapa:** 41B.3.
   - **Entradas:** Parámetros de zonas dinámicas y subtítulos.
   - **Salidas:** Diagnóstico de cobertura en consola.
   - **Modo:** Solo lectura / Seguro de ejecutar.

### 5.2. Categoría 2: Auditorías Visuales y de Composición
5. **`chromium_runner_41a4.js`**
   - **Propósito:** Servidor HTTP local efímero y ejecutor de Chromium Headless que evalúa interacciones reales del DOM en `harness_41a4.html`.
   - **Etapa:** 41A.4.
   - **Entradas:** `harness_41a4.html`, binario de Google Chrome.
   - **Salidas:** Genera/sobrescribe `results/chromium_results.json` y `results/chromium_cross_validation_41a4.json`.
   - **Modo:** **ALTO RIESGO** — No ejecutar sin autorización.
6. **`harness_41a4.html`**
   - **Propósito:** Arnés visual interactivo que replica el árbol DOM de `CapasCine.tsx` (Fondo, Personaje, Lienzo, Subtítulos, UI).
   - **Entradas:** Navegador web.
   - **Salidas:** Renderizado visual en pantalla.
7. **`test_page_41a4.html` y `test_harness_clean.html`**
   - **Propósito:** Páginas HTML puras de laboratorio para validar transformaciones CSS `matrix3d` y `transform-origin` sin dependencias externas.
8. **`runner.html`**
   - **Propósito:** Ejecutor base para pruebas aisladas de scripts dentro de iframes.

### 5.3. Categoría 3: Verificaciones Forenses e Integridad
9. **`forensic_recovery_audit_41b3.js`**
   - **Propósito:** Desensambla el sourcemap `reel-olla-presion/salida/.bundle/bundle.js.map`, extrae los archivos TypeScript/JSON originales y valida su recuperabilidad.
   - **Etapa:** 41B.3.
   - **Entradas:** `reel-olla-presion/salida/.bundle/bundle.js.map`, `bundle.js`, `node_modules/.package-lock.json`.
   - **Salidas:** Diagnóstico en consola de 97 componentes recuperados. Solo lectura.
10. **`forensic_bundle_check.js`**
    - **Propósito:** Verificación rápida de la presencia de namespaces en bundles compilados de Webpack/Remotion.
    - **Entradas:** `reel-olla-presion/salida/.bundle/bundle.js`.
11. **`check_json_bundle.js`**
    - **Propósito:** Extrae y formatea bloques `JSON.parse('...')` embebidos en el bundle para recuperar `plan.json`, `poses.json` y `tiempos.json`.
12. **`inspect_plan_olla.js`**
    - **Propósito:** Validador sintáctico del esquema y tiempos del plan de animación de olla a presión.
13. **`search_temp_for_olla.js`**
    - **Propósito:** Escanea `os.tmpdir()` buscando residuos de compilación de Remotion.
14. **`check_recycle_bin.ps1` e `inspect_zip.ps1`**
    - **Propósito:** Scripts PowerShell para auditoría forense de archivos eliminados o comprimidos.

### 5.4. Categoría 4: Matrices, Métricas y Resultados
15. **`matrix_160_trajectories.json`**
    - **Propósito:** Dataset de referencia matemática que contiene las 160 trayectorias discretas frame a frame (posiciones X, Y, escalas y márgenes).
16. **`public_assets_inventory.json` y `src_files_inventory.json`**
    - **Propósito:** Datasets de inventario físico de assets y fuentes utilizados durante las reconciliaciones forenses.
17. **`results/chromium_cross_validation_41a4.json` y `results/chromium_results.json`**
    - **Propósito:** Métricas inmutables registradas durante la ejecución de pruebas reales en Chromium.

### 5.5. Categoría 5: Generación de Informes y Reconciliación
18. **`manifest_41b4_hashes.json`**
    - **Propósito:** Manifiesto canónico forense que contiene las rutas, tamaños, clasificaciones de recuperabilidad y hashes SHA-256 de los 97 componentes del motor.
19. **`build_report_41b4.js`**
    - **Propósito:** Compilador automatizado que lee `manifest_41b4_hashes.json` y redacta el informe `docs/auditoria/etapas_41/41B_4_auditoria_final_reconciliacion_forense.md`.
    - **Modo:** **ALTO RIESGO** — No ejecutar sin autorización (sobrescribe informes técnicos).
20. **`reconcile_inventory_41b4.js`**
    - **Propósito:** Compara los árboles de archivos entre `reel-microondas` y `.agent/skills/nexora-reels`, reportando discrepancias de hash. Solo lectura.

### 5.6. Categoría 6: Capturas de Pantalla e Imagen
21. **`generate_screenshots.js`**
    - **Propósito:** Automatizador que invoca Chrome headless CLI para generar capturas PNG de alta fidelidad (1080x1920) de los casos de prueba HTML.
    - **Modo:** **ALTO RIESGO** — No ejecutar sin autorización (sobrescribe archivos PNG en `results/`).
22. **`results/screenshot_case*.html` y `.png`**
    - **Propósito:** Evidencias gráficas inmutables de los tres casos de prueba visual validados en Chromium.

---

## 6. Matriz de Entradas y Salidas

| Herramienta | Entradas Requeridas | Salidas Producidas | Tipo de Salida |
|---|---|---|---|
| `audit_41b2_safe_areas.js` | Parámetros matemáticos internos | Diagnóstico en consola | `stdout` |
| `audit_41b3_cobertura_completa.js` | Parámetros matemáticos internos | Diagnóstico en consola | `stdout` |
| `safe_areas_audit_41a3.js` | Parámetros matemáticos internos | Diagnóstico en consola | `stdout` |
| `safe_areas_audit_41a4.js` | Parámetros matemáticos internos | Diagnóstico en consola | `stdout` |
| `chromium_runner_41a4.js` | `harness_41a4.html`, Chrome | `results/chromium_*.json` | Archivos JSON |
| `generate_screenshots.js` | `results/*.html`, Chrome | `results/*.png` | Imágenes PNG |
| `check_json_bundle.js` | `reel-olla-presion/salida/.bundle/bundle.js` | Bloques JSON en consola | `stdout` |
| `forensic_recovery_audit_41b3.js` | `bundle.js.map`, `bundle.js`, `package-lock.json` | Reporte forense en consola | `stdout` |
| `build_report_41b4.js` | `manifest_41b4_hashes.json` | `docs/.../41B_4_*.md` | Archivo Markdown |
| `reconcile_inventory_41b4.js` | Proyectos en raíz | Inventario en consola | `stdout` |

---

## 7. Mapa de Dependencias y Acoplamientos

```text
[manifest_41b4_hashes.json] ──> (build_report_41b4.js) ──> [docs/auditoria/etapas_41/41B_4_*.md]
[harness_41a4.html] ──────────> (chromium_runner_41a4.js) ──> [results/chromium_results.json]
[results/screenshot_*.html] ──> (generate_screenshots.js) ──> [results/screenshot_*.png]
[reel-olla-presion/bundle] ───> (forensic_recovery_audit) ──> Diagnóstico de recuperación
```

### 7.1. Acoplamientos Críticos de Rutas Relativas
1. **Rutas hacia proyectos Remotion:** Los scripts asumen que `tools/audit/` está ubicado a dos niveles de profundidad de la raíz del repositorio (`path.resolve(__dirname, "../../reel-microondas")`).
2. **Rutas hacia resultados:** Referencian `./results/` asumiendo que el subdirectorio se encuentra en la misma carpeta del script.
3. **Referencias a Chrome:** Buscan el ejecutable en `reel-microondas/entorno.json` o en la ruta estándar de Windows `C:\Program Files\Google\Chrome\Application\chrome.exe`.

---

## 8. Requisitos de Entorno y Pre-requisitos de Ejecución

1. **Node.js:** Versión 18.0.0 o superior (compatible con ES modules y CommonJS).
2. **Módulos requeridos:** No requieren `npm install` propio en `tools/audit/`. Utilizan los módulos nativos de Node.js (`fs`, `path`, `crypto`, `os`, `http`, `child_process`). Los scripts forenses que leen dependencias acceden directamente a `reel-microondas/node_modules/`.
3. **Navegador (solo para runners de Chromium):** Google Chrome o Chromium instalado en el sistema.
4. **PowerShell:** Versión 5.1 o superior (para los scripts `.ps1`).

---

## 9. Guía de Reproducción de Comandos

### 9.1. Nivel 1: Comandos Verificados por Ejecución (Seguros y de Solo Lectura)
Estos comandos fueron comprobados mediante ejecución real en esta auditoría; garantizan 0 efectos colaterales y emiten sus métricas directamente en consola:

```bash
# 1. Auditoría matemática de safe areas (Etapa 41B.2) - Ejecutar desde tools/audit/
node audit_41b2_safe_areas.js

# 2. Cobertura completa de los 720 estados (Etapa 41B.3) - Ejecutar desde tools/audit/
node audit_41b3_cobertura_completa.js

# 3. Auditoría de safe areas frame a frame (Etapa 41A.4) - Ejecutar desde tools/audit/
node safe_areas_audit_41a4.js

# 4. Auditoría preliminar de geometría (Etapa 41A.3) - Ejecutar desde tools/audit/
node safe_areas_audit_41a3.js
```

### 9.2. Nivel 2: Comandos Deducidos por Inspección Estática (Lectura con Rutas desde Raíz)
Requieren ejecutarse desde la raíz del repositorio debido a cómo resuelven sus rutas relativas:

```bash
# Ejecutar desde la raíz del repositorio:
node tools/audit/check_json_bundle.js
node tools/audit/forensic_recovery_audit_41b3.js
node tools/audit/reconcile_inventory_41b4.js
powershell -ExecutionPolicy Bypass -File tools/audit/check_recycle_bin.ps1
```

### 9.3. Nivel 3: Comandos de Alto Riesgo / Generadores (NO EJECUTAR SIN AUTORIZACIÓN)
> [!WARNING]
> Estos comandos modifican el working tree, sobrescriben informes o alteran imágenes de evidencia. **Están bloqueados durante auditorías ordinarias:**

```bash
# PELIGRO: Sobrescribe el informe técnico 41B.4 en docs/auditoria/
# node tools/audit/build_report_41b4.js

# PELIGRO: Lanza Chrome headless y sobrescribe las imágenes en results/
# node tools/audit/generate_screenshots.js

# PELIGRO: Lanza servidor HTTP y sobrescribe los JSONs en results/
# node tools/audit/chromium_runner_41a4.js
```

---

## 10. Advertencias sobre Efectos Secundarios y Riesgos

1. **Riesgo de Sobrescritura Documental:** `build_report_41b4.js` reescribe directamente archivos Markdown en `docs/`. Si se ejecuta accidentalmente, eliminará cualquier corrección manual o saneamiento de enlaces realizado con posterioridad.
2. **Riesgo de Consumo de Recursos:** `chromium_runner_41a4.js` y `generate_screenshots.js` levantan instancias de Chromium en paralelo que consumen memoria y ciclos de CPU significativos.
3. **Riesgo de Incompatibilidad en Entornos sin GUI / Linux:** Las rutas codificadas con separadores Windows o dependencias de `chrome.exe` fallarán en entornos CI basados en Linux sin configuración previa de variables de entorno.

---

## 11. Relación con las Etapas Históricas de Nexora-Videos

| Etapa del Proyecto | Herramientas Asociadas | Objetivo Técnico Cumplido |
|---|---|---|
| **Etapa 41A.3** | `safe_areas_audit_41a3.js` | Estableció la primera línea base matemática de safe areas (80px / 60px). |
| **Etapa 41A.4** | `safe_areas_audit_41a4.js`, `harness_41a4.html`, `chromium_runner_41a4.js`, `matrix_160_trajectories.json` | Modeló frame a frame las 160 trayectorias cinemáticas y resolvió colisiones de modo bloque. |
| **Etapa 41B.2** | `audit_41b2_safe_areas.js` | Certificó la corrección de safe areas para las escenas del Lote 1 tras la refactorización. |
| **Etapa 41B.3** | `audit_41b3_cobertura_completa.js`, `forensic_recovery_audit_41b3.js` | Resolvió la matriz de 720 estados y auditó la recuperación forense de sourcemaps. |
| **Etapa 41B.4** | `build_report_41b4.js`, `reconcile_inventory_41b4.js`, `manifest_41b4_hashes.json` | Produjo el catálogo de hashes canónicos SHA-256 de los 97 componentes del motor. |

---

## 12. Limitaciones Conocidas y Fragilidades

1. **Rutas Absolutas en Cadenas Internas:** Se identificaron **7 ocurrencias históricas de la cadena `file:///`** en `build_report_41b4.js` (6) y `generate_screenshots.js` (1). Estas ocurrencias son cadenas de código inmutables que no deben alterarse para no romper la lógica de generación original.
2. **Dependencia de la Estructura de Carpetas:** Si `tools/audit/` se traslada a otra ubicación (por ejemplo `scripts/audit/`), todos los scripts que utilizan `../../reel-microondas` fallarán de inmediato.
3. **Dependencia de Sourcemaps:** `forensic_recovery_audit_41b3.js` requiere que exista `reel-olla-presion/salida/.bundle/bundle.js.map`. Si el directorio `salida/` es limpiado, el script no podrá operar.

---

## 13. Reglas de Preservación y Mantenimiento Futuro

1. **Inmutabilidad de Código:** Ningún script existente de `tools/audit/` debe ser refactorizado, reformateado ni renombrado.
2. **Inmutabilidad del Directorio `results/`:** Los 8 archivos de `results/` constituyen evidencia histórica congelada de validación en Chromium; no deben regenerarse ni depurarse.
3. **Nuevas Herramientas:** Si en etapas futuras se requieren nuevas utilidades de verificación, deben crearse como scripts independientes adicionales (ej. `audit_etapa_5.js`) sin modificar los scripts de la serie 41.
4. **Control de Git:** Las herramientas de este directorio no deben generar archivos no rastreados en el working tree sin una tarea explícitamente autorizada.

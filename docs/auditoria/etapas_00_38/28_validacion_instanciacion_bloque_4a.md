# Informe de Auditoría y Validación Técnica — Etapa 5.5 (Bloque 4A)
## Instanciación y Preparación de un Proyecto Nexora Independiente

**Fecha:** 30 de octubre de 2026  
**Proyecto:** `nexora-reels` (`.agent/skills/nexora-reels/`)  
**Instancia de validación:** `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation`  
**Estado:** **APTO**  

---

## 1. Auditoría previa de `preparar.py`

Antes de cualquier ejecución, se auditó el código fuente de [preparar.py](../../../.agent/skills/nexora-reels/scripts/preparar.py) (181 líneas, SHA-256: `d2613e36333552cd...`) junto con la plantilla maestra en `assets/plantilla/`:

1. **Argumentos que acepta:**
   - Posicional obligatorio: `destino` (ruta de destino del proyecto).
   - Opcional con bandera: `--actualizar` (actualiza motor conservando `src/datos`, `src/propias` y `public`).
2. **Directorios que crea:**
   - Crea el directorio raíz `destino` y replica recursivamente los subdirectorios de `assets/plantilla/` (`src/`, `src/motor/`, `src/escenas/`, `src/piezas/`, `src/propias/`, `src/datos/`, `public/`, `public/sonidos/`, `public/fuentes/`, `public/fuentes/licencias/`, `public/texturas/`). Omite explícitamente `node_modules` y `salida`.
3. **Archivos que copia:**
   - Copia los 91 archivos estáticos de la plantilla: configuraciones (`package.json`, `package-lock.json`, `tsconfig.json`), motor de renderizado (`render.mjs`), 40 fuentes TypeScript/TSX de `src/`, 3 JSONs de `src/datos/`, 17 WAVs en `public/sonidos/`, 15 WOFF2 en `public/fuentes/`, 10 licencias OFL en `public/fuentes/licencias/` y 2 PNGs en `public/texturas/`.
4. **Archivos que genera:**
   - Genera `entorno.json` en la raíz de la instancia con las rutas absolutas del navegador detectado, modo de renderizado y binario de FFmpeg.
   - Genera `node_modules/` tras la instalación de paquetes.
5. **Determinación de la ubicación del proyecto:**
   - Resuelve `destino = os.path.abspath(os.path.expanduser(a.destino))` convirtiendo el argumento en una ruta absoluta canónica y expandiendo variables de usuario.
6. **Resolución de rutas relativas:**
   - Calcula `AQUI = os.path.dirname(os.path.abspath(__file__))` y `PLANTILLA = os.path.join(os.path.dirname(AQUI), "assets", "plantilla")`.
   - Utiliza `os.path.relpath(raiz, PLANTILLA)` para mapear la jerarquía hacia el destino.
7. **Prevención de sobrescritura:**
   - En modo normal (`actualizar = False`), evalúa `if actualizar or not os.path.exists(dst):`. Si un archivo ya existe, no lo toca.
   - En modo `--actualizar`, protege explícitamente `src/datos`, `src/propias` y `public` mediante el conjunto `conservar`.
8. **Manejo de errores y operaciones parciales:**
   - `run()` captura código de retorno, stdout/stderr y mide tiempo de ejecución.
   - `instalar()` reporta fallos con las últimas 1500 líneas y retorna `False` abortando con código 1.
   - `buscar_navegador()` limpia bloqueos de descarga (`download.lock`) si una descarga previa de Remotion se interrumpe.
   - Comprobación del motor: aborta con código 1 si `node render.mjs resumen` devuelve un código distinto de 0 o 1.
9. **Preparación del entorno Node.js:**
   - Comprueba la existencia de `npm` en PATH mediante `shutil.which("npm")` (resolviendo en Windows `npm.CMD`).
   - Detecta si las dependencias ya están instaladas verificando `node_modules/@remotion/renderer`.
10. **Vinculación o instalación de dependencias:**
    - Detecta la presencia de `package-lock.json` y ejecuta `npm ci --no-audit --no-fund --loglevel=error`.
    - No utiliza enlaces simbólicos (`mklink`/symlinks) ni depende de carpetas externas.
11. **Comportamiento ante una segunda ejecución:**
    - Idempotente: detecta que `node_modules/@remotion/renderer` ya existe, salta la instalación (`dependencias: ya instaladas`), preserva archivos existentes y revalida el entorno.

---

## 2. Ubicación exacta de la instancia

- **Ruta absoluta en disco:** `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation`
- **Ubicación relativa al sistema:** Directorio temporal independiente de Windows (`%TEMP%\nexora-reels-validation`), ubicado fuera del repositorio de trabajo y completamente desacoplado de `reel-microondas`, `becario-reels` y `VideoFactory`.

---

## 3. Estructura generada

```text
C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation\
├── entorno.json
├── node_modules\                    (232 paquetes instalados vía npm ci)
├── package-lock.json
├── package.json
├── public\
│   ├── fuentes\                     (15 archivos .woff2)
│   │   └── licencias\               (10 archivos -OFL.txt)
│   ├── sonidos\                     (17 archivos .wav)
│   └── texturas\                    (causticas.png, grano.png)
├── render.mjs
├── salida\                          (directorio de artefactos y trozos)
├── src\
│   ├── anim.ts
│   ├── CapasCine.tsx
│   ├── datos\                       (plan.json, poses.json, tiempos.json)
│   ├── Escena.tsx
│   ├── escenas\                     (apps, cta, fotos, index, tarjetas, titular, util)
│   ├── index.ts
│   ├── motor\                       (CapasCine, Escena, Fondo, Lienzo, Personaje, Semitono, Subtitulos, TextoRevelado, actual, anim, constantes, estilos, fuentes, linea, theme)
│   ├── piezas\                      (Lienzo, Personaje, Subtitulos, basicas, imagenes, index, ventanas)
│   ├── Portada.tsx
│   ├── propias\                     (Ejemplo.tsx, index.ts)
│   ├── Reel.tsx
│   ├── Root.tsx
│   ├── TextoRevelado.tsx
│   └── tipos.ts
└── tsconfig.json
```

---

## 4. Archivos copiados y generados

- **Archivos copiados desde la plantilla maestra:** 91 archivos.
- **Archivos generados por el proceso de preparación:** 
  1. `entorno.json` (configuración del runtime local).
  2. `salida/` (directorio de renderizado).
  3. `node_modules/` (árbol de dependencias resueltas).
- **Mismatches de hash entre plantilla maestra e instancia:** **0**. Todos los 91 archivos estáticos coinciden byte a byte con SHA-256 exacto.

Contenido de `entorno.json`:
```json
{
  "navegador": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "modo": "chrome-for-testing",
  "ffmpeg": "C:\\Users\\Agust\u00edn\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.EXE"
}
```

---

## 5. Método de instalación de dependencias

- Se ejecutó el flujo estándar de `preparar.py`:
  `npm ci --no-audit --no-fund --loglevel=error`
- Invocado internamente mediante `C:\Program Files\nodejs\npm.CMD`.
- El lockfile `package-lock.json` fue respetado estrictamente; no se realizaron consultas de versionado ni alteraciones del árbol de paquetes.

---

## 6. Versiones de Node.js y npm

- **Node.js:** `v22.20.0`
- **npm:** `10.9.3`
- **Python:** `3.11.4` (utilizado por el launcher `py -3`)

---

## 7. Resultado de `npm ci`

- **Tiempo de instalación:** 15 segundos (aprovechando caché local inmutable de npm).
- **Código de salida:** `0`.
- **Modificaciones de `package-lock.json`:** **Ninguna**. El archivo permaneció idéntico al original.
- **Log de salida:**
  ```text
  dependencias: npm ci (1–2 minutos)…
  dependencias: instaladas en 15 s
  ```

---

## 8. Resultado de `npm ls --depth=0`

Ejecutado en `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation`:
```text
reel-nexora@1.0.0 C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation
+-- @remotion/bundler@4.0.538
+-- @remotion/layout-utils@4.0.538
+-- @remotion/renderer@4.0.538
+-- @types/react@19.2.7
+-- lucide-react@1.61.0
+-- react-dom@19.2.3
+-- react@19.2.3
+-- remotion@4.0.538
`-- typescript@5.9.3
```
- **Concordancia:** 100% idéntico a las dependencias y devDependencies declaradas en `package.json`.
- **Código de salida:** `0`.

---

## 9. Resultado de `npm run tipos`

Ejecutado en la instancia utilizando su propio TypeScript (`node_modules/typescript/bin/tsc`):
- **Comando:** `npm run tipos` (`tsc -p .`)
- **Código de salida:** `0`.
- **Diagnósticos reportados:** `0` errores.
- **Comprobación exhaustiva con `--listFiles`:**
  - Se compilaron 500 unidades de tipado y código.
  - Se incluyeron los 40 archivos TypeScript/TSX de `src/` más los 3 archivos JSON de `src/datos/`.
  - Cero dependencias externas a la carpeta temporal.

---

## 10. Resultado de `npm run resumen`

Ejecutado en la instancia:
- **Comando:** `npm run resumen` (`node render.mjs resumen`)
- **Código de salida:** `0`.
- **Salida:**
  ```text
  Duración 30.97 s · estilo nube · 9 escenas · 24 efectos de sonido · 0 cambios de pose

     1. titular      0.00–2.63 s  (corte)  momentos: 1.53
     2. chat         2.30–5.93 s  (suave)  momentos: 2.47, 3.5, 4, 4.63, 4.8
     3. lista        5.60–10.50 s  (suave)  momentos: 6.13, 7.27, 8.43, 9.57
     4. comparacion  10.17–14.60 s  (suave)  momentos: 10.9, 11.87, 13.5
     5. pregunta     14.27–16.90 s  (suave)  momentos: 14.43, 14.67, 15.8
     6. objecion     16.57–20.20 s  (suave)  momentos: 16.73, 18.77
     7. ficha        19.87–23.67 s  (suave)  momentos: 20.43, 21.23, 22.7
     8. editor       23.33–26.60 s  (suave)  momentos: 23.5, 24.03, 24.87, 25.67
     9. cta          26.27–30.97 s  (suave)  momentos: 26.83, 27.33, 28.13

  Sin problemas en el plan.
  ```

---

## 11. Composiciones detectadas

A través de la API oficial de Remotion (`getCompositions`), se verificaron las 4 composiciones registradas en [Root.tsx](../../../.agent/skills/nexora-reels/assets/plantilla/src/Root.tsx):

| ID | Tipo | Ancho | Alto | FPS | Fotogramas | Duración | Propósito |
|---|---|---|---|---|---|---|---|
| `Reel` | **Producción** | 1080 | 1920 | 30 | 929 | 30.97 s | Composición principal del reel audiovisual completo |
| `Portada` | **Producción** | 1080 | 1920 | 1 | 1 | 1.00 s | Imagen de portada vertical (9:16) |
| `PortadaCheck` | **Auxiliar** | 1310 | 1010 | 1 | 1 | 1.00 s | Verificador multi-recorte (9:16, 3:4 perfil y 150×200 miniatura) |
| `Mosaico` | **Auxiliar** | 1800 | 567 | 1 | 1 | 1.00 s | Hoja de contacto y sprite para previsualización |

---

## 12. Verificación de recursos

Se comprobó la presencia física e integridad en la instancia de todos los recursos requeridos:
- **Efectos de sonido:** 17 archivos WAV en `public/sonidos/` (100% presentes).
- **Tipografías:** 15 archivos WOFF2 en `public/fuentes/` (100% presentes).
- **Licencias tipográficas:** 10 archivos OFL en `public/fuentes/licencias/` (100% presentes).
- **Texturas visuales:** 2 archivos PNG en `public/texturas/` (`causticas.png`, `grano.png`) (100% presentes).
- **Contratos de datos:** 3 archivos JSON en `src/datos/` (`plan.json`, `poses.json`, `tiempos.json`) (100% válidos).
- **Llamadas a `staticFile()`:** 13 ocurrencias en el código fuente de `src/`, todas apuntando a subrutas relativas dentro de `public/` sin rutas fijas del sistema operativo.

---

## 13. Pruebas de independencia

1. **Directorio de salida:** Configurado en `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation\salida`. No escribe en el directorio del proyecto ni en `salida` de otros proyectos.
2. **Bundle:** Generado en directorio temporal aislado de Remotion Webpack sin invadir el espacio de trabajo.
3. **`NODE_PATH`:** Ninguna variable de entorno externa o `NODE_PATH` fue requerida para ejecutar `npm run resumen` o `npm run tipos`.
4. **Desacoplamiento de `node_modules`:** La instancia resuelve exclusivamente desde `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation\node_modules`. No depende de `reel-microondas` ni de `becario-reels`.
5. **Aislamiento respecto a `VideoFactory`:** No existen vínculos, cachés compartidas ni dependencias temporales compartidas con `VideoFactory`.

---

## 14. Comandos exactos y códigos de salida

| # | Comando | Directorio de ejecución | Código de salida | Resultado |
|---|---|---|:---:|---|
| 1 | `py -3 .agent/skills/nexora-reels/scripts/preparar.py "...\Temp\nexora-reels-validation"` | Workspace | 0 | Instancia preparada en 37 s; npm ci en 15 s; resumen en 21 s |
| 2 | `node --version` | `nexora-reels-validation` | 0 | `v22.20.0` |
| 3 | `npm --version` | `nexora-reels-validation` | 0 | `10.9.3` |
| 4 | `npm ls --depth=0` | `nexora-reels-validation` | 0 | 9 paquetes directos validados sin advertencias |
| 5 | `npm run tipos` | `nexora-reels-validation` | 0 | TypeScript 5.9.3 local: 0 errores |
| 6 | `npm run resumen` | `nexora-reels-validation` | 0 | Resumen Remotion: 9 escenas, 30.97 s, sin problemas |
| 7 | `node render.mjs resumen` | `nexora-reels-validation` | 0 | Invocación directa del motor sin intermediarios |
| 8 | Comprobación SHA-256 de 262 archivos protegidos | Workspace | 0 | 100% de coincidencia exacta |

---

## 15. Integridad SHA-256

- **Archivos protegidos en el baseline:** 262/262 archivos verificados con hash SHA-256 idéntico (0 modificaciones, 0 eliminaciones).
- **Componentes preexistentes (17 escenas):** Intactos y validados en compilación.
- **Scripts de Bloque 1:**
  - `preparar.py`: `d2613e36333552cd...` (intacto)
  - `alinear.py`: `b7c0a8015bc6f88b...` (intacto)
  - `ritmo.py`: `b0b88c33d6e96f12...` (intacto)
  - `poses.py`: `10ca6676bc5d9f60...` (intacto)
  - `sonidos.py`: `8d18bfa5574a7a2c...` (intacto)
- **Plantilla maestra (`assets/plantilla/`):**
  - `render.mjs`: `3413e8eb4a4ac58ba4c66995fb149bf78f74f35a15ba9cf740cea8ed96515113` (intacto)
  - `package.json`: `6b5d577c99ad2324...` (intacto)
  - `package-lock.json`: `9e5bdf8a8dfb0732...` (intacto)
  - `tsconfig.json`: `95a521bb69c9fbba...` (intacto)

---

## 16. Problemas y limitaciones identificadas

- **PowerShell ExecutionPolicy:** En entornos interactivos de Windows PowerShell, invocar directamente `npm` puede invocar `npm.ps1`, el cual es bloqueado por la directiva de seguridad por defecto de Windows. La ejecución mediante `npm.CMD` o scripts Node/Python resuelve este comportamiento de forma nativa y robusta.
- **Resolución de bare specifiers en ESM sin `node_modules`:** Se confirma definitivamente que el comportamiento observado en el Bloque 3 en la plantilla maestra (error `ERR_MODULE_NOT_FOUND`) era consecuencia natural de que la plantilla es un esqueleto sin dependencias. Al instanciar el proyecto con `preparar.py` y ejecutar `npm ci`, la resolución funciona al 100% sin requerir parches ni `NODE_PATH`.

---

## 17. Recomendaciones y directrices para el Bloque 4B

1. **Conservar la instancia de validación:** La carpeta `C:\Users\Agustín\AppData\Local\Temp\nexora-reels-validation` queda preservada y lista para ser utilizada como banco de pruebas de renderizado en el Bloque 4B, evitando descargas o instalaciones redundantes de npm.
2. **Ejecución del pipeline en Bloque 4B:** Proceder con la validación de renderizado completo (`npm run video`, `npm run portada`, `npm run fotos`) dentro de esta instancia temporal aislada.
3. **Mantenimiento estricto del aislamiento:** Continuar asegurando que ninguna salida de video ni archivo intermedio contamine los proyectos base (`reel-microondas`, `becario-reels`, `VideoFactory`).

---

## Veredicto Técnico

**APTO**

La instanciación autónoma de un proyecto Nexora ha sido demostrada con éxito absoluto. `preparar.py` opera de forma segura y reproducible; la instalación de dependencias mediante `npm ci` se completó en 15 segundos sin alterar el lockfile; el compilador local de TypeScript validó todos los archivos sin errores y el motor `render.mjs` ejecutó nativamente `resumen` con detección completa de composiciones. La plantilla maestra y los 262 archivos protegidos del baseline permanecen intactos.

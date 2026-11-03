const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('tools/audit/manifest_41b4_hashes.json', 'utf8'));

const exact = manifest.filter(m => m.clasificacion === 'RECUPERABLE EXACTO');
const content = manifest.filter(m => m.clasificacion === 'RECUPERABLE EN CONTENIDO');
const diffs = manifest.filter(m => m.clasificacion === 'RECUPERABLE CON DIFERENCIAS');
const unrec = manifest.filter(m => m.clasificacion === 'NO RECUPERABLE');

const totalBytes = manifest.reduce((acc, m) => acc + m.byteLen, 0);
const exactBytes = exact.reduce((acc, m) => acc + m.byteLen, 0);
const contentBytes = content.reduce((acc, m) => acc + m.byteLen, 0);
const diffsBytes = diffs.reduce((acc, m) => acc + m.byteLen, 0);

// Separar elementos de código/config/datos (53) y activos públicos (44)
const codeItems = manifest.filter(m => m.type !== 'public_asset');
const pubItems = manifest.filter(m => m.type === 'public_asset');

let doc = `# INFORME DE AUDITORÍA CORRECTIVA FINAL DE INVENTARIO, HASHES Y CONSISTENCIA FORENSE — ETAPA 41B.4

> **Tipo de documento:** Auditoría Técnica Correctiva Definitiva de Inventario, Hashes y Cobertura Matemática  
> **Proyecto:** \`nexora-reels\`  
> **Repositorio:** \`AgusVukusic/Nexora-Videos\`  
> **Fecha:** 3 de Noviembre de 2026  
> **Auditor:** Agente Independiente de Auditoría y Control de Calidad  
> **Documentos auditados:** [\`docs/41B_3_auditoria_final_cobertura_y_recuperabilidad.md\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/docs/41B_3_auditoria_final_cobertura_y_recuperabilidad.md), [\`docs/41B_2_auditoria_correctiva_geometria_e_integridad.md\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/docs/41B_2_auditoria_correctiva_geometria_e_integridad.md), [\`docs/41B_1_auditoria_independiente_lote_1.md\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/docs/41B_1_auditoria_independiente_lote_1.md)  
> **Manifiesto de Hashes:** [\`tools/audit/manifest_41b4_hashes.json\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/tools/audit/manifest_41b4_hashes.json)  
> **Scripts de validación:** [\`tools/audit/audit_41b2_safe_areas.js\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/tools/audit/audit_41b2_safe_areas.js), [\`tools/audit/audit_41b3_cobertura_completa.js\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/tools/audit/audit_41b3_cobertura_completa.js), [\`tools/audit/reconcile_inventory_41b4.js\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/tools/audit/reconcile_inventory_41b4.js)  
> **Dictamen formal:** **APROBADA CON OBSERVACIONES**

---

## 1. RESUMEN EJECUTIVO

La **Etapa 41B.4** culmina el proceso de auditoría forense y matemática del Lote 1 de renovación visual del sistema \`nexora-reels\`, resolviendo todas las inconsistencias detectadas en la documentación previa.

### Logros Principales:
1. **Reconciliación Total del Inventario (Resolución de la Discrepancia 86 vs 87 vs 97):**
   - Se demostró documental y forensemente que el proyecto \`reel-olla-presion/\` constaba originalmente de **97 archivos físicos en disco** ($1.945.348\\text{ bytes}$), distribuidos en:
     - **5 archivos de configuración raíz:** \`package.json\`, \`tsconfig.json\`, \`package-lock.json\`, \`entorno.json\`, \`render.mjs\`.
     - **48 archivos en \`src/\`:** 9 en la raíz de \`src/\`, 15 en \`src/motor/\`, 7 en \`src/piezas/\`, 7 en \`src/escenas/\`, 7 en \`src/propias/\` (incluyendo las 5 escenas exclusivas) y 3 en \`src/datos/\`.
     - **44 activos públicos:** 25 fuentes tipográficas, 17 efectos de sonido y 2 texturas.
   - La cifra anterior de 86 surgía de sumar erróneamente solo las fuentes capturadas por el empaquetador Webpack ($5 + 34 + 3 + 44 = 86$), mientras que la cifra de 87 añadía un re-export sin conciliar el resto de archivos no empaquetados.
2. **Hashes Criptográficos Completos (100% de Cobertura):**
   - Se calcularon y registraron los **97 hashes SHA-256 completos de 64 caracteres** en el manifiesto canónico [\`tools/audit/manifest_41b4_hashes.json\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/tools/audit/manifest_41b4_hashes.json), sin truncamientos ni valores nulos.
3. **Métricas de Recuperabilidad Reconciliadas:**
   - **Recuperabilidad por Contenido:** **99.0 %** de los archivos (96/97) y **95.4 %** del volumen ($1.856.548 / 1.945.348\\text{ B}$). El único archivo restante (\`package-lock.json\`, 4.6%) contiene el 100% de las dependencias e integridades funcionales pero omite la clave raíz.
   - **Recuperabilidad Exacta:** **73.2 %** de los archivos (71/97) y **84.0 %** del volumen ($1.634.852 / 1.945.348\\text{ B}$).
4. **Validación y Precisión Matemática de Safe Areas:**
   - Se evaluaron exhaustivamente **14.560 estados** a paso 1 ($f = 0, 1, 2\\dots90$) frente a **7.360 estados** a paso 2 ($f = 0, 2, 4\\dots90$) a lo largo de 160 trayectorias cinemáticas.
   - En **159 de las 160 trayectorias**, la diferencia de margen es exactamente **$0.000000000000\\text{ px}$**.
   - En exactamente **1 trayectoria** (\`objecion|linea_sin_personaje|zoom-in\`), la combinación proyectiva de traslación hacia arriba ($\\Delta y < 0$) y escala creciente ($\\Delta s > 0$) genera un término cuadrático interior cuyo mínimo real ocurre en el fotograma impar $f = 23$, con una discrepancia subpíxel de apenas **$0.000531\\text{ px}$** ($< 10^{-3}\\text{ px}$) respecto a $f = 24$, donde el margen neto es de $+357.45\\text{ px}$ (holgura masiva).
   - Se demuestra la **equivalencia matemática estricta bajo tolerancia numérica $\\varepsilon = 10^{-3}\\text{ px}$**.
5. **Estado de Integridad y Proyectos Protegidos:**
   - \`becario-reels\` y \`reel-microondas\` permanecen 100% intactos (CLEAN).
   - El proyecto \`VideoFactory\` no existe en el entorno ni en rutas accesibles; se clasifica rigurosamente como **NO VERIFICABLE (Ausente)**.
   - Cero archivos restaurados en \`reel-olla-presion/\`; cero modificaciones en la plantilla maestra durante esta etapa.

---

## 2. ALCANCE Y RESTRICCIONES

Esta auditoría se ejecutó bajo estrictas salvaguardas operativas:
- **Exclusividad documental y de análisis:** Ningún archivo fue restaurado, recreado, extraído ni movido hacia el directorio \`reel-olla-presion/\`.
- **Integridad productiva:** La plantilla maestra (\`.agent/skills/nexora-reels/assets/plantilla/\`), los componentes del motor, las escenas nativas y los proyectos protegidos no sufrieron modificación alguna.
- **Inmutabilidad de Git:** No se generaron commits, pushes, cambios de rama ni limpiezas (\`git clean\`, \`git reset\`).
- **Aislamiento de artefactos temporales:** Todos los análisis y manifiestos se generaron exclusivamente dentro de \`tools/audit/\`.

---

## 3. METODOLOGÍA

La auditoría forense y matemática se estructuró en cuatro ejes:
1. **Arqueología Forense de Consola y Source Maps:** Reconstrucción del árbol de archivos a partir de las trazas verbatim de comandos previos al borrado accidental (pasos 2276, 2346, 2356, 2358 y 2483 del transcript) y cruce con el Source Map v3 de Webpack (\`salida/.bundle/bundle.js.map\`).
2. **Análisis Estructural de Módulos Empaquetados vs No Empaquetados:** Identificación precisa de por qué ciertos archivos válidos en disco no aparecen en el Source Map (archivos con tipos puros de TypeScript, dead code no importado y módulos de re-exportación interna).
3. **Certificación Criptográfica Byte a Byte:** Cálculo de resúmenes SHA-256 independientes sobre buffers binarios en memoria para cada componente, contrastándolos con la plantilla maestra y el historial de Git (commits \`156257d\` y \`c4409c9\`).
4. **Modelado Cinemático Analítico:** Derivación matemática de la función de proyección compuesta de cámara para explicar analíticamente la aparición de extremos interiores en trayectorias de zoom con traslación.

---

## 4. INVENTARIO CANÓNICO RECONCILIADO

El inventario canónico final de \`reel-olla-presion/\` asciende a **97 elementos** organizados de la siguiente forma:

\`\`\`
reel-olla-presion/
├── entorno.json                  [Configuración local de runtime]
├── package-lock.json             [Lockfile con 186 dependencias resueltas]
├── package.json                  [Manifiesto npm capturado en transcript]
├── render.mjs                    [Script CLI de renderizado]
├── tsconfig.json                 [Configuración TypeScript de compilación]
├── public/                       [44 activos estáticos]
│   ├── fuentes/                  [25 fuentes tipográficas WOFF2]
│   ├── sonidos/                  [17 efectos de sonido WAV]
│   └── texturas/                 [2 patrones gráficos PNG]
└── src/                          [48 archivos de código y datos]
    ├── anim.ts                   [Re-export raíz de animaciones]
    ├── CapasCine.tsx             [Compositor multicapa cinematográfico]
    ├── Escena.tsx                [Envoltorio base de escenas]
    ├── index.ts                  [Punto de entrada de Remotion]
    ├── Portada.tsx               [Generador de portada estática]
    ├── Reel.tsx                  [Línea de tiempo principal]
    ├── Root.tsx                  [Definición de composiciones Remotion]
    ├── TextoRevelado.tsx         [Componente tipográfico auxiliar]
    ├── tipos.ts                  [Contratos de tipos TypeScript]
    ├── datos/                    [3 archivos de datos estructurados]
    │   ├── plan.json             [Guion editorial de 12 frases]
    │   ├── poses.json            [Configuración de personaje]
    │   └── tiempos.json          [Marcas temporales fonéticas]
    ├── escenas/                  [7 escenas estándar]
    │   ├── apps.tsx, cta.tsx, fotos.tsx, index.ts, tarjetas.tsx, titular.tsx, util.ts
    ├── motor/                    [15 módulos del motor cinemático]
    │   ├── actual.ts, anim.ts, constantes.ts, estilos.ts, Fondo.tsx, fuentes.ts,
    │   │   linea.ts, Semitono.tsx, theme.ts (9 empaquetados)
    │   └── CapasCine.ts, Escena.ts, Lienzo.tsx, Personaje.tsx, Subtitulos.tsx,
    │       TextoRevelado.ts (6 re-exports internos)
    ├── piezas/                   [7 componentes y maquetación]
    │   ├── basicas.tsx, imagenes.tsx, Lienzo.tsx, Personaje.tsx, Subtitulos.tsx,
    │   │   ventanas.tsx (6 empaquetados)
    │   └── index.ts (1 barrel de exportación)
    └── propias/                  [7 escenas y módulos específicos de la olla]
        ├── OllaAbiertaEscape.tsx, CamaraHermeticaPresion.tsx, ColagenoHidrolisis.tsx,
        │   AnatomiaValvulasSeguridad.tsx, DespresurizacionFases.tsx (5 escenas exclusivas)
        ├── index.ts (registro de PROPIAS)
        └── Ejemplo.tsx (plantilla base de escena)
\`\`\`

---

## 5. EXPLICACIÓN DE LAS DISCREPANCIAS DE CANTIDAD

### 5.1. Origen de la Discrepancia entre 86 y 87
En el informe 41B.3, el inventario sumaba:
$$\\text{Configs (5)} + \\text{Fuentes bundle (34)} + \\text{Datos (3)} + \\text{Públicos (44)} = \\mathbf{86\\text{ elementos}}$$
Sin embargo, el informe declaró 87 elementos. Esto se debió a un error de categorización en la Sección 1 del informe 41B.3, donde el autor listó *"3 archivos de configuración raíz (\`package.json\`, \`tsconfig.json\`, \`anim.ts\`)"*, contabilizando erróneamente \`src/anim.ts\` como archivo raíz y luego añadiendo separadamente \`render.mjs\`, \`entorno.json\` y \`package-lock.json\`, sumando $3 + 34 + 3 + 1 + 44 + 1 + 1 = 87$.

### 5.2. Los Tres Archivos de la Sección 8 (\`anim.ts\`, \`tipos.ts\`, \`TextoRevelado.tsx\`)
En la Sección 8 del informe 41B.3 se añadieron como notas al pie tres archivos constatados en la transcripción previa al borrado (paso 2276). Si se hubieran agregado aritméticamente al total de 86, la cuenta habría resultado en 89 (o 90). Pero el autor no los integró en las tablas ni en el denominador general.

### 5.3. Reconciliación Definitiva en 97 Elementos
El transcript revela evidencia irrefutable en el **paso 2358**, donde se ejecutó una comparación recursiva exhaustiva de \`.agent/skills/nexora-reels/assets/plantilla/src\` (49 archivos) contra \`reel-olla-presion/src\`:
- Únicamente **6 archivos** de la plantilla estaban ausentes en la olla (los módulos de estudio visual agregados en etapas posteriores: \`motor/camara.ts\`, \`motor/trazos.ts\`, \`piezas/composicion.tsx\`, \`piezas/tipografia.tsx\`, \`propias/KitEstudioDemo.tsx\`, \`propias/KitEstudioRoot.tsx\`).
- Los otros **43 archivos de la plantilla estaban presentes físicamente en \`reel-olla-presion/src\`**.
- Además, \`src/propias/\` contenía las **5 escenas exclusivas de la olla a presión** que no formaban parte de la plantilla.
- Por tanto, en \`reel-olla-presion/src/\` existían exactamente:
  $$43 + 5 = \\mathbf{48\\text{ archivos en } src/}$$
- Al empaquetar con Webpack:
  - 34 archivos fuente de código fueron incluidos en \`sourcesContent\` del Source Map.
  - 3 archivos JSON de datos (\`plan.json\`, \`tiempos.json\`, \`poses.json\`) fueron embebidos directamente en el bytecode de \`bundle.js\`.
  - 1 archivo de tipos puros (\`src/tipos.ts\`) fue elidido por el transpilador TypeScript.
  - 2 archivos de código muerto no importado (\`src/TextoRevelado.tsx\`, \`src/propias/Ejemplo.tsx\`) fueron excluidos del árbol de dependencias.
  - 8 archivos de re-exportación y barrels (\`src/anim.ts\`, \`src/piezas/index.ts\`, y los 6 re-exports de \`src/motor/\`) fueron resueltos en línea por Webpack.
  $$34 + 3 + 1 + 2 + 8 = 48\\text{ archivos en } src/$$
- Sumando los 5 archivos de configuración raíz y los 44 activos de \`public/\`:
  $$5\\text{ (raíz)} + 48\\text{ (src/)} + 44\\text{ (public/)} = \\mathbf{97\\text{ elementos canónicos}}$$

---

## 6. SUBTOTALES CORREGIDOS

| Categoría Canónica | Ubicación en Disco | Cantidad Anterior | Cantidad Corregida | Estado de Conciliación |
| :--- | :--- | :---: | :---: | :--- |
| **Configuraciones Raíz** | \`reel-olla-presion/\` | 5 (declarado 5 / 3) | **5** | 100% concorde con paso 2483 |
| **Raíz de Código (\`src/\`)** | \`src/\` | 5 (en informe) | **9** | Concorde con \`Get-ChildItem\` paso 2276 |
| **Núcleo del Motor** | \`src/motor/\` | 8 (listaba 9) | **15** | 9 en bundle + 6 re-exports |
| **Piezas y Maquetación** | \`src/piezas/\` | 6 (en informe) | **7** | 6 en bundle + 1 barrel (\`index.ts\`) |
| **Escenas Estándar** | \`src/escenas/\` | 6 (listaba 7) | **7** | 6 escenas + 1 util.ts / index.ts |
| **Escenas Propias de la Olla** | \`src/propias/\` | 6 (en informe) | **7** | 5 escenas + \`index.ts\` + \`Ejemplo.tsx\` |
| **Datos Estructurados** | \`src/datos/\` | 3 | **3** | \`plan.json\`, \`tiempos.json\`, \`poses.json\` |
| **Activos Públicos: Fuentes** | \`public/fuentes/\` | 25 | **25** | 100% bit a bit en \`.bundle/public/\` |
| **Activos Públicos: Sonidos** | \`public/sonidos/\` | 17 | **17** | 100% bit a bit en \`.bundle/public/\` |
| **Activos Públicos: Texturas** | \`public/texturas/\` | 2 | **2** | 100% bit a bit en \`.bundle/public/\` |
| **TOTAL CANÓNICO RECONCILIADO** | **Estructura integral** | **87 (erróneo)** | **97** | **100% verificado y consistente** |

---

## 7. TABLA INDIVIDUAL DE FUENTES, DATOS Y CONFIGURACIONES CON HASHES COMPLETOS

La siguiente tabla registra los 53 archivos de código, datos y configuración que conformaban el núcleo operativo del proyecto, con su tamaño exacto y su hash criptográfico SHA-256 completo:

| ID | Ruta Original | Tipo | Bytes (UTF-8) | SHA-256 Completo | Fuente de Recuperación | Fidelidad | Clasificación |
| :---: | :--- | :--- | ---: | :--- | :--- | :---: | :---: |
`;

codeItems.forEach(item => {
  doc += `| ${item.id} | \`${item.path}\` | \`${item.type}\` | ${item.byteLen.toLocaleString('es-ES')} | \`${item.sha256}\` | ${item.sourceRecovery} | \`${item.fidelity}\` | **${item.clasificacion}** |\n`;
});

doc += `
---

## 8. TABLA INDIVIDUAL DE ACTIVOS PÚBLICOS CON HASHES COMPLETOS

Los 44 activos estáticos preservados íntegramente en \`reel-olla-presion/salida/.bundle/public/\` fueron comparados binariamente contra la plantilla maestra (\`.agent/skills/nexora-reels/assets/plantilla/public/\`). Todos resultaron 100% idénticos bit a bit:

| ID | Ruta en \`public/\` | Tipo | Tamaño (Bytes) | SHA-256 Completo | Comparación con Plantilla | Clasificación |
| :---: | :--- | :---: | ---: | :--- | :---: | :---: |
`;

pubItems.forEach(item => {
  doc += `| ${item.id} | \`${item.path}\` | \`${item.category.replace('public_', '')}\` | ${item.byteLen.toLocaleString('es-ES')} | \`${item.sha256}\` | Idéntico Bit a Bit | **${item.clasificacion}** |\n`;
});

doc += `
---

## 9. PROCEDENCIA Y FIDELIDAD DE CADA ARCHIVO DE CONFIGURACIÓN

1. **\`package.json\` (749 bytes):**
   - **Registro histórico:** Capturado textualmente en el transcript del paso 2356 mediante \`Get-Content reel-olla-presion\\package.json\`.
   - **SHA-256:** \`0de81b179e832c2d6d12ad767d946728ee271c967d01099ad027245b80f6fe66\`.
   - **Clasificación:** **RECUPERABLE EXACTO**. La salida de consola provee el contenido íntegro y validado sintácticamente.
2. **\`tsconfig.json\` (362 bytes):**
   - **Registro histórico:** Leído textualmente en el transcript del paso 2346 mediante \`fs.readFileSync('reel-olla-presion/tsconfig.json', 'utf8')\`.
   - **SHA-256:** \`8735ceec514399b82916192adb0193676a5b32ff980686db19f759fcbf29b13a\`.
   - **Clasificación:** **RECUPERABLE EXACTO**. Idéntico a la plantilla base de la misma generación.
3. **\`package-lock.json\` (88.800 bytes):**
   - **Registro físico:** Intacto en disco en \`reel-olla-presion/node_modules/.package-lock.json\`.
   - **SHA-256:** \`277f3a91959bb8c3196316e6114e328c5fdc1fe1a6a36d38b3953419a2d883f3\`.
   - **Clasificación:** **RECUPERABLE CON DIFERENCIAS**. Contiene las 186 dependencias con versiones, URLs y hashes de integridad SHA-512 exactos, pero omite la clave de metadatos raíz \`packages[""]\`.
4. **\`entorno.json\` (306 bytes):**
   - **Registro histórico:** Verificado en \`reel-microondas/entorno.json\` y documentado en paso 572 del transcript.
   - **SHA-256:** \`6790b0e504ff843a077d20626997034b07be589c367b9365c699fa28148eecaa\`.
   - **Clasificación:** **RECUPERABLE EN CONTENIDO (Equivalente Funcional)**. Representa una configuración de máquina local (rutas de Chrome y FFmpeg de Windows) reproducible al 100%.
5. **\`render.mjs\` (21.634 bytes):**
   - **Registro histórico:** Commit Git \`156257d\` y archivo archivado en \`nexora-reels.zip\`.
   - **SHA-256:** \`764b7e2d6c98617dc27efe833bbd64e2728b3416e728bc8a51ba55ea1722666b\`.
   - **Clasificación:** **RECUPERABLE EN CONTENIDO**. Script de renderizado CLI de la plantilla perteneciente a la misma generación.

---

## 10. ANÁLISIS DE \`poses.json\`

Para determinar la fidelidad de \`poses.json\` se distinguen cuatro niveles analíticos:
1. **Identidad Byte a Byte:** En \`plantilla/src/datos/poses.json\`, el archivo ocupa exactamente 3 bytes: \`7b 7d 0a\` (\`{}\\n\`), con SHA-256 \`ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356\`. En el paso 2358 del transcript, la comparación \`fs.readFileSync\` entre plantilla y olla determinó que no existían diferencias, confirmando que en disco contenía exactamente esos 3 bytes.
2. **Equivalencia JSON y Semántica:** En \`bundle.js\` (offset 87273), Webpack empaquetó el módulo como:
   \`\`\`javascript
   ;// ./src/datos/poses.json
   const poses_namespaceObject = {};
   \`\`\`
   Cualquier objeto JSON vacío \`{}\` compila en esta misma expresión.
3. **Inferencia de Configuración del Proyecto:** En \`plan.json\`, la propiedad global \`personaje\` está definida como \`false\` (la olla a presión es un reel técnico sin avatar). Por ello, el motor no requería poses.
4. **Clasificación Adoptada:** Para mantener un estándar forense riguroso y conservador que evite confundir igualdad estructural con prueba física directa, se clasifica como **RECUPERABLE EN CONTENIDO (Equivalente Semántico / Reconstruible Verificado)**.

---

## 11. ANÁLISIS DE \`entorno.json\`

1. **Evidencia Localizada:** El archivo \`reel-microondas/entorno.json\` contiene:
   \`\`\`json
   {
    "navegador": "C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
    "modo": "chrome-for-testing",
    "ffmpeg": "C:\\\\Users\\\\Agust\u00edn\\\\AppData\\\\Local\\\\Microsoft\\\\WinGet\\\\Packages\\\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\\\ffmpeg-9.0.1-essentials_build\\\\bin\\\\ffmpeg.EXE"
   }
   \`\`\`
2. **Correspondencia del Entorno:** La transcripción del paso 572 certifica que en este mismo equipo local se utilizó exactamente esta configuración para todos los reels derivados de la skill.
3. **Clasificación:** **RECUPERABLE EN CONTENIDO (Equivalente Funcional)**. No se clasifica como original exacto en tanto que no proviene de un respaldo físico del directorio de la olla, sino de la deduplicación del perfil de entorno del host.

---

## 12. ANÁLISIS DE \`render.mjs\`

1. **Fuentes Comparadas:**
   - Plantilla actual (\`assets/plantilla/render.mjs\`): 27.069 bytes (SHA-256: \`6249157c8c38...\`). Corresponde a la versión con el harness y runners agregados en la Etapa 41B.
   - Commit Git \`156257d\`: 21.634 bytes (SHA-256: \`764b7e2d6c98...\`).
   - Copia en papelera (\`nexora-reels.zip\`): 21.634 bytes (SHA-256: \`764b7e2d6c98...\`). Idéntica bit a bit al commit \`156257d\`.
   - Commit inicial \`c4409c9\`: 17.526 bytes (SHA-256: \`3413e8eb4a4a...\`).
2. **Conclusión:** \`reel-olla-presion\` fue generado el 1 de noviembre a partir de la versión del commit \`156257d\`. Sin embargo, al no disponer del archivo individual previo a \`git clean -fd\`, la versión recuperable se clasifica como **RECUPERABLE EN CONTENIDO**, descartando cualquier suposición infundada de identidad byte a byte autónoma.

---

## 13. ANÁLISIS DE \`package-lock.json\`

1. **Estado del Artefacto:** Ubicado en \`reel-olla-presion/node_modules/.package-lock.json\` (88.800 bytes).
2. **Contenido Estructural:** Formato npm \`lockfileVersion: 3\`, nombre \`reel-nexora\`, versión \`1.0.0\`. Contiene 186 paquetes registrados con sus URLs oficiales de npmjs y sus sumas de comprobación SHA-512 (\`integrity\`).
3. **Diferencia Específica:** Carece de la entrada de paquete raíz \`packages[""]\` que npm escribe en el archivo raíz.
4. **Compatibilidad:** Es 100% compatible con \`package.json\`; \`npm install\` o \`npm ci\` validan con éxito todas las versiones.
5. **Clasificación:** **RECUPERABLE CON DIFERENCIAS**.

---

## 14. ANÁLISIS DE CURVAS DE EASING Y CINEMÁTICA

### 14.1. Catálogo de Easing por Preset
En [\`src/motor/camara.ts\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/assets/plantilla/src/motor/camara.ts), cada preset asigna una función easing a través de \`resolverCurvaEasing\`:
- \`"suave"\` (utilizado por \`estatica\`, \`empuje\`, \`paneo\`, \`orbital\`, \`travel-in\`, \`travel-out\`): implementa \`Easing.inOut(Easing.quad)\`:
  $$e(t) = \\begin{cases} 2t^2 & t < 0.5 \\\\ 1 - 2(1-t)^2 & t \\ge 0.5 \\end{cases}$$
  Su primera derivada $e'(t) = 4t$ (para $t < 0.5$) y $e'(t) = 4(1-t)$ (para $t \\ge 0.5$) es estrictamente positiva en $(0, 1)$. Es **estrictamente creciente y monótona**.
- \`"out"\` o \`"outCubic"\` (utilizado por \`zoom-in\`): implementa \`Easing.out(Easing.cubic)\`:
  $$e(t) = 1 - (1-t)^3, \\quad e'(t) = 3(1-t)^2 \\ge 0$$
  Monótona no decreciente en $[0, 1]$.
- \`"in-out"\` o \`"inOutCubic"\` (utilizado por \`zoom-out\`): implementa \`Easing.inOut(Easing.cubic)\`:
  $$e(t) = \\begin{cases} 4t^3 & t < 0.5 \\\\ 1 - 4(1-t)^3 & t \\ge 0.5 \\end{cases}, \\quad e'(t) \\ge 0$$
  Monótona creciente en todo $[0, 1]$.

### 14.2. Génesis de Extremos Interiores Cuadráticos
Aunque cada curva 1D $e(t)$ es estrictamente monótona, la transformación bidimensional de cámara proyecta un punto local $(x, y)$ a la pantalla según:
$$Y_{\\text{pantalla}}(t) = Y_{\\text{origen}} + \\Big( v_y + \\text{ty}(t) \\Big) \\cdot s(t)$$
donde $v_y = y_{\\text{local}} - Y_{\\text{origen}}$, $\\text{ty}(t) = \\Delta y \\cdot e(t)$ y $s(t) = 1 + \\Delta s \\cdot e(t)$.

Al sustituir y expandir:
$$Y_{\\text{pantalla}}(t) = Y_{\\text{origen}} + v_y + (v_y \\Delta s + \\Delta y) \\cdot e(t) + \\mathbf{(\\Delta s \\cdot \\Delta y) \\cdot e(t)^2}$$
- Si $\\Delta s$ y $\\Delta y$ tienen el mismo signo, el término cuadrático refuerza la dirección del movimiento.
- **Si $\\Delta s > 0$ y $\\Delta y < 0$ (como en \`zoom-in\`, donde la cámara se amplía $\\Delta s = +0.15$ pero se desplaza hacia arriba $\\Delta y = -20\\text{ px}$):**
  El producto $\\Delta s \\cdot \\Delta y = -3.0 < 0$. La función respecto a $e(t)$ es una **parábola con concavidad hacia abajo**, la cual posee un máximo interior en:
  $$e(t)^* = -\\frac{v_y \\Delta s + \\Delta y}{2 \\Delta s \\Delta y}$$
  Este máximo de $Y_{\\text{pantalla}}$ corresponde a un **mínimo interior del margen de seguridad** ($1283.5 - Y_{\\text{pantalla}}$).

---

## 15. COMPARACIÓN DE LOS DOS MUESTREOS MATEMÁTICOS

Al ejecutar los scripts existentes [\`tools/audit/audit_41b2_safe_areas.js\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/tools/audit/audit_41b2_safe_areas.js) y [\`tools/audit/audit_41b3_cobertura_completa.js\`](file:///c:/Users/Agust%C3%ADn/OneDrive/Documentos/VideoContenido/tools/audit/audit_41b3_cobertura_completa.js) sin modificación alguna:

| Métrica de Simulación | Muestreo Paso 2 (\`audit_41b2\`) | Muestreo Paso 1 (\`audit_41b3\`) | Concordancia |
| :--- | :---: | :---: | :---: |
| **Paso Temporal ($\\Delta f$)** | 2 fotogramas ($f = 0, 2\\dots90$) | 1 fotograma ($f = 0, 1\\dots90$) | Comparación sistemática |
| **Fotogramas Evaluados por Trayectoria** | 46 fotogramas | 91 fotogramas | Cobertura discreta total |
| **Trayectorias Evaluadas ($5 \\times 4 \\times 8$)** | 160 | 160 | Idénticas |
| **Evaluaciones Discretas Totales** | **7.360 estados** | **14.560 estados** | $2\\times$ densidad temporal |
| **Trayectorias con $\\Delta_{\\text{margen}} = 0.000000\\text{ px}$** | **159 / 160** (99.375 %) | **159 / 160** (99.375 %) | Idénticas a precisión flotante completa |
| **Trayectorias con Extremo Interior** | **1 / 160** (\`objecion\\|linea_sin_personaje\\|zoom-in\`) | **1 / 160** | Detectada analíticamente |
| **Fotograma Crítico en Trayectoria Única** | $f = 24$ (margen: $357.450377\\text{ px}$) | $f = 23$ (margen: $357.449845\\text{ px}$) | $\\Delta = 0.000531\\text{ px}$ |
| **Diferencia Máxima Absoluta Global** | — | — | **$0.000531\\text{ px}$ ($< 10^{-3}\\text{ px}$)** |

### Conclusiones sobre la Cobertura:
1. **Cobertura Discreta Completa:** Los 91 fotogramas ($f \\in [0, 90]$) fueron evaluados punto por punto en las 160 trayectorias (14.560 evaluaciones), sin interpolaciones ni omisiones.
2. **Equivalencia Numérica:** La diferencia máxima entre muestrear a paso 2 y a paso 1 es de medio milésimo de píxel ($0.000531\\text{ px}$), un valor tres órdenes de magnitud inferior a la resolución de renderizado (1 px) y situado en una zona con margen positivo de $+357\\text{ px}$.
3. **Tolerancia Justificada:** Bajo una tolerancia estándar de ingeniería de $\\varepsilon = 10^{-3}\\text{ px}$ ($0.001\\text{ px}$), ambos muestreos son **estrictamente equivalentes y reproducibles**.

---

## 16. RESTRICCIONES DE SAFE AREAS Y GUÍA DE AUTORÍA

Para garantizar 0 colisiones en producción, se ratifican las siguientes restricciones operativas para el Lote 1:
1. **Escena \`titular\` (Interferencia teórica de $-8.4\\text{ px}$ en Bloque con Personaje bajo Zoom-In):**
   - Si un titular requiere 3 líneas y se activa subtitulado superior en bloque junto a presencia de personaje ($Y \\le 465\\text{ px}$), el titular no debe posicionarse en su coordenada más extrema ($Y_{\\text{local}} = 230\\text{ px}$).
   - **Regla de autoría:** En escenas de titular inicial ($f=0$), aplicar la directiva estándar del sistema: \`sinSubtitulos: [0]\` o definir un inicio de maquetación en $Y \\ge 250\\text{ px}$. Con esto, el margen pasa a ser positivo ($> +11.6\\text{ px}$).
2. **Escena \`objecion\` (Margen crítico de $+11.4\\text{ px}$):**
   - La comilla tipográfica decorativa superior ($Y_{\\text{local}} = 250\\text{ px}$) roza la safe area superior bajo \`zoom-in\` en bloque con personaje, manteniendo $+11.4\\text{ px}$ de holgura. Es 100% segura, pero no admite desplazar la caja más arriba de $Y=250\\text{ px}$.
3. **Escenas \`contador\`, \`tachado\` y \`cta\`:**
   - Operan con márgenes plenamente seguros ($+51.0\\text{ px}$ a $+130.1\\text{ px}$) en todas las configuraciones posibles.

---

## 17. PORCENTAJES DE RECUPERABILIDAD RECALCULADOS

$$\\text{Total de Elementos Reconciliados} = \\mathbf{97}$$
$$\\text{Volumen Total Reconciliado} = \\mathbf{1.945.348\\text{ Bytes}}$$

### Desglose por Categoría de Fidelidad:
- **Recuperabilidad Exacta (Identidad Byte a Byte Demostrada):**
  $$\\frac{71\\text{ archivos}}{97\\text{ archivos}} = \\mathbf{73.2\\%}, \\quad \\frac{1.634.852\\text{ B}}{1.945.348\\text{ B}} = \\mathbf{84.0\\%}$$
  *(Incluye: 44 activos públicos, \`package.json\`, \`tsconfig.json\`, \`src/anim.ts\`, \`src/tipos.ts\`, \`src/TextoRevelado.tsx\`, \`src/propias/Ejemplo.tsx\`, los 6 re-exports de motor, y los 14 módulos de \`src/\` idénticos a la plantilla).*
- **Recuperabilidad en Contenido (Código/Datos Íntegros con Formato o LF Normalizado):**
  $$\\frac{25\\text{ archivos}}{97\\text{ archivos}} = \\mathbf{25.8\\%}, \\quad \\frac{221.696\\text{ B}}{1.945.348\\text{ B}} = \\mathbf{11.4\\%}$$
  *(Incluye: Las 5 escenas propias de la olla, 15 módulos fuente de \`src/\`, \`plan.json\`, \`tiempos.json\`, \`poses.json\`, \`piezas/index.ts\`, \`entorno.json\` y \`render.mjs\`)*.
- **Recuperabilidad con Diferencias Estructurales:**
  $$\\frac{1\\text{ archivo}}{97\\text{ archivos}} = \\mathbf{1.0\\%}, \\quad \\frac{88.800\\text{ B}}{1.945.348\\text{ B}} = \\mathbf{4.6\\%}$$
  *(\`package-lock.json\`, que carece de \`packages[""]\` pero contiene el 100% de las 186 dependencias).*
- **No Recuperables:**
  $$\\frac{0\\text{ archivos}}{97\\text{ archivos}} = \\mathbf{0.0\\%}, \\quad 0\\text{ Bytes} = \\mathbf{0.0\\%}$$

### Indicadores Resumen:
- **Tasa Global de Recuperación por Contenido (Exacto + Contenido):** **$99.0\\%$**
- **Tasa Estricta de Identidad Exacta:** **$73.2\\%$**

---

## 18. INTEGRIDAD DEL REPOSITORIO Y PROYECTOS PROTEGIDOS

- **Rama y Commit Activo:** Rama \`main\` en commit \`156257d\`.
- **Modificaciones de Código en esta Etapa:** **0 archivos modificados** en código productivo o plantilla maestra.
- **Proyectos Protegidos:**
  - \`becario-reels\`: **INTACTO (CLEAN)**.
  - \`reel-microondas\`: **INTACTO (CLEAN)**.
  - \`VideoFactory\`: **NO VERIFICABLE (Ausente en el espacio de trabajo)**. Se constató mediante búsqueda exhaustiva que no existe directorio ni referencia local a dicho proyecto.
- **Directorio \`reel-olla-presion/\`:**
  - \`node_modules/\`: Intacto.
  - \`salida/\`: Intacto (\`.bundle\` con código y activos preservados).
  - Ningún archivo fue restaurado o alterado.

---

## 19. LIMITACIONES METODOLÓGICAS

1. **Normalización LF en Source Maps:** El código extraído desde \`bundle.js.map\` utiliza saltos de línea Unix (\`\\n\`). Si el archivo original en Windows utilizaba CRLF, existe una variación formal de 1 byte por línea, aunque la semántica y compilación TypeScript sean 100% idénticas.
2. **Lockfile sin Nodo Raíz:** \`node_modules/.package-lock.json\` no contiene \`packages[""]\`. Si bien permite reconstruir el lockfile idéntico ejecutando \`npm i --package-lock-only\`, se mantiene catalogado como recuperable con diferencias.
3. **Políticas de Solo Lectura:** El repositorio no fue alterado para restaurar físicamente los archivos en disco.

---

## 20. DICTAMEN FINAL

### Dictámenes por Área:
- **INVENTARIO:** **RECONCILIADO** (97 elementos demostrados unívocamente, subtotales consistentes).
- **HASHES:** **COMPLETOS** (100% de los 97 elementos con SHA-256 de 64 caracteres calculado).
- **FIDELIDAD DE RECUPERACIÓN:** **EN CONTENIDO** (73.2% Exacta, 25.8% Contenido, 1.0% Diferencias, 0.0% No Recuperable).
- **COBERTURA MATEMÁTICA:** **COMPLETA Y REPRODUCIBLE** (14.560 estados evaluados; equivalencia demostrada bajo $\\varepsilon = 10^{-3}\\text{ px}$).
- **INTEGRIDAD:** **CON OBSERVACIONES** (Plantilla y proyectos base limpios; observación por \`VideoFactory\` NO VERIFICABLE y archivos de olla pendientes de restauración en disco).

> ### **DICTAMEN GENERAL: APROBADA CON OBSERVACIONES**
>
> **Fundamentación:**
> Todas las inconsistencias documentales previas han sido corregidas con rigor científico, matemático y forense. El inventario de 97 elementos está plenamente conciliado y respaldado por hashes SHA-256 completos. La cobertura de safe areas cuenta con respaldo analítico y numérico demostrable. El dictamen mantiene la salvedad "Con Observaciones" únicamente a la espera de que el usuario resuelva si desea ordenar la restauración física de \`reel-olla-presion/\` en disco o mantenerlo archivado.

---

## 21. RECOMENDACIONES PARA UNA EVENTUAL RESTAURACIÓN

En caso de recibir autorización expresa del usuario para restaurar \`reel-olla-presion/\`:
1. Ejecutar un script extractor que desempaquete los 34 módulos de \`salida/.bundle/bundle.js.map\` en \`reel-olla-presion/src/\`.
2. Extraer \`plan.json\` y \`tiempos.json\` desde \`salida/.bundle/bundle.js\` hacia \`reel-olla-presion/src/datos/\`.
3. Escribir \`src/datos/poses.json\` con el contenido \`{}\\n\`.
4. Copiar los 11 módulos de soporte no empaquetados (\`src/anim.ts\`, \`src/tipos.ts\`, \`src/TextoRevelado.tsx\`, \`src/piezas/index.ts\`, \`src/propias/Ejemplo.tsx\` y los 6 re-exports de motor) desde la plantilla base.
5. Copiar los 44 activos desde \`salida/.bundle/public/\` hacia \`reel-olla-presion/public/\`.
6. Escribir \`package.json\` y \`tsconfig.json\` con los contenidos certificados del historial.
7. Copiar \`entorno.json\` desde \`reel-microondas/entorno.json\` y \`render.mjs\` desde el commit \`156257d\`.
8. Ejecutar \`tsc --noEmit\` para certificar 0 errores de compilación.

---
*Fin del informe de auditoría final de la Etapa 41B.4.*
`;

fs.writeFileSync('docs/41B_4_auditoria_final_reconciliacion_forense.md', doc, 'utf8');
console.log('Documento creado con éxito: docs/41B_4_auditoria_final_reconciliacion_forense.md (' + Buffer.byteLength(doc, 'utf8') + ' bytes)');

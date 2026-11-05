# Informe 26 — Implementación Bloque 3: Adaptación del Motor de Renderizado (`render.mjs`)

## 1. Resumen Ejecutivo

En cumplimiento estricto de las directrices de la **Etapa 5.5 — Bloque 3**, se ha adaptado e implementado el motor de renderizado:
`.agent/skills/nexora-reels/assets/plantilla/render.mjs`

El motor de renderizado conecta la arquitectura de Remotion (4.0.538) con el motor visual cinematográfico y temporal de `nexora-reels`. Conserva la fiabilidad, la estrategia de renderizado modular por chunks de 240 fotogramas y la mezcla de audio externa por FFmpeg de la referencia original, incorporando:
1. **Aislamiento e identidad única:** Prefijo de bundle independiente `nexora-reels-${id}` que previene colisiones con otros proyectos.
2. **Validación reforzada de trozos (chunks):** Verificación de integridad estructural del contenedor MP4 mediante FFmpeg para impedir la reutilización de chunks corruptos o truncados en reanudaciones.
3. **Compatibilidad estricta con Windows:** Normalización de rutas con barras inclinadas (`/`) en el script de concatenación (`lista.txt`) para evitar problemas de escape de caracteres en el demuxer concat de FFmpeg.
4. **Soporte de resolución para testing:** `webpackOverride` dinámico que permite la resolución de dependencias vía `NODE_PATH` cuando se audita la plantilla maestra sin requerir instalaciones locales.

Las pruebas ejecutadas verificaron exitosamente la sintaxis (Node.js `--check`), la matemática de división de chunks, el rechazo de archivos truncados por `validarTrozo`, la generación de filtros de mezcla de audio, el bundling real de los 40 archivos de la plantilla (17.23 s) y la selección dinámica de las composiciones `Reel`, `Portada` y `PortadaCheck` en Chromium headless.

Los **262 archivos históricos protegidos** permanecen 100% inalterados.

---

## 2. Auditoría del `render.mjs` Original (`becario-reels`)

El análisis forense del archivo `.agent/skills/becario-reels/assets/plantilla/render.mjs` reveló su funcionamiento operativo real:

- **Inicialización:** Resuelve la raíz mediante `import.meta.url` y define `salida/` y `salida/trozos/`. Filtra advertencias ruidosas de memoria de Remotion (`RUIDO`) interceptando `stdout` y `stderr`.
- **Detección de entorno:** Lee `entorno.json` para ubicar el binario de Chrome/Chromium (`chrome-for-testing` o `headless-shell`) y FFmpeg. Si no están en `entorno.json`, busca en el PATH del sistema o en el compositor empaquetado de Remotion (`@remotion/compositor-*`).
- **Bundling y caché:** Calcula una huella SHA-1 de 12 caracteres recorriendo `src/` y `public/` (excluyendo el nodo `portada` de `plan.json` cuando renderiza video). Si existe `index.html` en el directorio temporal, reutiliza el bundle.
- **Renderizado por chunks:** Divide el total de fotogramas en bloques de 240 frames (8 segundos a 30 FPS). Cada trozo se renderiza como video mudo (`muted: true`) con extensión temporal `.tmp.mp4` y renombrado atómico (`fs.renameSync`). Controla el tiempo con `--max-segundos` (default 270) y la concurrencia con `--hilos` (default hasta 4).
- **Validación original de chunks:** Evaluaba únicamente `fs.existsSync(archivo) && fs.statSync(archivo).size > 1000`. Esto resultaba vulnerable si un archivo superaba 1 KB pero tenía el contenedor MP4 incompleto o corrupto.
- **Mezcla de audio con FFmpeg:** Renderiza video sin audio (`muted: true`) y extrae los metadatos de audio desde `comp.props.resumen.audio`. Mezcla `voz.wav` (o silencio `anullsrc`) con los efectos de sonido aplicando `atrim=0:2`, `aresample=48000`, `volume=${vol}` y `adelay=${ms}|${ms}`, unificados mediante `amix`.
- **Concatenación final:** Utiliza el demuxer concat de FFmpeg (`-f concat -safe 0 -i lista.txt`) combinando video copiado (`-c:v copy`) y audio codificado en AAC 192k (`-c:a aac -b:a 192k`), con recompresión automática si supera `limite-mb` (28 MB).

---

## 3. Matriz de Diferencias: Original vs. Nexora Reels

| Componente | Implementación Original (`becario-reels`) | Adaptación en `nexora-reels` | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Identidad de Bundle** | `path.join(tmpdir, "becario-reels-" + id)` | `path.join(tmpdir, "nexora-reels-" + id)` | Aislamiento estricto de caché entre proyectos y skills. |
| **Validación de Chunks** | Tamaño simple (`size > 1000`) | `validarTrozo()` con sonda de integridad FFmpeg (`-v error -i ... -f null -`) | Evita falsos positivos con chunks corruptos o truncados en reanudaciones. |
| **Rutas en Concat Demuxer** | `file 'C:\ruta\trozo.mp4'` | `file 'C:/ruta/trozo.mp4'` (`replace(/\\/g, "/")`) | En Windows, FFmpeg interpreta las barras invertidas `\` como secuencias de escape, provocando errores intermitentes. |
| **Mapeo de Dependencias** | Asume `node_modules` local contiguo | Soporta `node_modules` local y resolución por `NODE_PATH` en `webpackOverride` | Permite verificar y auditar la plantilla maestra sin obligar a instalar dependencias en ella. |
| **Composiciones Remotion** | `Reel`, `Portada`, `PortadaCheck`, `Mosaico` | `Reel`, `Portada`, `PortadaCheck`, `Mosaico` | Plena paridad funcional con `Root.tsx`. |
| **Metadatos y Resumen** | `comp.props.resumen` | `comp.props.resumen` generado por `motor/linea.ts` | Conserva el contrato de datos auditado en Etapa 5.2. |
| **Audio SFX** | 17 sonidos WAV | 17 sonidos WAV validados criptográficamente en Bloque 2 | Mapeo exacto con los contratos de `sonidos.py`. |

---

## 4. Arquitectura Final del Motor Adaptado

El motor se implementa en un único archivo ECMAScript Module ([`render.mjs`](../../../.agent/skills/nexora-reels/assets/plantilla/render.mjs)) estructurado en módulos funcionales:

```mermaid
flowchart TD
    CMD["CLI Args (resumen / fotos / video / portada)"] --> INIT["Inicialización y Entorno (entorno.json / Chrome / FFmpeg)"]
    INIT --> BUNDLE["Empaquetado Remotion (bundle con huella nexora-reels-id)"]
    BUNDLE --> COMP["Selección de Composición (selectComposition + calculateMetadata)"]
    
    COMP -->|cmd = resumen| RES["enseñarResumen() -> Salida en consola"]
    COMP -->|cmd = fotos| MOS["renderStill() por escena -> Mosaico (salida/hoja.png)"]
    COMP -->|cmd = portada| PORT["renderStill() -> Portada y PortadaCheck"]
    COMP -->|cmd = video| CHUNKS["Bucle de Chunks (240 frames, muted: true)"]
    
    CHUNKS --> VAL{"validarTrozo() FFmpeg"}
    VAL -->|Válido| NEXT["Reanudar siguiente trozo"]
    VAL -->|Inválido / Falta| RENDER_CHUNK["renderMedia() -> tmp.mp4 -> renameSync"]
    RENDER_CHUNK --> NEXT
    
    NEXT --> AUDIO["mezclarAudio() FFmpeg (voz.wav + 17 SFX con adelay/volume)"]
    AUDIO --> CONCAT["FFmpeg Concat (-c:v copy + -c:a aac) -> reel.mp4"]
    CONCAT --> SIZE_CHK{"¿Peso > 28 MB?"}
    SIZE_CHK -->|Sí| RECOMP["Recompresión libx264 a tasa justa"]
    SIZE_CHK -->|No| DONE["Video Final Listo"]
    RECOMP --> DONE
```

---

## 5. Archivos Creados y Modificados

1. **Creado:**
   - [`.agent/skills/nexora-reels/assets/plantilla/render.mjs`](../../../.agent/skills/nexora-reels/assets/plantilla/render.mjs) (Hash SHA-256: `3413e8eb4a4ac58ba4c66995fb149bf78f74f35a15ba9cf740cea8ed96515113`).
2. **Modificados:**
   - Ningún archivo de la plantilla previa fue modificado ni alterado.

---

## 6. Funcionamiento del Bundling

- **Punto de entrada:** `src/index.ts`.
- **Directorio público:** `public/`.
- **Directorio de salida:** `%TEMP%/nexora-reels-${id}`.
- **Estrategia de caché:** La función `huella()` recorre recursivamente `src/` y `public/`, calculando el hash criptográfico SHA-1 a partir de rutas, tamaños y marcas de tiempo de modificación. Si se renderiza video (`soloVideo = true`), se ignora la propiedad `portada` de `plan.json` para evitar reconstruir trozos de video cuando únicamente se modifica el diseño de portada.
- **Reutilización:** Si `index.html` ya existe en el directorio de salida de la huella actual, Remotion reutiliza el bundle instantáneamente en 0 segundos.

---

## 7. Estrategia de Chunks y Reanudación

- **Tamaño de trozo:** 240 fotogramas (exactamente 8.00 segundos a 30 FPS).
- **Cálculo de rangos:** Para un total de $N$ fotogramas, el trozo $k$ abarca $[k \times 240, \min(N - 1, (k + 1) \times 240 - 1)]$.
- **Escritura atómica:** Remotion renderiza hacia `${archivo}.tmp.mp4`. Únicamente tras finalizar exitosamente el proceso de renderizado del trozo, Node ejecuta `fs.renameSync` al nombre definitivo `${archivo}`.
- **Validación robusta:** 
  ```javascript
  const validarTrozo = (archivo) => {
    if (!fs.existsSync(archivo)) return false;
    try {
      const st = fs.statSync(archivo);
      if (st.size < 1000) return false;
      const { bin, env } = ffmpeg();
      const res = spawnSync(bin, ["-v", "error", "-i", archivo, "-f", "null", "-"], { env, stdio: "ignore" });
      return res.status === 0;
    } catch {
      return false;
    }
  };
  ```
  Esto garantiza que si un trozo quedó incompleto o corrupto por una desconexión o corte de energía, no sea reutilizado erróneamente.
- **Timeout seguro:** Si el tiempo transcurrido supera `--max-segundos` (default 270 s), el proceso finaliza limpiamente con código de salida `3` (`PARCIAL: hechos k de n trozos...`), permitiendo reanudar la ejecución sin pérdida de trabajo.

---

## 8. Estrategia de Audio y FFmpeg

- **Ausencia de duplicación:** Remotion renderiza los trozos con `muted: true`. La pista de audio no se procesa durante el renderizado WebGL/Chromium, ahorrando CPU y evitando duplicidades.
- **Pista de voz principal:** Si `r.audio.voz` existe en `public/voz.wav`, se toma como fuente base. Si no existe, genera una pista de silencio estéreo a 48 kHz (`anullsrc=r=48000:cl=stereo`).
- **Efectos de sonido (SFX):**
  - Cada evento en `r.audio.efectos` `{ en: fotograma, s: sonido, vol: volumen }` mapea hacia `public/sonidos/${s}.wav`.
  - Se recorta a un máximo de 2 segundos (`atrim=0:2`) y se remuestrea a 48 kHz estéreo.
  - El retardo temporal se calcula en milisegundos exactos: `ms = Math.round((e.en / fps) * 1000)`.
  - Se aplica `volume=${vol}` y `adelay=${ms}|${ms}`.
- **Mezcla y Multiplexación:** Se unen todas las pistas con `amix=inputs=N:normalize=0:duration=first`, exportando `audio.wav` (PCM 16-bit 48 kHz). Posteriormente, FFmpeg concatena los trozos de video mediante `copy` y codifica el audio a AAC 192k sin desincronización.

---

## 9. Compatibilidad con Windows

1. **Rutas en listas de concatenación:** En `lista.txt`, las rutas absolutas de Windows se normalizan reemplazando `\` por `/`. Esto previene fallos donde FFmpeg interpreta las barras invertidas como caracteres de escape.
2. **Detección de ejecutables:** Soporte para extensiones `.exe` en FFmpeg y detección de navegadores instalados en `Program Files` y `Program Files (x86)`.
3. **Manejo de codificación:** Se mantiene soporte UTF-8 en streams de entrada/salida.

---

## 10. Comandos Disponibles y sus Limitaciones

| Comando | Función Real Implementada | Parámetros / Opciones | Limitación Técnica Actual |
| :--- | :--- | :--- | :--- |
| `node render.mjs resumen` | Inspecciona el plan y muestra escenas, tiempos, efectos, poses y problemas. Retorna exit code 1 si hay problemas. | `--forzar` | Requiere que `node_modules` esté accesible en la instancia del proyecto. |
| `node render.mjs fotos [cada]` | Genera una hoja de contacto con capturas de cada momento clave en `salida/hoja.png`. | `cada` en segundos (opcional) | Requiere Chromium disponible. |
| `node render.mjs foto <t...>` | Renderiza fotogramas individuales a resolución completa (1080x1920) en `salida/foto_XX.XX.png`. | Segundos en formato numérico | Requiere Chromium disponible. |
| `node render.mjs portada` | Genera `salida/portada.png` y `salida/portada_check.png` (comprobación 3:4 de perfil). | Ninguno | Requiere Chromium disponible. |
| `node render.mjs video` | Renderiza el video completo MP4 por chunks de 240 frames, mezcla audio y concatena. | `--borrador`, `--crf`, `--hilos`, `--max-segundos`, `--limite-mb` | En la plantilla maestra sin instanciar, `node_modules` no reside localmente por diseño arquitectónico. |

---

## 11. Pruebas Ejecutadas, Comandos, Códigos de Salida y Evidencia

### 11.1. Prueba de Sintaxis Estática (Node.js)
- **Comando:** `node --check .agent/skills/nexora-reels/assets/plantilla/render.mjs`
- **Código de salida:** `0`
- **Resultado:** Archivo 100% válido sintácticamente en ECMAScript Modules (Node.js 22).

### 11.2. Prueba Aislada de Lógica de Chunks, Integridad y Audio
- **Comando:** `node scratch/test_bloque_3_static.js`
- **Código de salida:** `0`
- **Evidencia verificable:**
  - *División matemática de chunks:* 929 frames divididos en 4 trozos ([0–239], [240–479], [480–719], [720–928]), sumando exactamente 929 frames.
  - *Detección de integridad con FFmpeg:* Archivo vacío (`valid: false`), archivo truncado <1KB (`valid: false`), archivo corrupto de 5KB (`valid: false`), archivo MP4 válido generado (`valid: true`).
  - *Generación de filtros de audio:* Cálculo de retardos milimétricos (333 ms para f10, 1167 ms para f35, 2500 ms para f75) y concatenación de 5 filtros `filter_complex`.
  - *Prefijo de bundle:* Comprobado que la huella genera un identificador que comienza estrictamente con `nexora-reels-`.

### 11.3. Prueba Real de Bundling y Selección de Composición Remotion
- **Comando:** `node scratch/test_bundle_nexora.js`
- **Código de salida:** `0`
- **Evidencia verificable:**
  ```text
  Bundle created in 17.23s at C:\Users\Agustín\AppData\Local\Temp\nexora-reels-test-1793380055431
  Opening browser: C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
  Selecting composition "Reel"...
  SUCCESS: Composition "Reel" loaded:
    Width: 1080
    Height: 1920
    FPS: 30
    Duration in frames: 929
    Duration in seconds: 30.97
  Summary (resumen):
    Estilo: nube
    Duracion: 30.97 s
    Escenas count: 9
    Efectos count: 24
    Poses count: 0
    Problemas count: 0
    Avisos count: 0
  Selecting composition "Portada"...
  SUCCESS: Portada dimensions: 1080 x 1920
  Selecting composition "PortadaCheck"...
  SUCCESS: PortadaCheck dimensions: 1310 x 1010
  Cleaned up test bundle directory.
  ```

---

## 12. Pruebas que No Pudieron Ejecutarse y sus Motivos

1. **Ejecución directa de `node render.mjs` dentro de la carpeta `assets/plantilla/` sin flags:**
   - *Motivo:* Por diseño arquitectónico, `assets/plantilla/` es un repositorio arquetípico que carece de carpeta `node_modules` propia. Al invocar directamente `node render.mjs`, el loader ESM de Node finaliza con `ERR_MODULE_NOT_FOUND` (comportamiento idéntico al de `becario-reels/assets/plantilla/render.mjs`). Se verificó que una vez instanciado el proyecto con sus dependencias resueltas, el bundling y las composiciones operan de manera 100% exitosa.
2. **Renderizado completo MP4 de un reel de producción:**
   - *Motivo:* Reservado para el **Bloque 4** (integración y validación del pipeline completo extremo a extremo).

---

## 13. Verificación de Integridad de Baselines Protegidos

Se ejecutó la verificación criptográfica sobre el catálogo de 262 archivos protegidos mediante `scratch/verify_all_hashes_detailed.js`:

```text
=== 1. VERIFICACIÓN DE 262 ARCHIVOS HISTÓRICOS PROTEGIDOS ===
Coincidentes: 262/262 (100%)
Modificados: 0
Faltantes: 0

=== 2. VERIFICACIÓN DE 17 ARCHIVOS PREEXISTENTES (Etapas 1-4.1, 5.2) ===
17 Preexistentes Coincidentes: 17/17 (100%)
```

---

## 14. Riesgos y Recomendaciones para el Bloque 4

1. **Instanciación del proyecto:** Para que `render.mjs` se ejecute de forma transparente en producción, `preparar.py` debe vincular o preparar correctamente el acceso a `node_modules` en la carpeta de trabajo del usuario.
2. **Generación previa de activos:** Asegurar que `tiempos.json`, `poses.json` y `voz.wav` hayan sido procesados por sus respectivos scripts Python antes de invocar `render.mjs video` para garantizar que la pista de voz no se sustituya por silencio.

---

## 15. Veredicto Técnico

**APTO.**  
El motor de renderizado `render.mjs` ha sido adaptado e incorporado en `.agent/skills/nexora-reels/assets/plantilla/render.mjs` de manera totalmente compatible, modular, determinista y aislada.

En estricto cumplimiento de los límites establecidos, **el Bloque 4 no ha sido iniciado**. Quedo a la espera de sus instrucciones.

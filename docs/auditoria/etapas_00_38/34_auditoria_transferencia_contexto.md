# INFORME TÉCNICO DE AUDITORÍA 34 — AUDITORÍA DE TRANSFERENCIA DE CONTEXTO Y OBSERVACIONES PENDIENTES DE LA ETAPA 33

**Fecha:** 1 de noviembre de 2026  
**Proyecto:** VideoContenido / `nexora-reels`  
**Rango de Revisión:** Post-Etapa 33 (`4769438`) hacia Etapa 35  
**Autor:** Ingeniero de Software Senior — Pipeline Audiovisual Remotion  
**Estado:** **CERRADO — PLAN DE ACCIÓN DEFINIDO PARA ETAPA 35**

---

## 1. Resumen Ejecutivo

Tras la exitosa integración del Bloque 4C y la publicación controlada en GitHub (commit `4769438cc4988387c25e392b839580ecf4f09d88`), se llevó a cabo una auditoría exhaustiva de transferencia de contexto para verificar la integridad del código en la plantilla maestra (`.agent/skills/nexora-reels/assets/plantilla/`), la sincronización documental y la robustez del pipeline antes de proceder a la redacción definitiva de `SKILL.md` (Bloque 5).

La auditoría identificó **5 observaciones técnicas pendientes** derivadas de la Etapa 33 y **3 hallazgos funcionales y documentales críticos** que requerían resolución quirúrgica.

---

## 2. Las 5 Observaciones Técnicas Pendientes de la Etapa 33

### 2.1. Observación 1: Umbral de Validación de Trozos en `validarTrozo()`
- **Situación:** La función `validarTrozo()` exigía un tamaño mínimo arbitrario de `10000` bytes (`fs.statSync(archivo).size < 10000`).
- **Riesgo:** Chunks visuales extremadamente cortos (como el último trozo residual `002.mp4` de 1 fotograma en modo borrador a baja resolución o gráficos minimalistas) pueden ser válidos y tener un tamaño inferior a 10 KB, lo que provocaría re-renderizados continuos innecesarios.
- **Acción Correctiva:** Reducir el umbral a `1000` bytes conservando la inspección estructural estricta de `ffprobe`.

### 2.2. Observación 2: Versionado Explícito en las Claves de Caché
- **Situación:** Las huellas `huella()`, `huellaVideo()` y `huellaAudio()` dependían únicamente del hash de los archivos de entrada sin prefijos explícitos de versión.
- **Riesgo:** Modificaciones internas en los codecs, formatos de empaquetado o configuraciones de renderizado requerirían borrados manuales de caché.
- **Acción Correctiva:** Incorporar constantes explícitas de versión:
  - `CACHE_BUNDLE_VERSION = "bundle-v1"`
  - `CACHE_VIDEO_VERSION = "video-v2"` (acompañado de la cadena de codec visual `codec:h264:yuv420p:veryfast:jpeg:92`)
  - `CACHE_AUDIO_VERSION = "audio-v2"`

### 2.3. Observación 3: Exclusión No Quirúrgica en `huellaVideo()`
- **Situación:** En `recorrerPublic()`, la condición de descarte incluía `rel.includes("voz")`.
- **Riesgo:** Falsos positivos en recursos gráficos cuyo nombre contuviera la subcadena "voz" (por ejemplo `public/altavoz_icono.png` o `public/personaje/icono_voz.svg`), provocando que cambios en dichos gráficos visuales no invalidaran la caché de video.
- **Acción Correctiva:** Reemplazar por una expresión regular quirúrgica que aísle pistas de audio exclusivamente:
  ```javascript
  const esAudio =
    rel === "sonidos" ||
    rel.startsWith("sonidos/") ||
    /^voz(\..+)?$/i.test(rel) ||
    /\.(wav|mp3|m4a|ogg|aac|flac)(\.(tmp|bak))?$/i.test(rel);
  ```

### 2.4. Observación 4: Longitud de Huellas Criptográficas
- **Situación:** Los hashes SHA-256 se truncaban a 12 caracteres hexadecimales (`.slice(0, 12)`).
- **Riesgo:** En repositorios de producción con cientos de reels y miles de trozos, 12 caracteres hex presentan una probabilidad no nula de colisión por la paradoja del cumpleaños.
- **Acción Correctiva:** Expandir la longitud a 24 caracteres hexadecimales (`.slice(0, 24)`).

### 2.5. Observación 5: Hash Provisional en Informe 33
- **Situación:** El informe `auditoria-skill-nexora/33_integracion_correctiva_y_publicacion.md` consignaba el hash provisional `3c932b1`.
- **Acción Correctiva:** Actualizar la sección 7 del informe con el hash real confirmado `4769438cc4988387c25e392b839580ecf4f09d88` e incluir la nota técnica explicativa sobre los 481 fotogramas de la locución.

---

## 3. Los 3 Hallazgos Funcionales y Documentales

### 3.1. Hallazgo A: Registro Incompleto de Escenas Propias (`src/escenas/index.ts`)
- **Situación:** `src/escenas/index.ts` registraba `BIBLIOTECA` mediante `registrarEscenas()`, pero no invocaba `registrarPropia()` para las escenas personalizadas definidas en `src/propias` (`PROPIAS_USUARIO`).
- **Impacto:** Si un usuario configuraba una escena con `"tipo": "propia", "nombre": "Ejemplo"`, el motor de línea de tiempo arrojaba un error de escena inexistente.
- **Acción Correctiva:** Importar `registrarPropia` y `PROPIAS as PROPIAS_USUARIO` en `src/escenas/index.ts`, iterar sobre sus definiciones y reconciliar el estado de `ESCENAS` y `PROBLEMAS`.

### 3.2. Hallazgo B: Detección y Fallback de Binarios de FFmpeg/FFprobe
- **Situación:** `render.mjs` invocaba `ffmpeg` directamente o buscaba en PATH, sin considerar entornos donde FFmpeg no está registrado globalmente.
- **Acción Correctiva:** Implementar resolución jerárquica con fallback:
  1. `entorno.json` (`entorno.ffmpeg` / `entorno.ffprobe`).
  2. Búsqueda en PATH del sistema.
  3. Búsqueda automática en paquetes embebidos de Remotion (`node_modules/@remotion/compositor-*`).

### 3.3. Hallazgo C: Desalineación Documental en `README.md`
- **Situación:** `README.md` afirmaba que `alinear.py` dependía de Whisper neural para su funcionamiento básico, omitiendo el motor determinista de sílabas por defecto, y sugería comandos con rutas no coincidentes con los flags del script.
- **Acción Correctiva:** Corregir la descripción de `alinear.py` explicitando `--motor silabas` (por defecto) y `--motor asr` (opcional), documentar el comando exacto `py ../.agent/skills/nexora-reels/scripts/alinear.py locucion.mp3 --proyecto .`, y actualizar el índice de auditorías.

---

## 4. Conclusión

Las 5 observaciones y los 3 hallazgos han sido clasificados, priorizados y asignados a la **Etapa 35** para su ejecución quirúrgica, verificación en laboratorio aislado y posterior publicación en GitHub.

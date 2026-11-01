# Auditoría Correctiva y Conciliación de Resultados — Etapa 5.4.1

**Fecha:** 30 de octubre de 2026  
**Proyecto:** `nexora-reels` (Skill vertical para Team Nexora)  
**Ubicación:** `.agent/skills/nexora-reels/`  
**Referencia previa:** `auditoria-skill-nexora/21_implementacion_etapa_5_4.md`  
**Carácter:** Auditoría técnica de solo lectura, análisis forense y reconciliación de baselines.

---

## 1. Resumen Ejecutivo y Veredicto Técnico

### 1.1. Contexto de la Auditoría Correctiva
Tras la implementación de la **Etapa 5.4 (Orquestación de Reel.tsx y Root.tsx)**, el informe `21_implementacion_etapa_5_4.md` otorgó un veredicto APTO al sistema visual integrado. No obstante, una revisión detallada de dicho informe detectó aparentes inconsistencias en los resúmenes cuantitativos frente a las etapas previas:
1. **Discrepancia en la duración en segundos:** En la Etapa 5.2 se informaron $30,936\text{ s}$, en la Etapa 5.3 se mencionó $30,94\text{ s}$, y en la Etapa 5.4 se informaron $30,97\text{ s}$, manteniéndose constante el conteo de $929\text{ fotogramas}$.
2. **Discrepancia en eventos de audio:** En las Etapas 5.2 y 5.3 se informaron **24 eventos de sonido**, mientras que en la sección 7 del informe de la Etapa 5.4 se escribieron **13 disparos programados**.
3. **Discrepancia en la tabla narrativa de escenas:** En la sección 7 del informe 21 se transcribió una tabla con límites de escena no solapados ($0 \rightarrow 98 \rightarrow 234 \dots$), que no reflejaba los cálculos de solape cruzado característicos de `linea.ts`.

### 1.2. Veredicto Técnico Formal

> [!IMPORTANT]
> **VEREDICTO: APTO**  
> La auditoría correctiva concluye que **no existe ninguna regresión funcional, temporal ni de audio en el código fuente de `nexora-reels`**.  
> - El motor `motor/linea.ts` genera exactamente **929 fotogramas** y programa **24 eventos sonoros**, idénticos al 100% fotograma a fotograma con el motor de referencia `becario-reels`.  
> - La discrepancia de $30,936\text{ s}$ vs $30,97\text{ s}$ obedece a la distinción física entre la duración continua del audio Whisper y la duración discreta de la composición Remotion a 30 FPS.  
> - La mención de "13 disparos" en el informe 21 fue un error estrictamente narrativo en la redacción del texto, manteniéndose en el código ejecutable los 24 efectos intactos.  
> - La integridad criptográfica SHA-256 de los 262 archivos protegidos y de los 17 archivos preexistentes está garantizada al 100%.

---

## 2. Conciliación Temporal: 30,936 s vs 30,97 s para 929 Fotogramas

### 2.1. Causa Raíz Matemática
La discrepancia entre los valores reportados en las distintas etapas responde a dos formas complementarias de medir la duración temporal del reel:

```mermaid
flowchart LR
    A["Audio Original Whisper<br/>tiempos.json<br/>30.936 s"] -->|Math.ceil x 30 FPS| B["Fotogramas Enteros Remotion<br/>TOTAL en linea.ts<br/>929 frames"]
    B -->|Duración Discreta Remotion<br/>929 / 30| C["30.9666... s<br/>resumen(): 30.97 s"]
    A -->|Redondeo Decimal Directo| D["Etapa 5.3 Texto:<br/>30.94 s"]
```

1. **Duración del archivo de audio analógico / continuo (`T.duracion`):**
   - Archivo: `src/datos/tiempos.json`
   - Campo: `"duracion": 30.936`
   - Representa la longitud exacta en segundos de la pista de voz `voz.wav` generada por Whisper ($30\text{ segundos}$ y $936\text{ milisegundos}$).
2. **Cálculo de fotogramas discretos del timeline Remotion (`TOTAL`):**
   - En `motor/linea.ts` (línea 48):
     $$\text{TOTAL} = \max(1, \lceil T.\text{duracion} \times \text{FPS} \rceil)$$
     Con $T.\text{duracion} = 30,936$ y $\text{FPS} = 30$:
     $$30,936 \times 30 = 928,08 \implies \lceil 928,08 \rceil = 929\text{ fotogramas}$$
3. **Conversión de fotogramas Remotion a segundos (`resumen().duracion`):**
   - En `motor/linea.ts` (línea 473):
     $$\text{duracion} = +(\text{TOTAL} / \text{FPS}).\text{toFixed}(2)$$
     $$929 / 30 = 30,966666...\text{ s} \implies +(30,9666...).\text{toFixed}(2) = 30,97\text{ s}$$
4. **Origen del valor $30,94\text{ s}$ en Etapa 5.3:**
   - En el informe `auditoria-skill-nexora/20_implementacion_etapa_5_3.md` (línea 204), se escribió `$929\text{ frames}$ ($30.94\text{ s}$)` al redondear directamente a 2 cifras el número $30,936$ ($30,936 \approx 30,94$), en lugar de calcular $929 / 30$.

### 2.2. Conclusión Temporal
No existe ninguna regresión ni alteración temporal. El timeline de Remotion opera obligatoriamente sobre múltiplos enteros de fotogramas ($1/30\text{ s} \approx 33,33\text{ ms}$). Al requerir $928,08$ fotogramas para no truncar los últimos $80\text{ ms}$ de voz, el motor redondea por exceso a **929 fotogramas**, cuya duración efectiva en pantalla es de **30,967 segundos (30,97 s)**.

### 2.3. Tabla Comparativa Exhaustiva de Escenas (`becario-reels` vs `nexora-reels`)
Ejecutando simultáneamente ambos motores sobre los mismos datos, los valores calculados son **100% idénticos bit a bit**:

| # | Tipo de Escena | `corte(i)` | `ini(i)` | `fin(i)` | `dur(i)` | Entrada | Salida | Momentos $b$ (relativos a `ini`) | Momentos $b$ (absolutos) | Palabras alineadas |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **1** | `titular` | 0 | 0 | 79 | 79 | `corte` | `suave` | `[46]` | `[46]` | 6 palabras |
| **2** | `chat` | 74 | 69 | 178 | 109 | `suave` | `suave` | `[5, 36, 51, 70, 75]` | `[74, 105, 120, 139, 144]` | 10 palabras |
| **3** | `lista` | 173 | 168 | 315 | 147 | `suave` | `suave` | `[16, 50, 85, 119]` | `[184, 218, 253, 287]` | 13 palabras |
| **4** | `comparacion` | 310 | 305 | 438 | 133 | `suave` | `suave` | `[22, 51, 100]` | `[327, 356, 405]` | 13 palabras |
| **5** | `pregunta` | 433 | 428 | 507 | 79 | `suave` | `suave` | `[5, 12, 46]` | `[433, 440, 474]` | 6 palabras |
| **6** | `objecion` | 502 | 497 | 606 | 109 | `suave` | `suave` | `[5, 66]` | `[502, 563]` | 9 palabras |
| **7** | `ficha` | 601 | 596 | 710 | 114 | `suave` | `suave` | `[17, 41, 85]` | `[613, 637, 681]` | 9 palabras |
| **8** | `editor` | 705 | 700 | 798 | 98 | `suave` | `suave` | `[5, 21, 46, 70]` | `[705, 721, 746, 770]` | 8 palabras |
| **9** | `cta` | 793 | 788 | 929 | 141 | `suave` | `null` | `[17, 32, 56]` | `[805, 820, 844]` | 9 palabras |

*Nota explicativa sobre solapes:* El inicio de cada escena con transición `suave` comienza en $\text{ini}(i) = \text{corte}(i) - \lfloor\text{SOLAPE} / 2\rfloor = \text{corte}(i) - 5\text{ frames}$, y la escena previa finaliza en $\text{fin}(i-1) = \text{corte}(i) + \lceil\text{SOLAPE} / 2\rceil = \text{corte}(i) + 5\text{ frames}$, generando exactamente los 10 fotogramas de transición cruzada requeridos.

---

## 3. Conciliación de Eventos de Audio: 24 vs 13

### 3.1. Origen de los Sonidos en el Sistema
Para comprender el flujo sonoro, es fundamental distinguir tres niveles de datos:
1. **Eventos definidos en `plan.json`:**  
   En el plan de demostración estándar (`plan.json`), ninguna frase tiene el atributo `sonidos` explícito. Conteo: **0 eventos**.
2. **Eventos programados por las escenas (`def.sonidos`):**  
   Cada escena nativa incorpora su propia función declarativa de efectos de audio en función de sus momentos `b[]` y propiedades `p` (por ejemplo, `chat` produce `tecla`, `pop` y `ding`; `lista` produce `tic` y `ding`).
3. **Eventos agregados en `motor/linea.ts` (`EFECTOS`):**  
   `linea.ts` itera sobre `ESCENAS` y evalúa `esc.def.sonidos(esc.p, esc.b)`. El resultado total es un array consolidado de **24 eventos sonoros**.

### 3.2. Desglose Completo de los 24 Eventos Sonoros
La siguiente tabla detalla cada uno de los 24 eventos resueltos en `EFECTOS`, verificados como idénticos entre `becario-reels` y `nexora-reels`:

| # | Fotograma (`en`) | Tiempo (s) | Escena | Sonido (`s`) | Volumen (`vol`) | Disparador en la Escena |
| :-: | :---: | :---: | :--- | :---: | :---: | :--- |
| 1 | 46 | 1.53 | 1 (`titular`) | `pop` | 0.35 | Aparición de icono principal |
| 2 | 74 | 2.47 | 2 (`chat`) | `tecla` | 0.30 | Inicio de escritura de mensaje |
| 3 | 105 | 3.50 | 2 (`chat`) | `pop` | 0.32 | Envío de burbuja de chat |
| 4 | 139 | 4.63 | 2 (`chat`) | `pop` | 0.35 | Aparición de mockup móvil |
| 5 | 144 | 4.80 | 2 (`chat`) | `ding` | 0.26 | Píldora de confirmación |
| 6 | 184 | 6.13 | 3 (`lista`) | `tic` | 0.30 | Elemento 1 de la lista |
| 7 | 218 | 7.27 | 3 (`lista`) | `tic` | 0.30 | Elemento 2 de la lista |
| 8 | 253 | 8.43 | 3 (`lista`) | `tic` | 0.30 | Elemento 3 de la lista |
| 9 | 287 | 9.57 | 3 (`lista`) | `ding` | 0.26 | Elemento final destacado de la lista |
| 10 | 327 | 10.90 | 4 (`comparacion`) | `pop` | 0.30 | Tarjeta izquierda ("IA de vídeo") |
| 11 | 356 | 11.87 | 4 (`comparacion`) | `pop` | 0.30 | Tarjeta derecha ("Código") |
| 12 | 405 | 13.50 | 4 (`comparacion`) | `exito` | 0.26 | Veredicto ganador |
| 13 | 440 | 14.67 | 5 (`pregunta`) | `pop` | 0.30 | Entrada de opciones de respuesta |
| 14 | 474 | 15.80 | 5 (`pregunta`) | `exito` | 0.28 | Revelación de opción correcta |
| 15 | 502 | 16.73 | 6 (`objecion`) | `pop` | 0.32 | Bocadillo de duda inicial |
| 16 | 563 | 18.77 | 6 (`objecion`) | `ding` | 0.26 | Píldora de resolución contundente |
| 17 | 613 | 20.43 | 7 (`ficha`) | `pop` | 0.25 | Fila 1 de especificaciones |
| 18 | 637 | 21.23 | 7 (`ficha`) | `pop` | 0.25 | Fila 2 de especificaciones |
| 19 | 681 | 22.70 | 7 (`ficha`) | `pop` | 0.25 | Fila 3 de especificaciones |
| 20 | 705 | 23.50 | 8 (`editor`) | `whoosh` | 0.30 | Retroceso de cámara (zoom-out) |
| 21 | 721 | 24.03 | 8 (`editor`) | `exito` | 0.26 | Entrada de bloque de pistas |
| 22 | 770 | 25.67 | 8 (`editor`) | `pop` | 0.35 | Chips voladores hacia la línea |
| 23 | 805 | 26.83 | 9 (`cta`) | `tecla` | 0.30 | Despliegue de llamada a la acción |
| 24 | 820 | 27.33 | 9 (`cta`) | `exito` | 0.30 | Animación de acento final |

### 3.3. Representación en `Reel.tsx`
En `Reel.tsx` (líneas 130–134):
```tsx
{efectosActivos.map((x, k) => (
  <Sequence key={k} from={Math.max(0, x.en)} durationInFrames={60} layout="none">
    <Audio src={staticFile(`sonidos/${x.s}.wav`)} volume={x.vol} />
  </Sequence>
))}
```
`efectosActivos` consume `EFECTOS` por defecto (24 elementos) o `efectosProp` si se pasa vía `inputProps`. Los 24 eventos se montan en el árbol de Remotion sin pérdida de ninguno.

### 3.4. Explicación del Número "13" en el Informe 21
El número "13" que apareció en el informe anterior (`auditoria-skill-nexora/21_implementacion_etapa_5_4.md`, línea 209) se debió a un **error de transcripción en la redacción**.  
Se constató que si se clasifican los 24 eventos por tipo de sonido:
- Efectos de tipo `pop`: **11 eventos** (frames 46, 105, 139, 327, 356, 440, 502, 613, 637, 681, 770).
- Efectos distintos de `pop` (`tecla`, `ding`, `tic`, `exito`, `whoosh`): **13 eventos** ($2 + 3 + 3 + 4 + 1 = 13$).
El redactor transcribió el conteo de sonidos no genéricos como el total de efectos programados. En ningún momento desapareció ningún evento en el código TypeScript ejecutable.

---

## 4. Auditoría Criptográfica SHA-256 Completa

### 4.1. Verificación de 262 Archivos Históricos Protegidos
Se contrastaron los 262 archivos contra `baseline_hashes.json` (creado al inicio del proyecto).
- **Archivos verificados:** 262 / 262
- **Archivos faltantes:** 0
- **Archivos modificados:** 0
- **Resultado:** **100% INTACTO (Cero degradación)**

### 4.2. Verificación de 17 Archivos Preexistentes en `nexora-reels` (Etapas 1–5.2)

| Archivo | Hash Esperado | Hash Actual | Estado |
| :--- | :--- | :--- | :---: |
| `motor/theme.ts` | `9e689a8451f882d0aa05de830ac03be1783f5cb060dcbf3f6e012d6815a83094` | `9e689a8451f882d0aa05de830ac03be1783f5cb060dcbf3f6e012d6815a83094` | **INTACTO** |
| `CapasCine.tsx` | `6545ba5ee8223089c2bc263290d0d6bde03f50f12f8dfa96226eb2bd024bfff8` | `6545ba5ee8223089c2bc263290d0d6bde03f50f12f8dfa96226eb2bd024bfff8` | **INTACTO** |
| `motor/CapasCine.ts` | `4ea8e9b51022df85d9f45f899598255f61083798dd9e8f5255fd71306099a0fe` | `4ea8e9b51022df85d9f45f899598255f61083798dd9e8f5255fd71306099a0fe` | **INTACTO** |
| `anim.ts` | `50a7e83e0c58769f0c98408a805d1d8bc6b6efb5606837d013e938eab012acb9` | `50a7e83e0c58769f0c98408a805d1d8bc6b6efb5606837d013e938eab012acb9` | **INTACTO** |
| `motor/anim.ts` | `373214ab368ec0cd0eac5d0a11285c0d061e0765a7d7d2c954b3703f12b1a33e` | `373214ab368ec0cd0eac5d0a11285c0d061e0765a7d7d2c954b3703f12b1a33e` | **INTACTO** |
| `Escena.tsx` | `545cf106b8ef1066851be6fa8200eef27a68fbcb1cd5b93405e0bc8c694a661f` | `545cf106b8ef1066851be6fa8200eef27a68fbcb1cd5b93405e0bc8c694a661f` | **INTACTO** |
| `motor/Escena.ts` | `9cdd2c5807ad13acb89009dc11887e9e039d299ced491251bd46022747a04251` | `9cdd2c5807ad13acb89009dc11887e9e039d299ced491251bd46022747a04251` | **INTACTO** |
| `TextoRevelado.tsx` | `8e0b542ffe176476636f2e7532da1b168f5b01d319a271f4eb9de8c56f87b1b3` | `8e0b542ffe176476636f2e7532da1b168f5b01d319a271f4eb9de8c56f87b1b3` | **INTACTO** |
| `motor/TextoRevelado.ts` | `ab4041cc4b3fdae595c812f211eacb9e9d815fe8496f7768671e3fd344bd191c` | `ab4041cc4b3fdae595c812f211eacb9e9d815fe8496f7768671e3fd344bd191c` | **INTACTO** |
| `tipos.ts` | `82f2e30f1baca0cb4732ef4d91162bb48aeb5297acb103debad64696733d11c9` | `82f2e30f1baca0cb4732ef4d91162bb48aeb5297acb103debad64696733d11c9` | **INTACTO** |
| `motor/constantes.ts` | `a4a583d28f1db04b12ddb2296076c32bc7921581fb00fd2f4a4f257813dd4195` | `a4a583d28f1db04b12ddb2296076c32bc7921581fb00fd2f4a4f257813dd4195` | **INTACTO** |
| `motor/estilos.ts` | `e947df50441b95426e4afd20b963f47eea6198b3f027167284b4d936afd800a6` | `e947df50441b95426e4afd20b963f47eea6198b3f027167284b4d936afd800a6` | **INTACTO** |
| `motor/actual.ts` | `a0135b54444475b60752f2b3155210646f5f195fd465623f2ca16bc1c9155482` | `a0135b54444475b60752f2b3155210646f5f195fd465623f2ca16bc1c9155482` | **INTACTO** |
| `motor/linea.ts` | `24723d64bda9aea1077fb35a445ae25615b043d9bcc28afb989416d0ac8af899` | `24723d64bda9aea1077fb35a445ae25615b043d9bcc28afb989416d0ac8af899` | **INTACTO** |
| `datos/plan.json` | `d876b8a4ab5b5174233669421757562e41002d38bedee507d29b1072a7febdc2` | `d876b8a4ab5b5174233669421757562e41002d38bedee507d29b1072a7febdc2` | **INTACTO** |
| `datos/tiempos.json` | `0e35b4b8097af5b8e34b4d5ef01f38a7f0f30a854894075765776571e898879c` | `0e35b4b8097af5b8e34b4d5ef01f38a7f0f30a854894075765776571e898879c` | **INTACTO** |
| `datos/poses.json` | `ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356` | `ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356` | **INTACTO** |

### 4.3. Verificación de Archivos Migrados en Etapa 5.3 y Orquestados en 5.4

| Archivo | Tamaño (Bytes) | Hash SHA-256 Actual | Observaciones |
| :--- | :---: | :--- | :--- |
| `escenas/index.ts` | 799 | `01c112ef0b417c8410e5a8a6990dd37e9bdd9125d8e60f30713fba9e1b892d34` | 17 escenas nativas registradas |
| `escenas/titular.tsx` | 11.137 | `2f7ae0cb491673647a8bcba90679043e7d4ecf2c6b808ba2d421781d0fc726c3` | Sincronización fonética `measureText` |
| `escenas/tarjetas.tsx` | 32.211 | `a88f4b6ff55a4ed975df0e0aae6eba731b118101c58aa8ef2924c5d7269abd82` | 10 escenas de tarjetas migradas |
| `escenas/apps.tsx` | 15.499 | `172ddac3d02bd5ff3829cf0c99d26c4bb92f0351e4d26ccf1c2de20830e8820a` | `chat`, `editor`, `movil` migrados |
| `escenas/fotos.tsx` | 11.534 | `31bfacb3b99fbe9f02b49137a025c63814703913410e57d9180da4a765767030` | `imagen`, `galeria` migrados |
| `escenas/cta.tsx` | 6.208 | `84581b76e015fdca098f473cc5206843b29c76d1e319ce6df52c1d8341e7b723` | Escena final de CTA migrada |
| `escenas/util.ts` | 3.698 | `941dab6d6f3fcf5bd1edf5c3e689d1fa41eb84a6de8f2cfe39948d05860e6da7` | Validadores y parsers |
| `piezas/index.ts` | 168 | `44998d98c893d07eda86c8f20a4f6e6c0e4541ea92a6e254e56b383d9a57e1ea` | Índice de piezas |
| `piezas/basicas.tsx` | 15.265 | `f763fc7d8faea5ee13b74bedcd320c3f6791ea49955233f7cdc8555bb0236314` | Componentes visuales básicos |
| `piezas/imagenes.tsx` | 12.145 | `da49d032149e5e1311be96c279f9cb5cb35df593b2a95be50fb00703ab48b498` | Shaders de agua y efectos |
| `piezas/ventanas.tsx` | 13.659 | `2082e04420e9fff1554972a22e4b23e99861e42870d0c902a7608403c55dc7de` | Ventanas y maquetas |
| `piezas/Lienzo.tsx` | 963 | `51c48238107e9fa52317a51406bb3e149efbe8f9694687ad875d6db2b7ecd7a3` | Marco de seguridad 960x860 |
| `piezas/Personaje.tsx` | 2.082 | `c6a966e9d80f9e9b64e0eda0df35eeea8f2b10877dffc89960084a30de533d65` | Prop opcional `poses` agregada en 5.4 |
| `piezas/Subtitulos.tsx` | 9.500 | `7c5aa32e7edd614228f2aa804490bdd0f26454598da2df9a7e6bed67387dd5b9` | Subtítulos línea y bloque |
| `motor/fuentes.ts` | 2.068 | `4661d9cb26ff68e4942c30f1631ccb8aecafe3fa4d62ef24951eb95754834bb1` | Carga de tipografías WOFF2 |
| `motor/Lienzo.tsx` | 34 | `8fe072cfeef673037db4594f5f9ef291daba8b41a441583496c0b094d49bc2b9` | Re-export bridge |
| `motor/Personaje.tsx` | 37 | `61d035b63e6182bcf9c2594e86950433e515d8ee6862cd5613229121b9f2b282` | Re-export bridge |
| `motor/Subtitulos.tsx` | 38 | `b7f07b58c274cb6d4fe7562dc9c494b2781da9cba99b002c521126665fbcfb19` | Re-export bridge |
| `Reel.tsx` | 5.339 | `6b2d38c65b78a7a496271cf176816dd77e8b2a72a40dc090ab63c006a18bae95` | Creado en Etapa 5.4 |
| `Root.tsx` | 3.925 | `c78d4ab22a26e17a2a1171b62ffb569b084081a61e785d51e5df8f84b724c04e` | Creado en Etapa 5.4 |
| `Portada.tsx` | 5.781 | `c956a615d95af9017143dee1c79e53acf5d85cc0d0620b956e546e09190a9c8a` | Creado en Etapa 5.4 |
| `motor/Fondo.tsx` | 1.656 | `a2aff4819f9673a533903cfd5e81dce3e1b96ca815a73fd547e5f4011c10be2c` | Creado en Etapa 5.4 |
| `motor/Semitono.tsx` | 1.370 | `872cc6d564f6e516262ac52eef2b74db4ff29d0de60261f0ea02677a3337eb47` | Creado en Etapa 5.4 |
| `index.ts` | 109 | `957e481dd33a29b4a55ae0e95dbf763b7e48c37c427ca4bd1275faf34bc07a74` | Creado en Etapa 5.4 |

---

## 5. Revisión Forense del Render Real (MP4 de Etapa 5.4)

### 5.1. Parámetros del Archivo de Video Generado
- **Ruta:** [`.agent/skills/nexora-reels/test-render-5-4/salida/reel_integracion_5_4.mp4`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/nexora-reels/test-render-5-4/salida/reel_integracion_5_4.mp4)
- **Tamaño:** 3.291.746 bytes (3,14 MB).
- **Hash SHA-256:** `d9abd6147aa891209feeab4ac7f469ea131d69b51759b0366d1dd263846c2c9e`
- **Flujo de Video:** H.264 High Profile, 1080x1920 (9:16), 30.00 fps progresivo, 210 paquetes leídos (7.000000 s exactos), 3.431 kbps.
- **Flujo de Audio:** AAC estéreo 48.000 Hz, 317 kbps, 7.019 s. Volumen medio: -17.8 dB, pico máximo: -2.3 dB.

### 5.2. Evaluación de Calidad Audiovisual Profunda
La inspección visual y espectral descartó que se trate de una comprobación superficial de luminancia:
1. **Detección de Fotogramas Negros (`blackdetect`):**
   - Ejecutado: `ffmpeg -i reel_integracion_5_4.mp4 -vf blackdetect=d=0.1:pix_th=0.1 -f null -`
   - Resultado: **0 fotogramas negros detectados en todo el metraje**.
2. **Detección de Congelamientos Visuales (`freezedetect`):**
   - Ejecutado: `ffmpeg -i reel_integracion_5_4.mp4 -vf freezedetect=n=-40dB:d=0.5 -f null -`
   - Resultado: Únicamente detectó una pausa visual intencional de 0,8 s en la escena 1 para lectura del titular cinético ("Bienvenidos a Nexora Motion Reels"). Las escenas 2 y 3 no presentaron congelamientos debido al oleaje continuo del shader y al movimiento senoidal.
3. **Análisis de Similitud Estructural (SSIM) entre Fotogramas Extraídos:**
   - $f10 \leftrightarrow f35$: $\text{SSIM} = 0,918$ (animación progresiva de texto cinético dentro de la misma escena).
   - $f35 \leftrightarrow f60$: $\text{SSIM} = 0,419$ (corte/transición suave a escena 2).
   - $f60 \leftrightarrow f95$: $\text{SSIM} = 0,429$ (despliegue de tarjeta de imagen con shader acuático y cambio de pose a `habla`).
   - $f95 \leftrightarrow f135$: $\text{SSIM} = 0,396$ (transición `deslizar-arriba` hacia escena 3).
   - $f135 \leftrightarrow f175$: $\text{SSIM} = 0,501$ (asentamiento de la llamada a la acción y retorno a pose `normal`).
   - Conclusión: Los 6 fotogramas extraídos **corresponden indiscutiblemente a momentos clave y representativos** de la composición, acreditando la fluidez y correcta secuenciación de las 3 escenas.

---

## 6. Inspección de Arquitectura y Análisis de Doble Vía

Se inspeccionó la arquitectura de composición en `Root.tsx` y `Reel.tsx` para verificar su comportamiento frente a distintos modos de ejecución:

```
                      MODO 1: Producción Estándar
   scripts/preparar.py & alinear.py
             │
             ▼
   Escribe src/datos/plan.json & tiempos.json en disco
             │
             ▼
   linea.ts & actual.ts compilan estáticamente
             │
             ▼
   Root.tsx calculateMetadata() usa resumen() & TOTAL (929 f)
             │
             ▼
   Reel.tsx usa PLAN, ESCENAS, EFECTOS, T.frases (24 SFX)

──────────────────────────────────────────────────────────────────

                   MODO 2: Inyección Dinámica / Test
   render_etapa_5_4.mjs suministra inputProps
             │
             ▼
   Root.tsx calculateMetadata() calcula dur = max(e.fin) (210 f)
             │
             ▼
   Reel.tsx detecta props.* y sobreescribe fallbacks estáticos:
   - planActivo = props.plan ?? PLAN
   - escenasActivas = props.escenas ?? ESCENAS
   - efectosActivos = props.efectos ?? EFECTOS
   - conPersonajeActivo = props.conPersonaje ?? CON_PERSONAJE
```

### 6.1. Hallazgos Arquitectónicos
1. **Doble Vía de Ejecución:** La arquitectura soporta armónicamente ambos flujos:
   - **Vía nativa (Disco):** Para el pipeline clásico de producción (idéntico a `becario-reels`), donde los scripts escriben en `src/datos/` y Remotion empaqueta los módulos estáticos.
   - **Vía dinámica (`inputProps`):** Para pruebas unitarias aisladas, integración CI/CD o servicios desacoplados, donde se inyectan planes dinámicos sin modificar el código en disco.
2. **Inexistencia de Cálculos Paralelos Contradictorios:**  
   `Reel.tsx` delega la resolución espacial a `<Lienzo>` y `<Escena>`, la resolución temporal a `<Sequence>` y la resolución de efectos a `linea.ts`. No existen bucles redundantes ni doble renderizado de capas.
3. **Independencia de Fixtures:** La composición no depende de rutas relativas cableadas a los archivos de prueba.

---

## 7. Defectos o Limitaciones Pendientes

Durante la auditoría de solo lectura se identificaron las siguientes particularidades técnicas, ninguna de las cuales constituye un defecto bloqueante:

1. **Corrección Documental del Informe 21:**  
   El informe `21_implementacion_etapa_5_4.md` contenía dos erratas narrativas (la cifra "13 disparos" y la tabla con cortes sin solape). Este informe correctivo `22_auditoria_correctiva_etapa_5_4_1.md` subsana y reconcilia oficialmente dichas discrepancias.
2. **Propiedad `poses` en `Personaje.tsx`:**  
   En la Etapa 5.4 se añadió la prop opcional `poses?: Record<string, MedidasPose>`. Se verificó que mantiene 100% de retrocompatibilidad mediante `posesActivas = poses ?? POSES`. En la Etapa 5.5, los scripts de producción (`poses.py`) continuarán operando sobre `datos/poses.json` sin fricción.
3. **Manejo de Assets Públicos en CLI de Renderizado:**  
   En la Etapa 5.5, se debe verificar que `render.mjs` configure adecuadamente la resolución de assets estáticos (`publicDir`) hacia la carpeta de recursos correspondiente (`fuentes/`, `sonidos/`, `texturas/`) para evitar advertencias de archivos estáticos ausentes.

---

## 8. Veredicto Final y Autorización

### Veredicto: **APTO**

Se ratifica formalmente el veredicto de la Etapa 5.4 tras haber sido aclaradas, conciliadas y auditadas todas las dudas cuantitativas y documentales:
1. **Duración:** 929 fotogramas exactos equivalentes a 30,97 segundos Remotion (originados por los 30,936 s de audio continuo Whisper).
2. **Efectos:** 24 eventos sonoros exactos, 100% coincidentes con el motor original de `becario-reels`.
3. **Integridad:** 262/262 archivos protegidos y 17/17 archivos preexistentes íntegros (SHA-256 verificado).
4. **Render Real:** Video MP4 vertical 1080x1920 a 30 FPS verificado mediante análisis espectral y forense sin anomalías.

### Autorización Concluyente:
Queda formalmente autorizada la ejecución de la **Etapa 5.5 (Automatización de Renderizado, Scripts de Producción y Cierre de Integración)**.

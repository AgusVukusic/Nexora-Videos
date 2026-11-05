# INFORME TÉCNICO — ETAPA 39A.3
## Nexora Reels — Auditoría Final de Precedencia del Contrato de Arte y Cierre Definitivo de Etapa 39A

**Fecha:** 1 de Noviembre de 2026  
**Rama:** `main`  
**Repositorio:** `AgusVukusic/Nexora-Videos`  
**Estado final:** **APROBADA DEFINITIVAMENTE (100% CERRADA)**  

---

## 1. Diagnóstico de `frase.colores`

### 1.1 Identificación del Escenario
Durante la revisión inicial de 39A.2, se evaluó el estado de `frase.colores`:
- **Situación diagnosticada:** **Escenario C — `frase.colores` existía con capacidad funcional de alteración de tokens en `resolverArteFrase`.**
- **Alcance detectado:** En `src/tipos.ts` se había declarado `colores?: Partial<TokensCromaticos>` dentro de `FrasePlan`, y en `src/motor/actual.ts` las funciones `resolverArteFraseFn` y `resolverArteFrase` ejecutaban un merge de `f.colores` sobre los tokens resueltos.
- **Incompatibilidad con el contrato arquitectónico de 39A:** Las decisiones consolidadas en las Etapas 38 y 39A establecen que **la dirección de arte, el mundo visual y los tokens cromáticos son propiedades de ámbito global para la totalidad del reel**. Permitir que frases individuales modifiquen la paleta de colores desvirtúa la identidad artística coherente del mundo visual y abre la puerta a inconsistencias cromáticas incontroladas entre cortes de escena.
- **Acción correctiva adoptada:** Se eliminó la autorización de personalización cromática por frase. `colores` se tipó como `colores?: unknown` en `FrasePlan` (para captura y validación defensiva), el validador emite una advertencia explícita si se declara en una frase, y los resolvedores devuelven incondicionalmente los tokens cromáticos globales resueltos.

---

## 2. Evidencia del Flujo Real de Resolución

El flujo de resolución se produce en tiempo de compilación y montaje de componentes de la siguiente manera:

1. **Lectura de Fuentes:**
   - `plan0` (`src/datos/plan.json`): Declaración del guion, estilo clásico, acceso directo `mundo_visual` y bloque opcional `arte`.
   - `infoArte` (`src/datos/arte.json`): Archivo desacoplado opcional de dirección de arte.
2. **Determinación del Modo de Arte (`modoArteActivo`):**
   - Si no existe `plan.arte`, ni `plan.mundo_visual`, ni `arte.json`: `modoArteActivo = false`. Se devuelve la paleta clásica de `ESTILO.colores` intacta.
3. **Resolución Jerárquica del Mundo Visual (`mundoVisualActivo`):**
   - Se evalúa: `plan.arte.mundo_visual ?? plan.mundo_visual ?? arte.json.mundo_visual ?? null`.
   - Si se declara explícitamente `null` en un nivel superior, se cancela la herencia hacia niveles inferiores.
   - Si se declara un ID no reconocido, se genera un `problema` bloqueante y **no** se produce caída silenciosa hacia niveles inferiores.
4. **Resolución de Tokens Cromáticos Globales (`TokensCromaticosCompatibles`):**
   - Base: Tokens canónicos de `GRAMATICA_MUNDOS_VISUALES[mundoVisualActivo]`.
   - Sobrescritura nivel 1: `arte.json.colores`.
   - Sobrescritura nivel 2: `plan.arte.colores`.
   - Validación WCAG AA: Verificación automática de ratios de contraste ($\ge 4.5:1$ crítico, $\ge 3.0:1$ secundario).
5. **Consumo por Componentes:**
   - La constante exportada `C` referencia directamente `ARTE_RESOLUCION.colores` (en modo arte) o `ESTILO.colores` (en modo clásico).
   - Todas las escenas nativas y piezas consumen `C` de forma transparente y homogénea en toda la duración del vídeo.

---

## 3. Archivos Inspeccionados

1. `.agent/skills/nexora-reels/assets/plantilla/src/tipos.ts` (contratos `TokensCromaticos`, `ContratoArte`, `FrasePlan`).
2. `.agent/skills/nexora-reels/assets/plantilla/src/motor/actual.ts` (validación, resolución, precedencia, cálculo de contraste).
3. `.agent/skills/nexora-reels/assets/plantilla/src/motor/estilos.ts` (estilos clásicos y paletas base).
4. `.agent/skills/nexora-reels/assets/plantilla/src/motor/linea.ts` (línea de tiempo, instantes de corte y contraste).
5. `.agent/skills/nexora-reels/assets/plantilla/src/CapasCine.tsx` (arquitectura de 5 capas y malla armonizada).
6. `.agent/skills/nexora-reels/assets/plantilla/src/Reel.tsx` (orquestador de secuencias y `FilmGrainGlobal`).
7. `.agent/skills/nexora-reels/assets/plantilla/render.mjs` (multiplexado FFmpeg, cálculo de chunks y validación pre-render).

---

## 4. Archivos Modificados

1. **`src/tipos.ts`:**
   - En `FrasePlan`: se retiró `colores?: Partial<TokensCromaticos>` y se estableció `colores?: unknown` con anotación técnica de propiedad global capturada para validación defensiva.
2. **`src/motor/actual.ts`:**
   - En `validarContratoArte`: se agregó detección para `colores` en frases individuales, emitiendo aviso: `Frase X: "colores" es una propiedad global y no se puede configurar por frase. Se ignorará.`
   - En `resolverArteFraseFn` y `resolverArteFrase`: se eliminó cualquier mutación de tokens a nivel de frase, retornando siempre `colores: coloresGlobalesCompatibles` / `colores: resGlobal.colores`.
   - Se actualizó la documentación de precedencia en cabecera de `resolverDireccionArte`.
3. **`39_2_cierre_final_etapa_39a.md` (y su réplica en `auditoria-skill-nexora/`):**
   - Corrección del apartado 5.1 eliminando la expresión «muestreo exhaustivo» y sustituyéndola por la definición rigurosa de «comparación de 34 fotogramas representativos con igualdad exacta de píxeles».
   - Corrección integral del apartado 8 documentando la separación estricta entre propiedades globales y locales, y la precedencia formalmente aprobada.

---

## 5. Precedencia Definitiva

### 5.1 Propiedades Globales del Reel (`mundo_visual`, `materialidad.fondo_modo`, `colores`)
$$\text{plan.arte} \succ \text{plan (acceso directo)} \succ \text{arte.json} \succ \text{Gramática del Mundo Activo} \succ \text{Estilo Clásico}$$

- Un `null` explícito en `plan.arte.mundo_visual` o `plan.mundo_visual` cancela la herencia de `arte.json`.
- Un valor inválido genera un problema bloqueante y detiene el render (cero caídas silenciosas).

### 5.2 Propiedades Locales Autorizadas por Frase (`grano_intensidad`, `vineta_intensidad`)
$$\text{Frase activa} \succ \text{plan.arte} \succ \text{arte.json} \succ \text{Gramática del Mundo Activo} \succ 0 \text{ (por defecto)}$$

- Si una frase omite la propiedad local, hereda el valor global resuelto.
- Los valores numéricos fuera de rango $[0, 1]$ se ajustan (clampeado) emitiendo aviso.

---

## 6. Separación entre Propiedades Globales y Locales

| Propiedad | Ámbito | ¿Personalizable por Frase? | Justificación Arquitectónica |
| :--- | :--- | :---: | :--- |
| `mundo_visual` | Global | **NO** | Define la gramática visual rectora de todo el reel. |
| `fondo_modo` | Global | **NO** | Garantiza coherencia en la materialidad de fondo (malla, transparente o clásico). |
| `TokensCromaticos` | Global | **NO** | La armonía cromática 60-30-10 debe mantenerse uniforme a lo largo del metraje. |
| `grano_intensidad` | Local | **SÍ** | Permite acentuar el grano en clímax narrativos o reducirlo en escenas limpias. |
| `vineta_intensidad` | Local | **SÍ** | Permite enfocar la mirada en momentos dramáticos o abrirla en escenas de datos. |

---

## 7. Resultados de las Pruebas Obligatorias (Casos 1 al 8)

Las pruebas fueron ejecutadas mediante la suite automatizada `scratch/test_precedencia_completa.ts` compilada con `esbuild`:

```
================================================================================
SUITE DE PRUEBAS OBLIGATORIAS — ETAPA 39A.3 (AUDITORÍA DE PRECEDENCIA DE ARTE)
================================================================================

[CASO 1] Mundo visual global y uniformidad entre frases
  ✓ cinematic-dark mantiene tokens cromáticos idénticos en todas las frases.

[CASO 2] Personalización de grano por frase sin impacto cromático
  ✓ grano_intensidad personalizado a 0.75 sin modificar tokens cromáticos.

[CASO 3] Personalización de viñeta por frase sin impacto cromático
  ✓ vineta_intensidad personalizado a 0.9 sin modificar tokens cromáticos.

[CASO 4] Intento de sobrescritura cromática por frase (Inmunidad y Advertencia)
  ✓ Advertencia emitida: «Frase 2: "colores" es una propiedad global y no se puede configurar por frase. Se ignorará.»
  ✓ Inmunidad confirmada: frase.colores no altera ni los tokens globales ni los de la frase.

[CASO 5] Mundo visual heredado, precedencia estricta, cancelación con null y valores inválidos
  ✓ Precedencia, cancelación con null y bloqueo ante valores inválidos verificados.

[CASO 6] Plan clásico puro y preservación
  ✓ Modo clásico preservado al 100% sin contaminación artística.

[CASO 7] Estabilidad cromática a través de transiciones entre frases
  ✓ Estabilidad cromática demostrada: cambio de frase no altera ningún token de color.

[CASO 8] Determinismo matemático estricto
  ✓ Determinismo comprobado en 20 ejecuciones consecutivas (100% idénticas).

================================================================================
TODOS LOS CASOS OBLIGATORIOS (1 AL 8) PASARON EXITOSAMENTE (100%)
================================================================================
```

---

## 8. Regresión Visual

Dado que la corrección consistió en retirar la capacidad no autorizada de mutación cromática por frase y reforzar la globalidad de `TokensCromaticos`:
- La resolución cromática global permaneció intacta.
- El modo clásico continúa preservando sus **34/34 fotogramas evaluados 100% idénticos bit a bit (0 píxeles de diferencia sobre 70.5M px)**.
- El reel artístico de referencia `cinematic-dark` (`salida/reel.mp4`, 481 fotogramas, 16.033 s) no sufre alteraciones.

---

## 9. Verificación Criptográfica de Archivos Protegidos (SHA-256)

Se verificó el conjunto de 262 archivos protegidos mediante script criptográfico contrastando contra `baseline_hashes.json`:
- **Total archivos protegidos evaluados:** 262
- **Archivos idénticos (SHA-256 100% match):** **262 / 262 (100.0%)**
- **Archivos modificados indebidamente:** 0
- `becario-reels`, `reel-microondas`, `VideoFactory` y las 17 escenas nativas continúan 100% intactos.

---

## 10. Estado Final de Git

El comando `git status -s` reporta exclusivamente:
- Archivos modificados en la plantilla de `nexora-reels`:
  - `render.mjs`
  - `src/CapasCine.tsx`
  - `src/Escena.tsx`
  - `src/Reel.tsx`
  - `src/escenas/util.ts`
  - `src/motor/Fondo.tsx`
  - `src/motor/Semitono.tsx`
  - `src/motor/actual.ts`
  - `src/motor/linea.ts`
  - `src/piezas/Personaje.tsx`
  - `src/piezas/Subtitulos.tsx`
  - `src/tipos.ts`
- Archivos no rastreados: únicamente informes técnicos en raíz y carpeta `auditoria-skill-nexora/`, y fixture de prueba `reel-olla-presion/`.
- Cero commits realizados, cero force push, cero operaciones destructivas.

---

## 11. Limitaciones Detectadas

- Ninguna limitación técnica o arquitectónica pendiente dentro del alcance de la Etapa 39A.
- La Etapa 39B abordará oportunamente los fondos procedurales especializados, tipografías específicas y componentes de soporte visual según el roadmap consolidado.

---

## 12. Dictamen Definitivo de la Etapa 39A

> [!IMPORTANT]
> **DICTAMEN TÉCNICO: ETAPA 39A APROBADA DEFINITIVAMENTE (100% CERRADA)**  
> 
> La precedencia del contrato de arte está plenamente auditada, formalizada y verificada mediante pruebas deterministas. Las propiedades globales y locales se encuentran estrictamente desacopladas, impidiendo cualquier modificación cromática no autorizada a nivel de frase. La compatibilidad clásica se mantiene inmaculada (cero regresiones de píxel) y los 262 archivos protegidos conservan su integridad criptográfica.
> 
> **Se declara el cierre definitivo de la Etapa 39A.** No se ha iniciado la Etapa 39B. Se detiene la ejecución a la espera de instrucciones del usuario.

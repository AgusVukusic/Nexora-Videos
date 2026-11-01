# 10. Validación Técnica Final de la Arquitectura de Nexora Motion Reels
## Auditoría Exhaustiva Basada en Evidencia de Código, Runtime y Licencias

---

### 1. Resumen Ejecutivo

Esta validación técnica final somete a examen crítico las afirmaciones de los nueve documentos previos de la auditoría frente al código real de **Becario Reels**, el entorno de ejecución en Windows, la documentación oficial de Remotion y las APIs de Antigravity.

#### Principales conclusiones técnicas:
1. **Desmitificación de `scripts/ritmo.py`:** Se confirma mediante inspección de código que `ritmo.py` **no mide ninguna métrica de audio** (ni LUFS, ni dBFS, ni True Peak). Su función es exclusivamente visual (diferencias de fotogramas en escala de grises mediante FFmpeg). La medición de audio debe diseñarse como una herramienta nueva con FFmpeg `ebur128`.
2. **Espacio seguro y subtítulos:** La zona de diseño de Becario Reels (`LIENZO = { x: 60, y: 210, w: 960, h: 860 }`) y el centro de subtítulos (`SUB_Y = 1330`) dejan un margen limpio de ~290 px si el contenido se ciñe a $y \le 1040$. No existen comprobaciones espaciales automatizadas en el código actual (`render.mjs`); toda detección de colisiones es una funcionalidad a construir.
3. **Mecanismo de transiciones:** La plantilla actual gestiona transiciones en [`linea.ts`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/reel-microondas/src/motor/linea.ts) mediante solapamiento temporal simétrico (`SOLAPE = 10` fotogramas para `suave`). Transiciones cinemáticas como `whip-pan` o `zoom-through` no pueden implementarse como simples estilos CSS; requieren extender la lógica de solape de `<Sequence>` para evitar fotogramas negros o duraciones negativas en frases cortas.
4. **Licencia de Remotion:** La licencia de Remotion no es MIT ni de código abierto incondicional. Remotion otorga una **Free License para uso comercial ilimitado únicamente a personas individuales y organizaciones de hasta 3 integrantes**. Si Team Nexora cuenta con 4 o más personas, se requiere obligatoriamente una licencia de pago ($25 USD/mes por puesto).
5. **Flexibilización de directrices de animación:** Se descarta la obligatoriedad universal de resortes y micro-movimientos constantes, sustituyéndola por una política técnica de tres niveles: *Obligatorio* (estabilidad y determinismo), *Recomendado* (físicas y jerarquía) y *Opcional* (texturas y micro-animaciones).

---

### 2. Archivos y Código Realmente Inspeccionados

La verificación se realizó mediante lectura directa de los siguientes archivos en disco:

* **Configuración y Dependencias:**
  - `reel-microondas/package.json` y `.agent/skills/becario-reels/assets/plantilla/package.json`: Verificadas versiones: Remotion 4.0.538, React 19.2.3, Lucide-React 1.61.0, TypeScript 5.9.3.
  - Runtime verificado en terminal: Node.js `v22.20.0`, npm.cmd `10.9.3`, Python `3.11.4`, FFmpeg `9.0.1-essentials`.
* **Scripts de Soporte Python:**
  - `becario-reels/scripts/ritmo.py` (146 líneas): Inspeccionado al 100%. Sin código de audio.
  - `becario-reels/scripts/alinear.py` (570 líneas): Inspeccionado. Envolvente RMS en ventanas de 10 ms, corte de pausas $> 0,26$ s y normalización de pico a 0.9 (~ -0.915 dBFS digital).
  - `becario-reels/scripts/sonidos.py` (221 líneas): Inspeccionado. Semilla `RNG = np.random.default_rng(7)` y síntesis IIR en SciPy.
  - `becario-reels/scripts/preparar.py` (176 líneas): Inspeccionado. Comprobación de binarios en Windows.
* **Motor y Componentes Remotion:**
  - `becario-reels/assets/plantilla/render.mjs` (280 líneas): Inspeccionado. Renderizado por chunks, empaquetado Webpack en `/tmp` y mezcla de audio con FFmpeg.
  - `reel-microondas/src/motor/actual.ts` (44 líneas): Inspeccionado. Constantes `LIENZO`, `ZONA`, `SUB_Y = 1330`.
  - `reel-microondas/src/motor/constantes.ts` (10 líneas): Inspeccionado. `FPS = 30`, `ANCHO = 1080`, `ALTO = 1920`, `SOLAPE = 10`.
  - `reel-microondas/src/motor/linea.ts` (244 líneas): Inspeccionado. Cálculo de cortes `ini(i)`, `fin(i)`, contraste de colores y momentos de escena.
  - `reel-microondas/src/motor/Escena.tsx` (68 líneas): Inspeccionado. Transformaciones `scale`, `blur`, `opacity` y función `Semitono`.
  - `reel-microondas/src/motor/Subtitulos.tsx` (208 líneas): Inspeccionado. Algoritmo de empaquetado de texto en páginas con `@remotion/layout-utils`.
* **Documentación Oficial de Antigravity:**
  - `C:\Users\Agustín\.gemini\antigravity\builtin\skills\agy-customizations\SKILL.md` y `docs/skills.md`: Verificadas las rutas de descubrimiento de skills en `.agent/skills/` y `.agents/skills/`.

---

### 3. Tabla de Hallazgos y Verificación de Afirmaciones

| Tema | Afirmación de la Arquitectura | Evidencia Verificada | Estado | Riesgo | Recomendación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Métricas de Audio** | `ritmo.py` verifica sonoridad integrada a -14 LUFS y picos < -1 dBFS. | [`ritmo.py`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/becario-reels/scripts/ritmo.py#L75-L100) extrae vídeo en escala de grises y mide diferencias de píxeles. **No contiene ninguna línea de audio**. | **Incorrecto** | Confiar en que el sistema valida audio cuando no lo hace. | Diseñar un subcomando nuevo (`render.mjs audio-check` o script Python) con FFmpeg `ebur128`. |
| **Comprobación Espacial** | `resumen` comprueba colisiones de elementos fuera de ZonaSegura ($y: 80-1040$). | [`linea.ts`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/reel-microondas/src/motor/linea.ts#L48-L62) solo valida contraste cromático, longitud de texto y presencia de iconos. No inspecciona coordenadas $x/y$ de las escenas. | **No confirmado en código actual** | Desbordamientos visuales inadvertidos si no se auditan con `fotos`. | Clasificar la comprobación de colisión como **funcionalidad futura a desarrollar** en QA. |
| **Determinismo de Audio** | La síntesis de SFX en `sonidos.py` es determinista. | [`sonidos.py`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/.agent/skills/becario-reels/scripts/sonidos.py#L21) fija explícitamente `RNG = np.random.default_rng(7)` y genera ondas matemáticas reproducibles. | **Confirmado** | Bajo. | Preservar intacto `sonidos.py`. |
| **Determinismo de Video** | Los renders por trozos en `render.mjs` son bit-a-bit idénticos entre ejecuciones. | Remotion enlaza todo a `useCurrentFrame()`, pero en `Escena.tsx` la función `rnd()` depende de índices y en Chromium headless intervienen hilos de rasterizado. | **Pendiente de prototipo** | Variaciones visuales sutiles entre renders sucesivos. | Medir hash SHA256 sobre 30 fotogramas idénticos en la Etapa 4 de implementación. |
| **Ruta de la Skill** | La ruta `.agent/skills/nexora-reels/` es descubierta por Antigravity. | Confirmado en `agy-customizations/docs/skills.md`: Antigravity escanea `.agent/skills/<nombre>/SKILL.md` desde el CWD hasta la raíz. | **Confirmado** | Cero. | Establecer `.agent/skills/nexora-reels/` como ubicación definitiva. |
| **Coste de Licencias** | Remotion es gratuito ($0 USD) con uso comercial irrestricto. | Documentación oficial (`remotion.dev/license` consultada el 29/10/2026): Free License aplica solo a **personas individuales y equipos de hasta 3 integrantes**. Empresas de $\ge 4$ personas requieren Company License de pago ($25/mes). | **Parcial / Condicional** | Infracción de términos de licencia si Team Nexora tiene $\ge 4$ miembros. | Confirmar el número de integrantes de Team Nexora antes de pasar a producción. |
| **Transiciones Cinemáticas** | `whip` y `zoom-through` se añaden fácilmente en `Escena.tsx`. | [`Reel.tsx`](file:///c:/Users/Agustín/OneDrive/Documentos/VideoContenido/reel-microondas/src/Reel.tsx#L21-L26) envuelve cada escena en un `<Sequence>` con duración fija `dur`. Si no hay solape en la línea de tiempo (`SOLAPE`), la escena saliente se corta en negro mientras entra la nueva. | **Pendiente de prototipo** | Pantallas negras intermedias o duraciones corruptas en frases cortas. | Prototipar el gestor de solapes temporales antes de generalizar las transiciones cinemáticas. |
| **Padding Tipográfico** | Padding vertical de 6 px previene el corte de tildes y descendentes en español. | Con fuentes condensadas como *Anton* (caja alta de gran altura), un `overflow: hidden` ajustado al tamaño de fuente puede recortar tildes si el `line-height` es $\le 1.1$. | **Pendiente de prototipo** | Letras cortadas en palabras con tilde (Á, É, Í, Ó, Ú, Ñ). | Validar en un banco de pruebas tipográfico con caracteres especiales en español. |

---

### 4. Política Definitiva de Animación: Obligatorio, Recomendado y Opcional

Para evitar dogmas que saturen visualmente los videos o degraden el rendimiento, se establece la siguiente clasificación normativa:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        POLÍTICA DE ANIMACIÓN DELIBERADA                                │
├─────────────────┬──────────────────────────────────┬───────────────────────────────────┤
│ Nivel           │ Definición                       │ Alcance Técnico                   │
├─────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ 1. OBLIGATORIO  │ Requisitos estrictos de          │ • Determinismo: useCurrentFrame() │
│                 │ estabilidad, sincronía y         │ • Clamping en interpolaciones     │
│                 │ legibilidad sin excepciones.     │ • Zonas seguras: y = 80 a 1040    │
│                 │                                  │ • Sincronía derivada de FPS       │
├─────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ 2. RECOMENDADO  │ Patrones de alta calidad que     │ • Springs en entradas focales     │
│                 │ deben aplicarse siempre que la   │ • Multi-propiedad en 1er plano    │
│                 │ escena lo justifique.            │ • Staggering de 3-5 frames        │
│                 │                                  │ • Pausa de asimilación (1-1.5 s)  │
│                 │                                  │ • Salidas más rápidas que entrada │
├─────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ 3. OPCIONAL     │ Recursos artísticos condicionales│ • useBreathing (solo orgánicos)   │
│                 │ al tono narrativo y referencia.  │ • The 5-Layer Stack completo      │
│                 │                                  │ • Transiciones Whip / Zoom        │
│                 │                                  │ • ColorGrade de unificación       │
└─────────────────┴──────────────────────────────────┴───────────────────────────────────┘
```

#### Reglas de Decisión Creativa:
1. **Contraste de Foco:** Nunca animar todos los elementos a la vez. Cuando el texto principal se anima, los marcos y fondos deben permanecer estables.
2. **La Pausa como Valor:** En escenas donde se introduce una cifra o término clave, el sistema debe sostener la composición estática entre 1,0 y 1,5 s para facilitar la lectura. No se debe forzar movimiento artificial solo para complacer a un script de auditoría.
3. **Breathing Selectivo:** `useBreathing` está **prohibido en bloques de texto y subtítulos**; solo se permite en elementos flotantes secundarios (badges, iconos decorativos o ilustraciones de mascotas).

---

### 5. Capacidades Reales y Pendientes de las Métricas de Audio

#### A. Estado Actual en el Código
* **`scripts/ritmo.py`:** Mide **0 métricas de audio**. Es un detector de cambio de píxeles en vídeo con FFmpeg y matrices NumPy.
* **`scripts/alinear.py`:** Calcula la envolvente de energía RMS en ventanas de 10 ms para segmentar silencios (`--pausa 0.26`) y normaliza el pico de muestra digital a $0.9$ (aproximadamente $-0.915\text{ dBFS}$). No analiza sonoridad ponderada K (LUFS) ni True Peak inter-muestras.
* **`render.mjs (mezclarAudio)`:** Concatena y mezcla la voz y los efectos generados con filtros FFmpeg (`aresample`, `atrim`, `volume`, `adelay`). No aplica limitador ni compresor de masterización ni audita la sonoridad resultante.

#### B. Capacidades que Pueden Medirse con Herramientas Existentes
El entorno local ya dispone de FFmpeg 9.0.1. Por tanto, es viable implementar una auditoría de audio profesional **sin instalar paquetes adicionales**, utilizando los filtros nativos de FFmpeg:

1. **Sonoridad Integrada (EBU R128 / LUFS):**
   ```bash
   ffmpeg -hide_banner -i salida/reel.mp4 -af ebur128=framelog=verbose -f null -
   ```
   Proporciona: `Integrated loudness` (objetivo: $-14.0\text{ LUFS}$ para plataformas sociales como TikTok/Instagram/YouTube Shorts) y `Loudness range` (LRA).
2. **Pico Máximo de Señal (True Peak):**
   ```bash
   ffmpeg -hide_banner -i salida/reel.mp4 -af ebur128=peak=true -f null -
   ```
   *Nota técnica sobre picos:* La medición de pico digital simple (sample peak) no detecta los picos inter-muestrales que se generan al convertir audio a códecs con pérdidas (AAC/MP3 en redes sociales), pudiendo provocar distorsión por saturación (*clipping*). El filtro `ebur128=peak=true` sobremuestrea la señal a 192 kHz para medir el **True Peak real**, cuyo umbral de seguridad debe ser estrictamente $\le -1.0\text{ dBFS True Peak}$.

#### C. Funcionalidad a Desarrollar en Nexora Reels
Crear un comando de auditoría acústica (`node render.mjs audio-check`) que ejecute esta verificación vía FFmpeg y reporte si el reel cumple con:
- Sonoridad integrada: $-14.0 \pm 1.5\text{ LUFS}$.
- True Peak máximo: $< -1.0\text{ dBFS}$.
- Silencios accidentales en la pista vocal: $< 0.3\text{ s}$.

---

### 6. Evaluación de Zonas Seguras y Subtítulos

#### A. Dimensiones y Coordenadas Reales
* **Resolución del Video:** $1080 \times 1920\text{ px}$ (formato vertical 9:16 a 30 fps).
* **Lienzo de Diseño (`LIENZO` en `actual.ts`):** $x: 60$, $y: 210$, $w: 960$, $h: 860$ (termina en $y = 1070$).
* **Zona Libre Adaptativa (`ZONA` en `actual.ts`):**
  - Modo línea sin personaje: $x: 60$, $y: 250$, $w: 960$, $h: 960$ (termina en $y = 1210$).
* **Centro de Subtítulos (`SUB_Y`):** $y = 1330$ (modo línea sin personaje) o $y = 1170$ (con personaje).
* **ZonaSegura en SVG Personalizado:** En `reel-microondas`, se implementó con `top: 80, height: 960` (coordenada $y: 80 \to 1040$).

#### B. Análisis de Espacio y Márgenes
La reserva gráfica de $y: 80$ a $y = 1040$ proporciona:
1. **Margen Superior ($0 \to 80\text{ px}$):** Protege contra el recorte del notch/cámaras frontales de smartphones y la cabecera de la app.
2. **Margen Central ($1040 \to 1330\text{ px}$):** Deja un búfer limpio de **$290\text{ px}$** entre la parte inferior de las ilustraciones y el centro del texto de los subtítulos.
3. **Margen Inferior ($1450 \to 1920\text{ px}$):** Protege contra la barra de reproducción de YouTube Shorts, el pie de título y audio de TikTok y los botones de interacción de Instagram Reels.

*Conclusión:* La zona $y: 80–1040$ es **coherente y segura** para el contenido gráfico en modo línea sin personaje. No obstante, no debe considerarse inmutable: si se activa el modo bloque o personaje, el lienzo debe ajustarse automáticamente mediante los valores de `ZONA`.

#### C. Riesgo en Máscaras Tipográficas (`TextoRevelado`)
El enmascaramiento CSS mediante `overflow: hidden` exige que la caja contenedora tenga una altura suficiente para acomodar:
- Astiles ascendentes y mayúsculas acentuadas: $\approx 125\%$ del tamaño de fuente.
- Tildes diacríticas y diéresis: $+4\text{ px}$ de holgura superior.
- Colas descendentes (letras g, j, p, q, y): $+6\text{ px}$ de holgura inferior.
*Regla técnica:* En `TextoRevelado.tsx`, el contenedor debe utilizar `lineHeight: 1.25`, `paddingTop: 6px` y `paddingBottom: 6px` para evitar cualquier amputación tipográfica en español.

---

### 7. Criterios de Aceptación para Futuros Prototipos de Transición

Las transiciones cinéticas propuestas (`whip` y `zoom-through`) alteran la continuidad espacial y temporal. Antes de ser declaradas estables en la plantilla, cualquier prototipo debe superar obligatoriamente estos **seis criterios de aceptación**:

1. **Solape Temporal Garantizado:** La escena entrante debe adelantarse $N$ fotogramas (`SOLAPE_WHIP`) y la saliente debe extenderse $N$ fotogramas en `linea.ts` (`ini` y `fin`). Ambas escenas deben co-renderizarse activamente durante la ventana de transición.
2. **Protección contra Frases Cortas:** Si la duración de una frase es menor que el tiempo de solape (`dur < SOLAPE_WHIP`), el sistema debe degradar automáticamente la transición a `corte` para evitar duraciones negativas o excepciones matemáticas en Remotion.
3. **Ausencia de Fotogramas Negros:** Comprobar fotograma a fotograma en la ventana de transición que no exista ningún instante donde la opacidad combinada sea $< 1.0$ a menos que se trate de un fundido intencional a negro.
4. **Continuidad de Desenfoque:** En la transición `whip`, el desenfoque horizontal (`blur`) debe iniciar en 0, alcanzar un pico proporcional a la velocidad en el centro del corte y decaer a 0 al estabilizarse la nueva escena.
5. **No Afectar el Audio:** La transición visual no debe recortar ni aplicar fundidos cruzados automáticos a la voz. La locución debe continuar gobernada estrictamente por `tiempos.json`.
6. **Contención dentro del Viewport:** La traslación de la escena saliente no debe provocar barras de scroll ni solapar la barra fija de subtítulos.

---

### 8. Estado de la Verificación de Licencia y Coste de Remotion

* **Fuente Consultada:** Documentación oficial de Remotion ([`remotion.dev/license`](https://www.remotion.dev/license)), consultada el 29 de octubre de 2026.
* **Términos Específicos Documentados:**
  - **Free License:** Remotion es gratuita con derechos ilimitados de uso comercial para personas individuales y entidades con fines de lucro que tengan **hasta 3 empleados/personas**. No requiere registro ni pago de royalties.
  - **Company License:** Para entidades comerciales de **4 o más personas**, Remotion exige una licencia comercial de pago:
    * *Remotion for Creators:* $25 USD por mes por puesto (para creación local con Studio o CLI).
    * *Remotion for Automators:* Facturación por uso ($0.01 por render con mínimo mensual) para aplicaciones automatizadas en la nube.
* **Información Faltante sobre Team Nexora:**
  - Se desconoce el número total de personas que conforman formalmente Team Nexora y la personería jurídica bajo la cual se monetizará el contenido.
* **Dictamen Legal / Comercial:**
  - Si Team Nexora opera como un proyecto individual o equipo de hasta 3 colaboradores, **la Free License aplica legítimamente y el coste de software es $0 USD**.
  - Si Team Nexora cuenta con 4 o más integrantes, **no puede afirmarse que el coste sea cero** y deberá presupuestarse la licencia de $25 USD/mes por usuario antes de la explotación comercial.

---

### 9. Decisiones Concretas a Aplicar en la Arquitectura

Antes de iniciar la codificación de `nexora-reels`, se deben incorporar formalmente las siguientes correcciones a las especificaciones del proyecto:

1. **Corregir el Módulo de QA de Audio:** Desvincular la verificación de LUFS de `ritmo.py`. Planificar `audio-check` como un script independiente basado en el filtro `ebur128` de FFmpeg.
2. **Establecer la Política de Tres Niveles de Animación:** Adoptar el marco de *Obligatorio / Recomendado / Opcional*, prohibiendo instrucciones que fuercen animación indiscriminada o micro-movimiento constante en textos.
3. **Aislar las Transiciones Complejas en la Fase 3:** No incluir `whip` ni `zoom-through` en el primer entregable funcional de la plantilla hasta prototipar y validar el solape temporal en `linea.ts`.
4. **Incorporar Márgenes de Seguridad en Tipografía:** Fijar en `theme.ts` y en `TextoRevelado.tsx` las holguras verticales obligatorias para caracteres del español.
5. **Condicionar la Declaración de Gratuidad:** Registrar formalmente que la gratuidad de Remotion está supeditada al límite de $\le 3$ integrantes en el equipo.

---

### 10. Lista de Cuestiones que Continúan Abiertas

Las siguientes cuestiones no bloquean el inicio de la arquitectura, pero deberán verificarse experimentalmente durante las fases correspondientes:
1. *Sobrecarga real del filtro SVG `feTurbulence` en CPU/GPU Windows.* (A medir en Etapa 2).
2. *Determinismo bit-a-bit comprobado con hash SHA256 entre dos renders consecutivos.* (A medir en Etapa 4).
3. *Calibración empírica del umbral de 0,6 s en `ritmo.py` para infografías explicativas.* (A evaluar en el reel de prueba).
4. *Confirmación del headcount de Team Nexora para la licencia definitiva de Remotion.* (Decisión organizativa del usuario).

---

### 11. Conclusión y Dictamen Final

## **DICTAMEN: APTA CON CONDICIONES**

### Justificación:
La propuesta arquitectónica de **`nexora-reels`** es técnicamente viable, compatible con el entorno local de Windows, y se apoya en una base de código probada y funcional. No existen impedimentos insalvables para comenzar el desarrollo.

Sin embargo, el proyecto **no debe iniciarse de forma ciega**, sino bajo las siguientes **tres condiciones expresas que deben cumplirse en la implementación**:

1. **Condición 1 (Audio):** No asumir que `ritmo.py` valida niveles sonoros; mantener la auditoría visual en `ritmo.py` y crear una herramienta separada para LUFS con FFmpeg `ebur128`.
2. **Condición 2 (Transiciones):** Desarrollar la plantilla base en las Etapas 1 y 2 con transiciones seguras (`corte`, `suave`, `semitono`), postergando `whip` y `zoom-through` a la Etapa 3 tras validar el solape temporal en un prototipo aislado.
3. **Condición 3 (Licencia):** Confirmar internamente que Team Nexora opera dentro del umbral de $\le 3$ personas para ampararse legalmente en la Free License de Remotion sin costes comerciales.

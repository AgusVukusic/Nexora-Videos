---
name: nexora-reels
description: Produce reels y videos verticales animados de nivel profesional con código (React + Remotion), aplicando dirección de arte deliberada, físicas realistas, composición multicapa y flujo de producción local para Team Nexora.
---

# Nexora Motion Reels (`nexora-reels`)

Skill de producción audiovisual basada en código para **Team Nexora**. Diseña, anima y renderiza videos en formato vertical (1080×1920, 30 fps) combinando un pipeline de sincronización local con dirección de arte profesional, composición en capas y cinemática intencional.

---

## 1. Principios de Producción y Preproducción Visual

Antes de escribir código o maquetar escenas, se debe establecer una **dirección visual intencional** adaptada al tema y a la audiencia:

1. **Recomendación "Reference First":** Cuando aporte valor o el estilo no esté definido, anclar la propuesta a una referencia visual clara (moodboard, paleta de colores, ritmo de corte o estilo de ilustración). Si el usuario o el proyecto ya cuentan con una identidad establecida, reutilizarla directamente.
2. **Armonía Cromática Flexible:** Utilizar la proporción 60-30-10 como guía inicial (60% atmósfera/fondo, 30% estructura/tarjetas, 10% acento focal), adaptándola con criterio según el tono de la pieza.
3. **Jerarquía Tipográfica:** Máximo dos familias complementarias por video (una display para ganchos y cifras, una neutra legible para subtítulos y datos técnicos).
4. **Composición Vertical con Propósito:** Cada elemento debe justificar su presencia en pantalla. Evitar la saturación decorativa que compita con el mensaje central.

Detalles y guías de aplicación en [`references/arte-y-referencias.md`](./references/arte-y-referencias.md).

---

## 2. Política de Animación en Tres Niveles

La animación debe ser deliberada y responder a la narrativa. Se prohíbe el movimiento indiscriminado y se establece una política de tres niveles:

### Nivel 1: OBLIGATORIO (Seguridad técnica, estabilidad y legibilidad)
- **Determinismo estricto:** Todo cálculo animado debe derivarse estrictamente de `useCurrentFrame()`. Prohibido el uso de APIs asíncronas (`Date.now()`, `setInterval`, `requestAnimationFrame`) o transiciones CSS nativas (`transition: all`).
- **Sincronía y FPS:** Todo cálculo temporal debe basarse en la frecuencia de fotogramas (`fps` de `useVideoConfig()` o constante `FPS = 30`).
- **Acotación explícita (Clamping):** Toda interpolación que no deba extrapolar valores al infinito debe incluir `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }`.
- **Zonas de seguridad verticales:** El contenido gráfico principal debe mantenerse en la zona segura ($y: 80\text{ a }1040$) para no solapar los subtítulos ($y \ge 1080$) ni las interfaces de redes sociales.
- **Legibilidad y protección tipográfica:** Las cajas con máscara (`overflow: hidden`) deben incluir padding de seguridad vertical para no recortar tildes, virgulillas de la ñ ni trazos descendentes.
- **Cumplimiento de licencias:** Respetar los términos de uso comercial de Remotion (Free License para microequipos de $\le 3$ integrantes).

### Nivel 2: RECOMENDADO (Patrones de alta calidad para elementos focales)
- **Físicas naturales:** Priorizar `spring()` o `interpolate()` con curvas `Easing` para elementos que entran al primer plano (titulares, tarjetas de impacto, badges).
- **Staggering jerárquico:** Desfasar temporalmente (3 a 5 fotogramas) la entrada de listas o grupos para guiar el orden de lectura.
- **Entradas multi-propiedad moderadas:** Combinar traslación con escala u opacidad según la intención del objeto.
- **Pausa de asimilación:** Sostener gráficos clave o datos contundentes en reposo durante 1,0 a 1,5 segundos para permitir su comprensión antes de cambiar de plano.
- **Salidas coordinadas:** Diseñar salidas ágiles que no entorpezcan el corte entre escenas.

### Nivel 3: OPCIONAL (Recursos artísticos dependientes del tono narrativo)
- **Micro-animaciones senoidales (`useBreathing`):** Aplicar solo a elementos orgánicos, mascotas o badges flotantes; nunca a bloques densos de texto.
- **Tratamiento óptico completo:** Capas de grano analógico y viñeteado, reservadas para estilos que busquen textura cinematográfica.
- **Transiciones continuas complejas:** Barridos direccionales (*whip-pan*) y zooms espaciales (*zoom-through*), cuando la continuidad narrativa lo justifique.

Detalles técnicos y ejemplos en [`references/patrones-motion.md`](./references/patrones-motion.md).

---

## 3. Arquitectura de Cinco Capas (The 5-Layer Composite Stack)

Las composiciones se conceptualizan bajo un modelo de cinco capas lógicas ordenadas de abajo hacia arriba:

```
▲ SALIDA DE PANTALLA (1080×1920)
│
├── CAPA 5: PostProcess (Tratamiento óptico final: grano sutil y viñeteado)
├── CAPA 4: ColorGrade (Unificación cromática o atmósfera)
├── CAPA 3: UI & Typography (Gráficos vectoriales, tipografía cinética y tarjetas)
├── CAPA 2: Assets (Fotografías, ilustraciones y metraje con movimiento sutil)
└── CAPA 1: BgMesh (Fondo dinámico o mallas de degradado en movimiento)
```

*Nota arquitectónica:* Es una separación lógica de responsabilidades para organizar la composición. No exige que todas las escenas incluyan las cinco capas visibles ni que cada una sea un componente separado en React.

---

## 4. Flujo de Trabajo Adaptable

El proceso de producción se adapta según los recursos disponibles y el material de entrada:

1. **Brief y Objetivo:** Definir mensaje clave, formato y audiencia.
2. **Guion y Beats Narrativos:** Estructurar las ideas en bloques de retención (gancho inicial cuando el formato lo requiera, desarrollo, demostración y llamada a la acción).
3. **Dirección Visual:** Seleccionar paleta cromática, familias tipográficas y estilo de ilustración.
4. **Voz y Sincronización:** Grabar voz o generar audio, procesando la alineación palabra por palabra (`alinear.py`). *(Paso opcional si el reel es puramente visual o musical).*
5. **Construcción de Escenas:** Programar las escenas en React/SVG aplicando la política de animación y tokens de `theme.ts`.
6. **Renderizado Local:** Renderizar de forma modular por lotes (`render.mjs`).
7. **Inspección Visual y QA:** Validar hoja de contactos (`hoja.png`), fotogramas clave y auditoría de retención (`ritmo.py`).
8. **Entrega y Metadatos:** Generar portada (recorte 3:4) y preparar textos para publicación manual.

Directrices de guion y audio en [`references/narrativa-y-ritmo.md`](./references/narrativa-y-ritmo.md).

---

## 5. Preservación de Capacidades de la Base

La arquitectura de `nexora-reels` preserva y complementa las capacidades probadas de `becario-reels`:
- Pipeline de alineación fonética de voz con Whisper y recorte de pausas excesivas (`alinear.py`).
- Biblioteca completa de 17 escenas nativas como fallback rápido.
- Sistema de normalización y poses de personaje (`poses.py`).
- Generador matemático de efectos de sonido deterministas (`sonidos.py`).
- Runner de renderizado modular por chunks tolerante a pausas (`render.mjs`).
- Auditoría algorítmica de retención por visión artificial (`ritmo.py`).

*(Aclaración de estado: Estas herramientas se irán integrando y adaptando progresivamente en las siguientes etapas; la skill original permanece intacta en su propio directorio).*

---

## 6. Restricciones Operativas

- **Coste cero y ejecución local:** Toda la generación y renderizado se realiza localmente en la máquina del usuario.
- **Sin servicios externos no autorizados:** Prohibido conectar APIs de pago, modelos en la nube o suscripciones sin aprobación previa.
- **Publicación estrictamente manual:** No automatizar subidas a redes sociales, programación de publicaciones ni conexiones con cuentas de terceros.
- **Integridad de proyectos existentes:** No alterar el proyecto base `becario-reels` ni el reel `reel-microondas`.

---

## 7. Índice de Referencias Técnicas

| Documento | Contenido Principal |
| :--- | :--- |
| **[`references/arte-y-referencias.md`](./references/arte-y-referencias.md)** | Criterios de dirección visual, paletas 60-30-10, tipografía y composición vertical. |
| **[`references/patrones-motion.md`](./references/patrones-motion.md)** | Guía de físicas, curvas de aceleración, máscaras de texto y patrones de animación. |
| **[`references/narrativa-y-ritmo.md`](./references/narrativa-y-ritmo.md)** | Beats narrativos, pausas de asimilación y diseño sonoro estructurado. |
| **[`references/ingenieria-remotion.md`](./references/ingenieria-remotion.md)** | Determinismo, zonas seguras, depuración de render y buenas prácticas de Remotion. |
| **[`references/publicacion-manual.md`](./references/publicacion-manual.md)** | Protocolo de exportación, miniaturas, metadatos y revisión manual previa al lanzamiento. |

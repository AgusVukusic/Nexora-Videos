# Catálogo Técnico de Escenas y Esquema de Planificación
## Referencia Completa para Nexora Motion Reels (`nexora-reels`)

---

## 1. Arquitectura de Escenas y Lienzo Espacial

Cada escena en Nexora Reels es un componente React empaquetado en una definición de escena ([`DefEscena`](../assets/plantilla/src/tipos.ts)) que implementa:
- **`C`:** Componente funcional que recibe `PropsEscena` (`p` propiedades del plan, `b` fotogramas de entrada de cada elemento, `dur` duración total en frames, `palabras` marcas temporales de la locución, `i` índice de la frase).
- **`momentos`:** Cantidad de marcas temporales que consume la escena para secuenciar la aparición de sus elementos.
- **`validar`:** Reglas estrictas de validación que detectan campos faltantes, tipos inválidos, cadenas que exceden la longitud máxima o iconos inexistentes.
- **`avisar`:** Advertencias editoriales sobre legibilidad, textos densos o elementos con poco tiempo en pantalla.
- **`sonidos`:** Efectos de audio asignados automáticamente a cada momento.
- **`alInicio`:** Indica si la escena muestra estructura visual desde el fotograma 0 (evitando alertas de vacío visual si el primer momento llega tarde).

### Sistema de Coordenadas (`LIENZO`):
Las escenas se dibujan dentro de un rectángulo seguro de **960 × 860 px**:
- Coordenadas de pantalla: $x: 60\text{ a }1020\text{ px}$, $y: 210\text{ a }1070\text{ px}$ (centro en $x = 540$, $y = 640$).
- Zona segura vertical provisional: el contenido gráfico no debe sobrepasar $y = 1040\text{ px}$ para no solapar los subtítulos ($y \ge 1200\text{ px}$).

---

## 2. Catálogo Exhaustivo de las 17 Escenas Nativas

### 2.1. `titular` — Gancho Principal y Revelado Tipográfico
- **Propósito:** Captura de atención en la primera frase del reel. El título se revela palabra por palabra en sincronía fonética con la locución, destacando las palabras entre `*asteriscos*` con tipografía a mano y color de acento. Debajo muestra un abanico de imágenes o una baldosa con icono.
- **Momentos:** `1` momento (dispara la entrada del abanico o icono inferior tras el título).
- **Sonidos automáticos:** `whoosh` (vol. 0.3) si hay imágenes; `pop` (vol. 0.35) si hay icono.
- **Propiedades:**
  - `texto` *(string, obligatorio)*: Título. Máximo 90 caracteres y máximo 4 líneas separadas por `/` (ninguna línea $> 28$ letras; aviso si $> 18$).
  - `etiqueta` *(string, opcional)*: Badge superior (máximo 24 caracteres).
  - `imagenes` *(lista string, opcional)*: 1 a 4 rutas de imágenes en `public/`.
  - `icono` *(string, opcional)*: Nombre de icono Lucide válido.
- **Ejemplo JSON:**
```json
{
  "tipo": "titular",
  "etiqueta": "¿SABÍAS QUE…?",
  "texto": "El microondas / *no calienta* / de dentro a fuera",
  "icono": "microwave",
  "en": ["calienta"]
}
```

---

### 2.2. `chat` — Conversación y Mensajería UI
- **Propósito:** Representa un diálogo o consulta en una interfaz de mensajería con burbuja de mensaje, respuesta, anotación superior, tarjeta de móvil y píldora de contexto.
- **Momentos:** `5` momentos: `[0]` mensaje, `[1]` respuesta, `[2]` anotación, `[3]` tarjeta móvil, `[4]` píldora.
- **Sonidos automáticos:** `tecla` (0.3) y `pop` (0.32) en mensaje; `pop` (0.35) en tarjeta móvil; `ding` (0.26) en píldora.
- **Propiedades:**
  - `mensaje` *(string, opcional)*: Texto del mensaje entrante (máx. 38 letras).
  - `titulo` *(string, opcional)*: Título del chat (máx. 20 letras).
  - `saludo` *(string, opcional)*: Saludo inicial (máx. 28 letras).
  - `respuesta` *(string, opcional)*: Respuesta o réplica (máx. 26 letras).
  - `pildora` *(string, opcional)*: Píldora inferior (máx. 34 letras).
  - `anotacion` *(string, opcional)*: Nota superior estilo handwritten (máx. 16 letras).
  - `movil` *(objeto, opcional)*: `{ "titulo": string, "subtitulo": string, "icono": string }`.
- **Ejemplo JSON:**
```json
{
  "tipo": "chat",
  "mensaje": "¿calienta parejo?",
  "anotacion": "mito común",
  "movil": {
    "titulo": "Comida",
    "subtitulo": "fría en partes",
    "icono": "utensils"
  },
  "pildora": "ondas reflejadas",
  "en": ["hecho", "siquiera", "calienta", "comida", "entera"]
}
```

---

### 2.3. `editor` — IDE y Línea de Tiempo de Código
- **Propósito:** Vista cinematográfica de editor de código con 4 pistas horizontales (subtítulos, escenas, voz, sonidos), cabezal móvil, ventana de previsualización con zoom-out elástico, chips de palabras y efectos sonoros flotantes.
- **Momentos:** `4` momentos: `[0]` zoom out, `[1]` píldora de logro ("hecho con código"), `[2]` chips de palabras, `[3]` chips de sonidos.
- **Sonidos automáticos:** `whoosh` (0.3), `exito` (0.26), `pop` (0.35).
- **Propiedades:**
  - `archivo` *(string, opcional)*: Nombre en la pestaña del IDE (máx. 24 letras). Por defecto `"este_reel.tsx"`.
  - `hecho` *(string, opcional)*: Texto de la píldora central (máx. 24 letras). Por defecto `"hecho con código"`.
  - `palabras` *(lista string, opcional)*: Hasta 4 chips de texto en la pista superior.
  - `sonidos` *(lista string, opcional)*: Hasta 3 chips con notas musicales en la pista inferior.
- **Ejemplo JSON:**
```json
{
  "tipo": "editor",
  "archivo": "microondas.tsx",
  "hecho": "100% código",
  "palabras": ["magnetrón", "ondas", "calor"],
  "sonidos": ["pop", "campana"],
  "en": ["Dentro", "pieza", "dispara", "invisibles"]
}
```

---

### 2.4. `movil` — Teléfono Móvil Isométrico
- **Propósito:** Maqueta de smartphone en perspectiva inclinada ($380\text{ px}$ de ancho) con pantalla animada, contador dinámico opcional y pegatina de impacto superpuesta.
- **Momentos:** `3` momentos: `[0]` entrada del teléfono, `[1]` revelado de contenido y contador, `[2]` pegatina.
- **Sonidos automáticos:** `whoosh` (0.28); `pop` (0.38) en la pegatina.
- **Propiedades:**
  - `titulo` *(string, obligatorio)*: Título de la app en pantalla (máx. 24 letras).
  - `subtitulo` *(string, opcional)*: Subtítulo de apoyo (máx. 18 letras).
  - `icono` *(string, opcional)*: Icono central Lucide.
  - `pegatina` *(string, opcional)*: Badge rotado de impacto (máx. 12 letras).
  - `contador` *(objeto, opcional)*: `{ "desde": number, "hasta": number, "etiqueta": string }`.
- **Ejemplo JSON:**
```json
{
  "tipo": "movil",
  "titulo": "Frecuencia 2.45 GHz",
  "subtitulo": "resonancia h2o",
  "icono": "activity",
  "pegatina": "¡POTENTE!",
  "contador": { "desde": 0, "hasta": 2450, "etiqueta": "MHz" },
  "en": ["ondas", "agua", "vibra"]
}
```

---

### 2.5. `contador` — Cifra Numérica Impactante
- **Propósito:** Gran cifra central animada mediante resorte o conteo progresivo, con icono lateral, etiqueta descriptiva inferior y opción de onda expansiva o llama de impacto.
- **Momentos:** `2` momentos: `[0]` entrada del contenedor e icono, `[1]` golpe final de la cifra con onda expansiva.
- **Sonidos automáticos:** `puff` (0.4) si `llama: true`; `golpe` (0.45) si `llama: false`.
- **Propiedades:**
  - `valor` *(number, obligatorio)*: Número objetivo final.
  - `etiqueta` *(string, obligatorio)*: Texto explicativo inferior (máx. 40 letras; aviso si $> 28$).
  - `desde` *(number, opcional)*: Valor numérico inicial (por defecto 0).
  - `icono` *(string, opcional)*: Icono Lucide.
  - `llama` *(boolean, opcional)*: Aplica estética cálida de fuego e impacto.
- **Ejemplo JSON:**
```json
{
  "tipo": "contador",
  "valor": 12,
  "desde": 0,
  "etiqueta": "centímetros de profundidad",
  "icono": "ruler",
  "llama": false,
  "en": ["penetra", "superficie"]
}
```

---

### 2.6. `cifras` — Tarjetas de Métricas en Cascada
- **Propósito:** Muestra de 1 a 3 tarjetas horizontales apiladas, cada una con un número de gran escala animado, etiqueta manual, prefijo/sufijo y barras ecualizadoras decorativas.
- **Momentos:** Dinámico: consume de `1` a `3` momentos según la cantidad de filas.
- **Sonidos automáticos:** `golpe` (0.45) en filas con `destacar: true`; `tic` (0.3) en filas estándar.
- **Propiedades:**
  - `filas` *(lista de objetos, obligatorio, 1 a 3 ítems)*:
    - `valor` *(number, obligatorio)*: Cifra numérica.
    - `etiqueta` *(string, obligatorio)*: Rótulo de la métrica (máx. 14 letras).
    - `detalle` *(string, opcional)*: Descripción complementaria (máx. 30 letras).
    - `destacar` *(boolean, opcional)*: Resalta la fila con color de acento y golpe sonoro.
    - `prefijo` *(string, opcional)*: Signo o símbolo anterior (ej. `"$"`).
    - `sufijo` *(string, opcional)*: Símbolo posterior (ej. `"%"`, `"x"`).
    - `desde` *(number, opcional)*: Valor de inicio del conteo.
- **Ejemplo JSON:**
```json
{
  "tipo": "cifras",
  "filas": [
    { "valor": 800, "sufijo": "W", "etiqueta": "Potencia", "detalle": "consumo medio" },
    { "valor": 2, "sufijo": " cm", "etiqueta": "Penetración", "destacar": true }
  ],
  "en": ["potencia", "centímetros"]
}
```

---

### 2.7. `ficha` — Tarjeta de Especificaciones Estructurada
- **Propósito:** Presenta una ficha técnica limpia de 1 a 4 filas con clave-valor, encabezado con icono y badge superior. Posee `alInicio: true` (se visualiza desde el primer frame).
- **Momentos:** Dinámico: consume de `1` a `4` momentos según la cantidad de filas.
- **Sonidos automáticos:** `pop` (0.25) en cada fila revelada.
- **Propiedades:**
  - `titulo` *(string, obligatorio)*: Título de la tarjeta (máx. 18 letras).
  - `etiqueta` *(string, opcional)*: Badge superior de contexto (máx. 14 letras).
  - `icono` *(string, opcional)*: Icono Lucide en cabecera.
  - `filas` *(lista de tuplas, obligatorio, 1 a 4 ítems)*: Cada ítem es `[etiqueta, valor]` o `[etiqueta, valor, destacar (boolean)]`.
- **Ejemplo JSON:**
```json
{
  "tipo": "ficha",
  "titulo": "Magnetrón",
  "etiqueta": "COMPONENTE",
  "icono": "cpu",
  "filas": [
    ["Tipo", "Tubo de vacío"],
    ["Frecuencia", "2.45 GHz", true],
    ["Objetivo", "Moléculas de agua"]
  ],
  "en": ["Dentro", "pieza", "dispara"]
}
```

---

### 2.8. `lista` — Viñetas Secuenciales con Checkmarks
- **Propósito:** Lista vertical de 2 a 5 elementos que entran en cascada lateral con cajas de verificación que se iluminan al activarse. Admite iconos por elemento y título superior.
- **Momentos:** Dinámico: `items.length` (de 2 a 5 momentos). `alInicio: true` si incluye `titulo`.
- **Sonidos automáticos:** `tic` (0.3) en cada ítem; `ding` (0.26) en el último ítem.
- **Propiedades:**
  - `titulo` *(string, opcional)*: Título de cabecera (máx. 22 letras).
  - `items` *(lista, obligatorio, 2 a 5 ítems)*: Cada ítem puede ser un `string` o un objeto `{ "texto": string, "icono"?: string }` (máx. 30 letras por texto).
- **Ejemplo JSON:**
```json
{
  "tipo": "lista",
  "titulo": "Lo que calienta:",
  "items": [
    { "texto": "Agua de la superficie", "icono": "droplet" },
    { "texto": "Grasas y azúcares", "icono": "flame" },
    { "texto": "El centro queda frío", "icono": "snowflake" }
  ],
  "en": ["calienta", "superficie", "centro"]
}
```

---

### 2.9. `pasos` — Proceso Secuencial Numerado
- **Propósito:** Despliega de 2 a 4 pasos o etapas ordenadas cronológicamente, cada uno en una tarjeta destacada con número circular grande.
- **Momentos:** Dinámico: `pasos.length` (de 2 a 4 momentos).
- **Sonidos automáticos:** `pop` (0.3) en cada paso.
- **Propiedades:**
  - `pasos` *(lista, obligatorio, 2 a 4 ítems)*: Cada elemento es un texto o `{ "texto": string, "icono"?: string }` (máx. 34 letras por texto).
- **Ejemplo JSON:**
```json
{
  "tipo": "pasos",
  "pasos": [
    "Ondas entran al alimento",
    "Agitan moléculas de agua",
    "Fricción genera calor"
  ],
  "en": ["entran", "agitan", "fricción"]
}
```

---

### 2.10. `comparacion` — Enfrentamiento Lado a Lado
- **Propósito:** Dos tarjetas enfrentadas (izquierda vs derecha) para contrastar conceptos, métodos o mitos vs realidades. Permite asignar un ganador que recibe un check verde mientras el perdedor recibe una X roja.
- **Momentos:** `3` momentos: `[0]` tarjeta izquierda, `[1]` tarjeta derecha, `[2]` marcas de veredicto.
- **Sonidos automáticos:** `pop` (0.3), `pop` (0.3), `exito` (0.26).
- **Propiedades:**
  - `izquierda` *(objeto, obligatorio)*: `{ "titulo": string (máx. 16), "texto"?: string (máx. 50), "icono"?: string }`.
  - `derecha` *(objeto, obligatorio)*: `{ "titulo": string (máx. 16), "texto"?: string (máx. 50), "icono"?: string }`.
  - `ganador` *(string, opcional)*: `"izquierda"`, `"derecha"` o `"ninguno"`.
- **Ejemplo JSON:**
```json
{
  "tipo": "comparacion",
  "izquierda": { "titulo": "Creencia", "texto": "Calienta de adentro afuera", "icono": "x" },
  "derecha": { "titulo": "Realidad", "texto": "Calienta por conducción externa", "icono": "check" },
  "ganador": "derecha",
  "en": ["creencia", "realidad", "conducción"]
}
```

---

### 2.11. `tachado` — Desmentido Visual "No es X: es Y"
- **Propósito:** Rompe una creencia previa. Muestra el texto erróneo, traza un tachón rojo enérgico con temblor de impacto y revela la afirmación correcta en gran tamaño con color de acento o formato de código (`</>`). `alInicio: true`.
- **Momentos:** `2` momentos: `[0]` tachón sobre `antes`, `[1]` revelado de `despues`.
- **Sonidos automáticos:** `negacion` (0.22), `swoosh` (0.3).
- **Propiedades:**
  - `antes` *(string, obligatorio)*: Afirmación descartada (máx. 22 letras).
  - `despues` *(string, obligatorio)*: Afirmación correcta (máx. 18 letras).
  - `modo` *(string, opcional)*: `"texto"` (por defecto) o `"codigo"`.
  - `icono` *(string, opcional)*: Icono en la tarjeta.
  - `imagen` *(string, opcional)*: Imagen en cabecera de tarjeta.
- **Ejemplo JSON:**
```json
{
  "tipo": "tachado",
  "antes": "De dentro a fuera",
  "despues": "Solo 2 cm externos",
  "icono": "alert-triangle",
  "en": ["dentro", "externos"]
}
```

---

### 2.12. `objecion` — Globo de Pensamiento y Réplica
- **Propósito:** Plantea una duda o creencia común (*"¿Pensarás que…?"*) en un globo de diálogo con signos de interrogación dinámicos, respondiéndola con una píldora inferior.
- **Momentos:** `2` momentos: `[0]` globo de diálogo, `[1]` píldora de respuesta. `alInicio: true` si incluye `numero`.
- **Sonidos automáticos:** `pop` (0.32); `ding` (0.26) en la respuesta.
- **Propiedades:**
  - `texto` *(string, obligatorio)*: Pregunta u objeción (máx. 60 letras).
  - `respuesta` *(string, opcional)*: Conclusión contundente (máx. 30 letras).
  - `numero` *(string, opcional)*: Badge superior numérico (máx. 12 letras, ej. `"DUDA #1"`).
- **Ejemplo JSON:**
```json
{
  "tipo": "objecion",
  "numero": "MITO",
  "texto": "¿El plato gira solo por lujo?",
  "respuesta": "Para evitar zonas frías",
  "en": ["plato", "frías"]
}
```

---

### 2.13. `pregunta` — Test Interactivo de Opción Múltiple
- **Propósito:** Gamifica el reel con una pregunta central y 2 a 4 opciones (A, B, C, D). Revela la opción correcta en verde mientras atenúa las demás.
- **Momentos:** `3` momentos: `[0]` pregunta, `[1]` opciones, `[2]` revelado de la correcta.
- **Sonidos automáticos:** `pop` (0.3) en opciones; `exito` (0.28) en respuesta correcta.
- **Propiedades:**
  - `pregunta` *(string, obligatorio)*: Texto de la pregunta (máx. 60 letras).
  - `opciones` *(lista string, obligatorio, 2 a 4 ítems)*: Textos de las alternativas (máx. 28 letras c/u).
  - `correcta` *(number, opcional)*: Índice de la opción correcta (0 a 3, por defecto 0).
- **Ejemplo JSON:**
```json
{
  "tipo": "pregunta",
  "pregunta": "¿Qué calienta primero las microondas?",
  "opciones": ["El centro", "El agua exterior", "El aire interno", "El plato"],
  "correcta": 1,
  "en": ["Pregunta", "opciones", "exterior"]
}
```

---

### 2.14. `barras` — Gráfico Estadístico Vertical
- **Propósito:** Muestra un gráfico comparativo de barras verticales (2 a 5 barras) con crecimiento elástico, valores numéricos formateados con unidad y etiqueta inferior.
- **Momentos:** Dinámico: `barras.length` (2 a 5 momentos). `alInicio: true` si tiene `titulo`.
- **Sonidos automáticos:** `tic` (0.3) en cada barra levantada.
- **Propiedades:**
  - `barras` *(lista de objetos, obligatorio, 2 a 5 ítems)*:
    - `etiqueta` *(string, obligatorio)*: Nombre de la barra (máx. 12 letras).
    - `valor` *(number, obligatorio)*: Magnitud numérica.
  - `titulo` *(string, opcional)*: Título superior (máx. 26 letras).
  - `unidad` *(string, opcional)*: Sufijo de unidad (máx. 4 letras, ej. `"s"`, `"%"`, `"cm"`).
  - `destacar` *(number, opcional)*: Índice de la barra a resaltar con color de acento.
- **Ejemplo JSON:**
```json
{
  "tipo": "barras",
  "titulo": "Tiempo hasta 70°C",
  "unidad": "s",
  "destacar": 0,
  "barras": [
    { "etiqueta": "Microondas", "valor": 90 },
    { "etiqueta": "Horno", "valor": 720 },
    { "etiqueta": "Sartén", "valor": 300 }
  ],
  "en": ["microondas", "horno", "sartén"]
}
```

---

### 2.15. `imagen` — Fotografía Destacada con Efectos Ópticos
- **Propósito:** Imagen protagonista con marco elegante, badge superior, pie de foto y efectos ópticos visuales procedimentales opcionales.
- **Momentos:** `2` momentos: `[0]` entrada de la foto, `[1]` píldora de texto inferior.
- **Sonidos automáticos:** Depende de los efectos: `proyector` (0.32) con `cine`; `burbuja` (0.28) con `burbujas`/`agua`; `campana` (0.22) con `estrellas`/`haz`; o `pop` (0.3) con texto estándar.
- **Propiedades:**
  - `imagen` *(string, obligatorio)*: Ruta en `public/` (formatos `.png`, `.jpg`, `.jpeg`, `.webp`).
  - `texto` *(string, opcional)*: Pie de foto inferior (máx. 34 letras).
  - `etiqueta` *(string, opcional)*: Badge superior (máx. 22 letras).
  - `formato` *(string, opcional)*: `"horizontal"` (por defecto), `"cuadrada"` o `"vertical"`.
  - `efectos` *(lista string, opcional)*: Efectos ópticos soportados: `cine`, `burbujas`, `agua`, `estrellas`, `haz`, `resplandor`.
- **Ejemplo JSON:**
```json
{
  "tipo": "imagen",
  "imagen": "imagenes/magnetron_real.png",
  "texto": "Magnetrón en operación",
  "etiqueta": "HARDWARE",
  "formato": "horizontal",
  "efectos": ["cine"],
  "en": ["magnetrón", "operación"]
}
```

---

### 2.16. `galeria` — Colección de Imágenes en Múltiples Modos
- **Propósito:** Muestra un conjunto de 2 a 6 imágenes organizadas según tres modos visuales:
  - `abanico`: Entran apiladas y se abren en abanico radial.
  - `orbita`: Rotan en un anillo elíptico tridimensional alrededor de un icono central.
  - `rejilla`: Cuadrícula compacta de 2 o 3 columnas con opción de resaltar una imagen.
- **Momentos:** `2` momentos: `[0]` entrada base, `[1]` apertura radial o resaltado.
- **Sonidos automáticos:** `whoosh` (0.3) en abanico/rejilla; `ding` (0.3) en órbita.
- **Propiedades:**
  - `imagenes` *(lista string, obligatorio, 2 a 6 imágenes)*: Rutas en `public/`.
  - `modo` *(string, opcional)*: `"abanico"` (por defecto), `"orbita"` o `"rejilla"`.
  - `etiqueta` *(string, opcional)*: Píldora descriptiva (máx. 30 letras).
  - `centro` *(string, opcional)*: Icono central en modo órbita.
  - `destacar` *(number, opcional)*: Índice de imagen resaltada en modo rejilla.
- **Ejemplo JSON:**
```json
{
  "tipo": "galeria",
  "modo": "abanico",
  "etiqueta": "Electrodomésticos",
  "imagenes": [
    "imagenes/microondas.png",
    "imagenes/horno.png",
    "imagenes/tostadora.png"
  ],
  "en": ["aparatos", "cocina"]
}
```

---

### 2.17. `cta` — Llamada a la Acción Final
- **Propósito:** Cierre del reel diseñado para maximizar la retención y la conversión social. Muestra una palabra clave animada letra por letra dentro de una caja de acento, un verbo configurable (ej. `"Guarda"`, `"Comenta"`), 4 iconos sociales Lucide (`bookmark`, `message-circle`, `share-2`, `heart`) con microanimaciones elásticas y una explosión de confeti determinista.
- **Momentos:** `3` momentos: `[0]` entrada del verbo y palabra clave, `[1]` iconos sociales y texto secundario, `[2]` confeti de celebración.
- **Sonidos automáticos:** `tecla` (0.3) al escribir la palabra; `exito` (0.3) al entrar los iconos y confeti.
- **Propiedades:**
  - `palabra` *(string, obligatorio)*: Palabra clave en caja de acento (máx. 12 letras, ej. `"MITO"`, `"REEL"`).
  - `verbo` *(string, opcional)*: Verbo de acción (máx. 14 letras, por defecto `"Comenta"`).
  - `texto` *(string, opcional)*: Instrucción secundaria complementaria (máx. 50 letras).
  - `iconos` *(lista string, opcional)*: Lista de hasta 5 iconos Lucide personalizados (por defecto usa los 4 estándares de redes sociales).
- **Ejemplo JSON:**
```json
{
  "tipo": "cta",
  "verbo": "Guarda",
  "palabra": "ESTO",
  "texto": "para cuando alguien te repita el mito",
  "en": ["Guarda", "alguien", "mito"]
}
```

---

## 3. Escenas Personalizadas del Usuario (`src/propias/`)

Cuando ninguna escena nativa se adapta a una necesidad específica de visualización, se crean escenas propias en `src/propias/`:

### Procedimiento de Creación en 3 Pasos:
1. **Crear el componente TSX:** Duplicar [`src/propias/Ejemplo.tsx`](../assets/plantilla/src/propias/Ejemplo.tsx) y renombrarlo (ej. `src/propias/MiEscena.tsx`).
2. **Definir la estructura `DefEscena`:**
   ```tsx
   import React from "react";
   import { AbsoluteFill } from "remotion";
   import { C } from "../motor/actual";
   import { usePop, useFlota } from "../motor/anim";
   import { Tarjeta, Icono } from "../piezas/basicas";
   import type { DefEscena, PropsEscena } from "../tipos";

   const MiEscenaComponente: React.FC<PropsEscena> = ({ p, b }) => {
     const [b0, b1] = b;
     const entra = usePop(b0);
     const fl = useFlota(0.5, 6, 14);
     return (
       <AbsoluteFill>
         <Tarjeta x={190} y={330 + fl} w={700} h={460} transform={`scale(${entra})`}>
           <Icono nombre="zap" tam={100} color={C.acento} />
           <div style={{ color: C.tarjetaTexto, fontSize: 48 }}>{String(p.titulo ?? "")}</div>
         </Tarjeta>
       </AbsoluteFill>
     );
   };

   export const miEscena: DefEscena = {
     C: MiEscenaComponente,
     momentos: 2,
     sonidos: () => [[0, "pop", 0.3], [1, "exito", 0.25]]
   };
   ```
3. **Registrar en [`src/propias/index.ts`](../assets/plantilla/src/propias/index.ts):**
   ```ts
   import { miEscena } from "./MiEscena";

   export const PROPIAS = {
     MiEscena: miEscena
   };
   ```
4. **Invocación directa en `plan.json`:**
   ```json
   {
     "escena": {
       "tipo": "propia",
       "nombre": "MiEscena",
       "titulo": "Datos de laboratorio",
       "en": ["palabra1", "palabra2"]
     }
   }
   ```
> [!NOTE]
> Gracias a la integración de la **Etapa 35**, [`src/escenas/index.ts`](../assets/plantilla/src/escenas/index.ts) reconcilia automáticamente `PROPIAS`, eliminando falsos positivos en `resumen` y recalculando los momentos y sonidos en la línea de tiempo.

---

## 4. Estilos Visuales y Personalización

El motor incluye **6 estilos temáticos nativos** diseñados con contrastes aprobados para video vertical:

| Estilo | Familia | Fondo | Tarjeta | Acento | Texto | Fuentes (Título / Texto) | Grano |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **`nexora`** *(defecto)* | Suave | `#090A0F` | `#161B26` | `#38BDF8` (celeste) | `#F8FAFC` | Space Grotesk / Inter | 0.10 |
| **`nube`** | Suave | `#EEF0FF` | `#FFFFFF` | `#6157F5` (morado) | `#1C1F3A` | Manrope / Manrope | 0.25 |
| **`noche`** | Suave | `#0E1120` | `#1C2242` | `#B8F34B` (lima) | `#F3F4FB` | Space Grotesk / Inter | 0.12 |
| **`menta`** | Marcado | `#DDF3EA` | `#FFFFFF` | `#FF4F7B` (rosa) | `#0D3B35` | Bricolage Grotesque / DM Sans | 0.55 |
| **`limon`** | Marcado | `#FFE94A` | `#FFFFFF` | `#2F5BFF` (azul) | `#141414` | Anton / Inter | 0.45 |
| **`pizarra`** | Marcado | `#1E2B25` | `#26372F` | `#FFD449` (amarillo) | `#F1EFE4` | Archivo Black / Archivo | 0.50 |

### Personalización mediante `EstiloPlan`:
En `plan.json` puede indicarse el nombre como string (`"estilo": "nube"`) o como un objeto para sobreescribir tokens específicos:
```json
{
  "estilo": {
    "base": "noche",
    "colores": {
      "acento": "#FF0055"
    },
    "escalaTitulo": 1.1,
    "grano": 0.05
  }
}
```

---

## 5. Transiciones Cinematográficas

Las transiciones se configuran por escena mediante `entrada` y `salida` en `FrasePlan` (o globalmente en `plan.transicion`):

### Transiciones de Entrada:
- **`corte`:** Corte directo inmediato en el fotograma exacto.
- **`suave`:** Desplazamiento sutil con resorte elástico amortiguado y solape temporal entre secuencias contiguas.
- **`semitono`:** Efecto visual de semitono retro que unifica el cambio de plano.
- **`deslizar-arriba`:** La escena asciende enérgicamente desde la parte inferior ($y + 160\text{ px}$).
- **`deslizar-abajo`:** La escena desciende desde la parte superior ($y - 160\text{ px}$).
- **`disolver`:** Desvanecimiento cruzado de opacidad con solape de fotogramas (`SOLAPE = 10`).

### Transiciones de Salida:
- **`corte`**, **`suave`** o **`disolver`**. Si se omite, se calcula automáticamente según la entrada de la escena siguiente.

---

## 6. Esquema Completo del Plan (`src/datos/plan.json`)

```json
{
  "titulo": "Título general del reel",
  "estilo": "nexora",
  "subtitulos": "linea",
  "transicion": "suave",
  "personaje": false,
  "voz": true,
  "portada": {
    "etiqueta": "GUÍA RÁPIDA",
    "lineas": ["APRENDE", "*REMOTION*", "EN 30 SEGUNDOS"],
    "icono": "code",
    "pose": "normal"
  },
  "frases": [
    {
      "texto": "El microondas *no calienta* de dentro hacia afuera.",
      "emocion": "[confident]",
      "entrada": "corte",
      "sinSubtitulos": true,
      "escena": {
        "tipo": "titular",
        "etiqueta": "MITO POPULAR",
        "texto": "El microondas / *no calienta*",
        "icono": "microwave",
        "en": ["calienta"]
      }
    },
    {
      "texto": "De hecho, solo penetra unos *dos centímetros* de superficie.",
      "entrada": "deslizar-arriba",
      "escena": {
        "tipo": "contador",
        "valor": 2,
        "etiqueta": "centímetros de profundidad",
        "icono": "ruler",
        "en": ["penetra", "centímetros"]
      }
    },
    {
      "texto": "Guarda este reel para cuando alguien te repita *el mito*.",
      "entrada": "suave",
      "sinSubtitulos": true,
      "escena": {
        "tipo": "cta",
        "verbo": "Guarda",
        "palabra": "MITO",
        "texto": "y compártelo con quien cocine a diario",
        "en": ["Guarda", "alguien", "mito"]
      }
    }
  ]
}
```

---

## 7. Catálogo de Efectos de Sonido Nativos (`public/sonidos/`)

Los 17 archivos de audio WAV generados deterministamente por `sonidos.py` están calibrados para acompañar micro-interacciones sin ensuciar la voz:

| Efecto | Tipo de Onda / Síntesis | Volumen Sugerido | Uso Recomendado en `sonidos` o Escenas Nativas |
| :--- | :--- | :---: | :--- |
| **`pop`** | Senoidal rápida con envolvente exponencial | 0.30 - 0.35 | Aparición de tarjetas, iconos Lucide, chips y pegatinas. |
| **`ding`** | Parciales armónicos agudos de campana | 0.26 - 0.30 | Logro didáctico, último ítem de lista o dato clave. |
| **`exito`** | Tríada armónica ascendente | 0.25 - 0.30 | Respuesta correcta en quiz, CTA final y confeti. |
| **`campana`** | Resonancia armónica media-alta | 0.22 - 0.28 | Alerta conceptual, cambio de bloque temático. |
| **`tecla`** | Ruido filtrado y transitorio percusivo | 0.25 - 0.30 | Simulación de máquina de escribir o código en pantalla. |
| **`tic`** | Pulso breve de alta frecuencia | 0.25 - 0.30 | Pasos de lista, filas de tablas y barras estadísticas. |
| **`clic`** | Transitorio de conmutador bistable | 0.28 - 0.32 | Interruptores, botones de interfaz y casillas de verificación. |
| **`whoosh`** | Ruido rosa filtrado con barrido espectral | 0.28 - 0.35 | Entrada rápida de imágenes, tarjetas grandes o transición. |
| **`swoosh`** | Barrido espectral descendente rápido | 0.28 - 0.32 | Salida enérgica de elementos o tachado de mitos. |
| **`papel`** | Ruido blanco modulado y banda estrecha | 0.28 - 0.32 | Despliegue de fichas técnicas, documentos y formularios. |
| **`burbuja`** | Modulación de frecuencia senoidal líquida | 0.25 - 0.30 | Escenas biológicas, químicas o efectos de agua y fluidez. |
| **`golpe`** | Sub-bass de baja frecuencia amortiguado | 0.40 - 0.45 | Cifras demoledoras, datos alarmantes y ganchos de alto impacto. |
| **`negacion`** | Intervalo disonante descendente | 0.22 - 0.28 | Refutación de objeciones, opciones erróneas y tachados. |
| **`puff`** | Ráfaga de ruido blanco con decaimiento suave | 0.35 - 0.40 | Desaparición instantánea o llamas y chispas térmicas. |
| **`cristal`** | Enarmónicos metálicos de alta claridad | 0.25 - 0.30 | Destellos visuales, revelaciones premium y elementos dorados. |
| **`proyector`** | Modulación mecánica rítmica de celuloide | 0.30 - 0.35 | Fotogramas retro, archivo histórico y filtro cinematográfico. |
| **`subida`** | Glissando senoidal ascendente continuo | 0.25 - 0.30 | Tensión narrativa, contadores acelerados y barras en ascenso. |

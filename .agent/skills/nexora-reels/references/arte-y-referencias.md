# Dirección de Arte y Referencias Visuales
## Guía Técnica para Nexora Motion Reels

---

### 1. Definición de la Dirección Visual

Antes de construir o maquetar componentes en Remotion, se debe fijar una intención estética coherente con el contenido y la audiencia.

#### Criterios de Selección:
1. **Tema y Emoción:**
   - *Educativo / Científico:* Fondo oscuro con iluminación puntual focal, contrastes limpios, acentos de color cian/ámbar para datos técnicos y diagramas vectoriales esquemáticos.
   - *Negocios / SaaS / Tecnología:* Estética *dark modern*, degradados suaves, tipografía grotesca limpia, tarjetas con bordes finos translúcidos y sombras profundas.
   - *Entretenimiento / Divulgación General:* Colores saturados, tipografías display con personalidad, ritmo dinámico y contrastes vivos.
2. **Recomendación "Reference First":**
   - Buscar o solicitar una pieza de referencia real antes de inventar estilos arbitrarios. Si el creador ya tiene una guía de marca (colores hexadecimales, fuentes de cabecera), adoptarla como fuente de verdad.

---

### 2. Armonía Cromática y Distribución 60-30-10

La fórmula 60-30-10 es una guía práctica de jerarquía visual, no una regla matemática rígida:

* **60% — Color Dominante (Atmósfera / Fondo):**
  - Generalmente tonos oscuros neutros (`#090a0f`, `#0d1117`) o claros limpios (`#f8fafc`). Establece el tono ambiental sin competir con el contenido.
* **30% — Color Estructural (Superficies / Tarjetas / Marcos):**
  - Define la forma de los contenedores (`#161b22`, `#1e293b`). Aporta contraste respecto al fondo y agrupa la información en bloques legibles.
* **10% — Color de Acento Focal (Palabras clave / Cifras / Call-to-Action):**
  - Tono de alta saturación y contraste (`#f59e0b` ámbar, `#06b6d4` cian, `#ef4444` carmesí). Se reserva exclusivamente para aquello que debe captar la mirada en el primer medio segundo.

---

### 3. Jerarquía Tipográfica y Legibilidad

En video vertical para dispositivos móviles, la tipografía compite con pantallas reducidas y tiempos de visualización cortos:

1. **Límite de Familias:** Máximo dos familias complementarias:
   - *Familia Display:* Para ganchos iniciales, números y palabras clave de impacto (ej. *Archivo Black*, *Bricolage Grotesque*, *Anton*).
   - *Familia Neutra / Lectura:* Para frases secundarias, subtítulos y explicaciones técnicas (ej. *Inter*, *DM Sans*, *Manrope*).
2. **Contraste Mínimo:** Garantizar un ratio de contraste de al menos 4.5:1 entre el texto y su fondo inmediato para asegurar legibilidad en pantallas exteriores con brillo reducido.
3. **Longitud de Línea:** En titulares, partir las frases con saltos de línea deliberados para que ninguna línea supere los 12–14 caracteres, permitiendo tamaños de fuente generosos (>60 px).

---

### 4. Profundidad Visual y Tratamientos Ópticos

El objetivo de los tratamientos ópticos es dotar de volumen a los gráficos sin oscurecer ni ensuciar la información.

#### Cuándo Utilizar Efectos Ópticos:
* **Mallas Dinámicas (`BgMesh`):** Recomendadas para evitar fondos muertos. Dos gradientes radiales oscilando suavemente aportan tridimensionalidad e iluminación viva.
* **Viñeteado Perimetral (`Vignette`):** Recomendado en encuadres 9:16 para oscurecer sutilmente las esquinas y forzar la atención en el centro de acción.
* **Grano Analógico (`FilmGrain`):** Recomendado para disimular el escalonamiento de degradados (*banding*) y aportar textura cinematográfica. Debe ser casi imperceptible (opacidad del 3% al 5%).

#### Cuándo Evitar Efectos Ópticos:
* En infografías técnicas donde la nitidez de trazos delgados sea crítica.
* Si el estilo visual definido por el usuario es neobrutalista, plano o minimalista puro.
* Si se observa que el renderizado en la máquina local decae notablemente de velocidad.

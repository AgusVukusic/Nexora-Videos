# Protocolo de Preparación y Publicación Manual
## Guía Operativa para Nexora Motion Reels

---

### 1. Filosofía de Publicación Estrictamente Manual

En Nexora Reels, la publicación en plataformas sociales (Instagram Reels, TikTok, YouTube Shorts) es **100% manual y supervisada por el creador**:
- No se utilizan scripts de subida desatendida.
- No se conectan credenciales ni tokens de API de redes sociales.
- Toda pieza se exporta a disco local (`salida/`) para que el usuario la revise, verifique y cargue manualmente desde la app o navegador.

---

### 2. Especificaciones Técnicas del Archivo Final

El video exportado en `salida/reel.mp4` cumple con los estándares universales de reproducción móvil:

| Parámetro | Requisito Técnico | Justificación |
| :--- | :--- | :--- |
| **Resolución** | $1080 \times 1920\text{ px}$ | Formato vertical 9:16 nativo sin barras negras. |
| **Frecuencia de Cuadro** | $30\text{ fps}$ | Estándar fluido con consumo optimizado de render. |
| **Códec de Video** | H.264 (perfil High / CRF 20) | Compatibilidad universal con reproductores móviles. |
| **Códec de Audio** | AAC estéreo a 48 kHz | Calidad sonora limpia sin artefactos de compresión. |
| **Límite de Peso** | $< 28\text{ MB}$ | Margen de seguridad para descargas móviles y límites de subida de plataformas. |

---

### 3. Verificación de Miniatura y Portada

Las plataformas sociales recortan la miniatura vertical según la sección de la aplicación donde se visualice:

1. **Recorte 3:4 (Cuadrícula del Perfil de Instagram):**
   - El visualizador central de perfiles recorta la parte superior e inferior del video 9:16.
   - Ejecutar `node render.mjs portada` y abrir `salida/portada_check.png`.
   - **Criterio de Aprobación:** El título y el icono central deben leerse con total claridad dentro del recuadro 3:4 sin tocar los bordes de corte.
2. **Miniatura Pequeña 1:1 (Explorar):**
   - Verificar que el gancho tipográfico principal siga siendo legible a escala reducida.

---

### 4. Preparación Editorial de Metadatos

Antes de publicar, estructurar el paquete de texto que acompañará al video:

1. **Título y Gancho de Copete:**
   - Una frase corta que refuerce o complemente el gancho del video sin repetirlo literalmente.
2. **Cuerpo del Texto (Caption):**
   - 2 a 4 párrafos breves que amplíen un detalle técnico o aporten contexto adicional.
3. **Llamada a la Acción (CTA):**
   - Coherente con el cierre del reel (ej. *"Guarda este reel para cuando configures tu equipo"* o *"Comenta X si quieres la segunda parte"*).
4. **Hashtags:**
   - 3 a 5 etiquetas altamente específicas del nicho, evitando hashtags genéricos saturados.
5. **Selección de Audio en la App:**
   - Al subir el video a TikTok o Instagram, seleccionar en el buscador de la app un tema musical en tendencia y ajustar su volumen al 5%–10% para que actúe como colchón sonoro de fondo sin tapar la voz del reel.

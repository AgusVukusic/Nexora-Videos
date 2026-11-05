# Registro Histórico de Evidencias Técnicas — Etapas 4 y 5

Este directorio preserva las evidencias de validación gráfica, determinismo bit-a-bit y pruebas de renderizado audiovisual correspondientes a las fases tempranas del motor de generación de video de Nexora (Etapa 4 y Etapa 5.4).

---

## 1. Estructura y Organización

```text
docs/evidencias/historico_etapas_4_y_5/
├── etapa_4/
│   ├── ComposicionPrueba.tsx           # Componente React de prueba de composición
│   ├── RootPrueba.tsx                  # Declaración de composición Remotion (1080x1920 @ 30fps)
│   ├── index.ts                        # Punto de entrada de registro Remotion
│   ├── render_prueba.mjs               # Script de doble render determinista y extracción de frames
│   ├── resultado_render.json           # Métricas de renderizado y hashes de fotogramas (Pase 1 y 2)
│   ├── original_resultado_render.json  # Métricas históricas de la primera ejecución
│   ├── frames/                         # 10 fotogramas PNG de control (Pase 1)
│   ├── frames_run2/                    # 10 fotogramas PNG de control (Pase 2, determinismo 100%)
│   ├── original_frames/                # 10 fotogramas PNG de la ejecución inicial
│   └── original_frames_run2/           # 10 fotogramas PNG de la repetición inicial
│
├── etapa_5/
│   ├── render_etapa_5_4.mjs            # Script de renderizado de integración visual (Etapa 5.4)
│   └── frames/                         # 6 fotogramas PNG clave de transiciones (f10, f35, f60, f95, f135, f175)
│
└── README.md                           # Este documento explicativo y catálogo de evidencias
```

---

## 2. Catálogo de Scripts y Reproducibilidad

### 2.1. `etapa_4/render_prueba.mjs`
- **Etapa:** Etapa 4 (Validación de Render Real Remotion y Determinismo).
- **Propósito:** Certificar que el pipeline de renderizado Remotion en Chromium produce resultados deterministas (bit-a-bit idénticos) entre dos ejecuciones independientes consecutivas.
- **Archivos requeridos:**
  - `RootPrueba.tsx` y `ComposicionPrueba.tsx` (arnés de composición).
  - Módulos `@remotion/bundler` y `@remotion/renderer` instalados en `reel-microondas/node_modules/`.
  - Navegador Google Chrome / Chromium instalado (detectado mediante `reel-microondas/entorno.json` o ruta predeterminada del sistema).
- **Salida generada:**
  - Archivos MP4: `prueba_nexora.mp4` y `prueba_nexora_run2.mp4` (preservados externamente).
  - Fotogramas PNG: 10 fotogramas por pasada (`frames/` y `frames_run2/`).
  - Informe JSON: `resultado_render.json` con timestamps, hashes SHA-256 por frame y métricas de codificación.
- **Estado de reproducibilidad:**
  - Es reproducible en un entorno que cuente con Node.js y las dependencias de Remotion de `reel-microondas`.
  - *Nota de ejecución:* El script fue codificado originalmente para ejecutarse desde `.agent/skills/nexora-reels/test-render/` calculando el workspace como `path.resolve(__dirname, "../../../..")`. Para ejecutarlo directamente desde esta ubicación de archivo histórico, debe ajustarse la ruta base al repositorio (`path.resolve(__dirname, "../../..")`) o parametrizar la raíz del proyecto.
  - *Precaución:* No se debe ejecutar sin autorización para no alterar el estado de compilación ni regenerar archivos temporales.

### 2.2. `etapa_5/render_etapa_5_4.mjs`
- **Etapa:** Etapa 5.4 (Integración del Motor de Animación y Transiciones Suaves).
- **Propósito:** Validar la sincronización de audio, subtítulos y transiciones entre Titular, Imágenes Cáusticas y Llamada a la Acción (CTA).
- **Archivos requeridos:**
  - Módulos Remotion de `reel-microondas/node_modules/`.
  - Navegador Chromium configurado.
- **Salida generada:**
  - Archivo MP4: `reel_integracion_5_4.mp4` (preservado externamente).
  - Fotogramas PNG: 6 capturas clave que certifican la fluidez de las transiciones (`frames/frame_01_titular_intro_f10.png` a `frame_06_cta_final_subtitulos_f175.png`).
- **Estado de reproducibilidad:**
  - Script histórico de laboratorio. Al igual que el script de Etapa 4, su lógica interna referencia la estructura de directorios del skill original. Preservado con propósitos de auditoría y trazabilidad algorítmica.

---

## 3. Política de Preservación de Archivos de Video (.mp4)

Conforme a las directivas de gobernanza y control de tamaño del repositorio Git, los archivos binarios pesados `.mp4` están excluidos del seguimiento de Git (regla `*.mp4` en `.gitignore`).

Los cinco videos históricos generados durante estas pruebas se encuentran resguardados con integridad certificada en el **backup externo de seguridad** (`nexora_backup_pre_reorg_20261103/`) y en el disco local original:

| Archivo de Video | Etapa | Tamaño (bytes) | Hash SHA-256 | Ubicación de Respaldo |
|---|---|---|---|---|
| `prueba_nexora.mp4` (Pase 1) | Etapa 4 | 561.189 | `eddc2bce3ed3431023daba7d4d219ad3fff1a1c0c6800ca827d199559f25fae9` | Backup externo Etapa 0A |
| `prueba_nexora_run2.mp4` (Pase 2) | Etapa 4 | 561.151 | `063d2f081b7c4b76c9e2a025372f4c61b9d5914d4e7605e92d7c29e9077a5232` | Backup externo Etapa 0A |
| `prueba_nexora.mp4` (Original) | Etapa 4 | 564.254 | `71b9d584d94d19ddfe52fe6d4dafc857437bd2062b8b697d02529074e6638146` | Backup externo Etapa 0A |
| `prueba_nexora_run2.mp4` (Original) | Etapa 4 | 566.182 | `b4a4006328efb7395610c23033b583ead0dc27f9b4fe897acf02130f0b8809b3` | Backup externo Etapa 0A |
| `reel_integracion_5_4.mp4` | Etapa 5.4 | 3.291.746 | `d9abd6147aa891209feeab4ac7f469ea131d69b51759b0366d1dd263846c2c9e` | Backup externo Etapa 0A |

---

## 4. Trazabilidad con Informes de Auditoría

Estas evidencias respaldan formalmente las conclusiones de los siguientes informes técnicos:
- `docs/auditoria/etapas_00_38/16_validacion_render_real_etapa_4.md`
- `docs/auditoria/etapas_00_38/21_implementacion_etapa_5_4.md`
- `docs/auditoria/etapas_00_38/22_auditoria_correctiva_etapa_5_4_1.md`

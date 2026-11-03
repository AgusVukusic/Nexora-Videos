import React from "react";
import { AbsoluteFill } from "remotion";
import {
  AreaComposicion,
  Pila,
  GrillaEditorial,
  ComposicionAsimetrica,
  PanelEditorial,
  MarcoEncuadre,
  CapaProfundidad,
} from "../piezas/composicion";
import {
  TitularPrincipal,
  TitularSecundario,
  CuerpoTexto,
  Etiqueta,
  Microtexto,
  DatoMetrico,
  TextoConEnfasis,
} from "../piezas/tipografia";
import { TextoRevelado } from "../TextoRevelado";
import { generarArcoSvg, generarConectorOrtogonal, generarMarcasRegla } from "../motor/trazos";

// ============================================================================
// ARQUETIPO 1: EDITORIAL SUIZO (Asimétrico, sin tarjetas, minimalismo de tinta)
// ============================================================================
export const DemoEditorialSuizo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#f5f0e6", color: "#141413" }}>
      <AreaComposicion modo="dinamica" padding={["lg", "md"]}>
        <ComposicionAsimetrica
          orientacion="horizontal"
          proporcion="70-30"
          separacion="lg"
          primario={
            <Pila direccion="vertical" espaciado="md" alinear="inicio">
              <Etiqueta variante="tecnica" colorAcento="#b83220" color="#141413">
                NX.EDITORIAL // VOL. 40
              </Etiqueta>
              <TitularPrincipal tamano={76} color="#141413">
                COLAPSO TÉRMICO
              </TitularPrincipal>
              <TextoConEnfasis
                texto="Las microondas *no calientan de forma uniforme*, generando ondas estacionarias críticas."
                variantePorDefecto="acento"
                colorAcento="#b83220"
                colorTexto="#141413"
                style={{ fontSize: "28px", lineHeight: 1.35, fontWeight: 500 }}
              />
              <div style={{ width: "100%", height: 1, backgroundColor: "#141413", opacity: 0.25, marginTop: 12 }} />
              <CuerpoTexto tamano={22} color="#595652">
                Un ensayo visual sobre la resonancia y la disipación energética en cavidades cerradas.
              </CuerpoTexto>
            </Pila>
          }
          secundario={
            <Pila direccion="vertical" espaciado="sm" alinear="fin" style={{ borderLeft: "1px solid rgba(20,20,19,0.15)", paddingLeft: 16 }}>
              <Microtexto mono color="#141413">REF: ES-2026</Microtexto>
              <Microtexto mono color="#595652">SECTOR: 04</Microtexto>
              <div style={{ height: 40 }} />
              <Etiqueta variante="borde" colorAcento="#b83220" color="#b83220">
                SWISS GRID
              </Etiqueta>
            </Pila>
          }
        />
      </AreaComposicion>
    </AbsoluteFill>
  );
};

// ============================================================================
// ARQUETIPO 2: BLUEPRINT TÉCNICO (Esquemático, ortogonal, retícula técnica)
// ============================================================================
export const DemoBlueprintTecnico: React.FC = () => {
  const marcas = generarMarcasRegla(30, 400, 25, 100);
  const conectorA = generarConectorOrtogonal([40, 40], [280, 160], "horizontal-primero", 14);
  const arco = generarArcoSvg(280, 160, 35, 0, 270);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a192f", color: "#f1f3f7" }}>
      <AreaComposicion modo="lienzo-estandar" padding="md">
        <MarcoEncuadre variante="esquinas" color="#38bdf8" grosor={2} opacidad={0.9}>
          <PanelEditorial
            variante="tecnico"
            fondoColor="rgba(15, 36, 66, 0.75)"
            bordeColor="#1e3a5f"
            padding="md"
            cabecera={
              <Pila direccion="horizontal" distribuir="espacio-entre" alinear="centro">
                <Microtexto mono color="#38bdf8">DIAGNÓSTICO // MODALIDAD HF</Microtexto>
                <Etiqueta variante="tecnica" colorAcento="#38bdf8">ONLINE</Etiqueta>
              </Pila>
            }
          >
            <TitularSecundario tamano={38} color="#ffffff">
              ESQUEMÁTICO DE GUÍA DE ONDAS
            </TitularSecundario>

            {/* Visualización vectorial de circuito */}
            <div style={{ width: "100%", height: 260, position: "relative", marginTop: 12 }}>
              <svg width="100%" height="100%" viewBox="0 0 500 260" style={{ position: "absolute", left: 0, top: 0 }}>
                {/* Regla graduada técnica */}
                <line x1={30} y1={25} x2={400} y2={25} stroke="#1e3a5f" strokeWidth={1.5} />
                {marcas.map((m, idx) => (
                  <line
                    key={idx}
                    x1={m.posicion}
                    y1={25}
                    x2={m.posicion}
                    y2={m.esMayor ? 38 : 31}
                    stroke={m.esMayor ? "#38bdf8" : "#1e3a5f"}
                    strokeWidth={1.5}
                  />
                ))}

                {/* Rutas ortogonales de conexión */}
                <path d={conectorA} fill="none" stroke="#38bdf8" strokeWidth={2.5} />
                <path d={arco} fill="none" stroke="#e5a93c" strokeWidth={2} strokeDasharray="4 4" />
                <circle cx={40} cy={40} r={5} fill="#38bdf8" />
                <circle cx={280} cy={160} r={6} fill="#e5a93c" />
              </svg>
            </div>

            <TextoConEnfasis
              texto="Tolerancia de desfasaje: *[mono:±0.02 mm]* en acoplamiento de *[acento:magnetrón]*."
              colorAcento="#38bdf8"
              colorTexto="#9ba3b5"
              style={{ fontSize: "22px", lineHeight: 1.4 }}
            />
          </PanelEditorial>
        </MarcoEncuadre>
      </AreaComposicion>
    </AbsoluteFill>
  );
};

// ============================================================================
// ARQUETIPO 3: TIPOGRAFÍA CINÉTICA PURA (Full-bleed, cinética, pop, blur, wipe)
// ============================================================================
export const DemoTipografiaCinetica: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0f14", color: "#f1f3f7" }}>
      <AreaComposicion modo="pantalla-completa" margenPlataforma={true} padding="lg">
        <Pila direccion="vertical" espaciado="lg" alinear="inicio">
          <Etiqueta variante="solida" colorAcento="#e5a93c">
            CINÉTICA ESTUDIO
          </Etiqueta>

          <TextoRevelado
            texto="REVELADO CORTINILLA"
            estilo="cortinilla"
            desde={5}
            duracionUnidad={10}
            as="h1"
            style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.03em" }}
          />

          <TextoRevelado
            texto="REBOTE ELÁSTICO POP"
            estilo="pop"
            desde={15}
            duracionUnidad={8}
            colorAcento="#e5a93c"
            as="h2"
            style={{ fontSize: 46, fontWeight: 800, color: "#e5a93c" }}
          />

          <TextoRevelado
            texto="DESEMPAÑADO CINÉTICO SIN LAG"
            estilo="blur"
            desde={25}
            duracionUnidad={10}
            as="h3"
            style={{ fontSize: 34, fontWeight: 600, color: "#9ba3b5" }}
          />

          <TextoRevelado
            texto="TRAZO SUBRAYADO DETERMINISTA"
            estilo="subrayado"
            desde={35}
            duracionUnidad={8}
            colorAcento="#38bdf8"
            style={{ fontSize: 36, fontWeight: 700 }}
          />

          <div style={{ marginTop: 20 }}>
            <TextoConEnfasis
              texto="Integración *[acento:perfecta]* con *[subrayado:trazos vectoriales]* y *[fondo:énfasis]* sin layout-shifts."
              colorAcento="#e5a93c"
              style={{ fontSize: "26px", lineHeight: 1.4 }}
            />
          </div>
        </Pila>
      </AreaComposicion>
    </AbsoluteFill>
  );
};

// ============================================================================
// ARQUETIPO 4: CONTRASTE Y TENSIÓN (Dato métrico masivo, profundidad 2.5D)
// ============================================================================
export const DemoContrasteTension: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#090a0f", color: "#ffffff" }}>
      <AreaComposicion modo="editorial-alta" padding="lg">
        <ComposicionAsimetrica
          orientacion="vertical"
          proporcion="60-40"
          separacion="lg"
          primario={
            <PanelEditorial variante="transparente">
              <Etiqueta variante="borde" colorAcento="#ef4444" color="#ef4444">
                MEDICIÓN EN TIEMPO REAL
              </Etiqueta>
              <DatoMetrico
                tamano={120}
                prefijo="+"
                valor="99.8"
                sufijo="%"
                etiqueta="EFICIENCIA DE COMPOSICIÓN"
                color="#ef4444"
                colorEtiqueta="#94a3b8"
                style={{ marginTop: 16 }}
              />
              <Microtexto color="#64748b" style={{ marginTop: 8 }}>
                AUDITORÍA EN 34 FOTOGRAMAS CLÁSICOS // 0 DISCREPANCIAS
              </Microtexto>
            </PanelEditorial>
          }
          secundario={
            <CapaProfundidad profundidad={1.15}>
              <GrillaEditorial columnas={2} espaciado="md">
                <PanelEditorial variante="editorial" bordeColor="rgba(255,255,255,0.2)">
                  <TitularSecundario tamano={28} color="#ffffff">
                    Tiempo Cero
                  </TitularSecundario>
                  <CuerpoTexto tamano={18} color="#94a3b8">
                    Cero layout-shifts en renderizado Chromium.
                  </CuerpoTexto>
                </PanelEditorial>

                <PanelEditorial variante="editorial" bordeColor="rgba(255,255,255,0.2)">
                  <TitularSecundario tamano={28} color="#ffffff">
                    Modularidad
                  </TitularSecundario>
                  <CuerpoTexto tamano={18} color="#94a3b8">
                    Herramientas sin plantillas fijas de tarjeta.
                  </CuerpoTexto>
                </PanelEditorial>
              </GrillaEditorial>
            </CapaProfundidad>
          }
        />
      </AreaComposicion>
    </AbsoluteFill>
  );
};

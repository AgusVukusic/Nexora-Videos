import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, Easing } from "remotion";
import { C } from "../motor/actual";
import { FPS } from "../motor/constantes";
import { F } from "../motor/estilos";
import { usePop, useFlota, bump, lerp } from "../motor/anim";
import { Pildora } from "../piezas/basicas";
import type { DefEscena, PropsEscena } from "../tipos";

// Contenedor seguro: Altura máxima 940px, centrado arriba (y: 80 a 1040).
// Deja libres de y=1080 a y=1920 para los subtítulos (que están en y=1330)
const ZonaSegura: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 80,
        width: 960,
        height: 960,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// ============================================================================
// 1. GANCHO VISUAL: EL MICROONDAS RADIANTE (Frase 1: 0.00 - 3.53s)
//    Push-in de cámara hacia la ventana del microondas con cartel de choque visual.
// ============================================================================
export const MicroondasGanchoComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const entra = usePop(0);
  const fl = useFlota(0, 4, 14);

  // Push-in de cámara dinámico en los primeros 1.5 segundos
  const pushIn = interpolate(f, [0, 45], [0.82, 1.04], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Microondas vibrando cuando está en marcha
  const shakeX = Math.sin(f * 1.8) * 3;
  const shakeY = Math.cos(f * 2.2) * 2;

  // Pulso de resplandor interior
  const luzInterior = 0.7 + Math.sin(f * 0.4) * 0.3;

  return (
    <ZonaSegura>
      <div
        style={{
          position: "relative",
          width: 860,
          height: 860,
          transform: `scale(${entra * pushIn}) translateY(${fl}px)`,
        }}
      >
        {/* Cartel llamativo de impacto psicológico */}
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              background: "#ef4444",
              color: "#ffffff",
              fontFamily: F.titulo,
              fontSize: 34,
              fontWeight: "900",
              letterSpacing: 2,
              padding: "10px 34px",
              borderRadius: 50,
              boxShadow: "0 0 45px rgba(239, 68, 68, 0.75)",
              transform: `rotate(${Math.sin(f * 0.12) * 2.5}deg) scale(${1 + Math.sin(f * 0.3) * 0.04})`,
            }}
          >
            ⚠️ ¡LLEVAS AÑOS ENGAÑADO!
          </div>
        </div>

        {/* ILUSTRACIÓN DEL MICROONDAS */}
        <svg viewBox="0 0 800 640" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="chasis" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="resplandor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={luzInterior * 0.9} />
              <stop offset="50%" stopColor="#ef4444" stopOpacity={luzInterior * 0.6} />
              <stop offset="100%" stopColor="#78350f" stopOpacity={luzInterior * 0.3} />
            </linearGradient>
            <filter id="brilloNeon" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ONDAS DE RADIO / ENERGÍA SALIENDO DEL APARATO */}
          {[-1, 1].map((lado, idx) => (
            <g key={idx} transform={`translate(${400 + lado * 370}, 330)`}>
              {[0, 1, 2].map((i) => {
                const r = 40 + i * 45 + ((f * 3) % 45);
                const op = Math.max(0, 1 - r / 160);
                return (
                  <path
                    key={i}
                    d={`M 0 -90 A 100 100 0 0 ${lado < 0 ? 1 : 0} 0 90`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeDasharray="10 8"
                    opacity={op}
                  />
                );
              })}
            </g>
          ))}

          {/* CUERPO DEL MICROONDAS */}
          <g transform={`translate(${shakeX}, ${shakeY})`}>
            {/* Patas */}
            <rect x="180" y="520" width="60" height="20" rx="6" fill="#020617" />
            <rect x="560" y="520" width="60" height="20" rx="6" fill="#020617" />

            {/* Chasis principal */}
            <rect x="140" y="140" width="520" height="390" rx="36" fill="url(#chasis)" stroke="#475569" strokeWidth="8" />

            {/* Ventana de cristal ahumado / horno */}
            <rect x="175" y="175" width="350" height="320" rx="24" fill="#020617" stroke="#334155" strokeWidth="6" />

            {/* Interior iluminado con luz de calentamiento */}
            <rect x="190" y="190" width="320" height="290" rx="16" fill="url(#resplandor)" />

            {/* Rejilla protectora de la puerta */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={200 + i * 38} y1="200" x2={200 + i * 38} y2="470" stroke="#000000" strokeWidth="2" opacity="0.25" />
            ))}

            {/* Plato giratorio en el interior */}
            <ellipse cx="350" cy="430" rx="130" ry="24" fill="#ffffff" opacity="0.4" />
            <ellipse cx="350" cy="425" rx="110" ry="18" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />

            {/* Tazón con sopa humeante dentro girando */}
            <g transform="translate(350, 400)">
              <ellipse cx="0" cy="0" rx="65" ry="18" fill="#f97316" filter="url(#brilloNeon)" />
              <path d="M -60 0 C -45 40 45 40 60 0 Z" fill="#c2410c" />
              {[-25, 0, 25].map((vx, i) => {
                const vy = (f * 3 + i * 15) % 60;
                return (
                  <circle key={i} cx={vx + Math.sin(f * 0.2 + i) * 6} cy={-20 - vy} r={4 + vy * 0.15} fill="#ffffff" opacity={Math.max(0, 0.8 - vy / 60)} />
                );
              })}
            </g>

            {/* PANEL DE CONTROL DERECHO */}
            <rect x="545" y="175" width="90" height="320" rx="16" fill="#0f172a" />
            <rect x="555" y="195" width="70" height="42" rx="8" fill="#000000" stroke="#1e293b" strokeWidth="2" />
            <text x="590" y="225" textAnchor="middle" fill="#22c55e" fontFamily={F.mono} fontSize="20" fontWeight="bold">
              00:30
            </text>

            <circle cx="590" cy="275" r="16" fill="#334155" stroke="#64748b" strokeWidth="3" />
            <circle cx="590" cy="330" r="14" fill="#334155" />
            <circle cx="590" cy="375" r="14" fill="#334155" />
            <rect x="565" y="420" width="50" height="28" rx="8" fill="#15803d" stroke="#4ade80" strokeWidth="2" />
            <text x="590" y="439" textAnchor="middle" fill="#ffffff" fontFamily={F.mono} fontSize="12" fontWeight="bold">
              START
            </text>
          </g>

          <g transform="translate(100, 555)">
            <rect x="0" y="0" width="600" height="68" rx="22" fill="#0f172a" stroke="#f59e0b" strokeWidth="4" />
            <text x="300" y="44" textAnchor="middle" fill="#f59e0b" fontFamily={F.titulo} fontSize="25" fontWeight="bold">
              ¿CALIENTA DE ADENTRO AFUERA? ❌
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const microondasGancho: DefEscena = {
  C: MicroondasGanchoComp,
  momentos: 1,
  alInicio: () => true,
  sonidos: () => [[0, "whoosh", 0.35]],
};


// ============================================================================
// 2. CORTE TRANSVERSAL DEL ALIMENTO (Frase 2: 3.20 - 6.40s)
//    Muestra que las ondas penetran solo 1-2 cm del borde exterior; el centro sigue frío.
// ============================================================================
export const CorteComidaComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bMito, bRealidad] = b;

  const escala = usePop(0);
  const fl = useFlota(0.2, 4, 15);

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala}) translateY(${fl}px)` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#ef4444" color="#ffffff">
            ❌ LA MENTIRA AL DESCUBIERTO
          </Pildora>
        </div>

        <svg viewBox="0 0 800 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <radialGradient id="gradCalorSano" cx="50%" cy="50%" r="50%">
              <stop offset="65%" stopColor="#ef4444" />
              <stop offset="85%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fbbf24" />
            </radialGradient>
            <radialGradient id="gradHielo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>
          </defs>

          <ellipse cx="400" cy="400" rx="330" ry="75" fill="#1e293b" stroke="#475569" strokeWidth="6" />

          {/* Capa externa: penetrada por microondas */}
          <ellipse
            cx="400"
            cy="280"
            rx="260"
            ry="180"
            fill="url(#gradCalorSano)"
            stroke="#f59e0b"
            strokeWidth="8"
          />

          {[-180, -90, 90, 180].map((bx, i) => (
            <circle key={i} cx={400 + bx} cy={270 + Math.sin(f * 0.3 + i) * 15} r="7" fill="#fef08a" opacity="0.8" />
          ))}

          {/* Núcleo central congelado */}
          <ellipse
            cx="400"
            cy="280"
            rx="150"
            ry="95"
            fill="url(#gradHielo)"
            stroke="#bae6fd"
            strokeWidth="6"
          />

          <text x="400" y="270" textAnchor="middle" fill="#ffffff" fontFamily={F.titulo} fontSize="34" fontWeight="bold">
            ❄️ 12 °C
          </text>
          <text x="400" y="305" textAnchor="middle" fill="#e0f2fe" fontFamily={F.mono} fontSize="20" fontWeight="bold">
            NÚCLEO FRÍO
          </text>

          <g transform="translate(400, 120)">
            <rect x="-210" y="-30" width="420" height="50" rx="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
            <text x="0" y="3" textAnchor="middle" fill="#38bdf8" fontFamily={F.titulo} fontSize="19" fontWeight="bold">
              Las ondas solo penetran 1 a 2 cm
            </text>
          </g>

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect
              x="0"
              y="0"
              width="620"
              height="90"
              rx="22"
              fill="#0f172a"
              stroke={f >= bRealidad ? "#ef4444" : "#f59e0b"}
              strokeWidth="4"
            />
            <text
              x="310"
              y="38"
              textAnchor="middle"
              fill={f >= bRealidad ? "#f87171" : "#f59e0b"}
              fontFamily={F.titulo}
              fontSize="23"
              fontWeight="bold"
            >
              EL CALOR VIAJA DE AFUERA HACIA ADENTRO
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#fef08a" fontFamily={F.texto} fontSize="16">
              El centro se calienta por conducción lenta
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const corteComida: DefEscena = {
  C: CorteComidaComp,
  momentos: 2,
  alInicio: () => true,
  sonidos: () => [
    [0, "negacion", 0.35],
    [1, "whoosh", 0.3],
  ],
};


// ============================================================================
// 3. EL MAGNETRÓN SCI-FI (Frase 3: 6.07 - 10.70s)
// ============================================================================
export const MagnetronComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bPieza, bMagnetron, bOndas] = b;

  const escala = usePop(0);
  const fl = useFlota(0.3, 4, 16);
  const entraOndas = usePop(bOndas);
  const fase = f * 0.28;

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala}) translateY(${fl}px)` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#0f172a" color="#38bdf8">
            ⚡ EL CORAZÓN DE LA MÁQUINA: EL MAGNETRÓN
          </Pildora>
        </div>

        <svg viewBox="0 0 820 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="bobina" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id="glowLaser" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(90, 160)">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x="0" y={i * 32} width="160" height="20" rx="6" fill="#334155" stroke="#64748b" strokeWidth="2" />
            ))}
            <rect x="35" y="-15" width="90" height="210" rx="14" fill="url(#bobina)" stroke="#fde68a" strokeWidth="3" />
            <circle cx="80" cy="90" r="30" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
            <circle cx="80" cy="90" r="14" fill="#38bdf8" filter="url(#glowLaser)" />

            <rect x="125" y="72" width="70" height="36" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="200" cy="90" r="22" fill="#06b6d4" filter="url(#glowLaser)" />
          </g>

          {f >= bOndas && (
            <g transform="translate(300, 250)" opacity={entraOndas}>
              <line x1="0" y1="0" x2="480" y2="0" stroke="#1e293b" strokeWidth="3" strokeDasharray="8 6" />
              {[
                { amp: 90, color: "#22d3ee", w: 6, des: 0 },
                { amp: 60, color: "#f59e0b", w: 4, des: 1.8 },
                { amp: 100, color: "#a855f7", w: 3, des: 3.2 },
              ].map((onda, idx) => {
                let d = `M 0 ${Math.sin(-fase + onda.des) * onda.amp}`;
                for (let x = 12; x <= 480; x += 12) {
                  d += ` L ${x} ${Math.sin(x * 0.035 - fase + onda.des) * onda.amp}`;
                }
                return (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke={onda.color}
                    strokeWidth={onda.w}
                    filter="url(#glowLaser)"
                    opacity={0.9}
                  />
                );
              })}

              {[50, 160, 270, 380].map((bx, i) => {
                const curX = (bx + f * 6) % 480;
                const curY = Math.sin(curX * 0.035 - fase) * 90;
                return <circle key={i} cx={curX} cy={curY} r="8" fill="#ffffff" filter="url(#glowLaser)" />;
              })}
            </g>
          )}

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect x="0" y="0" width="620" height="90" rx="22" fill="#0f172a" stroke={f >= bOndas ? "#22d3ee" : "#06b6d4"} strokeWidth="4" />
            <text x="310" y="38" textAnchor="middle" fill="#22d3ee" fontFamily={F.titulo} fontSize="25" fontWeight="bold">
              DISPARA ONDAS DE 2.450 MHz
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#e2e8f0" fontFamily={F.texto} fontSize="16">
              La frecuencia exacta que hace bailar el agua
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const magnetron: DefEscena = {
  C: MagnetronComp,
  momentos: 3,
  alInicio: () => true,
  sonidos: () => [
    [0, "proyector", 0.3],
    [1, "clic", 0.25],
    [2, "swoosh", 0.35],
  ],
};


// ============================================================================
// 4. LA MOLÉCULA DE AGUA EXPRESIVA (Frase 4: 10.37 - 14.83s)
// ============================================================================
export const MoleculaAguaComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bVibran, bMillones] = b;

  const escala = usePop(0);
  const fl = useFlota(0, 3, 18);
  const angulo = Math.sin(f * 0.7) * 50;

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala}) translateY(${fl}px)` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#f59e0b" color="#000000">
            💧 EL BLANCO: LA MOLÉCULA DE AGUA (H₂O)
          </Pildora>
        </div>

        <svg viewBox="0 0 800 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <radialGradient id="gradOxiComic" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="60%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </radialGradient>
            <radialGradient id="gradHidroComic" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
          </defs>

          <g transform="translate(60, 160)">
            <rect x="0" y="0" width="40" height="260" rx="12" fill="#ef4444" opacity={0.4 + Math.sin(f * 0.7) * 0.3} />
            <text x="20" y="145" textAnchor="middle" fill="#ffffff" fontFamily={F.titulo} fontSize="42" fontWeight="bold">
              +
            </text>
          </g>
          <g transform="translate(700, 160)">
            <rect x="0" y="0" width="40" height="260" rx="12" fill="#3b82f6" opacity={0.4 - Math.sin(f * 0.7) * 0.3} />
            <text x="20" y="145" textAnchor="middle" fill="#ffffff" fontFamily={F.titulo} fontSize="42" fontWeight="bold">
              −
            </text>
          </g>

          <g transform={`translate(400, 290) rotate(${angulo})`}>
            <line x1="0" y1="0" x2="-100" y2="-90" stroke="#94a3b8" strokeWidth="26" strokeLinecap="round" />
            <line x1="0" y1="0" x2="100" y2="-90" stroke="#94a3b8" strokeWidth="26" strokeLinecap="round" />

            <circle cx="0" cy="0" r="90" fill="url(#gradOxiComic)" stroke="#ffe4e6" strokeWidth="6" />

            <g transform="translate(0, -10)">
              <circle cx="-32" cy="0" r="18" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
              <circle cx="-32" cy="0" r="8" fill="#0f172a" />
              <circle cx="32" cy="0" r="18" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
              <circle cx="32" cy="0" r="8" fill="#0f172a" />
              <path d="M 45 -40 C 45 -55, 60 -50, 60 -35 C 60 -25, 45 -25, 45 -40 Z" fill="#38bdf8" />
              <ellipse cx="0" cy="35" rx="18" ry="12" fill="#881337" stroke="#1e293b" strokeWidth="3" />
            </g>

            {[-1, 1].map((lado, i) => (
              <g key={i} transform={`translate(${lado * 105}, -95)`}>
                <circle cx="0" cy="0" r="50" fill="url(#gradHidroComic)" stroke="#ffffff" strokeWidth="5" />
                <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontFamily={F.titulo} fontSize="34" fontWeight="bold">
                  H⁺
                </text>
              </g>
            ))}
          </g>

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect
              x="0"
              y="0"
              width="620"
              height="90"
              rx="22"
              fill="#0f172a"
              stroke={f >= bMillones ? "#f59e0b" : "#38bdf8"}
              strokeWidth="4"
            />
            <text
              x="310"
              y="38"
              textAnchor="middle"
              fill={f >= bMillones ? "#f59e0b" : "#38bdf8"}
              fontFamily={F.titulo}
              fontSize="25"
              fontWeight="bold"
            >
              ⚡ 2.400 MILLONES DE GIROS / SEG
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#fde68a" fontFamily={F.texto} fontSize="16">
              La molécula gira siguiendo el campo eléctrico
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const moleculaAgua: DefEscena = {
  C: MoleculaAguaComp,
  momentos: 2,
  alInicio: () => true,
  sonidos: () => [
    [0, "whoosh", 0.3],
    [1, "golpe", 0.4],
  ],
};


// ============================================================================
// 5. MATERIALES VS AGUA (NUEVA ESCENA COHERENTE - Frase 5: 14.50 - 18.83s)
//    Muestra un vaso de plástico (ondas pasan sin efecto) vs vaso de agua (absorción total).
// ============================================================================
export const MaterialesVsAguaComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bCalib, bSolo, bAgua] = b;

  const escala = usePop(0);
  const fl = useFlota(0.2, 3, 16);
  const entraAgua = usePop(bAgua);

  // Animación de absorción energética en el agua
  const aura = 0.5 + Math.sin(f * 0.4) * 0.3;

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala}) translateY(${fl}px)` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#0f172a" color="#22d3ee">
            🔬 SELECTIVIDAD DE LAS ONDAS: ¿QUÉ SE CALIENTA?
          </Pildora>
        </div>

        <svg viewBox="0 0 820 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          {/* LADO IZQUIERDO: RECIPIENTE DE PLÁSTICO / VIDRIO SECO */}
          <g transform="translate(200, 190)">
            {/* Rayos pasando como fantasmas */}
            {[-45, 0, 45].map((xOff, i) => (
              <g key={i} transform={`translate(${xOff}, -70)`}>
                <line x1="0" y1="0" x2="0" y2="290" stroke="#64748b" strokeWidth="4" strokeDasharray="8 6" opacity="0.5" />
                <polygon points="0,300 -5,288 5,288" fill="#64748b" opacity="0.6" />
              </g>
            ))}

            {/* Vaso / tupper de plástico transparente amplio */}
            <rect x="-115" y="0" width="230" height="200" rx="20" fill="#1e293b" stroke="#64748b" strokeWidth="4" opacity="0.75" />
            <text x="0" y="85" textAnchor="middle" fill="#94a3b8" fontFamily={F.titulo} fontSize="20" fontWeight="bold">
              PLÁSTICO / VIDRIO
            </text>
            <text x="0" y="118" textAnchor="middle" fill="#64748b" fontFamily={F.mono} fontSize="14" fontWeight="bold">
              SIN DIPOLO DE AGUA
            </text>

            {/* Badge de No Reacciona */}
            <g transform="translate(0, 235)">
              <rect x="-100" y="-18" width="200" height="38" rx="14" fill="#090d16" stroke="#64748b" strokeWidth="3" />
              <text x="0" y="7" textAnchor="middle" fill="#94a3b8" fontFamily={F.mono} fontSize="15" fontWeight="bold">
                0% ABSORCIÓN ❌
              </text>
            </g>
          </g>

          {/* LADO DERECHO: VASO CON AGUA (Absorbe toda la energía) */}
          <g transform={`translate(600, 190) scale(${f >= bAgua ? entraAgua : 0.95})`}>
            {/* Rayos concentrándose y absorbidos por el agua */}
            {[-50, 0, 50].map((xOff, i) => (
              <g key={i} transform={`translate(${xOff}, -70)`}>
                <line x1="0" y1="0" x2={-xOff * 0.4} y2="135" stroke="#06b6d4" strokeWidth="5" opacity={0.8} />
                <circle cx={-xOff * 0.4} cy="135" r="6" fill="#22d3ee" />
              </g>
            ))}

            {/* Vaso con agua azul brillante amplio */}
            <rect x="-115" y="0" width="230" height="200" rx="20" fill="#082f49" stroke="#38bdf8" strokeWidth="5" />
            {/* Líquido agua con resplandor */}
            <rect x="-107" y="35" width="214" height="157" rx="14" fill="#0284c7" opacity={aura} />

            {/* Burbujitas agitándose */}
            {[-60, -20, 25, 60].map((bx, i) => (
              <circle key={i} cx={bx} cy={150 - ((f * 3 + i * 20) % 90)} r="4" fill="#e0f2fe" opacity={0.8} />
            ))}

            <text x="0" y="85" textAnchor="middle" fill="#ffffff" fontFamily={F.titulo} fontSize="22" fontWeight="bold">
              AGUA (H₂O)
            </text>
            <text x="0" y="118" textAnchor="middle" fill="#bae6fd" fontFamily={F.mono} fontSize="14" fontWeight="bold">
              DIPOLO ACTIVO
            </text>

            {/* Badge de Absorción Total */}
            <g transform="translate(0, 235)">
              <rect x="-105" y="-18" width="210" height="38" rx="14" fill="#090d16" stroke="#22d3ee" strokeWidth="3" />
              <text x="0" y="7" textAnchor="middle" fill="#22d3ee" fontFamily={F.mono} fontSize="15" fontWeight="bold">
                100% ABSORCIÓN ⚡
              </text>
            </g>
          </g>

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect x="0" y="0" width="620" height="90" rx="22" fill="#090d16" stroke={f >= bAgua ? "#22d3ee" : "#06b6d4"} strokeWidth="4" />
            <text x="310" y="38" textAnchor="middle" fill="#22d3ee" fontFamily={F.titulo} fontSize="25" fontWeight="bold">
              CALIBRADAS SOLO PARA EL AGUA
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#e0f2fe" fontFamily={F.texto} fontSize="16">
              Plástico y vidrio no absorben ondas electromagnéticas
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const materialesVsAgua: DefEscena = {
  C: MaterialesVsAguaComp,
  momentos: 3,
  alInicio: () => true,
  sonidos: () => [
    [0, "whoosh", 0.3],
    [1, "clic", 0.25],
    [2, "ding", 0.35],
  ],
};


// ============================================================================
// 6. COLISIONES Y FRICCIÓN TÉRMICA (Frase 6: 18.50 - 22.77s)
// ============================================================================
export const FriccionTermicaComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bChocar, bVelocidad, bFriccion] = b;

  const escala = usePop(0);
  const calorIntenso = f >= bFriccion ? 1 : lerp(f, bChocar, bFriccion, 0.2, 0.8);

  const moleculas = [
    { x: 300, y: 260, r: 44, fase: 0 },
    { x: 500, y: 250, r: 44, fase: 1.8 },
    { x: 400, y: 170, r: 44, fase: 3.2 },
    { x: 340, y: 380, r: 44, fase: 4.5 },
    { x: 490, y: 370, r: 44, fase: 0.9 },
  ];

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala})` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#f97316" color="#ffffff">
            💥 CHOQUE FRENÉTICO: FRICCIÓN = CALOR
          </Pildora>
        </div>

        <svg viewBox="0 0 800 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <radialGradient id="haloFuego" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6 * calorIntenso} />
              <stop offset="60%" stopColor="#f97316" stopOpacity={0.3 * calorIntenso} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="400" cy="280" r="280" fill="url(#haloFuego)" />

          {f >= bChocar && (
            <g transform="translate(400, 270)">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const ang = (i * Math.PI) / 4 + f * 0.15;
                const d = 35 + Math.sin(f * 0.8 + i) * 30;
                return (
                  <line
                    key={i}
                    x1={Math.cos(ang) * 15}
                    y1={Math.sin(ang) * 15}
                    x2={Math.cos(ang) * d}
                    y2={Math.sin(ang) * d}
                    stroke="#fbbf24"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          )}

          {moleculas.map((m, idx) => {
            const dx = Math.sin(f * 0.9 + m.fase) * (26 * calorIntenso);
            const dy = Math.cos(f * 1.1 + m.fase) * (26 * calorIntenso);
            const rot = Math.sin(f * 0.8 + idx) * 55;
            const colorM = f >= bFriccion ? "#ef4444" : "#0284c7";

            return (
              <g key={idx} transform={`translate(${m.x + dx}, ${m.y + dy}) rotate(${rot})`}>
                <circle cx="0" cy="0" r={m.r} fill={colorM} stroke="#fef08a" strokeWidth={calorIntenso * 4} />
                <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontFamily={F.titulo} fontSize="20" fontWeight="bold">
                  H₂O
                </text>
                <circle cx={-m.r * 0.8} cy={-m.r * 0.8} r={m.r * 0.42} fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                <circle cx={m.r * 0.8} cy={-m.r * 0.8} r={m.r * 0.42} fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              </g>
            );
          })}

          {f >= bFriccion && (
            <g transform="translate(400, 100)">
              {[-100, 0, 100].map((xOff, i) => {
                const yVap = (f * 4 + i * 20) % 70;
                return (
                  <path
                    key={i}
                    d={`M ${xOff} ${40 - yVap} Q ${xOff + 18} ${20 - yVap} ${xOff} ${-yVap}`}
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="5"
                    opacity={Math.max(0, 1 - yVap / 70)}
                  />
                );
              })}
            </g>
          )}

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect x="0" y="0" width="620" height="90" rx="22" fill="#0f172a" stroke={f >= bFriccion ? "#ef4444" : "#f97316"} strokeWidth="4" />
            <text x="310" y="38" textAnchor="middle" fill={f >= bFriccion ? "#ef4444" : "#f97316"} fontFamily={F.titulo} fontSize="25" fontWeight="bold">
              💥 FRICCIÓN = CALOR TÉRMICO
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#fed7aa" fontFamily={F.texto} fontSize="16">
              Al chocar millones de veces generan calor
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const friccionTermica: DefEscena = {
  C: FriccionTermicaComp,
  momentos: 3,
  alInicio: () => true,
  sonidos: () => [
    [0, "campana", 0.3],
    [1, "whoosh", 0.3],
    [2, "exito", 0.35],
  ],
};


// ============================================================================
// 7. EL RECIPIENTE SECO: TOTALMENTE FRÍO (Frase 7: 22.43 - 27.47s)
//    Muestra un plato cerámico realista con ondas que lo atraviesan limpiamente y termómetro en 18.5°C.
// ============================================================================
export const PlatoSecoComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bMetes, bSeco, bFrio] = b;

  const escala = usePop(0);
  const fl = useFlota(0.2, 4, 15);
  const entraTermo = usePop(bSeco ?? 0);

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala}) translateY(${fl}px)` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#0284c7" color="#ffffff">
            ❄️ LA PRUEBA CIENTÍFICA: PLATO SECO
          </Pildora>
        </div>

        <svg viewBox="0 0 800 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="porcelanaSeca" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="fondoPlatoSeco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="cuerpoPlato" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* ONDAS SUPERIORES ENTRANDO HACIA EL PLATO */}
          {[-160, -80, 0, 80, 160].map((xOff, idx) => (
            <g key={idx} transform={`translate(${400 + xOff}, 90)`}>
              <line x1="0" y1="0" x2="0" y2="110" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 8" opacity={0.7} />
              <polygon points="0,120 -6,108 6,108" fill="#f59e0b" opacity={0.8} />
            </g>
          ))}

          {/* PLATO CERÁMICO / HONDO REALISTA EN PERSPECTIVA 3D */}
          <g transform="translate(400, 260)">
            <ellipse cx="0" cy="115" rx="270" ry="32" fill="#000000" opacity="0.45" />
            <ellipse cx="0" cy="95" rx="140" ry="20" fill="#334155" stroke="#475569" strokeWidth="3" />
            <path
              d="M -260 0 C -260 100, 260 100, 260 0 C 180 20, -180 20, -260 0 Z"
              fill="url(#cuerpoPlato)"
              stroke="#64748b"
              strokeWidth="5"
            />
            <ellipse cx="0" cy="0" rx="260" ry="55" fill="url(#porcelanaSeca)" stroke="#94a3b8" strokeWidth="5" />
            <ellipse cx="0" cy="10" rx="185" ry="36" fill="url(#fondoPlatoSeco)" stroke="#64748b" strokeWidth="3" />
            <path
              d="M -200 -20 Q 0 -50 200 -20"
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* ONDAS INFERIORES SALIENDO DEL PLATO */}
          {[-160, -80, 0, 80, 160].map((xOff, idx) => (
            <g key={idx} transform={`translate(${400 + xOff}, 365)`}>
              <line x1="0" y1="0" x2="0" y2="70" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 8" opacity={0.7} />
              <polygon points="0,80 -6,68 6,68" fill="#f59e0b" opacity={0.8} />
            </g>
          ))}

          {/* TERMÓMETRO INFRARROJO DIGITAL */}
          <g transform={`translate(510, 105) scale(${entraTermo})`}>
            <rect x="0" y="0" width="240" height="110" rx="20" fill="#090d16" stroke="#38bdf8" strokeWidth="4" />
            <text x="24" y="36" fill="#94a3b8" fontFamily={F.titulo} fontSize="17" fontWeight="bold">
              TERMÓMETRO LÁSER
            </text>
            <text x="24" y="78" fill="#38bdf8" fontFamily={F.mono} fontSize="34" fontWeight="bold">
              ❄️ 18.5 °C
            </text>
            <text x="24" y="98" fill="#7dd3fc" fontFamily={F.mono} fontSize="13">
              TEMPERATURA AMBIENTE
            </text>
            <line x1="20" y1="110" x2="-80" y2="160" stroke="#ef4444" strokeWidth="3" strokeDasharray="6 4" />
            <circle cx="-80" cy="160" r="5" fill="#ef4444" />
          </g>

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect x="0" y="0" width="620" height="90" rx="22" fill="#090d16" stroke="#38bdf8" strokeWidth="4" />
            <text x="310" y="38" textAnchor="middle" fill="#38bdf8" fontFamily={F.titulo} fontSize="25" fontWeight="bold">
              ❄️ 0 % ABSORCIÓN DE ENERGÍA
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#f8fafc" fontFamily={F.texto} fontSize="16">
              Sin agua, las microondas atraviesan el plato
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const platoSeco: DefEscena = {
  C: PlatoSecoComp,
  momentos: 3,
  alInicio: () => true,
  sonidos: () => [
    [0, "clic", 0.25],
    [1, "whoosh", 0.3],
    [2, "ding", 0.35],
  ],
};


// ============================================================================
// 8. CONDUCCIÓN POR CONTACTO CON DEDOS QUEMADOS (Frase 8: 27.13 - 31.67s)
//    Muestra el plato con sopa y dedos cómicos quemándose con bocadillo "¡OUCH! 🔥".
// ============================================================================
export const ConduccionComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bPlato, bTransfiere] = b;

  const escala = usePop(0);
  const fl = useFlota(0.4, 4, 16);
  const entraTransf = usePop(bTransfiere);

  // Temblor de dedos por el dolor del calor
  const shakeDedos = f >= bTransfiere ? Math.sin(f * 2.2) * 5 : 0;

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala}) translateY(${fl}px)` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#dc2626" color="#ffffff">
            🔥 ¿POR QUÉ QUEMA EL PLATO AL SACARLO?
          </Pildora>
        </div>

        <svg viewBox="0 0 800 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <linearGradient id="sopaRica" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="porcelanaBaseNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="porcelanaBaseQuemando" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>

          {/* PLATO CERÁMICO HONDO */}
          <g transform="translate(400, 250)">
            <ellipse cx="0" cy="120" rx="270" ry="32" fill="#000000" opacity="0.45" />

            <ellipse
              cx="0"
              cy="98"
              rx="140"
              ry="22"
              fill={f >= bTransfiere ? "#991b1b" : "#334155"}
              stroke={f >= bTransfiere ? "#ef4444" : "#475569"}
              strokeWidth="4"
            />

            <path
              d="M -260 0 C -260 105, 260 105, 260 0 C 180 20, -180 20, -260 0 Z"
              fill={f >= bTransfiere ? "url(#porcelanaBaseQuemando)" : "url(#porcelanaBaseNormal)"}
              stroke={f >= bTransfiere ? "#ef4444" : "#64748b"}
              strokeWidth="6"
            />

            <ellipse
              cx="0"
              cy="0"
              rx="260"
              ry="55"
              fill="#e2e8f0"
              stroke={f >= bTransfiere ? "#ef4444" : "#94a3b8"}
              strokeWidth="5"
            />

            {/* SOPA HIRVIENDO */}
            <ellipse cx="0" cy="10" rx="190" ry="38" fill="url(#sopaRica)" stroke="#f97316" strokeWidth="4" />

            {[-100, -30, 40, 110].map((bx, idx) => {
              const by = (f * 3 + idx * 12) % 25;
              return <circle key={idx} cx={bx} cy={18 - by} r="4" fill="#fef08a" opacity={0.8} />;
            })}

            {[-80, 0, 80].map((vx, idx) => {
              const vy = (f * 4 + idx * 18) % 80;
              return (
                <path
                  key={idx}
                  d={`M ${vx} ${-vy} Q ${vx + 16} ${-vy - 20} ${vx} ${-vy - 40}`}
                  fill="none"
                  stroke="#fdba74"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity={Math.max(0, 1 - vy / 80)}
                />
              );
            })}

            {/* FLECHAS DE CONDUCCIÓN */}
            {f >= bTransfiere && (
              <g opacity={entraTransf}>
                {[-110, -40, 40, 110].map((fx, i) => (
                  <g key={i} transform={`translate(${fx}, 28)`}>
                    <line x1="0" y1="0" x2="0" y2="42" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" />
                    <polygon points="0,50 -7,36 7,36" fill="#fef08a" />
                  </g>
                ))}
              </g>
            )}

            {/* DEDOS / MANOS CÓMICAS QUEMÁNDOSE AL AGARRAR EL PLATO */}
            {f >= bTransfiere && (
              <g transform={`translate(${shakeDedos}, 0)`}>
                {/* Mano izquierda */}
                <g transform="translate(-255, -15)">
                  <ellipse cx="0" cy="0" rx="24" ry="16" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
                  <ellipse cx="-12" cy="-14" rx="10" ry="18" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  {/* Chispas de dolor */}
                  <text x="-20" y="-30" fill="#fef08a" fontSize="24">💥</text>
                </g>
                {/* Mano derecha */}
                <g transform="translate(255, -15)">
                  <ellipse cx="0" cy="0" rx="24" ry="16" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
                  <ellipse cx="12" cy="-14" rx="10" ry="18" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  <text x="15" y="-30" fill="#fef08a" fontSize="24">💥</text>
                </g>
                {/* Bocadillo cómico ¡OUCH! */}
                <g transform="translate(0, -75)">
                  <rect x="-70" y="-22" width="140" height="44" rx="16" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
                  <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontFamily={F.titulo} fontSize="22" fontWeight="bold">
                    ¡OUCH! 🔥
                  </text>
                </g>
              </g>
            )}

            {f < bTransfiere && (
              <g transform="translate(0, -60)">
                <rect x="-100" y="-19" width="200" height="38" rx="14" fill="#090d16" stroke="#f97316" strokeWidth="3" />
                <text x="0" y="7" textAnchor="middle" fill="#f97316" fontFamily={F.mono} fontSize="17" fontWeight="bold">
                  🍲 SOPA: 90 °C
                </text>
              </g>
            )}
          </g>

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect
              x="0"
              y="0"
              width="620"
              height="90"
              rx="22"
              fill="#090d16"
              stroke={f >= bTransfiere ? "#ef4444" : "#f97316"}
              strokeWidth="4"
            />
            <text
              x="310"
              y="38"
              textAnchor="middle"
              fill={f >= bTransfiere ? "#ef4444" : "#f97316"}
              fontFamily={F.titulo}
              fontSize="24"
              fontWeight="bold"
            >
              CALOR POR CONTACTO DIRECTO
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#fed7aa" fontFamily={F.texto} fontSize="16">
              La comida caliente transfiere su calor al plato
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const conduccionCalor: DefEscena = {
  C: ConduccionComp,
  momentos: 2,
  alInicio: () => true,
  sonidos: () => [
    [0, "whoosh", 0.3],
    [1, "golpe", 0.35],
  ],
};


// ============================================================================
// 9. LA CERÁMICA POROSA: AGUA ATRAPADA HIERVE (Frase 9: 31.33 - 35.40s)
// ============================================================================
export const CeramicaPorosComp: React.FC<PropsEscena> = ({ b }) => {
  const f = useCurrentFrame();
  const [bCeramica, bPoros] = b;

  const escala = usePop(0);
  const fl = useFlota(0.1, 4, 15);

  return (
    <ZonaSegura>
      <div style={{ position: "relative", width: 860, height: 860, transform: `scale(${escala}) translateY(${fl}px)` }}>
        <div style={{ position: "absolute", top: 10, left: 0, right: 0, textAlign: "center" }}>
          <Pildora fondo="#f59e0b" color="#000000">
            🔍 BAJO EL MICROSCOPIO: CERÁMICA POROSA
          </Pildora>
        </div>

        <svg viewBox="0 0 800 620" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <clipPath id="lenteClipSeguro">
              <circle cx="460" cy="280" r="150" />
            </clipPath>
          </defs>

          <g transform="translate(130, 210)">
            <rect x="0" y="0" width="130" height="150" rx="14" fill="#475569" stroke="#94a3b8" strokeWidth="5" />
            <path d="M 0 25 C -40 25 -40 100 0 100" fill="none" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
            <text x="65" y="85" textAnchor="middle" fill="#cbd5e1" fontFamily={F.titulo} fontSize="18" fontWeight="bold">
              Taza vieja
            </text>
          </g>

          <line x1="200" y1="250" x2="310" y2="210" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6" />
          <line x1="200" y1="310" x2="310" y2="350" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6" />

          <g>
            <circle cx="460" cy="280" r="160" fill="#0f172a" stroke="#f59e0b" strokeWidth="10" />

            <g clipPath="url(#lenteClipSeguro)">
              <rect x="300" y="120" width="320" height="320" fill="#334155" />

              {[
                { cx: 410, cy: 220, r: 32 },
                { cx: 510, cy: 240, r: 38 },
                { cx: 440, cy: 320, r: 42 },
                { cx: 520, cy: 340, r: 30 },
              ].map((poro, idx) => {
                const hierve = f >= bPoros;
                return (
                  <g key={idx}>
                    <circle cx={poro.cx} cy={poro.cy} r={poro.r} fill="#1e293b" stroke="#64748b" strokeWidth="3" />
                    <circle
                      cx={poro.cx}
                      cy={poro.cy}
                      r={poro.r * 0.72}
                      fill={hierve ? "#ef4444" : "#0284c7"}
                    />
                    {hierve && (
                      <circle cx={poro.cx} cy={poro.cy} r={poro.r * 0.9} fill="none" stroke="#fef08a" strokeWidth="3" strokeDasharray="4 4" />
                    )}
                  </g>
                );
              })}
            </g>

            <path d="M 360 180 Q 460 150 540 190" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.3" />
          </g>

          {/* BANNER INFERIOR: Visible toda la escena */}
          <g transform="translate(90, 465)">
            <rect
              x="0"
              y="0"
              width="620"
              height="90"
              rx="22"
              fill="#0f172a"
              stroke={f >= bPoros ? "#ef4444" : "#f59e0b"}
              strokeWidth="4"
            />
            <text
              x="310"
              y="38"
              textAnchor="middle"
              fill={f >= bPoros ? "#ef4444" : "#f59e0b"}
              fontFamily={F.titulo}
              fontSize="25"
              fontWeight="bold"
            >
              AGUA ATRAPADA EN LOS POROS
            </text>
            <text x="310" y="68" textAnchor="middle" fill="#fed7aa" fontFamily={F.texto} fontSize="16">
              Al hervir dentro, el agua calienta toda la taza
            </text>
          </g>
        </svg>
      </div>
    </ZonaSegura>
  );
};

export const ceramicaPoros: DefEscena = {
  C: CeramicaPorosComp,
  momentos: 2,
  alInicio: () => true,
  sonidos: () => [
    [0, "whoosh", 0.3],
    [1, "puff", 0.35],
  ],
};

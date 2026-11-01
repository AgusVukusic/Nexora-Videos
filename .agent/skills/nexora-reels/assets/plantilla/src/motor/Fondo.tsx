import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { C, ESTILO, SUAVE } from "./actual";
import { alfa, type Estilo } from "./estilos";

/** Fondo del estilo: degradado con manchas de luz que se mueven despacio (suave) o liso con grano (marcado). */
export const Fondo: React.FC<{ estilo?: Estilo }> = ({ estilo: estiloProp }) => {
  const f = useCurrentFrame();
  const est = estiloProp ?? ESTILO;
  const c = est.colores;
  const suave = est.familia === "suave";
  const m = (cx: number, cy: number, r: number, color: string, a: number) =>
    `radial-gradient(circle ${r}px at ${cx}px ${cy}px, ${alfa(color, a)} 0%, ${alfa(color, 0)} 100%)`;
  const [m1, m2, m3] = [
    c.manchas[0] ?? c.fondo2,
    c.manchas[1] ?? c.fondo,
    c.manchas[2] ?? c.manchas[0] ?? c.fondo2,
  ];
  const capas = suave
    ? [
        m(820 + 70 * Math.sin(f / 95), 1480 + 90 * Math.cos(f / 120), 980, m1, 0.7),
        m(260 + 90 * Math.cos(f / 105), 520 + 70 * Math.sin(f / 85), 860, m2, 0.85),
        m(980 + 40 * Math.sin(f / 70), 260 + 50 * Math.cos(f / 90), 620, m3, 0.5),
      ]
    : [m(540, 900, 1100, m2, 0.35)];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${c.fondo} 0%, ${c.fondo2} 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: capas.join(",") }} />
      {est.grano > 0 && (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile("texturas/grano.png")})`,
            backgroundSize: "512px 512px",
            opacity: est.grano,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

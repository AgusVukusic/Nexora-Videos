import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { C } from "./actual";
import { SEMI } from "./constantes";
import { rnd } from "./anim";

/** Transición de semitono: puntos que crecen desde el centro hasta tapar la pantalla y vuelven a encoger. */
export const Semitono: React.FC<{ centro: number; color?: string }> = ({ centro, color = C.acento }) => {
  const f = useCurrentFrame();
  const t = (f - (centro - SEMI / 2)) / SEMI;
  if (t <= 0 || t >= 1) return null;
  const cell = 54;
  const cols = Math.ceil(1080 / cell) + 1;
  const rows = Math.ceil(1920 / cell) + 1;
  const cobertura = t < 0.5 ? Easing.in(Easing.quad)(t / 0.5) : 1 - Easing.out(Easing.quad)((t - 0.5) / 0.5);
  const dots: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = i * cell + (j % 2 ? cell / 2 : 0);
      const cy = j * cell;
      const d = Math.hypot(cx - 540, cy - 960) / 1100;
      const k = Math.min(1, Math.max(0, cobertura * 1.45 - d * 0.35 - rnd(i * 97 + j) * 0.12));
      const r = k * cell * 0.78;
      if (r > 0.5) dots.push(<circle key={`${i}-${j}`} cx={cx} cy={cy} r={r} fill={color} />);
    }
  }
  return (
    <AbsoluteFill style={{ zIndex: 45, pointerEvents: "none" }}>
      <svg width={1080} height={1920}>{dots}</svg>
    </AbsoluteFill>
  );
};

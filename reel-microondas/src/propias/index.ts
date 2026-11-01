import type { DefEscena } from "../tipos";
import { ejemplo } from "./Ejemplo";
import {
  microondasGancho,
  corteComida,
  magnetron,
  moleculaAgua,
  materialesVsAgua,
  friccionTermica,
  platoSeco,
  conduccionCalor,
  ceramicaPoros,
} from "./AnimacionesMicroondas";

export const PROPIAS: Record<string, DefEscena> = {
  Ejemplo: ejemplo,
  MicroondasGancho: microondasGancho,
  CorteComida: corteComida,
  Magnetron: magnetron,
  MoleculaAgua: moleculaAgua,
  MaterialesVsAgua: materialesVsAgua,
  FriccionTermica: friccionTermica,
  PlatoSeco: platoSeco,
  ConduccionCalor: conduccionCalor,
  CeramicaPoros: ceramicaPoros,
};

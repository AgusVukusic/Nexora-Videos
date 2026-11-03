import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS } from "../motor/constantes";
import {
  DemoEditorialSuizo,
  DemoBlueprintTecnico,
  DemoTipografiaCinetica,
  DemoContrasteTension,
} from "./KitEstudioDemo";

/**
 * Root dedicado exclusivamente para la inspección y renderizado de demostraciones
 * del Kit de Estudio Visual (Etapa 40).
 * Mantiene desacopladas las herramientas de validación de la composición de producción (Reel).
 */
export const KitEstudioRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoEditorialSuizo"
        component={DemoEditorialSuizo}
        durationInFrames={90}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemoBlueprintTecnico"
        component={DemoBlueprintTecnico}
        durationInFrames={90}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemoTipografiaCinetica"
        component={DemoTipografiaCinetica}
        durationInFrames={90}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DemoContrasteTension"
        component={DemoContrasteTension}
        durationInFrames={90}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};

// Registro del root para ejecución aislada e independiente
registerRoot(KitEstudioRoot);

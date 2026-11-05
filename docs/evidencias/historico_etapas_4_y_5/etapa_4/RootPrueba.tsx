import React from "react";
import { Composition } from "remotion";
import { ComposicionPrueba } from "./ComposicionPrueba";

export const RootPrueba: React.FC = () => {
  return (
    <Composition
      id="PruebaNexora"
      component={ComposicionPrueba}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

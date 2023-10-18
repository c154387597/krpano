import { useEffect, useRef } from "react";
import { IKrpanoConfig } from "../types";

export const useKrpano = (config: IKrpanoConfig): void => {
  const isCreated = useRef(false);

  useEffect(() => {
    const defaultConfig: Partial<IKrpanoConfig> = {
      html5: "auto",
      xml: null,
      mobilescale: 1,
    };
    const embedpano = () => {
      if (typeof window.embedpano === "function") {
        window.embedpano({ ...defaultConfig, ...config });
      }
    };

    if (typeof window.embedpano === "function") {
      (config.xml || !isCreated.current) && embedpano();

      isCreated.current = true;
    } else {
      throw new Error("Krpano required");
    }
  }, [config]);
};

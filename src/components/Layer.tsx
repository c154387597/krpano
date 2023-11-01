import { FC, memo, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts";

/**
 * @see https://krpano.com/docu/xml/#layer.html
 */
export interface LayerProps {
  name: string;
  keep?: boolean;
  type?: "image" | "text";
  align?:
    | "lefttop"
    | "left"
    | "leftbottom"
    | "top"
    | "center"
    | "bottom"
    | "righttop"
    | "right";
  x?: number;
  y?: number;
  html?: string;
  visible?: boolean;
  background?: boolean;
  border?: boolean;
  enabled?: boolean;
  css?: string;
}

export const Layer: FC<LayerProps> = memo(({ name, ...rest }) => {
  const renderer = useContext(KrpanoRendererContext);

  useEffect(() => {
    renderer?.addLayer(name, {});

    return () => {
      renderer?.removeLayer(name);
    };
  }, []);

  useEffect(() => {
    renderer?.setTag("layer", name, { ...rest });
  }, [renderer, name, rest]);

  return <div className="layer" />;
});

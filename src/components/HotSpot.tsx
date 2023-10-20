import { FC, ReactNode, memo, useContext, useEffect, useMemo } from "react";
import { EventCallback } from "../types";
import { KrpanoRendererContext } from "../contexts";
import {
  buildKrpanoAction,
  childrenToOuterHTML,
  mapEventPropsToJSCall,
  mapObject,
} from "../utils";

export interface HotspotProps {
  name: string;
  children?: ReactNode;
  url?: string;
  /**
   * @see https://krpano.com/docu/xml/?version=121#layer.type
   */
  type?: "image" | "text";
  keep?: boolean;
  visible?: boolean;
  enabled?: boolean;
  handCursor?: boolean;
  cursor?: string;
  maskChildren?: boolean;
  zOrder?: string;
  style?: string;
  /**
   * 水平方向
   */
  ath?: number;
  /**
   * 垂直方向
   */
  atv?: number;
  edge?: string;
  zoom?: boolean;
  distorted?: boolean;
  rx?: number;
  ry?: number;
  rz?: number;
  width?: string;
  height?: string;
  /**
   * 比例
   * @default 0.5
   */
  scale?: number;
  rotate?: number;
  alpha?: number;
  bg?: boolean;
  bgcolor?: string;
  bgalpha?: number;
  bgborder?: number;
  bgbordermode?: "outside" | "inside";
  bgborderblend?: boolean;
  onOver?: EventCallback;
  onHover?: EventCallback;
  onOut?: EventCallback;
  onDown?: EventCallback;
  onUp?: EventCallback;
  onClick?: EventCallback;
  onLoaded?: EventCallback;
}

export const HotSpot: FC<HotspotProps> = memo(({ name, ...rest }) => {
  const EventSelector = `hotspot[${name}]`;
  const renderer = useContext(KrpanoRendererContext);
  const options = useMemo(() => {
    const { scale = 0.5, children, ...r } = rest;

    return {
      scale,
      html: r.type === "text" ? childrenToOuterHTML(children) : null,
      onOver: buildKrpanoAction("tween", "scale", scale + 0.05),
      onOut: buildKrpanoAction("tween", "scale", scale),
      ...r,
    };
  }, [rest]);

  useEffect(() => {
    const eventsObj = mapObject({ ...options }, (key, value) => {
      if (key.startsWith("on") && typeof value === "function") {
        return {
          [key]: value,
        };
      }
      return {};
    });

    renderer?.bindEvents(EventSelector, eventsObj as any);
    renderer?.addHotspot(name, {});

    return () => {
      renderer?.unbindEvents(EventSelector, eventsObj as any);
      renderer?.removeHotspot(name);
    };
  }, []);

  useEffect(() => {
    if (!renderer) return;

    renderer.setTag(
      "hotspot",
      name,
      Object.assign(
        { ...options },
        mapEventPropsToJSCall(
          { ...options },
          (key) => `js(${renderer.name}.fire(${key},${EventSelector}))`
        )
      )
    );
  }, [renderer, name, options]);

  return <div className="hotspot" />;
});

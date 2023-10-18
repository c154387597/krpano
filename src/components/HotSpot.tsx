import { FC, ReactNode, useContext, useEffect, useMemo } from "react";
import { EventCallback } from "../types";
import { KrpanoRendererContext } from "../contexts";
import { buildKrpanoAction, mapEventPropsToJSCall, mapObject } from "../utils";

export interface HotspotProps {
  name: string;
  children?: ReactNode;
  url?: string;
  type?: string;
  keep?: boolean;
  visible?: boolean;
  enabled?: boolean;
  handCursor?: boolean;
  cursor?: string;
  maskChildren?: boolean;
  zOrder?: string;
  style?: string;
  ath?: number;
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
  onOver?: EventCallback;
  onHover?: EventCallback;
  onOut?: EventCallback;
  onDown?: EventCallback;
  onUp?: EventCallback;
  onClick?: EventCallback;
  onLoaded?: EventCallback;
}

export const HotSpot: FC<HotspotProps> = ({ name, children, ...rest }) => {
  const EventSelector = `hotspot[${name}]`;
  const renderer = useContext(KrpanoRendererContext);
  const options = useMemo(() => {
    const { scale = 0.5, ...r } = rest;

    return {
      scale,
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
    renderer?.setTag(
      "hotspot",
      name,
      Object.assign(
        { ...options },
        mapEventPropsToJSCall(
          { ...options },
          (key) => `js(${renderer?.name}.fire(${key},${EventSelector}))`
        )
      )
    );
  }, [renderer, name, options]);

  return <div className="hotspot">{children}</div>;
};

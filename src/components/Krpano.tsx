import React, { useCallback, useEffect, useState } from "react";
import { KrpanoActionProxy } from "../models";
import { useMounted, useEventCallback } from "../hooks";
import { IKrpanoConfig, NativeKrpanoRendererObject } from "../types";
import { CurrentSceneContext, KrpanoRendererContext } from "../contexts";
import { buildKrpanoAction } from "../utils";
import { WebVR } from "./WebVR";

export interface KrpanoProps extends Omit<IKrpanoConfig, "onready" | "target"> {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  currentScene?: string;
  target?: string;
  /**
   * webvr.xml 地址，需遵循同源策略
   */
  webvrUrl?: string;
  webvrConfig?: Record<string, unknown>;
  onReady?: (renderer: KrpanoActionProxy) => void;
}

export const Krpano: React.FC<KrpanoProps> = ({
  className,
  style,
  children,
  currentScene,
  target = "krpano",
  webvrUrl,
  webvrConfig,
  onReady,
  ...rest
}) => {
  const [renderer, setRenderer] = useState<KrpanoActionProxy | null>(null);
  const onReadyRef = useEventCallback(onReady);
  const onReadyCallback = useCallback(
    (obj: NativeKrpanoRendererObject) => {
      const renderer = new KrpanoActionProxy(obj);
      (window as any)[renderer.name] = renderer;
      setRenderer(renderer);

      if (onReadyRef.current) {
        onReadyRef.current(renderer);
      }
    },
    [onReadyRef]
  );

  useEffect(() => {
    if (!renderer) return;

    const reloadXML = async () => {
      if (renderer.tagAction.syncTagStack.length) {
        // krpano 1.19 版本不支持动态插入 include，只能在文本中插入后重新加载
        const updateXmlString = new XMLSerializer().serializeToString(
          await renderer.tagAction.createSyncTags()
        );

        renderer.call(buildKrpanoAction("loadxml", updateXmlString));
      }

      renderer.tagAction.syncTagsLoaded = true;
      renderer.tagAction.queue.flushResolve(true);
    };

    reloadXML();
  }, [renderer]);

  useEffect(() => {
    if (!renderer || !currentScene) return;

    renderer.tagAction.waitIncludeLoaded(true).then(() => {
      renderer.loadScene(currentScene);
    });
  }, [renderer, currentScene]);

  const initKrpano = () => {
    const defaultConfig: Partial<IKrpanoConfig> = {
      html5: "auto",
      xml: null,
      mobilescale: 1,
    };

    if (typeof window.embedpano === "function") {
      window.embedpano({
        ...defaultConfig,
        target,
        onready: onReadyCallback,
        ...rest,
      });
    } else {
      throw new Error("Krpano required");
    }
  };

  useMounted(() => {
    initKrpano();
  });

  return (
    <KrpanoRendererContext.Provider value={renderer}>
      <CurrentSceneContext.Provider value={currentScene || null}>
        {webvrUrl && <WebVR url={webvrUrl} {...webvrConfig} />}

        <div id={target} className={className} style={style}>
          {renderer ? children : null}
        </div>
      </CurrentSceneContext.Provider>
    </KrpanoRendererContext.Provider>
  );
};

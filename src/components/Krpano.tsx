import React, { useCallback, useEffect, useRef, useState } from "react";
import { KrpanoActionProxy } from "../models";
import { useMounted, useEventCallback } from "../hooks";
import { IKrpanoConfig, NativeKrpanoRendererObject } from "../types";
import { CurrentSceneContext, KrpanoRendererContext } from "../contexts";
import { buildKrpanoAction } from "../utils";
import { WebVR } from "./WebVR";
import { Action } from "./Action";
import { Layer } from "./Layer";
import { Events } from "./Events";

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
  /**
   * 小行星视角
   */
  littlePlanetIntro?: boolean;
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
  littlePlanetIntro,
  onReady,
  ...rest
}) => {
  const loaded = useRef(false);
  const [renderer, setRenderer] = useState<KrpanoActionProxy | null>(null);
  const onReadyRef = useEventCallback(onReady);
  const onReadyCallback = useCallback(
    async (obj: NativeKrpanoRendererObject) => {
      const krpano = new KrpanoActionProxy(obj);

      (window as any)[krpano.name] = krpano;
      setRenderer(krpano);

      if (onReadyRef.current) {
        onReadyRef.current(krpano);
      }
    },
    [onReadyRef]
  );

  useEffect(() => {
    if (!renderer || !currentScene) return;

    renderer.tagAction.waitIncludeLoaded(true).then(() => {
      renderer.loadScene(currentScene);

      littlePlanetIntro &&
        !loaded.current &&
        renderer.call("skin_setup_littleplanetintro()");

      loaded.current = true;
    });
  }, [renderer, currentScene]);

  useEffect(() => {
    if (!renderer) return;

    reloadXML(renderer);
  }, [renderer]);

  const reloadXML = async (krpano: KrpanoActionProxy) => {
    if (krpano.tagAction.syncTagStack.length) {
      // krpano 1.21 版本以下不支持动态插入 include，只能在文本中插入后重新加载
      const updateXmlString = new XMLSerializer().serializeToString(
        await krpano.tagAction.createSyncTags()
      );

      krpano.call(buildKrpanoAction("loadxml", updateXmlString));
    }

    krpano.tagAction.syncTagsLoaded = true;
    krpano.tagAction.queue.flushResolve(true);
  };

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

  const handleNewPano = () => {
    renderer?.set("layer[skin_loadingtext].visible", true);
  };

  const handleRemovePano = () => {
    renderer?.set("layer[skin_loadingtext].visible", true);
  };

  const handleLoadComplete = () => {
    setTimeout(() => {
      renderer?.set("layer[skin_loadingtext].visible", false);
    }, 200);
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

        <Events
          onNewPano={handleNewPano}
          onRemovePano={handleRemovePano}
          onLoadComplete={handleLoadComplete}
        />

        <Layer
          name="skin_loadingtext"
          type="text"
          align="center"
          x={5}
          y={-5}
          keep={true}
          html="加载中..."
          visible={false}
          background={false}
          border={false}
          enabled={false}
          css="color:#FFFFFF; font-family:Arial; text-align:center; font-style:italic; font-size:22px;"
        />

        <Action
          name="skin_setup_littleplanetintro"
          content={`
            copy(lp_scene, xml.scene);
            copy(lp_hlookat, view.hlookat);
            copy(lp_vlookat, view.vlookat);
            copy(lp_fov, view.fov);
            copy(lp_fovmax, view.fovmax);
            copy(lp_limitview, view.limitview);
            set(view.fovmax, 170);
            set(view.limitview, lookto);
            set(view.vlookatmin, 90);
            set(view.vlookatmax, 90);
            lookat(calc(lp_hlookat - 180), 90, 150, 1, 0, 0);
            set(events[lp_events].onloadcomplete,
              delayedcall(0.5,
                if(lp_scene === xml.scene,
                  set(control.usercontrol, off);
                  copy(view.limitview, lp_limitview);
                  set(view.vlookatmin, null);
                  set(view.vlookatmax, null);
                  tween(view.hlookat|view.vlookat|view.fov|view.distortion, calc('' + lp_hlookat + '|' + lp_vlookat + '|' + lp_fov + '|' + 0.0),
                    3.0, easeOutQuad,
                    set(control.usercontrol, all);
                    tween(view.fovmax, get(lp_fovmax));
                    );
                  );
                );
              );
          `}
        />
      </CurrentSceneContext.Provider>
    </KrpanoRendererContext.Provider>
  );
};

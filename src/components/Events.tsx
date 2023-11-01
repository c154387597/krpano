import { FC, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts/KrpanoRendererContext";
import { EventCallback } from "../types";
import { mapEventPropsToJSCall } from "../utils";

/**
 * @see https://krpano.com/docu/xml/#events
 */
export interface EventsConfig {
  /** 事件名，若存在该参数则为局部事件 */
  name?: string;
  keep?: boolean;
  onEnterFullscreen?: EventCallback;
  onExitFullscreen?: EventCallback;
  onXmlComplete?: EventCallback;
  onPreviewComplete?: EventCallback;
  onLoadComplete?: EventCallback;
  onBlendComplete?: EventCallback;
  onNewPano?: EventCallback;
  onRemovePano?: EventCallback;
  onNewScene?: EventCallback;
  onXmlError?: EventCallback;
  onLoadError?: EventCallback;
  onKeydown?: EventCallback;
  onKeyup?: EventCallback;
  onClick?: EventCallback;
  onSingleClick?: EventCallback;
  onDoubleClick?: EventCallback;
  onMousedown?: EventCallback;
  onMouseup?: EventCallback;
  onMousewheel?: EventCallback;
  onContextmenu?: EventCallback;
  onIdle?: EventCallback;
  onViewChange?: EventCallback;
  onViewChanged?: EventCallback;
  onResize?: EventCallback;
  onFrameBufferResize?: EventCallback;
  /**
   * 启动自动旋转时回调
   */
  onAutoRotateStart?: EventCallback;
  /**
   * 停止自动旋转时回调
   */
  onAutoRotateStop?: EventCallback;
  /**
   * 全景图完成一轮自动旋转时回调
   */
  onAutoRotateOneRound?: EventCallback;
  /**
   * 自动旋转状态发生改变时回调
   */
  onAutoRotateChange?: EventCallback;
  onIPhoneFullscreen?: EventCallback;
}

export interface EventsProps extends EventsConfig {}

const GlobalEvents = "__GlobalEvents";

export const Events: FC<EventsProps> = ({ name, keep, ...EventsAttrs }) => {
  const renderer = useContext(KrpanoRendererContext);
  const EventSelector = `events[${name || GlobalEvents}]`;

  // 在renderer上绑定回调
  useEffect(() => {
    renderer?.bindEvents(EventSelector, { ...EventsAttrs });

    return () => {
      renderer?.unbindEvents(EventSelector, { ...EventsAttrs });
    };
  }, [renderer, EventsAttrs]);

  // Krpano标签上添加js call，触发事件
  useEffect(() => {
    renderer?.setTag(
      "events",
      // 全局事件直接设置
      name || null,
      {
        ...mapEventPropsToJSCall(
          { ...EventsAttrs },
          (eventName) =>
            `js(${renderer.name}.fire(${eventName},${EventSelector}))`
        ),
        keep,
      }
    );
  }, [name, renderer]);

  return <div className="events"></div>;
};

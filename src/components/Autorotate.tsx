import React, { memo, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts";

/**
 * @see https://krpano.com/docu/xml/#autorotate
 */
export interface AutorotateProps {
  enabled: boolean;
  /**
   * 用户交互后等待的时间（秒）
   * @default 2
   */
  waittime?: number;
  /**
   * 自动旋转的速度
   * @default 10
   */
  speed?: number;
  /**
   * 自动旋转时视角的水平位置
   * @default 0
   */
  horizon?: number;
  /**
   * 旋转的加速度
   * @default 1
   */
  accel?: number;
  tofov?: "off" | number;
  oneroundrange?: number;
  /**
   * 当用户放大或缩小（通过滚动鼠标滚轮或手势）时，启用这个属性会减缓缩放的速度
   * @default true
   */
  zoomslowdown?: boolean;
  /**
   * 定义哪些事件可以中断全景图像的交互操作
   * @default userviewchange|layers|keyboard
   */
  interruptionevents?: string;
}

export const Autorotate: React.FC<AutorotateProps> = memo((props) => {
  const renderer = useContext(KrpanoRendererContext);

  useEffect(() => {
    const options = {
      waittime: 2,
      speed: 10,
      ...props,
    };
    renderer?.setTag("autorotate", null, options);
  }, [renderer, props]);

  return <div className="autorotate" />;
});

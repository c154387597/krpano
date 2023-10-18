import { KrpanoActionProxy } from "./KrpanoActionProxy";

declare global {
  interface Window {
    embedpano?: (config: IKrpanoConfig) => void;
    ReactKrpanoActionProxy?: KrpanoActionProxy;
  }
}

export interface NativeKrpanoRendererObject {
  get(key: string): any;
  call(action: string): void;
}

/**
 * @see https://krpano.com/docu/html/#wmode
 */
export interface IKrpanoConfig {
  /**
   * 全景图xml路径。需要手动设置为null才不会加载。
   * @see https://krpano.com/docu/html/#xml
   */
  xml?: string | null;
  /**  挂载点id */
  target: string;
  swf?: string;
  id?: string;
  bgcolor?: string;
  /**
   * @see https://krpano.com/docu/html/#html5
   */
  html5?: string;
  flash?: string;
  wmode?: string;
  localfallback?: string;
  vars?: Record<string, unknown>;
  initvars?: Record<string, unknown>;
  consolelog?: boolean;
  basepath?: string;
  mwheel?: boolean;
  capturetouch?: boolean;
  focus?: boolean;
  webglsettings?: Record<string, unknown>;
  webxr?: string;
  mobilescale?: number;
  touchdevicemousesupport?: boolean;
  fakedevice?: string;
  passQueryParameters?: boolean;
  onready?: (renderer: NativeKrpanoRendererObject) => void;
}

export type EventCallback = (renderer: KrpanoActionProxy) => void;

export interface XMLMeta {
  tag: string;
  attrs: Record<string, string | number | boolean>;
  children?: XMLMeta[];
}

/**
 * 旋转方位
 */
export enum ROTATE_DIRECTION {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

/**
 * 缩放动作
 */
export enum ZOOM_ACTION {
  IN = "in",
  OUT = "out",
}

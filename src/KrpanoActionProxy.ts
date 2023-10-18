import { PromiseQueue } from "./PromiseQueue";
import { ViewProps } from "./components";
import {
  NativeKrpanoRendererObject,
  ROTATE_DIRECTION,
  ZOOM_ACTION,
} from "./types";
import { buildKrpanoAction, buildKrpanoTagSetterActions } from "./utils";

export type HandlerFunc = (renderer: KrpanoActionProxy) => void;

interface EventHandler {
  eventName: string;
  selector: string;
  handler: HandlerFunc;
}

export class KrpanoActionProxy {
  name: string;
  krpanoRenderer?: NativeKrpanoRendererObject;
  eventHandlers: EventHandler[] = [];
  dynamicTagWaitQueue: PromiseQueue<any>;

  constructor(
    krpanoRenderer?: NativeKrpanoRendererObject,
    name = "ReactKrpanoActionProxy"
  ) {
    this.krpanoRenderer = krpanoRenderer;
    this.name = name;

    // krpano 1.19 版本不支持动态插入 include，只能在文本中插入后重新加载
    this.dynamicTagWaitQueue = new PromiseQueue();
  }

  /**
   * 等待 include 标签加载完成
   */
  waitIncludeLoaded(push?: boolean) {
    return this.syncTagsLoaded
      ? Promise.resolve()
      : // 先进后出
        this.dynamicTagWaitQueue[push ? "push" : "unshift"]();
  }

  /**
   * 执行 Javascript 函数
   * @param action 动作
   * @param nexttick 是否在下一个渲染帧后执行
   */
  call(action: string, nexttick = false): void {
    const actionStr = nexttick ? `nexttick(${action})` : action;

    this.krpanoRenderer?.call(actionStr);
  }

  set(name: string, ...params: Array<string | number | boolean>): void {
    this.call(buildKrpanoAction("set", name, ...params));
  }

  /**
   * 动态添加标签
   * @param tag 标签
   * @param name 名称
   * @param attrs 属性
   */
  async setTag(
    tag: "scene" | "hotspot" | "layer" | "view" | "events" | "autorotate",
    name: string | null,
    attrs: Record<string, any>
  ) {
    let nexttick = false;

    if (tag === "hotspot" || tag === "events") {
      nexttick = true;
    }

    await this.waitIncludeLoaded();

    this.call(
      buildKrpanoTagSetterActions(name ? `${tag}[${name}]` : tag, attrs),
      nexttick
    );
  }

  get<T = any>(name: string): T {
    return this.krpanoRenderer?.get(name);
  }

  /**
   * 删除场景
   * @param name 场景名称
   */
  removeScene(name: string): void {
    if (
      this.get("scene") &&
      typeof this.get("scene").removeItem === "function"
    ) {
      this.get("scene").removeItem(name);
    } else {
      // TODO: report Error
    }
  }

  /**
   * 加载场景
   * @param name 场景 name
   */
  loadScene(name: string): void {
    this.call(
      buildKrpanoAction("loadscene", name, "null", "MERGE", "BLEND(0.5)")
    );
  }

  /**
   * 旋转视图
   * @param direction 方位
   * @param degrees 旋转度数，默认为 10
   */
  rotateView(direction: ROTATE_DIRECTION, degrees = 10) {
    let str = "";
    const view: ViewProps = this.get("view");

    switch (direction) {
      case ROTATE_DIRECTION.LEFT:
        str = `view.hlookat, ${(view.hlookat || 0) - degrees}`;
        break;
      case ROTATE_DIRECTION.RIGHT:
        str = `view.hlookat, ${(view.hlookat || 0) + degrees}`;
        break;
      case ROTATE_DIRECTION.UP:
        str = `view.vlookat, ${(view.vlookat || 0) - degrees}`;
        break;
      case ROTATE_DIRECTION.DOWN:
        str = `view.vlookat, ${(view.vlookat || 0) + degrees}`;
        break;
    }

    this.call(buildKrpanoAction("tween", str, 0.5));
  }

  /**
   * 缩放视图
   * @param action 动作
   * @param num 缩放大小
   */
  zoomView(action: ZOOM_ACTION, num = 10) {
    const view: ViewProps = this.get("view");
    const targetFov = action === ZOOM_ACTION.IN ? -num : num;

    this.call(
      buildKrpanoAction("tween", "view.fov", (view.fov || 0) + targetFov, 1)
    );
  }

  on(eventName: string, selector: string, handler: HandlerFunc): this {
    this.eventHandlers.push({
      eventName: eventName.toLowerCase(),
      selector,
      handler,
    });
    return this;
  }

  off(eventName: string, selector: string, handler: HandlerFunc): void {
    this.eventHandlers = this.eventHandlers.filter(
      (e) =>
        !(
          e.eventName === eventName.toLowerCase() &&
          e.selector === selector &&
          e.handler === handler
        )
    );
  }

  fire(eventName: string, selector: string): void {
    this.eventHandlers
      .filter(
        (e) =>
          e.eventName === eventName.toLowerCase() && e.selector === selector
      )
      .map(({ handler }) => handler(this));
  }

  bindEvents(
    selector: string,
    mapEventsToHandler: Record<string, HandlerFunc | undefined>
  ): void {
    Object.keys(mapEventsToHandler).map((eventName) => {
      const func = mapEventsToHandler[eventName];

      if (func) {
        this.on(eventName, selector, func);
      }
    });
  }

  unbindEvents(
    selector: string,
    mapEventsToHandler: Record<string, HandlerFunc | undefined>
  ): void {
    Object.keys(mapEventsToHandler).map((eventName) => {
      const func = mapEventsToHandler[eventName];

      if (func) {
        this.off(eventName, selector, func);
      }
    });
  }

  async addHotspot(
    name: string,
    attrs: Record<string, string | boolean | number | undefined>
  ) {
    await this.waitIncludeLoaded();
    this.call(buildKrpanoAction("addhotspot", name), true);
    this.setTag("hotspot", name, attrs);
  }
  removeHotspot(name: string): void {
    this.call(buildKrpanoAction("removehotspot", name), true);
  }

  syncTagsLoaded = false;
  syncTagStack: {
    tagName: string;
    attribute: Record<string, unknown>;
  }[] = [];

  pushSyncTag(tagName: string, attribute: Record<string, unknown>) {
    this.syncTagStack.unshift({
      tagName,
      attribute,
    });
  }

  async createSyncTags() {
    const xmlDoc = await this.getXMLContent();
    const krpanoElement = xmlDoc.querySelector("krpano");

    while (this.syncTagStack.length) {
      const tag = this.syncTagStack.pop()!;
      const element = xmlDoc.createElement(tag.tagName);

      for (const key in tag.attribute) {
        element.setAttribute(key, tag.attribute[key] as string);
      }

      krpanoElement?.insertBefore(element, null);
    }

    return xmlDoc;
  }

  private async getXMLContent() {
    let contentText = "";
    const xml = this?.get("xml");
    const parser = new DOMParser();

    if (xml.content) {
      contentText = xml.content;
    } else if (xml.url) {
      contentText = await fetch(xml.url).then((res) => res.text());
    }

    return parser.parseFromString(contentText, "text/xml");
  }
}

import { NativeKrpanoRendererObject } from "../types";
import { PromiseQueue } from "./PromiseQueue";

export class TagActionProxy {
  krpanoRenderer?: NativeKrpanoRendererObject;

  queue = new PromiseQueue();
  /**
   * 同步标签是否加载完成
   */
  syncTagsLoaded = false;

  syncTagStack: {
    tagName: string;
    attribute: Record<string, unknown>;
    children?: string;
  }[] = [];
  syncXMLStringStack: string[] = [];

  constructor(krpanoRenderer?: NativeKrpanoRendererObject) {
    this.krpanoRenderer = krpanoRenderer;
  }

  /**
   * 等待 include 标签加载完成
   */
  waitIncludeLoaded(push?: boolean) {
    return this.syncTagsLoaded
      ? Promise.resolve()
      : // 先进后出
        this.queue[push ? "push" : "unshift"]();
  }

  /**
   * 将异步标签推入堆中
   */
  pushSyncTag(
    tagName: string,
    attribute: Record<string, unknown>,
    children?: string
  ) {
    this.syncTagStack.unshift({
      tagName,
      attribute,
      children,
    });
  }

  /**
   * 创建一个插入同步标签后的 XMLDOM
   */
  async createSyncTags() {
    const xmlDoc = await this.getXMLContent();
    const krpanoElement = xmlDoc.querySelector("krpano");

    while (this.syncTagStack.length) {
      let element: HTMLElement | null = null;
      const tag = this.syncTagStack.pop()!;

      if (!tag.children) {
        element = xmlDoc.createElement(tag.tagName);
      } else {
        const parser = new DOMParser();
        element = parser.parseFromString(
          `<${tag.tagName}>${tag.children}</${tag.tagName}>`,
          "text/xml"
        ).documentElement;
      }

      for (const key in tag.attribute) {
        element.setAttribute(key, tag.attribute[key] as string);
      }

      krpanoElement?.insertBefore(element, null);
    }

    return xmlDoc;
  }

  private async getXMLContent() {
    let contentText = "";
    const xml = this.krpanoRenderer?.get("xml");
    const parser = new DOMParser();

    if (xml.content) {
      contentText = xml.content;
    } else if (xml.url) {
      contentText = await fetch(xml.url).then((res) => res.text());
    }

    return parser.parseFromString(contentText, "text/xml");
  }
}

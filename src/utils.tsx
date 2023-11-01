import { ReactNode } from "react";
import escapeHTML from "escape-html";
import { XMLMeta } from "./types";
import ReactDOMServer from "react-dom/server";

/**
 * @see https://krpano.com/docu/actions
 */
type FuncName =
  | "addplugin"
  | "removeplugin"
  | "set"
  | "loadxml"
  | "loadscene"
  | "loadpano"
  | "tween"
  | "addhotspot"
  | "removehotspot"
  | "includexml"
  | "includexmlstring"
  | "addlayer"
  | "removelayer"
  | "nexttick";

/**
 * 执行单个函数
 * @param func 函数名
 * @param params 参数列表
 */
export const buildKrpanoAction = (
  func: FuncName,
  ...params: Array<string | number | boolean>
): string => `${func}(${params.map((p) => `${p}`).join(", ")});`;

/**
 * 动态添加标签用
 * @see https://krpano.com/forum/wbb/index.php?page=Thread&threadID=15873
 */
export const buildKrpanoTagSetterActions = (
  name: string,
  attrs: Record<string, string | boolean | number | undefined>
): string =>
  Object.keys(attrs)
    .map((key) => {
      const val = attrs[key];
      key = key.toLowerCase();
      if (val === undefined) {
        return "";
      }
      // 如果属性值中有双引号，需要改用单引号
      let quote = '"';
      if (`${val}`.includes(quote)) {
        quote = "'";
      }
      if (key === "style") {
        return `assignstyle(${name}, ${val});`;
      }
      if (typeof val === "boolean" || typeof val === "number") {
        return `set(${name}.${key}, ${val});`;
      }
      // content是XML文本，不能转义，因为不涉及用户输入也不需要
      return `set(${name}.${key}, ${quote}${
        ["content", "html"].includes(key) ? val : escapeHTML(val.toString())
      }${quote});`;
    })
    .filter((str) => !!str)
    .join("");

/**
 * 根据元数据构建xml
 */
export const buildXML = ({ tag, attrs, children }: XMLMeta): string => {
  const attributes = Object.keys(attrs)
    .map((key) => `${key.toLowerCase()}="${attrs[key]}"`)
    .join(" ");

  if (children && children.length) {
    return `<${tag} ${attributes}>${children
      .map((child) => buildXML(child))
      .join("")}</${tag}>`;
  }
  return `<${tag} ${attributes} />`;
};

/**
 * 对Object进行map操作
 */
export const mapObject = (
  obj: Record<string, unknown>,
  mapper: (key: string, value: unknown) => Record<string, unknown>
): Record<string, unknown> => {
  return Object.assign(
    {},
    ...Object.keys(obj).map((key) => {
      const value = obj[key];
      return mapper(key, value);
    })
  );
};

/**
 * 主要用于绑定Krpano事件和js调用。提取某个对象中的onXXX属性并替换为对应的调用字符串，丢弃其他属性
 */
export const mapEventPropsToJSCall = (
  obj: Record<string, unknown>,
  getString: (key: string, value: unknown) => string
): Record<string, string> =>
  mapObject(obj, (key, value) => {
    if (key.startsWith("on") && typeof value === "function") {
      return { [key]: getString(key, value) };
    }
    return {};
  }) as Record<string, string>;

export const childrenToOuterHTML = (children: ReactNode) => {
  const wrapper = document.createElement("div");
  const childrenString = ReactDOMServer.renderToStaticMarkup(<>{children}</>);

  wrapper.innerHTML = childrenString;

  return wrapper.outerHTML;
};

export const compareVersions = (version1: string, version2: string) => {
  const parts1: string[] = version1.split("-");
  const parts2: string[] = version2.split("-");

  const [major1, minor1] = parts1[0].split(".").map(Number);
  const [major2, minor2] = parts2[0].split(".").map(Number);

  if (major1 !== major2) {
    return major1 - major2;
  }

  if (minor1 !== minor2) {
    return minor1 - minor2;
  }

  if (parts1.length > 1 && parts2.length > 1) {
    return parts1[1].localeCompare(parts2[1]);
  }

  if (parts1.length > 1) {
    return 1;
  } else if (parts2.length > 1) {
    return -1;
  }

  return 0;
};

export const is121Version =
  !!window.krpanoJS && compareVersions(window.krpanoJS.version, "1.21") > -1;

import { useContext, useEffect } from "react";
import { CurrentSceneContext, KrpanoRendererContext } from "../contexts";
import { XMLMeta } from "../types";
import { buildXML } from "../utils";

export interface SceneImageAttributes {
  type: "cube" | "sphere";
  /** 瓦片尺寸 */
  tileSize?: number;
  multires?: boolean;
}

export interface SceneImage {
  url: string;
}

export interface SceneImageWithMultires extends SceneImage {
  tiledImageWidth: number;
  tiledImageHeight: number;
}

export interface SceneProps {
  name: string;
  children?: React.ReactNode;
  previewUrl?: string;
  /** 直接指定scene的xml内容。指定后会忽略其他设置 */
  content?: string;
  /** image标签属性 */
  imageTagAttributes: SceneImageAttributes;
  /** Scene包含的图片。数组的长度大于1时按multires解析为多个level */
  images?: [SceneImage] | SceneImageWithMultires[];
}

export const Scene: React.FC<SceneProps> = ({
  name,
  previewUrl,
  imageTagAttributes,
  images = [],
  content,
  children,
}) => {
  const renderer = useContext(KrpanoRendererContext);
  const currentScene = useContext(CurrentSceneContext);

  useEffect(() => {
    const contentImageMeta: XMLMeta = {
      tag: "image",
      // @ts-ignore
      attrs: imageTagAttributes,
      children: [],
    };

    // multires
    if (images.length > 1) {
      contentImageMeta.children!.push(
        ...(images as SceneImageWithMultires[]).map(
          ({ tiledImageWidth, tiledImageHeight, ...img }) => {
            const imgXML: XMLMeta = {
              tag: "level",
              attrs: {
                tiledImageWidth,
                tiledImageHeight,
              },
              children: [
                {
                  tag: imageTagAttributes.type,
                  attrs: { ...img },
                },
              ],
            };

            return imgXML;
          }
        )
      );
    } else if (images.length === 1) {
      const { ...img } = images[0] as SceneImage;

      contentImageMeta.children!.push({
        tag: imageTagAttributes.type,
        attrs: { ...img },
      });
    }

    renderer?.setTag("scene", name, {
      content:
        content ||
        `${previewUrl ? `<preview url="${previewUrl}" />` : ""}${
          images.length > 0 ? buildXML(contentImageMeta) : ""
        }`,
    });

    return () => {
      renderer?.removeScene(name);
    };
  }, [renderer, name, images, imageTagAttributes, content, previewUrl]);

  return <div className="scene">{currentScene === name ? children : null}</div>;
};

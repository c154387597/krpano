import { FC, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts";
import { buildKrpanoAction, is121Version } from "../utils";

export interface PluginProps {
  name: string;
  [key: string]: unknown;
}

export const Plugin: FC<PluginProps> = ({ name, ...attribute }) => {
  const renderer = useContext(KrpanoRendererContext);

  useEffect(() => {
    if (!renderer) return;

    if (is121Version) {
      const arr: string[] = [];

      for (const key in attribute) {
        arr.push(`${key}=${attribute[key]}`);
      }

      renderer.call(buildKrpanoAction("addplugin", name, ...arr));

      return () => {
        renderer.call(buildKrpanoAction("removeplugin", name));
      };
    } else {
      renderer.tagAction.pushSyncTag("plugin", {
        ...attribute,
        name,
      });
    }
  }, [renderer, name, attribute]);

  return <></>;
};

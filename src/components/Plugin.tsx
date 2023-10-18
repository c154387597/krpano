import { FC, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts";

export interface PluginProps {
  attribute: Record<string, unknown>;
}

/**
 * 注意：不支持动态插入
 */
export const Plugin: FC<PluginProps> = ({ attribute }) => {
  const renderer = useContext(KrpanoRendererContext);

  useEffect(() => {
    if (!renderer) return;

    renderer.pushSyncTag("plugin", attribute);
  }, [renderer]);

  return <></>;
};

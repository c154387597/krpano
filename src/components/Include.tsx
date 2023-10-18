import { FC, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts";

export interface IncludeProps {
  url: string;
}

/**
 * 注意：不支持动态插入
 */
export const Include: FC<IncludeProps> = ({ url }) => {
  const renderer = useContext(KrpanoRendererContext);

  useEffect(() => {
    if (!renderer) return;

    renderer.pushSyncTag("include", { url });
  }, [renderer]);

  return <></>;
};

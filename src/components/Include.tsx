import { FC, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts";
import { buildKrpanoAction, is121Version } from "../utils";

export interface IncludeProps {
  url: string;
}

export const Include: FC<IncludeProps> = ({ url }) => {
  const renderer = useContext(KrpanoRendererContext);

  useEffect(() => {
    if (!renderer) return;

    if (is121Version) {
      renderer.call(buildKrpanoAction("includexml", url));
    } else {
      renderer.tagAction.pushSyncTag("include", { url });
    }
  }, [renderer]);

  return <></>;
};

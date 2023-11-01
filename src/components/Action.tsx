import { FC, useContext, useEffect } from "react";
import { KrpanoRendererContext } from "../contexts";

export interface ActionProps {
  name: string;
  content: string;
  [key: string]: unknown;
}

export const Action: FC<ActionProps> = ({ name, content, ...attrs }) => {
  const renderer = useContext(KrpanoRendererContext);

  useEffect(() => {
    if (!renderer) return;

    renderer.tagAction.pushSyncTag(
      "action",
      {
        name,
        ...attrs,
      },
      content
    );
  }, [renderer]);

  return <></>;
};

import { FC, memo } from "react";
import { Include, Plugin } from "..";

export interface WebVRProps {
  url: string;
  [key: string]: unknown;
}

const WEBVR_CONFIG = {
  name: "WebVR",
  keep: true,
  devices: "html5",
  "multireslock.desktop": true,
  "multireslock.mobile.or.tablet": false,
  mobilevr_support: true,
  mobilevr_fake_support: true,
};

export const WebVR: FC<WebVRProps> = memo(({ url, ...attrs }) => {
  return (
    <>
      <Include url={url} />
      <Plugin
        attribute={{
          ...WEBVR_CONFIG,
          ...attrs,
        }}
      />
    </>
  );
});

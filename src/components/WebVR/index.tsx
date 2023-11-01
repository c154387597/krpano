import { FC, memo } from "react";
import { Include, Plugin } from "..";
import { is121Version } from "../../utils";

export interface WebVRProps {
  url: string;
  [key: string]: unknown;
}

const DEFAULT_WEBVR_121_CONFIG = {
  keep: true,
  devices: "webgl",
};

const DEFAULT_WEBVR_119_CONFIG = {
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
        name="WebVR"
        {...Object.assign(
          {
            ...(is121Version
              ? DEFAULT_WEBVR_121_CONFIG
              : DEFAULT_WEBVR_119_CONFIG),
          },
          attrs
        )}
      />
    </>
  );
});

import { FC } from "react";
import { Include, Plugin } from "..";

export interface WebVRProps {
  url: string;
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

export const WebVR: FC<WebVRProps> = ({ url }) => {
  return (
    <>
      <Include url={url} />
      <Plugin attribute={WEBVR_CONFIG} />
    </>
  );
};

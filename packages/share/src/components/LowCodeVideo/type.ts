import type { VideoComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type IVideoComponentProps = VideoComponentOptions;

export type TVideoComponentConfig = TBasicComponentConfig<
  "video",
  IVideoComponentProps
>;

export type TVideoComponentConfigResult =
  TransformedComponentConfig<IVideoComponentProps>;

export const videoComponentDefaultConfig: TVideoComponentConfigResult = {
  autoPlay: {
    value: false,
    isHidden: true,
    defaultValue: false,
  },
  poster: {
    value: "https://placehold.co/600x338/f5f5f5/000000/png?text=Video+Poster",
    defaultValue:
      "https://placehold.co/600x338/f5f5f5/000000/png?text=Video+Poster",
    isHidden: false,
  },
  loop: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  muted: {
    value: false,
    defaultValue: false,
    isHidden: false,
  },
  src: {
    value: "https://example.com/demo.mp4",
    defaultValue: "https://example.com/demo.mp4",
    isHidden: false,
  },
  startTime: {
    value: 0,
    defaultValue: 0,
    isHidden: false,
  },
};

import {
  defaultImageInfo,
  type TBasicComponentConfig,
  type TransformedComponentConfig,
} from "..";
import type { SwiperComponentOptions } from "./schema";

export type ISwiperComponentProps = SwiperComponentOptions;

export type TSwiperComponentConfig = TBasicComponentConfig<
  "swiper",
  ISwiperComponentProps
>;

export type TSwiperComponentConfigResult =
  TransformedComponentConfig<ISwiperComponentProps>;

export const swiperComponentDefaultConfig: TSwiperComponentConfigResult = {
  id: {
    value: "__default_swiper__",
    defaultValue: "__default_swiper__",
    isHidden: true,
  },
  autoPlay: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  images: {
    value: [defaultImageInfo],
    defaultValue: [defaultImageInfo],
    isHidden: false,
  },
  interval: {
    value: 3000,
    defaultValue: 3000,
    isHidden: false,
  },
  showIndicators: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  dotPosition: {
    value: "bottom",
    defaultValue: "bottom",
    isHidden: false,
  },
};

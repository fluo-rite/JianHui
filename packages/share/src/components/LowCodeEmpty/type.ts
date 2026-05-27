import type { EmptyComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type IEmptyComponentProps = EmptyComponentOptions;

export type TEmptyComponentConfig = TBasicComponentConfig<
  "empty",
  IEmptyComponentProps
>;

export type TEmptyComponentConfigResult =
  TransformedComponentConfig<IEmptyComponentProps>;

export const emptyComponentDefaultConfig: TEmptyComponentConfigResult = {
  description: {
    value: "暂无数据",
    defaultValue: "暂无数据",
    isHidden: false,
  },
  image: {
    value: undefined,
    defaultValue: undefined,
    isHidden: false,
  },
  imageWidth: {
    value: 100,
    defaultValue: 100,
    isHidden: false,
  },
  imageHeight: {
    value: 100,
    defaultValue: 100,
    isHidden: false,
  },
  imageObjectFit: {
    value: "contain",
    defaultValue: "contain",
    isHidden: false,
  },
};

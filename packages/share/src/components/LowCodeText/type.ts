import type { TextComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type ITextComponentProps = TextComponentOptions;

export type TTextComponentConfig = TBasicComponentConfig<
  "titleText",
  ITextComponentProps
>;

export type TTextComponentConfigResult =
  TransformedComponentConfig<ITextComponentProps>;

export const textComponentDefaultConfig: TTextComponentConfigResult = {
  size: {
    value: "base",
    defaultValue: "base",
    isHidden: false,
  },
  title: {
    value: "这里修改为你要的文字",
    defaultValue: "这里修改为你要的文字",
    isHidden: false,
  },
};

import type { RichTextComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type IRichTextComponentProps = RichTextComponentOptions;

export type TRichTextComponentConfig = TBasicComponentConfig<
  "richText",
  IRichTextComponentProps
>;

export type TRichTextComponentConfigResult =
  TransformedComponentConfig<IRichTextComponentProps>;

export const richTextComponentDefaultConfig: TRichTextComponentConfigResult = {
  content: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
};

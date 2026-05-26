import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export interface IRichTextComponentProps {
  content: string;
}

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

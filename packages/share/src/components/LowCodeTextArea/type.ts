import type { TextAreaComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type ITextAreaComponentProps = TextAreaComponentOptions & {
  onUpdate?: (value: string) => void;
};

export type TTextAreaComponentConfig = TBasicComponentConfig<
  "textArea",
  ITextAreaComponentProps
>;

export type TTextAreaComponentConfigResult =
  TransformedComponentConfig<ITextAreaComponentProps>;

export const textAreaComponentDefaultConfig: TTextAreaComponentConfigResult = {
  placeholder: {
    value: "请输入内容…",
    defaultValue: "请输入内容…",
    isHidden: false,
  },
  text: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  title: {
    value: "请输入标题…",
    defaultValue: "请输入标题…",
    isHidden: false,
  },
  onUpdate: {
    value: undefined,
    defaultValue: undefined,
    isHidden: true,
  },
};

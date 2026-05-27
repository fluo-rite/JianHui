import type { InputComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type IInputComponentProps = InputComponentOptions & {
  onUpdate?: (value: string) => void;
};

export type TInputComponentConfig = TBasicComponentConfig<
  "input",
  IInputComponentProps
>;

export type TInputComponentConfigResult =
  TransformedComponentConfig<IInputComponentProps>;

export const inputComponentDefaultConfig: TInputComponentConfigResult = {
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

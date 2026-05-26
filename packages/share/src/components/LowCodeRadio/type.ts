import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export interface IRadioComponentProps {
  id: string;
  title: string;
  value: string;
  options: {
    id: string;
    value: string;
  }[];
  onUpdate?: (value: string) => void;
}

export type TRadioComponentConfig = TBasicComponentConfig<
  "radio",
  IRadioComponentProps
>;

export type TRadioComponentConfigResult =
  TransformedComponentConfig<IRadioComponentProps>;

export const initialRadioOption = {
  id: "__initial_radio_option__",
  value: "选项1",
};

export const radioComponentDefaultConfig: TRadioComponentConfigResult = {
  id: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  title: {
    value: "默认展示的标题",
    defaultValue: "默认展示的标题",
    isHidden: false,
  },
  options: {
    value: [initialRadioOption],
    defaultValue: [initialRadioOption],
    isHidden: false,
  },
  value: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  onUpdate: {
    value: undefined,
    defaultValue: undefined,
    isHidden: true,
  },
};

import type { CheckboxComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type ICheckboxComponentProps = CheckboxComponentOptions & {
  onUpdate?: (value: string[]) => void;
};

export type TCheckboxComponentConfig = TBasicComponentConfig<
  "checkbox",
  ICheckboxComponentProps
>;

export type TCheckboxComponentConfigResult =
  TransformedComponentConfig<ICheckboxComponentProps>;

export const initialCheckboxOption = {
  id: "__initial_checkbox_option__",
  value: "选项1",
};

export const checkboxComponentDefaultConfig: TCheckboxComponentConfigResult = {
  id: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  title: {
    value: "默认显示的标题",
    defaultValue: "默认显示的标题",
    isHidden: false,
  },
  options: {
    value: [initialCheckboxOption],
    defaultValue: [initialCheckboxOption],
    isHidden: false,
  },
  value: {
    value: [],
    defaultValue: [],
    isHidden: true,
  },
  onUpdate: {
    value: undefined,
    defaultValue: undefined,
    isHidden: true,
  },
};

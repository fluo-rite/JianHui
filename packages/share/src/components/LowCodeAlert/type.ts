import type { AlertComponentOptions } from "./schema";
import type { TransformedComponentConfig } from "..";

export type IAlertComponentProps = AlertComponentOptions;

export type TAlertComponentConfig = {
  type: "alert";
  id: string;
  props: IAlertComponentProps;
};

export type TAlertComponentConfigResult =
  TransformedComponentConfig<IAlertComponentProps>;

export const alertComponentDefaultConfig: TAlertComponentConfigResult = {
  title: {
    defaultValue: "提示信息",
    value: "提示信息",
    isHidden: false,
  },
  description: {
    defaultValue: "",
    value: "",
    isHidden: false,
  },
  showIcon: {
    defaultValue: true,
    value: true,
    isHidden: false,
  },
  showClose: {
    defaultValue: true,
    value: true,
    isHidden: false,
  },
  isBanner: {
    defaultValue: false,
    value: false,
    isHidden: false,
  },
  type: {
    defaultValue: "warning",
    value: "warning",
    isHidden: false,
  },
};

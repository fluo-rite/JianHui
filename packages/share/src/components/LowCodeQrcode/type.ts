import type { QrcodeComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type IQrcodeComponentProps = QrcodeComponentOptions;

export type TQrcodeComponentConfig = TBasicComponentConfig<
  "qrcode",
  IQrcodeComponentProps
>;

export type TQrcodeComponentConfigResult =
  TransformedComponentConfig<IQrcodeComponentProps>;

export const qrcodeComponentDefaultConfig: TQrcodeComponentConfigResult = {
  value: {
    value: "-",
    defaultValue: "-",
    isHidden: false,
  },
  bgColor: {
    value: "white",
    defaultValue: "white",
    isHidden: false,
  },
  color: {
    value: "black",
    defaultValue: "black",
    isHidden: false,
  },
  errorLevel: {
    value: "L",
    defaultValue: "L",
    isHidden: false,
  },
  icon: {
    value: undefined,
    defaultValue: undefined,
    isHidden: true,
  },
  iconSize: {
    value: 12,
    defaultValue: 12,
    isHidden: true,
  },
  size: {
    value: 160,
    defaultValue: 160,
    isHidden: false,
  },
};

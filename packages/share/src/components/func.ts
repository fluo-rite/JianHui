import { componentList } from "..";
import type { SupportedComponentType } from "../schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from ".";
import { alertComponentDefaultConfig } from "./LowCodeAlert";
import { cardComponentDefaultConfig } from "./LowCodeCard";
import { checkboxComponentDefaultConfig } from "./LowCodeCheckbox";
import { emptyComponentDefaultConfig } from "./LowCodeEmpty";
import { imageComponentDefaultConfig } from "./LowCodeImage";
import { inputComponentDefaultConfig } from "./LowCodeInput";
import { listComponentDefaultConfig } from "./LowCodeList";
import { qrcodeComponentDefaultConfig } from "./LowCodeQrcode";
import { radioComponentDefaultConfig } from "./LowCodeRadio";
import { richTextComponentDefaultConfig } from "./LowCodeRichText";
import { splitComponentDefaultConfig } from "./LowCodeSplit";
import { swiperComponentDefaultConfig } from "./LowCodeSwiper";
import { textComponentDefaultConfig } from "./LowCodeText";
import { textAreaComponentDefaultConfig } from "./LowCodeTextArea";
import { videoComponentDefaultConfig } from "./LowCodeVideo";

export function getComponentByType(type: TBasicComponentConfig["type"]) {
  return componentList[type];
}

export function getDefaultValueByConfig(
  componentPropsWrapper: TransformedComponentConfig<Record<string, any>>
) {
  return Object.entries(componentPropsWrapper).reduce(
    (acc, [key, value]) => {
      acc[key] = value.defaultValue;
      return acc;
    },
    {} as Record<string, any>
  );
}

export function isFieldHidden<
  T extends TransformedComponentConfig<Record<string, any>>,
  K extends keyof T,
>(componentPropsWrapper: T, key: K) {
  return componentPropsWrapper[key].isHidden;
}

function omitUndefinedProperties<T extends Record<string, any>>(value: T): T {
  return Object.entries(value).reduce((acc, [key, item]) => {
    if (item !== undefined) {
      acc[key] = item;
    }
    return acc;
  }, {} as T);
}

const componentDefaultConfigMap: Record<
  SupportedComponentType,
  TransformedComponentConfig<Record<string, any>>
> = {
  video: videoComponentDefaultConfig,
  swiper: swiperComponentDefaultConfig,
  qrcode: qrcodeComponentDefaultConfig,
  card: cardComponentDefaultConfig,
  list: listComponentDefaultConfig,
  image: imageComponentDefaultConfig,
  titleText: textComponentDefaultConfig,
  split: splitComponentDefaultConfig,
  richText: richTextComponentDefaultConfig,
  input: inputComponentDefaultConfig,
  textArea: textAreaComponentDefaultConfig,
  radio: radioComponentDefaultConfig,
  checkbox: checkboxComponentDefaultConfig,
  empty: emptyComponentDefaultConfig,
  alert: alertComponentDefaultConfig,
};

export function getComponentDefaultPropsByType(type: SupportedComponentType) {
  return omitUndefinedProperties(
    getDefaultValueByConfig(componentDefaultConfigMap[type]),
  );
}

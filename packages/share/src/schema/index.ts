import type { TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import {
  AlertComponentOptionsSchema,
  getAlertComponentSemanticValidationIssues,
  type AlertComponentOptions,
} from "../components/LowCodeAlert/schema";
import {
  CardComponentOptionsSchema,
  getCardComponentSemanticValidationIssues,
  type CardComponentOptions,
} from "../components/LowCodeCard/schema";
import {
  CheckboxComponentOptionsSchema,
  getCheckboxComponentSemanticValidationIssues,
  type CheckboxComponentOptions,
} from "../components/LowCodeCheckbox/schema";
import {
  EmptyComponentOptionsSchema,
  getEmptyComponentSemanticValidationIssues,
  type EmptyComponentOptions,
} from "../components/LowCodeEmpty/schema";
import {
  ImageComponentOptionsSchema,
  getImageComponentSemanticValidationIssues,
  type ImageComponentOptions,
} from "../components/LowCodeImage/schema";
import {
  InputComponentOptionsSchema,
  getInputComponentSemanticValidationIssues,
  type InputComponentOptions,
} from "../components/LowCodeInput/schema";
import {
  ListComponentOptionsSchema,
  getListComponentSemanticValidationIssues,
  type ListComponentOptions,
} from "../components/LowCodeList/schema";
import {
  QrcodeComponentOptionsSchema,
  getQrcodeComponentSemanticValidationIssues,
  type QrcodeComponentOptions,
} from "../components/LowCodeQrcode/schema";
import {
  RadioComponentOptionsSchema,
  getRadioComponentSemanticValidationIssues,
  type RadioComponentOptions,
} from "../components/LowCodeRadio/schema";
import {
  RichTextComponentOptionsSchema,
  getRichTextComponentSemanticValidationIssues,
  type RichTextComponentOptions,
} from "../components/LowCodeRichText/schema";
import {
  SplitComponentOptionsSchema,
  getSplitComponentSemanticValidationIssues,
  type SplitComponentOptions,
} from "../components/LowCodeSplit/schema";
import {
  SwiperComponentOptionsSchema,
  getSwiperComponentSemanticValidationIssues,
  type SwiperComponentOptions,
} from "../components/LowCodeSwiper/schema";
import {
  TextComponentOptionsSchema,
  getTextComponentSemanticValidationIssues,
  type TextComponentOptions,
} from "../components/LowCodeText/schema";
import {
  TextAreaComponentOptionsSchema,
  getTextAreaComponentSemanticValidationIssues,
  type TextAreaComponentOptions,
} from "../components/LowCodeTextArea/schema";
import {
  VideoComponentOptionsSchema,
  getVideoComponentSemanticValidationIssues,
  type VideoComponentOptions,
} from "../components/LowCodeVideo/schema";
import { mapTypeBoxErrors, type ValidationIssue } from "./common";

export * from "./common";
export * from "../components/LowCodeAlert/schema";
export * from "../components/LowCodeCard/schema";
export * from "../components/LowCodeCheckbox/schema";
export * from "../components/LowCodeEmpty/schema";
export * from "../components/LowCodeImage/schema";
export * from "../components/LowCodeInput/schema";
export * from "../components/LowCodeList/schema";
export * from "../components/LowCodeQrcode/schema";
export * from "../components/LowCodeRadio/schema";
export * from "../components/LowCodeRichText/schema";
export * from "../components/LowCodeSplit/schema";
export * from "../components/LowCodeSwiper/schema";
export * from "../components/LowCodeText/schema";
export * from "../components/LowCodeTextArea/schema";
export * from "../components/LowCodeVideo/schema";

export const componentOptionsSchemaMap = {
  video: VideoComponentOptionsSchema,
  swiper: SwiperComponentOptionsSchema,
  qrcode: QrcodeComponentOptionsSchema,
  card: CardComponentOptionsSchema,
  list: ListComponentOptionsSchema,
  image: ImageComponentOptionsSchema,
  titleText: TextComponentOptionsSchema,
  split: SplitComponentOptionsSchema,
  richText: RichTextComponentOptionsSchema,
  input: InputComponentOptionsSchema,
  textArea: TextAreaComponentOptionsSchema,
  radio: RadioComponentOptionsSchema,
  checkbox: CheckboxComponentOptionsSchema,
  empty: EmptyComponentOptionsSchema,
  alert: AlertComponentOptionsSchema,
} as const;

export interface ComponentOptionsTypeMap {
  video: VideoComponentOptions;
  swiper: SwiperComponentOptions;
  qrcode: QrcodeComponentOptions;
  card: CardComponentOptions;
  list: ListComponentOptions;
  image: ImageComponentOptions;
  titleText: TextComponentOptions;
  split: SplitComponentOptions;
  richText: RichTextComponentOptions;
  input: InputComponentOptions;
  textArea: TextAreaComponentOptions;
  radio: RadioComponentOptions;
  checkbox: CheckboxComponentOptions;
  empty: EmptyComponentOptions;
  alert: AlertComponentOptions;
}

export type SupportedComponentType = keyof ComponentOptionsTypeMap;
export type UpdatePageComponent = {
  [K in SupportedComponentType]: {
    type: K;
    options: ComponentOptionsTypeMap[K];
  };
}[SupportedComponentType];

const componentOptionsValidatorMap = Object.fromEntries(
  Object.entries(componentOptionsSchemaMap).map(([type, schema]) => [
    type,
    TypeCompiler.Compile(schema),
  ]),
) as {
  [K in SupportedComponentType]: ReturnType<typeof TypeCompiler.Compile>;
};

const componentOptionsSemanticValidatorMap: {
  [K in SupportedComponentType]: (
    options: ComponentOptionsTypeMap[K],
  ) => ValidationIssue[];
} = {
  video: getVideoComponentSemanticValidationIssues,
  swiper: getSwiperComponentSemanticValidationIssues,
  qrcode: getQrcodeComponentSemanticValidationIssues,
  card: getCardComponentSemanticValidationIssues,
  list: getListComponentSemanticValidationIssues,
  image: getImageComponentSemanticValidationIssues,
  titleText: getTextComponentSemanticValidationIssues,
  split: getSplitComponentSemanticValidationIssues,
  richText: getRichTextComponentSemanticValidationIssues,
  input: getInputComponentSemanticValidationIssues,
  textArea: getTextAreaComponentSemanticValidationIssues,
  radio: getRadioComponentSemanticValidationIssues,
  checkbox: getCheckboxComponentSemanticValidationIssues,
  empty: getEmptyComponentSemanticValidationIssues,
  alert: getAlertComponentSemanticValidationIssues,
};

export function getComponentOptionsValidationIssues(
  type: SupportedComponentType,
  options: unknown,
): ValidationIssue[] {
  const validator = componentOptionsValidatorMap[type];
  const schemaIssues = validator.Check(options)
    ? []
    : mapTypeBoxErrors(validator.Errors(options));

  if (schemaIssues.length > 0) {
    return schemaIssues;
  }

  return componentOptionsSemanticValidatorMap[type](
    options as ComponentOptionsTypeMap[typeof type],
  );
}

export function getComponentOptionsSemanticValidationIssues(
  type: SupportedComponentType,
  options: unknown,
) {
  return componentOptionsSemanticValidatorMap[type](
    options as ComponentOptionsTypeMap[typeof type],
  );
}

export function validateComponentOptions(
  type: SupportedComponentType,
  options: unknown,
) {
  return getComponentOptionsValidationIssues(type, options).length === 0;
}

export function isSupportedComponentType(
  value: string,
): value is SupportedComponentType {
  return value in componentOptionsSchemaMap;
}

export function getComponentOptionsSchema(type: SupportedComponentType): TSchema {
  return componentOptionsSchemaMap[type];
}

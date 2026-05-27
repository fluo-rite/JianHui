import type { ImageComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type IImageComponentProps = ImageComponentOptions;

export type TImageComponentConfig = TBasicComponentConfig<
  "image",
  IImageComponentProps
>;

export type TImageComponentConfigResult =
  TransformedComponentConfig<IImageComponentProps>;

export const defaultImageInfo: IImageComponentProps = {
  id: "__default_image__",
  url: "https://placehold.co/380x200/f5f5f5/000000/png?text=JianHui+Image",
  fit: "cover",
  height: 200,
  handleClicked: "open-url",
  name: "图片名称",
  link: "https://example.com",
};

export const imageComponentDefaultConfig: TImageComponentConfigResult = {
  id: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  fit: {
    value: "cover",
    defaultValue: "cover",
    isHidden: false,
  },
  height: {
    value: 200,
    defaultValue: 200,
    isHidden: false,
  },
  handleClicked: {
    value: "open-url",
    defaultValue: "open-url",
    isHidden: false,
  },
  link: {
    value: "https://example.com",
    defaultValue: "https://example.com",
    isHidden: false,
  },
  name: {
    value: "图片名称",
    defaultValue: "图片名称",
    isHidden: false,
  },
  url: {
    value: "https://placehold.co/380x200/f5f5f5/000000/png?text=JianHui+Image",
    defaultValue:
      "https://placehold.co/380x200/f5f5f5/000000/png?text=JianHui+Image",
    isHidden: false,
  },
};

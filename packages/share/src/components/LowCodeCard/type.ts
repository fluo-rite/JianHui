import type { CardComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type ICardComponentProps = CardComponentOptions;

export type TCardComponentConfig = TBasicComponentConfig<
  "card",
  ICardComponentProps
>;

export type TCardComponentConfigResult =
  TransformedComponentConfig<ICardComponentProps>;

export const cardComponentDefaultConfig: TCardComponentConfigResult = {
  coverImg: {
    value: "https://placehold.co/600x200/f5f5f5/000000/png?text=JianHui+Card",
    defaultValue:
      "https://placehold.co/600x200/f5f5f5/000000/png?text=JianHui+Card",
    isHidden: false,
  },
  description: {
    value: "这是一段描述",
    defaultValue: "这是一段描述",
    isHidden: false,
  },
  title: {
    value: "这是标题",
    defaultValue: "这是标题",
    isHidden: false,
  },
};

import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

// 卡片组件属性
export interface ICardComponentProps {
  title: string;
  coverImg: string;
  description: string;
}

// 转换成通用组件类型
export type TCardComponentConfig = TBasicComponentConfig<
  "card",
  ICardComponentProps
>;

// 剔除可选属性
export type TCardComponentConfigResult =
  TransformedComponentConfig<ICardComponentProps>;

// 卡片表单配置属性的值
export const cardComponentDefaultConfig: TCardComponentConfigResult = {
  coverImg: {
    value: "https://placehold.co/600x200/f5f5f5/000000/png?text=JianHui+Card",
    defaultValue: "https://placehold.co/600x200/f5f5f5/000000/png?text=JianHui+Card",
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

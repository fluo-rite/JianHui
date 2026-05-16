import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

// 列表属性信息类型
export interface IListItem {
  id: string;
  title: string;
  avatar: string;
  description: string;
  titleLink: string;
}

// 列表组件的属性
export interface IListComponentProps {
  id: string;
  items: IListItem[];
}

// 转换成通用的组件属性类型
export type TListComponentConfig = TBasicComponentConfig<
  "list",
  IListComponentProps
>;

export type TListComponentConfigResult =
  TransformedComponentConfig<IListComponentProps>;

// 列表默认值
export const listItem: IListItem = {
  id: "",
  title: "标题",
  description: "描述",
  titleLink: "https://example.com",
  avatar: "https://placehold.co/50x50/f5f5f5/000000/png?text=JH",
};

// 列表组件的表单属性
export const listComponentDefaultConfig: TListComponentConfigResult = {
  id: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  items: {
    value: [listItem],
    defaultValue: [listItem],
    isHidden: false,
  },
};

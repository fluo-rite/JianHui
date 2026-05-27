import type { ListComponentOptions } from "./schema";
import type { TBasicComponentConfig, TransformedComponentConfig } from "..";

export type IListItem = ListComponentOptions["items"][number];
export type IListComponentProps = ListComponentOptions;

export type TListComponentConfig = TBasicComponentConfig<
  "list",
  IListComponentProps
>;

export type TListComponentConfigResult =
  TransformedComponentConfig<IListComponentProps>;

export const listItem: IListItem = {
  id: "__default_list_item__",
  title: "标题",
  description: "描述",
  titleLink: "https://example.com",
  avatar: "https://placehold.co/50x50/f5f5f5/000000/png?text=JH",
};

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

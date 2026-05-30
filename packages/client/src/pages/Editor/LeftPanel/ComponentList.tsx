import {
  CheckCircleOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  EditOutlined,
  ExpandOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  FormOutlined,
  FundViewOutlined,
  MinusOutlined,
  PlaySquareOutlined,
  QrcodeOutlined,
  SplitCellsOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Divider } from "antd";
import type { FC, ReactNode } from "react";
import type { TComponentTypes } from "@lowcode/share";
import { useStoreComponents } from "~/hooks";

export const components = [
  {
    type: "video",
    name: "视频组件",
    icon: <PlaySquareOutlined />,
  },
  {
    type: "swiper",
    name: "轮播组件",
    icon: <SplitCellsOutlined />,
  },
  {
    type: "card",
    name: "卡片组件",
    icon: <CreditCardOutlined />,
  },
  {
    type: "list",
    name: "列表组件",
    icon: <UnorderedListOutlined />,
  },
  {
    type: "image",
    name: "图片组件",
    icon: <FundViewOutlined />,
  },
  {
    type: "titleText",
    name: "文本组件",
    icon: <FontSizeOutlined />,
  },
  {
    type: "split",
    name: "分割组件",
    icon: <MinusOutlined />,
  },
  {
    type: "richText",
    name: "富文本组件",
    icon: <FontColorsOutlined />,
  },
  {
    type: "qrcode",
    name: "二维码组件",
    icon: <QrcodeOutlined />,
  },
  {
    type: "empty",
    name: "空状态组件",
    icon: <ExpandOutlined />,
  },
  {
    type: "alert",
    name: "警告信息组件",
    icon: <WarningOutlined />,
  },
];

const componentByUserInput = [
  {
    type: "input",
    name: "输入框组件",
    icon: <EditOutlined />,
  },
  {
    type: "textArea",
    name: "文本域组件",
    icon: <FormOutlined />,
  },
  {
    type: "radio",
    name: "单选框组件",
    icon: <CheckCircleOutlined />,
  },
  {
    type: "checkbox",
    name: "多选框组件",
    icon: <CheckSquareOutlined />,
  },
];

interface ComponentProps {
  name: string;
  icon: ReactNode;
  type: TComponentTypes;
}

const EditorComponent: FC<ComponentProps> = ({ icon, name, type }) => {
  const store = useStoreComponents();

  function handleDoubleClick() {
    store.push(type);
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="border py-2 pl-2 w-full flex items-center gap-1 text-xs cursor-pointer select-none hover:border-blue-500"
      title="双击添加到画布"
    >
      {icon}
      <span>{name}</span>
    </div>
  );
};

export default function ComponentList() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 items-center gap-2">
        {components.map((item, index) => (
          <EditorComponent {...item} key={index} />
        ))}
      </div>

      <Divider />

      <div className="grid grid-cols-2 items-center gap-2">
        {componentByUserInput.map((item, index) => (
          <EditorComponent {...item} key={index} />
        ))}
      </div>
    </div>
  );
}

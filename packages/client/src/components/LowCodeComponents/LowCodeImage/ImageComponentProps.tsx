import { Input, Segmented, Select } from "antd";
import type { SegmentedLabeledOption } from "antd/es/segmented";
import {
  type IImageComponentProps,
  imageComponentDefaultConfig,
  isFieldHidden,
} from "@lowcode/share";
import { FormContainer, FormPropLabel, UploadEditOrChooiseInput } from "..";

export const fitOptions = [
  { value: "contain", label: "包含" },
  { value: "cover", label: "覆盖" },
  { value: "fill", label: "填充" },
  { value: "none", label: "无" },
  { value: "scale-down", label: "缩小" },
  { value: "initial", label: "默认" },
  { value: "revert", label: "恢复" },
  { value: "unset", label: "重置" },
];

export default function ImageComponentProps(props: IImageComponentProps) {
  const options: SegmentedLabeledOption[] = [
    { value: "open-url", label: "跳转链接" },
    { value: "none", label: "无" },
  ];

  return (
    <FormContainer layout="vertical" values={props}>
      <FormPropLabel
        hidden={isFieldHidden(imageComponentDefaultConfig, "name")}
        name="name"
        label="图片名称："
      >
        <Input />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(imageComponentDefaultConfig, "height")}
        name="height"
        label="图片大小："
      >
        <Input type="number" />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(imageComponentDefaultConfig, "fit")}
        name="fit"
        label="图片填充方式："
      >
        <Select options={fitOptions} />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(imageComponentDefaultConfig, "handleClicked")}
        name="handleClicked"
        label="图片点击后方式："
      >
        <Segmented options={options} />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(imageComponentDefaultConfig, "link")}
        name="link"
        label="图片跳转地址："
      >
        <Input />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(imageComponentDefaultConfig, "url")}
        name="url"
        label="图片地址："
      >
        <UploadEditOrChooiseInput type="image" propName="url" />
      </FormPropLabel>
    </FormContainer>
  );
}

import { Input, Segmented, Switch } from "antd";
import type { SegmentedLabeledOption } from "antd/es/segmented";
import type { ISplitComponentProps } from "@lowcode/share";
import {
  isFieldHidden,
  splitComponentDefaultConfig,
} from "@lowcode/share";
import { FormContainer, FormPropLabel } from "..";

export default function SplitComponentProps(props: ISplitComponentProps) {
  const options: SegmentedLabeledOption[] = [
    { value: "left", label: "靠左" },
    { value: "center", label: "居中" },
    { value: "right", label: "靠右" },
  ];

  return (
    <FormContainer values={props}>
      <FormPropLabel
        hidden={isFieldHidden(splitComponentDefaultConfig, "text")}
        name="text"
        label="文字："
      >
        <Input placeholder="请输入文字" />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(splitComponentDefaultConfig, "dashed")}
        name="dashed"
        label="是否设置为虚线："
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>

      <FormPropLabel
        hidden={isFieldHidden(splitComponentDefaultConfig, "orientation")}
        name="orientation"
        label="文字位置："
      >
        <Segmented options={options} />
      </FormPropLabel>
    </FormContainer>
  );
}

import { Input, Segmented } from "antd";
import type { SegmentedLabeledOption } from "antd/es/segmented";
import type { ITextComponentProps } from "@lowcode/share";
import { isFieldHidden, textComponentDefaultConfig } from "@lowcode/share";
import { FormContainer, FormPropLabel } from "..";

export default function TextComponentProps(props: ITextComponentProps) {
  const options: SegmentedLabeledOption[] = [
    { value: "xs", label: "超小" },
    { value: "sm", label: "小" },
    { value: "base", label: "基础" },
    { value: "lg", label: "大" },
    { value: "xl", label: "超大" },
  ];

  return (
    <FormContainer values={props}>
      <FormPropLabel
        hidden={isFieldHidden(textComponentDefaultConfig, "title")}
        name="title"
        label="展示的文本："
      >
        <Input placeholder="展示的文本" />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(textComponentDefaultConfig, "size")}
        name="size"
        label="设置文字大小："
      >
        <Segmented options={options} />
      </FormPropLabel>
    </FormContainer>
  );
}

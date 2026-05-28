import { Input } from "antd";
import {
  type IInputComponentProps,
  inputComponentDefaultConfig,
  isFieldHidden,
} from "@lowcode/share";
import { FormContainer, FormPropLabel } from "..";

export default function InputComponentProps(props: IInputComponentProps) {
  return (
    <FormContainer layout="vertical" values={props}>
      <FormPropLabel
        hidden={isFieldHidden(inputComponentDefaultConfig, "title")}
        name="title"
        label="标题："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(inputComponentDefaultConfig, "text")}
        name="text"
        label="默认输入的内容："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        hidden={isFieldHidden(inputComponentDefaultConfig, "placeholder")}
        name="placeholder"
        label="占位符："
      >
        <Input />
      </FormPropLabel>
    </FormContainer>
  );
}

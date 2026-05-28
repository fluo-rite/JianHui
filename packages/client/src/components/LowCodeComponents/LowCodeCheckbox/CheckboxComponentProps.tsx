import { Form, Input } from "antd";
import {
  type ICheckboxComponentProps,
  checkboxComponentDefaultConfig,
  isFieldHidden,
} from "@lowcode/share";
import { ulid } from "ulid";
import { FormContainer, FormContainerWithList, FormPropLabel } from "..";

export default function CheckboxComponentProps(props: ICheckboxComponentProps) {
  function getListItem() {
    return {
      id: ulid(),
      value: `选项${props.options.length + 1}`,
    };
  }

  return (
    <>
      <FormContainer layout="vertical" values={props}>
        <FormPropLabel
          hidden={isFieldHidden(checkboxComponentDefaultConfig, "title")}
          name="title"
          label="默认展示的标题："
        >
          <Input />
        </FormPropLabel>
      </FormContainer>

      <FormContainerWithList
        keyName="options"
        id={props.id}
        items={props.options}
        newItemDefaultValue={getListItem()}
      >
        <Form.Item label="选项名称：" name="value">
          <Input />
        </Form.Item>
      </FormContainerWithList>
    </>
  );
}

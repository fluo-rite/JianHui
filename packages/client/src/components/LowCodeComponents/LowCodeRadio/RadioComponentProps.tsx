import { useMemo } from "react";
import { Form, Input } from "antd";
import type { IRadioComponentProps } from "@lowcode/share";
import {
  fillComponentPropsByConfig,
  radioComponentDefaultConfig,
} from "@lowcode/share";
import { ulid } from "ulid";
import { FormContainer, FormContainerWithList, FormPropLabel } from "..";

export default function RadioComponentProps(_props: IRadioComponentProps) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, radioComponentDefaultConfig);
  }, [_props]);

  function getListItem() {
    return {
      id: ulid(),
      value: `选项${props.options.value.length + 1}`,
    };
  }

  return (
    <>
      <FormContainer layout="vertical" config={props}>
        <FormPropLabel prop={props.title} name="title" label="默认展示的标题：">
          <Input />
        </FormPropLabel>
      </FormContainer>

      <FormContainerWithList
        keyName="options"
        id={props.id.value}
        items={props.options.value}
        newItemDefaultValue={getListItem()}
      >
        <Form.Item label="选项名称：" name="value">
          <Input />
        </Form.Item>
      </FormContainerWithList>
    </>
  );
}

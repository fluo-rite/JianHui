import { Form, Input } from "antd";
import {
  type IListComponentProps,
  isFieldHidden,
  listComponentDefaultConfig,
  listItem,
} from "@lowcode/share";

import { FormContainerWithList, UploadEditOrChooiseInput } from "..";

export default function ListComponentProps(props: IListComponentProps) {
  if (isFieldHidden(listComponentDefaultConfig, "items")) {
    return <>暂无可选配置</>;
  }

  return (
    <FormContainerWithList
      id={props.id}
      items={props.items}
      newItemDefaultValue={listItem}
    >
      <Form.Item label="标题：" name="title">
        <Input />
      </Form.Item>
      <Form.Item label="标题点击后链接：" name="titleLink">
        <Input />
      </Form.Item>
      <Form.Item label="头像：" name="avatar">
        <UploadEditOrChooiseInput
          propName="avatar"
          type="image"
          listOptions={{ keyName: "items" }}
        />
      </Form.Item>
      <Form.Item label="描述：" name="description">
        <Input />
      </Form.Item>
    </FormContainerWithList>
  );
}

import { Form, Input } from "antd";
import type { FC } from "react";
import { useEffect } from "react";

import { useStorePage } from "~/hooks";
import type { TStorePage } from "~/store";

const GlobalFields: FC<{ store: TStorePage }> = ({ store }) => {
  const [form] = Form.useForm<TStorePage>();
  const { updatePage } = useStorePage();

  useEffect(() => {
    form.setFieldsValue(store);
  }, [form, store]);

  function handleValuesChange(changedValues: Record<string, string>) {
    updatePage(changedValues);
  }

  return (
    <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
      <Form.Item label="页面标题:" name="title">
        <Input />
      </Form.Item>

      <Form.Item label="页面详情:" name="description">
        <Input />
      </Form.Item>

      <Form.Item label="页面关键词（以 , 分割）:" name="tdk">
        <Input />
      </Form.Item>
    </Form>
  );
};

export default GlobalFields;

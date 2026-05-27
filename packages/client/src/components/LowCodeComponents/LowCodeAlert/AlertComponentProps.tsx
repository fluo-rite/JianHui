import { Input, Select, Switch } from "antd";
import { useMemo } from "react";
import {
  type IAlertComponentProps,
  alertComponentDefaultConfig,
  fillComponentPropsByConfig,
} from "@lowcode/share";
import { FormContainer, FormPropLabel } from "..";

export default function AlertComponentProps(_props: IAlertComponentProps) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, alertComponentDefaultConfig);
  }, [_props]);

  return (
    <FormContainer layout="vertical" config={props}>
      <FormPropLabel prop={props.title} name="title" label="标题:">
        <Input />
      </FormPropLabel>
      <FormPropLabel prop={props.type} name="type" label="类型:">
        <Select
          options={[
            {
              label: "成功",
              value: "success",
            },
            {
              label: "警告",
              value: "warning",
            },
            {
              label: "信息",
              value: "info",
            },
            {
              label: "错误",
              value: "error",
            },
          ]}
        />
      </FormPropLabel>
      <FormPropLabel
        prop={props.showIcon}
        name="showIcon"
        label="是否显示图标:"
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
      <FormPropLabel
        prop={props.showClose}
        name="showClose"
        label="是否显示关闭按钮:"
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
      <FormPropLabel
        prop={props.isBanner}
        name="isBanner"
        label="鏄惁涓篵anner:"
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
      <FormPropLabel prop={props.description} name="description" label="鎻忚堪:">
        <Input.TextArea rows={3} />
      </FormPropLabel>
    </FormContainer>
  );
}
